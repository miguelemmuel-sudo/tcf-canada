import { NextResponse } from "next/server";
import { verifyWebhookSignature, logFapshiEvent } from "@/lib/fapshi";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

// Fonction utilitaire pour déterminer le pack et la durée officielle selon le montant payé ou la référence
function getPackInfo(amountNum: number, reference: string = ""): { key: string; name: string; durationMonths: number } {
  const refLower = reference.toLowerCase();
  
  if (amountNum >= 90000 || refLower.includes("vip")) {
    return { key: "vip", name: "Pack VIP & Coaching", durationMonths: 2 };
  } else if (amountNum >= 20000 || refLower.includes("griffon")) {
    return { key: "griffon", name: "Pack Griffon D'OR", durationMonths: 1 };
  } else {
    return { key: "standard", name: "Pack Standard", durationMonths: 1 };
  }
}

export async function POST(request: Request) {
  try {
    const headersList = request.headers;
    const secretHeader = headersList.get("x-wh-secret") || headersList.get("X-Wh-Secret") || headersList.get("x-wh-signature");

    // 1. Vérification systématique de la signature Webhook Fapshi
    const isValidSignature = verifyWebhookSignature(secretHeader);
    if (!isValidSignature) {
      await logFapshiEvent(null, null, "webhook_error", { error: "Signature Webhook Fapshi invalide", headerReceived: secretHeader });
      return NextResponse.json({ error: "Unauthorized Webhook Signature" }, { status: 401 });
    }

    const payload = await request.json();
    const { transId, status, amount, payerName, email, externalId, userId: payloadUserId, medium } = payload;

    await logFapshiEvent(payloadUserId || null, externalId || transId, "webhook_received", payload);

    const adminDb = getAdminSupabase();
    if (!adminDb) {
      console.error("[Webhook Fapshi] Base de données admin indisponible.");
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 });
    }

    // 2. Recherche de la transaction dans Supabase
    let txQuery = adminDb.from("transactions").select("*");
    if (transId) {
      txQuery = txQuery.eq("provider_transaction_id", transId);
    } else if (externalId) {
      txQuery = txQuery.eq("reference", externalId);
    }

    const { data: transactions, error: txError } = await txQuery;
    const transaction = transactions && transactions.length > 0 ? transactions[0] : null;

    if (txError) {
      await logFapshiEvent(payloadUserId || null, externalId || transId, "webhook_error", { error: txError.message });
    }

    const userId = transaction?.user_id || payloadUserId;
    const reference = transaction?.reference || externalId || `FAPSHI_${transId}`;
    const amountVal = amount || (transaction ? parseFloat(transaction.amount) : 0);

    // 3. Prévention des doubles activations (Idempotence)
    if (transaction && (transaction.status === "completed" || transaction.status === "SUCCESSFUL")) {
      await logFapshiEvent(userId, reference, "webhook_processed", { info: "Transaction déjà validée précédemment (Idempotence)." });
      return NextResponse.json({ message: "Transaction already processed successfully." }, { status: 200 });
    }

    // 4. Traitement selon le statut officiel confirmé par Fapshi
    const statusUpper = (status || "").toUpperCase();

    if (statusUpper === "SUCCESSFUL" || statusUpper === "COMPLETED" || statusUpper === "PAYÉ") {
      const { key: packKey, name: packName, durationMonths } = getPackInfo(amountVal, reference);

      // Calcul automatique de la durée (1 mois pour Standard/Griffon, 2 mois pour VIP)
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

      const formattedExpiresAt = expiresAt.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });

      if (userId) {
        // A. Désactiver / archiver les anciens abonnements actifs (pour clarté de l'historique)
        await adminDb
          .from("subscriptions")
          .update({ status: "replaced", updated_at: now.toISOString() })
          .eq("user_id", userId)
          .eq("status", "active");

        // B. Activer automatiquement le nouveau pack acheté (création d'un nouvel enregistrement dans subscriptions)
        const { data: newSub } = await adminDb
          .from("subscriptions")
          .insert({
            user_id: userId,
            pack: packKey,
            amount: amountVal.toString(),
            currency: "FCFA",
            status: "active",
            started_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
            created_at: now.toISOString(),
            updated_at: now.toISOString()
          })
          .select("id")
          .single();

        const subscriptionId = newSub?.id || null;

        // C. Mettre à jour immédiatement le compte et les droits d'accès de l'utilisateur dans profiles
        await adminDb
          .from("profiles")
          .update({
            subscription_type: packKey,
            updated_at: now.toISOString()
          })
          .eq("id", userId);

        // D. Enregistrer / mettre à jour la transaction avec statut validé
        if (transaction) {
          await adminDb
            .from("transactions")
            .update({
              status: "completed",
              webhook_status: "processed",
              payment_method: medium || "Mobile Money / Carte (Fapshi)",
              subscription_id: subscriptionId,
              updated_at: now.toISOString()
            })
            .eq("id", transaction.id);
        } else {
          await adminDb.from("transactions").insert({
            user_id: userId,
            subscription_id: subscriptionId,
            provider: "Fapshi",
            provider_transaction_id: transId,
            payment_method: medium || "Fapshi",
            amount: amountVal.toString(),
            currency: "FCFA",
            reference: reference,
            status: "completed",
            webhook_status: "processed",
            created_at: now.toISOString(),
            updated_at: now.toISOString()
          });
        }

        // E. Créer automatiquement une notification dans le tableau de bord utilisateur
        const notifTitle = `Paiement confirmé : ${packName}`;
        const notifMessage = `Votre paiement de ${amountVal.toLocaleString("fr-FR")} FCFA pour le ${packName} a été confirmé avec succès par Fapshi (Réf: ${reference}). Durée de validité : ${durationMonths} mois (expiration le ${formattedExpiresAt}). Vos droits d'accès sont immédiatement actifs.`;

        await adminDb.from("notifications").insert({
          user_id: userId,
          title: notifTitle,
          message: notifMessage,
          type: "payment_success",
          is_read: false,
          created_at: now.toISOString()
        });

        await logFapshiEvent(userId, reference, "webhook_processed", {
          result: "SUCCESS",
          pack: packKey,
          expiresAt: expiresAt.toISOString()
        });
      }

    } else if (statusUpper === "FAILED" || statusUpper === "EXPIRED" || statusUpper === "REFUSÉ") {
      // Cas où le paiement échoue ou expire
      if (transaction) {
        await adminDb
          .from("transactions")
          .update({
            status: statusUpper.toLowerCase(),
            webhook_status: "processed",
            updated_at: new Date().toISOString()
          })
          .eq("id", transaction.id);
      }

      if (userId) {
        const notifTitle = statusUpper === "EXPIRED" ? "Lien de paiement expiré" : "Paiement non finalisé";
        const notifMsg = `Votre tentative de paiement (Réf: ${reference}) n'a pas pu être confirmée (${statusUpper}). Votre choix de pack est conservé dans votre tableau de bord si vous souhaitez réessayer.`;

        await adminDb.from("notifications").insert({
          user_id: userId,
          title: notifTitle,
          message: notifMsg,
          type: "payment_failed",
          is_read: false,
          created_at: new Date().toISOString()
        });
      }

      await logFapshiEvent(userId, reference, "webhook_processed", { result: statusUpper });
    } else {
      // Autre statut (ex: PENDING)
      if (transaction && status) {
        await adminDb
          .from("transactions")
          .update({ status: status.toLowerCase(), updated_at: new Date().toISOString() })
          .eq("id", transaction.id);
      }
    }

    return NextResponse.json({ success: true, processedStatus: statusUpper }, { status: 200 });

  } catch (err: any) {
    console.error("[Webhook Fapshi Error]", err);
    await logFapshiEvent(null, null, "error", { message: err.message, stack: err.stack });
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return NextResponse.json({
    status: "active",
    service: "Passerelle Webhook Fapshi TCF-Canada Pro",
    message: "Le point de terminaison Webhook est en ligne et prêt à traiter les confirmations Fapshi.",
    webhookUrl: "https://tcf-canada-olive.vercel.app/api/webhooks/fapshi",
    environment: process.env.FAPSHI_ENV || "sandbox",
    admin: "Administrateur réseau Miguel"
  }, { status: 200 });
}


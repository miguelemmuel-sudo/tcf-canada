import { NextResponse } from "next/server";
import { verifyNotchPayWebhook, logNotchPayEvent } from "@/lib/notchpay";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Détermine le pack et la durée selon le montant payé
function getPackInfo(
  amountNum: number,
  reference: string = ""
): { key: string; name: string; durationDays: number } {
  const refLower = reference.toLowerCase();
  if (amountNum >= 90000 || refLower.includes("vip")) {
    return { key: "vip", name: "Pack VIP & Coaching", durationDays: 60 };
  } else if (amountNum >= 20000 || refLower.includes("griffon")) {
    return { key: "griffon", name: "Pack Griffon D'OR", durationDays: 30 };
  } else {
    return { key: "standard", name: "Pack Standard", durationDays: 30 };
  }
}

export async function POST(request: Request) {
  try {
    // 1. Lire le corps brut pour la vérification HMAC-SHA256
    const rawBody = await request.text();

    const headersList = request.headers;
    // Notch Pay envoie la signature dans x-notch-signature
    const signatureHeader =
      headersList.get("x-notch-signature") ||
      headersList.get("X-Notch-Signature") ||
      headersList.get("x-webhook-signature");

    // 2. Vérification de la signature du webhook
    const isValid = verifyNotchPayWebhook(rawBody, signatureHeader);
    if (!isValid) {
      await logNotchPayEvent(null, null, "webhook_error", {
        error: "Signature Webhook Notch Pay invalide",
        headerReceived: signatureHeader,
      });
      return NextResponse.json(
        { error: "Unauthorized Webhook Signature" },
        { status: 401 }
      );
    }

    // 3. Parser le payload JSON
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Payload JSON invalide" },
        { status: 400 }
      );
    }

    // Structure du payload Notch Pay : { event, data: { transaction: {...} } }
    const event = payload.event || payload.type || "";
    const transaction = payload.data?.transaction || payload.transaction || payload;

    const reference = transaction.reference || transaction.externalId || null;
    const status = (transaction.status || "").toLowerCase();
    const amount = transaction.amount || 0;
    const customer = transaction.customer || {};
    const payerEmail = customer.email || null;

    await logNotchPayEvent(null, reference, "webhook_received", {
      event,
      payload,
    });

    const adminDb = getAdminSupabase();
    if (!adminDb) {
      console.error("[Webhook NotchPay] Base de données admin indisponible.");
      return NextResponse.json(
        { error: "Database configuration error" },
        { status: 500 }
      );
    }

    // 4. Recherche de la transaction dans Supabase
    let txQuery = adminDb.from("transactions").select("*");
    if (reference) {
      txQuery = txQuery.or(
        `reference.eq.${reference},provider_transaction_id.eq.${reference}`
      );
    }

    const { data: transactions, error: txError } = await txQuery;
    const tx = transactions && transactions.length > 0 ? transactions[0] : null;

    if (txError) {
      await logNotchPayEvent(null, reference, "webhook_error", {
        error: txError.message,
      });
    }

    const userId = tx?.user_id || null;
    const txReference = tx?.reference || reference || `NOTCHPAY_${Date.now()}`;
    const amountVal = amount || (tx ? parseFloat(tx.amount) : 0);

    // 5. Idempotence : éviter les doubles activations
    if (tx && (tx.status === "completed" || tx.status === "complete")) {
      await logNotchPayEvent(userId, txReference, "webhook_processed", {
        info: "Transaction déjà validée (Idempotence).",
      });
      return NextResponse.json(
        { message: "Transaction already processed successfully." },
        { status: 200 }
      );
    }

    // 6. Traitement selon le statut Notch Pay
    if (status === "complete" || status === "completed") {
      const {
        key: packKey,
        name: packName,
        durationDays,
      } = getPackInfo(amountVal, txReference);

      const now = new Date();
      const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

      const formattedExpiresAt = expiresAt.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      if (userId) {
        // A. Archiver les anciens abonnements actifs
        await adminDb
          .from("subscriptions")
          .update({ status: "replaced", updated_at: now.toISOString() })
          .eq("user_id", userId)
          .eq("status", "active");

        // B. Créer le nouvel abonnement actif
        const { data: newSub } = await adminDb
          .from("subscriptions")
          .insert({
            user_id: userId,
            pack: packKey,
            amount: amountVal.toString(),
            currency: "XAF",
            status: "active",
            started_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .select("id")
          .single();

        const subscriptionId = newSub?.id || null;

        // C. Mettre à jour les droits d'accès dans profiles
        await adminDb
          .from("profiles")
          .update({
            subscription_type: packKey,
            updated_at: now.toISOString(),
          })
          .eq("id", userId);

        // D. Enregistrer / mettre à jour la transaction validée
        if (tx) {
          await adminDb
            .from("transactions")
            .update({
              status: "completed",
              webhook_status: "processed",
              payment_method: "NotchPay",
              subscription_id: subscriptionId,
              updated_at: now.toISOString(),
            })
            .eq("id", tx.id);
        } else {
          // Transaction non trouvée → créer l'entrée
          await adminDb.from("transactions").insert({
            user_id: userId,
            subscription_id: subscriptionId,
            provider: "NotchPay",
            provider_transaction_id: reference,
            payment_method: "NotchPay",
            amount: amountVal.toString(),
            currency: "XAF",
            reference: txReference,
            status: "completed",
            webhook_status: "processed",
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          });
        }

        // E. Notification dans le tableau de bord utilisateur
        const notifTitle = `Paiement confirmé : ${packName}`;
        const notifMessage = `Votre paiement de ${amountVal.toLocaleString(
          "fr-FR"
        )} FCFA pour le ${packName} a été confirmé avec succès via Notch Pay (Réf: ${txReference}). Durée de validité : ${durationDays} jours (expiration le ${formattedExpiresAt}). Vos droits d'accès sont immédiatement actifs.`;

        await adminDb.from("notifications").insert({
          user_id: userId,
          title: notifTitle,
          message: notifMessage,
          type: "payment_success",
          is_read: false,
          created_at: now.toISOString(),
        });

        await logNotchPayEvent(userId, txReference, "webhook_processed", {
          result: "SUCCESS",
          pack: packKey,
          expiresAt: expiresAt.toISOString(),
        });
      }
    } else if (status === "failed" || status === "canceled" || status === "cancelled") {
      // Paiement échoué ou annulé
      if (tx) {
        await adminDb
          .from("transactions")
          .update({
            status: status === "canceled" || status === "cancelled" ? "canceled" : "failed",
            webhook_status: "processed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", tx.id);
      }

      if (userId) {
        const notifTitle =
          status === "canceled" || status === "cancelled"
            ? "Paiement annulé"
            : "Paiement non finalisé";
        const notifMsg = `Votre tentative de paiement (Réf: ${txReference}) n'a pas pu être confirmée (${status.toUpperCase()}). Vous pouvez réessayer depuis votre tableau de bord.`;

        await adminDb.from("notifications").insert({
          user_id: userId,
          title: notifTitle,
          message: notifMsg,
          type: "payment_failed",
          is_read: false,
          created_at: new Date().toISOString(),
        });
      }

      await logNotchPayEvent(userId, txReference, "webhook_processed", {
        result: status.toUpperCase(),
      });
    } else {
      // Statut en attente ou inconnu
      if (tx && status) {
        await adminDb
          .from("transactions")
          .update({
            status: status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", tx.id);
      }
    }

    return NextResponse.json(
      { success: true, processedStatus: status.toUpperCase() },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[Webhook NotchPay Error]", err);
    await logNotchPayEvent(null, null, "error", {
      message: err.message,
      stack: err.stack,
    });
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return NextResponse.json(
    {
      status: "active",
      service: "Passerelle Webhook Notch Pay – TCF-Canada Pro",
      message:
        "Le point de terminaison Webhook Notch Pay est en ligne et prêt à traiter les confirmations.",
      webhookUrl:
        "https://tcf-canada-olive.vercel.app/api/webhooks/notchpay",
      environment: process.env.NOTCHPAY_ENV || "test",
      admin: "Administrateur réseau Miguel",
    },
    { status: 200 }
  );
}

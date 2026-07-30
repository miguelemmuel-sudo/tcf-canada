import { NextResponse } from "next/server";
import { verifyNotchPayWebhook, logNotchPayEvent, PACK_DURATIONS, PACK_NAMES, inferPackFromAmountOrRef } from "@/lib/notchpay";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

/**
 * Webhook Notch Pay – TCF Canada Pro v3.0 Production
 * Domaine : https://griffondortcfcanada.com
 * Administrateur réseau : Miguel
 * Synchronisation automatique des statuts, abonnements, notifications et profils
 */

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function POST(request: Request) {
  const reqId = `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  console.log(`\n[NP Webhook] ===== DEBUT ${reqId} =====`);

  try {
    // 1. Extraction du corps brut et du header de signature HMAC
    const rawBody = await request.text();
    const sig = request.headers.get("x-notch-signature")
      || request.headers.get("X-Notch-Signature")
      || request.headers.get("x-webhook-signature")
      || null;

    console.log(`[NP Webhook ${reqId}] Signature transmise: ${sig ? sig.slice(0, 20) + "..." : "NON SPECIFIEE"}`);

    // 2. Vérification HMAC
    const isValid = verifyNotchPayWebhook(rawBody, sig);
    if (!isValid) {
      console.warn(`[NP Webhook ${reqId}] Échec validation signature HMAC`);
      await logNotchPayEvent(null, null, "webhook_error", { reqId, error: "Signature HMAC invalide", sig });
      // Renvoyer HTTP 200 pour éviter les retentatives en boucle de Notch Pay
      return NextResponse.json({ received: true, warning: "Invalid signature" }, { status: 200 });
    }

    await logNotchPayEvent(null, null, "webhook_signature_verified", { reqId });

    // 3. Parsing Payload JSON
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch (err: any) {
      console.error(`[NP Webhook ${reqId}] Payload JSON invalide :`, err.message);
      return NextResponse.json({ received: true, error: "Invalid JSON format" }, { status: 200 });
    }

    // 4. Extraction structurée de l'événement et des données
    const eventType = (payload.event || payload.type || "payment.complete").toLowerCase();
    const dataSection = payload.data || {};
    const transaction = dataSection.payment || dataSection.transaction || payload.payment || payload.transaction || dataSection || {};

    const reference = transaction.reference 
      || transaction.merchant_reference 
      || transaction.externalId 
      || transaction.external_id 
      || dataSection.reference 
      || dataSection.merchant_reference
      || payload.reference
      || null;

    const rawStatus = (transaction.status || dataSection.status || payload.status || "").toLowerCase();
    const amount = parseFloat(transaction.amount || dataSection.amount || payload.amount || 0);
    const customer = transaction.customer || dataSection.customer || payload.customer || {};
    const payerEmail = (customer.email || payload.email || "").toLowerCase().trim();
    const paymentChannel = transaction.channel || transaction.payment_method || dataSection.channel || "NotchPay";
    const providerTxId = transaction.id || transaction.provider_transaction_id || reference;

    console.log(`[NP Webhook ${reqId}] Evénement=${eventType} | Réf=${reference} | StatutBrut=${rawStatus} | Montant=${amount} FCFA | Email=${payerEmail}`);

    await logNotchPayEvent(null, reference, "webhook_received", {
      reqId,
      eventType,
      rawStatus,
      reference,
      amount,
      payerEmail,
      paymentChannel,
    });

    // 5. Instancier le client d'administration Supabase
    const adminDb = getAdminSupabase();
    if (!adminDb) {
      console.error(`[NP Webhook ${reqId}] Supabase Admin non disponible !`);
      await logNotchPayEvent(null, reference, "webhook_error", { reqId, error: "Supabase Admin indisponible" });
      return NextResponse.json({ received: true, error: "Database client unavailable" }, { status: 200 });
    }

    // 6. Recherche de la transaction dans Supabase
    let tx: any = null;
    if (reference) {
      const { data: txList } = await adminDb.from("transactions").select("*")
        .or(`reference.eq.${reference},provider_transaction_id.eq.${reference}`)
        .order("created_at", { ascending: false })
        .limit(1);
      tx = txList && txList.length > 0 ? txList[0] : null;
    }

    // Recherche de secours par email si la référence directe n'a pas renvoyé de résultat
    if (!tx && payerEmail) {
      const { data: profiles } = await adminDb.from("profiles").select("id, email").eq("email", payerEmail).limit(1);
      if (profiles && profiles.length > 0) {
        const foundUserId = profiles[0].id;
        const { data: recentPending } = await adminDb.from("transactions").select("*")
          .eq("user_id", foundUserId)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1);
        if (recentPending && recentPending.length > 0) {
          tx = recentPending[0];
          console.log(`[NP Webhook ${reqId}] Transaction pending retrouvée via email utilisateur : ${tx.reference}`);
        }
      }
    }

    // Déterminer l'ID Utilisateur Supabase
    let userId: string | null = tx?.user_id || null;
    if (!userId && payerEmail) {
      const { data: userProfiles } = await adminDb.from("profiles").select("id").eq("email", payerEmail).limit(1);
      if (userProfiles && userProfiles.length > 0) {
        userId = userProfiles[0].id;
      }
    }

    console.log(`[NP Webhook ${reqId}] Supabase Transaction: ${tx ? "TROUVÉE (id=" + tx.id + ")" : "NON TROUVÉE en BDD"}`);

    const txReference = tx?.reference || reference || `NOTCHPAY_${Date.now()}`;
    const amountVal = amount || (tx ? parseFloat(tx.amount) : 0);

    // Déduction du Pack (Standard = 30j, Griffon D'OR = 30j, VIP & Coaching = 60j)
    const resolvedPack = tx?.pack || inferPackFromAmountOrRef(amountVal, txReference);
    const packName = PACK_NAMES[resolvedPack] || "Pack TCF Canada Pro";
    const durationDays = PACK_DURATIONS[resolvedPack] || 30;

    // Normalisation stricte du statut Notch Pay vers le domaine Supabase
    let normalizedStatus: "completed" | "cancelled" | "expired" | "failed" | "pending" = "pending";

    if (
      ["complete", "completed", "payment.complete", "charge.complete", "transaction.complete", "success", "successful"].includes(rawStatus)
      || eventType.includes("complete")
      || eventType.includes("success")
    ) {
      normalizedStatus = "completed";
    } else if (
      ["canceled", "cancelled", "payment.cancelled", "charge.cancelled", "transaction.cancelled"].includes(rawStatus)
      || eventType.includes("cancel")
    ) {
      normalizedStatus = "cancelled";
    } else if (
      ["expired", "payment.expired", "charge.expired", "transaction.expired"].includes(rawStatus)
      || eventType.includes("expire")
    ) {
      normalizedStatus = "expired";
    } else if (
      ["failed", "payment.failed", "charge.failed", "transaction.failed", "rejected"].includes(rawStatus)
      || eventType.includes("fail")
    ) {
      normalizedStatus = "failed";
    }

    // 7. Idempotence : si la transaction est déjà complétée et traitée
    if (tx && tx.status === "completed" && tx.webhook_status === "processed" && normalizedStatus === "completed") {
      console.log(`[NP Webhook ${reqId}] Idempotence : Transaction déjà validée en BDD. Passage sans ré-exécution.`);
      return NextResponse.json({ received: true, message: "Transaction already processed" }, { status: 200 });
    }

    const now = new Date();
    const nowIso = now.toISOString();

    // 8. TRAITEMENT DE PAIEMENT CONFIRMÉ (COMPLETED)
    if (normalizedStatus === "completed") {
      console.log(`[NP Webhook ${reqId}] ✅ PAIEMENT CONFIRMÉ ! Activation du ${packName} (${durationDays} jours)`);

      if (userId) {
        // A. Calcul de la période de validité (Renouvellement vs Nouvel Abonnement)
        const { data: existingActiveSub } = await adminDb.from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "active")
          .order("expires_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        let startDate = now;
        let expiresAt = new Date(now.getTime() + durationDays * 24 * 3600 * 1000);

        // Si l'utilisateur possède déjà un abonnement actif non expiré -> Prolonger la période
        if (existingActiveSub && existingActiveSub.expires_at) {
          const currentExpiry = new Date(existingActiveSub.expires_at);
          if (currentExpiry > now) {
            expiresAt = new Date(currentExpiry.getTime() + durationDays * 24 * 3600 * 1000);
            console.log(`[NP Webhook ${reqId}] 🔄 Prolongation d'abonnement détectée. Nouvelle expiration : ${expiresAt.toISOString()}`);
          }
        }

        const formattedExpires = expiresAt.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        // B. Marquer les anciens abonnements comme remplacés
        await adminDb.from("subscriptions")
          .update({ status: "replaced", updated_at: nowIso })
          .eq("user_id", userId)
          .eq("status", "active");

        // C. Créer le nouvel abonnement actif dans `subscriptions`
        const { data: newSub, error: subErr } = await adminDb.from("subscriptions").insert({
          user_id: userId,
          pack: resolvedPack,
          amount: amountVal.toString(),
          currency: "XAF",
          status: "active",
          started_at: startDate.toISOString(),
          expires_at: expiresAt.toISOString(),
          created_at: nowIso,
          updated_at: nowIso,
        }).select("id").single();

        if (subErr) {
          console.error(`[NP Webhook ${reqId}] Erreur création abonnement Supabase:`, subErr);
        } else {
          console.log(`[NP Webhook ${reqId}] ✓ Nouvel abonnement créé (ID=${newSub?.id})`);
        }

        const subscriptionId = newSub?.id || null;

        // D. Mise à jour immédiate du profil utilisateur (`profiles`) -> Déblocage des droits du SaaS
        const { error: profErr } = await adminDb.from("profiles")
          .update({
            subscription_type: resolvedPack,
            updated_at: nowIso,
          })
          .eq("id", userId);

        if (profErr) {
          console.error(`[NP Webhook ${reqId}] Erreur mise à jour du profil utilisateur:`, profErr);
        } else {
          console.log(`[NP Webhook ${reqId}] ✓ Profil utilisateur mis à jour: subscription_type = ${resolvedPack}`);
        }

        // E. Mise à jour de la table `transactions`
        if (tx) {
          await adminDb.from("transactions").update({
            status: "completed",
            webhook_status: "processed",
            paid_at: nowIso,
            payment_method: paymentChannel,
            pack: resolvedPack,
            subscription_id: subscriptionId,
            provider_transaction_id: providerTxId,
            updated_at: nowIso,
          }).eq("id", tx.id);
          console.log(`[NP Webhook ${reqId}] ✓ Transaction Supabase mise à jour (status=completed, webhook_status=processed)`);
        } else {
          await adminDb.from("transactions").insert({
            user_id: userId,
            subscription_id: subscriptionId,
            provider: "NotchPay",
            provider_transaction_id: providerTxId,
            payment_method: paymentChannel,
            amount: amountVal.toString(),
            currency: "XAF",
            pack: resolvedPack,
            reference: txReference,
            status: "completed",
            webhook_status: "processed",
            paid_at: nowIso,
            created_at: nowIso,
            updated_at: nowIso,
          });
          console.log(`[NP Webhook ${reqId}] ✓ Transaction créée et marquée COMPLETED`);
        }

        // F. Notification automatique dans le tableau de bord
        try {
          await adminDb.from("notifications").insert({
            user_id: userId,
            title: `✅ Paiement confirmé – ${packName}`,
            message: `Votre paiement de ${amountVal.toLocaleString("fr-FR")} FCFA a été confirmé. Votre abonnement est actif jusqu'au ${formattedExpires}.`,
            type: "payment_success",
            is_read: false,
            created_at: nowIso,
          });
        } catch (e: any) {
          console.warn(`[NP Webhook ${reqId}] Erreur insertion notification:`, e?.message);
        }

        await logNotchPayEvent(userId, txReference, "webhook_processed_completed", {
          reqId,
          result: "SUCCESS",
          pack: resolvedPack,
          packName,
          durationDays,
          expiresAt: expiresAt.toISOString(),
          subscriptionId,
        });

        console.log(`[NP Webhook ${reqId}] ===== SUCCÈS : ${packName} ACTIF ET SYNCHRONISÉ =====`);

      } else {
        console.error(`[NP Webhook ${reqId}] ERREUR : Aucun utilisateur associé trouvé pour la référence ${reference}`);
        await logNotchPayEvent(null, txReference, "webhook_error_no_user", { reqId, reference });
      }

    // 9. TRAITEMENT DES ÉCHECS, ANNULATIONS ET EXPIRATIONS
    } else if (["cancelled", "expired", "failed"].includes(normalizedStatus)) {
      console.log(`[NP Webhook ${reqId}] ❌ Statut transaction mis à jour vers : ${normalizedStatus}`);

      if (tx) {
        await adminDb.from("transactions").update({
          status: normalizedStatus,
          webhook_status: "processed",
          updated_at: nowIso,
        }).eq("id", tx.id);
      }

      if (userId) {
        const titleMap: Record<string, string> = {
          cancelled: "Paiement annulé",
          expired: "Paiement expiré",
          failed: "Échec du paiement",
        };
        try {
          await adminDb.from("notifications").insert({
            user_id: userId,
            title: titleMap[normalizedStatus] || "Mise à jour transaction",
            message: `Votre transaction (Réf: ${txReference}) est passée au statut ${normalizedStatus.toUpperCase()}. Vous pouvez réessayer à tout moment depuis votre espace.`,
            type: "payment_failed",
            is_read: false,
            created_at: nowIso,
          });
        } catch (e: any) {
          // Fail-safe notification catch
        }
      }

      await logNotchPayEvent(userId, txReference, `webhook_processed_${normalizedStatus}`, { reqId, status: normalizedStatus });
    } else {
      console.log(`[NP Webhook ${reqId}] Statut intermédiaire reçu: ${rawStatus}`);
      if (tx) {
        await adminDb.from("transactions").update({
          status: rawStatus,
          updated_at: nowIso,
        }).eq("id", tx.id);
      }
    }

    return NextResponse.json({
      received: true,
      status: normalizedStatus,
      reference: txReference,
      timestamp: nowIso,
    }, { status: 200 });

  } catch (err: any) {
    console.error("[NP Webhook FATAL ERROR]", err.message, err.stack);
    await logNotchPayEvent(null, null, "fatal_error", { message: err.message, stack: err.stack }).catch(() => {});
    return NextResponse.json({ received: true, error: "Internal server error" }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    service: "Passerelle Webhook Notch Pay – TCF Canada Pro",
    domain: "https://griffondortcfcanada.com",
    webhookUrl: "https://griffondortcfcanada.com/api/webhooks/notchpay",
    environment: process.env.NOTCHPAY_ENV || "production",
    admin: "Administrateur réseau Miguel",
    version: "3.1.0",
  }, { status: 200 });
}

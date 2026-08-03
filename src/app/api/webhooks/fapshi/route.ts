import { NextResponse } from "next/server";
import { verifyFapshiWebhook, logFapshiEvent, PACK_DURATIONS, PACK_NAMES, inferPackFromAmountOrRef } from "@/lib/fapshi";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

/**
 * Webhook Fapshi – TCF Canada Pro v3.0 Production
 * Domaine : https://griffondortcfcanada.com
 * Administrateur réseau : Miguel
 * Synchronisation automatique des statuts, abonnements, notifications et profils via Fapshi
 */

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function POST(request: Request) {
  const reqId = `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  console.log(`\n[Fapshi Webhook] ===== DEBUT ${reqId} =====`);

  try {
    const rawBody = await request.text();
    const sig = request.headers.get("x-wh-secret") || null;

    console.log(`[Fapshi Webhook ${reqId}] Secret transmis: ${sig ? "***" : "NON SPECIFIE"}`);

    // Vérification du secret webhook
    const isValid = verifyFapshiWebhook(sig);
    if (!isValid) {
      console.warn(`[Fapshi Webhook ${reqId}] Échec validation secret webhook`);
      await logFapshiEvent(null, null, "webhook_error", { reqId, error: "Secret webhook invalide" });
      return NextResponse.json({ received: true, warning: "Invalid signature" }, { status: 200 });
    }

    await logFapshiEvent(null, null, "webhook_signature_verified", { reqId });

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch (err: any) {
      console.error(`[Fapshi Webhook ${reqId}] Payload JSON invalide :`, err.message);
      return NextResponse.json({ received: true, error: "Invalid JSON format" }, { status: 200 });
    }

    const transaction = payload;
    const reference = transaction.externalId || transaction.transId || null;
    const rawStatus = (transaction.status || "").toUpperCase();
    const amount = typeof transaction.amount === "number" ? transaction.amount : parseFloat(transaction.amount || 0);
    const payerEmail = (transaction.email || "").toLowerCase().trim();
    const paymentChannel = transaction.medium || "Fapshi";
    const providerTxId = transaction.transId || reference;

    console.log(`[Fapshi Webhook ${reqId}] Evénement=payment_update | Réf=${reference} | StatutBrut=${rawStatus} | Montant=${amount} FCFA | Email=${payerEmail}`);

    await logFapshiEvent(null, reference, "webhook_received", {
      reqId,
      eventType: "payment_update",
      rawStatus,
      reference,
      amount,
      payerEmail,
      paymentChannel,
    });

    const adminDb = getAdminSupabase();
    if (!adminDb) {
      console.error(`[Fapshi Webhook ${reqId}] Supabase Admin non disponible !`);
      await logFapshiEvent(null, reference, "webhook_error", { reqId, error: "Supabase Admin indisponible" });
      return NextResponse.json({ received: true, error: "Database client unavailable" }, { status: 200 });
    }

    // Recherche de la transaction dans Supabase
    let tx: any = null;
    if (reference) {
      const { data: txList } = await adminDb.from("transactions").select("*")
        .or(`reference.eq.${reference},provider_transaction_id.eq.${reference}`)
        .order("created_at", { ascending: false })
        .limit(1);
      tx = txList && txList.length > 0 ? txList[0] : null;
    }

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
          console.log(`[Fapshi Webhook ${reqId}] Transaction pending retrouvée via email utilisateur : ${tx.reference}`);
        }
      }
    }

    let userId: string | null = tx?.user_id || null;
    if (!userId && payerEmail) {
      const { data: userProfiles } = await adminDb.from("profiles").select("id").eq("email", payerEmail).limit(1);
      if (userProfiles && userProfiles.length > 0) {
        userId = userProfiles[0].id;
      }
    }

    console.log(`[Fapshi Webhook ${reqId}] Supabase Transaction: ${tx ? "TROUVÉE (id=" + tx.id + ")" : "NON TROUVÉE en BDD"}`);

    const txReference = tx?.reference || reference || `FAPSHI_${Date.now()}`;
    const amountVal = amount || (tx ? parseFloat(tx.amount) : 0);

    const resolvedPack = tx?.pack || inferPackFromAmountOrRef(amountVal, txReference);
    const packName = PACK_NAMES[resolvedPack] || "Pack TCF Canada Pro";
    const durationDays = PACK_DURATIONS[resolvedPack] || 30;

    let normalizedStatus: "completed" | "cancelled" | "expired" | "failed" | "pending" = "pending";

    if (rawStatus === "SUCCESSFUL") {
      normalizedStatus = "completed";
    } else if (rawStatus === "EXPIRED") {
      normalizedStatus = "expired";
    } else if (rawStatus === "FAILED") {
      normalizedStatus = "failed";
    }

    // Idempotence
    if (tx && tx.status === "completed" && tx.webhook_status === "processed" && normalizedStatus === "completed") {
      console.log(`[Fapshi Webhook ${reqId}] Idempotence : Transaction déjà validée en BDD. Passage sans ré-exécution.`);
      return NextResponse.json({ received: true, message: "Transaction already processed" }, { status: 200 });
    }

    const now = new Date();
    const nowIso = now.toISOString();

    if (normalizedStatus === "completed") {
      console.log(`[Fapshi Webhook ${reqId}] ✅ PAIEMENT CONFIRMÉ ! Activation du ${packName} (${durationDays} jours)`);

      if (userId) {
        const { data: existingActiveSub } = await adminDb.from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "active")
          .order("expires_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        let startDate = now;
        let expiresAt = new Date(now.getTime() + durationDays * 24 * 3600 * 1000);

        if (existingActiveSub && existingActiveSub.expires_at) {
          const currentExpiry = new Date(existingActiveSub.expires_at);
          if (currentExpiry > now) {
            expiresAt = new Date(currentExpiry.getTime() + durationDays * 24 * 3600 * 1000);
            console.log(`[Fapshi Webhook ${reqId}] 🔄 Prolongation d'abonnement détectée. Nouvelle expiration : ${expiresAt.toISOString()}`);
          }
        }

        const formattedExpires = expiresAt.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        await adminDb.from("subscriptions")
          .update({ status: "replaced", updated_at: nowIso })
          .eq("user_id", userId)
          .eq("status", "active");

        const { data: newSub, error: subErr } = await adminDb.from("subscriptions").insert({
          user_id: userId,
          pack: resolvedPack,
          plan: resolvedPack, // <-- FIXED: plan column is required
          amount: amountVal.toString(),
          currency: "XAF",
          status: "active",
          started_at: startDate.toISOString(),
          expires_at: expiresAt.toISOString(),
          created_at: nowIso,
          updated_at: nowIso,
        }).select("id").single();

        if (subErr) {
          console.error(`[Fapshi Webhook ${reqId}] Erreur création abonnement Supabase:`, subErr);
        }

        const subscriptionId = newSub?.id || null;

        const { error: profErr } = await adminDb.from("profiles")
          .update({
            subscription_type: resolvedPack,
            updated_at: nowIso,
          })
          .eq("id", userId);

        if (profErr) {
          console.error(`[Fapshi Webhook ${reqId}] Erreur mise à jour du profil utilisateur:`, profErr);
        }

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
        } else {
          await adminDb.from("transactions").insert({
            user_id: userId,
            subscription_id: subscriptionId,
            provider: "Fapshi",
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
        }

        try {
          await adminDb.from("notifications").insert({
            user_id: userId,
            title: `✅ Paiement confirmé – ${packName}`,
            message: `Votre paiement de ${amountVal.toLocaleString("fr-FR")} FCFA a été confirmé via Fapshi. Votre abonnement est actif jusqu'au ${formattedExpires}.`,
            type: "payment_success",
            is_read: false,
            created_at: nowIso,
          });
        } catch (e: any) {}

        await logFapshiEvent(userId, txReference, "webhook_processed_completed", {
          reqId,
          result: "SUCCESS",
          pack: resolvedPack,
          packName,
          durationDays,
          expiresAt: expiresAt.toISOString(),
          subscriptionId,
        });

      } else {
        console.error(`[Fapshi Webhook ${reqId}] ERREUR : Aucun utilisateur associé trouvé pour la référence ${reference}`);
        await logFapshiEvent(null, txReference, "webhook_error_no_user", { reqId, reference });
      }

    } else if (["cancelled", "expired", "failed"].includes(normalizedStatus)) {
      console.log(`[Fapshi Webhook ${reqId}] ❌ Statut transaction mis à jour vers : ${normalizedStatus}`);

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
            message: `Votre transaction (Réf: ${txReference}) est passée au statut ${normalizedStatus.toUpperCase()}. Vous pouvez réessayer à tout moment.`,
            type: "payment_failed",
            is_read: false,
            created_at: nowIso,
          });
        } catch (e: any) {}
      }

      await logFapshiEvent(userId, txReference, `webhook_processed_${normalizedStatus}`, { reqId, status: normalizedStatus });
    } else {
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
    console.error("[Fapshi Webhook FATAL ERROR]", err.message, err.stack);
    await logFapshiEvent(null, null, "fatal_error", { message: err.message, stack: err.stack }).catch(() => {});
    return NextResponse.json({ received: true, error: "Internal server error" }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    service: "Passerelle Webhook Fapshi – TCF Canada Pro",
    domain: "https://griffondortcfcanada.com",
    webhookUrl: "https://griffondortcfcanada.com/api/webhooks/fapshi",
    environment: process.env.FAPSHI_ENV || "sandbox",
    admin: "Administrateur réseau Miguel",
    version: "4.0.0",
  }, { status: 200 });
}

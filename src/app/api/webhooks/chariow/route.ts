import { NextResponse } from "next/server";
import { PACK_DURATIONS, PACK_NAMES, inferPackFromAmountOrRef } from "@/lib/fapshi";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import crypto from "crypto";

/**
 * Webhook Chariow – TCF Canada Pro
 * Domaine : https://griffondortcfcanada.com
 * Administrateur réseau : Miguel
 */

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function POST(request: Request) {
  const reqId = `wh_char_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  console.log(`\n[Chariow Webhook] ===== DEBUT ${reqId} =====`);

  try {
    const rawBody = await request.text();
    
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch (err: any) {
      console.error(`[Chariow Webhook ${reqId}] Payload JSON invalide :`, err.message);
      return NextResponse.json({ received: true, error: "Invalid JSON format" }, { status: 200 });
    }

    const transaction = payload;
    const reference = transaction.reference || transaction.transaction_id || transaction.id || null;
    const rawStatus = (transaction.status || "").toUpperCase();
    const amount = typeof transaction.amount === "number" ? transaction.amount : parseFloat(transaction.amount || 0);
    const payerEmail = (transaction.customer_email || transaction.email || "").toLowerCase().trim();
    const paymentChannel = "Chariow";
    const providerTxId = transaction.transaction_id || transaction.id || reference;

    console.log(`[Chariow Webhook ${reqId}] Evénement=payment_update | Réf=${reference} | StatutBrut=${rawStatus} | Montant=${amount} FCFA | Email=${payerEmail}`);

    const adminDb = getAdminSupabase();
    if (!adminDb) {
      console.error(`[Chariow Webhook ${reqId}] Supabase Admin non disponible !`);
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

    let userId: string | null = tx?.user_id || transaction?.metadata?.user_id || null;

    if (!userId && payerEmail) {
      const { data: userProfiles } = await adminDb.from("profiles").select("id").eq("email", payerEmail).limit(1);
      if (userProfiles && userProfiles.length > 0) {
        userId = userProfiles[0].id;
      }
    }

    console.log(`[Chariow Webhook ${reqId}] Supabase Transaction: ${tx ? "TROUVÉE (id=" + tx.id + ")" : "NON TROUVÉE en BDD"}`);

    const txReference = tx?.reference || reference || `CHARIOW_${Date.now()}`;
    const amountVal = amount || (tx ? parseFloat(tx.amount) : 0);

    const resolvedPack = tx?.pack || transaction?.metadata?.pack || inferPackFromAmountOrRef(amountVal, txReference);
    const packName = PACK_NAMES[resolvedPack] || "Pack TCF Canada Pro";
    const durationDays = PACK_DURATIONS[resolvedPack] || 30;

    let normalizedStatus: "completed" | "cancelled" | "expired" | "failed" | "pending" = "pending";

    if (rawStatus === "SUCCESSFUL" || rawStatus === "SUCCESS" || rawStatus === "COMPLETED") {
      normalizedStatus = "completed";
    } else if (rawStatus === "EXPIRED") {
      normalizedStatus = "expired";
    } else if (rawStatus === "FAILED") {
      normalizedStatus = "failed";
    } else if (rawStatus === "CANCELLED" || rawStatus === "CANCELED") {
      normalizedStatus = "cancelled";
    }

    // Idempotence
    if (tx && tx.status === "completed" && tx.webhook_status === "processed" && normalizedStatus === "completed") {
      console.log(`[Chariow Webhook ${reqId}] Idempotence : Transaction déjà validée en BDD. Passage sans ré-exécution.`);
      return NextResponse.json({ received: true, message: "Transaction already processed" }, { status: 200 });
    }

    const now = new Date();
    const nowIso = now.toISOString();

    if (normalizedStatus === "completed") {
      console.log(`[Chariow Webhook ${reqId}] ✅ PAIEMENT CONFIRMÉ ! Activation du ${packName} (${durationDays} jours)`);

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
          }
        }

        await adminDb.from("subscriptions")
          .update({ status: "replaced", updated_at: nowIso })
          .eq("user_id", userId)
          .eq("status", "active");

        const { data: newSub } = await adminDb.from("subscriptions").upsert({
          user_id: userId,
          pack: resolvedPack,
          plan: resolvedPack,
          amount: amountVal.toString(),
          currency: "XAF",
          status: "active",
          started_at: startDate.toISOString(),
          expires_at: expiresAt.toISOString(),
          created_at: nowIso,
          updated_at: nowIso,
        }, { onConflict: 'user_id' }).select("id").single();

        const subscriptionId = newSub?.id || null;

        await adminDb.from("profiles")
          .update({
            subscription_type: resolvedPack,
            updated_at: nowIso,
          })
          .eq("id", userId);

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
            provider: "Chariow",
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
            message: `Votre paiement de ${amountVal.toLocaleString("fr-FR")} FCFA a été confirmé via Chariow.`,
            type: "payment_success",
            is_read: false,
            created_at: nowIso,
          });
        } catch (e: any) {}

      } else {
        console.error(`[Chariow Webhook ${reqId}] ERREUR : Aucun utilisateur trouvé pour la ref ${reference}`);
      }

    } else if (["cancelled", "expired", "failed"].includes(normalizedStatus)) {
      if (tx) {
        await adminDb.from("transactions").update({
          status: normalizedStatus,
          webhook_status: "processed",
          updated_at: nowIso,
        }).eq("id", tx.id);
      }
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
    }, { status: 200 });

  } catch (err: any) {
    console.error("[Chariow Webhook FATAL ERROR]", err.message, err.stack);
    return NextResponse.json({ received: true, error: "Internal server error" }, { status: 200 });
  }
}

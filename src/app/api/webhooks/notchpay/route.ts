import { NextResponse } from "next/server";
import { verifyNotchPayWebhook, logNotchPayEvent } from "@/lib/notchpay";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

/**
 * Webhook Notch Pay – TCF Canada Pro v2.0
 * Administrateur réseau Miguel
 * Flux : HMAC verify → parse → Supabase lookup → idempotence → activate → notify
 */

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const PACK_DURATIONS: Record<string, number> = { standard: 30, griffon: 30, vip: 60 };
const PACK_NAMES: Record<string, string> = {
  standard: "Pack Standard",
  griffon: "Pack Griffon D'OR",
  vip: "Pack VIP & Coaching",
};

function inferPackFromAmount(amount: number): string {
  if (amount >= 90000) return "vip";
  if (amount >= 20000) return "griffon";
  return "standard";
}

export async function POST(request: Request) {
  const reqId = `wh_${Date.now()}`;
  console.log(`\n[NP Webhook] ===== START ${reqId} =====`);

  try {
    // ETAPE 1 : corps brut pour HMAC
    const rawBody = await request.text();
    console.log(`[NP Webhook ${reqId}] Corps: ${rawBody.length} chars`);

    const sig = request.headers.get("x-notch-signature")
      || request.headers.get("X-Notch-Signature")
      || request.headers.get("x-webhook-signature")
      || null;

    console.log(`[NP Webhook ${reqId}] Signature: ${sig ? sig.slice(0, 20) + "..." : "ABSENTE"}`);

    // ETAPE 2 : Verification HMAC
    const isValid = verifyNotchPayWebhook(rawBody, sig);
    console.log(`[NP Webhook ${reqId}] Signature valide: ${isValid}`);

    if (!isValid) {
      await logNotchPayEvent(null, null, "webhook_error", { reqId, error: "Signature invalide", sig: sig ? sig.slice(0, 20) : null });
      // Retourner 200 pour eviter les rejeux Notch Pay
      return NextResponse.json({ received: true, warning: "Invalid signature" }, { status: 200 });
    }

    // ETAPE 3 : Parsing JSON
    let payload: any;
    try { payload = JSON.parse(rawBody); } catch {
      return NextResponse.json({ received: true, error: "Invalid JSON" }, { status: 200 });
    }

    // ETAPE 4 : Extraction transaction
    // Notch Pay : { event, data: { payment: {...} } } ou { data: { transaction: {...} } }
    const event = payload.event || payload.type || "unknown";
    const dataSection = payload.data || {};
    const transaction = dataSection.payment || dataSection.transaction || payload.payment || payload.transaction || dataSection || {};

    const reference = transaction.reference || transaction.externalId || transaction.external_id || dataSection.reference || null;
    const status = (transaction.status || "").toLowerCase();
    const amount = parseFloat(transaction.amount) || 0;
    const customer = transaction.customer || {};
    const payerEmail = customer.email || null;

    console.log(`[NP Webhook ${reqId}] event=${event} | ref=${reference} | status=${status} | amount=${amount}`);

    await logNotchPayEvent(null, reference, "webhook_received", { reqId, event, status, reference, amount, payerEmail });

    // ETAPE 5 : Supabase
    const adminDb = getAdminSupabase();
    if (!adminDb) {
      console.error(`[NP Webhook ${reqId}] CRITIQUE: Supabase non configure`);
      await logNotchPayEvent(null, reference, "webhook_error", { reqId, error: "Supabase indisponible" });
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // ETAPE 6 : Lookup transaction Supabase
    let tx: any = null;
    if (reference) {
      const { data: txList, error: txErr } = await adminDb.from("transactions").select("*")
        .or(`reference.eq.${reference},provider_transaction_id.eq.${reference}`)
        .order("created_at", { ascending: false }).limit(1);
      if (txErr) console.error(`[NP Webhook ${reqId}] Erreur lookup tx:`, txErr);
      tx = txList && txList.length > 0 ? txList[0] : null;
    }
    console.log(`[NP Webhook ${reqId}] Tx Supabase: ${tx ? "TROUVEE id=" + tx.id : "NON TROUVEE"}`);

    const userId: string | null = tx?.user_id || null;
    const txReference = tx?.reference || reference || `NOTCHPAY_${Date.now()}`;
    const amountVal = amount || (tx ? parseFloat(tx.amount) : 0);

    // Resolution du pack : Supabase > montant
    const resolvedPack = tx?.pack || inferPackFromAmount(amountVal);
    const packName = PACK_NAMES[resolvedPack] || "Abonnement TCF";
    const durationDays = PACK_DURATIONS[resolvedPack] || 30;

    console.log(`[NP Webhook ${reqId}] Pack: ${resolvedPack} (${tx?.pack ? "depuis DB" : "infere montant"}) | ${durationDays}j`);

    // ETAPE 7 : Idempotence
    if (tx && (tx.status === "completed" || tx.status === "complete")) {
      console.log(`[NP Webhook ${reqId}] Deja traite – skip`);
      return NextResponse.json({ received: true, message: "Already processed" }, { status: 200 });
    }

    // ETAPE 8 : Traitement selon statut
    if (status === "complete" || status === "completed") {
      console.log(`[NP Webhook ${reqId}] PAIEMENT CONFIRME → activation ${resolvedPack}`);

      const now = new Date();
      const expiresAt = new Date(now.getTime() + durationDays * 24 * 3600 * 1000);
      const formattedExpires = expiresAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

      if (userId) {
        // A. Archiver anciens abonnements
        const { error: archErr } = await adminDb.from("subscriptions")
          .update({ status: "replaced", updated_at: now.toISOString() })
          .eq("user_id", userId).eq("status", "active");
        if (archErr) console.warn(`[NP Webhook ${reqId}] Archivage warn:`, archErr.message);
        else console.log(`[NP Webhook ${reqId}] ✓ Anciens abonnements archives`);

        // B. Creer nouvel abonnement
        const { data: newSub, error: subErr } = await adminDb.from("subscriptions").insert({
          user_id: userId, pack: resolvedPack, amount: amountVal.toString(), currency: "XAF",
          status: "active", started_at: now.toISOString(), expires_at: expiresAt.toISOString(),
          created_at: now.toISOString(), updated_at: now.toISOString(),
        }).select("id").single();

        if (subErr) console.error(`[NP Webhook ${reqId}] ERREUR creation abo:`, subErr);
        else console.log(`[NP Webhook ${reqId}] ✓ Abonnement cree id=${newSub?.id} expire=${formattedExpires}`);

        const subscriptionId = newSub?.id || null;

        // C. Mettre a jour profil
        const { error: profErr } = await adminDb.from("profiles")
          .update({ subscription_type: resolvedPack, updated_at: now.toISOString() })
          .eq("id", userId);
        if (profErr) console.error(`[NP Webhook ${reqId}] Erreur profil:`, profErr);
        else console.log(`[NP Webhook ${reqId}] ✓ Profil mis a jour: subscription_type=${resolvedPack}`);

        // D. Mettre a jour / creer transaction
        if (tx) {
          const { error: txUpErr } = await adminDb.from("transactions").update({
            status: "completed", webhook_status: "processed",
            payment_method: transaction.channel || "NotchPay",
            pack: resolvedPack, subscription_id: subscriptionId,
            provider_transaction_id: reference || tx.provider_transaction_id,
            updated_at: now.toISOString(),
          }).eq("id", tx.id);
          if (txUpErr) console.error(`[NP Webhook ${reqId}] Erreur update tx:`, txUpErr);
          else console.log(`[NP Webhook ${reqId}] ✓ Transaction: completed`);
        } else {
          await adminDb.from("transactions").insert({
            user_id: userId, subscription_id: subscriptionId, provider: "NotchPay",
            provider_transaction_id: reference, payment_method: transaction.channel || "NotchPay",
            amount: amountVal.toString(), currency: "XAF", pack: resolvedPack,
            reference: txReference, status: "completed", webhook_status: "processed",
            created_at: now.toISOString(), updated_at: now.toISOString(),
          });
          console.log(`[NP Webhook ${reqId}] ✓ Transaction creee (orpheline)`);
        }

        // E. Notification utilisateur
        const { error: notifErr } = await adminDb.from("notifications").insert({
          user_id: userId,
          title: `✅ Paiement confirmé – ${packName}`,
          message: `Votre paiement de ${amountVal.toLocaleString("fr-FR")} FCFA pour le ${packName} a été confirmé via Notch Pay (Réf: ${txReference}). Droits actifs pour ${durationDays} jours (jusqu'au ${formattedExpires}).`,
          type: "payment_success", is_read: false, created_at: now.toISOString(),
        });
        if (notifErr) console.warn(`[NP Webhook ${reqId}] Notification non insérée (table manquante?):`, notifErr.message);
        else console.log(`[NP Webhook ${reqId}] ✓ Notification creee`);

        await logNotchPayEvent(userId, txReference, "webhook_processed", {
          reqId, result: "SUCCESS", pack: resolvedPack, packName, durationDays,
          expiresAt: expiresAt.toISOString(), subscriptionId, payerEmail,
        });

        console.log(`[NP Webhook ${reqId}] ===== FIN OK – ${resolvedPack} active =====`);

      } else {
        console.error(`[NP Webhook ${reqId}] ERREUR: userId introuvable pour ref=${reference}`);
        await logNotchPayEvent(null, txReference, "webhook_error", { reqId, error: "userId introuvable", reference, payerEmail });
      }

    } else if (["failed", "canceled", "cancelled", "expired"].includes(status)) {
      console.log(`[NP Webhook ${reqId}] Paiement ${status}`);
      if (tx) {
        await adminDb.from("transactions").update({
          status: status === "cancelled" ? "canceled" : status,
          webhook_status: "processed", updated_at: new Date().toISOString(),
        }).eq("id", tx.id);
      }
      if (userId) {
        const title = status === "canceled" || status === "cancelled" ? "Paiement annulé"
          : status === "expired" ? "Paiement expiré" : "Paiement non finalisé";
        await adminDb.from("notifications").insert({
          user_id: userId, title,
          message: `Votre tentative (Réf: ${txReference}) n'a pas abouti (${status.toUpperCase()}). Réessayez depuis le tableau de bord.`,
          type: "payment_failed", is_read: false, created_at: new Date().toISOString(),
        }).catch(e => console.warn("[NP Webhook] Notif echec:", e.message));
      }
      await logNotchPayEvent(userId, txReference, "webhook_processed", { reqId, result: status.toUpperCase() });

    } else {
      // Statut intermediaire
      console.log(`[NP Webhook ${reqId}] Statut intermediaire: ${status || "inconnu"}`);
      if (tx && status) {
        await adminDb.from("transactions").update({ status, updated_at: new Date().toISOString() }).eq("id", tx.id);
      }
    }

    return NextResponse.json({ received: true, processedStatus: status }, { status: 200 });

  } catch (err: any) {
    console.error("[NP Webhook FATAL]", err.message, err.stack?.split("\n").slice(0, 3).join(" | "));
    await logNotchPayEvent(null, null, "error", { message: err.message, stack: err.stack?.slice(0, 300) }).catch(() => {});
    return NextResponse.json({ received: true, error: "Internal error" }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    service: "Passerelle Webhook Notch Pay – TCF-Canada Pro",
    message: "Webhook Notch Pay actif et prêt.",
    webhookUrl: "https://tcf-canada-olive.vercel.app/api/webhooks/notchpay",
    environment: process.env.NOTCHPAY_ENV || "test",
    admin: "Administrateur réseau Miguel",
    version: "2.0.0",
  }, { status: 200 });
}

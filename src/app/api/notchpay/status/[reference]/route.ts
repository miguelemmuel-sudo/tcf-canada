import { NextResponse } from "next/server";
import { getPaymentStatus, logNotchPayEvent, PACK_DURATIONS, PACK_NAMES, inferPackFromAmountOrRef } from "@/lib/notchpay";
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const resolvedParams = await params;
    const reference = resolvedParams.reference;

    if (!reference) {
      return NextResponse.json(
        { error: "Référence de transaction manquante." },
        { status: 400 }
      );
    }

    // 1. Interroger l'API officielle Notch Pay pour le statut
    const notchStatus = await getPaymentStatus(reference);
    const statusNorm = (notchStatus.status || "").toLowerCase();

    // 2. Synchronisation Supabase en cas de succès (fallback si le webhook accuse un léger retard)
    if (["complete", "completed", "payment.complete", "success"].includes(statusNorm)) {
      const adminDb = getAdminSupabase();
      if (adminDb) {
        const { data: transactions } = await adminDb
          .from("transactions")
          .select("*")
          .or(
            `reference.eq.${reference},provider_transaction_id.eq.${reference}`
          );

        const tx =
          transactions && transactions.length > 0 ? transactions[0] : null;

        // Activer l'abonnement seulement si la transaction n'est pas encore marquée comme complétée
        if (tx && tx.status !== "completed") {
          const userId = tx.user_id;
          const amountVal = notchStatus.amount || parseFloat(tx.amount) || 0;
          const packKey = tx.pack || inferPackFromAmountOrRef(amountVal, tx.reference);
          const packName = PACK_NAMES[packKey] || "Pack TCF Canada Pro";
          const durationDays = PACK_DURATIONS[packKey] || 30;

          const now = new Date();
          const nowIso = now.toISOString();

          if (userId) {
            // Vérifier s'il a un abonnement actif sur le même pack pour extension
            const { data: existingActiveSub } = await adminDb
              .from("subscriptions")
              .select("*")
              .eq("user_id", userId)
              .eq("status", "active")
              .order("expires_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            let expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
            if (existingActiveSub && existingActiveSub.pack === packKey && existingActiveSub.expires_at) {
              const curExpiry = new Date(existingActiveSub.expires_at);
              if (curExpiry > now) {
                expiresAt = new Date(curExpiry.getTime() + durationDays * 24 * 60 * 60 * 1000);
              }
            }

            // Désactiver anciens abonnements
            await adminDb
              .from("subscriptions")
              .update({ status: "replaced", updated_at: nowIso })
              .eq("user_id", userId)
              .eq("status", "active");

            // Activer le nouvel abonnement
            const { data: newSub } = await adminDb
              .from("subscriptions")
              .insert({
                user_id: userId,
                pack: packKey,
                amount: amountVal.toString(),
                currency: "XAF",
                status: "active",
                started_at: nowIso,
                expires_at: expiresAt.toISOString(),
                created_at: nowIso,
                updated_at: nowIso,
              })
              .select("id")
              .single();

            // Mettre à jour le profil (activation immédiate)
            await adminDb
              .from("profiles")
              .update({
                subscription_type: packKey,
                updated_at: nowIso,
              })
              .eq("id", userId);

            // Mettre à jour la transaction
            await adminDb
              .from("transactions")
              .update({
                status: "completed",
                webhook_status: "processed",
                payment_method: "NotchPay",
                subscription_id: newSub?.id || null,
                updated_at: nowIso,
              })
              .eq("id", tx.id);

            // Créer la notification utilisateur
            try {
              await adminDb.from("notifications").insert({
                user_id: userId,
                title: `✅ Paiement confirmé : ${packName}`,
                message: `Votre paiement de ${amountVal.toLocaleString(
                  "fr-FR"
                )} FCFA pour le ${packName} a été confirmé via Notch Pay. Valide ${durationDays} jours.`,
                type: "payment_success",
                is_read: false,
                created_at: nowIso,
              });
            } catch (e) {}

            await logNotchPayEvent(userId, reference, "status_check", {
              info: "Activé via GET /status fallback",
              reference,
              pack: packKey,
            });
          }
        }
      }
    } else {
      // Pour les autres statuts (failed, cancelled, expired, etc.), on met à jour la transaction
      const adminDb = getAdminSupabase();
      if (adminDb && ["failed", "canceled", "cancelled", "expired"].includes(statusNorm)) {
        await adminDb
          .from("transactions")
          .update({
            status: statusNorm === "canceled" ? "cancelled" : statusNorm,
            updated_at: new Date().toISOString(),
          })
          .or(`reference.eq.${reference},provider_transaction_id.eq.${reference}`);
      }
    }

    return NextResponse.json({
      success: true,
      reference: notchStatus.reference,
      status: statusNorm === "complete" ? "completed" : statusNorm,
      amount: notchStatus.amount,
      currency: notchStatus.currency,
      paid_at: notchStatus.paid_at,
    });
  } catch (err: any) {
    console.error("[API NotchPay Status Error]", err);
    return NextResponse.json(
      { error: err.message || "Erreur lors de la vérification du statut." },
      { status: 500 }
    );
  }
}


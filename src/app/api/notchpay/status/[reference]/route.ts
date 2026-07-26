import { NextResponse } from "next/server";
import { getPaymentStatus, logNotchPayEvent } from "@/lib/notchpay";
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

    // 2. Synchronisation Supabase en cas de succès (fallback si webhook retardé)
    if (statusNorm === "complete" || statusNorm === "completed") {
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

        // Activer l'abonnement seulement si le webhook n'a pas encore traité
        if (tx && tx.status !== "completed") {
          const userId = tx.user_id;
          const amountVal = notchStatus.amount || parseFloat(tx.amount) || 0;
          const {
            key: packKey,
            name: packName,
            durationDays,
          } = getPackInfo(amountVal, tx.reference);

          const now = new Date();
          const expiresAt = new Date(
            now.getTime() + durationDays * 24 * 60 * 60 * 1000
          );

          if (userId) {
            // Désactiver anciens abonnements
            await adminDb
              .from("subscriptions")
              .update({ status: "replaced", updated_at: now.toISOString() })
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
                started_at: now.toISOString(),
                expires_at: expiresAt.toISOString(),
                created_at: now.toISOString(),
                updated_at: now.toISOString(),
              })
              .select("id")
              .single();

            // Mettre à jour le profil
            await adminDb
              .from("profiles")
              .update({
                subscription_type: packKey,
                updated_at: now.toISOString(),
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
                updated_at: now.toISOString(),
              })
              .eq("id", tx.id);

            // Créer une notification utilisateur
            await adminDb.from("notifications").insert({
              user_id: userId,
              title: `Paiement confirmé : ${packName}`,
              message: `Votre paiement de ${amountVal.toLocaleString(
                "fr-FR"
              )} FCFA pour le ${packName} a été confirmé via Notch Pay (Réf: ${reference}). Valide ${durationDays} jours.`,
              type: "payment_success",
              is_read: false,
              created_at: now.toISOString(),
            });

            await logNotchPayEvent(userId, reference, "status_check", {
              info: "Activé via GET /status fallback",
              reference,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      reference: notchStatus.reference,
      status: statusNorm,
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

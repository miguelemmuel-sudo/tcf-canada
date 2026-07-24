import { NextResponse } from "next/server";
import { getPaymentStatus, logFapshiEvent } from "@/lib/fapshi";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ transId: string }> }
) {
  try {
    const resolvedParams = await params;
    const transId = resolvedParams.transId;

    if (!transId) {
      return NextResponse.json({ error: "Identifiant de transaction (transId) manquant." }, { status: 400 });
    }

    // 1. Interroger l'API officielle Fapshi pour le statut réel
    const fapshiStatus = await getPaymentStatus(transId);
    const statusUpper = (fapshiStatus.status || "").toUpperCase();

    // 2. Synchroniser de manière redondante et robuste avec Supabase si SUCCÈS (fallback au cas où le webhook aurait du retard)
    if (statusUpper === "SUCCESSFUL" || statusUpper === "COMPLETED" || statusUpper === "PAYÉ") {
      const adminDb = getAdminSupabase();
      if (adminDb) {
        const { data: transactions } = await adminDb
          .from("transactions")
          .select("*")
          .or(`provider_transaction_id.eq.${transId},reference.eq.${fapshiStatus.externalId || transId}`);

        const tx = transactions && transactions.length > 0 ? transactions[0] : null;

        // Si la transaction existe mais est toujours en attente (le webhook n'est pas encore arrivé ou a été retardé)
        if (tx && tx.status !== "completed" && tx.status !== "SUCCESSFUL") {
          const userId = tx.user_id || fapshiStatus.userId;
          const amountVal = fapshiStatus.amount || parseFloat(tx.amount) || 0;
          const { key: packKey, name: packName, durationMonths } = getPackInfo(amountVal, tx.reference);

          const now = new Date();
          const expiresAt = new Date(now);
          expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

          if (userId) {
            await adminDb
              .from("subscriptions")
              .update({ status: "replaced", updated_at: now.toISOString() })
              .eq("user_id", userId)
              .eq("status", "active");

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

            await adminDb
              .from("profiles")
              .update({ subscription_type: packKey, updated_at: now.toISOString() })
              .eq("id", userId);

            await adminDb
              .from("transactions")
              .update({
                status: "completed",
                webhook_status: "processed",
                payment_method: fapshiStatus.medium || "Fapshi",
                subscription_id: newSub?.id || null,
                updated_at: now.toISOString()
              })
              .eq("id", tx.id);

            const notifTitle = `Paiement confirmé : ${packName}`;
            const notifMsg = `Votre paiement de ${amountVal.toLocaleString("fr-FR")} FCFA pour le ${packName} a été confirmé. Valide ${durationMonths} mois (expiration le ${expiresAt.toLocaleDateString("fr-FR")}).`;

            await adminDb.from("notifications").insert({
              user_id: userId,
              title: notifTitle,
              message: notifMsg,
              type: "payment_success",
              is_read: false,
              created_at: now.toISOString()
            });

            await logFapshiEvent(userId, tx.reference, "status_check", { info: "Activé via GET /status fallback", transId });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      transId: fapshiStatus.transId,
      status: statusUpper,
      amount: fapshiStatus.amount,
      externalId: fapshiStatus.externalId,
      medium: fapshiStatus.medium,
      dateConfirmed: fapshiStatus.dateConfirmed
    });

  } catch (err: any) {
    console.error("[API Fapshi Status Error]", err);
    return NextResponse.json(
      { error: err.message || "Erreur lors de la vérification du statut." },
      { status: 500 }
    );
  }
}

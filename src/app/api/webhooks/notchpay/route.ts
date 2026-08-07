import { NextResponse } from "next/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { PACK_CONFIGS } from "@/utils/subscriptionEngine";
import crypto from 'crypto';

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-notchpay-signature");

    // Vérifier la signature si ce n'est pas un déclenchement manuel interne
    if (signature !== "manual-trigger" && process.env.NOTCHPAY_WEBHOOK_SECRET) {
      const hash = crypto.createHmac('sha256', process.env.NOTCHPAY_WEBHOOK_SECRET)
                         .update(rawBody)
                         .digest('hex');
      if (hash !== signature) {
        console.error("Invalid Notch Pay webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);

    // Notch Pay envoie souvent event="payment.complete"
    const event = payload.event;
    const data = payload.data;

    if (event !== "payment.complete" && data?.status !== "complete") {
      // Ignorer les autres événements pour l'instant
      return NextResponse.json({ success: true, message: "Event ignored" });
    }

    const adminDb = getAdminSupabase();
    if (!adminDb) {
      return NextResponse.json({ error: "Admin DB non disponible" }, { status: 500 });
    }

    const reference = data.reference;
    
    // Récupérer la transaction
    const { data: tx, error: txError } = await adminDb
      .from("transactions")
      .select("*")
      .eq("reference", reference)
      .limit(1)
      .single();

    if (txError || !tx) {
      console.error("Transaction non trouvée pour ref:", reference);
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (tx.status === "completed") {
      return NextResponse.json({ success: true, message: "Transaction already processed" });
    }

    // Mettre à jour la transaction
    await adminDb.from("transactions").update({ status: "completed" }).eq("id", tx.id);

    const packConfig = PACK_CONFIGS[tx.pack as keyof typeof PACK_CONFIGS];
    if (!packConfig) {
      console.error("Pack non trouvé dans la configuration:", tx.pack);
      return NextResponse.json({ error: "Pack invalid" }, { status: 400 });
    }

    const durationDays = packConfig.durationDays || 30; // 30 jours par défaut, VIP = 60
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 3600 * 1000);

    // Mettre à jour la souscription
    await adminDb.from("subscriptions").upsert({
      user_id: tx.user_id,
      pack: tx.pack,
      plan: tx.pack,
      amount: tx.amount.toString(),
      currency: tx.currency,
      status: "active",
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      updated_at: now.toISOString(),
    }, { onConflict: 'user_id' });

    // Mettre à jour le profil
    await adminDb.from("profiles").update({ subscription_type: tx.pack }).eq("id", tx.user_id);

    // Créer une notification formatée comme demandé
    const message = `Votre paiement a été confirmé avec succès. Votre Pack ${packConfig.name} est maintenant actif jusqu'au ${expiresAt.toLocaleDateString("fr-FR")}.`;
    
    await adminDb.from("notifications").insert({
      user_id: tx.user_id,
      title: "Paiement confirmé",
      message: message,
      type: "success",
      read: false
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Erreur Webhook Notch Pay:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { initiatePay } from "@/lib/fapshi";

const SERVER_PRICING: Record<string, { amount: number; name: string; currency: string }> = {
  standard: { amount: 15000, name: "Pack Standard", currency: "FCFA" },
  griffon: { amount: 25000, name: "Pack Griffon D'OR", currency: "FCFA" },
  vip: { amount: 100000, name: "Pack VIP & Coaching", currency: "FCFA" }
};

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, pack } = body;

    if (!email || !password || !name || !pack) {
      return NextResponse.json(
        { error: "Tous les champs (email, mot de passe, nom, pack) sont requis." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const selectedPackKey = pack.toLowerCase();
    const packConfig = SERVER_PRICING[selectedPackKey];

    if (!packConfig) {
      return NextResponse.json({ error: "Pack sélectionné invalide." }, { status: 400 });
    }

    const adminSupabase = getAdminSupabase();
    if (!adminSupabase) {
      return NextResponse.json(
        { error: "Erreur serveur : configuration de la base de données manquante." },
        { status: 500 }
      );
    }

    // 1. Création dans auth.users
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: cleanEmail,
      password,
      user_metadata: { full_name: name, subscription_type: selectedPackKey },
      email_confirm: true, // Auto confirm
    });

    if (authError) {
      const lowerMsg = (authError.message || "").toLowerCase();
      if (lowerMsg.includes("already exists") || lowerMsg.includes("already registered")) {
        return NextResponse.json(
          { error: "Cette adresse e-mail est déjà associée à un compte TCF Canada. Veuillez vous connecter." },
          { status: 400 }
        );
      }
      if (lowerMsg.includes("password") || lowerMsg.includes("weak")) {
        return NextResponse.json(
          { error: "Le mot de passe est trop faible. Minimum 8 caractères." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData?.user?.id;
    if (!userId) throw new Error("Erreur: ID utilisateur manquant après création.");

    const now = new Date().toISOString();

    // 2. Création du profil (avec pack choisi, mais compte en attente de paiement)
    await adminSupabase.from("profiles").upsert({
      id: userId,
      email: cleanEmail,
      full_name: name,
      subscription_type: selectedPackKey,
      is_admin: false,
      created_at: now,
      updated_at: now,
    }, { onConflict: "id" });

    // 3. Création dans subscriptions (Paiement en attente, non actif)
    const { data: subData } = await adminSupabase.from("subscriptions").insert({
      user_id: userId,
      pack: selectedPackKey,
      amount: packConfig.amount.toString(),
      currency: packConfig.currency,
      status: "pending", // Paiement en attente
      started_at: null,
      expires_at: null,
      created_at: now,
      updated_at: now
    }).select("id").single();

    const subscriptionId = subData?.id;

    // 4. Initialisation Fapshi
    const amount = packConfig.amount;
    const currency = packConfig.currency;
    const timestamp = Date.now();
    const reference = `TCF_${userId.slice(0, 8)}_${timestamp}`;

    // 5. Création de la transaction en attente
    await adminSupabase.from("transactions").insert({
      user_id: userId,
      subscription_id: subscriptionId || null,
      provider: "Fapshi",
      amount: amount.toString(),
      currency: currency,
      reference: reference,
      status: "pending",
      webhook_status: "unprocessed",
      payment_method: "Agregateur_Fapshi",
      created_at: now
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (request.headers.get("origin") || "http://localhost:3000");
    const redirectUrl = `${baseUrl}/dashboard/payments?status=check&ref=${reference}&pack=${selectedPackKey}`;

    let fapshiRes;
    try {
      fapshiRes = await initiatePay({
        amount,
        email: cleanEmail,
        redirectUrl,
        userId,
        externalId: reference,
        message: `Abonnement ${packConfig.name} - TCF Canada Pro`
      });
    } catch (fapshiErr: any) {
      console.error("[Register API] Erreur Fapshi initiate:", fapshiErr);
      return NextResponse.json(
        { error: "Le compte a été créé, mais la connexion au service de paiement a échoué. Veuillez vous connecter pour finaliser le paiement." },
        { status: 502 }
      );
    }

    // 6. Maj de la transaction avec l'identifiant Fapshi
    if (fapshiRes.transId) {
      await adminSupabase.from("transactions")
        .update({ provider_transaction_id: fapshiRes.transId })
        .eq("reference", reference);
    }

    // 7. On renvoie le lien de paiement et les informations
    return NextResponse.json({
      success: true,
      link: fapshiRes.link,
      transId: fapshiRes.transId,
      reference,
      user: { id: userId, email: cleanEmail }
    });

  } catch (err: any) {
    console.error("[Register API] Erreur globale:", err?.message);
    return NextResponse.json(
      { error: err?.message || "Erreur interne du serveur lors de l'inscription." },
      { status: 500 }
    );
  }
}

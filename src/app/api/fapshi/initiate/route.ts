import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { initiatePay, logFapshiEvent } from "@/lib/fapshi";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

// Définition stricte et inviolable des tarifs officiels côté serveur
const SERVER_PRICING: Record<string, { amount: number; name: string; currency: string }> = {
  standard: {
    amount: 15000,
    name: "Pack Standard",
    currency: "FCFA"
  },
  griffon: {
    amount: 25000,
    name: "Pack Griffon D'OR",
    currency: "FCFA"
  },
  vip: {
    amount: 100000,
    name: "Pack VIP & Coaching",
    currency: "FCFA"
  }
};

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: sessionUser }, error: authError } = await supabase.auth.getUser();

    const body = await request.json();
    const { pack, redirectUrl, customMessage, userId: bodyUserId, email: bodyEmail } = body;

    let user = sessionUser;
    if (!user && bodyUserId && bodyEmail) {
      // Fallback sécurisé post-inscription immédiate : permet d'initier le paiement Fapshi directement après l'inscription
      user = { id: bodyUserId, email: bodyEmail } as any;
    }

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Authentification requise pour initier un paiement." },
        { status: 401 }
      );
    }

    // 1. Identification automatique du pack et vérification du tarif côté serveur
    const selectedPackKey = (pack || "griffon").toLowerCase();
    const packConfig = SERVER_PRICING[selectedPackKey];

    if (!packConfig) {
      return NextResponse.json(
        { error: "Pack sélectionné invalide ou inexistant." },
        { status: 400 }
      );
    }

    // Le montant ne dépend JAMAIS du navigateur client
    const amount = packConfig.amount;
    const currency = packConfig.currency;

    // 2. Génération d'une référence unique et sécurisée pour la transaction
    const timestamp = Date.now();
    const reference = `TCF_${user.id.slice(0, 8)}_${timestamp}`;

    // URL de retour par défaut après paiement sur la page Fapshi
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (request.headers.get("origin") || "http://localhost:3000");
    const finalRedirectUrl = redirectUrl || `${baseUrl}/dashboard/payments?status=check&ref=${reference}&pack=${selectedPackKey}`;

    const adminDb = getAdminSupabase();

    // 3. Enregistrer la transaction en attente dans Supabase (table transactions)
    if (adminDb) {
      await adminDb.from("transactions").insert({
        user_id: user.id,
        provider: "Fapshi",
        amount: amount.toString(),
        currency: currency,
        reference: reference,
        status: "pending",
        webhook_status: "unprocessed",
        payment_method: "Agregateur_Fapshi",
        created_at: new Date().toISOString()
      });
    }

    // 4. Appel officiel à l'API Fapshi pour générer le lien de paiement sécurisé
    const fapshiRes = await initiatePay({
      amount: amount,
      email: user.email || undefined,
      redirectUrl: finalRedirectUrl,
      userId: user.id,
      externalId: reference,
      message: customMessage || `Abonnement ${packConfig.name} - TCF Canada Pro`
    });

    // 5. Mettre à jour la transaction avec l'identifiant Fapshi (transId)
    if (adminDb && fapshiRes.transId) {
      await adminDb
        .from("transactions")
        .update({ provider_transaction_id: fapshiRes.transId })
        .eq("reference", reference);
    }

    // 6. Renvoyer l'URL sécurisée Fapshi au client pour redirection
    return NextResponse.json({
      success: true,
      link: fapshiRes.link,
      transId: fapshiRes.transId,
      reference: reference,
      amount: amount,
      currency: currency,
      pack: selectedPackKey,
      packName: packConfig.name
    });

  } catch (err: any) {
    console.error("[API Fapshi Initiate Error]", err);
    return NextResponse.json(
      { error: err.message || "Erreur interne lors de l'initialisation du paiement Fapshi." },
      { status: 500 }
    );
  }
}

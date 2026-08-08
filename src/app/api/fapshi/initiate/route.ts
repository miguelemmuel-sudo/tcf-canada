import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { initiateFapshiPayment, logFapshiEvent, PACK_PRICES, PACK_NAMES } from "@/lib/fapshi";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

/**
 * Route d'initialisation de paiement Fapshi
 * Domaine : https://griffondortcfcanada.com
 * Administrateur réseau : Miguel
 */

const SERVER_PRICING: Record<string, { amount: number; name: string; currency: string }> = {
  standard: {
    amount: PACK_PRICES.standard || 100,
    name: PACK_NAMES.standard || "Pack Standard",
    currency: "XAF",
  },
  griffon: {
    amount: PACK_PRICES.griffon || 17500,
    name: PACK_NAMES.griffon || "Pack Griffon D'OR",
    currency: "XAF",
  },
  vip: {
    amount: PACK_PRICES.vip || 50000,
    name: PACK_NAMES.vip || "Pack VIP & Coaching",
    currency: "XAF",
  },
};

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: sessionUser } } = await supabase.auth.getUser();

    const body = await request.json();
    const { pack, returnUrl, customMessage, userId: bodyUserId, email: bodyEmail } = body;

    let user = sessionUser;
    if (!user && bodyUserId && bodyEmail) {
      user = { id: bodyUserId, email: bodyEmail } as any;
    }

    if (!user || !user.id) {
      return NextResponse.json({ error: "Authentification requise pour initier un paiement." }, { status: 401 });
    }

    const selectedPackKey = (pack || "griffon").toLowerCase();
    const packConfig = SERVER_PRICING[selectedPackKey] || SERVER_PRICING.griffon;

    const amount = packConfig.amount;
    const currency = packConfig.currency;

    const timestamp = Date.now();
    const reference = `TCF_${selectedPackKey.toUpperCase()}_${user.id.slice(0, 8)}_${timestamp}`;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "https://griffondortcfcanada.com";
    const finalReturnUrl = returnUrl || `${baseUrl}/dashboard/payments?status=check&ref=${reference}&pack=${selectedPackKey}`;

    const adminDb = getAdminSupabase();

    // 1. Création préalable de la transaction 'pending' dans Supabase
    if (adminDb) {
      await adminDb.from("transactions").insert({
        user_id: user.id,
        provider: "Fapshi",
        amount: amount.toString(),
        currency: currency,
        reference: reference,
        pack: selectedPackKey,
        status: "pending",
        webhook_status: "unprocessed",
        payment_method: "Fapshi",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // 2. Initialisation auprès de Fapshi
    const fapshiRes = await initiateFapshiPayment({
      amount: amount,
      email: user.email || bodyEmail || "",
      externalId: reference,
      message: customMessage || `Abonnement ${packConfig.name} – TCF Canada Pro`,
      redirectUrl: finalReturnUrl,
      pack: selectedPackKey as any,
      userId: user.id,
    });

    if (adminDb && fapshiRes.transId) {
      await adminDb
        .from("transactions")
        .update({ provider_transaction_id: fapshiRes.transId, updated_at: new Date().toISOString() })
        .eq("reference", reference);
    }

    return NextResponse.json({
      success: true,
      paymentUrl: fapshiRes.paymentUrl,
      transactionRef: fapshiRes.transId,
      reference: reference,
      amount: amount,
      currency: currency,
      pack: selectedPackKey,
      packName: packConfig.name,
    }, { status: 200 });

  } catch (err: any) {
    console.error("[Fapshi Initiate Error]", err.message);
    return NextResponse.json({ error: err.message || "Erreur lors de l'initialisation du paiement." }, { status: 500 });
  }
}

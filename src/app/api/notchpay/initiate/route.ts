import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { initiatePayment, logNotchPayEvent } from "@/lib/notchpay";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────────
// Tarifs officiels côté serveur (inviolables, jamais du client)
// ─────────────────────────────────────────────────────────────────
const SERVER_PRICING: Record<string, { amount: number; name: string; currency: string }> = {
  standard: {
    amount: 15000,
    name: "Pack Standard",
    currency: "XAF",
  },
  griffon: {
    amount: 25000,
    name: "Pack Griffon D'OR",
    currency: "XAF",
  },
  vip: {
    amount: 100000,
    name: "Pack VIP & Coaching",
    currency: "XAF",
  },
};

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

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user: sessionUser },
      error: authError,
    } = await supabase.auth.getUser();

    const body = await request.json();
    const {
      pack,
      returnUrl,
      customMessage,
      userId: bodyUserId,
      email: bodyEmail,
    } = body;

    let user = sessionUser;
    // Fallback sécurisé : post-inscription immédiate
    if (!user && bodyUserId && bodyEmail) {
      user = { id: bodyUserId, email: bodyEmail } as any;
    }

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Authentification requise pour initier un paiement." },
        { status: 401 }
      );
    }

    // 1. Validation du pack et du tarif côté serveur
    const selectedPackKey = (pack || "griffon").toLowerCase();
    const packConfig = SERVER_PRICING[selectedPackKey];

    if (!packConfig) {
      return NextResponse.json(
        { error: "Pack sélectionné invalide ou inexistant." },
        { status: 400 }
      );
    }

    const amount = packConfig.amount;
    const currency = packConfig.currency;

    // 2. Référence unique et sécurisée
    const timestamp = Date.now();
    const reference = `TCF_${user.id.slice(0, 8)}_${timestamp}`;

    // 3. URLs de callback et de retour
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get("origin") ||
      "http://localhost:3000";

    const callbackUrl =
      process.env.NOTCHPAY_WEBHOOK_URL ||
      `${baseUrl}/api/webhooks/notchpay`;

    const finalReturnUrl =
      returnUrl ||
      `${baseUrl}/dashboard/payments?status=check&ref=${reference}&pack=${selectedPackKey}`;

    const adminDb = getAdminSupabase();

    // 4. Enregistrer la transaction en attente dans Supabase
    if (adminDb) {
      await adminDb.from("transactions").insert({
        user_id: user.id,
        provider: "NotchPay",
        amount: amount.toString(),
        currency: currency,
        reference: reference,
        status: "pending",
        webhook_status: "unprocessed",
        payment_method: "NotchPay",
        created_at: new Date().toISOString(),
      });
    }

    // 5. Appel à l'API Notch Pay pour générer le lien de paiement
    const notchRes = await initiatePayment({
      amount: amount,
      currency: currency,
      email: user.email || bodyEmail || "",
      reference: reference,
      description:
        customMessage || `Abonnement ${packConfig.name} – TCF Canada Pro`,
      callbackUrl: callbackUrl,
      returnUrl: finalReturnUrl,
      userId: user.id,
    });

    // 6. Mettre à jour la transaction avec la référence Notch Pay
    if (adminDb && notchRes.transactionRef) {
      await adminDb
        .from("transactions")
        .update({ provider_transaction_id: notchRes.transactionRef })
        .eq("reference", reference);
    }

    // 7. Retourner l'URL de paiement Notch Pay au client
    return NextResponse.json({
      success: true,
      paymentUrl: notchRes.paymentUrl,
      transactionRef: notchRes.transactionRef,
      reference: reference,
      amount: amount,
      currency: currency,
      pack: selectedPackKey,
      packName: packConfig.name,
    });
  } catch (err: any) {
    console.error("[API NotchPay Initiate Error]", err);
    return NextResponse.json(
      {
        error:
          err.message ||
          "Erreur interne lors de l'initialisation du paiement Notch Pay.",
      },
      { status: 500 }
    );
  }
}

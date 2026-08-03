import { NextResponse } from "next/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { initiateFapshiPayment, PACK_NAMES, PACK_PRICES } from "@/lib/fapshi";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref");
  const pack = searchParams.get("pack") || "standard";

  if (!ref) {
    return NextResponse.redirect(new URL("/login?error=MissingReference", request.url));
  }

  const adminDb = getAdminSupabase();
  if (!adminDb) {
    return NextResponse.redirect(new URL("/payment-verify?status=error&ref=" + ref, request.url));
  }

  // 1. Chercher la transaction
  const { data: txData } = await adminDb
    .from("transactions")
    .select("user_id, amount, reference")
    .eq("reference", ref)
    .single();

  if (!txData) {
    return NextResponse.redirect(new URL("/login?error=TransactionNotFound", request.url));
  }

  // 2. Chercher l'email de l'utilisateur
  const { data: profile } = await adminDb
    .from("profiles")
    .select("email, full_name")
    .eq("id", txData.user_id)
    .single();

  if (!profile) {
    return NextResponse.redirect(new URL("/login?error=UserNotFound", request.url));
  }

  const amount = PACK_PRICES[pack.toLowerCase()] || 15000;
  const newRef = `TCF_${txData.user_id.slice(0, 8)}_${Date.now()}`;

  // 3. Mettre à jour la transaction avec la nouvelle ref (ou créer une nouvelle)
  await adminDb.from("transactions").update({ reference: newRef }).eq("reference", ref);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get("origin") ||
    "https://griffondortcfcanada.com";

  const redirectUrl = `${baseUrl}/payment-verify?status=check&ref=${newRef}&pack=${pack}&_t=${Date.now()}`;

  try {
    const fapshiRes = await initiateFapshiPayment({
      amount: amount,
      email: profile.email,
      externalId: newRef,
      message: `Abonnement ${PACK_NAMES[pack] || pack} - TCF Canada Pro`,
      redirectUrl: redirectUrl,
      pack: pack as any,
      userId: txData.user_id,
    });

    if (fapshiRes.transId) {
      await adminDb.from("transactions")
        .update({ provider_transaction_id: fapshiRes.transId })
        .eq("reference", newRef);
    }

    if (fapshiRes.paymentUrl) {
      return NextResponse.redirect(fapshiRes.paymentUrl);
    }
    
    return NextResponse.redirect(new URL(`/payment-verify?status=error&ref=${newRef}`, request.url));
  } catch (err) {
    console.error("[Fapshi Retry Error]:", err);
    return NextResponse.redirect(new URL(`/payment-verify?status=error&ref=${newRef}`, request.url));
  }
}

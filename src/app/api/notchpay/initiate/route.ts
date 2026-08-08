import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { initiateNotchPayPayment } from "@/lib/notchpay";
import { randomUUID } from "crypto";
import { PACK_CONFIGS, PackType } from "@/utils/subscriptionEngine";
import { PACK_PRICES } from "@/lib/fapshi";
export async function POST(request: Request) {
  try {
    const { pack } = await request.json();

    const packKey = pack as PackType;

    if (!pack || !PACK_CONFIGS[packKey]) {
      return NextResponse.json({ error: "Pack invalide." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé. Veuillez vous connecter." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    const amount = PACK_PRICES[packKey] || 10000;
    // Generate a unique reference for the transaction
    const reference = `notchpay_${randomUUID().replace(/-/g, "").substring(0, 16)}`;

    // Ensure we have a valid return URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    // Initiate payment with Notch Pay
    const payload = {
      email: user.email || "",
      currency: "XAF",
      amount: amount,
      reference: reference,
      description: `Souscription au ${PACK_CONFIGS[packKey].name}`,
      callback: `${baseUrl}/dashboard/payments?status=check&ref=${reference}&pack=${packKey}`
    };
    
    // In Notch Pay API, the initialization returns a checkout URL (authorization_url)
    const responseData = await initiateNotchPayPayment(payload);

    if (responseData.status === "Accepted" || responseData.authorization_url) {
      // Create transaction in database BEFORE redirecting to ensure we track it
      const { error: insertError } = await supabase.from("transactions").insert({
        user_id: user.id,
        amount: amount,
        currency: "XAF",
        provider: "notchpay",
        provider_transaction_id: responseData.transaction?.reference || reference,
        reference: reference,
        status: "pending",
        pack: pack
      });

      if (insertError) {
        console.error("Error creating transaction in DB:", insertError);
        return NextResponse.json({ error: "Erreur lors de la création de la transaction." }, { status: 500 });
      }

      return NextResponse.json({ 
        paymentUrl: responseData.authorization_url, 
        reference: reference 
      });
    } else {
      console.error("Notch Pay initiation failed:", responseData);
      return NextResponse.json({ error: "Erreur lors de l'initialisation du paiement avec Notch Pay." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Notch Pay Initiate Error:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur interne." }, { status: 500 });
  }
}

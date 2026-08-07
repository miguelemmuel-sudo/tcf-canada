export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { getFapshiPaymentStatus } from "@/lib/fapshi";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET(request: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;

  if (!ref) {
    return NextResponse.json({ error: "Identifiant de transaction manquant." }, { status: 400 });
  }

  try {
    const adminDb = getAdminSupabase();
    if (!adminDb) {
      return NextResponse.json({ error: "Base de données non disponible." }, { status: 500 });
    }

    // 1. Chercher la transaction dans la base de données
    const { data: tx } = await adminDb
      .from("transactions")
      .select("*")
      .or(`reference.eq.${ref},provider_transaction_id.eq.${ref}`)
      .limit(1)
      .maybeSingle();

    if (!tx) {
      return NextResponse.json({ 
        success: false,
        status: "pending", 
        message: "Transaction introuvable ou en cours d'enregistrement." 
      }, { status: 200 }); // We return 200 so the frontend can poll
    }

    const localStatus = tx.status;
    let finalStatus = localStatus;

    // 2. Si la transaction n'est pas encore terminée, on tente une vérification active (Server-to-Server)
    if (localStatus !== "completed") {
      const provider = tx.provider?.toLowerCase() || "";
      
      if (provider === "fapshi" && tx.provider_transaction_id) {
        try {
          const fapshiStatus = await getFapshiPaymentStatus(tx.provider_transaction_id);
          
          if (fapshiStatus.status === "SUCCESSFUL") {
            finalStatus = "completed";
            // Déclencher le webhook manuellement pour accélérer et l'attendre pour éviter les race conditions
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://griffondortcfcanada.com";
            try {
              await fetch(`${baseUrl}/api/webhooks/fapshi`, {
                method: "POST",
                headers: { 
                  "Content-Type": "application/json",
                  "x-wh-secret": process.env.FAPSHI_WEBHOOK_SECRET || "123@Miguel"
                },
                body: JSON.stringify({
                  transId: fapshiStatus.transId,
                  status: "SUCCESSFUL",
                  amount: fapshiStatus.amount,
                  email: fapshiStatus.email || "",
                  externalId: fapshiStatus.externalId || ref
                })
              });
            } catch(e) {
              console.error("Webhook trigger failed", e);
            }
          } else if (fapshiStatus.status === "FAILED") {
            finalStatus = "failed";
          }
        } catch (e) {
          console.error("Fapshi double check failed:", e);
        }
      } else if (provider === "notchpay" && tx.provider_transaction_id) {
        try {
          const { verifyNotchPayPayment } = await import("@/lib/notchpay");
          const notchPayStatus = await verifyNotchPayPayment(tx.provider_transaction_id);
          
          if (notchPayStatus?.transaction?.status === "complete") {
            finalStatus = "completed";
            // Déclencher le webhook manuellement pour accélérer
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://griffondortcfcanada.com";
            try {
              await fetch(`${baseUrl}/api/webhooks/notchpay`, {
                method: "POST",
                headers: { 
                  "Content-Type": "application/json",
                  "x-notchpay-signature": "manual-trigger" 
                },
                body: JSON.stringify({
                  event: "payment.complete",
                  data: {
                    reference: tx.reference,
                    status: "complete",
                    amount: tx.amount
                  }
                })
              });
            } catch(e) {
              console.error("Notch Pay manual webhook trigger failed", e);
            }
          } else if (notchPayStatus?.transaction?.status === "failed" || notchPayStatus?.transaction?.status === "canceled") {
            finalStatus = "failed";
          }
        } catch (e) {
          console.error("Notch Pay active check failed:", e);
        }
      }
    }

    return NextResponse.json({
      success: true,
      transId: tx.provider_transaction_id || ref,
      status: finalStatus,
      localStatus: localStatus,
      amount: tx.amount,
      provider: tx.provider,
      pack: tx.pack
    }, { status: 200 });

  } catch (err: any) {
    console.error(`[Transaction Status Check Error] ref=${ref}:`, err.message);
    return NextResponse.json({ error: err.message || "Erreur lors de la vérification du statut." }, { status: 500 });
  }
}

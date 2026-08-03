import { NextResponse } from "next/server";
import { getFapshiPaymentStatus } from "@/lib/fapshi";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

/**
 * Route de vérification du statut Fapshi
 * Domaine : https://griffondortcfcanada.com
 * Administrateur réseau : Miguel
 */

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET(request: Request, { params }: { params: Promise<{ transId: string }> }) {
  const { transId } = await params;

  if (!transId) {
    return NextResponse.json({ error: "Identifiant de transaction (transId) manquant." }, { status: 400 });
  }

  try {
    const adminDb = getAdminSupabase();
    let realTransId = transId;
    let localStatus = null;

    if (adminDb) {
      const { data: tx } = await adminDb
        .from("transactions")
        .select("provider_transaction_id, status")
        .or(`provider_transaction_id.eq.${transId},reference.eq.${transId}`)
        .limit(1)
        .maybeSingle();
      
      if (tx) {
        if (tx.provider_transaction_id) {
          realTransId = tx.provider_transaction_id;
        }
        localStatus = tx.status;
      }
    }

    // Appel à l'API Fapshi pour vérifier le statut réel avec le vrai transId
    const statusData = await getFapshiPaymentStatus(realTransId);



    return NextResponse.json({
      success: true,
      transId: statusData.transId,
      status: statusData.status,
      localStatus: localStatus,
      amount: statusData.amount,
      message: statusData.message,
    }, { status: 200 });

  } catch (err: any) {
    console.error(`[Fapshi Status Check Error] transId=${transId}:`, err.message);
    return NextResponse.json({ error: err.message || "Erreur lors de la vérification du statut." }, { status: 500 });
  }
}

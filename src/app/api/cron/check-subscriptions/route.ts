import { NextResponse } from "next/server";
import { runSubscriptionLifecycleCheck } from "@/utils/subscriptionCronEngine";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function GET(request: Request) {
  try {
    // 1. Sécurité du Cron : Vérification de l'en-tête d'autorisation ou de la clé secrète Vercel
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Si un CRON_SECRET est configuré sur Vercel, on exige une stricte correspondance
      return NextResponse.json({ error: "Unauthorized Cron Execution" }, { status: 401 });
    }

    const adminDb = getAdminSupabase();
    if (!adminDb) {
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 });
    }

    // 2. Exécuter la vérification des abonnements (expirations et rappels J-7, J-3, J-1)
    const stats = await runSubscriptionLifecycleCheck(adminDb);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: stats
    }, { status: 200 });

  } catch (err: any) {
    console.error("[API Cron Check Subscriptions Error]", err);
    return NextResponse.json({ error: err.message || "Internal Server Error during Cron Execution" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}

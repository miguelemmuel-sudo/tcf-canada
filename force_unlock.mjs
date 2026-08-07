import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function unlockUser() {
  console.log("Looking for pending Chariow transactions...");
  const { data: txList, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('provider', 'Chariow')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (error || !txList || txList.length === 0) {
    console.log("No pending transactions found.");
    return;
  }
  
  for (const tx of txList) {
    console.log("Fixing transaction:", tx.reference, "for user", tx.user_id);
    const nowIso = new Date().toISOString();
    
    // 1. Create subscription
    const { data: sub } = await supabase.from('subscriptions').upsert({
      user_id: tx.user_id,
      pack: tx.pack,
      plan: tx.pack,
      amount: tx.amount,
      currency: "XAF",
      status: "active",
      started_at: nowIso,
      expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      created_at: nowIso,
      updated_at: nowIso,
    }, { onConflict: 'user_id' }).select("id").single();
    
    // 2. Update profile
    await supabase.from("profiles")
      .update({ subscription_type: tx.pack, updated_at: nowIso })
      .eq("id", tx.user_id);

    // 3. Update transaction
    await supabase.from("transactions").update({
      status: "completed",
      webhook_status: "processed",
      paid_at: nowIso,
      subscription_id: sub?.id,
      updated_at: nowIso,
    }).eq("id", tx.id);
    
    console.log("Unlocked user", tx.user_id, "with pack", tx.pack);
  }
}

unlockUser();

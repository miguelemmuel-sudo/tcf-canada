import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function fixLatestPending() {
  console.log("Looking for the latest pending Chariow transaction...");
  const { data: txList, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('provider', 'Chariow')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1);
    
  if (error) {
    console.error("Error reading transactions:", error);
    return;
  }
  
  if (!txList || txList.length === 0) {
    console.log("No pending Chariow transactions found. Maybe it's already completed?");
    
    const { data: txListComp } = await supabase
    .from('transactions')
    .select('*')
    .eq('provider', 'Chariow')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1);
    if(txListComp && txListComp.length > 0) {
        console.log("Latest completed Chariow transaction:", txListComp[0].reference, "user:", txListComp[0].user_id);
    }
    return;
  }
  
  const tx = txList[0];
  console.log("Found pending transaction:", tx.reference, "for user", tx.user_id, "amount", tx.amount);
  
  console.log("Simulating Chariow Webhook SUCCESS...");
  const payload = {
    status: "SUCCESSFUL",
    amount: tx.amount,
    customer_email: "candidat@griffondor.com",
    reference: tx.reference,
    transaction_id: tx.provider_transaction_id || tx.reference,
    metadata: {
      user_id: tx.user_id,
      pack: tx.pack
    }
  };

  const response = await fetch("http://localhost:3000/api/webhooks/chariow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  console.log("Webhook response status:", response.status);
  const text = await response.text();
  console.log("Webhook response body:", text);
}

fixLatestPending();

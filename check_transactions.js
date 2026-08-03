const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);
  
  console.log("\nRecent Subscriptions:");
  subs?.forEach(s => {
    console.log(JSON.stringify(s));
  });

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Recent Transactions:");
    data.forEach(tx => {
      console.log(`- Ref: ${tx.reference} | ProviderTxId: ${tx.provider_transaction_id} | Status: ${tx.status} | Pack: ${tx.pack} | Date: ${tx.created_at}`);
    });
  }

  const { data: logs } = await supabase
    .from("payment_logs")
    .select("*")
    .in("event_type", ["webhook_processed_completed", "webhook_received", "webhook_error"])
    .order("created_at", { ascending: false })
    .limit(10);
  
  console.log("\nRecent Webhook Logs:");
  logs?.forEach(l => {
    console.log(`- Event: ${l.event_type} | Ref: ${l.transaction_reference} | Payload: ${JSON.stringify(l.payload)}`);
  });
}

check();

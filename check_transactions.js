const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
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
      console.log(`- Ref: ${tx.reference} | Status: ${tx.status} | Pack: ${tx.pack} | Amount: ${tx.amount} | Date: ${tx.created_at}`);
    });
  }

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);
  
  console.log("\nRecent Subscriptions:");
  subs?.forEach(s => {
    console.log(`- Pack: ${s.pack} | Status: ${s.status} | Expires: ${s.expires_at}`);
  });
}

check();

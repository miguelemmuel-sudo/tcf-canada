const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');
const env = {};
for (const line of lines) {
  if (line && line.includes('=')) {
    const parts = line.split('=');
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function run() {
  const email = `test_admin_${Date.now()}@example.com`;
  console.log("Testing RPC register_user_direct...");
  const t0 = Date.now();
  
  const { data: rpcData, error: rpcError } = await supabase.rpc("register_user_direct", {
    p_email: email,
    p_password: "password123",
    p_first_name: "Test",
    p_last_name: "User",
    p_sub_type: "standard"
  });
  console.log("RPC took:", Date.now() - t0, "ms");
  console.log("RPC Data:", rpcData);
  console.log("RPC Error:", rpcError);
}

run().catch(console.error);

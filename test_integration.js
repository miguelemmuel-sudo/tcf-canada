const fs = require('fs');

function loadEnv() {
  const content = fs.readFileSync('.env.local', 'utf8');
  content.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        process.env[key] = value;
      }
    }
  });
}
loadEnv();

const { createClient } = require('@supabase/supabase-js');

async function verify() {
  console.log("=== VÉRIFICATION SUPABASE ===");
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.log("❌ Clés Supabase manquantes");
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      if (error) {
        console.log("❌ Erreur de connexion Supabase:", error.message);
      } else {
        console.log("✅ Connexion Supabase réussie (profils trouvés: " + (data ? data.length : 0) + ")");
      }
    }
  } catch (e) {
    console.log("❌ Exception Supabase:", e.message);
  }

  console.log("\n=== VÉRIFICATION FAPSHI API ===");
  try {
    const apiUser = process.env.FAPSHI_API_USER;
    const apiKey = process.env.FAPSHI_API_KEY;
    
    const res = await fetch("https://live.fapshi.com/payment-status/test_connexion_123", {
      headers: {
        apiuser: apiUser,
        apikey: apiKey
      }
    });
    const json = await res.json();
    console.log("Code HTTP:", res.status);
    console.log("Réponse:", json);
    if (res.status === 401 || res.status === 403) {
      console.log("❌ Clés Fapshi invalides ou non autorisées");
    } else {
      console.log("✅ Clés Fapshi acceptées par le serveur (Erreur de transaction attendue, mais Auth OK)");
    }
  } catch (e) {
    console.log("❌ Exception Fapshi:", e.message);
  }
}

verify();

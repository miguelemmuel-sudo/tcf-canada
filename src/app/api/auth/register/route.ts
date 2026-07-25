import { NextResponse } from "next/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  console.log("[Register API] SUPABASE_URL présent:", !!url);
  console.log("[Register API] SERVICE_ROLE_KEY présent:", !!key, "| longueur:", key.length);
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, subscription_type } = body;

    console.log("[Register API] Tentative inscription pour:", email, "| pack:", subscription_type);

    if (!email || !password) {
      return NextResponse.json(
        { error: "L'e-mail et le mot de passe sont requis." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const adminSupabase = getAdminSupabase();

    if (!adminSupabase) {
      console.error("[Register API] CRITIQUE: SUPABASE_SERVICE_ROLE_KEY non définie sur Vercel.");
      return NextResponse.json(
        { error: "Configuration serveur incomplète: clé SUPABASE_SERVICE_ROLE_KEY manquante. Veuillez contacter l'administrateur." },
        { status: 500 }
      );
    }

    // Création du compte avec email_confirm: true (pas d'email envoyé, pas de confirmation requise)
    const { data, error: adminError } = await adminSupabase.auth.admin.createUser({
      email: cleanEmail,
      password,
      user_metadata: {
        full_name: name || "",
        subscription_type: subscription_type || "griffon",
      },
      email_confirm: true,
    });

    if (adminError) {
      console.error("[Register API] Erreur admin createUser:", JSON.stringify(adminError));
      const lowerMsg = (adminError.message || "").toLowerCase();

      if (
        lowerMsg.includes("already exists") ||
        lowerMsg.includes("already registered") ||
        lowerMsg.includes("unique constraint") ||
        lowerMsg.includes("user_exists")
      ) {
        return NextResponse.json(
          { error: "Cette adresse e-mail est déjà associée à un compte TCF Canada. Veuillez vous connecter." },
          { status: 400 }
        );
      }
      if (lowerMsg.includes("password") || lowerMsg.includes("weak") || lowerMsg.includes("at least")) {
        return NextResponse.json(
          { error: "Le mot de passe est trop faible. Minimum 8 caractères." },
          { status: 400 }
        );
      }

      const errorMsg = adminError.message
        || `Erreur Supabase admin (code: ${adminError.status || "inconnu"})`;
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // Synchronisation du profil dans la table profiles
    if (data?.user) {
      try {
        await adminSupabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            email: cleanEmail,
            full_name: name || "",
            subscription_type: subscription_type || "griffon",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: "id" });
        console.log("[Register API] Profil synchronisé pour:", data.user.id);
      } catch (profileErr: any) {
        console.error("[Register API] Erreur sync profile:", profileErr?.message);
        // Non bloquant - le compte est créé
      }
    }

    console.log("[Register API] Inscription réussie pour:", cleanEmail);
    return NextResponse.json({ success: true, user: data?.user });

  } catch (err: any) {
    console.error("[Register API] Erreur globale:", err?.message, err?.stack);
    return NextResponse.json(
      { error: err?.message || "Erreur interne du serveur. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

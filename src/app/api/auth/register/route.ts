import { NextResponse } from "next/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, subscription_type } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "L'e-mail et le mot de passe sont requis." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const adminSupabase = getAdminSupabase();

    // 1. Si la clé Service Role est disponible, on crée directement le compte avec l'e-mail confirmé
    // Cela évite tout envoi d'e-mail de confirmation par Supabase et contourne les erreurs Resend/SMTP (550 5.7.1)
    if (adminSupabase) {
      const { data, error: adminError } = await adminSupabase.auth.admin.createUser({
        email: cleanEmail,
        password,
        user_metadata: {
          full_name: name || "",
          subscription_type: subscription_type || "griffon",
        },
        email_confirm: true, // Désactive la confirmation par e-mail et confirme immédiatement le compte !
      });

      if (adminError) {
        const lowerMsg = adminError.message?.toLowerCase() || "";
        if (
          lowerMsg.includes("already exists") ||
          lowerMsg.includes("already registered") ||
          lowerMsg.includes("unique constraint") ||
          lowerMsg.includes("user_exists")
        ) {
          return NextResponse.json(
            { error: "Cette adresse e-mail est déjà associée à un compte TCF Canada." },
            { status: 400 }
          );
        }
        if (lowerMsg.includes("password") || lowerMsg.includes("weak") || lowerMsg.includes("at least")) {
          return NextResponse.json(
            { error: "Le mot de passe choisi est trop faible. Veuillez choisir un mot de passe d'au moins 8 caractères." },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: adminError.message || "Erreur lors de la création du compte administrateur/candidat." },
          { status: 400 }
        );
      }

      // S'assurer que le profil est bien créé/synchronisé dans la table profiles
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
        } catch (profileErr) {
          console.error("Erreur sync profile post-admin createUser:", profileErr);
        }
      }

      return NextResponse.json({ success: true, user: data?.user });
    }

    // 2. Fallback si la clé Service Role est absente : inscription standard via Supabase SSR
    const supabase = await createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: name || "",
          subscription_type: subscription_type || "griffon",
        },
      },
    });

    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message || "Erreur lors de l'inscription standard." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, user: data?.user });
  } catch (err: any) {
    console.error("Erreur globale dans /api/auth/register:", err);
    return NextResponse.json(
      { error: err?.message || "Erreur interne du serveur lors de l'inscription." },
      { status: 500 }
    );
  }
}

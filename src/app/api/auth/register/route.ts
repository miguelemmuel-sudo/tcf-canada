import { NextResponse } from "next/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

const SERVER_PRICING: Record<string, { amount: number; name: string; currency: string }> = {
  standard: { amount: 15000, name: "Pack Standard", currency: "FCFA" },
  griffon: { amount: 25000, name: "Pack Griffon D'OR", currency: "FCFA" },
  vip: { amount: 100000, name: "Pack VIP & Coaching", currency: "FCFA" }
};

const ADMIN_EMAILS = [
  "emmuel.proreseau@gmail.com", "joumefiomiguel@gmail.com", "miguelemmuel@gmail.com",
  "admin.miguel@griffondor.com", "miguel.admin@griffondor.com", "admin@griffondor.com", "miguel@griffondor.com"
];

function errorToString(err: unknown): string {
  if (!err) return "Erreur inconnue.";
  if (typeof err === "string" && err.trim()) return err.trim();
  if (typeof err === "object") {
    const e = err as Record<string, unknown>;
    if (typeof e.message === "string" && e.message.trim()) return e.message.trim();
    if (typeof e.msg === "string" && e.msg.trim()) return e.msg.trim();
    if (typeof e.error_description === "string" && e.error_description.trim()) return e.error_description.trim();
  }
  return "Une erreur est survenue. Veuillez réessayer.";
}

export async function POST(request: Request) {
  // ── 1. Lecture du corps de la requête ──
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de la requête invalide." }, { status: 400 });
  }

  const { email, password, name, pack } = body as {
    email?: string; password?: string; name?: string; pack?: string;
  };

  // ── 2. Validation des champs ──
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Adresse e-mail invalide ou manquante." }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
  }
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Le nom complet est requis." }, { status: 400 });
  }
  if (!pack || typeof pack !== "string") {
    return NextResponse.json({ error: "Veuillez sélectionner un pack." }, { status: 400 });
  }

  const cleanEmail = email.toLowerCase().trim();
  // Normalise le pack : accepte les variantes communes
  const packKeyRaw = pack.toLowerCase().trim();
  const packAliases: Record<string, string> = {
    "griffon": "griffon",
    "griffon d'or": "griffon",
    "griffondor": "griffon",
    "gold": "griffon",
    "standard": "standard",
    "basique": "standard",
    "basic": "standard",
    "vip": "vip",
    "coaching": "vip",
    "vip & coaching": "vip",
  };
  const packKey = packAliases[packKeyRaw] || packKeyRaw;
  const packConfig = SERVER_PRICING[packKey];
  const isAdmin = ADMIN_EMAILS.includes(cleanEmail);

  if (!packConfig) {
    console.error("[Register API] Pack non reconnu:", pack, "→ packKey:", packKey);
    return NextResponse.json({ error: `Pack "${pack}" non reconnu. Packs disponibles : standard, griffon, vip.` }, { status: 400 });
  }

  // ── 3. Vérification des variables d'environnement ──
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  console.log("[Register API] Env check - URL:", !!supabaseUrl, "SERVICE_KEY:", !!serviceKey, "ANON_KEY:", !!anonKey);

  if (!supabaseUrl) {
    return NextResponse.json({ error: "Configuration serveur incomplète (URL Supabase manquante)." }, { status: 500 });
  }

  // ── 4. Client Supabase admin (SERVICE_ROLE_KEY prioritaire) ──
  const keyToUse = serviceKey || anonKey;
  if (!keyToUse) {
    return NextResponse.json({ error: "Configuration serveur incomplète (clé Supabase manquante)." }, { status: 500 });
  }

  const supabase = createSupabaseJsClient(supabaseUrl, keyToUse, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  try {
    let userId: string;

    // ── Tentative avec service_role (admin) si la clé est disponible ──
    let adminSuccess = false;
    if (serviceKey) {
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: cleanEmail,
          password,
          user_metadata: { full_name: name, subscription_type: isAdmin ? "vip" : packKey },
          email_confirm: true,
        });

        if (authError) {
          const msg = errorToString(authError);
          const lower = msg.toLowerCase();
          if (lower.includes("already") || lower.includes("exists") || lower.includes("registered") || lower.includes("user_exists")) {
            return NextResponse.json({
              error: "Cette adresse e-mail est déjà utilisée. Veuillez vous connecter."
            }, { status: 400 });
          }
          if (lower.includes("password") || lower.includes("weak")) {
            return NextResponse.json({
              error: "Mot de passe trop faible. Utilisez au moins 8 caractères avec lettres et chiffres."
            }, { status: 400 });
          }
          // Si l'erreur admin n'est pas fatale (ex: clé service invalide), on tombe dans le fallback
          console.warn("[Register API] Admin createUser échoué, bascule sur signUp:", msg);
        } else if (authData?.user?.id) {
          userId = authData.user.id;
          adminSuccess = true;
        }
      } catch (adminErr) {
        // Erreur inattendue avec l'API admin → fallback signUp
        console.warn("[Register API] Erreur admin API, bascule sur signUp:", errorToString(adminErr));
      }
    }

    // ── MODE FALLBACK : signUp standard (ANON KEY ou si admin a échoué) ──
    if (!adminSuccess) {
      const supabaseFallback = anonKey
        ? createSupabaseJsClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
        : supabase;

      const { data: signUpData, error: signUpError } = await supabaseFallback.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { full_name: name, subscription_type: isAdmin ? "vip" : packKey } }
      });

      if (signUpError) {
        const msg = errorToString(signUpError);
        const lower = msg.toLowerCase();
        if (lower.includes("already") || lower.includes("exists") || lower.includes("registered") || lower.includes("user_exists")) {
          return NextResponse.json({
            error: "Cette adresse e-mail est déjà utilisée. Veuillez vous connecter."
          }, { status: 400 });
        }
        if (lower.includes("rate limit") || lower.includes("too many")) {
          return NextResponse.json({
            error: "Trop de tentatives. Veuillez patienter quelques minutes."
          }, { status: 429 });
        }
        console.error("[Register API] signUp error:", msg);
        return NextResponse.json({ error: msg }, { status: 400 });
      }

      if (!signUpData?.user?.id) {
        // L'e-mail existe déjà mais Supabase retourne identityData vide (comportement connu)
        return NextResponse.json({
          error: "Cette adresse e-mail est peut-être déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse."
        }, { status: 400 });
      }

      userId = signUpData.user.id;
    }

    const now = new Date().toISOString();

    // ── 5. Profil utilisateur ──
    try {
      await supabase.from("profiles").upsert({
        id: userId,
        email: cleanEmail,
        full_name: name,
        subscription_type: isAdmin ? "vip" : packKey,
        is_admin: isAdmin,
        created_at: now,
        updated_at: now,
      }, { onConflict: "id" });
    } catch (e) {
      console.error("[Register API] Profil error (non-bloquant):", errorToString(e));
    }

    // ── 6. Admin → retour immédiat sans paiement ──
    if (isAdmin) {
      try {
        await supabase.from("subscriptions").insert({
          user_id: userId,
          pack: "vip",
          amount: "0",
          currency: "FCFA",
          status: "active",
          started_at: now,
          expires_at: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
          created_at: now,
          updated_at: now
        });
      } catch (e) {
        console.error("[Register API] Admin subscription error:", errorToString(e));
      }
      return NextResponse.json({ success: true, admin: true, user: { id: userId, email: cleanEmail } });
    }

    // ── 7. Abonnement en attente ──
    let subscriptionId: string | null = null;
    try {
      const { data: subData } = await supabase.from("subscriptions").insert({
        user_id: userId,
        pack: packKey,
        amount: packConfig.amount.toString(),
        currency: packConfig.currency,
        status: "pending",
        started_at: null,
        expires_at: null,
        created_at: now,
        updated_at: now
      }).select("id").single();
      subscriptionId = subData?.id || null;
    } catch (e) {
      console.error("[Register API] Subscription error:", errorToString(e));
    }

    // ── 8. Transaction en attente ──
    const reference = `TCF_${userId.slice(0, 8)}_${Date.now()}`;
    try {
      await supabase.from("transactions").insert({
        user_id: userId,
        subscription_id: subscriptionId,
        provider: "Fapshi",
        amount: packConfig.amount.toString(),
        currency: packConfig.currency,
        reference,
        status: "pending",
        webhook_status: "unprocessed",
        payment_method: "Agregateur_Fapshi",
        created_at: now
      });
    } catch (e) {
      console.error("[Register API] Transaction error:", errorToString(e));
    }

    // ── 9. Initiation Fapshi ──
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      || request.headers.get("origin")
      || "https://tcf-canada-olive.vercel.app";
    const redirectUrl = `${baseUrl}/dashboard/payments?status=check&ref=${reference}&pack=${packKey}`;

    try {
      const { initiatePay } = await import("@/lib/fapshi");
      const fapshiRes = await initiatePay({
        amount: packConfig.amount,
        email: cleanEmail,
        redirectUrl,
        userId,
        externalId: reference,
        message: `Abonnement ${packConfig.name} - TCF Canada Pro`
      });

      if (fapshiRes.transId) {
        try {
          await supabase.from("transactions")
            .update({ provider_transaction_id: fapshiRes.transId })
            .eq("reference", reference);
        } catch (e) {
          console.error("[Register API] Fapshi transId update error:", errorToString(e));
        }
      }

      return NextResponse.json({
        success: true,
        link: fapshiRes.link,
        transId: fapshiRes.transId,
        reference,
        user: { id: userId, email: cleanEmail }
      });

    } catch (fapshiErr: unknown) {
      console.error("[Register API] Fapshi error:", errorToString(fapshiErr));
      // Compte créé — on redirige vers paiement manuel
      return NextResponse.json({
        success: true,
        link: null,
        redirectTo: `/dashboard/payments?pack=${packKey}&initiate=true`,
        user: { id: userId, email: cleanEmail },
        message: "Compte créé. Veuillez finaliser le paiement."
      });
    }

  } catch (err: unknown) {
    const msg = errorToString(err);
    console.error("[Register API] Erreur globale:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

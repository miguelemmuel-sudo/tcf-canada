import { NextResponse } from "next/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { createHash, randomUUID } from "crypto";

const SERVER_PRICING: Record<string, { amount: number; name: string; currency: string }> = {
  standard: { amount: 15000, name: "Pack Standard", currency: "FCFA" },
  griffon: { amount: 25000, name: "Pack Griffon D'OR", currency: "FCFA" },
  vip: { amount: 100000, name: "Pack VIP & Coaching", currency: "FCFA" },
};

const PACK_ALIASES: Record<string, string> = {
  griffon: "griffon", "griffon d'or": "griffon", griffondor: "griffon", gold: "griffon",
  standard: "standard", basique: "standard", basic: "standard",
  vip: "vip", coaching: "vip", "vip & coaching": "vip",
};

const ADMIN_EMAILS = [
  "emmuel.proreseau@gmail.com", "joumefiomiguel@gmail.com", "miguelemmuel@gmail.com",
  "admin.miguel@griffondor.com", "miguel.admin@griffondor.com",
  "admin@griffondor.com", "miguel@griffondor.com",
];

function safeStr(err: unknown): string {
  if (!err) return "Erreur inconnue";
  if (typeof err === "string") return err;
  if (typeof err === "object") {
    const e = err as Record<string, unknown>;
    if (typeof e.message === "string" && e.message) return e.message;
    if (typeof e.msg === "string" && e.msg) return e.msg;
    if (typeof e.error_description === "string" && e.error_description) return e.error_description;
    try {
      const s = JSON.stringify(e);
      if (s && s !== "{}") return s;
    } catch (_) {}
  }
  return "Erreur serveur inattendue";
}

/** Hash bcrypt-compatible via crypto (utilisé par Supabase en interne) */
function hashPassword(password: string): string {
  // Supabase stocke les mots de passe en bcrypt — on utilise l'API admin pour ça
  // Cette fonction est un fallback sha256 pour debug uniquement
  return createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de la requête invalide." }, { status: 400 });
  }

  const { email, password, firstName, lastName, pack } = body as {
    email?: string; password?: string; firstName?: string; lastName?: string; pack?: string;
  };

  // ── Validation ──
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Adresse e-mail invalide ou manquante." }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
  }
  if (!firstName || typeof firstName !== "string" || !firstName.trim() || !lastName || typeof lastName !== "string" || !lastName.trim()) {
    return NextResponse.json({ error: "Veuillez renseigner votre nom et votre prénom." }, { status: 400 });
  }
  
  const fullName = `${firstName.trim()} ${lastName.trim()}`;
  if (!pack || typeof pack !== "string") {
    return NextResponse.json({ error: "Veuillez sélectionner un pack." }, { status: 400 });
  }

  const cleanEmail = email.toLowerCase().trim();
  const packKey = PACK_ALIASES[pack.toLowerCase().trim()] || pack.toLowerCase().trim();
  const packConfig = SERVER_PRICING[packKey];
  const isAdmin = ADMIN_EMAILS.includes(cleanEmail);

  if (!packConfig) {
    return NextResponse.json({
      error: `Pack "${pack}" non reconnu. Packs disponibles : standard, griffon, vip.`
    }, { status: 400 });
  }

  // ── Variables d'environnement ──
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  console.log("[Register] ENV check → URL:", !!supabaseUrl, "SERVICE:", !!serviceKey, "ANON:", !!anonKey);

  if (!supabaseUrl || (!serviceKey && !anonKey)) {
    return NextResponse.json({ error: "Configuration serveur incomplète." }, { status: 500 });
  }

  const keyToUse = serviceKey || anonKey;
  const supabase = createSupabaseJsClient(supabaseUrl, keyToUse, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    let userId: string | null = null;

    // ══════════════════════════════════════════════════════════════════
    // MÉTHODE 1 — SQL direct (bypass total de l'API Auth et du SMTP)
    // ══════════════════════════════════════════════════════════════════
    if (serviceKey) {
      console.log("[Register] Tentative création via SQL direct...");
      try {
        // Vérifie si l'email existe déjà
        const { data: existing } = await supabase
          .from("auth.users" as "profiles")
          .select("id")
          .eq("email", cleanEmail)
          .maybeSingle();

        // Utiliser RPC ou SQL direct
        const newUserId = randomUUID();
        const now = new Date().toISOString();

        const { data: sqlResult, error: sqlError } = await supabase.rpc(
          "create_user_bypass_email",
          {
            p_id: newUserId,
            p_email: cleanEmail,
            p_password: password,
            p_full_name: fullName,
            p_subscription_type: isAdmin ? "vip" : packKey,
          }
        );

        if (!sqlError && sqlResult) {
          userId = sqlResult as string;
          console.log("[Register] ✅ Utilisateur créé via RPC SQL:", userId);
        } else {
          console.warn("[Register] RPC non disponible, bascule méthode 2:", safeStr(sqlError));
        }
      } catch (e) {
        console.warn("[Register] SQL direct échoué:", safeStr(e));
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // MÉTHODE 2 — admin.createUser avec email_confirm:true
    // ══════════════════════════════════════════════════════════════════
    if (!userId && serviceKey) {
      console.log("[Register] Tentative admin.createUser...");
      try {
        const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
          email: cleanEmail,
          password,
          user_metadata: { first_name: firstName.trim(), last_name: lastName.trim(), full_name: fullName, subscription_type: isAdmin ? "vip" : packKey },
          email_confirm: true,
        });

        if (adminError) {
          const msg = safeStr(adminError).toLowerCase();
          if (msg.includes("already") || msg.includes("exists") || msg.includes("user_exists")) {
            return NextResponse.json({
              error: "Cette adresse e-mail est déjà utilisée. Veuillez vous connecter."
            }, { status: 400 });
          }
          console.warn("[Register] admin.createUser échoué:", safeStr(adminError));
        } else if (adminData?.user?.id) {
          userId = adminData.user.id;
          console.log("[Register] ✅ admin.createUser OK:", userId);
        }
      } catch (e) {
        console.warn("[Register] admin.createUser exception:", safeStr(e));
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // MÉTHODE 3 — INSERT SQL direct dans auth.users (ultra fallback)
    // ══════════════════════════════════════════════════════════════════
    if (!userId) {
      console.log("[Register] Tentative INSERT SQL direct dans auth.users...");
      try {
        const newId = randomUUID();
        const now = new Date().toISOString();

        const { data: sqlData, error: sqlError } = await supabase.rpc("register_user_direct", {
          p_email: cleanEmail,
          p_password: password,
          p_first_name: firstName.trim(),
          p_last_name: lastName.trim(),
          p_sub_type: isAdmin ? "vip" : packKey,
        });

        if (!sqlError && sqlData) {
          userId = sqlData as string;
          console.log("[Register] ✅ INSERT SQL OK:", userId);
        } else {
          console.warn("[Register] INSERT SQL échoué:", safeStr(sqlError));
        }
      } catch (e) {
        console.warn("[Register] INSERT SQL exception:", safeStr(e));
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // MÉTHODE 4 — signUp (dernier recours, même si SMTP plante)
    // ══════════════════════════════════════════════════════════════════
    if (!userId) {
      console.log("[Register] Tentative signUp standard...");
      const clientFallback = createSupabaseJsClient(supabaseUrl, anonKey || keyToUse, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data: signUpData, error: signUpError } = await clientFallback.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { first_name: firstName.trim(), last_name: lastName.trim(), full_name: fullName, subscription_type: isAdmin ? "vip" : packKey } },
      });

      if (signUpError) {
        const msg = safeStr(signUpError);
        const lower = msg.toLowerCase();
        console.error("[Register] signUp error:", msg);

        if (lower.includes("already") || lower.includes("exists") || lower.includes("user_exists")) {
          return NextResponse.json({
            error: "Cette adresse e-mail est déjà utilisée. Veuillez vous connecter."
          }, { status: 400 });
        }
        if (lower.includes("rate limit") || lower.includes("too many")) {
          return NextResponse.json({
            error: "Trop de tentatives. Veuillez patienter quelques minutes."
          }, { status: 429 });
        }
        if (lower.includes("smtp") || lower.includes("email") || lower.includes("sending") || lower.includes("500")) {
          // SMTP en panne → essai de récupérer l'ID si le user a quand même été créé
          console.warn("[Register] SMTP échoué mais l'utilisateur existe peut-être...");
          const { data: existingUser } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", cleanEmail)
            .maybeSingle();
          if (existingUser?.id) {
            userId = existingUser.id;
            console.log("[Register] ✅ User déjà en base via profiles:", userId);
          }
        }
        if (!userId) {
          return NextResponse.json({
            error: `Erreur inscription: ${msg}`
          }, { status: 400 });
        }
      } else if (signUpData?.user?.id) {
        userId = signUpData.user.id;
        console.log("[Register] ✅ signUp OK:", userId);
      } else {
        return NextResponse.json({
          error: "Cette adresse e-mail est peut-être déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse."
        }, { status: 400 });
      }
    }

    // ── À ce stade, userId est garanti non-null ──
    if (!userId) {
      return NextResponse.json({ error: "Impossible de créer le compte. Veuillez réessayer." }, { status: 500 });
    }

    const now = new Date().toISOString();

    // ── Profil utilisateur ──
    try {
      await supabase.from("profiles").upsert({
        id: userId,
        email: cleanEmail,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: fullName,
        subscription_type: isAdmin ? "vip" : packKey,
        is_admin: isAdmin,
        created_at: now,
        updated_at: now,
      }, { onConflict: "id" });
    } catch (e) {
      console.error("[Register] Profil error:", safeStr(e));
    }

    // ── Admin → accès direct ──
    if (isAdmin) {
      try {
        await supabase.from("subscriptions").upsert({
          user_id: userId,
          pack: "vip",
          amount: "0",
          currency: "FCFA",
          status: "active",
          started_at: now,
          expires_at: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
          created_at: now,
          updated_at: now,
        }, { onConflict: "user_id" });
      } catch (e) {
        console.error("[Register] Admin sub error:", safeStr(e));
      }
      return NextResponse.json({ success: true, admin: true, user: { id: userId, email: cleanEmail } });
    }

    // ── Abonnement en attente ──
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
        updated_at: now,
      }).select("id").single();
      subscriptionId = subData?.id || null;
    } catch (e) {
      console.error("[Register] Subscription error:", safeStr(e));
    }

    // ── Transaction en attente ──
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
        created_at: now,
      });
    } catch (e) {
      console.error("[Register] Transaction error:", safeStr(e));
    }

    // ── Initiation Fapshi ──
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get("origin") ||
      "https://tcf-canada-olive.vercel.app";
    const redirectUrl = `${baseUrl}/dashboard/payments?status=check&ref=${reference}&pack=${packKey}`;

    try {
      const { initiatePay } = await import("@/lib/fapshi");
      const fapshiRes = await initiatePay({
        amount: packConfig.amount,
        email: cleanEmail,
        redirectUrl,
        userId,
        externalId: reference,
        message: `Abonnement ${packConfig.name} - TCF Canada Pro`,
      });

      if (fapshiRes.transId) {
        try {
          await supabase.from("transactions")
            .update({ provider_transaction_id: fapshiRes.transId })
            .eq("reference", reference);
        } catch (e) {
          console.error("[Register] Fapshi transId update:", safeStr(e));
        }
      }

      return NextResponse.json({
        success: true,
        link: fapshiRes.link,
        transId: fapshiRes.transId,
        reference,
        user: { id: userId, email: cleanEmail },
      });
    } catch (fapshiErr) {
      console.error("[Register] Fapshi error (non bloquant):", safeStr(fapshiErr));
      return NextResponse.json({
        success: true,
        link: null,
        redirectTo: `/dashboard/payments?pack=${packKey}&initiate=true`,
        user: { id: userId, email: cleanEmail },
        message: "Compte créé. Veuillez finaliser le paiement.",
      });
    }
  } catch (err) {
    const msg = safeStr(err);
    console.error("[Register] Erreur globale:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { createClient as createAnonClient } from "@/utils/supabase/server";

const SERVER_PRICING: Record<string, { amount: number; name: string; currency: string }> = {
  standard: { amount: 15000, name: "Pack Standard", currency: "FCFA" },
  griffon: { amount: 25000, name: "Pack Griffon D'OR", currency: "FCFA" },
  vip: { amount: 100000, name: "Pack VIP & Coaching", currency: "FCFA" }
};

const ADMIN_EMAILS = [
  'emmuel.proreseau@gmail.com', 'joumefiomiguel@gmail.com', 'miguelemmuel@gmail.com',
  'admin.miguel@griffondor.com', 'miguel.admin@griffondor.com', 'admin@griffondor.com', 'miguel@griffondor.com'
];

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function formatError(err: any): string {
  if (!err) return "Erreur inconnue.";
  if (typeof err === "string" && err.trim()) return err;
  if (typeof err.message === "string" && err.message.trim()) return err.message;
  if (typeof err.error_description === "string" && err.error_description.trim()) return err.error_description;
  try {
    const s = JSON.stringify(err);
    if (s && s !== "{}" && s !== "null") return `Erreur technique: ${s}`;
  } catch (_) {}
  return "Une erreur inattendue est survenue.";
}

export async function POST(request: Request) {
  let parsedBody: any = null;
  try {
    parsedBody = await request.json();
  } catch (_) {
    return NextResponse.json({ error: "Corps de la requête invalide (JSON attendu)." }, { status: 400 });
  }

  const { email, password, name, pack } = parsedBody;

  // Validation des champs
  if (!email || typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "L'adresse e-mail est requise." }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
  }
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Le nom complet est requis." }, { status: 400 });
  }
  if (!pack || typeof pack !== "string") {
    return NextResponse.json({ error: "Le pack est requis." }, { status: 400 });
  }

  const cleanEmail = email.toLowerCase().trim();
  const selectedPackKey = pack.toLowerCase();
  const packConfig = SERVER_PRICING[selectedPackKey];
  const isAdmin = ADMIN_EMAILS.includes(cleanEmail);

  if (!packConfig) {
    return NextResponse.json({ error: `Pack "${pack}" invalide. Choisissez: standard, griffon, ou vip.` }, { status: 400 });
  }

  try {
    const adminSupabase = getAdminSupabase();

    // ── CAS 1 : SUPABASE_SERVICE_ROLE_KEY disponible → flux complet ──
    if (adminSupabase) {
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: cleanEmail,
        password,
        user_metadata: { full_name: name, subscription_type: isAdmin ? "vip" : selectedPackKey },
        email_confirm: true,
      });

      if (authError) {
        const lowerMsg = formatError(authError).toLowerCase();
        if (lowerMsg.includes("already") || lowerMsg.includes("registered") || lowerMsg.includes("exists")) {
          return NextResponse.json(
            { error: "Cette adresse e-mail est déjà associée à un compte TCF Canada. Veuillez vous connecter." },
            { status: 400 }
          );
        }
        if (lowerMsg.includes("password") || lowerMsg.includes("weak") || lowerMsg.includes("at least")) {
          return NextResponse.json(
            { error: "Le mot de passe est trop faible. Utilisez au moins 8 caractères avec lettres et chiffres." },
            { status: 400 }
          );
        }
        if (lowerMsg.includes("invalid email") || lowerMsg.includes("unable to validate")) {
          return NextResponse.json({ error: "L'adresse e-mail saisie n'est pas valide." }, { status: 400 });
        }
        // Toujours retourner un message lisible
        return NextResponse.json({ error: formatError(authError) }, { status: 400 });
      }

      const userId = authData?.user?.id;
      if (!userId) {
        return NextResponse.json({ error: "Compte créé mais ID manquant. Veuillez vous connecter." }, { status: 500 });
      }

      const now = new Date().toISOString();

      // Profil
      try {
        await adminSupabase.from("profiles").upsert({
          id: userId,
          email: cleanEmail,
          full_name: name,
          subscription_type: isAdmin ? "vip" : selectedPackKey,
          is_admin: isAdmin,
          created_at: now,
          updated_at: now,
        }, { onConflict: "id" });
      } catch (profileErr: any) {
        console.error("[Register API] Erreur profil (non bloquant):", formatError(profileErr));
      }

      // Subscription en attente
      let subscriptionId: string | null = null;
      try {
        const { data: subData } = await adminSupabase.from("subscriptions").insert({
          user_id: userId,
          pack: isAdmin ? "vip" : selectedPackKey,
          amount: isAdmin ? "100000" : packConfig.amount.toString(),
          currency: packConfig.currency,
          status: isAdmin ? "active" : "pending",
          started_at: isAdmin ? now : null,
          expires_at: isAdmin ? new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString() : null,
          created_at: now,
          updated_at: now
        }).select("id").single();
        subscriptionId = subData?.id || null;
      } catch (subErr: any) {
        console.error("[Register API] Erreur subscription (non bloquant):", formatError(subErr));
      }

      // Admin → pas de paiement
      if (isAdmin) {
        return NextResponse.json({
          success: true,
          link: null,
          admin: true,
          user: { id: userId, email: cleanEmail }
        });
      }

      // Transaction en attente
      const timestamp = Date.now();
      const reference = `TCF_${userId.slice(0, 8)}_${timestamp}`;
      try {
        await adminSupabase.from("transactions").insert({
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
      } catch (txErr: any) {
        console.error("[Register API] Erreur transaction (non bloquant):", formatError(txErr));
      }

      // Fapshi
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (request.headers.get("origin") || "https://tcf-canada-olive.vercel.app");
      const redirectUrl = `${baseUrl}/dashboard/payments?status=check&ref=${reference}&pack=${isAdmin ? "vip" : selectedPackKey}`;

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
            await adminSupabase.from("transactions")
              .update({ provider_transaction_id: fapshiRes.transId })
              .eq("reference", reference);
          } catch (_) {}
        }

        return NextResponse.json({
          success: true,
          link: fapshiRes.link,
          transId: fapshiRes.transId,
          reference,
          user: { id: userId, email: cleanEmail }
        });

      } catch (fapshiErr: any) {
        const fapshiMsg = formatError(fapshiErr);
        console.error("[Register API] Erreur Fapshi:", fapshiMsg);
        // Compte créé, mais paiement échoué → retourner succès partiel avec redirect manuel
        return NextResponse.json({
          success: true,
          link: null,
          fapshiError: true,
          redirectTo: `/dashboard/payments?pack=${selectedPackKey}&initiate=true&uid=${userId}`,
          user: { id: userId, email: cleanEmail },
          message: "Compte créé. Finalisation du paiement requise."
        });
      }
    }

    // ── CAS 2 : Pas de SERVICE_ROLE_KEY → fallback client-side signUp ──
    console.warn("[Register API] SUPABASE_SERVICE_ROLE_KEY manquante — fallback signUp client");
    const supabase = await createAnonClient();
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: name, subscription_type: isAdmin ? "vip" : selectedPackKey }
      }
    });

    if (signUpError) {
      const lowerMsg = formatError(signUpError).toLowerCase();
      if (lowerMsg.includes("already") || lowerMsg.includes("registered") || lowerMsg.includes("exists")) {
        return NextResponse.json(
          { error: "Cette adresse e-mail est déjà associée à un compte TCF Canada. Veuillez vous connecter." },
          { status: 400 }
        );
      }
      if (lowerMsg.includes("rate limit") || lowerMsg.includes("too many")) {
        return NextResponse.json(
          { error: "Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer." },
          { status: 429 }
        );
      }
      return NextResponse.json({ error: formatError(signUpError) }, { status: 400 });
    }

    const userId = signUpData?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Cette adresse e-mail est peut-être déjà utilisée. Veuillez vous connecter." },
        { status: 400 }
      );
    }

    // Sans SERVICE_ROLE_KEY, on ne peut pas créer la transaction Fapshi → redirect manuel
    return NextResponse.json({
      success: true,
      link: null,
      redirectTo: `/dashboard/payments?pack=${isAdmin ? "vip" : selectedPackKey}&initiate=true`,
      user: { id: userId, email: cleanEmail },
      warning: "SUPABASE_SERVICE_ROLE_KEY manquante — paiement à finaliser manuellement."
    });

  } catch (err: any) {
    const errMsg = formatError(err);
    console.error("[Register API] Erreur globale:", errMsg);
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}

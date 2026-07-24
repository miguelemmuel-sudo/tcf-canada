import { SupabaseClient } from "@supabase/supabase-js";

export interface LifecycleStats {
  checked: number;
  expired: number;
  reminded7d: number;
  reminded3d: number;
  reminded1d: number;
  errors: number;
}

const PACK_NAMES: Record<string, string> = {
  standard: "Pack Standard",
  griffon: "Pack Griffon D'OR",
  vip: "Pack VIP & Coaching"
};

/**
 * Moteur principal de vérification du cycle de vie des abonnements
 * Gère l'expiration automatique et l'envoi des rappels de renouvellement (J-7, J-3, J-1)
 */
export async function runSubscriptionLifecycleCheck(adminDb: SupabaseClient): Promise<LifecycleStats> {
  const stats: LifecycleStats = {
    checked: 0,
    expired: 0,
    reminded7d: 0,
    reminded3d: 0,
    reminded1d: 0,
    errors: 0
  };

  try {
    const now = new Date();
    const nowIso = now.toISOString();

    // 1. Récupérer tous les abonnements actuellement marqués comme actifs
    const { data: activeSubs, error: subsError } = await adminDb
      .from("subscriptions")
      .select("*")
      .eq("status", "active")
      .not("expires_at", "is", null);

    if (subsError || !activeSubs) {
      console.error("[Lifecycle Engine Error] Erreur récupération abonnements:", subsError);
      return stats;
    }

    stats.checked = activeSubs.length;

    for (const sub of activeSubs) {
      try {
        const expiresAt = new Date(sub.expires_at);
        const timeDiffMs = expiresAt.getTime() - now.getTime();
        const daysRemaining = timeDiffMs / (1000 * 3600 * 24);
        const packName = PACK_NAMES[sub.pack] || "Abonnement TCF";
        const formattedExpiry = expiresAt.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        });

        // A. GESTION DE L'EXPIRATION AUTOMATIQUE (Si la date d'expiration est dépassée)
        if (daysRemaining <= 0) {
          // 1. Marquer l'abonnement comme expiré
          await adminDb
            .from("subscriptions")
            .update({ status: "expired", updated_at: nowIso })
            .eq("id", sub.id);

          // 2. Désactiver automatiquement les fonctionnalités premium (retour au profil standard)
          // Tout l'historique, les notes et progrès sont intégralement conservés dans Supabase
          await adminDb
            .from("profiles")
            .update({ subscription_type: "standard", updated_at: nowIso })
            .eq("id", sub.user_id);

          // 3. Notifier l'utilisateur
          const title = "Votre abonnement a expiré";
          const msg = `Votre période d'accès au ${packName} a pris fin le ${formattedExpiry}. Conformément à notre engagement, l'intégralité de vos progrès, résultats d'examens et données sont conservés. Renouvelez à tout moment pour réactiver instantanément vos corrections IA et fonctionnalités premium.`;

          await adminDb.from("notifications").insert({
            user_id: sub.user_id,
            title: title,
            message: msg,
            type: "renewal_reminder",
            is_read: false,
            created_at: nowIso
          });

          // Journalisation de l'expiration dans payment_logs
          await adminDb.from("payment_logs").insert({
            user_id: sub.user_id,
            transaction_reference: `SUB_EXPIRE_${sub.id}`,
            event_type: "status_check",
            payload: { action: "EXPIRED", pack: sub.pack, expiredAt: nowIso },
            created_at: nowIso
          });

          stats.expired++;
          continue;
        }

        // B. GESTION DES RAPPELS DE RENOUVELLEMENT (J-7, J-3, J-1)
        // Vérifions d'abord si une notification similaire n'a pas déjà été envoyée récemment
        const checkAndSendReminder = async (daysLabel: string, thresholdMin: number, thresholdMax: number, statKey: "reminded7d" | "reminded3d" | "reminded1d") => {
          if (daysRemaining > thresholdMin && daysRemaining <= thresholdMax) {
            // Vérifier dans les 48 dernières heures s'il y a déjà un rappel pour éviter le spam
            const fortyEightHoursAgo = new Date(now.getTime() - 48 * 3600 * 1000).toISOString();
            const { data: existingNotifs } = await adminDb
              .from("notifications")
              .select("id")
              .eq("user_id", sub.user_id)
              .eq("type", "renewal_reminder")
              .ilike("title", `%${daysLabel}%`)
              .gte("created_at", fortyEightHoursAgo);

            if (!existingNotifs || existingNotifs.length === 0) {
              const title = `Rappel (J-${daysLabel}) : Expiration de votre abonnement`;
              const msg = `Votre ${packName} expire dans ${Math.ceil(daysRemaining)} jour(s), le ${formattedExpiry}. Pour éviter toute interruption de vos corrections IA et simulations d'examen, vous pouvez renouveler votre accès dès maintenant depuis votre tableau de bord.`;

              await adminDb.from("notifications").insert({
                user_id: sub.user_id,
                title: title,
                message: msg,
                type: "renewal_reminder",
                is_read: false,
                created_at: nowIso
              });

              stats[statKey]++;
            }
          }
        };

        // Rappel J-7 (entre 6.0 et 7.0 jours restants)
        await checkAndSendReminder("7", 6.0, 7.0, "reminded7d");
        // Rappel J-3 (entre 2.0 et 3.0 jours restants)
        await checkAndSendReminder("3", 2.0, 3.0, "reminded3d");
        // Rappel J-1 (entre 0.0 et 1.0 jour restant)
        await checkAndSendReminder("1", 0.0, 1.0, "reminded1d");

      } catch (subErr) {
        console.error(`[Lifecycle Engine] Erreur sur sub ${sub.id}:`, subErr);
        stats.errors++;
      }
    }

  } catch (err) {
    console.error("[Lifecycle Engine Fatal Error]", err);
  }

  return stats;
}

/**
 * Vérifie et met à jour instantanément le cycle de vie d'un utilisateur spécifique (ex: lors du chargement de son tableau de bord)
 */
export async function checkSingleUserSubscriptionLifecycle(adminDb: SupabaseClient, userId: string) {
  if (!userId || !adminDb) return;
  try {
    const { data: sub } = await adminDb
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub || !sub.expires_at) return;

    const now = new Date();
    const expiresAt = new Date(sub.expires_at);

    if (now > expiresAt) {
      const nowIso = now.toISOString();
      await adminDb
        .from("subscriptions")
        .update({ status: "expired", updated_at: nowIso })
        .eq("id", sub.id);

      await adminDb
        .from("profiles")
        .update({ subscription_type: "standard", updated_at: nowIso })
        .eq("id", userId);

      const packName = PACK_NAMES[sub.pack] || "Abonnement TCF";
      await adminDb.from("notifications").insert({
        user_id: userId,
        title: "Abonnement expiré",
        message: `Votre accès au ${packName} est arrivé à expiration. Vos progrès sont conservés en toute sécurité. Renouvelez pour réactiver les fonctions VIP/IA.`,
        type: "renewal_reminder",
        is_read: false,
        created_at: nowIso
      });
    }
  } catch (err) {
    console.error(`[Single User Lifecycle Check Error for ${userId}]`, err);
  }
}

import { createClient } from "@/utils/supabase/client";

/**
 * Synchronisateur d'Abonnement TCF Canada Pro
 * Vérifie l'état de l'abonnement dans Supabase et débloque le tableau de bord au chargement / reconnexion.
 */
export async function syncUserSubscriptionState(): Promise<string> {
  if (typeof window === "undefined") return "standard";

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const cached = localStorage.getItem("griffon_user_plan");
      return cached || "standard";
    }

    // 1. Récupérer le profil Supabase
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_type, role, is_admin")
      .eq("id", user.id)
      .single();

    // 2. Vérifier s'il y a un abonnement actif non expiré
    const { data: activeSubs } = await supabase
      .from("subscriptions")
      .select("pack, status, expires_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("expires_at", { ascending: false })
      .limit(1);

    const adminEmails = [
      'emmuel.proreseau@gmail.com', 'joumefiomiguel@gmail.com', 'miguelemmuel@gmail.com',
      'admin.miguel@griffondor.com', 'miguel.admin@griffondor.com', 'admin@griffondor.com', 'miguel@griffondor.com'
    ];
    const isAdmin = adminEmails.includes(user.email?.toLowerCase().trim() || "") || Boolean(profile?.is_admin) || profile?.role === "superadmin";

    let activePack = profile?.subscription_type || "standard";

    if (isAdmin) {
      activePack = "vip";
      localStorage.setItem("griffon_user_plan", "vip");
      localStorage.setItem("griffon_user_is_admin", "true");
    } else {
      if (activeSubs && activeSubs.length > 0) {
        const currentSub = activeSubs[0];
        if (currentSub.expires_at) {
          const expiryDate = new Date(currentSub.expires_at);
          if (expiryDate > new Date()) {
            activePack = currentSub.pack || activePack;
          } else {
            console.warn("Abonnement expiré le :", currentSub.expires_at);
          }
        }
      }
      localStorage.setItem("griffon_user_plan", activePack);
      localStorage.removeItem("griffon_user_is_admin");
    }

    // Déclencher un événement de mise à jour globale
    window.dispatchEvent(new Event("storage_user_pack_updated"));

    return activePack;
  } catch (err) {
    console.warn("Erreur de synchronisation abonnement Supabase:", err);
    return localStorage.getItem("griffon_user_plan") || "standard";
  }
}

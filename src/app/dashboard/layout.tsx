"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState("Candidat");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasActiveSub, setHasActiveSub] = useState(false);
  const pathname = usePathname();
  const isPaymentsPage = pathname?.includes("/dashboard/payments");

  useEffect(() => {
    // Read user name from localStorage
    const stored = localStorage.getItem("griffon_user_name") || localStorage.getItem("griffon_user_email") || "Candidat";
    setUserName(stored);

    async function checkSubscription() {
      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const localEmail = localStorage.getItem("griffon_user_email") || "";
        const localName = localStorage.getItem("griffon_user_name") || "";
        const localIsAdmin = localStorage.getItem("griffon_user_is_admin") === "true";

        // Ne pas rediriger vers /login si un utilisateur s'est inscrit ou a une session locale active
        if (!user && !localEmail && !localName) {
          window.location.href = "/login";
          return;
        }

        // Si l'utilisateur revient d'un paiement externe (Chariow), on le redirige vers l'écran de vérification
        const pendingTxRef = localStorage.getItem("pending_tx_ref");
        if (pendingTxRef && !pathname?.includes("/dashboard/payments")) {
          window.location.href = `/dashboard/payments?status=check`;
          return;
        }

        let profile: any = null;
        if (user?.id) {
          try {
            const { data: p } = await supabase
              .from("profiles")
              .select("subscription_type, is_admin, role")
              .eq("id", user.id)
              .maybeSingle();
            profile = p;
          } catch (_) {}
        }

        const effectiveEmail = (user?.email || localEmail).toLowerCase().trim();
        const adminEmails = [
          'emmuel.proreseau@gmail.com', 'joumefiomiguel@gmail.com', 'miguelemmuel@gmail.com',
          'admin.miguel@griffondor.com', 'miguel.admin@griffondor.com', 'admin@griffondor.com', 'miguel@griffondor.com'
        ];
        
        // Un utilisateur n'est admin QUE SI son email est un email admin officiel, s'il a un domaine @griffondor.com, ou si profile.is_admin === true / role === 'superadmin' / 'admin'
        const isAdmin = adminEmails.includes(effectiveEmail) || effectiveEmail.endsWith('@griffondor.com') || Boolean(profile?.is_admin) || profile?.role === 'superadmin' || profile?.role === 'admin';

        if (isAdmin) {
          setHasActiveSub(true);
          localStorage.setItem("griffon_user_plan", "vip");
          localStorage.setItem("griffon_user_is_admin", "true");
          window.dispatchEvent(new Event("storage_user_pack_updated"));
          setIsChecking(false);
          return;
        }

        // Pour tout utilisateur normal : nettoyer impérativement les privilèges d'admin du localStorage
        localStorage.removeItem("griffon_user_is_admin");

        // Vérification stricte en base de données de l'abonnement actif payé non expiré
        let isPaidSubActive = false;
        let activePack = profile?.subscription_type || "standard";

        if (user?.id) {
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("pack, status, expires_at")
            .eq("user_id", user.id)
            .eq("status", "active")
            .order("expires_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (sub && sub.status === "active" && sub.expires_at) {
            const expDate = new Date(sub.expires_at);
            if (expDate > new Date()) {
              isPaidSubActive = true;
              activePack = sub.pack || profile?.subscription_type || "standard";
            }
          }
        }

        if (isPaidSubActive) {
          setHasActiveSub(true);
          localStorage.setItem("griffon_user_plan", activePack);
          window.dispatchEvent(new Event("storage_user_pack_updated"));
        } else {
          setHasActiveSub(false);
          localStorage.setItem("griffon_user_plan", activePack);
          if (!pathname?.includes("/dashboard/payments")) {
            window.location.href = "/dashboard/payments";
            return;
          }
        }

        setIsChecking(false);
      } catch (err) {
        console.error("Erreur de vérification d'abonnement", err);
        setHasActiveSub(false);
        if (!pathname?.includes("/dashboard/payments")) {
          window.location.href = "/dashboard/payments";
          return;
        }
        setIsChecking(false);
      }
    }
    checkSubscription();
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }


  if (!hasActiveSub) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[90vh]">
          <div className="p-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-center">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2">
              🔒 Accès Restreint - Paiement Requis
            </h2>
          </div>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {/* Sidebar */}
      <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar userName={userName} onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

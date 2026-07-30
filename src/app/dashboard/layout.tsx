"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState("Candidat");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasActiveSub, setHasActiveSub] = useState(false);

  useEffect(() => {
    // Read user name from localStorage
    const stored = localStorage.getItem("griffon_user_name") || localStorage.getItem("griffon_user_email") || "Candidat";
    setUserName(stored);

    async function checkSubscription() {
      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = "/login";
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_type, is_admin, role")
          .eq("id", user.id)
          .single();

        const adminEmails = [
          'emmuel.proreseau@gmail.com', 'joumefiomiguel@gmail.com', 'miguelemmuel@gmail.com',
          'admin.miguel@griffondor.com', 'miguel.admin@griffondor.com', 'admin@griffondor.com', 'miguel@griffondor.com'
        ];
        const isAdmin = adminEmails.includes(user.email?.toLowerCase().trim() || "") || Boolean(profile?.is_admin) || profile?.role === 'superadmin' || localStorage.getItem("griffon_user_is_admin") === "true";

        if (isAdmin) {
          setHasActiveSub(true);
          localStorage.setItem("griffon_user_plan", "vip");
          localStorage.setItem("griffon_user_is_admin", "true");
          window.dispatchEvent(new Event("storage_user_pack_updated"));
          setIsChecking(false);
          return;
        }

        // Check active subscription
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("expires_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const isPaymentsPage = window.location.pathname.includes("/dashboard/payments");

        const userPack = profile?.subscription_type || sub?.pack || "standard";
        const isSubValid = sub ? (!sub.expires_at || new Date(sub.expires_at) > new Date()) : (profile?.subscription_type && profile.subscription_type !== "none");

        if (isSubValid || isPaymentsPage) {
          setHasActiveSub(true);
          localStorage.setItem("griffon_user_plan", userPack);
          window.dispatchEvent(new Event("storage_user_pack_updated"));
        } else {
          setHasActiveSub(false);
          localStorage.setItem("griffon_user_plan", "standard");
          if (!isPaymentsPage) {
            window.location.href = "/dashboard/payments";
          }
        }
        
        setIsChecking(false);
      } catch (err) {
        console.error("Erreur de vérification d'abonnement", err);
        setHasActiveSub(true);
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

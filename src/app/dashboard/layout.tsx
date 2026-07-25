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

        const isAdmin = [
          'emmuel.proreseau@gmail.com', 'joumefiomiguel@gmail.com', 'miguelemmuel@gmail.com',
          'admin.miguel@griffondor.com', 'miguel.admin@griffondor.com', 'admin@griffondor.com', 'miguel@griffondor.com'
        ].includes(user.email?.toLowerCase().trim() || "");

        if (isAdmin) {
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

        if (!sub && !isPaymentsPage) {
          // No active subscription, redirect to payments
          window.location.href = "/dashboard/payments";
        } else if (sub && sub.expires_at && new Date(sub.expires_at) < new Date() && !isPaymentsPage) {
          // Expired subscription
          window.location.href = "/dashboard/payments";
        } else {
          setIsChecking(false);
        }
      } catch (err) {
        console.error("Erreur de vérification d'abonnement", err);
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

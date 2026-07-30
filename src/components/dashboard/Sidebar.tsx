"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  BarChart3,
  UserCheck,
  Calendar,
  CreditCard,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Lock,
  Crown,
  Zap,
  History,
  Award
} from "lucide-react";
import { getCurrentUserPack, isFeatureAccessible, getPackPermissions, PackType, isUserAdmin } from "@/utils/subscriptionEngine";
import { UpgradePackModal } from "@/components/ui/UpgradePackModal";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "Mes cours", icon: BookOpen },
  { href: "/dashboard/exams", label: "Tests pratiques", icon: FileCheck2 },
  { href: "/dashboard/quiz", label: "Quiz Express", icon: Zap },
  { href: "/dashboard/results", label: "Résultats", icon: BarChart3 },
  { href: "/dashboard/coaching", label: "Coaching", icon: UserCheck, featureKey: "coaching" as const },
  { href: "/dashboard/reservations", label: "Mes réservations", icon: Calendar, featureKey: "reservations" as const },
  { href: "/dashboard/payments", label: "Paiements", icon: CreditCard },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare, featureKey: "messages" as const },
  { href: "/dashboard/profile", label: "Mon profil", icon: User },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [pack, setPack] = useState<PackType>("griffon");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const refreshPack = () => {
    setPack(getCurrentUserPack());
  };

  useEffect(() => {
    refreshPack();
    window.addEventListener("storage_user_pack_updated", refreshPack);
    return () => window.removeEventListener("storage_user_pack_updated", refreshPack);
  }, []);

  const config = getPackPermissions(pack);
  const isAdmin = isUserAdmin();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={cn(
          "w-64 flex flex-col h-screen bg-[#07192f] text-slate-200 border-r border-slate-800 flex-shrink-0 select-none overflow-y-auto transition-transform duration-300 ease-in-out z-50",
          "fixed inset-y-0 left-0 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center space-x-3 p-5 border-b border-slate-800/80">
          <img src="/griffon_logo.png" alt="Griffon d'or" className="h-10 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white uppercase leading-none">
              GRIFFON D'OR
            </span>
            <span className="text-[10px] font-semibold text-amber-500 tracking-wide mt-0.5">
              Préparation TCF Canada
            </span>
          </div>
        </div>

        {/* Current Pack Badge - Clickable ONLY for admin to switch packs */}
        <div className="px-4 pt-3">
          <div 
            onClick={isAdmin ? () => setShowUpgradeModal(true) : undefined}
            className={cn(
              "px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between transition-all group shadow-sm",
              isAdmin ? "hover:border-amber-500/80 hover:bg-slate-800 cursor-pointer" : "cursor-default"
            )}
            title={isAdmin ? "Cliquez pour tester un autre Pack (Mode Administrateur / Changement de formule)" : `Formule active : ${config.name}`}
          >
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-white">{config.name}</span>
                {isAdmin ? (
                  <span className="text-[9px] text-amber-400/90 font-medium">Changer de formule ⇄</span>
                ) : (
                  <span className="text-[9px] text-slate-400 font-medium">Formule active</span>
                )}
              </div>
            </div>
            {config.badge && (
              <span className="text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                ★
              </span>
            )}
          </div>
        </div>

        {/* Main Navigation Menu */}
        <nav className="flex-1 py-4 px-3 space-y-1.5">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const isLocked = item.featureKey ? !isFeatureAccessible(item.featureKey, pack) : false;

            return (
              <Link key={item.href} href={item.href} onClick={onClose}>
                <div
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150 relative",
                    active
                      ? "bg-[#1d4ed8] text-white shadow-lg shadow-blue-900/40 font-bold"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
                    isLocked && "opacity-75"
                  )}
                >
                  <div className="flex items-center space-x-3.5">
                    <item.icon className={cn("h-5 w-5", active ? "text-white" : "text-slate-400")} />
                    <span>{item.label}</span>
                  </div>

                  {isLocked && (
                    <span className="h-5 w-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center border border-slate-700">
                      <Lock className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {isAdmin && (
            <div className="pt-3 border-t border-slate-800/80 my-2">
              <span className="px-4 text-[10px] font-black uppercase text-amber-500/90 tracking-wider block mb-1">
                Direction & SaaS
              </span>
              <Link href="/dashboard/admin" onClick={onClose}>
                <div
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all duration-150",
                    pathname.startsWith("/dashboard/admin")
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20"
                      : "text-amber-400 hover:bg-slate-800/60 hover:text-amber-300 border border-amber-500/30"
                  )}
                >
                  <div className="flex items-center space-x-3.5">
                    <Crown className="h-5 w-5" />
                    <span>Admin SaaS & Finance</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-black">
                    VIP
                  </span>
                </div>
              </Link>
            </div>
          )}

          <button
            onClick={async () => {
              if (typeof window !== "undefined") {
                const { createClient } = await import("@/lib/supabaseClient");
                const { clearAllUserLocalData } = await import("@/utils/sessionManager");
                const supabase = createClient();
                await supabase.auth.signOut();
                clearAllUserLocalData();
                window.location.href = "/login";
              }
            }}
            className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl font-semibold text-sm text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-all mt-4"
          >
            <LogOut className="h-5 w-5" />
            <span>Déconnexion</span>
          </button>
        </nav>
      </aside>

      <UpgradePackModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </>
  );
}

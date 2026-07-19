"use client";

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
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "Mes cours", icon: BookOpen },
  { href: "/dashboard/exams", label: "Tests pratiques", icon: FileCheck2 },
  { href: "/dashboard/results", label: "Résultats", icon: BarChart3 },
  { href: "/dashboard/coaching", label: "Coaching", icon: UserCheck },
  { href: "/dashboard/reservations", label: "Mes réservations", icon: Calendar },
  { href: "/dashboard/payments", label: "Paiements", icon: CreditCard },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare, badge: "2" },
  { href: "/dashboard/profile", label: "Mon profil", icon: User },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

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

        {/* Main Navigation Menu */}
        <nav className="flex-1 py-4 px-3 space-y-1.5">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={onClose}>
                <div
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150",
                    active
                      ? "bg-[#1d4ed8] text-white shadow-lg shadow-blue-900/40 font-bold"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  )}
                >
                  <div className="flex items-center space-x-3.5">
                    <item.icon className={cn("h-5 w-5", active ? "text-white" : "text-slate-400")} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="h-5 w-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          <button
            onClick={() => {
              localStorage.removeItem("griffon_user_name");
              localStorage.removeItem("griffon_user_email");
              window.location.href = "/";
            }}
            className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-700/60 hover:text-white transition-all font-semibold text-sm mt-2"
          >
            <LogOut className="h-5 w-5 text-slate-400" />
            <span>Déconnexion</span>
          </button>
        </nav>

        {/* Bottom Promo Card */}
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-[#0e2c52] to-[#0a1e38] border border-blue-800/40 text-center relative overflow-hidden">
          <div className="text-xs font-semibold text-slate-300">Réussissez votre</div>
          <div className="text-base font-extrabold text-white tracking-wide mt-0.5">TCF CANADA</div>
          <div className="text-[11px] text-slate-300 mt-1 leading-tight">
            Atteignez vos objectifs d'immigration et d'études !
          </div>
          <div className="mt-3 relative rounded-xl overflow-hidden shadow-md">
            <img 
              src="https://images.unsplash.com/photo-1517935703635-27c737822457?w=400&auto=format&fit=crop&q=80" 
              alt="Toronto Canada skyline" 
              className="w-full h-24 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
              <img src="https://flagcdn.com/ca.svg" alt="Drapeau Canada" className="h-4 w-auto rounded-[2px]" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}


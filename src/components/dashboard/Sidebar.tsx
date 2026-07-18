"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Home,
  BookOpen,
  FileText,
  HelpCircle,
  BarChart3,
  History,
  Trophy,
  Award,
  User,
  Settings,
  HeadphonesIcon,
  LogOut,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/dashboard/courses", label: "Cours", icon: BookOpen },
  { href: "/dashboard/exams", label: "Examens", icon: FileText },
  { href: "/dashboard/quiz", label: "Quiz", icon: HelpCircle },
  { href: "/dashboard/progress", label: "Progression", icon: BarChart3 },
  { href: "/dashboard/history", label: "Historique", icon: History },
  { href: "/dashboard/leaderboard", label: "Classement", icon: Trophy },
  { href: "/dashboard/certificates", label: "Certificats", icon: Award },
];

const bottomNavItems = [
  { href: "/dashboard/profile", label: "Profil", icon: User },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
  { href: "/dashboard/support", label: "Support", icon: HeadphonesIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 overflow-hidden flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-800">
        <Link href="/dashboard" className="flex items-center space-x-3 min-w-0">
          <GraduationCap className="h-8 w-8 text-primary flex-shrink-0" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-lg whitespace-nowrap overflow-hidden"
            >
              TCF Canada <span className="text-primary">Pro</span>
            </motion.span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  active
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="py-4 px-2 space-y-1 border-t border-slate-200 dark:border-slate-800">
        {bottomNavItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  active
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </div>
            </Link>
          );
        })}
        <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200">
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-medium whitespace-nowrap"
            >
              Déconnexion
            </motion.span>
          )}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-slate-500" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-slate-500" />
        )}
      </button>
    </motion.aside>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Menu, ChevronDown, Check, CreditCard, Clock, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";

interface TopbarProps {
  userName?: string;
  onMenuClick?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: "payment" | "subscription" | "system";
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    title: "Paiement à venir (Agrégateur)",
    message: "Dès l'ajout de l'agrégateur de paiement (Mobile Money/Carte), les reçus de paiement s'afficheront ici.",
    date: "Aujourd'hui",
    isRead: false,
    type: "payment"
  },
  {
    id: "notif_2",
    title: "Avis d'expiration d'abonnement",
    message: "Votre abonnement TCF est actif. Vous recevrez une alerte automatique à la fin de votre période d'accès.",
    date: "Hier",
    isRead: false,
    type: "subscription"
  },
  {
    id: "notif_3",
    title: "Bienvenue sur TCF Canada Pro",
    message: "Accédez à vos cours et simulations avec correction automatique du niveau TCF par l'IA.",
    date: "Récemment",
    isRead: true,
    type: "system"
  }
];

export function Topbar({ userName = "Candidat", onMenuClick }: TopbarProps) {
  const [avatar, setAvatar] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80");
  const [displayName, setDisplayName] = useState(userName);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);

  useEffect(() => {
    async function loadUserAvatarAndName() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const userAvatarKey = `griffon_avatar_url_${user.id}`;
          const localAvatar = localStorage.getItem(userAvatarKey);

          // Fetch from Supabase profiles
          const { data: profile } = await supabase
            .from("profiles")
            .select("avatar_url, full_name, first_name")
            .eq("id", user.id)
            .single();

          if (profile?.avatar_url) {
            setAvatar(profile.avatar_url);
          } else if (localAvatar) {
            setAvatar(localAvatar);
          }

          if (profile?.full_name || profile?.first_name) {
            setDisplayName(profile.full_name || profile.first_name);
          } else if (user.user_metadata?.full_name) {
            setDisplayName(user.user_metadata.full_name);
          }

          // Load notifications for user
          const userNotifKey = `griffon_notifications_${user.id}`;
          const storedNotifs = localStorage.getItem(userNotifKey);
          if (storedNotifs) {
            try {
              setNotifications(JSON.parse(storedNotifs));
            } catch (e) {
              setNotifications(DEFAULT_NOTIFICATIONS);
            }
          }
        } else {
          // Guest fallback
          const guestAvatar = localStorage.getItem("griffon_avatar_url_guest");
          if (guestAvatar) setAvatar(guestAvatar);
        }
      } catch (err) {
        console.error("Erreur Topbar:", err);
      }
    }

    loadUserAvatarAndName();

    // Listen for avatar updates specific to active user
    const handleAvatarUpdate = () => {
      loadUserAvatarAndName();
    };

    window.addEventListener("avatar_updated", handleAvatarUpdate);
    window.addEventListener("storage", handleAvatarUpdate);

    return () => {
      window.removeEventListener("avatar_updated", handleAvatarUpdate);
      window.removeEventListener("storage", handleAvatarUpdate);
    };
  }, [userName]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    if (typeof window !== "undefined") {
      const userNotifKey = localStorage.getItem("griffon_user_email")
        ? `griffon_notifications_${localStorage.getItem("griffon_user_email")}`
        : "griffon_notifications_guest";
      localStorage.setItem(userNotifKey, JSON.stringify(updated));
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 relative">
      {/* Left Menu toggle & Search */}
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
        <button
          onClick={onMenuClick}
          className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="relative w-full max-w-[200px] sm:max-w-[340px]">
          <Input
            placeholder="Rechercher..."
            className="pl-4 pr-9 bg-slate-100/70 dark:bg-slate-900 border-none h-9 text-xs font-medium rounded-lg w-full text-slate-900 dark:text-white"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-3 sm:space-x-5 ml-2 relative">
        
        {/* Active Notifications Bell Dropdown */}
        <div className="relative">
          <button 
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold">
                      {unreadCount} nouvelle(s)
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" /> Tout marquer comme lu
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                      !n.isRead 
                        ? "bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800" 
                        : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {n.type === "payment" && <CreditCard className="h-3.5 w-3.5 text-emerald-600" />}
                        {n.type === "subscription" && <Clock className="h-3.5 w-3.5 text-amber-600" />}
                        {n.type === "system" && <Sparkles className="h-3.5 w-3.5 text-blue-600" />}
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{n.date}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center space-x-2 cursor-pointer">
          <img 
            src={avatar} 
            alt={displayName} 
            className="h-9 w-9 rounded-full object-cover border-2 border-blue-500 shadow-sm"
          />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{displayName}</p>
            <p className="text-[11px] text-slate-400 font-semibold leading-tight">Candidat TCF</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block ml-1" />
        </div>

      </div>
    </header>
  );
}

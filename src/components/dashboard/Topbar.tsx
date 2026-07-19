"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Menu, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TopbarProps {
  userName?: string;
  onMenuClick?: () => void;
}

export function Topbar({ userName = "Joel K.", onMenuClick }: TopbarProps) {
  const [avatar, setAvatar] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80");

  useEffect(() => {
    const saved = localStorage.getItem("griffon_avatar_url");
    if (saved) setAvatar(saved);

    const handleStorage = () => {
      const updated = localStorage.getItem("griffon_avatar_url");
      if (updated) setAvatar(updated);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
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
            className="pl-4 pr-9 bg-slate-100/70 dark:bg-slate-900 border-none h-9 text-xs font-medium rounded-lg w-full"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-3 sm:space-x-5 ml-2">
        {/* Notifications */}
        <button className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-2 cursor-pointer">
          <img 
            src={avatar} 
            alt={userName} 
            className="h-9 w-9 rounded-full object-cover border-2 border-slate-200 dark:border-slate-800"
          />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{userName}</p>
            <p className="text-[11px] text-slate-400 font-semibold leading-tight">Candidat</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block ml-1" />
        </div>
      </div>
    </header>
  );
}


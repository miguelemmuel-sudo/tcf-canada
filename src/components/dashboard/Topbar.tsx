"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopbarProps {
  userName?: string;
}

export function Topbar({ userName = "Utilisateur" }: TopbarProps) {
  return (
    <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
      {/* Search */}
      <div className="relative w-full max-w-sm hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un cours, un examen..."
          className="pl-9 bg-slate-50 dark:bg-slate-900 border-none h-9"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-3 ml-auto">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </Button>

        {/* User Avatar */}
        <div className="flex items-center space-x-2">
          <div className="h-9 w-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold leading-none">{userName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Plan Premium</p>
          </div>
        </div>
      </div>
    </header>
  );
}

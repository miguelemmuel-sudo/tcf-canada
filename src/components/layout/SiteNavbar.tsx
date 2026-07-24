"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, ChevronDown } from "lucide-react";

export function SiteNavbar() {
  return (
    <header className="fixed top-0 w-full z-50 shadow-sm">
      {/* Top Header Bar */}
      <div className="bg-[#0e2238] text-slate-200 text-xs py-2 px-4 border-b border-slate-700/50">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-6">
            <a href="mailto:griffondortcf@gmail.com" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
              <Mail className="h-3.5 w-3.5" />
              <span>griffondortcf@gmail.com</span>
            </a>
            <a href="tel:+237695903205" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
              <Phone className="h-3.5 w-3.5" />
              <span>+237 695 903 205</span>
            </a>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 text-slate-300">
              <a href="https://wa.me/237695903205" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors" aria-label="WhatsApp">
                WhatsApp
              </a>
            </div>
            <Link 
              href="/login" 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-600 hover:border-amber-400 text-xs text-white font-medium hover:text-amber-400 transition-all bg-slate-800/50"
            >
              <User className="h-3.5 w-3.5" />
              <span>Espace étudiant</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <img src="/griffon_logo.png" alt="Griffon d'or Logo" className="h-12 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-[#0e2238] dark:text-white uppercase leading-none">
                GRIFFON D'OR
              </span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 tracking-wide">
                Préparation TCF Canada
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-bold text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 pb-1">
              Accueil
            </Link>
            <Link href="#features" className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-amber-600 transition-colors">
              À propos
            </Link>
            <Link href="#packs" className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-amber-600 transition-colors">
              Nos packs
            </Link>
            <a href="https://wa.me/237695903205" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-amber-600 transition-colors">
              Contact WhatsApp
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button 
              asChild 
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-md transition-all"
            >
              <Link href="/register">Nous rejoindre</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

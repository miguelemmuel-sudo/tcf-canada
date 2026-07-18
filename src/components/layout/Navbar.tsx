"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight">TCF Canada <span className="text-primary">Pro</span></span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Fonctionnalités
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Tarifs
          </Link>
          <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="hidden sm:inline-flex" asChild>
            <Link href="/login">Connexion</Link>
          </Button>
          <Button asChild className="rounded-full shadow-lg shadow-primary/30">
            <Link href="/register">Essayer gratuitement</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

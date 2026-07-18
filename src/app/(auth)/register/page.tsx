"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Créez votre compte</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Rejoignez TCF Canada Pro et maximisez vos chances.
        </p>
      </div>

      <form className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nom complet</Label>
          <Input id="name" type="text" placeholder="Jean Dupont" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="nom@exemple.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" required />
          <p className="text-xs text-muted-foreground">Doit contenir au moins 8 caractères.</p>
        </div>
        
        <Button className="w-full" type="submit">
          S'inscrire
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Déjà un compte ?</span>{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </div>
    </motion.div>
  );
}

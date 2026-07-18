"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">De retour ?</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Connectez-vous pour continuer votre préparation au TCF.
        </p>
      </div>

      <form className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="nom@exemple.com" required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              Oublié ?
            </Link>
          </div>
          <Input id="password" type="password" required />
        </div>
        
        <Button className="w-full" type="submit">
          Se connecter
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Pas encore de compte ?</span>{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          S'inscrire
        </Link>
      </div>
    </motion.div>
  );
}

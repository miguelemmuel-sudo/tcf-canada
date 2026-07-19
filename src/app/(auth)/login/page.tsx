"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message === "Invalid login credentials" ? "Identifiants invalides." : signInError.message);
        setLoading(false);
        return;
      }

      // Fetch user profile for name & subscription info
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, subscription_type")
          .eq("id", data.user.id)
          .single();

        localStorage.setItem("griffon_user_name", profile?.full_name || data.user.user_metadata?.full_name || email);
        localStorage.setItem("griffon_user_email", email);
        if (profile?.subscription_type) {
          localStorage.setItem("griffon_user_plan", profile.subscription_type);
        }
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Une erreur de connexion est survenue.");
      setLoading(false);
    }
  };



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

      {error && (
        <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="nom@exemple.com" required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              Oublié ?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required />
        </div>
        
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link href="/register" className="text-muted-foreground hover:text-slate-900 dark:hover:text-white transition-colors">
          <span>Pas encore de compte ? </span>
          <span className="font-medium text-primary hover:underline">S'inscrire</span>
        </Link>
      </div>
    </motion.div>
  );
}


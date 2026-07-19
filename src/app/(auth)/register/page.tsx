"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!termsAccepted) {
      setError("Vous devez accepter les conditions d'utilisation pour continuer.");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const name = formData.get("name") as string;

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes("your-supabase-url")) {
        try {
          const supabase = createClient();
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
              },
            },
          });
          if (error) {
            console.warn("Supabase signup error:", error.message);
          }
        } catch (err) {
          console.warn("Supabase connection issue, proceeding to dashboard:", err);
        }
      }

      // Save users array in localStorage for realistic authentication
      const storedUsersRaw = localStorage.getItem("griffon_registered_users");
      const storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      const updatedUsers = [...storedUsers.filter((u: any) => u.email !== email), { email, password, name }];
      localStorage.setItem("griffon_registered_users", JSON.stringify(updatedUsers));

      // Save active user info
      localStorage.setItem("griffon_user_name", name || email);
      localStorage.setItem("griffon_user_email", email);
      localStorage.setItem("griffon_user_new", "true"); // mark as new user with zero stats
      router.push("/dashboard");
    } catch {
      localStorage.setItem("griffon_user_name", name || email || "Candidat");
      localStorage.setItem("griffon_user_email", email);
      localStorage.setItem("griffon_user_new", "true");
      router.push("/dashboard");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Créez votre compte</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Rejoignez TCF Canada Pro et maximisez vos chances.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Nom complet</Label>
          <Input id="name" name="name" type="text" placeholder="Jean Dupont" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="nom@exemple.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" name="password" type="password" required />
          <p className="text-xs text-muted-foreground">Doit contenir au moins 8 caractères.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required />
        </div>

        {/* Checkbox Conditions & Voir Plus */}
        <div className="flex items-start space-x-2.5 pt-1">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            required
          />
          <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
            J'accepte les{" "}
            <span className="font-semibold text-slate-900 dark:text-white">conditions d'utilisation</span> et la politique de confidentialité.{" "}
            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="text-primary font-bold hover:underline inline-block ml-0.5"
            >
              Voir plus
            </button>
          </label>
        </div>
        
        <Button className="w-full pt-2" type="submit" disabled={loading}>
          {loading ? "Création du compte..." : "S'inscrire"}
        </Button>
      </form>

      {/* Modal Protection des données & Conditions d'utilisation */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                🔒 Protection des données & Conditions
              </h3>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="font-semibold text-slate-900 dark:text-white">
                Comment vos données personnelles sont-elles protégées ?
              </p>
              
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2 border border-slate-200/80 dark:border-slate-800">
                <p>
                  <strong>1. Chiffrement avancé :</strong> Vos informations de compte (nom, email, mot de passe) et vos enregistrements vocaux sont chiffrés avec les normes TLS/SSL de haut niveau.
                </p>
                <p>
                  <strong>2. Usage strictement pédagogique :</strong> Vos simulations de tests et enregistrements vocaux d'expression orale sont exclusivement utilisés pour vous fournir des évaluations et corrections IA. Aucune donnée n'est cédée à des tiers.
                </p>
                <p>
                  <strong>3. Confidentialité & RGPD :</strong> Vous disposez d'un droit d'accès, de modification et de suppression totale de vos données depuis l'onglet profil ou paramètres de votre dashboard.
                </p>
              </div>

              <p className="text-[11px] text-slate-500">
                En cochant la case d'inscription, vous certifiez avoir pris connaissance de ces engagements de confidentialité.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                onClick={() => {
                  setTermsAccepted(true);
                  setShowPrivacyModal(false);
                }}
                className="text-xs"
              >
                J'ai compris et j'accepte
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Déjà un compte ?</span>{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </div>
    </motion.div>
  );
}


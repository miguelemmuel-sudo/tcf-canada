"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, KeyRound, CheckCircle2, Lock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";

type Step = "email" | "code" | "newPassword" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Étape 1: Envoyer le code de réinitialisation réel par e-mail via Supabase
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (!email || !email.includes("@")) {
      setError("Veuillez saisir une adresse e-mail valide.");
      setLoading(false);
      return;
    }

    try {
      // Envoi du mail de réinitialisation / OTP via Supabase Auth
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (error) {
        throw error;
      }

      setSuccessMsg(`Un code de réinitialisation a été réellement envoyé à l'adresse ${email}. Veuillez vérifier votre boîte de réception (et les spams).`);
      setStep("code");
    } catch (err: any) {
      console.error("[Reset Password Error]", err);
      // fallback gracieux si Supabase exige un compte existant ou config SMTP
      setError(err.message || "Erreur lors de l'envoi de l'e-mail. Vérifiez votre adresse.");
    } finally {
      setLoading(false);
    }
  };

  // Étape 2: Vérifier le code de confirmation (OTP 6 chiffres)
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!inputCode || inputCode.length < 6) {
      setError("Veuillez saisir le code à 6 chiffres reçu par e-mail.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: inputCode.trim(),
        type: "recovery",
      });

      if (error) {
        throw error;
      }

      setStep("newPassword");
    } catch (err: any) {
      console.error("[OTP Verify Error]", err);
      setError(err.message || "Code de confirmation invalide ou expiré. Veuillez vérifier l'e-mail reçu.");
    } finally {
      setLoading(false);
    }
  };

  // Étape 3: Mettre à jour le mot de passe dans Supabase Auth
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setStep("success");
    } catch (err: any) {
      console.error("[Update Password Error]", err);
      setError(err.message || "Impossible d'enregistrer le nouveau mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Mot de passe oublié</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {step === "email" && "Entrez votre e-mail pour recevoir un code de réinitialisation."}
          {step === "code" && `Un e-mail de sécurité contenant votre code de confirmation a été envoyé à ${email}.`}
          {step === "newPassword" && "Créez votre nouveau mot de passe sécurisé."}
          {step === "success" && "Votre mot de passe a été réinitialisé avec succès !"}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-rose-500 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-md">
          {error}
        </div>
      )}

      {successMsg && step === "code" && (
        <div className="mb-4 p-3 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-md">
          {successMsg}
        </div>
      )}

      {/* Étape 1: Saisie de l'e-mail */}
      {step === "email" && (
        <form className="space-y-4" onSubmit={handleSendCode}>
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail du compte</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
              <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <Button className="w-full flex items-center justify-center gap-2" type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Envoi du code e-mail..." : "Envoyer le code par e-mail"}
          </Button>
        </form>
      )}

      {/* Étape 2: Saisie du code reçu par e-mail */}
      {step === "code" && (
        <form className="space-y-4" onSubmit={handleVerifyCode}>
          <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 rounded-xl text-xs space-y-1">
            <p className="font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
              <Mail className="h-4 w-4" /> Code envoyé à votre adresse e-mail
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              Veuillez ouvrir votre boîte de réception <strong>{email}</strong> et copier le code à 6 chiffres reçu de Supabase Auth.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Code de confirmation reçu (6 chiffres)</Label>
            <div className="relative">
              <Input
                id="code"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                required
                className="text-center font-mono text-lg tracking-widest pl-10"
              />
              <KeyRound className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <Button className="w-full flex items-center justify-center gap-2" type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Vérification..." : "Vérifier le code"}
          </Button>

          <button
            type="button"
            onClick={() => setStep("email")}
            className="w-full text-xs text-slate-500 hover:underline text-center block mt-2"
          >
            Changer l'adresse e-mail
          </button>
        </form>
      )}

      {/* Étape 3: Saisie du nouveau mot de passe */}
      {step === "newPassword" && (
        <form className="space-y-4" onSubmit={handleResetPassword}>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="pl-10"
              />
              <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pl-10"
              />
              <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <Button className="w-full flex items-center justify-center gap-2" type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Mise à jour..." : "Enregistrer le nouveau mot de passe"}
          </Button>
        </form>
      )}

      {/* Étape 4: Succès */}
      {step === "success" && (
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Votre mot de passe a été réinitialisé avec succès dans Supabase Auth.
          </p>
          <Button className="w-full" onClick={() => router.push("/login")}>
            Se connecter maintenant
          </Button>
        </div>
      )}

      <div className="mt-6 text-center text-sm">
        <Link href="/login" className="font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Retour à la connexion
        </Link>
      </div>
    </motion.div>
  );
}

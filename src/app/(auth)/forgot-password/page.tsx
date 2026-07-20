"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, KeyRound, CheckCircle2, Lock, Loader2, ShieldCheck } from "lucide-react";
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
  const [loading, setLoading] = useState(false);

  // ─── Étape 1: Envoyer le code OTP de réinitialisation par e-mail ─────────────
  // On N'envoie PAS de redirectTo → Supabase envoie uniquement le code OTP à 6 chiffres
  // dans l'e-mail (configurable via le template Supabase Dashboard > Email Templates > Reset Password)
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !email.includes("@")) {
      setError("Veuillez saisir une adresse e-mail valide.");
      setLoading(false);
      return;
    }

    try {
      // Sans redirectTo → Supabase envoie le token OTP brut dans l'e-mail.
      // L'utilisateur copie ce code à 6 chiffres et le saisit directement ici.
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (resetError) throw resetError;

      setStep("code");
    } catch (err: any) {
      console.error("[Reset Password Send Error]", err);
      setError(err.message || "Erreur lors de l'envoi. Vérifiez que cette adresse e-mail est bien enregistrée.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Étape 2: Vérifier le code OTP à 6 chiffres reçu par e-mail ──────────────
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanCode = inputCode.replace(/\s/g, "").trim();

    if (!cleanCode || cleanCode.length < 6) {
      setError("Veuillez saisir le code à 6 chiffres reçu par e-mail.");
      setLoading(false);
      return;
    }

    try {
      // Vérification OTP Supabase : type "recovery" = réinitialisation de mot de passe
      const { error: otpError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: cleanCode,
        type: "recovery",
      });

      if (otpError) throw otpError;

      // Code valide → passer à l'étape de saisie du nouveau mot de passe
      setStep("newPassword");
    } catch (err: any) {
      console.error("[OTP Verify Error]", err);
      setError("Code invalide ou expiré. Vérifiez votre e-mail ou demandez un nouveau code.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Étape 3: Mettre à jour le mot de passe ───────────────────────────────────
  // La session OTP étant établie à l'étape 2, updateUser fonctionne directement
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      // Déconnexion propre après réinitialisation (sécurité)
      await supabase.auth.signOut();

      setStep("success");
    } catch (err: any) {
      console.error("[Update Password Error]", err);
      setError(err.message || "Impossible d'enregistrer le nouveau mot de passe. Réessayez.");
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
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Mot de passe oublié</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {step === "email" && "Entrez votre e-mail pour recevoir un code de réinitialisation à 6 chiffres."}
          {step === "code" && `Saisissez le code à 6 chiffres envoyé à ${email}.`}
          {step === "newPassword" && "Créez votre nouveau mot de passe sécurisé."}
          {step === "success" && "Votre mot de passe a été réinitialisé avec succès !"}
        </p>
      </div>

      {/* Indicateur de progression */}
      {step !== "success" && (
        <div className="flex items-center justify-center gap-2 mb-6">
          {[
            { id: "email", label: "E-mail", icon: Mail },
            { id: "code", label: "Code OTP", icon: KeyRound },
            { id: "newPassword", label: "Nouveau mot de passe", icon: Lock },
          ].map((s, i, arr) => {
            const stepOrder = ["email", "code", "newPassword"];
            const currentIdx = stepOrder.indexOf(step);
            const sIdx = stepOrder.indexOf(s.id);
            const isDone = sIdx < currentIdx;
            const isCurrent = sIdx === currentIdx;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  isDone ? "bg-emerald-500 text-white" :
                  isCurrent ? "bg-blue-600 text-white ring-2 ring-blue-300" :
                  "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}>
                  {isDone ? "✓" : i + 1}
                </div>
                {i < arr.length - 1 && (
                  <div className={`h-0.5 w-8 rounded-full ${isDone ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="mb-4 p-3 text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-lg">
          {error}
        </div>
      )}

      {/* ── Étape 1: E-mail ── */}
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
                autoComplete="email"
                className="pl-10"
              />
              <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            📧 Vous recevrez un <strong>code à 6 chiffres</strong> par e-mail à saisir à l'étape suivante. Ce code fonctionne sur mobile et ordinateur.
          </div>

          <Button className="w-full flex items-center justify-center gap-2" type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Envoi du code en cours..." : "Envoyer le code par e-mail"}
          </Button>
        </form>
      )}

      {/* ── Étape 2: Code OTP ── */}
      {step === "code" && (
        <form className="space-y-4" onSubmit={handleVerifyCode}>
          <div className="p-4 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 rounded-xl text-xs space-y-2">
            <p className="font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Code envoyé à <span className="underline">{email}</span>
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              Ouvrez votre boîte de réception et copiez le <strong>code à 6 chiffres</strong> figurant dans l'e-mail de réinitialisation. Vérifiez aussi les spams.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Code de confirmation (6 chiffres)</Label>
            <div className="relative">
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ""))}
                required
                autoComplete="one-time-code"
                className="text-center font-mono text-xl tracking-[0.5em] pl-10"
              />
              <KeyRound className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <Button className="w-full flex items-center justify-center gap-2" type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Vérification..." : "Vérifier le code"}
          </Button>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              onClick={() => { setStep("email"); setInputCode(""); setError(null); }}
              className="hover:underline"
            >
              ← Changer l'adresse e-mail
            </button>
            <button
              type="button"
              onClick={() => { setError(null); handleSendCode({ preventDefault: () => {} } as any); }}
              className="hover:underline text-blue-600"
              disabled={loading}
            >
              Renvoyer le code
            </button>
          </div>
        </form>
      )}

      {/* ── Étape 3: Nouveau mot de passe ── */}
      {step === "newPassword" && (
        <form className="space-y-4" onSubmit={handleResetPassword}>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs text-emerald-700 dark:text-emerald-300">
            ✓ Code validé. Créez maintenant votre nouveau mot de passe.
          </div>

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
                minLength={8}
                autoComplete="new-password"
                className="pl-10"
              />
              <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-xs text-slate-400">Minimum 8 caractères.</p>
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
                minLength={8}
                autoComplete="new-password"
                className="pl-10"
              />
              <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <Button className="w-full flex items-center justify-center gap-2" type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Enregistrement..." : "Enregistrer le nouveau mot de passe"}
          </Button>
        </form>
      )}

      {/* ── Étape 4: Succès ── */}
      {step === "success" && (
        <div className="text-center space-y-5">
          <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Mot de passe réinitialisé !</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
          </div>
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

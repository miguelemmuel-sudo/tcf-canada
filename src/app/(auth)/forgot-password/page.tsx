"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  GraduationCap, Mail, KeyRound, Lock, Eye, EyeOff, ShieldCheck, 
  ArrowLeft, ArrowRight, CheckCircle2, Loader2 
} from "lucide-react";
import { createClient } from "@/lib/supabaseClient";

type Step = "email" | "code" | "newPassword" | "success";

function extractErrorMessage(err: any): string {
  if (!err) return "Erreur lors de l'envoi. Veuillez réessayer.";
  
  let msg = "";
  if (typeof err === "string") {
    msg = err;
  } else if (typeof err.message === "string") {
    msg = err.message;
  } else if (typeof err.error_description === "string") {
    msg = err.error_description;
  } else if (typeof err.msg === "string") {
    msg = err.msg;
  } else {
    try {
      const str = JSON.stringify(err);
      if (str !== "{}" && str !== "[]") msg = str;
    } catch (e) {}
  }

  if (!msg) msg = "Erreur lors de l'envoi de l'e-mail de réinitialisation.";

  // Detection du message d'erreur Resend mode Test (550)
  if (msg.includes("550") || msg.includes("testing emails") || msg.includes("resend.com/domains")) {
    return "💡 Resend est actuellement en mode Test : l'envoi d'e-mails est limité par Resend à l'adresse du propriétaire du compte. Pour envoyer des mails à toutes les adresses, veuillez ajouter et vérifier votre domaine sur resend.com/domains dans les paramètres Supabase SMTP.";
  }

  return msg;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ─── Étape 1: Envoyer le code par e-mail ───────────────────────────────────
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
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (resetError) throw resetError;

      setStep("code");
    } catch (err: any) {
      console.error("[Reset Password Send Error]", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ─── Étape 2: Vérifier le code OTP ──────────────────────────────────────────
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
      const { error: otpError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: cleanCode,
        type: "recovery",
      });

      if (otpError) throw otpError;

      setStep("newPassword");
    } catch (err: any) {
      console.error("[OTP Verify Error]", err);
      setError(extractErrorMessage(err) || "Code invalide ou expiré. Vérifiez votre e-mail ou demandez un nouveau code.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Étape 3: Définir le nouveau mot de passe ──────────────────────────────
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

      await supabase.auth.signOut();
      setStep("success");
    } catch (err: any) {
      console.error("[Update Password Error]", err);
      setError(extractErrorMessage(err) || "Impossible d'enregistrer le nouveau mot de passe. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* Côté Gauche */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-2xl mx-auto w-full z-10">
        
        {/* Header Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-100 dark:border-red-900/50 flex items-center justify-center text-red-600 shadow-sm shrink-0">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              TCF Canada
            </h1>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              Réussissez votre avenir au Canada <span>🇨🇦</span>
            </p>
          </div>
        </div>

        {/* Card Main */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 space-y-6"
        >
          {/* Header Title */}
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Mot de passe oublié
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {step === "email" && "Entrez votre e-mail pour recevoir un code de réinitialisation à 6 chiffres."}
              {step === "code" && `Si cette adresse est associée à un compte, un e-mail a été envoyé. Saisissez le code reçu ou cliquez sur le lien dans l'e-mail.`}
              {step === "newPassword" && "Créez votre nouveau mot de passe sécurisé."}
              {step === "success" && "Votre mot de passe a été réinitialisé avec succès !"}
            </p>
          </div>

          {/* Stepper */}
          {step !== "success" && (
            <div className="flex items-center justify-center gap-2 pt-1 pb-2">
              {[
                { id: "email", label: "E-mail" },
                { id: "code", label: "Code OTP" },
                { id: "newPassword", label: "Nouveau mot de passe" },
              ].map((s, i, arr) => {
                const stepOrder = ["email", "code", "newPassword"];
                const currentIdx = stepOrder.indexOf(step);
                const sIdx = stepOrder.indexOf(s.id);
                const isDone = sIdx < currentIdx;
                const isCurrent = sIdx === currentIdx;
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                      isDone ? "bg-emerald-600 text-white" :
                      isCurrent ? "bg-red-600 text-white" :
                      "bg-slate-200 dark:bg-slate-800 text-slate-500"
                    }`}>
                      {isDone ? "✓" : i + 1}
                    </div>
                    {i < arr.length - 1 && (
                      <div className={`h-0.5 w-8 rounded-full ${isDone ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 text-xs font-semibold leading-relaxed border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* ── Étape 1: E-mail ── */}
          {step === "email" && (
            <form className="space-y-4" onSubmit={handleSendCode}>
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Adresse e-mail du compte
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@exemple.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                📧 Vous recevrez un <strong>code à 6 chiffres</strong> par e-mail à saisir à l'étape suivante. Ce code fonctionne sur mobile et ordinateur.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black text-sm shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Envoyer le code par e-mail</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── Étape 2: Code OTP ── */}
          {step === "code" && (
            <form className="space-y-4" onSubmit={handleVerifyCode}>
              <div className="p-4 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/50 rounded-2xl text-xs space-y-1.5">
                <p className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> Code envoyé à <span className="underline">{email}</span>
                </p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Ouvrez votre boîte de réception et saisissez le <strong>code à 6 chiffres</strong> figurant dans l'e-mail de réinitialisation.
                </p>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Code de confirmation (6 chiffres)
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456 (ou cliquez sur le lien reçu)"
                    className="w-full pl-10 pr-4 py-3 text-center font-mono text-xl tracking-[0.4em] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white font-black text-sm shadow-xl shadow-amber-500/40 hover:shadow-amber-500/60 border border-yellow-300/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Vérification...</span>
                  </>
                ) : (
                  <>
                    <span>Vérifier le code</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── Étape 3: Nouveau mot de passe ── */}
          {step === "newPassword" && (
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white font-black text-sm shadow-xl shadow-amber-500/40 hover:shadow-amber-500/60 border border-yellow-300/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <span>Réinitialiser mon mot de passe</span>
                )}
              </button>
            </form>
          )}

          {/* Étape Succès */}
          {step === "success" && (
            <div className="text-center space-y-4 py-4">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <Link
                href="/login"
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 inline-flex items-center justify-center gap-2"
              >
                Aller à la connexion
              </Link>
            </div>
          )}

          <div className="text-center pt-2">
            <Link href="/login" className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Retour à la connexion</span>
            </Link>
          </div>
        </motion.div>

      </div>

      {/* Côté Droit */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 rounded-l-[80px] overflow-hidden min-h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-90 scale-105 transition-transform duration-1000"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1517935703635-27c5696e850b?auto=format&fit=crop&q=80&w=1400')` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />

        <div className="absolute bottom-16 right-16 z-20 max-w-sm">
          <div className="bg-slate-950/50 backdrop-blur-md border border-white/20 rounded-3xl p-7 text-white shadow-2xl space-y-3">
            <div className="text-red-500 font-serif text-5xl font-black leading-none select-none">“</div>
            <p className="text-sm font-medium leading-relaxed tracking-wide opacity-95">
              Sécurisez l'accès à votre espace d'apprentissage TCF Canada.
            </p>
            <div className="h-1 w-12 bg-red-600 rounded-full mt-2" />
          </div>
        </div>
      </div>

    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  GraduationCap, Lock, Eye, EyeOff, ShieldCheck, 
  ArrowLeft, Loader2, ArrowRight
} from "lucide-react";
import { createClient } from "@/lib/supabaseClient";

function extractErrorMessage(err: any): string {
  if (!err) return "Erreur. Veuillez réessayer.";
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  if (err.error_description) return err.error_description;
  return "Une erreur est survenue.";
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [checking, setChecking] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Vérifier si l'utilisateur a une session active (suite au clic sur le lien magique)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Pas de session, on redirige vers forgot-password pour qu'il puisse demander un code
        router.replace("/forgot-password");
      } else {
        setChecking(false);
      }
    };
    checkSession();
  }, [router, supabase]);

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

      // Déconnexion propre pour forcer la reconnexion avec le nouveau mdp
      await supabase.auth.signOut();
      setSuccess(true);
    } catch (err: any) {
      console.error("[Update Password Error]", err);
      setError(extractErrorMessage(err) || "Impossible d'enregistrer le nouveau mot de passe. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm font-medium">Vérification du lien sécurisé...</p>
        </div>
      </div>
    );
  }

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
              Réinitialisation
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {success ? "Votre mot de passe a été réinitialisé avec succès !" : "Créez votre nouveau mot de passe sécurisé."}
            </p>
          </div>

          {!success ? (
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

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-medium border border-red-100 dark:border-red-900/50 flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">⚠️</div>
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white font-black text-sm shadow-xl shadow-amber-500/40 hover:shadow-amber-500/60 border border-yellow-300/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <span>Enregistrer le mot de passe</span>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Votre compte est de nouveau sécurisé. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              
              <Link 
                href="/login"
                className="block w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm shadow-lg transition-all"
              >
                Se connecter
              </Link>
            </div>
          )}

        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center sm:text-left">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour à la connexion
          </Link>
        </div>

      </div>

      {/* Côté Droit - Illustration */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
        
        <div className="relative z-10 max-w-md text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-white mb-6 shadow-2xl">
            <Lock className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 leading-tight">
            Sécurité maximale
          </h2>
          <p className="text-slate-300 font-medium leading-relaxed">
            Vos données sont chiffrées de bout en bout et hébergées sur des serveurs sécurisés. Nous utilisons les technologies les plus avancées pour protéger votre compte.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  GraduationCap, Lock, Mail, Eye, EyeOff, ShieldCheck, 
  ArrowRight, BookOpen, TrendingUp, Target, Globe, Loader2 
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { AuthRightPanel } from "@/components/auth/AuthRightPanel";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* Côté Gauche / Formulaire Principal */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-14 max-w-xl mx-auto w-full z-10">
        
        {/* Header Logo TCF Canada */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-100 dark:border-red-900/50 flex items-center justify-center text-red-600 shadow-sm shrink-0">
            <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              TCF Canada
            </h1>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              Réussissez votre avenir au Canada <span>🇨🇦</span>
            </p>
          </div>
        </div>

        {/* Visuel Canadien sur Mobile (Visible uniquement sur Smartphone) */}
        <AuthRightPanel quote="Chaque effort aujourd'hui, est un pas de plus vers votre avenir au Canada." />

        {/* Form Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 space-y-5 sm:space-y-6"
        >
          {/* Card Header Icon & Title */}
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-100 dark:border-red-900/40 flex items-center justify-center text-red-600 shrink-0">
              <Lock className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Bon retour ! <span className="text-lg sm:text-xl">👋</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Connectez-vous pour continuer votre préparation au TCF.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 text-xs font-bold border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Field: Adresse email */}
            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="exemple@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Field: Mot de passe */}
            <div>
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot Password (Fixed mobile collision with flex wrap) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 accent-red-600 shrink-0"
                />
                <span>Se souvenir de moi</span>
              </label>

              <Link 
                href="/forgot-password" 
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Primary CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#D91B24] hover:bg-[#B8141C] text-white font-black text-sm shadow-lg shadow-red-600/30 hover:shadow-red-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 shrink-0">
              ou continuer avec
            </span>
          </div>

          {/* Security Info Box */}
          <div className="bg-red-50/60 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 rounded-2xl p-4 flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 shrink-0 mt-0.5">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Vos données sont sécurisées</p>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Nous protégeons vos informations avec les normes de sécurité les plus élevées.
              </p>
            </div>
          </div>

          {/* Toggle Register Link */}
          <div className="text-center pt-2">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Pas encore de compte ?{" "}
              <Link href="/register" className="font-bold text-red-600 dark:text-red-400 hover:underline">
                S'inscrire
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Footer 4 Feature Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 sm:pt-8 border-t border-slate-200/60 dark:border-slate-800/60 mt-6 sm:mt-8 text-center">
          <div className="space-y-1">
            <div className="h-9 w-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <p className="font-bold text-xs text-slate-900 dark:text-white">Préparez-vous</p>
            <p className="text-[10px] text-slate-400 leading-tight">avec des ressources officielles</p>
          </div>

          <div className="space-y-1">
            <div className="h-9 w-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <p className="font-bold text-xs text-slate-900 dark:text-white">Progressez</p>
            <p className="text-[10px] text-slate-400 leading-tight">à votre rythme et suivez vos résultats</p>
          </div>

          <div className="space-y-1">
            <div className="h-9 w-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto">
              <Target className="h-4.5 w-4.5" />
            </div>
            <p className="font-bold text-xs text-slate-900 dark:text-white">Atteignez vos objectifs</p>
            <p className="text-[10px] text-slate-400 leading-tight">et réalisez vos rêves</p>
          </div>

          <div className="space-y-1">
            <div className="h-9 w-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto">
              <Globe className="h-4.5 w-4.5" />
            </div>
            <p className="font-bold text-xs text-slate-900 dark:text-white">Ouvrez les portes</p>
            <p className="text-[10px] text-slate-400 leading-tight">de votre avenir au Canada</p>
          </div>
        </div>

      </div>

    </div>
  );
}

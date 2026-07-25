"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  GraduationCap, User, Mail, Lock, Eye, EyeOff, ShieldCheck, 
  ArrowRight, Check, Headphones, BarChart2, Target, Shield, Loader2, X
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { AuthRightPanel } from "@/components/auth/AuthRightPanel";

const subscriptionPlans = [
  {
    id: "standard",
    name: "Pack Standard",
    price: "15.000 FCFA",
    period: " (Accès 30 jours)",
    description: "La formule idéale pour démarrer votre préparation au TCF Canada.",
    features: [
      "Accès plateforme 30 jours",
      "10 tests réels complets",
      "Correction automatique QCM",
    ],
    badge: null,
    popular: false,
  },
  {
    id: "griffon",
    name: "Pack Griffon d'Or",
    price: "25.000 FCFA",
    period: " (Accès 30 jours)",
    description: "Le pack le plus populaire pour maximiser votre score au TCF.",
    features: [
      "Accès plateforme 30 jours",
      "Simulations et tests de 1h 30",
      "Corrections IA + Formateurs humains",
      "Messagerie directe avec Coach",
      "Support personnalisé 7j/7",
    ],
    badge: "Le plus populaire",
    popular: true,
  },
  {
    id: "vip",
    name: "Pack VIP & Coaching",
    price: "100.000 FCFA",
    period: " (Accès 30 jours)",
    description: "Accompagnement d'excellence individuel avec suivi complet.",
    features: [
      "Tout le Pack Griffon d'Or inclus (30 jours)",
      "Simulations et tests de 2h 00 (max)",
      "Coaching 1-on-1 avec un expert certifié",
      "Suivi personnalisé du dossier d'immigration",
    ],
    badge: "VIP & Accompagnement",
    popular: false,
  },
];

function formatAuthError(err: any): string {
  if (!err) return "Une erreur est survenue lors de l'inscription.";

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

  if (!msg) {
    return "Erreur d'authentification inconnue.";
  }

  const lower = msg.toLowerCase();
  
  if (lower.includes("550") || lower.includes("testing emails") || lower.includes("resend.com/domains") || lower.includes("error sending confirmation email")) {
    return "💡 L'envoi d'e-mail a échoué (limite de test Resend). Veuillez vérifier que « Confirm email » est bien désactivé dans Supabase.";
  }
  if (lower.includes("already registered") || lower.includes("already exists") || lower.includes("user already exists") || lower.includes("unique constraint") || lower.includes("user_exists")) {
    return "❌ Cette adresse e-mail est déjà associée à un compte TCF Canada. Veuillez vous connecter ou utiliser une autre adresse e-mail.";
  }
  if (lower.includes("password") || lower.includes("weak") || lower.includes("at least")) {
    return "❌ Le mot de passe choisi est trop faible. Veuillez choisir un mot de passe d'au moins 8 caractères.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests") || lower.includes("over_email_send_rate_limit")) {
    return "⏳ Trop de tentatives d'inscription en peu de temps. Veuillez patienter quelques minutes avant de réessayer.";
  }
  if (lower.includes("invalid email") || lower.includes("unable to validate email")) {
    return "❌ L'adresse e-mail saisie ne semble pas valide. Veuillez la vérifier.";
  }
  if (lower.includes("failed to fetch") || lower.includes("network") || lower.includes("connection")) {
    return "🌐 Erreur de connexion au serveur d'authentification. Veuillez vérifier votre connexion Internet et réessayer.";
  }

  // Affiche l'erreur brute pour faciliter le débogage si elle ne correspond à aucun cas connu
  return `Erreur: ${msg}`;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Data State
  const [formDataState, setFormDataState] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [selectedPlan, setSelectedPlan] = useState<string>("griffon");

  const handleStep1Submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError("Vous devez accepter les conditions d'utilisation pour continuer.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formDataState.email)) {
      setError("L'adresse e-mail saisie n'est pas valide.");
      return;
    }

    if (formDataState.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (formDataState.password !== formDataState.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError(null);

    // Fonction utilitaire : extraire un message lisible de n'importe quelle erreur
    const safeErrorMsg = (val: any): string => {
      if (!val) return "";
      if (typeof val === "string" && val.trim()) return val.trim();
      if (typeof val === "object") {
        if (typeof val.message === "string" && val.message.trim()) return val.message.trim();
        if (typeof val.error_description === "string" && val.error_description.trim()) return val.error_description.trim();
        try {
          const s = JSON.stringify(val);
          if (s && s !== "{}" && s !== "[]" && s !== "null") return `Erreur technique: ${s}`;
        } catch (_) {}
      }
      return "";
    };

    try {
      let response: Response;
      let data: any;

      // Appel API serveur
      try {
        response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formDataState.name,
            email: formDataState.email,
            password: formDataState.password,
            pack: selectedPlan,
          }),
        });
      } catch (fetchErr: any) {
        setError("🌐 Impossible de joindre le serveur. Vérifiez votre connexion Internet.");
        setLoading(false);
        return;
      }

      // Analyse de la réponse JSON (même en cas d'erreur serveur)
      try {
        data = await response.json();
      } catch (_) {
        data = {};
      }

      // Erreur HTTP → afficher le message serveur
      if (!response.ok) {
        const msg = safeErrorMsg(data?.error) || safeErrorMsg(data?.message) || safeErrorMsg(data);
        setError(`❌ ${msg || "Une erreur est survenue lors de l'inscription. Veuillez réessayer."}`);
        setLoading(false);
        return;
      }

      // Succès → connexion auto et localStorage
      const supabase = createClient();
      try {
        await supabase.auth.signInWithPassword({
          email: formDataState.email,
          password: formDataState.password,
        });
      } catch (_) {}

      try {
        const { clearAllUserLocalData } = await import("@/utils/sessionManager");
        clearAllUserLocalData();
      } catch (_) {}

      try {
        localStorage.setItem("griffon_user_name", formDataState.name || formDataState.email);
        localStorage.setItem("griffon_user_email", formDataState.email);
        localStorage.setItem("griffon_user_plan", selectedPlan);
        localStorage.setItem("griffon_user_new", "true");
      } catch (_) {}

      // Admin → dashboard direct
      if (data.admin) {
        try { localStorage.setItem("griffon_user_is_admin", "true"); } catch (_) {}
        window.location.href = "/dashboard";
        return;
      }

      // Redirection vers Fapshi ou page de paiement
      if (data.link) {
        window.location.href = data.link;
      } else if (data.redirectTo) {
        router.push(data.redirectTo);
      } else {
        router.push(`/dashboard/payments?pack=${selectedPlan}&initiate=true`);
      }

    } catch (err: any) {
      console.error("[Inscription] Erreur globale:", err);
      setError("❌ Une erreur inattendue est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };




  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* Côté Gauche: Formulaire & Informations */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-14 max-w-xl mx-auto w-full z-10">
        
        {/* Header Logo TCF Canada */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-amber-400/20 via-yellow-500/20 to-amber-600/10 border border-amber-400/60 flex items-center justify-center text-amber-500 dark:text-yellow-400 shadow-lg shadow-amber-500/25 shrink-0">
            <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
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
        <AuthRightPanel quote="Chaque étape vous rapproche de votre avenir au Canada." />

        {/* Form Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 space-y-5 sm:space-y-6"
        >
          {/* Card Header Icon & Title */}
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-amber-400/20 via-yellow-500/20 to-amber-600/10 border border-amber-400/60 flex items-center justify-center text-amber-500 dark:text-yellow-400 shadow-lg shadow-amber-500/25 shrink-0">
              <User className="h-5 w-5 sm:h-6 sm:w-6 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Créez votre compte <span className="text-lg sm:text-xl">👋</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {step === 1 ? "Étape 1 sur 2 : Vos informations personnelles" : "Étape 2 sur 2 : Choix de votre formule"}
              </p>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-2 sm:gap-3 pt-1 pb-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className={`h-6 w-6 sm:h-7 sm:w-7 rounded-full text-[11px] sm:text-xs font-extrabold flex items-center justify-center ${step === 1 ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md shadow-amber-500/40 border border-yellow-300/40" : "bg-emerald-600 text-white"}`}>
                1
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">Informations personnelles</span>
            </div>

            <div className={`h-0.5 flex-1 rounded-full transition-all ${step === 2 ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.6)]" : "bg-slate-200 dark:bg-slate-800"}`} />

            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className={`h-6 w-6 sm:h-7 sm:w-7 rounded-full text-[11px] sm:text-xs font-extrabold flex items-center justify-center transition-all ${step === 2 ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-white shadow-lg shadow-amber-500/60 border border-yellow-200 ring-4 ring-amber-400/30 animate-pulse" : "bg-slate-200 dark:bg-slate-800 text-slate-500"}`}>
                2
              </span>
              <span className={`text-[11px] sm:text-xs transition-all ${step === 2 ? "text-amber-600 dark:text-yellow-400 font-black drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" : "font-bold text-slate-500"}`}>Choix de la formule</span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 text-xs font-bold border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* ÉTAPE 1: Informations Personnelles */}
          {step === 1 && (
            <form className="space-y-4" onSubmit={handleStep1Submit}>
              {/* Nom complet */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 dark:text-yellow-400" />
                  <input
                    type="text"
                    required
                    value={formDataState.name}
                    onChange={(e) => setFormDataState({ ...formDataState, name: e.target.value })}
                    placeholder="Jean Dupont"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 dark:text-yellow-400" />
                  <input
                    type="email"
                    required
                    value={formDataState.email}
                    onChange={(e) => setFormDataState({ ...formDataState, email: e.target.value })}
                    placeholder="nom@exemple.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 dark:text-yellow-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={formDataState.password}
                    onChange={(e) => setFormDataState({ ...formDataState, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Doit contenir au moins 8 caractères.</p>
              </div>

              {/* Confirmer le mot de passe */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 dark:text-yellow-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={formDataState.confirmPassword}
                    onChange={(e) => setFormDataState({ ...formDataState, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all"
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

              {/* Checkbox Conditions */}
              <div className="flex items-start space-x-2.5 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 accent-amber-500 shrink-0"
                  required
                />
                <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                  J'accepte les{" "}
                  <span className="font-bold text-slate-900 dark:text-white">conditions d'utilisation</span> et la politique de confidentialité.{" "}
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-amber-600 dark:text-yellow-400 font-bold hover:underline inline-block ml-0.5 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]"
                  >
                    Voir plus
                  </button>
                </label>
              </div>

              {/* Primary CTA Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white font-black text-sm shadow-xl shadow-amber-500/40 hover:shadow-amber-500/60 border border-yellow-300/40 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>Continuer vers le choix de la formule</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* ÉTAPE 2: Choix de la formule */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-3">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      selectedPlan === plan.id
                        ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 shadow-xl shadow-amber-500/30 ring-2 ring-amber-400/50"
                        : plan.popular
                        ? "border-amber-400/80 bg-gradient-to-b from-amber-50/30 to-transparent dark:from-amber-950/20 dark:to-transparent shadow-md shadow-amber-500/20 hover:border-amber-500"
                        : "border-slate-200 dark:border-slate-800 hover:border-amber-300/50"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 text-[10px] font-black uppercase px-3.5 py-0.5 rounded-full shadow-lg shadow-amber-500/50 border border-yellow-100 tracking-wider animate-pulse">
                        Le plus populaire 🌟
                      </span>
                    )}

                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">{plan.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{plan.description}</p>
                      </div>
                      <span className="font-black text-base text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 dark:from-yellow-300 dark:via-amber-400 dark:to-yellow-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] shrink-0 ml-2">
                        {plan.price}
                      </span>
                    </div>

                    <ul className="mt-3 space-y-1 border-t border-slate-200/60 dark:border-slate-800 pt-2">
                      {plan.features.map((feat, fi) => (
                        <li key={fi} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-600 hover:border-amber-400"
                >
                  ← Retour
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white font-black text-sm shadow-xl shadow-amber-500/40 hover:shadow-amber-500/60 border border-yellow-300/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Création du compte...</span>
                    </>
                  ) : (
                    <>
                      <span>S'inscrire et commencer la préparation</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Toggle Login Link */}
          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Déjà un compte ?{" "}
              <Link href="/login" className="font-bold text-amber-600 dark:text-yellow-400 hover:underline drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]">
                Se connecter
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Footer 4 Feature Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 sm:pt-8 border-t border-slate-200/60 dark:border-slate-800/60 mt-6 sm:mt-8 text-center">
          <div className="space-y-1">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400/20 via-yellow-500/20 to-amber-600/10 border border-amber-400/50 text-amber-500 dark:text-yellow-400 shadow-md shadow-amber-500/20 flex items-center justify-center mx-auto">
              <Shield className="h-4.5 w-4.5" />
            </div>
            <p className="font-bold text-xs text-slate-900 dark:text-white">Sécurisé</p>
            <p className="text-[10px] text-slate-400 leading-tight">Vos données sont protégées avec les meilleures normes</p>
          </div>

          <div className="space-y-1">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400/20 via-yellow-500/20 to-amber-600/10 border border-amber-400/50 text-amber-500 dark:text-yellow-400 shadow-md shadow-amber-500/20 flex items-center justify-center mx-auto">
              <Target className="h-4.5 w-4.5" />
            </div>
            <p className="font-bold text-xs text-slate-900 dark:text-white">Personnalisé</p>
            <p className="text-[10px] text-slate-400 leading-tight">Un parcours adapté à vos objectifs et à votre niveau</p>
          </div>

          <div className="space-y-1">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400/20 via-yellow-500/20 to-amber-600/10 border border-amber-400/50 text-amber-500 dark:text-yellow-400 shadow-md shadow-amber-500/20 flex items-center justify-center mx-auto">
              <BarChart2 className="h-4.5 w-4.5" />
            </div>
            <p className="font-bold text-xs text-slate-900 dark:text-white">Efficace</p>
            <p className="text-[10px] text-slate-400 leading-tight">Progressez à votre rythme avec des outils performants</p>
          </div>

          <div className="space-y-1">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400/20 via-yellow-500/20 to-amber-600/10 border border-amber-400/50 text-amber-500 dark:text-yellow-400 shadow-md shadow-amber-500/20 flex items-center justify-center mx-auto">
              <Headphones className="h-4.5 w-4.5" />
            </div>
            <p className="font-bold text-xs text-slate-900 dark:text-white">Accompagné</p>
            <p className="text-[10px] text-slate-400 leading-tight">Notre équipe est là pour vous aider à chaque étape</p>
          </div>
        </div>

        <p className="text-[11px] text-center text-slate-400 pt-4">
          🔒 TCF Canada respecte votre vie privée.
        </p>

      </div>

      {/* Modal Conditions */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-500 dark:text-yellow-400" />
                Politique de confidentialité
              </h3>
              <button onClick={() => setShowPrivacyModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 max-h-60 overflow-y-auto leading-relaxed">
              <p>Vos données sont protégées selon les normes de confidentialité en vigueur.</p>
              <p>Nous ne partageons vos données avec aucun tiers non autorisé. Vos résultats d'examens et informations personnelles sont strictement confidentiels.</p>
            </div>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold text-xs shadow-lg shadow-amber-500/30"
            >
              Compris et accepter
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

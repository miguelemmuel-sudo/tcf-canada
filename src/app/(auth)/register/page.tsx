"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { Check, Sparkles, Zap, ShieldCheck } from "lucide-react";

const subscriptionPlans = [
  {
    id: "standard",
    name: "Pack Standard",
    price: "29.000 FCFA",
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
    price: "59.000 FCFA",
    period: " (Accès 30 jours)",
    description: "Le pack le plus populaire pour maximiser votre score au TCF.",
    features: [
      "Accès plateforme 30 jours",
      "Corrections IA + Formateurs humains",
      "Simulations réelles illimitées",
      "Support personnalisé 7j/7",
    ],
    badge: "Le plus populaire",
    popular: true,
  },
  {
    id: "vip",
    name: "Pack VIP & Coaching",
    price: "99.000 FCFA",
    period: " (Accès 30 jours)",
    description: "Accompagnement d'excellence individuel avec suivi complet.",
    features: [
      "Tout le Pack Griffon d'Or inclus (30 jours)",
      "Coaching 1-on-1 avec un expert certifié",
      "Suivi personnalisé du dossier d'immigration",
    ],
    badge: "VIP & Accompagnement",
    popular: false,
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Form Data State
  const [formDataState, setFormDataState] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [selectedPlan, setSelectedPlan] = useState<string>("griffon");

  const handleStep1Submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError("Vous devez accepter les conditions d'utilisation pour continuer.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const name = formData.get("name") as string;

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setFormDataState({ name, email, password });
    setStep(2); // Passage au choix d'abonnement
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formDataState.email,
        password: formDataState.password,
        options: {
          data: {
            full_name: formDataState.name,
            subscription_type: selectedPlan,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Enregistrer la mise à jour du profil si l'utilisateur est immédiatement disponible
      if (data.user) {
        await supabase
          .from("profiles")
          .update({ subscription_type: selectedPlan, full_name: formDataState.name, email: formDataState.email })
          .eq("id", data.user.id);
      }

      localStorage.setItem("griffon_user_name", formDataState.name || formDataState.email);
      localStorage.setItem("griffon_user_email", formDataState.email);
      localStorage.setItem("griffon_user_plan", selectedPlan);
      localStorage.setItem("griffon_user_new", "true");

      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de l'inscription.");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      {/* Étape 1 : Formulaire d'information */}
      {step === 1 && (
        <>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Créez votre compte</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Étape 1 sur 2 : Vos informations personnelles
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleStep1Submit}>
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input id="name" name="name" type="text" placeholder="Jean Dupont" defaultValue={formDataState.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="nom@exemple.com" defaultValue={formDataState.email} required />
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
            
            <Button className="w-full pt-2" type="submit">
              Continuer vers le choix de la formule →
            </Button>
          </form>
        </>
      )}

      {/* Étape 2 : Choix du pack d'abonnement */}
      {step === 2 && (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Choisissez votre pack d'abonnement
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Sélectionnez la formule adaptée à vos objectifs TCF Canada.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
            {subscriptionPlans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 shadow-md"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"
                    }`}>
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>

                    <div className="flex-1 space-y-1">
                      {plan.badge && (
                        <span className="inline-block mb-1 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-blue-600 text-white">
                          {plan.badge}
                        </span>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                          {plan.name}
                        </h4>
                        <div className="text-left sm:text-right">
                          <span className="font-extrabold text-blue-600 dark:text-blue-400 text-base">{plan.price}</span>
                          <span className="text-[11px] text-slate-400"> {plan.period}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {plan.description}
                      </p>

                      <ul className="mt-2 space-y-1 pt-1">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                            <span className="text-blue-500 font-bold">✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 space-y-2">
            <Button
              className="w-full h-11 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleFinalSubmit}
              disabled={loading}
            >
              {loading ? "Finalisation de votre compte..." : "Valider et créer mon compte"}
            </Button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xs text-slate-500 hover:underline text-center pt-1"
            >
              ← Revenir aux informations personnelles
            </button>
          </div>
        </>
      )}

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


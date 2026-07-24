"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Crown, Sparkles, X, ArrowRight, ShieldCheck, CreditCard, AlertCircle, Loader2 } from "lucide-react";
import { PackType, PACK_CONFIGS, setUserPack, isUserAdmin } from "@/utils/subscriptionEngine";
import { createClient } from "@/lib/supabaseClient";

interface UpgradePackModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPack?: PackType;
}

export function UpgradePackModal({ isOpen, onClose, targetPack = "griffon" }: UpgradePackModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState<PackType>(targetPack);
  const adminMode = isUserAdmin();

  if (!isOpen) return null;

  // 1. Initialisation officielle du paiement Fapshi (Mode Candidat et Mode Test Réel Admin)
  const handleFapshiPayment = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Si l'utilisateur n'est pas connecté, on le redirige d'abord vers la connexion / inscription
        onClose();
        router.push(`/login?redirect=/dashboard/payments`);
        return;
      }

      // Appel à notre API serveur sécurisée qui impose les tarifs et contacte Fapshi
      const res = await fetch("/api/fapshi/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pack: selectedPack,
          redirectUrl: `${window.location.origin}/dashboard/payments?status=check&pack=${selectedPack}`
        })
      });

      const data = await res.json();

      if (!res.ok || !data.link) {
        throw new Error(data.error || "Impossible d'initialiser le paiement avec Fapshi.");
      }

      // Redirection transparente et sécurisée vers la page de paiement hébergée Fapshi
      window.location.href = data.link;

    } catch (e: any) {
      console.error("Erreur Fapshi Initiate:", e);
      setErrorMsg(e.message || "Erreur de communication avec la passerelle de paiement.");
      setLoading(false);
    }
  };

  // 2. Contournement Admin gratuit pour vos tests rapides de contenu
  const handleAdminFreeBypass = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      setUserPack(selectedPack);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ subscription_type: selectedPack, updated_at: new Date().toISOString() })
          .eq("id", user.id);

        await supabase
          .from("subscriptions")
          .insert({
            user_id: user.id,
            pack: selectedPack,
            amount: "0",
            currency: "FCFA",
            status: "active",
            started_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
          });
      }

      // Notifier le tableau de bord et fermer
      window.dispatchEvent(new Event("storage_user_pack_updated"));
      setLoading(false);
      onClose();
      router.refresh();
    } catch (e: any) {
      console.error("Erreur bypass admin:", e);
      setErrorMsg(e.message || "Erreur lors de l'activation.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-5 sm:p-8 flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in fade-in zoom-in duration-200 relative my-auto">
        
        {/* Header & Badges (Fixe en haut) */}
        <div className="shrink-0 space-y-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          {adminMode && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center gap-2.5 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <Sparkles className="h-4 w-4 shrink-0 animate-pulse text-amber-500" />
              <span>
                <strong>Mode Admin :</strong> Test monétique réel Fapshi ou activation gratuite.
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">Souscrire / Mettre à niveau</h3>
                <p className="text-[11px] sm:text-xs text-slate-500">Choisissez votre formule TCF Canada et réglez en toute sécurité.</p>
              </div>
            </div>

            <button onClick={onClose} disabled={loading} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 ml-2">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Zone de contenu défilante sur mobile */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Packs Choice List */}
          <div className="space-y-3">
            {(["standard", "griffon", "vip"] as PackType[]).map((pKey) => {
              const p = PACK_CONFIGS[pKey];
              const isSelected = selectedPack === pKey;
              return (
                <div
                  key={pKey}
                  onClick={() => !loading && setSelectedPack(pKey)}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    isSelected
                      ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {p.badge && (
                    <span className="absolute -top-3 right-4 bg-amber-600 text-white text-[9px] sm:text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                      {p.badge}
                    </span>
                  )}

                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        {p.name}
                        {isSelected && <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 stroke-[3]" />}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                        {pKey === "standard" && "Validité 1 mois • 2 modules • 20 cours • 20 tests d'examens"}
                        {pKey === "griffon" && "Validité 1 mois • 10 modules • 500+ cours • Corrections IA & Messagerie"}
                        {pKey === "vip" && "Validité 2 mois • 20 modules • 500+ cours • Coaching 1-on-1 & Réservations"}
                      </p>
                    </div>
                    <span className="font-black text-sm sm:text-base text-amber-600 dark:text-amber-400 shrink-0">
                      {p.price}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info box Fapshi */}
          <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-3.5 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
            <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 shrink-0" />
            <p className="leading-relaxed">
              <strong className="font-bold text-slate-900 dark:text-white block">Paiement 100% sécurisé via Fapshi :</strong>
              Accepte MTN Mobile Money, Orange Money, Moov, Wave, Visa & Mastercard. Conservation de tous vos acquis.
            </p>
          </div>
        </div>

        {/* Action Buttons (Fixe en bas) */}
        <div className="shrink-0 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {adminMode ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleFapshiPayment}
                disabled={loading}
                className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 shrink-0" />
                    <span className="truncate">Tester le paiement Fapshi (Mode Réel)</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAdminFreeBypass}
                disabled={loading}
                className="w-full py-2.5 sm:py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Confirmer gratuitement ({PACK_CONFIGS[selectedPack].name})</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="py-3 px-4 sm:px-5 rounded-2xl border border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 shrink-0"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleFapshiPayment}
                disabled={loading}
                className="flex-1 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 overflow-hidden"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950 shrink-0" />
                    <span className="truncate">Redirection Fapshi...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 text-slate-950 shrink-0" />
                    <span className="truncate">S'abonner via Fapshi ({PACK_CONFIGS[selectedPack].price})</span>
                    <ArrowRight className="h-4 w-4 text-slate-950 shrink-0" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Lock, Check, Crown, Sparkles, X, ArrowRight, ShieldCheck } from "lucide-react";
import { PackType, PACK_CONFIGS, getCurrentUserPack, setUserPack } from "@/utils/subscriptionEngine";
import { createClient } from "@/lib/supabaseClient";

interface UpgradePackModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPack?: PackType;
}

export function UpgradePackModal({ isOpen, onClose, targetPack = "griffon" }: UpgradePackModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPack, setSelectedPack] = useState<PackType>(targetPack);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      setUserPack(selectedPack);

      // Also update profile in Supabase if user is logged in
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ subscription_type: selectedPack, updated_at: new Date().toISOString() })
          .eq("id", user.id);
      }

      setLoading(false);
      onClose();
    } catch (e) {
      console.error("Erreur mise à jour pack:", e);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in duration-200 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Changer de Formule TCF</h3>
              <p className="text-xs text-slate-500">Mettez à niveau votre compte et débloquez tout le contenu.</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Packs Choice List */}
        <div className="space-y-3">
          {(["standard", "griffon", "vip"] as PackType[]).map((pKey) => {
            const p = PACK_CONFIGS[pKey];
            const isSelected = selectedPack === pKey;
            return (
              <div
                key={pKey}
                onClick={() => setSelectedPack(pKey)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  isSelected
                    ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/30 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3 right-4 bg-amber-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                    {p.badge}
                  </span>
                )}

                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      {p.name}
                      {isSelected && <Check className="h-4 w-4 text-amber-600" />}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {pKey === "standard" && "2 modules • 20 cours • 20 tests d'examens"}
                      {pKey === "griffon" && "10 modules • 500+ cours • Corrections IA actives"}
                      {pKey === "vip" && "20 modules • 500+ cours • Coaching 1-on-1 & Messagerie"}
                    </p>
                  </div>
                  <span className="font-black text-base text-amber-600 shrink-0 ml-2">
                    {p.price}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info box */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <p>Toutes vos données, votre progression et votre historique d'examens sont intégralement conservés lors de la mise à niveau.</p>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-600"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleUpgrade}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Mise à jour en cours...</span>
            ) : (
              <>
                <span>Confirmer le choix du {PACK_CONFIGS[selectedPack].name}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

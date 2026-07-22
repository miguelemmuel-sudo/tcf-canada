"use client";

import { useState } from "react";
import { Lock, Crown, ArrowRight, Sparkles } from "lucide-react";
import { PackType, getCurrentUserPack, getPackPermissions } from "@/utils/subscriptionEngine";
import { UpgradePackModal } from "./UpgradePackModal";

interface LockedFeatureBannerProps {
  featureName: string;
  requiredPackName?: string;
  targetPack?: PackType;
}

export function LockedFeatureBanner({
  featureName,
  requiredPackName,
  targetPack
}: LockedFeatureBannerProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const currentPack = getCurrentUserPack();
  const config = getPackPermissions(currentPack);

  const isVipOnly = targetPack === "vip" || featureName.toLowerCase().includes("coach") || featureName.toLowerCase().includes("visio") || featureName.toLowerCase().includes("réserv") || featureName.toLowerCase().includes("messa");
  const target: PackType = isVipOnly ? "vip" : (targetPack || config.nextPack || "griffon");
  const targetName = requiredPackName || (isVipOnly ? "VIP & Coaching" : (currentPack === "standard" ? "Griffon D'OR ou VIP & Coaching" : "VIP & Coaching"));
  const buttonText = isVipOnly ? "Passer au Pack VIP & Coaching" : (currentPack === "standard" ? "Passer au Pack Griffon D'OR" : "Passer au Pack VIP & Coaching");

  return (
    <div className="min-h-[500px] flex items-center justify-center p-4 sm:p-8">
      <UpgradePackModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        targetPack={target}
      />

      <div className="bg-white dark:bg-slate-950 rounded-3xl p-8 sm:p-12 max-w-xl w-full text-center space-y-6 shadow-xl border border-slate-200/80 dark:border-slate-800">
        
        {/* Lock Icon */}
        <div className="h-20 w-20 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center mx-auto text-amber-600 shadow-sm">
          <Lock className="h-10 w-10 stroke-[2]" />
        </div>

        {/* Feature Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-extrabold text-xs uppercase tracking-wide">
            <Crown className="h-3.5 w-3.5" />
            <span>Fonctionnalité Verrouillée</span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {featureName}
          </h2>

          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed pt-1">
            Fonction réservée aux abonnés {targetName}.
          </p>
        </div>

        {/* Upgrade Button */}
        <div className="pt-4">
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="w-full py-4 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-sm shadow-xl shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>{buttonText}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <p className="text-[11px] text-slate-400">
          🔒 Vous pouvez changer de formule à tout moment en conservant toute votre progression.
        </p>

      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Crown } from "lucide-react";
import { getCurrentUserPack, getPackPermissions, PackType } from "@/utils/subscriptionEngine";
import { UpgradePackModal } from "./UpgradePackModal";

export function UpsellBanner() {
  const [pack, setPack] = useState<PackType>("griffon");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const refreshPack = () => {
    setPack(getCurrentUserPack());
  };

  useEffect(() => {
    refreshPack();
    window.addEventListener("storage_user_pack_updated", refreshPack);
    return () => window.removeEventListener("storage_user_pack_updated", refreshPack);
  }, []);

  const config = getPackPermissions(pack);

  // No upsell banner needed for VIP (all active)
  if (pack === "vip" || !config.upsellBannerText) return null;

  return (
    <>
      <UpgradePackModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        targetPack={config.nextPack}
      />

      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-amber-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 mt-0.5">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs uppercase tracking-wide bg-white/20 px-2 py-0.5 rounded-full text-white">
                Offre spéciale {config.name}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold leading-relaxed text-white">
              {config.upsellBannerText}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowUpgradeModal(true)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-amber-800 hover:bg-amber-50 font-black text-xs shadow-md transition-all shrink-0 flex items-center justify-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          <span>Mettre à niveau ({config.nextPackName})</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </>
  );
}

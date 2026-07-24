"use client";

import { motion } from "framer-motion";

interface AuthRightPanelProps {
  quote: string;
}

export function AuthRightPanel({ quote }: AuthRightPanelProps) {
  return (
    <>
      {/* Version Mobile: Banner Supérieur sur Smartphone (Visible uniquement sur mobile < 1024px) */}
      <div className="lg:hidden w-full h-52 relative rounded-3xl overflow-hidden mb-6 shadow-xl border border-slate-200 dark:border-slate-800 bg-slate-900 shrink-0">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url('/canada_bg.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
        
        {/* Floating Top Right Badge Mobile */}
        <div className="absolute top-3.5 right-3.5 z-20">
          <div className="bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white font-extrabold text-[10px] flex items-center gap-1.5 shadow-lg">
            <span className="text-xs">🇨🇦</span>
            <span>TCF Canada Officiel</span>
          </div>
        </div>

        {/* Quote Card Mobile */}
        <div className="absolute bottom-3.5 left-4 right-4 z-20">
          <div className="bg-[#0B132B]/75 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-white shadow-lg space-y-1">
            <p className="text-[11px] font-semibold leading-snug text-white">
              “{quote}”
            </p>
          </div>
        </div>
      </div>

      {/* Version Desktop: Grand Volet Droit Vertical (Visible uniquement sur grand écran >= 1024px) */}
      <div className="hidden lg:flex flex-1 relative rounded-l-[100px] overflow-hidden min-h-screen bg-slate-900">
        
        {/* Local Canada Sunset Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ 
            backgroundImage: `url('/canada_bg.png')` 
          }}
        />

        {/* Subtle Gradient & Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-transparent" />

        {/* Top Right Floating Badge Desktop */}
        <div className="absolute top-10 right-10 z-20">
          <div className="bg-slate-900/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white font-extrabold text-xs flex items-center gap-2 shadow-xl">
            <span className="text-base">🇨🇦</span>
            <span>TCF Canada Officiel</span>
          </div>
        </div>

        {/* Glassmorphism Quote Box Desktop */}
        <div className="absolute bottom-20 right-14 z-20 max-w-sm">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#0B132B]/60 backdrop-blur-md border border-white/20 rounded-3xl p-7 text-white shadow-2xl space-y-3"
          >
            <div className="text-amber-400 dark:text-yellow-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] font-serif text-5xl font-black leading-none select-none">
              “
            </div>

            <p className="text-sm font-medium leading-relaxed tracking-wide text-white">
              {quote}
            </p>

            <div className="h-1 w-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full mt-3 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
          </motion.div>
        </div>

        {/* Decorative Bottom Right Gold Maple Leaf Silhouette */}
        <div className="absolute bottom-6 right-6 z-10 opacity-80 pointer-events-none">
          <svg className="w-20 h-20 text-amber-500 dark:text-yellow-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] fill-current" viewBox="0 0 24 24">
            <path d="M12 2L13.8 7.2L18.5 4.5L16.8 9.8L22 11.5L17.2 13.8L20 18.5L14.7 16.8L13 22L12 17L11 22L9.3 16.8L4 18.5L6.8 13.8L2 11.5L7.2 9.8L5.5 4.5L10.2 7.2L12 2Z"/>
          </svg>
        </div>

      </div>
    </>
  );
}

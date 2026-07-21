"use client";

import { motion } from "framer-motion";

interface AuthRightPanelProps {
  quote: string;
}

export function AuthRightPanel({ quote }: AuthRightPanelProps) {
  return (
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

      {/* Top Right Floating Badge */}
      <div className="absolute top-10 right-10 z-20">
        <div className="bg-slate-900/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white font-extrabold text-xs flex items-center gap-2 shadow-xl">
          <span className="text-base">🇨🇦</span>
          <span>TCF Canada Officiel</span>
        </div>
      </div>

      {/* Glassmorphism Quote Box */}
      <div className="absolute bottom-20 right-14 z-20 max-w-sm">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[#0B132B]/60 backdrop-blur-md border border-white/20 rounded-3xl p-7 text-white shadow-2xl space-y-3"
        >
          <div className="text-red-500 font-serif text-5xl font-black leading-none select-none">
            “
          </div>

          <p className="text-sm font-medium leading-relaxed tracking-wide text-white">
            {quote}
          </p>

          <div className="h-1 w-12 bg-red-600 rounded-full mt-3" />
        </motion.div>
      </div>

      {/* Decorative Bottom Right Red Maple Leaf Silhouette */}
      <div className="absolute bottom-6 right-6 z-10 opacity-80 pointer-events-none">
        <svg className="w-20 h-20 text-red-600 fill-current" viewBox="0 0 24 24">
          <path d="M12 2L13.8 7.2L18.5 4.5L16.8 9.8L22 11.5L17.2 13.8L20 18.5L14.7 16.8L13 22L12 17L11 22L9.3 16.8L4 18.5L6.8 13.8L2 11.5L7.2 9.8L5.5 4.5L10.2 7.2L12 2Z"/>
        </svg>
      </div>

    </div>
  );
}

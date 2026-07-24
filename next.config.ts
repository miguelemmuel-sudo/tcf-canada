import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Activation de la compression HTTP (Brotli & Gzip) pour réduire la bande passante en Afrique centrale
  compress: true,

  // 2. Optimisation automatique des images en formats de pointe (AVIF et WebP)
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24h de cache CDN minimum pour les images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },

  // 3. Code splitting et optimisation du bundle Javascript pour les smartphones 2-4 Go RAM
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // 4. Configuration des en-têtes HTTP de cache pour Vercel CDN et navigateurs
  async headers() {
    return [
      {
        // Cache immuable de 1 an pour tous les médias et fichiers statiques packagés
        source: "/(.*)\\.(ico|png|jpg|jpeg|svg|webp|avif|woff|woff2|css|js)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Vérification en arrière-plan (Stale-While-Revalidate) pour le Service Worker et le Manifeste
        source: "/(sw\\.js|manifest\\.webmanifest)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

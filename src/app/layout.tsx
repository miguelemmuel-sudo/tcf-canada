import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";

export const viewport: Viewport = {
  themeColor: "#D52B1E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "TCF Canada Pro - Préparation Complète et Officielle au TCF Canada",
  description: "Réussissez votre TCF Canada et accélérez votre projet d'immigration canadienne (Entrée express). Plateforme d'entraînement avec plus de 10 000 cours, examens blancs, et correction par intelligence artificielle. Atteignez les niveaux NCLC 7, NCLC 8 ou NCLC 9.",
  keywords: ["TCF Canada", "Test de connaissance du français pour le Canada", "immigration Canada", "préparation TCF", "examens blancs TCF", "NCLC", "Entrée Express", "EE", "expression orale TCF", "compréhension orale TCF", "compréhension écrite TCF", "expression écrite TCF"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TCF Canada Pro",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}

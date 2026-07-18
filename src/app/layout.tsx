import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";

export const viewport: Viewport = {
  themeColor: "#D52B1E",
};

export const metadata: Metadata = {
  title: "TCF Canada Pro - Préparez votre TCF Canada avec intelligence",
  description: "Réussissez votre examen grâce à une plateforme complète comprenant des examens blancs, une IA correctrice, des statistiques avancées et un suivi personnalisé.",
  keywords: ["TCF Canada", "Test de connaissance du français", "immigration Canada", "préparation TCF"],
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

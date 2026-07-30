"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Printer,
  Download,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  User,
  Calendar,
  Globe,
  QrCode,
  FileCheck,
} from "lucide-react";
import { getUserOverallStats } from "@/utils/resultPersistence";

export default function CertificatesPage() {
  const [userName, setUserName] = useState("Candidat TCF Canada");
  const [stats, setStats] = useState<any>(null);
  const [certDate, setCertDate] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("griffon_user_name");
      if (storedName) setUserName(storedName);
    }
    const computedStats = getUserOverallStats();
    setStats(computedStats);

    setCertDate(
      new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!stats) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Action Header Bar (non imprimable) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 font-bold">
              <Award className="w-3.5 h-3.5 mr-1" /> Attestation Officielle
            </Badge>
            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 font-bold">
              Certifié Griffon D'OR
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Certificat d'Évaluation TCF Canada
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Générez et imprimez votre attestation de compétences linguistiques calculée selon les barèmes officiels IRCC.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handlePrint}
            className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold py-6 px-6 rounded-2xl shadow-xl"
          >
            <Printer className="w-5 h-5 mr-2" /> Imprimer / Télécharger PDF
          </Button>
        </div>
      </div>

      {/* Certificat Printable Document Frame */}
      <div className="bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 rounded-3xl shadow-inner border border-slate-200 dark:border-slate-800">
        
        <div 
          id="certificate-print-area" 
          className="bg-white text-slate-900 p-8 sm:p-14 rounded-3xl border-8 border-double border-red-900 shadow-2xl space-y-8 relative overflow-hidden max-w-4xl mx-auto"
        >
          {/* Watermark Background Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <Award className="w-[500px] h-[500px] text-red-900" />
          </div>

          {/* Top Certificate Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-red-900/20 pb-6 text-center sm:text-left gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-900 text-white flex items-center justify-center font-black text-2xl shadow-lg">
                🇨🇦
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-wider text-red-900 uppercase">
                  TCF Canada Pro
                </h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Plateforme d'Évaluation Certifiée • Griffon D'OR
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <Badge className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-3 py-1 text-xs">
                N° CERT-TCF-{Math.floor(100000 + Math.random() * 900000)}
              </Badge>
              <p className="text-xs text-slate-500 mt-1 font-semibold">Délivré le : {certDate}</p>
            </div>
          </div>

          {/* Certificate Main Title */}
          <div className="text-center space-y-3 py-4">
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              ATTESTATION DE NIVEAU DE COMPÉTENCE LINGUISTIQUE
            </p>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
              {userName}
            </h3>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              A passé avec succès l'ensemble des épreuves d'évaluation simulées TCF Canada et a obtenu le niveau de compétence globale suivant :
            </p>
          </div>

          {/* Global Result Highlight Box */}
          <div className="bg-gradient-to-r from-red-50 via-amber-50 to-red-50 border-2 border-red-900/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-around text-center gap-4 shadow-sm">
            <div>
              <p className="text-xs font-extrabold text-slate-500 uppercase">Score Global Estimé</p>
              <p className="text-4xl font-black text-red-900 mt-1">{stats.averageScore} <span className="text-sm font-semibold text-slate-500">/ 699 pts</span></p>
            </div>
            <div className="h-10 border-r border-slate-300 hidden sm:block" />
            <div>
              <p className="text-xs font-extrabold text-slate-500 uppercase">Équivalence NCLC</p>
              <p className="text-4xl font-black text-amber-600 mt-1">{stats.nclcAverage}</p>
            </div>
          </div>

          {/* Detailed Skills Breakdown Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
              Détail des Performances par Épreuve :
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-500">Compréhension Orale</p>
                <p className="text-xl font-black text-slate-900 mt-1">{stats.skillsBreakdown.listening.avgTcf} pts</p>
                <Badge className="bg-slate-200 text-slate-800 text-[10px] font-bold mt-1">
                  {stats.skillsBreakdown.listening.level}
                </Badge>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-500">Compréhension Écrite</p>
                <p className="text-xl font-black text-slate-900 mt-1">{stats.skillsBreakdown.reading.avgTcf} pts</p>
                <Badge className="bg-slate-200 text-slate-800 text-[10px] font-bold mt-1">
                  {stats.skillsBreakdown.reading.level}
                </Badge>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-500">Expression Écrite</p>
                <p className="text-xl font-black text-slate-900 mt-1">{stats.skillsBreakdown.writing.avgTcf} pts</p>
                <Badge className="bg-slate-200 text-slate-800 text-[10px] font-bold mt-1">
                  {stats.skillsBreakdown.writing.level}
                </Badge>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-500">Expression Orale</p>
                <p className="text-xl font-black text-slate-900 mt-1">{stats.skillsBreakdown.speaking.avgTcf} pts</p>
                <Badge className="bg-slate-200 text-slate-800 text-[10px] font-bold mt-1">
                  {stats.skillsBreakdown.speaking.level}
                </Badge>
              </div>
            </div>
          </div>

          {/* Certificate Footer Seals */}
          <div className="pt-6 border-t-2 border-red-900/20 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700">
                <QrCode className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Vérification Numérique</p>
                <p className="text-xs font-bold text-slate-700">griffondor.com/verify</p>
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-red-600 text-white font-black text-[9px] flex flex-col items-center justify-center mx-auto shadow-md border-2 border-amber-300">
                <span>SEAU</span>
                <span>OFFICIEL</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 mt-1">Griffon D'OR 2026</p>
            </div>

            <div className="text-center sm:text-right">
              <p className="text-xs font-extrabold text-slate-400 uppercase">Direction Pédagogique</p>
              <p className="text-sm font-black text-slate-900 italic mt-2">M. Miguel (Admin)</p>
              <p className="text-[10px] text-slate-500">Responsable Réseau & Évaluations</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

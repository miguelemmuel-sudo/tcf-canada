"use client";

import { useState, useEffect } from "react";
import { 
  UserCheck, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Video, 
  ChevronRight, 
  FileText, 
  Download, 
  PlayCircle 
} from "lucide-react";
import { isFeatureAccessible, getCurrentUserPack } from "@/utils/subscriptionEngine";
import { LockedFeatureBanner } from "@/components/ui/LockedFeatureBanner";

export default function CoachingPage() {
  const [activeTab, setActiveTab] = useState("Mes coachings");
  const [isNewUser, setIsNewUser] = useState(false);
  const [downloadingResource, setDownloadingResource] = useState<string | null>(null);
  const [pack, setPack] = useState(getCurrentUserPack());

  useEffect(() => {
    const newFlag = localStorage.getItem("griffon_user_new");
    if (newFlag === "true") {
      setIsNewUser(true);
    }
    setPack(getCurrentUserPack());
  }, []);

  if (!isFeatureAccessible("coaching", pack)) {
    return <LockedFeatureBanner featureName="Coaching Individuel & Visioconférence" />;
  }

  const handleDownload = (filename: string, content: string) => {
    setDownloadingResource(filename);
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob([content], { type: "text/plain;charset=utf-8" });
      element.href = URL.createObjectURL(file);
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setDownloadingResource(null);
    }, 800);
  };

  const sessionsCompleted = isNewUser ? 0 : 5;
  const sessionsUpcoming = isNewUser ? 0 : 2;
  const objectivesPercent = isNewUser ? "0%" : "80%";

  const guideContent = `=== GRIFFON D'OR - GUIDE OFFICIEL TCF CANADA (GÉNÉRÉ PAR IA) ===
\n1. COMPRÉHENSION ORALE
- Concentrez-vous sur les mots-clés et les connecteurs logiques.
- Notez la tonalité de l'interlocuteur.

2. COMPRÉHENSION ÉCRITE
- Lisez d'abord les questions avant de parcourir le texte.
- Repérez la structure du texte (introduction, arguments, conclusion).

3. PRODUCTION ÉCRITE
- Tâche 1 : Rédigez un message court (au moins 60 mots).
- Tâche 2 : Rédigez un article/compte-rendu (au moins 120 mots).
- Tâche 3 : Rédigez un texte argumentatif (au moins 180 mots).

4. PRODUCTION ORALE
- Entraînez-vous avec notre module d'évaluation vocale IA.
- Parlez avec confiance et utilisez un vocabulaire riche et adapté.

Bonne préparation avec Griffon d'Or !`;

  const grammarContent = `=== GRIFFON D'OR - EXERCICES DE GRAMMAIRE AVANCÉE TCF ===
\nEXERCICE 1 : LE SUBJONCTIF VS L'INDICATIF
1. Je pense qu'il (venir) ______ demain. -> vient (Indicatif)
2. Il faut que vous (faire) ______ des efforts. -> fassiez (Subjonctif)

EXERCICE 2 : LES CONNECTEURS LOGIQUE
1. Bien que + Subjonctif
2. En revanche + Indicatif
3. C'est pourquoi + Indicatif

Module interactif de correction IA disponible dans votre tableau de bord !`;

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Espace candidat - Coaching</h1>
        <p className="text-slate-500 text-sm mt-1">Bénéficiez d'un accompagnement personnalisé pour atteindre vos objectifs.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {["Mes coachings", "Réserver une séance", "Mes ressources", "Mes objectifs"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200/80 dark:border-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Section Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mes coachings</h2>
        <p className="text-xs text-slate-500">Retrouvez vos séances de coaching et votre suivi personnalisé.</p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{sessionsCompleted}</div>
              <div className="text-xs text-slate-500 font-medium">Séances réalisées</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-500 shrink-0">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{sessionsUpcoming}</div>
              <div className="text-xs text-slate-500 font-medium">Séances à venir</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{objectivesPercent}</div>
              <div className="text-xs text-slate-500 font-medium">Objectifs atteints</div>
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Prochaines séances & Dernier compte rendu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Prochaines séances */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Prochaines séances</h3>

            {isNewUser ? (
              <div className="py-6 text-center text-slate-400 space-y-3">
                <CalendarIcon className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-xs">Vous n'avez aucune séance de coaching planifiée.</p>
                <a
                  href="https://wa.me/237695903205?text=Bonjour,%20je%20souhaite%20réserver%20une%20séance%20de%20coaching%20TCF%20Canada"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  Planifier un coaching WhatsApp
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-center min-w-[55px]">
                      <span className="text-lg font-black text-slate-900 dark:text-white block leading-none">22</span>
                      <span className="text-[9px] font-bold text-slate-400 block">JUIL.</span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Compréhension écrite</h4>
                      <p className="text-[11px] text-slate-400">10:00 - 11:00 • Coach Marie L.</p>
                    </div>
                  </div>
                  <a href="https://wa.me/237695903205?text=Bonjour,%20je%20souhaite%20rejoindre%20ma%20séance%20de%20coaching" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm">
                    Rejoindre
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Dernier compte rendu */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Dernier compte rendu</h3>
            </div>

            {isNewUser ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                <p>Aucun compte rendu disponible pour le moment.</p>
                <p className="text-[11px] text-slate-400 mt-1">Votre coach rédigera vos appréciations après chaque séance live.</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Séance du 18 juillet 2026</span>
                  <span className="text-slate-400 text-[11px]">Coach Marie L.</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Très bonne progression dans l'ensemble. Votre compréhension orale s'est nettement améliorée.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Grid: Mes objectifs & Ressources recommandées */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Mes objectifs */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Mes objectifs TCF</h3>

            <div className="space-y-4 text-xs font-bold">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-700 dark:text-slate-200">Améliorer la compréhension orale</span>
                  <span className="text-slate-500">{isNewUser ? "0%" : "85%"}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-emerald-500 rounded-full ${isNewUser ? "w-[0%]" : "w-[85%]"}`} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-700 dark:text-slate-200">Augmenter le vocabulaire</span>
                  <span className="text-slate-500">{isNewUser ? "0%" : "70%"}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-blue-600 rounded-full ${isNewUser ? "w-[0%]" : "w-[70%]"}`} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-700 dark:text-slate-200">Perfectionner la grammaire</span>
                  <span className="text-slate-500">{isNewUser ? "0%" : "60%"}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-purple-600 rounded-full ${isNewUser ? "w-[0%]" : "w-[60%]"}`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ressources recommandées (Disponibles et Téléchargeables par l'IA) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Ressources recommandées IA</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-extrabold uppercase">
                Générées par l'IA
              </span>
            </div>

            <div className="space-y-3 text-xs">
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-red-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Guide de préparation TCF Canada</h4>
                    <p className="text-[10px] text-slate-400">PDF IA • Téléchargeable</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload("Guide_Preparation_TCF_Canada.txt", guideContent)}
                  disabled={downloadingResource === "Guide_Preparation_TCF_Canada.txt"}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{downloadingResource === "Guide_Preparation_TCF_Canada.txt" ? "Téléchargement..." : "Télécharger"}</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-red-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Exercices de grammaire avancée</h4>
                    <p className="text-[10px] text-slate-400">Fiche d'exercices • Téléchargeable</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload("Exercices_Grammaire_Avancee_TCF.txt", grammarContent)}
                  disabled={downloadingResource === "Exercices_Grammaire_Avancee_TCF.txt"}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{downloadingResource === "Exercices_Grammaire_Avancee_TCF.txt" ? "Téléchargement..." : "Télécharger"}</span>
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

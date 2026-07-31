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
  PlayCircle,
  Clock,
  Award,
  Check,
  Sparkles,
  AlertCircle,
  Trash2,
  PlusCircle
} from "lucide-react";
import { isFeatureAccessible, getCurrentUserPack } from "@/utils/subscriptionEngine";
import { useUserPack } from "@/hooks/useUserPack";
import { LockedFeatureBanner } from "@/components/ui/LockedFeatureBanner";
import { createClient } from "@/utils/supabase/client";
import { generateTcfGuideHtml, generateGrammarExercisesHtml } from "@/utils/coachingResources";

export interface ReservationItem {
  id: string;
  coach: string;
  subject: string;
  date: string;
  time: string;
  status: "Confirmée" | "En attente";
  createdAt: string;
}

export default function CoachingPage() {
  const [activeTab, setActiveTab] = useState("Mes coachings");
  const [isNewUser, setIsNewUser] = useState(false);
  const [downloadingResource, setDownloadingResource] = useState<string | null>(null);
  const { pack, mounted } = useUserPack();

  // Identification et données strictement par utilisateur
  const [userEmail, setUserEmail] = useState("candidat@email.com");
  const [userName, setUserName] = useState("Candidat TCF");
  
  // Valeurs des séances et objectifs (Début à 0 par défaut pour un nouvel utilisateur)
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [coProgress, setCoProgress] = useState(0);
  const [vocabProgress, setVocabProgress] = useState(0);
  const [grammarProgress, setGrammarProgress] = useState(0);

  // Réservations actives spécifiques à l'utilisateur
  const [reservations, setReservations] = useState<ReservationItem[]>([]);

  // Formulaire de réservation
  const [selectedCoach, setSelectedCoach] = useState("Coach Marie L. — Spécialiste CO/CE");
  const [selectedSubject, setSelectedSubject] = useState("Compréhension orale (Stratégies NCLC 8+)");
  const [selectedDate, setSelectedDate] = useState("Demain");
  const [selectedTime, setSelectedTime] = useState("14:00 - 15:00");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      const storedPack = getCurrentUserPack();
      setPack(storedPack);

      let currentEmail = (localStorage.getItem("griffon_user_email") || "").toLowerCase().trim();
      let currentName = localStorage.getItem("griffon_user_name") || "Candidat TCF";

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (user.email) currentEmail = user.email.toLowerCase().trim();
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, first_name")
            .eq("id", user.id)
            .single();
          if (profile?.full_name || profile?.first_name) {
            currentName = profile.full_name || profile.first_name;
          } else if (user.user_metadata?.full_name) {
            currentName = user.user_metadata.full_name;
          }
        }
      } catch (err) {
        console.warn("Utilisation du mode stockage local par utilisateur:", err);
      }

      if (!currentEmail) currentEmail = "candidat@email.com";
      setUserEmail(currentEmail);
      setUserName(currentName);

      // 1. Charger les réservations indépendantes de l'utilisateur
      const userResKey = `tcf_reservations_${currentEmail}`;
      const storedRes = localStorage.getItem(userResKey);
      let loadedRes: ReservationItem[] = [];
      if (storedRes) {
        try {
          loadedRes = JSON.parse(storedRes);
          setReservations(loadedRes);
        } catch (e) {
          setReservations([]);
        }
      } else {
        setReservations([]);
      }

      // 2. Charger la progression réelle ou initialiser STRICTEMENT À ZÉRO pour un nouvel utilisateur
      const newFlag = localStorage.getItem("griffon_user_new");
      const userProgKey = `tcf_coaching_progress_${currentEmail}`;
      const storedProg = localStorage.getItem(userProgKey);

      if (newFlag === "true" && !storedProg && loadedRes.length === 0) {
        setIsNewUser(true);
        setSessionsCompleted(0);
        setCoProgress(0);
        setVocabProgress(0);
        setGrammarProgress(0);
      } else if (storedProg) {
        try {
          const p = JSON.parse(storedProg);
          setSessionsCompleted(p.sessionsCompleted || 0);
          setCoProgress(p.coProgress || 0);
          setVocabProgress(p.vocabProgress || 0);
          setGrammarProgress(p.grammarProgress || 0);
          setIsNewUser(false);
        } catch (e) {
          setSessionsCompleted(0);
          setCoProgress(0);
          setVocabProgress(0);
          setGrammarProgress(0);
        }
      } else {
        // Zéro par défaut tant que l'utilisateur n'a ni séance réalisée ni objectif validé
        setSessionsCompleted(0);
        setCoProgress(0);
        setVocabProgress(0);
        setGrammarProgress(0);
      }
    }

    loadUserData();
  }, []);

  if (!isFeatureAccessible("coaching", pack)) {
    return <LockedFeatureBanner featureName="Coaching Individuel & Visioconférence" />;
  }

  // Calcul dynamique des moyennes d'objectifs
  const avgObjectives = Math.round((coProgress + vocabProgress + grammarProgress) / 3);
  const sessionsUpcomingCount = reservations.length;

  const handleDownload = (filename: string, content: string, mimeType: string = "text/html;charset=utf-8") => {
    setDownloadingResource(filename);
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob([content], { type: mimeType });
      element.href = URL.createObjectURL(file);
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setDownloadingResource(null);
    }, 600);
  };

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const newRes: ReservationItem = {
      id: "RES-" + Date.now().toString().slice(-5),
      coach: selectedCoach,
      subject: selectedSubject,
      date: selectedDate,
      time: selectedTime,
      status: "Confirmée",
      createdAt: new Date().toLocaleDateString("fr-FR")
    };

    const updated = [newRes, ...reservations];
    setReservations(updated);
    localStorage.setItem(`tcf_reservations_${userEmail}`, JSON.stringify(updated));
    localStorage.removeItem("griffon_user_new");
    setIsNewUser(false);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setActiveTab("Mes coachings");
    }, 1500);
  };

  const handleCancelReservation = (id: string) => {
    const updated = reservations.filter(r => r.id !== id);
    setReservations(updated);
    localStorage.setItem(`tcf_reservations_${userEmail}`, JSON.stringify(updated));
  };

  // Simuler la complétion d'un objectif pour tester le dynamisme
  const handleSimulateProgress = (type: "co" | "vocab" | "grammar" | "session") => {
    let newCo = coProgress;
    let newVocab = vocabProgress;
    let newGrammar = grammarProgress;
    let newSessions = sessionsCompleted;

    if (type === "co") newCo = Math.min(100, newCo + 25);
    if (type === "vocab") newVocab = Math.min(100, newVocab + 20);
    if (type === "grammar") newGrammar = Math.min(100, newGrammar + 20);
    if (type === "session") newSessions += 1;

    setCoProgress(newCo);
    setVocabProgress(newVocab);
    setGrammarProgress(newGrammar);
    setSessionsCompleted(newSessions);
    setIsNewUser(false);
    localStorage.removeItem("griffon_user_new");

    localStorage.setItem(`tcf_coaching_progress_${userEmail}`, JSON.stringify({
      sessionsCompleted: newSessions,
      coProgress: newCo,
      vocabProgress: newVocab,
      grammarProgress: newGrammar
    }));
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>Espace candidat - Coaching Individuel</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-black uppercase">
              Pack {pack.toUpperCase()}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Bénéficiez d'un accompagnement personnalisé pour atteindre vos objectifs NCLC au Canada.</p>
        </div>
        <div className="text-xs bg-slate-100 dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-blue-600" />
          <span>Compte indépendant : <strong>{userEmail}</strong></span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {["Mes coachings", "Réserver une séance", "Mes ressources", "Mes objectifs"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200/80 dark:border-slate-800"
            }`}
          >
            {tab === "Réserver une séance" && <CalendarIcon className="h-3.5 w-3.5" />}
            {tab === "Mes ressources" && <FileText className="h-3.5 w-3.5" />}
            {tab === "Mes objectifs" && <Award className="h-3.5 w-3.5" />}
            <span>{tab}</span>
            {tab === "Réserver une séance" && reservations.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                {reservations.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 3 Metric Cards (Dynamiques & Départ à 0) */}
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
          {sessionsCompleted === 0 && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded-lg">
              Départ à 0
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-500 shrink-0">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{sessionsUpcomingCount}</div>
              <div className="text-xs text-slate-500 font-medium">Séances à venir</div>
            </div>
          </div>
          {sessionsUpcomingCount === 0 && (
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg">
              Aucune active
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{avgObjectives}%</div>
              <div className="text-xs text-slate-500 font-medium">Objectifs atteints</div>
            </div>
          </div>
          <button
            onClick={() => handleSimulateProgress("co")}
            title="Cliquez pour simuler une progression après exercice"
            className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-all"
          >
            + Progresser
          </button>
        </div>
      </div>

      {/* CONTENU DU TAB 1 : MES COACHINGS */}
      {activeTab === "Mes coachings" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Prochaines séances (Dynamique : s'active lorsqu'une réservation est effectuée) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Prochaines séances de coaching</h3>
                  <button
                    onClick={() => setActiveTab("Réserver une séance")}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Nouvelle réservation</span>
                  </button>
                </div>

                {reservations.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
                    <CalendarIcon className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700" />
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Aucune réservation active</p>
                      <p className="text-xs text-slate-400 mt-1">L'onglet réservation et vos séances à venir s'activeront dès que vous aurez planifié votre premier créneau avec un coach.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("Réserver une séance")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all mt-2"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      <span>Réserver ma première séance maintenant</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reservations.map((res) => (
                      <div key={res.id} className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/50 via-white to-white dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-start space-x-4">
                          <div className="bg-blue-600 text-white rounded-xl px-3.5 py-2 text-center shrink-0 shadow-sm">
                            <span className="text-lg font-black block leading-none">{res.date.slice(0, 3).toUpperCase()}</span>
                            <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-80 block mt-0.5">{res.time.split(" ")[0]}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{res.subject}</h4>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold">
                                {res.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-1">🕒 {res.date} • {res.time} • <strong>{res.coach}</strong></p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <a 
                            href={`https://wa.me/237695903205?text=Bonjour,%20je%20suis%20${encodeURIComponent(userName)}%20(${encodeURIComponent(userEmail)})%20et%20je%20souhaite%20rejoindre%20ma%20séance%20de%20coaching%20:${encodeURIComponent(res.subject)}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <Video className="h-3.5 w-3.5" />
                            <span>Rejoindre le live</span>
                          </a>
                          <button
                            onClick={() => handleCancelReservation(res.id)}
                            title="Annuler cette réservation"
                            className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all dark:bg-slate-800 dark:hover:bg-red-950/50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dernier compte rendu */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Dernier compte rendu pédagogique</h3>
                {sessionsCompleted === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 space-y-2">
                    <FileText className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
                    <p className="font-bold text-slate-600 dark:text-slate-300">Valeur initiale : 0 séance</p>
                    <p className="text-[11px] text-slate-400">Vos comptes rendus pédagogiques et évaluations personnalisées seront rédigés par votre coach après votre première séance en visioconférence.</p>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs bg-blue-50/40 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40">
                    <div className="flex items-center justify-between border-b border-blue-100 dark:border-blue-900/40 pb-2.5">
                      <span className="font-bold text-blue-900 dark:text-blue-300">Séance d'évaluation NCLC #{sessionsCompleted}</span>
                      <span className="text-slate-400 text-[10px]">Coach Marie L.</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Excellente réactivité aux questions d'interaction (Tâche 2). Votre compréhension orale progresse rapidement vers le niveau NCLC 8. Prochaine étape : enrichir les connecteurs d'opposition en expression écrite.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Grid 2: Mes objectifs & Ressources recommandées */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Mes objectifs TCF (Partent de 0 et progressent) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Mes objectifs TCF (Suivi réel)</h3>
                  <span className="text-xs font-extrabold text-slate-400">Moyenne : {avgObjectives}%</span>
                </div>

                <div className="space-y-4 text-xs font-bold">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        <span>Améliorer la compréhension orale</span>
                      </span>
                      <span className="text-slate-500">{coProgress}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${coProgress}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                        <span>Augmenter le vocabulaire canadien</span>
                      </span>
                      <span className="text-slate-500">{vocabProgress}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${vocabProgress}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-purple-600"></span>
                        <span>Perfectionner la grammaire avancée</span>
                      </span>
                      <span className="text-slate-500">{grammarProgress}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full transition-all duration-500" style={{ width: `${grammarProgress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between text-[11px] text-slate-400 font-normal">
                  <span>Les jauges progressent automatiquement lorsque vous validez vos cours et séances.</span>
                  <button 
                    onClick={() => handleSimulateProgress("vocab")} 
                    className="font-bold text-blue-600 hover:underline"
                  >
                    Simuler +20%
                  </button>
                </div>
              </div>
            </div>

            {/* Ressources recommandées IA (Téléchargement HTML/PDF Conforme TCF, Zéro bug d'accent) */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Ressources recommandées IA</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-extrabold uppercase flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>Conforme TCF Canada</span>
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center space-x-3.5">
                      <div className="p-2.5 rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 shrink-0 font-black text-xs">
                        PDF
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Guide officiel de préparation TCF Canada</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Document imprimable • UTF-8 • 100% structuré</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload("Guide_Officiel_Preparation_TCF_Canada.html", generateTcfGuideHtml(userName, pack))}
                      disabled={downloadingResource === "Guide_Officiel_Preparation_TCF_Canada.html"}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20 shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{downloadingResource === "Guide_Officiel_Preparation_TCF_Canada.html" ? "Chargement..." : "Télécharger"}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center space-x-3.5">
                      <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 shrink-0 font-black text-xs">
                        EXO
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Exercices de grammaire avancée B2/C1</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Avec corrigés détaillés • Format Prêt à imprimer</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload("Cahier_Exercices_Grammaire_TCF.html", generateGrammarExercisesHtml(userName))}
                      disabled={downloadingResource === "Cahier_Exercices_Grammaire_TCF.html"}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20 shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{downloadingResource === "Cahier_Exercices_Grammaire_TCF.html" ? "Chargement..." : "Télécharger"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU DU TAB 2 : RÉSERVER UNE SÉANCE */}
      {activeTab === "Réserver une séance" && (
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <span>Réserver une séance en Visioconférence (Indépendante par utilisateur)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Planifiez votre créneau individuel avec nos examinateurs et coachs certifiés NCLC. Le créneau s'activera immédiatement sur votre compte.</p>
          </div>

          {bookingSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold text-xs flex items-center gap-2.5 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>🎉 Félicitations ! Votre réservation est validée et synchronisée sur votre compte indépendant. Redirection vers vos séances...</span>
            </div>
          )}

          <form onSubmit={handleCreateReservation} className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">1. Choisissez votre coach certifié :</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  "Coach Marie L. — Spécialiste CO/CE",
                  "Coach Jean P. — Expert EE & Tâche 3",
                  "Coach Sarah M. — Examinatrice NCLC"
                ].map(c => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setSelectedCoach(c)}
                    className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all flex flex-col justify-between ${
                      selectedCoach === c
                        ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-sm ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>{c.split(" — ")[0]}</span>
                    <span className="text-[10px] font-normal text-slate-400 mt-1">{c.split(" — ")[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">2. Compétence ou module à travailler :</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Compréhension orale (Stratégies NCLC 8+)">🎧 Compréhension orale (Stratégies NCLC 8+)</option>
                <option value="Expression écrite (Correction directe Tâches 1, 2, 3)">✍️ Expression écrite (Correction directe Tâches 1, 2, 3)</option>
                <option value="Expression orale (Simulation d'entretien et débat en live)">🗣️ Expression orale (Simulation d'entretien et débat en live)</option>
                <option value="Compréhension écrite (Gestion du temps et repérage)">📖 Compréhension écrite (Gestion du temps et repérage)</option>
                <option value="Simulation générale TCF Canada (Bilan complet)">🌟 Simulation générale TCF Canada (Bilan complet)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">3. Date souhaitée :</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white outline-none"
                >
                  <option value="Demain (En direct)">Demain (En direct)</option>
                  <option value="Samedi prochain">Samedi prochain</option>
                  <option value="Lundi prochain">Lundi prochain</option>
                  <option value="Mercredi prochain">Mercredi prochain</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">4. Créneau horaire (Heure locale) :</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white outline-none"
                >
                  <option value="10:00 - 11:00">10:00 - 11:00</option>
                  <option value="14:00 - 15:00">14:00 - 15:00</option>
                  <option value="16:00 - 17:00">16:00 - 17:00</option>
                  <option value="18:30 - 19:30">18:30 - 19:30 (Soirée)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>Confirmer et Activer ma réservation</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONTENU DU TAB 3 : MES RESSOURCES */}
      {activeTab === "Mes ressources" && (
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Banque de guides et d'exercices conformes au TCF Canada</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Téléchargez vos supports d'entraînement au format HTML5 / PDF encodé en UTF-8 pour une lecture parfaite et une impression professionnelle.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-black uppercase">Guide Officiel</span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Guide Stratégique Complet TCF Canada</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Méthodologie pas-à-pas pour les 4 épreuves (CO, CE, EE, EO). Inclus le tableau officiel des scores NCLC et les astuces pour éviter les pièges d'examen.
                </p>
              </div>
              <button
                onClick={() => handleDownload("Guide_Officiel_Preparation_TCF_Canada.html", generateTcfGuideHtml(userName, pack))}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Télécharger le Guide (HTML / PDF)</span>
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black uppercase">Grammaire B2/C1</span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Cahier d'Exercices de Grammaire Avancée</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Exercices pratiques sur le subjonctif, la concordance des temps et les connecteurs logiques argumentatifs avec corrigés détaillés.
                </p>
              </div>
              <button
                onClick={() => handleDownload("Cahier_Exercices_Grammaire_TCF.html", generateGrammarExercisesHtml(userName))}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Télécharger le Cahier d'Exercices (HTML / PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU DU TAB 4 : MES OBJECTIFS */}
      {activeTab === "Mes objectifs" && (
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              <span>Suivi détaillé de vos objectifs pédagogiques (Départ à 0)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Vos objectifs progressent dynamiquement au rythme de vos entraînements et de vos séances en direct.</p>
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Objectif 1 : Compréhension Orale NCLC 8+</h3>
                <p className="text-xs text-slate-500 mt-0.5">Statut actuel : {coProgress === 0 ? "Non initié (0%)" : `${coProgress}% complété`}</p>
              </div>
              <button
                onClick={() => handleSimulateProgress("co")}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                + Valider un entraînement CO
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Objectif 2 : Enrichissement du vocabulaire canadien</h3>
                <p className="text-xs text-slate-500 mt-0.5">Statut actuel : {vocabProgress === 0 ? "Non initié (0%)" : `${vocabProgress}% complété`}</p>
              </div>
              <button
                onClick={() => handleSimulateProgress("vocab")}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                + Valider une fiche vocabulaire
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Objectif 3 : Maîtrise de la grammaire & connecteurs</h3>
                <p className="text-xs text-slate-500 mt-0.5">Statut actuel : {grammarProgress === 0 ? "Non initié (0%)" : `${grammarProgress}% complété`}</p>
              </div>
              <button
                onClick={() => handleSimulateProgress("grammar")}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
              >
                + Valider un exercice de grammaire
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

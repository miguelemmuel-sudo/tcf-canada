"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { 
  Volume2, Play, Pause, RotateCcw, CheckCircle2, 
  ChevronLeft, ChevronRight, ArrowRight, BrainCircuit, Clock, Headphones, Award, Sparkles, Check, X, UserCheck, MapPin
} from "lucide-react";
import { ResumeSessionModal } from "@/components/ui/ResumeSessionModal";
import { saveSessionState } from "@/utils/sessionManager";

import { markCourseStarted, markLessonCompleted, addLearningTimeSeconds } from "@/utils/courseTracker";
import { getCurrentUserPack, PACK_CONFIGS } from "@/utils/subscriptionEngine";
import { useUserPack } from "@/hooks/useUserPack";
import { generateLessonsForPack } from "@/utils/courseGenerator";
import { playMultiSpeakerDialogue, AudioScenario, AudioVoiceProfile } from "@/utils/audioContentEngine";

const BASE_LESSONS = [
  {
    id: 1, title: "Introduction à la CO TCF", duration: "12:00",
    audioText: "Bienvenue dans le cours de compréhension orale TCF Canada. Dans cette leçon, vous allez apprendre les stratégies essentielles pour réussir les épreuves d'écoute. L'épreuve officielle de compréhension orale comporte 4 grandes sections de difficulté progressive : les illustrations, les courtes conversations, les annonces publiques et les conférences radio.",
    script: "Bienvenue dans le cours de compréhension orale TCF Canada. Dans cette leçon, vous allez apprendre les stratégies essentielles pour réussir les épreuves d'écoute. L'épreuve officielle de compréhension orale comporte 4 grandes sections de difficulté progressive : les illustrations, les courtes conversations, les annonces publiques et les conférences radio.",
    structuredDialogue: [
      { speakerName: "Formateur TCF", voiceProfileId: "marc-qc-male-adult", text: "Bienvenue dans le cours de compréhension orale TCF Canada. Dans cette leçon, vous allez apprendre les stratégies essentielles pour réussir les épreuves d'écoute. L'épreuve officielle de compréhension orale comporte quatre grandes sections de difficulté progressive : les illustrations, les courtes conversations, les annonces publiques et les conférences radio." }
    ],
    questions: [
      { q: "Quel est le thème principal de ce document audio ?", options: ["La cuisine française", "Les stratégies d'écoute TCF", "Les voyages au Canada", "La météo"], answer: 1, explanation: "Le document aborde spécifiquement les stratégies d'écoute pour le TCF Canada." },
      { q: "Combien de parties comporte l'épreuve de compréhension orale ?", options: ["2", "3", "4", "5"], answer: 2, explanation: "L'épreuve de compréhension orale comprend 4 grandes sections (illustrations, conversations courtes, annonces publiques et conférences) de difficulté progressive." },
    ],
    done: true
  },
  {
    id: 2, title: "Conversations courtes — niveau A2/B1", duration: "15:00",
    audioText: "Écoutez cette courte conversation entre deux amis qui planifient un voyage à Montréal. Marie dit à Jean qu'elle a réservé un hôtel près du Vieux-Port pour trois nuits.",
    script: "Narrateur : Écoutez cette courte conversation entre deux amis qui planifient un voyage à Montréal.\n\nMarie : Salut Jean ! J'ai une excellente nouvelle, j'ai enfin réservé notre hôtel pour notre séjour à Montréal !\n\nJean : Génial Marie ! Tu as trouvé quelque chose de bien situé dans le centre-ville ?\n\nMarie : Oui, exactement ! J'ai réservé un superbe hôtel juste à côté du Vieux-Port, et nous y restons pour trois nuits.\n\nJean : Parfait ! Trois nuits près du Vieux-Port, ça va être un voyage magnifique.",
    structuredDialogue: [
      { speakerName: "Narrateur", voiceProfileId: "marc-qc-male-adult", text: "Écoutez cette courte conversation entre deux amis qui planifient un voyage à Montréal." },
      { speakerName: "Marie", voiceProfileId: "claire-west-female-adult", text: "Salut Jean ! J'ai une excellente nouvelle, j'ai enfin réservé notre hôtel pour notre séjour à Montréal !" },
      { speakerName: "Jean", voiceProfileId: "lucas-qc-male-young", text: "Génial Marie ! Tu as trouvé quelque chose de bien situé dans le centre-ville ?" },
      { speakerName: "Marie", voiceProfileId: "claire-west-female-adult", text: "Oui, exactement ! J'ai réservé un superbe hôtel juste à côté du Vieux-Port, et nous y restons pour trois nuits." },
      { speakerName: "Jean", voiceProfileId: "lucas-qc-male-young", text: "Parfait ! Trois nuits près du Vieux-Port, ça va être un voyage magnifique." }
    ],
    questions: [
      { q: "Où Marie a-t-elle réservé l'hôtel ?", options: ["À Québec", "Près du Vieux-Port", "À Ottawa", "À Toronto"], answer: 1, explanation: "Marie indique explicitement avoir réservé un hôtel près du Vieux-Port à Montréal." },
      { q: "Combien de nuits vont-ils rester ?", options: ["Une nuit", "Deux nuits", "Trois nuits", "Une semaine"], answer: 2, explanation: "Elle a réservé pour trois nuits dans cet établissement." },
    ],
    done: false
  },
  {
    id: 3, title: "Annonces publiques et messages radio — B1/B2", duration: "18:00",
    audioText: "Voici une annonce de la gare de train VIA Rail : Le train 63 à destination de Toronto subira un retard d'environ trente minutes en raison de conditions météorologiques défavorables. Nous nous excusons pour ce désagrément.",
    script: "Annonceur : Votre attention s'il vous plaît. Voici une annonce officielle de la gare VIA Rail.\n\nChef de gare : Nous informons les voyageurs que le train numéro 63 à destination de Toronto subira un retard d'environ trente minutes sur l'horaire prévu. Ce retard est dû à des conditions météorologiques défavorables sur la voie rapide. Nous nous excusons sincèrement pour ce désagrément.",
    structuredDialogue: [
      { speakerName: "Annonceur VIA Rail", voiceProfileId: "marc-qc-male-adult", text: "Votre attention s'il vous plaît. Voici une annonce officielle de la gare VIA Rail." },
      { speakerName: "Chef de gare", voiceProfileId: "valerie-west-female-fast", text: "Nous informons les voyageurs que le train numéro 63 à destination de Toronto subira un retard d'environ trente minutes sur l'horaire prévu. Ce retard est dû à des conditions météorologiques défavorables sur la voie rapide. Nous nous excusons sincèrement pour ce désagrément." }
    ],
    questions: [
      { q: "Quel est le numéro du train ?", options: ["Train 36", "Train 63", "Train 30", "Train 13"], answer: 1, explanation: "Le numéro communiqué par le chef de gare est le train 63." },
      { q: "Pourquoi le train est-il en retard ?", options: ["Problème technique", "Grève du personnel", "Conditions météorologiques", "Incident sur la voie"], answer: 2, explanation: "Les conditions météorologiques défavorables sont la cause officielle du retard." },
    ],
    done: false
  },
  {
    id: 4, title: "Interviews et reportages — B2/C1", duration: "22:00",
    audioText: "Dans notre émission sur l'immigration, nous recevons le directeur du centre d'accueil de Vancouver qui nous explique comment le mentorat professionnel facilite l'intégration économique des nouveaux arrivants francophones.",
    script: "Animateur : Bienvenue à notre émission spéciale sur l'immigration et l'emploi au Canada. Nous recevons aujourd'hui Monsieur Dupont, directeur du centre d'accueil de Vancouver.\n\nDirecteur Vancouver : Bonjour à tous. Dans notre centre d'accueil à Vancouver, nous avons constaté que le mentorat professionnel est le levier le plus efficace. Il permet de jumeler les nouveaux arrivants francophones avec des experts locaux, ce qui facilite grandement et rapidement leur intégration économique sur le marché du travail.",
    structuredDialogue: [
      { speakerName: "Animateur Radio", voiceProfileId: "antoine-qc-male-fast", text: "Bienvenue à notre émission spéciale sur l'immigration et l'emploi au Canada. Nous recevons aujourd'hui Monsieur Dupont, directeur du centre d'accueil de Vancouver." },
      { speakerName: "Directeur Vancouver", voiceProfileId: "pierre-fr-male-formel", text: "Bonjour à tous. Dans notre centre d'accueil à Vancouver, nous avons constaté que le mentorat professionnel est le levier le plus efficace. Il permet de jumeler les nouveaux arrivants francophones avec des experts locaux, ce qui facilite grandement et rapidement leur intégration économique sur le marché du travail." }
    ],
    questions: [
      { q: "De quoi traite l'interview ?", options: ["Du tourisme à Vancouver", "Du mentorat professionnel pour immigrants", "Du marché immobilier", "De la politique universitaire"], answer: 1, explanation: "Le reportage met l'accent sur le rôle du mentorat professionnel dans l'intégration économique." },
      { q: "Où se situe le centre d'accueil mentionné ?", options: ["Montréal", "Calgary", "Vancouver", "Moncton"], answer: 2, explanation: "Le directeur invité dirige le centre d'accueil de Vancouver." },
    ],
    done: false
  },
  {
    id: 5, title: "Conférences et débats — C1/C2", duration: "25:00",
    audioText: "Lors de son colloque sur l'intelligence artificielle au Canada, le professeur Leroux a souligné que la réglementation doit impérativement évoluer au même rythme que les avancées technologiques afin de protéger les données personnelles des citoyens.",
    script: "Présentatrice : Nous écoutons maintenant un extrait de la conférence d'ouverture du colloque sur l'intelligence artificielle au Canada, présentée par le professeur Leroux.\n\nProfesseur Leroux : Mesdames et messieurs, face à l'accélération fulgurante de l'intelligence artificielle, notre devoir éthique et juridique est clair : la réglementation gouvernementale doit impérativement évoluer au même rythme que les avancées technologiques. C'est la condition sine qua non pour protéger efficacement et durablement les données personnelles et la vie privée de tous les citoyens canadiens.",
    structuredDialogue: [
      { speakerName: "Présentatrice Colloque", voiceProfileId: "elodie-fr-female-adult", text: "Nous écoutons maintenant un extrait de la conférence d'ouverture du colloque sur l'intelligence artificielle au Canada, présentée par le professeur Leroux." },
      { speakerName: "Professeur Leroux", voiceProfileId: "pierre-fr-male-formel", text: "Mesdames et messieurs, face à l'accélération fulgurante de l'intelligence artificielle, notre devoir éthique et juridique est clair : la réglementation gouvernementale doit impérativement évoluer au même rythme que les avancées technologiques. C'est la condition sine qua non pour protéger efficacement et durablement les données personnelles et la vie privée de tous les citoyens canadiens." }
    ],
    questions: [
      { q: "Quelle est la recommandation principale du professeur Leroux ?", options: ["Interdire l'IA", "Faire évoluer la réglementation au rythme de la technologie", "Subventionner les startups", "Créer un ministère de l'IA"], answer: 1, explanation: "Le professeur insiste sur la nécessité de synchroniser l'évolution de la réglementation avec celle des technologies." },
      { q: "Quel aspect doit être protégé selon le conférencier ?", options: ["Les données personnelles des citoyens", "Le secret industriel", "Le budget de l'État", "Les emplois dans le secteur manufacturier"], answer: 0, explanation: "La protection des données personnelles est l'objectif ciblé par la réglementation proposée." },
    ],
    done: false
  },
];

const AI_TIPS = [
  "Ne cherchez pas à traduire mot à mot : concentrez-vous sur le sens global et l'intention des locuteurs.",
  "Repérez les mots de liaison (mais, cependant, en revanche) qui signalent souvent la réponse correcte.",
  "Attention aux négations et aux formulations ironiques dans les niveaux B2 à C2.",
  "Lisez toujours les options de réponse AVANT le début du document audio si le temps le permet.",
  "Familiarisez-vous avec les accents québécois, acadiens et parisiens qui alternent dans les épreuves."
];

export default function ListeningCoursePage() {
  const { pack, mounted } = useUserPack();
  const LESSONS = React.useMemo(() => generateLessonsForPack(BASE_LESSONS, pack, PACK_CONFIGS[pack], "listening"), [pack]);

  const [currentLesson, setCurrentLesson] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAITips, setShowAITips] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  // Session Resume Modal States
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedSessionData, setSavedSessionData] = useState<any>(null);

  const cancelAudioRef = useRef<(() => void) | null>(null);

  // Detect Saved Session on Mount
  useEffect(() => {
    const rawSaved = localStorage.getItem("tcf_session_listening_course");
    if (rawSaved) {
      try {
        const parsed = JSON.parse(rawSaved);
        if (parsed && !parsed.showResults && (Object.keys(parsed.answers || {}).length > 0 || parsed.currentLesson > 0)) {
          setSavedSessionData(parsed);
          setShowResumeModal(true);
        }
      } catch (e) {
        console.error("Erreur de parsing session cours CO:", e);
      }
    }
  }, []);

  // Auto-Save Session Progress on Change
  useEffect(() => {
    if (!showResults && !showResumeModal && (Object.keys(answers).length > 0 || currentLesson > 0)) {
      saveSessionState("tcf_session_listening_course", {
        answers,
        currentLesson,
        showResults: false
      });
    }
  }, [answers, currentLesson, showResults, showResumeModal]);

  const handleResumeSession = () => {
    if (savedSessionData) {
      if (savedSessionData.answers) setAnswers(savedSessionData.answers);
      if (typeof savedSessionData.currentLesson === "number") {
        setCurrentLesson(Math.min(savedSessionData.currentLesson, Math.max(0, LESSONS.length - 1)));
      }
    }
    setShowResumeModal(false);
  };

  const handleRestartSession = () => {
    localStorage.removeItem("tcf_session_listening_course");
    setAnswers({});
    setCurrentLesson(0);
    setShowResults(false);
    setShowResumeModal(false);
  };

  const lesson = LESSONS[currentLesson] || LESSONS[0];

  const playAudio = useCallback(() => {
    if (typeof window === "undefined") return;
    if (isSpeaking) {
      if (cancelAudioRef.current) {
        cancelAudioRef.current();
        cancelAudioRef.current = null;
      }
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPlaying(false);
      return;
    }
    setIsSpeaking(true);
    setIsPlaying(true);

    // Utilisation du lecteur audio multi-locuteurs
    const cancelFn = playMultiSpeakerDialogue(
      lesson as any,
      (prog) => {}, // progression automatique
      () => { setIsSpeaking(false); setIsPlaying(false); },
      (err) => {
        console.warn("Erreur lecture audio cours:", err);
        setIsSpeaking(false);
        setIsPlaying(false);
      }
    );
    cancelAudioRef.current = cancelFn;
  }, [isSpeaking, lesson]);

  const stopAudio = () => {
    if (cancelAudioRef.current) {
      cancelAudioRef.current();
      cancelAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    stopAudio();
    return () => stopAudio();
  }, [currentLesson]);

  if (!mounted) return null;

  const score = (lesson.questions || []).filter((q: any, i: number) => answers[i] === (typeof q.answer === "number" ? q.answer : q.correct)).length;
  const totalQuestions = (lesson.questions || []).length;
  const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

  // TCF Level Calculation
  let tcfLevel = "B1";
  let nclcLevel = "NCLC 5";
  let tcfScore = "380 pts";
  let tcfBadgeBg = "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300";

  if (percentage === 100) {
    tcfLevel = "C1 (Avancé - Expert)";
    nclcLevel = "NCLC 8-9";
    tcfScore = "560 / 699 pts";
    tcfBadgeBg = "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300";
  } else if (percentage >= 50) {
    tcfLevel = "B2 (Intermédiaire Supérieur)";
    nclcLevel = "NCLC 7";
    tcfScore = "450 / 699 pts";
    tcfBadgeBg = "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300";
  } else {
    tcfLevel = "B1 (Intermédiaire)";
    nclcLevel = "NCLC 5-6";
    tcfScore = "350 / 699 pts";
    tcfBadgeBg = "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300";
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 px-2 sm:px-4">
      {/* Reusable Session Resume Modal */}
      <ResumeSessionModal
        isOpen={showResumeModal}
        title="Session de cours en cours"
        message="Vous aviez commencé ce cours de compréhension orale. Voulez-vous reprendre là où vous vous étiez arrêté ?"
        onResume={handleResumeSession}
        onRestart={handleRestartSession}
      />

      {/* Breadcrumb / Top Bar */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <Link href="/dashboard/courses" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Retour au catalogue des cours
        </Link>
        <span className="text-slate-800 dark:text-slate-200 font-semibold">Compréhension orale</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Headphones className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black">Compréhension Orale (CO)</h1>
            <p className="text-blue-100 text-sm">Leçon {currentLesson + 1} sur {LESSONS.length}</p>
          </div>
        </div>
        <div className="w-full bg-blue-800/50 rounded-full h-2 mt-3">
          <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${((currentLesson + 1) / LESSONS.length) * 100}%` }} />
        </div>
      </div>

      {/* Bannières Métadonnées Professionnelles Audio (Voix & Scénario) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-3">
          <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-blue-900 dark:text-blue-200 block mb-0.5">Profils Vocaux & Accents Francophones</span>
            <span className="text-blue-700 dark:text-blue-300 font-medium">
              {(lesson as any).voiceProfiles?.map((v: any) => `${v.name} (${v.accent})`).join(" & ") || "Marc (Montréal, QC) & Sophie (Paris, France)"}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 flex items-start gap-3">
          <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-indigo-900 dark:text-indigo-200 block mb-0.5">Scénario Pédagogique FLE</span>
            <span className="text-indigo-700 dark:text-indigo-300 font-medium">
              {(lesson as any).dialogueMetadata?.context || "Dialogue en contexte professionnel et quotidien canadien"}
            </span>
          </div>
        </div>
      </div>

      {/* Lesson Tabs & Arrow Navigation (< / >) */}
      <div className="flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 flex-wrap">
        <button
          onClick={() => {
            if (currentLesson > 0) {
              setCurrentLesson(c => c - 1); setAnswers({}); setShowResults(false); stopAudio();
            }
          }}
          disabled={currentLesson === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/30 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm shrink-0"
          title="Leçon précédente"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Leçon précédente</span>
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 flex-1 justify-center">
          {(() => {
            const total = LESSONS.length;
            const maxVisible = 5;
            let start = Math.max(0, currentLesson - Math.floor(maxVisible / 2));
            let end = Math.min(total, start + maxVisible);
            if (end - start < maxVisible) start = Math.max(0, end - maxVisible);
            const visibleIndices = [];
            for (let i = start; i < end; i++) visibleIndices.push(i);

            return visibleIndices.map((i) => {
              const l = LESSONS[i];
              return (
                <button key={l.id || i} onClick={() => { setCurrentLesson(i); setAnswers({}); setShowResults(false); stopAudio(); }}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    i === currentLesson
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 border border-blue-400"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:border-blue-400 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                  }`}
                >
                  {l.done && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                  <span>Leçon {i + 1}</span>
                </button>
              );
            });
          })()}
        </div>

        <button
          onClick={() => {
            if (currentLesson < LESSONS.length - 1) {
              setCurrentLesson(c => c + 1); setAnswers({}); setShowResults(false); stopAudio();
            } else {
              window.location.href = "/dashboard/courses/reading";
            }
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/30 transition-all shadow-sm shrink-0"
          title={currentLesson < LESSONS.length - 1 ? "Leçon suivante" : "Cours suivant"}
        >
          <span className="hidden sm:inline">{currentLesson < LESSONS.length - 1 ? "Leçon suivante" : "Cours suivant"}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Audio Player */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">{lesson.title}</h2>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 space-y-4 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="h-4 w-4" /> {lesson.duration}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isSpeaking ? "bg-red-100 text-red-600 animate-pulse dark:bg-red-950/60 dark:text-red-300" : "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300"}`}>
              {isSpeaking ? "🔊 Lecture audio multi-locuteurs en cours..." : "Prêt pour l'écoute"}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={stopAudio} className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-300 transition-colors" title="Réinitialiser l'écoute">
              <RotateCcw className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </button>
            <button onClick={playAudio}
              className={`h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isSpeaking ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
              title={isSpeaking ? "Mettre en pause" : "Écouter le dialogue"}
            >
              {isSpeaking ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
            </button>
            <button onClick={() => setShowAITips(!showAITips)} className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center hover:bg-amber-200 transition-colors" title="Conseils d'écoute">
              <BrainCircuit className="h-4 w-4 text-amber-600" />
            </button>
          </div>

          <p className="text-xs text-center text-slate-400">Cliquez sur ▶ pour lancer le dialogue audio officiel TCF (voix et accents alternés)</p>
        </div>

        {/* AI Tips */}
        {showAITips && (
          <div className="mt-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-900">
            <h3 className="font-bold text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3">
              <BrainCircuit className="h-4 w-4" /> Conseils IA pour la Compréhension Orale
            </h3>
            <ul className="space-y-1.5">
              {AI_TIPS.map((tip, i) => <li key={i} className="text-xs text-slate-700 dark:text-slate-300"> • {tip}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Questions & Correction */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">Questions de compréhension</h3>
        
        {(lesson.questions || []).map((q: any, qi: number) => {
          const qText = q.q || q.question || `Question #${qi + 1}`;
          const qAns = typeof q.answer === "number" ? q.answer : typeof q.correct === "number" ? q.correct : 0;
          return (
            <div key={qi} className="space-y-3">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{qi + 1}. {qText}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(q.options || ["Option A", "Option B", "Option C", "Option D"]).map((opt: string, oi: number) => {
                  const isSelected = answers[qi] === oi;
                  const isCorrectOption = oi === qAns;

                  let btnStyle = "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300";

                  if (showResults) {
                    if (isCorrectOption) {
                      btnStyle = "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold";
                    } else if (isSelected && !isCorrectOption) {
                      btnStyle = "bg-red-100 dark:bg-red-950/60 border-red-500 text-red-900 dark:text-red-200 font-bold";
                    }
                  } else if (isSelected) {
                    btnStyle = "bg-blue-100 border-blue-500 text-blue-900 font-bold dark:bg-blue-950/60 dark:text-blue-200";
                  }

                  return (
                    <button 
                      key={oi}
                      disabled={showResults}
                      onClick={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}
                      className={`p-3.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {showResults && isCorrectOption && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                      {showResults && isSelected && !isCorrectOption && <X className="h-4 w-4 text-red-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation when verified */}
              {showResults && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-blue-600 dark:text-blue-400">💡 Explication : </span>
                  {q.explanation || "Explication validée par le comité pédagogique FLE."}
                </div>
              )}
            </div>
          );
        })}

        {/* Automatic Evaluation Results & TCF Level Card */}
        {showResults && (
          <div className={`p-5 rounded-2xl border space-y-3 animate-in fade-in zoom-in duration-200 ${tcfBadgeBg}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/60 dark:bg-slate-900/60 flex items-center justify-center shrink-0">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base">Résultat Automatique TCF</h4>
                  <p className="text-xs font-semibold opacity-90">
                    {score}/{totalQuestions} réponses correctes ({Math.round(percentage)}%)
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 font-black text-xs shadow-sm border border-slate-200 dark:border-slate-800 inline-block">
                  Équivalence : {nclcLevel}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-300/40 dark:border-slate-700/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold">Niveau TCF estimé : </span>
                <span className="font-black text-sm">{tcfLevel}</span>
              </div>
              <div>
                <span className="font-bold">Score TCF : </span>
                <span className="font-black text-sm">{tcfScore}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button 
            onClick={() => {
              if (currentLesson > 0) {
                setCurrentLesson(c => c - 1); setAnswers({}); setShowResults(false); stopAudio();
              }
            }}
            disabled={currentLesson === 0}
            className="w-12 flex-shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {!showResults ? (
            <button 
              onClick={() => {
                setShowResults(true);
                markLessonCompleted("co", currentLesson + 1, LESSONS.length);
                localStorage.removeItem("tcf_session_listening_course");
              }} 
              disabled={Object.keys(answers).length < (lesson.questions || []).length}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Vérifier mes réponses</span>
              <span className="sm:hidden">Vérifier</span>
            </button>
          ) : (
            <button 
              onClick={() => { 
                if (currentLesson < LESSONS.length - 1) {
                  setCurrentLesson(c => c + 1); 
                  setAnswers({}); 
                  setShowResults(false); 
                  stopAudio(); 
                } else {
                  window.location.href = "/dashboard/courses/reading";
                }
                localStorage.removeItem("tcf_session_listening_course");
              }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 animate-pulse"
            >
              <span className="hidden sm:inline">Passer au cours suivant</span>
              <span className="sm:hidden">Suivant</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          <button 
            onClick={() => { 
              if (currentLesson < LESSONS.length - 1) {
                setCurrentLesson(c => c + 1); 
                setAnswers({}); 
                setShowResults(false); 
                stopAudio();
              } else {
                window.location.href = "/dashboard/courses/reading";
              }
            }}
            className="w-12 flex-shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

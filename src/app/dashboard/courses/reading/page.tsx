"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  BookOpen, CheckCircle2, ChevronLeft, BrainCircuit, Clock, PenTool 
} from "lucide-react";

const LESSONS = [
  {
    id: 1, title: "Stratégies de lecture rapide", duration: "10 min",
    text: `La lecture rapide est une compétence essentielle pour réussir l'épreuve de compréhension écrite du TCF Canada. Elle consiste à identifier rapidement les informations-clés d'un texte sans lire chaque mot.

Les principales techniques incluent : le survol (skimming) pour saisir l'idée générale, l'écrémage (scanning) pour trouver une information précise, et la lecture sélective pour comprendre les parties importantes.

Pour s'améliorer, entraînez-vous à lire quotidiennement des articles de presse, des textes administratifs et des textes littéraires en français.`,
    questions: [
      { q: "Qu'est-ce que le 'skimming' ?", options: ["Lire mot à mot", "Saisir l'idée générale", "Chercher un mot précis", "Résumer le texte"], answer: 1 },
      { q: "Quel type de texte est recommandé pour s'entraîner ?", options: ["Textes en anglais", "Textes administratifs en français", "Textes en espagnol", "Textes de chimie"], answer: 1 },
    ],
    done: true
  },
  {
    id: 2, title: "Comprendre les articles de presse", duration: "15 min",
    text: `Les articles de presse suivent une structure particulière appelée « pyramide inversée ». L'information la plus importante est placée au début de l'article, suivie de détails de plus en plus secondaires.

Un article de presse comprend généralement : un titre accrocheur (headline), un chapeau introductif (lead), le corps de l'article avec les 5W (Qui, Quoi, Quand, Où, Pourquoi), et parfois une conclusion ou une perspective.

Pour bien comprendre un article, identifiez d'abord le titre et le chapeau qui résument l'essentiel. Ensuite lisez les premiers paragraphes pour les faits principaux.`,
    questions: [
      { q: "Qu'est-ce que la 'pyramide inversée' ?", options: ["Un bâtiment célèbre", "Une structure rédactionnelle", "Un style littéraire", "Une règle de grammaire"], answer: 1 },
      { q: "Que signifient les '5W' dans le journalisme ?", options: ["Cinq voyelles", "Qui, Quoi, Quand, Où, Pourquoi", "Cinq thèmes", "Cinq règles"], answer: 1 },
    ],
    done: true
  },
  {
    id: 3, title: "Textes administratifs et formulaires", duration: "12 min",
    text: `Les textes administratifs sont courants dans la vie quotidienne au Canada. Ils incluent les formulaires d'immigration, les lettres officielles, les avis gouvernementaux et les contrats.

Pour comprendre ces textes, repérez les termes juridiques et administratifs fréquents : « conformément à », « en vertu de », « sous réserve de », « ci-joint », « à cet effet ».

Lors de l'examen TCF Canada, les textes administratifs testent votre capacité à extraire des informations précises comme des dates, des montants ou des conditions.`,
    questions: [
      { q: "Quel document est un texte administratif courant au Canada ?", options: ["Un roman", "Un formulaire d'immigration", "Un menu de restaurant", "Une chanson"], answer: 1 },
      { q: "Que signifie 'ci-joint' ?", options: ["Ici à droite", "Document attaché", "En bas de page", "À lire plus tard"], answer: 1 },
    ],
    done: false
  },
];

const AI_TIPS = [
  "📖 Lisez le titre et les sous-titres avant le texte entier.",
  "🎯 Repérez les mots de liaison : cependant, toutefois, en revanche, ainsi.",
  "✏️ Soulignez mentalement les chiffres, noms propres et dates.",
  "🔍 Attention aux négations et aux nuances (ne … pas, peu, rarement).",
];

export default function ReadingCoursePage() {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showAITips, setShowAITips] = useState(false);

  const lesson = LESSONS[currentLesson];
  const score = lesson.questions.filter((q, i) => answers[i] === q.answer).length;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/dashboard/courses" className="hover:text-emerald-600 flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" /> Mes cours
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-semibold">Compréhension écrite</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black">Compréhension Écrite (CE)</h1>
            <p className="text-emerald-100 text-sm">Leçon {currentLesson + 1} sur {LESSONS.length}</p>
          </div>
        </div>
        <div className="w-full bg-emerald-800/50 rounded-full h-2 mt-3">
          <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${(currentLesson / LESSONS.length) * 100}%` }} />
        </div>
      </div>

      {/* Lesson Tabs */}
      <div className="flex gap-2">
        {LESSONS.map((l, i) => (
          <button key={l.id} onClick={() => { setCurrentLesson(i); setAnswers({}); setShowResults(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              i === currentLesson
                ? "bg-emerald-600 text-white"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:border-emerald-300"
            }`}
          >
            {l.done && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
            Leçon {i + 1}
          </button>
        ))}
      </div>

      {/* Text to Read */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">{lesson.title}</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {lesson.duration}</span>
            <button onClick={() => setShowAITips(!showAITips)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors">
              <BrainCircuit className="h-3.5 w-3.5" /> Conseils IA
            </button>
          </div>
        </div>

        {showAITips && (
          <div className="mb-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-900">
            <h3 className="font-bold text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3">
              <BrainCircuit className="h-4 w-4" /> Conseils IA pour la Compréhension Écrite
            </h3>
            <ul className="space-y-1.5">
              {AI_TIPS.map((tip, i) => <li key={i} className="text-xs text-slate-700 dark:text-slate-300">{tip}</li>)}
            </ul>
          </div>
        )}

        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{lesson.text}</p>
        </div>
      </div>

      {/* Questions */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">Questions de compréhension</h3>
        {lesson.questions.map((q, qi) => (
          <div key={qi} className="space-y-3">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{qi + 1}. {q.q}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, oi) => (
                <button key={oi} onClick={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                    answers[qi] === oi
                      ? showResults
                        ? oi === q.answer ? "bg-emerald-100 border-emerald-400 text-emerald-800" : "bg-red-100 border-red-400 text-red-800"
                        : "bg-emerald-100 border-emerald-400 text-emerald-800"
                      : showResults && oi === q.answer
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        {showResults && (
          <div className={`p-4 rounded-xl border ${score === lesson.questions.length ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
            <p className="font-bold text-sm">{score}/{lesson.questions.length} bonnes réponses</p>
            <p className="text-xs text-slate-600 mt-1">{score === lesson.questions.length ? "Parfait ! Leçon complétée ✅" : "Relisez attentivement le texte et réessayez !"}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={() => setShowResults(true)} disabled={Object.keys(answers).length < lesson.questions.length}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm transition-colors">
            Vérifier mes réponses
          </button>
          {showResults && currentLesson < LESSONS.length - 1 && (
            <button onClick={() => { setCurrentLesson(c => c + 1); setAnswers({}); setShowResults(false); }}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors">
              Leçon suivante →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

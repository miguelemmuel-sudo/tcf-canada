"use client";

import { useState } from "react";
import { 
  Search, 
  Plus, 
  Send, 
  Paperclip, 
  CheckCheck, 
  Info, 
  FileText, 
  Link as LinkIcon, 
  Download,
  Filter
} from "lucide-react";

const conversations = [
  { id: 1, name: "Coach Marie L.", time: "10:30", lastMsg: "Parfait ! Continue ainsi pour atteindre...", badge: "1", isCoach: true, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" },
  { id: 2, name: "Coach Jean P.", time: "Hier", lastMsg: "Merci pour votre question. Voici...", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
  { id: 3, fontBg: "bg-purple-100 text-purple-700", initial: "GC", name: "Griffon d'Or – Support", time: "Hier", lastMsg: "Votre paiement a bien été confirmé." },
  { id: 4, fontBg: "bg-emerald-100 text-emerald-700", initial: "É", name: "Équipe pédagogique", time: "16 juil.", lastMsg: "N'oubliez pas votre séance de coaching..." },
  { id: 5, fontBg: "bg-amber-100 text-amber-700", initial: "A", name: "Administration", time: "15 juil.", lastMsg: "Votre document a été mis à jour avec..." },
  { id: 6, fontBg: "bg-red-100 text-red-700", initial: "CL", name: "Coach Lucie D.", time: "14 juil.", lastMsg: "Très bonne progression sur vos tests !" },
  { id: 7, fontBg: "bg-blue-100 text-blue-700", initial: "R", name: "Rappels & Notifications", time: "13 juil.", lastMsg: "Test blanc complet #3 demain à 10h00." },
];

interface Message {
  id: number;
  sender: "user" | "other";
  text: string;
  time: string;
}

export default function MessagesPage() {
  const [selectedConv, setSelectedConv] = useState(conversations[0]);
  const [msgInput, setMsgInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "other", text: "Bonjour Joel,\nExcellent travail sur votre dernier test de compréhension écrite ! Votre score de 80% montre une très bonne maîtrise. N'hésitez pas si vous avez des questions.", time: "10:15" },
    { id: 2, sender: "user", text: "Bonjour Coach,\nMerci beaucoup pour votre retour ! J'ai une question sur l'exercice 4, pouvez-vous m'expliquer comment améliorer mes réponses ?", time: "10:22" },
    { id: 3, sender: "other", text: "Bien sûr ! Je vous envoie quelques conseils personnalisés et des ressources qui vont vous aider. Bon courage !", time: "10:30" },
    { id: 4, sender: "user", text: "Merci beaucoup ! C'est très gentil à vous 😊", time: "10:31" },
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  const generateAiReply = (userMsg: string): string => {
    const lower = userMsg.toLowerCase();
    if (lower.includes("bonjour") || lower.includes("salut") || lower.includes("coucou")) {
      return `Bonjour ! Ravi de vous lire. Comment puis-je vous aider dans votre préparation TCF aujourd'hui ?`;
    }
    if (lower.includes("test") || lower.includes("examen") || lower.includes("score")) {
      return `Pour améliorer vos scores aux tests TCF, je vous conseille de réviser régulièrement la gestion du temps et de consulter vos corrections détaillées dans la rubrique "Résultats".`;
    }
    if (lower.includes("oral") || lower.includes("parler") || lower.includes("ecouter")) {
      return `En expression orale et compréhension orale, entraînez-vous chaque jour avec le module dédié. N'hésitez pas à réécouter vos enregistrements !`;
    }
    if (lower.includes("merci") || lower.includes("super") || lower.includes("d'accord")) {
      return `Avec grand plaisir ! Je reste à votre entière disposition pour toute autre question. Bon travail !`;
    }
    return `Bonjour ! J'ai bien reçu votre message : "${userMsg}". Notre assistant IA et vos coachs pédagogiques examinent votre demande pour vous apporter la meilleure réponse possible. N'hésitez pas si vous avez d'autres questions sur votre préparation !`;
  };

  const handleSendMessage = () => {
    if (!msgInput.trim()) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsgText = msgInput.trim();

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: newMsgText,
      time: currentTime,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMsgInput("");
    setIsAiTyping(true);

    // Simulate AI / Admin Auto-response after 1.2s
    setTimeout(() => {
      const aiReplyText = generateAiReply(newMsgText);
      const aiMessage: Message = {
        id: Date.now() + 1,
        sender: "other",
        text: aiReplyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsAiTyping(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Espace candidat - Messages</h1>
          <p className="text-slate-500 text-sm mt-1">Communiquez avec vos coachs et l'équipe Griffon d'Or.</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors">
          <Plus className="h-4 w-4" />
          <span>Nouveau message</span>
        </button>
      </div>

      {/* 3 Panels Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
        
        {/* Left Panel: Conversation List */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-950 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="space-y-3 overflow-y-auto pr-1">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border-none text-xs font-medium focus:outline-none"
              />
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Conversation Items */}
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center space-x-3 ${
                    selectedConv.id === conv.id
                      ? "bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800"
                      : "hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  {conv.avatar ? (
                    <img src={conv.avatar} alt={conv.name} className="h-10 w-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className={`h-10 w-10 rounded-full ${conv.fontBg} font-bold text-xs flex items-center justify-center shrink-0`}>
                      {conv.initial}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{conv.name}</h4>
                      <span className="text-[10px] text-slate-400">{conv.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[11px] text-slate-500 truncate">{conv.lastMsg}</p>
                      {conv.badge && (
                        <span className="h-4 w-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                          {conv.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          <button className="w-full py-2.5 rounded-xl border border-blue-600 text-blue-600 font-bold text-xs hover:bg-blue-50 transition-colors mt-2">
            Voir toutes les conversations
          </button>
        </div>

        {/* Center Panel: Active Chat Room */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" alt="Coach Marie L." className="h-10 w-10 rounded-full object-cover" />
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Coach Marie L.</h3>
                <p className="text-[11px] text-slate-400 font-medium">Coach de compréhension écrite</p>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full border border-slate-200 dark:border-slate-800">
              <Info className="h-4 w-4" />
            </button>
          </div>

          {/* Chat Body Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-medium">
            <div className="text-center my-2">
              <span className="text-[10px] text-slate-400 font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">Aujourd'hui</span>
            </div>

            {messages.map((m) =>
              m.sender === "other" ? (
                <div key={m.id} className="flex items-start space-x-3 max-w-[80%]">
                  <img
                    src={selectedConv.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"}
                    alt={selectedConv.name}
                    className="h-8 w-8 rounded-full object-cover mt-1 shrink-0"
                  />
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 space-y-1">
                    <p className="whitespace-pre-line">{m.text}</p>
                    <span className="text-[9px] text-slate-400 block text-right mt-1">{m.time}</span>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex flex-col items-end max-w-[80%] ml-auto">
                  <div className="bg-blue-50 dark:bg-blue-950/60 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-slate-900 dark:text-slate-100 space-y-1">
                    <p className="whitespace-pre-line">{m.text}</p>
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <span className="text-[9px] text-slate-400">{m.time}</span>
                      <CheckCheck className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                  </div>
                </div>
              )
            )}

            {/* AI Typing Indicator */}
            {isAiTyping && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs italic pl-11">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[11px]">Assistant IA & Admin écrit un message...</span>
              </div>
            )}
          </div>

          {/* Chat Footer Input */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-3">
            <button className="p-2 text-slate-400 hover:text-slate-600"><Paperclip className="h-5 w-5" /></button>
            <input
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Écrire un message..."
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs focus:outline-none border-none"
            />
            <button
              onClick={handleSendMessage}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

        </div>

        {/* Right Panel: Coach Info & Shared Media */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6 overflow-y-auto">
          <div className="space-y-6">
            
            {/* Coach Profile Card */}
            <div className="text-center space-y-2">
              <div className="relative inline-block">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" alt="Coach Marie" className="h-16 w-16 rounded-full object-cover mx-auto" />
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Coach Marie L.</h3>
                <p className="text-[11px] text-slate-400">Coach de compréhension écrite</p>
              </div>
              <button className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-blue-600 hover:bg-slate-50">
                Voir le profil
              </button>
            </div>

            {/* À propos */}
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">À propos</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Coach spécialisée en compréhension écrite et en stratégies d'examen TCF Canada. Plus de 8 ans d'expérience dans l'enseignement du français.
              </p>
            </div>

            {/* Médias partagés */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Médias partagés</h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <div className="flex items-center space-x-2.5">
                    <FileText className="h-5 w-5 text-red-500" />
                    <div>
                      <h5 className="font-bold text-[11px] text-slate-900 dark:text-white">Conseils_Reading.pdf</h5>
                      <span className="text-[9px] text-slate-400">1.2 Mo • 10:28</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <div className="flex items-center space-x-2.5">
                    <LinkIcon className="h-5 w-5 text-blue-500" />
                    <div>
                      <h5 className="font-bold text-[11px] text-slate-900 dark:text-white">Stratégies de lecture</h5>
                      <span className="text-[9px] text-slate-400">Lien • 10:28</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <div className="flex items-center space-x-2.5">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <h5 className="font-bold text-[11px] text-slate-900 dark:text-white">Exercice 4 - Correction.docx</h5>
                      <span className="text-[9px] text-slate-400">245 Ko • 10:29</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <button className="w-full py-2 rounded-xl border border-blue-600 text-blue-600 font-bold text-xs hover:bg-blue-50 transition-colors">
            Voir tous les médias
          </button>
        </div>

      </div>

    </div>
  );
}

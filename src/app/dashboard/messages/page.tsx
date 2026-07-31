"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Send, 
  Paperclip, 
  CheckCheck, 
  Info, 
  FileText, 
  Link as LinkIcon, 
  Filter,
  ArrowLeft
} from "lucide-react";
import { isFeatureAccessible, getCurrentUserPack } from "@/utils/subscriptionEngine";
import { useUserPack } from "@/hooks/useUserPack";
import { LockedFeatureBanner } from "@/components/ui/LockedFeatureBanner";
import { generateStructuredAssistantReply } from "@/utils/aiCoachAssistant";

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
  const { pack, mounted } = useUserPack();

  useEffect(() => {
    setPack(getCurrentUserPack());
  }, []);

  if (!isFeatureAccessible("messages", pack)) {
    return <LockedFeatureBanner featureName="Messagerie directe avec votre Coach" />;
  }

  const [selectedConv, setSelectedConv] = useState(conversations[0]);
  const [msgInput, setMsgInput] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "other", text: "Bonjour Joel,\nExcellent travail sur votre dernier test de compréhension écrite ! Votre score de 80% montre une très bonne maîtrise. N'hésitez pas si vous avez des questions.", time: "10:15" },
    { id: 2, sender: "user", text: "Bonjour Coach,\nMerci beaucoup pour votre retour ! J'ai une question sur l'exercice 4, pouvez-vous m'expliquer comment améliorer mes réponses ?", time: "10:22" },
    { id: 3, sender: "other", text: "Bien sûr ! Je vous envoie quelques conseils personnalisés et des ressources qui vont vous aider. Bon courage !", time: "10:30" },
    { id: 4, sender: "user", text: "Merci beaucoup ! C'est très gentil à vous 😊", time: "10:31" },
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Moteur de réponse IA pédagogique structurée & performante TCF Canada
  const generateAiReply = (userMsg: string): string => {
    return generateStructuredAssistantReply({
      userQuery: userMsg,
      userPack: pack,
      coachName: selectedConv.name
    });
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
    }, 1000);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4 pb-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Espace candidat - Messages</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">Communiquez avec vos coachs IA et l'équipe pédagogique.</p>
        </div>
      </div>

      {/* 3 Panels Layout (Responsive Mobile Optimized) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[550px] lg:h-[680px]">
        
        {/* Left Panel: Conversation List (Visible on mobile if chat not active) */}
        <div className={`lg:col-span-4 bg-white dark:bg-slate-950 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden ${
          showMobileChat ? "hidden lg:flex" : "flex"
        }`}>
          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            
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
                  onClick={() => {
                    setSelectedConv(conv);
                    setShowMobileChat(true);
                  }}
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
        </div>

        {/* Center Panel: Active Chat Room (Optimisé Mobile avec espace de chat étendu) */}
        <div className={`lg:col-span-8 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden min-h-[500px] ${
          showMobileChat ? "flex" : "hidden lg:flex"
        }`}>
          
          {/* Header Chat */}
          <div className="p-3 md:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowMobileChat(false)}
                className="lg:hidden p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              {selectedConv.avatar ? (
                <img src={selectedConv.avatar} alt={selectedConv.name} className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <div className={`h-9 w-9 rounded-full ${selectedConv.fontBg} font-bold text-xs flex items-center justify-center shrink-0`}>
                  {selectedConv.initial}
                </div>
              )}
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{selectedConv.name}</h3>
                <p className="text-[10px] md:text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Assistant IA TCF & Coach en ligne
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowMobileInfo(!showMobileInfo)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full border border-slate-200 dark:border-slate-800"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>

          {/* Chat Body Messages (Grand espace de lecture et de défilement) */}
          <div className="flex-1 p-3 md:p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/20 text-xs font-medium min-h-[320px]">
            <div className="text-center my-1">
              <span className="text-[10px] text-slate-400 font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">Aujourd'hui</span>
            </div>

            {messages.map((m) =>
              m.sender === "other" ? (
                <div key={m.id} className="flex items-start space-x-2 md:space-x-3 max-w-[90%] md:max-w-[80%]">
                  {selectedConv.avatar ? (
                    <img src={selectedConv.avatar} alt={selectedConv.name} className="h-7 w-7 rounded-full object-cover mt-1 shrink-0" />
                  ) : (
                    <div className={`h-7 w-7 rounded-full ${selectedConv.fontBg} font-bold text-[10px] flex items-center justify-center shrink-0 mt-1`}>
                      {selectedConv.initial}
                    </div>
                  )}
                  <div className="bg-white dark:bg-slate-900 p-3.5 md:p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 space-y-1.5 leading-relaxed">
                    <p className="whitespace-pre-line text-xs">{m.text}</p>
                    <span className="text-[9px] text-slate-400 block text-right mt-1">{m.time}</span>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex flex-col items-end max-w-[90%] md:max-w-[80%] ml-auto">
                  <div className="bg-blue-600 text-white p-3.5 md:p-4 rounded-2xl shadow-sm space-y-1 leading-relaxed">
                    <p className="whitespace-pre-line text-xs">{m.text}</p>
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <span className="text-[9px] text-blue-100">{m.time}</span>
                      <CheckCheck className="h-3.5 w-3.5 text-blue-200" />
                    </div>
                  </div>
                </div>
              )
            )}

            {/* AI Typing Indicator */}
            {isAiTyping && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs italic pl-9">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[11px]">Assistant IA analyse votre demande...</span>
              </div>
            )}
          </div>

          {/* Chat Footer Input (Zone de saisie optimisée mobile) */}
          <div className="p-3 md:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center space-x-2 md:space-x-3">
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
              <Paperclip className="h-5 w-5" />
            </button>
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
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-medium focus:outline-none border border-slate-200/50 dark:border-slate-800"
            />
            <button
              onClick={handleSendMessage}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl shadow-md transition-all cursor-pointer shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

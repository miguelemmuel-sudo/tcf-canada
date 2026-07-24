"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Edit3, 
  Camera, 
  CheckCircle2, 
  Award, 
  Eye, 
  BookOpen, 
  FileCheck2, 
  Calendar as CalendarIcon, 
  Clock,
  Loader2,
  Check
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Informations personnelles");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // User Profile fields
  const [avatarUrl, setAvatarUrl] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80");
  const [fullName, setFullName] = useState("Candidat TCF");
  const [email, setEmail] = useState("candidat@email.com");
  const [phone, setPhone] = useState("+226 53 36 01 01");
  const [country, setCountry] = useState("Burkina Faso");
  const [level, setLevel] = useState("B2 (NCLC 7)");
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserProfile() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setCurrentUser(user);
          setEmail(user.email || "candidat@email.com");

          const userAvatarKey = `griffon_avatar_url_${user.id}`;
          const localAvatar = localStorage.getItem(userAvatarKey);

          // Fetch from Supabase profiles
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile) {
            setFullName(profile.full_name || profile.first_name || user.user_metadata?.full_name || "Candidat TCF");
            setPhone(profile.phone || "+226 53 36 01 01");
            setCountry(profile.country || "Burkina Faso");
            if (profile.avatar_url) {
              setAvatarUrl(profile.avatar_url);
            } else if (localAvatar) {
              setAvatarUrl(localAvatar);
            }
          } else {
            setFullName(user.user_metadata?.full_name || localStorage.getItem("griffon_user_name") || "Candidat TCF");
            if (localAvatar) setAvatarUrl(localAvatar);
          }
        } else {
          // Local guest fallbacks (Indépendant par email)
          const localEmail = (localStorage.getItem("griffon_user_email") || "candidat@email.com").toLowerCase().trim();
          const emailAvatarKey = `griffon_avatar_url_${localEmail}`;
          const localAvatarByEmail = localStorage.getItem(emailAvatarKey) || localStorage.getItem("griffon_avatar_url_guest");
          if (localAvatarByEmail) setAvatarUrl(localAvatarByEmail);
          setFullName(localStorage.getItem(`griffon_user_name_${localEmail}`) || localStorage.getItem("griffon_user_name") || "Candidat TCF");
          setEmail(localEmail);
          setPhone(localStorage.getItem("griffon_user_phone") || "+237 695 903 205");
          setCountry(localStorage.getItem("griffon_user_country") || "Cameroun 🇨🇲");
        }
      } catch (err) {
        console.error("Erreur chargement profil:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, []);

  // Isolated Avatar Update Handler for active user
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const res = evt.target?.result as string;
      setAvatarUrl(res);

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const localEmail = (user?.email || localStorage.getItem("griffon_user_email") || "candidat@email.com").toLowerCase().trim();
        const emailAvatarKey = `griffon_avatar_url_${localEmail}`;
        localStorage.setItem(emailAvatarKey, res);

        if (user) {
          // Save in user-specific localStorage key to avoid overwriting other users
          const userAvatarKey = `griffon_avatar_url_${user.id}`;
          localStorage.setItem(userAvatarKey, res);

          // Persist in Supabase profiles table
          await supabase
            .from("profiles")
            .upsert({
              id: user.id,
              avatar_url: res,
              updated_at: new Date().toISOString(),
            });
        } else {
          localStorage.setItem("griffon_avatar_url_guest", res);
        }

        // Notify Topbar component to update avatar for active user
        window.dispatchEvent(new Event("avatar_updated"));

        setSavedFeedback("Photo de profil mise à jour uniquement sur votre compte !");
        setTimeout(() => setSavedFeedback(null), 3000);
      } catch (err) {
        console.error("Erreur mise à jour photo:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Chargement de votre profil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Espace candidat - Mon profil</h1>
          <p className="text-slate-500 text-sm mt-1">Gérez vos informations personnelles et vos préférences de compte.</p>
        </div>
      </div>

      {savedFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{savedFeedback}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {["Informations personnelles", "Préférences", "Sécurité"].map((tab) => (
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

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Info & Bio */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Informations personnelles Card */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Informations personnelles</h2>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <img 
                  src={avatarUrl} 
                  alt={fullName} 
                  className="h-28 w-28 rounded-full object-cover border-4 border-blue-100 dark:border-blue-950 shadow-md"
                />
                <label className="absolute bottom-0 right-0 p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg cursor-pointer transition-all hover:scale-105">
                  <Camera className="h-4 w-4" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarChange} 
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold">Nom complet</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{fullName}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold">Adresse Email</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{email}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 text-[10px] font-bold">Propriétaire</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold">Téléphone</span>
                  <span className="font-bold text-slate-900 dark:text-white">{phone}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold">Pays de résidence</span>
                  <span className="font-bold text-slate-900 dark:text-white">{country}</span>
                </div>
              </div>
            </div>
          </div>

          {/* À propos de moi Card */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Objectif & Niveau TCF</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[11px]">Niveau estimé</span>
                <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-extrabold inline-block mt-1">
                  {level}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Objectif d'immigration</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-1">Immigration Canada (EE / PNP)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Activity Summary */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Résumé de l'activité</h2>

            <div className="space-y-3 font-medium text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span>Cours suivis</span>
                </div>
                <span className="font-black text-slate-900 dark:text-white">4</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <FileCheck2 className="h-4 w-4 text-blue-600" />
                  <span>Tests réalisés</span>
                </div>
                <span className="font-black text-slate-900 dark:text-white">6</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Statut du compte</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Actif</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

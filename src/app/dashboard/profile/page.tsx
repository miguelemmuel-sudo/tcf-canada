"use client";

import { useState } from "react";
import { 
  User, 
  Edit3, 
  Camera, 
  CheckCircle2, 
  Award, 
  Eye, 
  Trash2, 
  BookOpen, 
  FileCheck2, 
  Calendar as CalendarIcon, 
  Clock
} from "lucide-react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Informations personnelles");
  const [avatarUrl, setAvatarUrl] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80");

  useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("griffon_avatar_url");
      if (saved) setAvatarUrl(saved);
    }
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Espace candidat - Mon profil</h1>
          <p className="text-slate-500 text-sm mt-1">Gérez vos informations personnelles et vos préférences.</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl border border-blue-600 text-blue-600 font-bold text-xs hover:bg-blue-50 transition-colors flex items-center gap-2">
          <Edit3 className="h-4 w-4" />
          <span>Modifier le profil</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {["Informations personnelles", "Préférences", "Sécurité", "Notifications"].map((tab) => (
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
        
        {/* Left Column: Info & Bio & Certifications */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Informations personnelles Card */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Informations personnelles</h2>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="h-28 w-28 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800 shadow-md"
                />
                <label className="absolute bottom-0 right-0 p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg cursor-pointer transition-all hover:scale-105">
                  <Camera className="h-4 w-4" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const res = evt.target?.result as string;
                          setAvatarUrl(res);
                          localStorage.setItem("griffon_avatar_url", res);
                          window.dispatchEvent(new Event("storage"));
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Nom complet</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">Joel K.</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Email</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">joel.kandidat@email.com</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">Vérifié</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Date de naissance</span>
                  <span className="font-bold text-slate-900 dark:text-white">12 mars 1996</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Téléphone</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">+33 6 12 34 56 78</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">Vérifié</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Genre</span>
                  <span className="font-bold text-slate-900 dark:text-white">Masculin</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Adresse</span>
                  <span className="font-bold text-slate-900 dark:text-white">123 Rue Sainte-Catherine Ouest, Montréal</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Nationalité</span>
                  <span className="font-bold text-slate-900 dark:text-white">Camerounaise</span>
                </div>
              </div>
            </div>
          </div>

          {/* À propos de moi Card */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">À propos de moi</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[11px]">Niveau actuel</span>
                <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-800 font-extrabold inline-block mt-1">B2</span>
                <span className="text-slate-500 text-[11px] ml-2">Niveau TCF Canada</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Objectif</span>
                <span className="font-bold text-slate-900 dark:text-white block mt-1">Étudier au Canada</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] mb-1">Présentation</span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Je me prépare au TCF Canada pour réaliser mon projet d'études au Canada.<br />
                Motivé et assidu, je travaille chaque jour pour atteindre mon objectif.
              </p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] mb-2">Langues</span>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold">Français (Courant)</span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">Anglais (Intermédiaire)</span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">Espagnol (Débutant)</span>
              </div>
            </div>
          </div>

          {/* Mes certifications Card */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Mes certifications</h2>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">Attestation de réussite - Test blanc complet #2</h3>
                  <p className="text-[10px] text-slate-400">Obtenue le 14 juillet 2026</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-xs text-blue-600 hover:bg-slate-50 flex items-center gap-1.5">
                <span>Voir le certificat</span>
                <Eye className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Activity Summary & Preferences */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Résumé de mon activité */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Résumé de mon activité</h2>

            <div className="space-y-3 font-medium text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span>Cours suivis</span>
                </div>
                <span className="font-black text-slate-900 dark:text-white">8</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <FileCheck2 className="h-4 w-4 text-blue-600" />
                  <span>Tests réalisés</span>
                </div>
                <span className="font-black text-slate-900 dark:text-white">12</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <User className="h-4 w-4 text-blue-600" />
                  <span>Séances de coaching</span>
                </div>
                <span className="font-black text-slate-900 dark:text-white">5</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <CalendarIcon className="h-4 w-4 text-blue-600" />
                  <span>Réservations</span>
                </div>
                <span className="font-black text-slate-900 dark:text-white">7</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Membre depuis</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">15 avril 2026</span>
              </div>
            </div>
          </div>

          {/* Préférences d'apprentissage */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Préférences d'apprentissage</h2>

            <div className="space-y-3 font-medium text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Objectif principal</span>
                <span className="font-bold text-slate-900 dark:text-white">Compréhension écrite</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Disponibilités</span>
                <span className="font-bold text-slate-900 dark:text-white">Soirs et week-ends</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Méthode préférée</span>
                <span className="font-bold text-slate-900 dark:text-white">Cours en ligne</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Rappels</span>
                <span className="font-bold text-emerald-600">Activés</span>
              </div>
            </div>
          </div>

          {/* Compte */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Compte</h2>

            <div className="space-y-3 font-medium text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Type de compte</span>
                <span className="font-bold text-slate-900 dark:text-white">Candidat</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Statut du compte</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">Actif</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Membre depuis</span>
                <span className="font-bold text-slate-900 dark:text-white">15 avril 2026</span>
              </div>
            </div>

            <button className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition-colors flex items-center justify-center gap-2 mt-4">
              <Trash2 className="h-4 w-4" />
              <span>Supprimer mon compte</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

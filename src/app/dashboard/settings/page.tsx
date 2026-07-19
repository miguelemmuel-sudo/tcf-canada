"use client";

import { useState } from "react";
import { 
  Bell, Shield, Globe, Palette, User, ChevronRight, 
  CheckCircle2, Volume2, Mail, Smartphone
} from "lucide-react";

const SECTIONS = [
  { id: "account", label: "Compte", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Sécurité", icon: Shield },
  { id: "language", label: "Langue & région", icon: Globe },
  { id: "appearance", label: "Apparence", icon: Palette },
  { id: "audio", label: "Audio & accessibilité", icon: Volume2 },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("account");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [language, setLanguage] = useState("fr");
  const [theme, setTheme] = useState("light");
  const [ttsRate, setTtsRate] = useState("normal");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Paramètres</h1>
        <p className="text-slate-500 text-sm mt-1">Gérez vos préférences et la configuration de votre compte.</p>
      </div>

      <div className="flex gap-6">
        {/* Left Nav */}
        <div className="w-56 shrink-0">
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeSection === s.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                <s.icon className="h-4 w-4 shrink-0" />
                {s.label}
                <ChevronRight className={`h-3.5 w-3.5 ml-auto transition-transform ${activeSection === s.id ? "rotate-90" : ""}`} />
              </button>
            ))}
          </nav>
        </div>

        {/* Right Content */}
        <div className="flex-1 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-6">
          
          {/* Account */}
          {activeSection === "account" && (
            <div className="space-y-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Informations du compte</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Nom complet</label>
                  <input defaultValue="Miguel Candidat" className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Adresse email</label>
                  <input defaultValue="miguel@example.com" type="email" className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Téléphone</label>
                  <input defaultValue="+226 53 36 01 01" type="tel" className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Pays de résidence</label>
                  <select className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Burkina Faso</option>
                    <option>Côte d'Ivoire</option>
                    <option>Canada</option>
                    <option>France</option>
                    <option>Belgique</option>
                    <option>Sénégal</option>
                    <option>Mali</option>
                    <option>Niger</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <div className="space-y-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Préférences de notifications</h2>
              <div className="space-y-4">
                {[
                  { label: "Notifications par email", desc: "Recevez les rappels de séances et nouveautés par email", icon: Mail, state: emailNotifs, set: setEmailNotifs },
                  { label: "Notifications SMS", desc: "Rappels de séances par SMS", icon: Smartphone, state: smsNotifs, set: setSmsNotifs },
                  { label: "Notifications push", desc: "Notifications dans le navigateur", icon: Bell, state: pushNotifs, set: setPushNotifs },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                        <n.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{n.label}</p>
                        <p className="text-xs text-slate-500">{n.desc}</p>
                      </div>
                    </div>
                    <button onClick={() => n.set(!n.state)}
                      className={`w-11 h-6 rounded-full transition-all ${n.state ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"} relative`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${n.state ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {activeSection === "security" && (
            <div className="space-y-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Sécurité du compte</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const target = e.currentTarget as any;
                const currentPass = target.currentPassword.value;
                const newPass = target.newPassword.value;
                const confirmPass = target.confirmPassword.value;

                if (newPass !== confirmPass) {
                  alert("Les nouveaux mots de passe ne correspondent pas.");
                  return;
                }
                if (newPass.length < 6) {
                  alert("Le nouveau mot de passe doit contenir au moins 6 caractères.");
                  return;
                }

                const userEmail = localStorage.getItem("griffon_user_email");
                const storedUsersRaw = localStorage.getItem("griffon_registered_users");
                if (storedUsersRaw && userEmail) {
                  const storedUsers: any[] = JSON.parse(storedUsersRaw);
                  const userIndex = storedUsers.findIndex(u => u.email.toLowerCase() === userEmail.toLowerCase());
                  if (userIndex !== -1) {
                    if (storedUsers[userIndex].password && storedUsers[userIndex].password !== currentPass) {
                      alert("Le mot de passe actuel est incorrect.");
                      return;
                    }
                    storedUsers[userIndex].password = newPass;
                    localStorage.setItem("griffon_registered_users", JSON.stringify(storedUsers));
                  }
                }
                handleSave();
                target.reset();
              }} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Mot de passe actuel</label>
                  <input name="currentPassword" type="password" required placeholder="••••••••" className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Nouveau mot de passe</label>
                  <input name="newPassword" type="password" required placeholder="••••••••" className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Confirmer le nouveau mot de passe</label>
                  <input name="confirmPassword" type="password" required placeholder="••••••••" className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors mt-2">
                  Mettre à jour le mot de passe
                </button>
              </form>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 mt-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Authentification à 2 facteurs (2FA)</p>
                  <p className="text-xs text-slate-500">Sécurisez votre compte avec un code SMS</p>
                </div>
                <button onClick={() => setTwoFA(!twoFA)}
                  className={`w-11 h-6 rounded-full transition-all ${twoFA ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"} relative`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${twoFA ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
            </div>
          )}

          {/* Language */}
          {activeSection === "language" && (
            <div className="space-y-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Langue & région</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Langue de l'interface</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Fuseau horaire</label>
                  <select className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>UTC+0 — Afrique de l'Ouest</option>
                    <option>UTC-5 — Montréal (EST)</option>
                    <option>UTC+1 — Europe centrale</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Format de date</label>
                  <select className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>JJ/MM/AAAA</option>
                    <option>MM/JJ/AAAA</option>
                    <option>AAAA-MM-JJ</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeSection === "appearance" && (
            <div className="space-y-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Apparence</h2>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 block">Thème</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: "light", label: "Clair", color: "bg-white border-slate-300" },
                    { val: "dark", label: "Sombre", color: "bg-slate-900 border-slate-700" },
                    { val: "system", label: "Système", color: "bg-gradient-to-r from-white to-slate-900 border-slate-400" },
                  ].map(t => (
                    <button key={t.val} onClick={() => setTheme(t.val)}
                      className={`p-4 rounded-xl border-2 transition-all text-sm font-semibold ${
                        theme === t.val ? "border-blue-600 ring-2 ring-blue-300" : "border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className={`h-12 rounded-lg mb-2 ${t.color} border`} />
                      {t.label}
                      {theme === t.val && <CheckCircle2 className="h-4 w-4 text-blue-600 mx-auto mt-1" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Audio */}
          {activeSection === "audio" && (
            <div className="space-y-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Audio & accessibilité</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Vitesse de la lecture audio (TTS)</label>
                  <div className="flex gap-3 mt-2">
                    {["lente", "normal", "rapide"].map(r => (
                      <button key={r} onClick={() => setTtsRate(r)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all capitalize ${
                          ttsRate === r ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Test de lecture audio</p>
                  <p className="text-xs text-slate-500 mb-3">Cliquez pour entendre un exemple à la vitesse choisie.</p>
                  <button onClick={() => {
                    const u = new SpeechSynthesisUtterance("Bienvenue dans l'application Griffon d'Or, votre préparation au TCF Canada.");
                    u.lang = "fr-FR";
                    u.rate = ttsRate === "lente" ? 0.7 : ttsRate === "rapide" ? 1.3 : 1.0;
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(u);
                  }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">
                    <Volume2 className="h-3.5 w-3.5" /> Tester la voix
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <button onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors">
              Enregistrer les modifications
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold animate-fade-in">
                <CheckCircle2 className="h-4 w-4" /> Modifications enregistrées !
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

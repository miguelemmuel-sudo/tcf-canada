"use client";

import { useState, useEffect } from "react";
import { 
  Bell, Shield, Globe, Palette, User, ChevronRight, 
  CheckCircle2, Volume2, Mail, Smartphone, AlertCircle, Loader2, KeyRound
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const SECTIONS = [
  { id: "account", label: "Compte", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Sécurité", icon: Shield },
  { id: "language", label: "Langue & région", icon: Globe },
  { id: "appearance", label: "Apparence", icon: Palette },
  { id: "audio", label: "Audio & accessibilité", icon: Volume2 },
];

const COUNTRY_DIAL_CODES = [
  { code: "+226", country: "Burkina Faso 🇧🇫" },
  { code: "+225", country: "Côte d'Ivoire 🇨🇮" },
  { code: "+237", country: "Cameroun 🇨🇲" },
  { code: "+221", country: "Sénégal 🇸🇳" },
  { code: "+1", country: "Canada / USA 🇨🇦🇺🇸" },
  { code: "+33", country: "France 🇫🇷" },
  { code: "+223", country: "Mali 🇲🇱" },
  { code: "+227", country: "Niger 🇳🇪" },
  { code: "+228", country: "Togo 🇹🇬" },
  { code: "+229", country: "Bénin 🇧🇯" },
  { code: "+243", country: "RDC 🇨🇩" },
  { code: "+242", country: "Congo-Brazzaville 🇨🇬" },
  { code: "+241", country: "Gabon 🇬🇦" },
  { code: "+235", country: "Tchad 🇹🇩" },
  { code: "+224", country: "Guinée 🇬🇳" },
  { code: "+236", country: "Centrafrique 🇨🇫" },
  { code: "+212", country: "Maroc 🇲🇦" },
  { code: "+213", country: "Algérie 🇩🇿" },
  { code: "+216", country: "Tunisie 🇹🇳" },
  { code: "+32", country: "Belgique 🇧🇪" },
  { code: "+41", country: "Suisse 🇨🇭" },
  { code: "+250", country: "Rwanda 🇷🇼" },
  { code: "+257", country: "Burundi 🇧🇮" },
  { code: "+509", country: "Haïti 🇭🇹" },
  { code: "+261", country: "Madagascar 🇲🇬" },
];

const WORLD_COUNTRIES = [
  "Afghanistan", "Afrique du Sud", "Albanie", "Algérie", "Allemagne", "Andorre", "Angola", "Arabie Saoudite", "Argentine", "Arménie", "Australie", "Autriche", "Azerbaïdjan",
  "Bahamas", "Bahreïn", "Bangladesh", "Barbade", "Belgique", "Bénin", "Bermudes", "Bhoutan", "Biélorussie", "Birmanie (Myanmar)", "Bolivie", "Bosnie-Herzégovine", "Botswana", "Brésil", "Brunéi", "Bulgarie", "Burkina Faso", "Burundi",
  "Cambodge", "Cameroun", "Canada", "Cap-Vert", "Chili", "Chine", "Chypre", "Colombie", "Comores", "Congo-Brazzaville", "Congo-Kinshasa (RDC)", "Corée du Nord", "Corée du Sud", "Costa Rica", "Côte d'Ivoire", "Croatie", "Cuba",
  "Danemark", "Djibouti", "Dominique",
  "Égypte", "Émirats Arabes Unis", "Équateur", "Érythrée", "Espagne", "Estonie", "États-Unis", "Éthiopie",
  "Fidji", "Finlande", "France",
  "Gabon", "Gambie", "Géorgie", "Ghana", "Grèce", "Grenade", "Guatemala", "Guinée", "Guinée équatoriale", "Guinée-Bissau", "Guyana",
  "Haïti", "Honduras", "Hongrie",
  "Inde", "Indonésie", "Irak", "Iran", "Irlande", "Islande", "Israël", "Italie",
  "Jamaïque", "Japon", "Jordanie",
  "Kazakhstan", "Kenya", "Kirghizistan", "Kiribati", "Koweït",
  "Laos", "Lesotho", "Lettonie", "Liban", "Libéria", "Libye", "Liechtenstein", "Lituanie", "Luxembourg",
  "Macédoine du Nord", "Madagascar", "Malaisie", "Malawi", "Maldives", "Mali", "Malte", "Maroc", "Maurice", "Mauritanie", "Mexique", "Micronésie", "Moldavie", "Monaco", "Mongolie", "Monténégro", "Mozambique",
  "Namibie", "Nauru", "Népal", "Nicaragua", "Niger", "Nigéria", "Norvège", "Nouvelle-Zélande",
  "Oman", "Ouganda", "Ouzbékistan",
  "Pakistan", "Palaos", "Palestine", "Panama", "Papouasie-Nouvelle-Guinée", "Paraguay", "Pays-Bas", "Pérou", "Philippines", "Pologne", "Porto Rico", "Portugal",
  "Qatar",
  "République Centrafricaine", "République Dominicaine", "République Tchèque", "Roumanie", "Royaume-Uni", "Russie", "Rwanda",
  "Saint-Christophe-et-Niévès", "Sainte-Lucie", "Saint-Marin", "Saint-Vincent-et-les-Grenadines", "Salomon", "Salvador", "Samoa", "São Tomé-et-Principe", "Sénégal", "Serbie", "Seychelles", "Sierra Leone", "Singapour", "Slovaquie", "Slovénie", "Somalie", "Soudan", "Soudan du Sud", "Sri Lanka", "Suède", "Suisse", "Suriname", "Eswatini", "Syrie",
  "Tadjikistan", "Tanzanie", "Tchad", "Thaïlande", "Timor oriental", "Togo", "Tonga", "Trinité-et-Tobago", "Tunisie", "Turkménistan", "Turquie", "Tuvalu",
  "Ukraine", "Uruguay",
  "Vanuatu", "Vatican", "Venezuela", "Viêt Nam",
  "Yémen",
  "Zambie", "Zimbabwe"
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("account");
  const [loadingUser, setLoadingUser] = useState(true);

  // Form Account state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCode, setPhoneCode] = useState("+226");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("Burkina Faso");

  // Notifications state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);

  // Security state
  const [twoFA, setTwoFA] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Language & Appearance state
  const [language, setLanguage] = useState("fr");
  const [theme, setTheme] = useState("light");
  const [ttsRate, setTtsRate] = useState("normal");

  // Save state feedback
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function loadUserProfile() {
      setLoadingUser(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const storedEmail = localStorage.getItem("griffon_user_email") || "";
        const storedName = localStorage.getItem("griffon_user_name") || "";
        const storedPhone = localStorage.getItem("griffon_user_phone") || "";
        const storedCountry = localStorage.getItem("griffon_user_country") || "Burkina Faso";

        if (user) {
          setEmail(user.email || storedEmail);
          
          // Try fetching from profiles table
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile) {
            const nameToUse = profile.full_name || profile.first_name || user.user_metadata?.full_name || storedName;
            setFullName(nameToUse);
            setCountry(profile.country || storedCountry);

            if (profile.phone) {
              const matchedCode = COUNTRY_DIAL_CODES.find(c => profile.phone.startsWith(c.code));
              if (matchedCode) {
                setPhoneCode(matchedCode.code);
                setPhoneNumber(profile.phone.replace(matchedCode.code, "").trim());
              } else {
                setPhoneNumber(profile.phone);
              }
            } else if (storedPhone) {
              setPhoneNumber(storedPhone);
            }
          } else {
            // Fallback to user metadata
            setFullName(user.user_metadata?.full_name || storedName || "Utilisateur");
            if (storedPhone) setPhoneNumber(storedPhone);
            setCountry(storedCountry);
          }

          // Fetch user settings if available
          const { data: settings } = await supabase
            .from("user_settings")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (settings) {
            if (settings.theme) setTheme(settings.theme);
            if (settings.language) setLanguage(settings.language);
            if (settings.notifications) {
              setEmailNotifs(!!settings.notifications.email);
              setSmsNotifs(!!settings.notifications.sms);
              setPushNotifs(!!settings.notifications.push);
            }
          }
        } else {
          // Fallback to localStorage data if unauthenticated session
          setEmail(storedEmail || "invite@exemple.com");
          setFullName(storedName || "Utilisateur Propriétaire");
          setCountry(storedCountry);
          if (storedPhone) setPhoneNumber(storedPhone);
        }
      } catch (err) {
        console.error("Erreur chargement profil:", err);
      } finally {
        setLoadingUser(false);
      }
    }

    loadUserProfile();
  }, []);

  // Save Account & Preferences
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveStatus(null);

    const fullPhone = `${phoneCode} ${phoneNumber}`.trim();

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 1. Update Supabase profiles table
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            full_name: fullName,
            country: country,
            phone: fullPhone,
            language: language,
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.warn("Notice profiles upsert:", profileError.message);
        }

        // 2. Update Supabase user_settings table
        const { error: settingsError } = await supabase
          .from("user_settings")
          .upsert({
            user_id: user.id,
            theme: theme,
            language: language,
            notifications: { email: emailNotifs, sms: smsNotifs, push: pushNotifs },
            account_settings: { ttsRate },
            updated_at: new Date().toISOString(),
          });

        if (settingsError) {
          console.warn("Notice user_settings upsert:", settingsError.message);
        }

        // 3. Update Supabase Auth metadata
        await supabase.auth.updateUser({
          data: {
            full_name: fullName,
            phone: fullPhone,
            country: country,
          }
        });
      }

      // 4. Update localStorage for smooth local app synchronization
      localStorage.setItem("griffon_user_name", fullName);
      if (email) localStorage.setItem("griffon_user_email", email);
      localStorage.setItem("griffon_user_phone", fullPhone);
      localStorage.setItem("griffon_user_country", country);

      setSaveStatus({
        text: "Vos informations de compte ont été enregistrées avec succès !",
        type: "success"
      });
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      setSaveStatus({
        text: err?.message || "Erreur lors de l'enregistrement des données.",
        type: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  // Update Password in Supabase Auth
  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const newPass = formData.get("newPassword") as string;
    const confirmPass = formData.get("confirmPassword") as string;

    if (newPass !== confirmPass) {
      setPasswordMsg({ text: "Les nouveaux mots de passe ne correspondent pas.", type: "error" });
      setPasswordLoading(false);
      return;
    }

    if (newPass.length < 6) {
      setPasswordMsg({ text: "Le mot de passe doit contenir au moins 6 caractères.", type: "error" });
      setPasswordLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPass });

      if (error) {
        setPasswordMsg({ text: error.message, type: "error" });
      } else {
        setPasswordMsg({
          text: "Votre nouveau mot de passe a été enregistré ! Vous pourrez l'utiliser lors de votre prochaine connexion.",
          type: "success"
        });
        form.reset();
      }
    } catch (err: any) {
      setPasswordMsg({ text: err?.message || "Erreur lors du changement de mot de passe.", type: "error" });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Chargement de votre compte...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto px-2 sm:px-4">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Paramètres</h1>
        <p className="text-slate-500 text-sm mt-1">Gérez vos préférences et la configuration de votre compte.</p>
      </div>

      {/* Main Responsive Container */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Mobile Navigation Tabs (Horizontal Scroll) */}
        <div className="md:hidden overflow-x-auto scrollbar-none pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-2 min-w-max">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSection === s.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                }`}
              >
                <s.icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Left Navigation Sidebar */}
        <div className="hidden md:block w-64 shrink-0">
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
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

        {/* Content Box */}
        <div className="flex-1 w-full bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-6">
          
          {/* Section: Compte */}
          {activeSection === "account" && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="font-bold text-base text-slate-900 dark:text-white">Informations du compte</h2>
                <p className="text-xs text-slate-500 mt-0.5">Modifier les informations associées à votre profil personnel.</p>
              </div>

              <div className="space-y-4">
                {/* Nom complet */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Miguel K."
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Adresse email */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Adresse email (Compte propriétaire)
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed opacity-90"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">L'adresse email est liée à votre identifiant Supabase Auth.</p>
                </div>

                {/* Téléphone avec format par pays */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Téléphone (Indicatif & Numéro)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
                    <select
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value)}
                      className="sm:w-48 shrink-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                    >
                      {COUNTRY_DIAL_CODES.map((c) => (
                        <option key={`${c.code}-${c.country}`} value={c.code}>
                          {c.code} ({c.country})
                        </option>
                      ))}
                    </select>

                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="53 36 01 01"
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Pays de résidence - Liste exhaustive */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Pays de résidence
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {WORLD_COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section: Notifications */}
          {activeSection === "notifications" && (
            <div className="space-y-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Préférences de notifications</h2>
              <div className="space-y-3">
                {[
                  { label: "Notifications par email", desc: "Recevez les rappels de séances et nouveautés par email", icon: Mail, state: emailNotifs, set: setEmailNotifs },
                  { label: "Notifications SMS", desc: "Rappels de séances par SMS sur votre mobile", icon: Smartphone, state: smsNotifs, set: setSmsNotifs },
                  { label: "Notifications push", desc: "Alertes directes dans le navigateur", icon: Bell, state: pushNotifs, set: setPushNotifs },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                        <n.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{n.label}</p>
                        <p className="text-xs text-slate-500">{n.desc}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => n.set(!n.state)}
                      className={`w-11 h-6 rounded-full transition-all ${n.state ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"} relative shrink-0`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${n.state ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Sécurité */}
          {activeSection === "security" && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-blue-600" />
                  Sécurité du compte & Mot de passe
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Le nouveau mot de passe sera immédiatement enregistré sur Supabase Auth pour vos prochaines connexions.</p>
              </div>

              {passwordMsg && (
                <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  passwordMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800"
                }`}>
                  {passwordMsg.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Nouveau mot de passe
                  </label>
                  <input
                    name="newPassword"
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {passwordLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Changer le mot de passe dans Supabase Auth
                </button>
              </form>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 mt-6 bg-slate-50/50 dark:bg-slate-900/30">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Authentification à 2 facteurs (2FA)</p>
                  <p className="text-xs text-slate-500">Sécurisez votre compte avec un code de confirmation</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFA(!twoFA)}
                  className={`w-11 h-6 rounded-full transition-all ${twoFA ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"} relative shrink-0`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${twoFA ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
            </div>
          )}

          {/* Section: Langue */}
          {activeSection === "language" && (
            <div className="space-y-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Langue & région</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Langue de l'interface</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  >
                    <option value="fr">Français (France / Canada)</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Fuseau horaire</label>
                  <select className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white">
                    <option>UTC+0 — Afrique de l'Ouest (Ouagadougou, Abidjan, Dakar)</option>
                    <option>UTC+1 — Afrique centrale & Europe (Douala, Paris)</option>
                    <option>UTC-5 — Canada (Montréal, Toronto - EST)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section: Apparence */}
          {activeSection === "appearance" && (
            <div className="space-y-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Apparence</h2>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 block">Thème de l'application</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { val: "light", label: "Clair", color: "bg-white border-slate-300" },
                    { val: "dark", label: "Sombre", color: "bg-slate-900 border-slate-700" },
                    { val: "system", label: "Système", color: "bg-gradient-to-r from-white to-slate-900 border-slate-400" },
                  ].map((t) => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setTheme(t.val)}
                      className={`p-4 rounded-xl border-2 transition-all text-sm font-semibold ${
                        theme === t.val ? "border-blue-600 ring-2 ring-blue-300 dark:ring-blue-900" : "border-slate-200 dark:border-slate-700"
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

          {/* Section: Audio */}
          {activeSection === "audio" && (
            <div className="space-y-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Audio & accessibilité</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Vitesse de la synthése vocale (TTS)</label>
                  <div className="flex gap-2 mt-2">
                    {["lente", "normal", "rapide"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setTtsRate(r)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all capitalize ${
                          ttsRate === r ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Test de lecture audio</p>
                  <p className="text-xs text-slate-500 mb-3">Écoutez un extrait de compréhension orale.</p>
                  <button
                    type="button"
                    onClick={() => {
                      const u = new SpeechSynthesisUtterance("Bienvenue dans la préparation au TCF Canada.");
                      u.lang = "fr-FR";
                      u.rate = ttsRate === "lente" ? 0.7 : ttsRate === "rapide" ? 1.3 : 1.0;
                      window.speechSynthesis.cancel();
                      window.speechSynthesis.speak(u);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    <Volume2 className="h-3.5 w-3.5" /> Écouter l'extrait
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Persistent Global Save Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Enregistrer les modifications
            </button>

            {saveStatus && (
              <span className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold ${
                saveStatus.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              }`}>
                {saveStatus.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                {saveStatus.text}
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { 
  DollarSign, 
  Users, 
  CreditCard, 
  Activity, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  ChevronRight, 
  Eye, 
  Sparkles, 
  Crown,
  Database,
  Terminal,
  Calendar,
  ArrowUpRight
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { isUserAdmin } from "@/utils/subscriptionEngine";

interface AdminTransaction {
  id: string;
  reference: string;
  provider_transaction_id?: string;
  payment_method: string;
  amount: string;
  currency: string;
  status: string;
  created_at: string;
  user_id: string;
  user_email?: string;
}

interface AdminSubscription {
  id: string;
  user_id: string;
  user_email?: string;
  pack: string;
  amount: string;
  status: string;
  started_at: string;
  expires_at?: string;
}

interface AdminLog {
  id: string;
  transaction_reference?: string;
  event_type: string;
  payload: any;
  created_at: string;
}

export default function AdminFinancePage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"transactions" | "subscriptions" | "logs">("transactions");

  // Données Supabase
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);

  // Filtres et Recherche
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [packFilter, setPackFilter] = useState("ALL");
  const [cronFeedback, setCronFeedback] = useState<string | null>(null);
  const [runningCron, setRunningCron] = useState(false);

  // Payload Modal
  const [selectedLogPayload, setSelectedLogPayload] = useState<any | null>(null);

  useEffect(() => {
    async function checkAdminAndLoadData() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Vérification multi-niveaux du rôle administrateur (email officiel Administrateur réseau Miguel ou flag DB)
        const adminEmails = [
          "emmuel.proreseau@gmail.com",
          "joumefiomiguel@gmail.com",
          "miguelemmuel@gmail.com",
          "admin.miguel@griffondor.com",
          "miguel.admin@griffondor.com",
          "admin@griffondor.com",
          "miguel@griffondor.com"
        ];

        const isEmailAdmin = user?.email && adminEmails.includes(user.email.toLowerCase());
        const isClientAdmin = isUserAdmin();

        let isDbAdmin = false;
        if (user) {
          const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
          isDbAdmin = profile?.is_admin === true;
        }

        if (!isEmailAdmin && !isClientAdmin && !isDbAdmin) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        setAuthorized(true);

        // A. Charger toutes les transactions
        const { data: txList } = await supabase
          .from("transactions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        // Charger un index d'emails pour affichage propre
        const { data: profilesList } = await supabase.from("profiles").select("id, email, full_name");
        const profileMap: Record<string, { email: string; name: string }> = {};
        if (profilesList) {
          profilesList.forEach(p => {
            profileMap[p.id] = { email: p.email || "candidat@griffondor.com", name: p.full_name || "Candidat TCF" };
          });
        }

        if (txList) {
          setTransactions(txList.map(tx => ({
            id: tx.id,
            reference: tx.reference || "TX_FAPSHI",
            provider_transaction_id: tx.provider_transaction_id,
            payment_method: tx.payment_method || "Fapshi Mobile / Carte",
            amount: tx.amount ? `${parseInt(tx.amount).toLocaleString("fr-FR")} FCFA` : "25 000 FCFA",
            currency: tx.currency || "FCFA",
            status: tx.status || "pending",
            created_at: new Date(tx.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
            user_id: tx.user_id,
            user_email: profileMap[tx.user_id]?.email || tx.user_id.slice(0, 8) + "..."
          })));
        }

        // B. Charger tous les abonnements
        const { data: subList } = await supabase
          .from("subscriptions")
          .select("*")
          .order("started_at", { ascending: false })
          .limit(100);

        if (subList) {
          setSubscriptions(subList.map(sub => ({
            id: sub.id,
            user_id: sub.user_id,
            user_email: profileMap[sub.user_id]?.email || sub.user_id.slice(0, 8) + "...",
            pack: sub.pack || "griffon",
            amount: sub.amount ? `${parseInt(sub.amount).toLocaleString("fr-FR")} FCFA` : "25 000 FCFA",
            status: sub.status || "active",
            started_at: new Date(sub.started_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
            expires_at: sub.expires_at ? new Date(sub.expires_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "Illimité"
          })));
        }

        // C. Charger les journaux Fapshi (payment_logs)
        const { data: logList } = await supabase
          .from("payment_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(60);

        if (logList) {
          setLogs(logList.map(l => ({
            id: l.id,
            transaction_reference: l.transaction_reference || "N/A",
            event_type: l.event_type || "info",
            payload: l.payload || {},
            created_at: new Date(l.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })
          })));
        }

      } catch (err) {
        console.error("Erreur chargement Admin SaaS:", err);
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndLoadData();
  }, []);

  // Déclencher manuellement le cron de vérification du cycle de vie
  const handleRunLifecycleCron = async () => {
    setRunningCron(true);
    setCronFeedback(null);
    try {
      const res = await fetch("/api/cron/check-subscriptions");
      const data = await res.json();
      if (res.ok && data.success) {
        const { checked, expired, reminded7d, reminded3d, reminded1d } = data.stats || {};
        setCronFeedback(`Contrôle terminé : ${checked || 0} vérifiés, ${expired || 0} expirés, ${(reminded7d||0)+(reminded3d||0)+(reminded1d||0)} rappels envoyés.`);
      } else {
        setCronFeedback("Erreur lors de l'exécution du cron : " + (data.error || "Inconnue"));
      }
    } catch (err: any) {
      setCronFeedback("Erreur réseau lors du lancement du cron.");
    } finally {
      setRunningCron(false);
    }
  };

  // Calcul des métriques financières clés (KPIs)
  const totalRevenueNum = transactions.reduce((acc, tx) => {
    if (tx.status === "completed" || tx.status === "SUCCESSFUL") {
      const num = parseFloat(tx.amount.replace(/[^0-9]/g, ""));
      return acc + (isNaN(num) ? 0 : num);
    }
    return acc;
  }, 0);

  const activeSubsCount = subscriptions.filter(s => s.status === "active").length;
  const expiredSubsCount = subscriptions.filter(s => s.status === "expired").length;
  const pendingTxCount = transactions.filter(t => t.status === "pending" || t.status === "PENDING").length;

  // Filtrage des transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (tx.user_email && tx.user_email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || tx.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm font-bold">Chargement de l'espace Finance & Agrégateur Fapshi...</p>
        </div>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-3xl p-8 text-center max-w-xl mx-auto my-12 space-y-4">
        <ShieldAlert className="h-14 w-14 text-red-600 mx-auto" />
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Accès Réservé - Direction & Administration</h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Cette section est strictement confidentielle et réservée au contrôle de gestion des abonnements SaaS et de la passerelle Fapshi. Votre compte ne possède pas les habilitations de Super Administrateur.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Banner de bienvenue personnalisé pour Administrateur réseau Miguel */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-2xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="h-4 w-4" />
              SaaS TCF-Canada Pro • Console Super-Admin
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 animate-pulse" />
              Fapshi Live Ready
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Bonjour Administrateur Réseau Miguel 👋</h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Bienvenue dans votre centre de contrôle financier et monétique. Supervisez les transactions Fapshi (MTN, Orange Money, Visa), gérez le cycle de vie des abonnés et inspectez les journaux d'audit Webhook en temps réel.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0 z-10">
          <button
            onClick={handleRunLifecycleCron}
            disabled={runningCron}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${runningCron ? "animate-spin" : ""}`} />
            <span>{runningCron ? "Contrôle en cours..." : "Exécuter Contrôle d'Expiration (Cron)"}</span>
          </button>
        </div>
      </div>

      {cronFeedback && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
            <span>{cronFeedback}</span>
          </div>
          <button onClick={() => setCronFeedback(null)} className="text-blue-500 hover:underline">Fermer</button>
        </div>
      )}

      {/* 4 KPIs de Direction Financière */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chiffre d'Affaires Validé</span>
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalRevenueNum.toLocaleString("fr-FR")} <span className="text-sm font-bold text-emerald-600">FCFA</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Cumul réel des paiements Fapshi</p>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Abonnés Actifs</span>
            <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{activeSubsCount}</div>
          <p className="text-[11px] text-slate-400 font-medium">Accès Griffon & VIP en cours</p>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">En Attente / Initiés</span>
            <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">{pendingTxCount}</div>
          <p className="text-[11px] text-slate-400 font-medium">Transactions non finalisées</p>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Abonnements Expirés</span>
            <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{expiredSubsCount}</div>
          <p className="text-[11px] text-slate-400 font-medium">Candidats éligibles aux rappels</p>
        </div>
      </div>

      {/* Navigation par Onglets */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "transactions"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Transactions Fapshi ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "subscriptions"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Abonnements Candidats ({subscriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "logs"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>Journaux & Traçabilité API ({logs.length})</span>
        </button>
      </div>

      {/* CONTENU DE L'ONGLET 1 : TRANSACTIONS */}
      {activeTab === "transactions" && (
        <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par référence, email ou ID Fapshi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 shrink-0">
                <Filter className="h-3.5 w-3.5" /> Statut :
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="completed">Payés / Confirmés</option>
                <option value="pending">En attente (Initiés)</option>
                <option value="failed">Échoués / Refusés</option>
              </select>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="py-16 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <FileText className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="font-bold text-sm text-slate-600 dark:text-slate-400">Aucune transaction ne correspond à votre filtre</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[11px]">
                    <th className="pb-3.5">Date & Heure</th>
                    <th className="pb-3.5">Candidat (Email)</th>
                    <th className="pb-3.5">Référence TCF / Fapshi</th>
                    <th className="pb-3.5">Moyen</th>
                    <th className="pb-3.5">Montant</th>
                    <th className="pb-3.5 text-right">Statut Fapshi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{tx.created_at}</td>
                      <td className="py-4 text-slate-900 dark:text-white font-bold">{tx.user_email}</td>
                      <td className="py-4 font-mono text-[11px] text-blue-600 dark:text-blue-400">
                        {tx.reference}
                        {tx.provider_transaction_id && <span className="block text-[10px] text-slate-400">ID: {tx.provider_transaction_id}</span>}
                      </td>
                      <td className="py-4 text-slate-500">{tx.payment_method}</td>
                      <td className="py-4 font-black text-slate-900 dark:text-white text-sm">{tx.amount}</td>
                      <td className="py-4 text-right">
                        <span className={`px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1 ${
                          tx.status === "completed" || tx.status === "SUCCESSFUL"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-500/20"
                            : tx.status === "pending" || tx.status === "PENDING"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-500/20"
                            : "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-500/20"
                        }`}>
                          {tx.status === "completed" || tx.status === "SUCCESSFUL" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CONTENU DE L'ONGLET 2 : ABONNEMENTS */}
      {activeTab === "subscriptions" && (
        <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Répertoire des Souscriptions TCF-Canada Pro</h3>
              <p className="text-xs text-slate-500">Vue globale des formules actives, durées de validité et historiques de remplacement.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="pb-3.5">Candidat</th>
                  <th className="pb-3.5">Formule / Pack</th>
                  <th className="pb-3.5">Tarif de souscription</th>
                  <th className="pb-3.5">Date de début</th>
                  <th className="pb-3.5">Échéance de validité</th>
                  <th className="pb-3.5 text-right">Statut du contrat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 text-slate-900 dark:text-white font-bold">{sub.user_email}</td>
                    <td className="py-4">
                      <span className="font-black text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                        {sub.pack === "griffon" ? "Griffon D'OR 🦅" : sub.pack === "vip" ? "VIP Coaching 👑" : "Standard 📘"}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-slate-700 dark:text-slate-300">{sub.amount}</td>
                    <td className="py-4 text-slate-500">{sub.started_at}</td>
                    <td className="py-4 text-slate-700 dark:text-slate-300 font-bold">{sub.expires_at}</td>
                    <td className="py-4 text-right">
                      <span className={`px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider ${
                        sub.status === "active"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                          : sub.status === "expired"
                          ? "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400"
                      }`}>
                        {sub.status === "active" ? "En cours" : sub.status === "expired" ? "Expiré" : "Remplacé"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENU DE L'ONGLET 3 : JOURNAUX D'AUDIT API / WEBHOOKS */}
      {activeTab === "logs" && (
        <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Terminal className="h-5 w-5 text-indigo-600" />
                Journal Technique Fapshi (Audit & Traçabilité API)
              </h3>
              <p className="text-xs text-slate-500">Enregistrement brut et inaltérable de tous les appels sortants et notifications Webhook reçues en temps réel.</p>
            </div>
          </div>

          {/* Fapshi Live Configuration Banner */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 p-4 sm:p-5 rounded-2xl border border-indigo-500/30 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">WEBHOOK CONFIGURÉ</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  Prêt pour Fapshi
                </span>
              </div>
              <p className="font-mono text-xs text-indigo-200 font-semibold break-all">
                https://tcf-canada-olive.vercel.app/api/webhooks/fapshi
              </p>
            </div>
            <div className="text-[11px] bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 font-mono space-y-0.5 shrink-0">
              <div className="text-slate-400">Utilisateur (API User): <span className="text-amber-400 font-bold">3aa8a0...0bed0</span></div>
              <div className="text-slate-400">Mot de passe Webhook: <span className="text-emerald-400 font-bold">123@Miguel</span></div>
            </div>
          </div>

          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-12">Aucun événement dans le journal pour le moment.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-md font-extrabold text-[10px] uppercase tracking-wider ${
                        log.event_type === "webhook_processed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                        log.event_type === "webhook_error" || log.event_type === "error" ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" :
                        "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                      }`}>
                        {log.event_type}
                      </span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{log.transaction_reference}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">{log.created_at}</p>
                  </div>

                  <button
                    onClick={() => setSelectedLogPayload(log.payload)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 font-bold text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1.5 self-start sm:self-center shrink-0"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Inspecter Payload JSON</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal d'inspection du Payload JSON brut */}
      {selectedLogPayload && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-600" />
                Payload de l'événement Fapshi (Format JSON)
              </h3>
              <button onClick={() => setSelectedLogPayload(null)} className="p-1 text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-96 pr-2">
              {JSON.stringify(selectedLogPayload, null, 2)}
            </pre>

            <div className="text-right pt-2">
              <button
                type="button"
                onClick={() => setSelectedLogPayload(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Fermer l'inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

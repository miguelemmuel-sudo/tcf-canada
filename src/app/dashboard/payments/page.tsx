"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Wallet, 
  CreditCard as CreditCardIcon, 
  FileText, 
  DollarSign, 
  Plus, 
  Download, 
  ChevronRight,
  CheckCircle2,
  Clock,
  X,
  Edit3,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Crown,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Calendar,
  Check
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { UpgradePackModal } from "@/components/ui/UpgradePackModal";
import { PACK_CONFIGS, PackType } from "@/utils/subscriptionEngine";

interface Transaction {
  id: string;
  reference: string;
  provider_transaction_id?: string;
  payment_method: string;
  amount: string;
  currency: string;
  status: string;
  created_at: string;
  pack?: string;
  title?: string;
}

interface Subscription {
  id: string;
  pack: PackType;
  status: string;
  started_at: string;
  expires_at?: string;
  amount: string;
}

function PaymentsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentSuccessModal, setPaymentSuccessModal] = useState<{ show: boolean; packName?: string; expiresAt?: string }>({ show: false });

  // Dynamic user & Fapshi data
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Billing info state
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingMethod, setBillingMethod] = useState("Passerelle Officielle Fapshi");

  // Modals state
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [billingFeedback, setBillingFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const storedName = localStorage.getItem("griffon_user_name") || "";
        const storedEmail = localStorage.getItem("griffon_user_email") || "";
        const storedCountry = localStorage.getItem("griffon_user_country") || "Burkina Faso / Canada";

        if (user) {
          setBillingEmail(user.email || storedEmail);
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile) {
            setBillingName(profile.full_name || profile.first_name || user.user_metadata?.full_name || storedName || "Candidat TCF");
            setBillingAddress(profile.country || storedCountry);
          } else {
            setBillingName(user.user_metadata?.full_name || storedName || "Candidat TCF");
            setBillingAddress(storedCountry);
          }

          // 1. Récupérer l'abonnement actif dans Supabase
          const { data: subData } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "active")
            .order("expires_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (subData) {
            setActiveSubscription({
              id: subData.id,
              pack: (subData.pack as PackType) || "griffon",
              status: subData.status,
              started_at: subData.started_at,
              expires_at: subData.expires_at,
              amount: subData.amount || "25000"
            });
          } else {
            // Par défaut, formule Griffon initiale
            setActiveSubscription({
              id: "default",
              pack: "griffon",
              status: "active",
              started_at: new Date().toISOString(),
              amount: "25000"
            });
          }

          // 2. Récupérer l'historique complet des transactions Fapshi dans Supabase
          const { data: txData } = await supabase
            .from("transactions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (txData && txData.length > 0) {
            setUserTransactions(txData.map(tx => ({
              id: tx.id,
              reference: tx.reference,
              provider_transaction_id: tx.provider_transaction_id,
              payment_method: tx.payment_method || "Fapshi",
              amount: tx.amount ? `${parseInt(tx.amount).toLocaleString("fr-FR")} FCFA` : "25 000 FCFA",
              currency: tx.currency || "FCFA",
              status: tx.status === "completed" || tx.status === "SUCCESSFUL" ? "Payé" : tx.status === "pending" ? "En attente" : "Échoué",
              created_at: new Date(tx.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
              title: tx.reference ? `Abonnement TCF (${tx.reference.slice(0, 15)}...)` : "Abonnement TCF Canada"
            })));
          } else {
            setUserTransactions([]);
          }
        } else {
          setBillingName(storedName || "Candidat Invité");
          setBillingEmail(storedEmail || "candidat@exemple.com");
          setBillingAddress(storedCountry);
          setActiveSubscription({
            id: "guest",
            pack: "griffon",
            status: "active",
            started_at: new Date().toISOString(),
            amount: "25000"
          });
        }
      } catch (err) {
        console.error("Erreur chargement paiements Fapshi:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // 3. Vérification automatique au retour du paiement Fapshi (si transId est dans l'URL)
  useEffect(() => {
    const transId = searchParams?.get("transId") || searchParams?.get("id");
    const statusParam = searchParams?.get("status");

    if (transId && statusParam === "check" && !verifyingPayment) {
      setVerifyingPayment(true);
      fetch(`/api/fapshi/status/${encodeURIComponent(transId)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && (data.status === "SUCCESSFUL" || data.status === "COMPLETED" || data.status === "PAYÉ")) {
            setPaymentSuccessModal({
              show: true,
              packName: "Abonnement Premium TCF",
              expiresAt: data.dateConfirmed ? "dans 1 ou 2 mois" : "selon le pack"
            });
            // Nettoyer l'URL sans recharger la page
            router.replace("/dashboard/payments");
            // Déclencher une actualisation des accès
            window.dispatchEvent(new Event("storage_user_pack_updated"));
          } else if (data.status === "FAILED" || data.status === "EXPIRED") {
            alert(`Paiement non finalisé (${data.status}). Vous pouvez réessayer à tout moment.`);
            router.replace("/dashboard/payments");
          }
        })
        .catch(err => console.error("Erreur vérification retour Fapshi:", err))
        .finally(() => setVerifyingPayment(false));
    }
  }, [searchParams, router, verifyingPayment]);

  const totalSpent = userTransactions.reduce((acc, tx) => {
    if (tx.status === "Payé") {
      const numeric = parseFloat(tx.amount.replace(/[^0-9]/g, ""));
      return acc + (isNaN(numeric) ? 0 : numeric);
    }
    return acc;
  }, 0);

  const formattedTotalSpent = userTransactions.length === 0 
    ? "0 FCFA" 
    : `${totalSpent.toLocaleString("fr-FR")} FCFA`;

  const handleSaveBillingInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setBillingFeedback(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({
            full_name: billingName,
            country: billingAddress,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }

      localStorage.setItem("griffon_user_name", billingName);
      localStorage.setItem("griffon_user_email", billingEmail);
      localStorage.setItem("griffon_user_country", billingAddress);

      setBillingFeedback("Informations de facturation mises à jour !");
      setTimeout(() => {
        setBillingFeedback(null);
        setShowBillingModal(false);
      }, 1500);
    } catch (err: any) {
      setBillingFeedback(err?.message || "Erreur lors de la mise à jour.");
    }
  };

  const currentPackKey = activeSubscription?.pack || "griffon";
  const currentPackConfig = PACK_CONFIGS[currentPackKey] || PACK_CONFIGS.griffon;

  return (
    <div className="space-y-6 pb-12">
      {/* Header avec bouton d'action Fapshi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              Formule Active : {currentPackConfig.name}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
              Passerelle Fapshi Actrice
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Gestion des Paiements & Abonnements</h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Toutes vos transactions sont sécurisées par la passerelle officielle Fapshi (MTN Mobile Money, Orange Money, Visa & Mastercard).
          </p>
        </div>

        <button
          onClick={() => setShowUpgradeModal(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all shrink-0 z-10 group"
        >
          <Sparkles className="h-4 w-4 text-slate-950 group-hover:scale-110 transition-transform" />
          <span>S'abonner ou Mettre à niveau</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* 4 Cartes Métriques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 shrink-0">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{formattedTotalSpent}</div>
              <div className="text-xs text-slate-500 font-medium">Total investi en formation</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 dark:text-white">MTN, Orange, Visa</div>
              <div className="text-xs text-slate-500 font-medium">Moyens Fapshi actifs</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 shrink-0">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {activeSubscription?.expires_at 
                  ? new Date(activeSubscription.expires_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                  : "Renouvellement auto"}
              </div>
              <div className="text-xs text-slate-500 font-medium">Fin de validité</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">100% Sécurisé</div>
              <div className="text-xs text-slate-500 font-medium">Chiffrement SSL Fapshi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Statut d'abonnement & Transactions récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Block: Formule Actuelle */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Détail de votre abonnement TCF
              </h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                Statut : Actif
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">{currentPackConfig.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentPackKey === "standard" && "Accès standard 1 mois • 20 cours • 20 tests (durée standard)"}
                    {currentPackKey === "griffon" && "Accès populaire 1 mois • 500+ cours • Tests de 1h 30 • Corrections IA"}
                    {currentPackKey === "vip" && "Accès VIP 2 mois • 10 000 cours • Tests de 2h 00 • Coaching 1-on-1"}
                  </p>
                </div>
                <span className="font-black text-lg text-amber-600 shrink-0 ml-2">
                  {currentPackConfig.price}
                </span>
              </div>

              <div className="border-t border-slate-200/60 dark:border-slate-800 pt-3 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Activé le</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {activeSubscription?.started_at 
                      ? new Date(activeSubscription.started_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
                      : "Aujourd'hui"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Expire le</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {activeSubscription?.expires_at 
                      ? new Date(activeSubscription.expires_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
                      : "Dans 1 mois"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="font-bold block">Renouvellement et Mise à niveau transparents :</strong> 
                Lorsque vous passez à une formule supérieure, le calcul de durée est automatiquement prolongé et vos résultats d'examens restent 100% intacts.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="flex-1 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Changer de formule / Mettre à niveau</span>
            </button>
          </div>
        </div>

        {/* Block: Transactions récentes */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Transactions Fapshi</h2>
              <span className="text-xs font-semibold text-slate-400">En temps réel</span>
            </div>
            
            {userTransactions.length === 0 ? (
              <div className="py-12 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto text-slate-400">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">Aucun paiement effectué</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Vos reçus officiels Fapshi (MTN, Orange, Visa) apparaîtront ici dès votre premier règlement.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {userTransactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.status === "Payé" ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400'
                      }`}>
                        {tx.status === "Payé" ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-slate-900 dark:text-white">{tx.title}</h3>
                        <p className="text-[10px] text-slate-400">{tx.created_at} • {tx.payment_method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-xs text-slate-900 dark:text-white block">{tx.amount}</span>
                      <span className={`text-[10px] font-bold ${tx.status === "Payé" ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>{tx.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            type="button"
            onClick={() => setShowTransactionsModal(true)}
            className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline self-end flex items-center gap-1 mt-4"
          >
            Voir tout l'historique Fapshi <ChevronRight className="h-3 w-3" />
          </button>
        </div>

      </div>

      {/* Grid: Historique complet des paiements & Facturation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Block: Historique des paiements (Tableau complet) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Mes Paiements & Factures officielles
            </h2>
            <span className="text-xs text-slate-400">Passerelle Fapshi TCF</span>
          </div>

          {userTransactions.length === 0 ? (
            <div className="py-12 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">Aucune transaction enregistrée</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  L'historique complet, les références de transaction Fapshi, et vos reçus téléchargeables apparaîtront ici dès votre validation.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Formule / Pack</th>
                    <th className="pb-3">Référence Fapshi</th>
                    <th className="pb-3">Moyen</th>
                    <th className="pb-3">Montant</th>
                    <th className="pb-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {userTransactions.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 text-slate-900 dark:text-slate-200 font-bold">{row.created_at}</td>
                      <td className="py-4 text-slate-900 dark:text-white font-bold">{row.title}</td>
                      <td className="py-4 text-slate-500 font-mono text-[11px]">{row.reference}</td>
                      <td className="py-4 text-slate-600 dark:text-slate-300">{row.payment_method}</td>
                      <td className="py-4 font-black text-slate-900 dark:text-white">{row.amount}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                          row.status === "Payé" 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Block: Informations de facturation */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profil de Facturation</h2>
              <button onClick={() => setShowBillingModal(true)} className="text-slate-400 hover:text-blue-600">
                <Edit3 className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold">Titulaire du compte</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{billingName || "Non renseigné"}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold">Email de facturation</span>
                <span className="font-bold text-slate-900 dark:text-white">{billingEmail || "Non renseigné"}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold">Pays de résidence</span>
                <span className="font-bold text-slate-900 dark:text-white">{billingAddress || "Burkina Faso"}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold">Passerelle monétique</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  {billingMethod}
                </span>
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => setShowBillingModal(true)}
            className="w-full py-2.5 rounded-xl border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-bold text-xs transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <span>Mettre à jour mes coordonnées</span>
          </button>
        </div>

      </div>

      {/* Modal de Succès après confirmation du paiement */}
      {paymentSuccessModal.show && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-xl text-slate-900 dark:text-white">Paiement Fapshi Confirmé !</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Félicitations ! Votre souscription au <strong>{paymentSuccessModal.packName}</strong> a été validée officiellement par Fapshi. Vos droits d'accès et corrections IA sont débloqués.
              </p>
            </div>
            <button
              onClick={() => {
                setPaymentSuccessModal({ show: false });
                window.location.reload();
              }}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all"
            >
              Accéder à mes cours et simulations 🚀
            </button>
          </div>
        </div>
      )}

      {/* Modal Historique Complet */}
      {showTransactionsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Détail de toutes les transactions Fapshi
              </h3>
              <button onClick={() => setShowTransactionsModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {userTransactions.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-8">Aucun paiement effectué</p>
              ) : (
                userTransactions.map((tx) => (
                  <div key={tx.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{tx.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Réf Fapshi : <span className="font-mono text-[11px] text-blue-500">{tx.reference}</span></p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{tx.created_at} • {tx.payment_method}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-sm text-slate-900 dark:text-white block">{tx.amount}</span>
                      <span className={`text-[11px] font-bold ${tx.status === "Payé" ? "text-emerald-600" : "text-amber-600"}`}>{tx.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowTransactionsModal(false)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Profil de Facturation */}
      {showBillingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-blue-600" />
                Coordonnées de Facturation
              </h3>
              <button onClick={() => setShowBillingModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {billingFeedback && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {billingFeedback}
              </div>
            )}

            <form onSubmit={handleSaveBillingInfo} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Nom du titulaire</label>
                <input
                  type="text"
                  required
                  value={billingName}
                  onChange={(e) => setBillingName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Email pour les reçus Fapshi</label>
                <input
                  type="email"
                  required
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Pays de résidence</label>
                <input
                  type="text"
                  required
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Burkina Faso / Côte d'Ivoire / Canada"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowBillingModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 font-bold text-xs">Annuler</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <UpgradePackModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-sm font-bold">Chargement de l'espace Paiements & Fapshi...</p>
          </div>
        </div>
      }
    >
      <PaymentsContent />
    </Suspense>
  );
}


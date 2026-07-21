"use client";

import { useState, useEffect } from "react";
import { 
  Wallet, 
  CreditCard as CreditCardIcon, 
  FileText, 
  DollarSign, 
  Plus, 
  Download, 
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  X,
  Edit3,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Building,
  User,
  Mail,
  MapPin
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: string;
  status: "Payé" | "En attente" | "Échoué";
  type: string;
  invoice?: string;
}

interface PaymentMethod {
  id: string;
  type: "card" | "mobile_money";
  provider: string; // "Visa", "Mastercard", "Orange Money", "Wave", "Moov Money", "MTN"
  number: string;
  isDefault: boolean;
}

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);

  // Dynamic user data
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [userPaymentMethods, setUserPaymentMethods] = useState<PaymentMethod[]>([]);
  
  // Billing info state
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingMethod, setBillingMethod] = useState("Par défaut (Agrégateur)");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);

  // Form states inside Add Payment Method modal
  const [selectedProvider, setSelectedProvider] = useState("Orange Money");
  const [accountNumber, setAccountNumber] = useState("");
  const [providerType, setProviderType] = useState<"mobile_money" | "card">("mobile_money");
  const [addFeedback, setAddFeedback] = useState<string | null>(null);

  // Save billing feedback
  const [billingFeedback, setBillingFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Load Billing & Profile info
        const storedName = localStorage.getItem("griffon_user_name") || "";
        const storedEmail = localStorage.getItem("griffon_user_email") || "";
        const storedCountry = localStorage.getItem("griffon_user_country") || "Burkina Faso";

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
        } else {
          setBillingName(storedName || "Candidat TCF");
          setBillingEmail(storedEmail || "candidat@exemple.com");
          setBillingAddress(storedCountry);
        }

        // 2. Load Real User Transactions (Default empty if user hasn't paid yet)
        const storedTxRaw = localStorage.getItem("griffon_user_transactions");
        if (storedTxRaw) {
          try {
            setUserTransactions(JSON.parse(storedTxRaw));
          } catch (e) {
            setUserTransactions([]);
          }
        } else {
          setUserTransactions([]); // Empty by default until real payment
        }

        // 3. Load Real Payment Methods (Default empty)
        const storedPmRaw = localStorage.getItem("griffon_user_payment_methods");
        if (storedPmRaw) {
          try {
            setUserPaymentMethods(JSON.parse(storedPmRaw));
          } catch (e) {
            setUserPaymentMethods([]);
          }
        } else {
          setUserPaymentMethods([]); // Empty by default
        }
      } catch (err) {
        console.error("Erreur chargement informations paiements:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Total spent calculation
  const totalSpent = userTransactions.reduce((acc, tx) => {
    if (tx.status === "Payé") {
      const numeric = parseFloat(tx.amount.replace(/[^0-9,.]/g, "").replace(",", "."));
      return acc + (isNaN(numeric) ? 0 : numeric);
    }
    return acc;
  }, 0);

  const formattedTotalSpent = userTransactions.length === 0 
    ? "0,00 FCFA" 
    : `${totalSpent.toLocaleString("fr-FR")} FCFA`;

  // Handler for adding a new payment method
  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber) {
      setAddFeedback("Veuillez saisir le numéro de téléphone ou de carte.");
      return;
    }

    const newPm: PaymentMethod = {
      id: `pm_${Date.now()}`,
      type: providerType,
      provider: selectedProvider,
      number: accountNumber,
      isDefault: userPaymentMethods.length === 0,
    };

    const updated = [...userPaymentMethods, newPm];
    setUserPaymentMethods(updated);
    localStorage.setItem("griffon_user_payment_methods", JSON.stringify(updated));

    setAddFeedback("Moyen de paiement pré-enregistré avec succès pour l'agrégateur !");
    setTimeout(() => {
      setAddFeedback(null);
      setShowAddModal(false);
      setAccountNumber("");
    }, 1500);
  };

  // Handler for updating billing info
  const handleSaveBillingInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setBillingFeedback(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            full_name: billingName,
            country: billingAddress,
            updated_at: new Date().toISOString(),
          });
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

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Espace candidat - Paiements</h1>
        <p className="text-slate-500 text-sm mt-1">Consultez vos transactions, factures et gérez vos moyens de paiement.</p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 shrink-0">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{formattedTotalSpent}</div>
              <div className="text-xs text-slate-500 font-medium">Total dépensé</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0">
              <CreditCardIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{userPaymentMethods.length}</div>
              <div className="text-xs text-slate-500 font-medium">Moyens de paiement</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{userTransactions.length}</div>
              <div className="text-xs text-slate-500 font-medium">Factures</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 shrink-0">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">0,00 FCFA</div>
              <div className="text-xs text-slate-500 font-medium">Solde à payer</div>
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Moyens de paiement & Transactions récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Block: Moyens de paiement */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Moyens de paiement</h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                Agrégateur sécurisé
              </span>
            </div>

            {/* List or Empty State */}
            {userPaymentMethods.length === 0 ? (
              <div className="py-8 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto text-slate-400">
                  <CreditCardIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">Aucun moyen de paiement enregistré</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    Vos cartes bancaires et comptes Mobile Money (Orange Money, Wave, Moov, MTN) s'afficheront automatiquement ici dès votre premier règlement.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {userPaymentMethods.map((pm) => (
                  <div key={pm.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {pm.type === "mobile_money" ? (
                        <Smartphone className="h-6 w-6 text-orange-500" />
                      ) : (
                        <CreditCardIcon className="h-6 w-6 text-blue-600" />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{pm.provider} ({pm.number})</span>
                          {pm.isDefault && (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 text-[10px] font-bold">Par défaut</span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">Prêt pour l'agrégateur</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const filtered = userPaymentMethods.filter(p => p.id !== pm.id);
                        setUserPaymentMethods(filtered);
                        localStorage.setItem("griffon_user_payment_methods", JSON.stringify(filtered));
                      }}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            type="button"
            onClick={() => setShowAddModal(true)}
            className="w-full py-3 mt-4 rounded-xl border-2 border-dashed border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter un moyen de paiement</span>
          </button>
        </div>

        {/* Block: Transactions récentes */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Transactions récentes</h2>
            </div>
            
            {userTransactions.length === 0 ? (
              <div className="py-8 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto text-slate-400">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">Aucune transaction récente</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Vos paiements de souscriptions ou simulations apparaîtront ici en temps réel.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {userTransactions.slice(0, 4).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${tx.status === "Payé" ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {tx.status === "Payé" ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-slate-900 dark:text-white">{tx.title}</h3>
                        <p className="text-[10px] text-slate-400">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-xs text-slate-900 dark:text-white block">{tx.amount}</span>
                      <span className={`text-[10px] font-bold ${tx.status === "Payé" ? 'text-emerald-600' : 'text-amber-600'}`}>{tx.status}</span>
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
            Voir toutes les transactions <ChevronRight className="h-3 w-3" />
          </button>
        </div>

      </div>

      {/* Grid: Historique des paiements & Informations de facturation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Block: Historique des paiements */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Historique des paiements</h2>
          </div>

          {userTransactions.length === 0 ? (
            <div className="py-10 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">Aucun historique de paiement pour le moment</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Dès que vous effectuerez votre première transaction via l'agrégateur de paiement, vos factures téléchargeables apparaîtront ci-dessous.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Montant</th>
                    <th className="pb-3">Statut</th>
                    <th className="pb-3 text-right">Facture</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {userTransactions.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                      <td className="py-4 text-slate-900 dark:text-slate-200 font-bold">{row.date}</td>
                      <td className="py-4 text-slate-900 dark:text-white font-bold">{row.title}</td>
                      <td className="py-4 text-slate-600 dark:text-slate-300">{row.type}</td>
                      <td className="py-4 font-bold text-slate-900 dark:text-white">{row.amount}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                          row.status === "Payé" 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1">
                          <span>{row.invoice || "Facture"}</span>
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pt-4 text-center">
            <button 
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="px-6 py-2.5 rounded-xl border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-bold text-xs transition-colors"
            >
              Voir tout l'historique
            </button>
          </div>
        </div>

        {/* Block: Informations de facturation */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Informations de facturation</h2>
              <Edit3 className="h-4 w-4 text-slate-400" />
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold">Nom complet</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{billingName || "Non renseigné"}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold">Adresse Email</span>
                <span className="font-bold text-slate-900 dark:text-white">{billingEmail || "Non renseigné"}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold">Pays / Adresse de résidence</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {billingAddress || "Non renseignée"}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold">Mode de facturation</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{billingMethod}</span>
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => setShowBillingModal(true)}
            className="w-full py-2.5 rounded-xl border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-bold text-xs transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <span>Modifier les informations</span>
          </button>
        </div>

      </div>

      {/* =================================================== */}
      {/* MODAL 1: Ajouter un moyen de paiement (Agrégateur) */}
      {/* =================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCardIcon className="h-5 w-5 text-blue-600" />
                Ajouter un moyen de paiement
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
                Intégration d'Agrégateur de Paiement (Mobile Money & Cartes)
              </p>
              <p className="text-[11px] leading-relaxed">
                L'agrégateur de paiement sécurisé (Orange Money, Wave, Moov, MTN, Visa, Mastercard) sera connecté à la finalisation du projet. Vous pouvez sélectionner votre mode préférentiel ci-dessous.
              </p>
            </div>

            {addFeedback && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {addFeedback}
              </div>
            )}

            <form onSubmit={handleAddPaymentMethod} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                  Type de paiement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProviderType("mobile_money");
                      setSelectedProvider("Orange Money");
                    }}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      providerType === "mobile_money" 
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600" 
                        : "border-slate-200 dark:border-slate-800 text-slate-600"
                    }`}
                  >
                    📱 Mobile Money
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProviderType("card");
                      setSelectedProvider("Visa");
                    }}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      providerType === "card" 
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600" 
                        : "border-slate-200 dark:border-slate-800 text-slate-600"
                    }`}
                  >
                    💳 Carte Bancaire
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Fournisseur / Opérateur
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white"
                >
                  {providerType === "mobile_money" ? (
                    <>
                      <option value="Orange Money">Orange Money 🍊</option>
                      <option value="Wave">Wave 🌊</option>
                      <option value="Moov Money">Moov Money 📱</option>
                      <option value="MTN Mobile Money">MTN Mobile Money 🟡</option>
                    </>
                  ) : (
                    <>
                      <option value="Visa">Visa 💳</option>
                      <option value="Mastercard">Mastercard 🔴🟡</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {providerType === "mobile_money" ? "Numéro de téléphone affilié" : "Numéro de carte (4 derniers chiffres)"}
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={providerType === "mobile_money" ? "+226 53 36 01 01" : "**** 4242"}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 font-bold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* MODAL 2: Modifier les informations de facturation   */}
      {/* =================================================== */}
      {showBillingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-blue-600" />
                Informations de facturation
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
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Nom de facturation
                </label>
                <input
                  type="text"
                  required
                  value={billingName}
                  onChange={(e) => setBillingName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Adresse email de réception des factures
                </label>
                <input
                  type="email"
                  required
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Pays / Adresse de résidence
                </label>
                <input
                  type="text"
                  required
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Burkina Faso"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBillingModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 font-bold text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* MODAL 3: Voir toutes les transactions / Historique  */}
      {/* =================================================== */}
      {(showTransactionsModal || showHistoryModal) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                {showTransactionsModal ? "Détails des transactions" : "Historique complet des paiements"}
              </h3>
              <button 
                onClick={() => {
                  setShowTransactionsModal(false);
                  setShowHistoryModal(false);
                }} 
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {userTransactions.length === 0 ? (
              <div className="py-12 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto text-slate-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">Aucune transaction enregistrée</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Lorsque vous souscrirez à un pack TCF ou une séance de coaching via l'agrégateur de paiement, les reçus et factures détaillés apparaîtront ici.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {userTransactions.map((tx) => (
                  <div key={tx.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{tx.title}</p>
                      <p className="text-xs text-slate-400">{tx.date} • {tx.type}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-sm text-slate-900 dark:text-white block">{tx.amount}</span>
                      <span className="text-[10px] font-bold text-emerald-600">{tx.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => {
                  setShowTransactionsModal(false);
                  setShowHistoryModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

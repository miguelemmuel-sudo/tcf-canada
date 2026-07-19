"use client";

import { useState } from "react";
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
  Clock
} from "lucide-react";

const recentTransactions = [
  { title: "Séance de coaching – Compréhension écrite", date: "18 juillet 2026", amount: "35,00 CAD", status: "Payé", isPaid: true },
  { title: "Test blanc complet #3", date: "14 juillet 2026", amount: "45,00 CAD", status: "En attente", isPaid: false },
  { title: "Séance de coaching – Production orale", date: "05 juillet 2026", amount: "35,00 CAD", status: "Payé", isPaid: true },
];

const paymentHistory = [
  { date: "18 juillet 2026", desc: "Séance de coaching – Compréhension écrite", type: "Coaching", amount: "35,00 CAD", status: "Payé", statusBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400", invoice: "Facture #1003" },
  { date: "14 juillet 2026", desc: "Test blanc complet #3", type: "Test", amount: "45,00 CAD", status: "En attente", statusBg: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400", invoice: "Facture #1002" },
  { date: "05 juillet 2026", desc: "Séance de coaching – Production orale", type: "Coaching", amount: "35,00 CAD", status: "Payé", statusBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400", invoice: "Facture #1001" },
  { date: "01 juillet 2026", desc: "Abonnement mensuel – Juin 2026", type: "Abonnement", amount: "11,00 CAD", status: "Payé", statusBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400", invoice: "Facture #1000" },
  { date: "15 juin 2026", desc: "Test blanc complet #2", type: "Test", amount: "45,00 CAD", status: "Payé", statusBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400", invoice: "Facture #0999" },
];

export default function PaymentsPage() {
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
              <div className="text-2xl font-black text-slate-900 dark:text-white">126,00 CAD</div>
              <div className="text-xs text-slate-500 font-medium">Total dépensé</div>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
            Voir le détail <ChevronRight className="h-3 w-3" />
          </span>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0">
              <CreditCardIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">2</div>
              <div className="text-xs text-slate-500 font-medium">Moyens de paiement</div>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer">
            Gérer mes moyens <ChevronRight className="h-3 w-3" />
          </span>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">3</div>
              <div className="text-xs text-slate-500 font-medium">Factures</div>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1 cursor-pointer">
            Voir mes factures <ChevronRight className="h-3 w-3" />
          </span>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 shrink-0">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">0,00 CAD</div>
              <div className="text-xs text-slate-500 font-medium">Solde à payer</div>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1 cursor-pointer">
            Tout est à jour !
          </span>
        </div>

      </div>

      {/* Grid: Moyens de paiement & Transactions récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Moyens de paiement */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Moyens de paiement</h2>

          <div className="space-y-3">
            {/* Visa */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="font-extrabold text-blue-800 dark:text-blue-400 italic text-lg tracking-wider">VISA</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Visa **** **** **** 4242</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 text-[10px] font-bold">Par défaut</span>
                  </div>
                  <span className="text-xs text-slate-400">Expire le 12/27</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50">Modifier</button>
                <button className="p-1 text-slate-400 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></button>
              </div>
            </div>

            {/* Mastercard */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="font-black text-amber-600 italic text-sm">mastercard</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Mastercard **** **** **** 8888</span>
                  </div>
                  <span className="text-xs text-slate-400">Expire le 09/26</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-blue-600 hover:bg-slate-50">Définir par défaut</button>
                <button className="p-1 text-slate-400 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></button>
              </div>
            </div>

          </div>

          <button className="w-full py-3 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-900 text-blue-600 font-bold text-xs hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Ajouter un moyen de paiement</span>
          </button>
        </div>

        {/* Transactions récentes */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Transactions récentes</h2>
            
            <div className="space-y-4">
              {recentTransactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${tx.isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {tx.isPaid ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white">{tx.title}</h3>
                      <p className="text-[10px] text-slate-400">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-xs text-slate-900 dark:text-white block">{tx.amount}</span>
                    <span className={`text-[10px] font-bold ${tx.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="text-xs text-blue-600 font-bold hover:underline self-end flex items-center gap-1">
            Voir toutes les transactions <ChevronRight className="h-3 w-3" />
          </button>
        </div>

      </div>

      {/* Grid: Historique des paiements & Informations de facturation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Historique des paiements */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Historique des paiements</h2>

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
                {paymentHistory.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="py-4 text-slate-900 dark:text-slate-200 font-bold">{row.date}</td>
                    <td className="py-4 text-slate-900 dark:text-white font-bold">{row.desc}</td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">{row.type}</td>
                    <td className="py-4 font-bold text-slate-900 dark:text-white">{row.amount}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${row.statusBg}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1">
                        <span>{row.invoice}</span>
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 text-center">
            <button className="px-6 py-2.5 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs transition-colors">
              Voir tout l'historique
            </button>
          </div>
        </div>

        {/* Informations de facturation */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Informations de facturation</h2>

            <div className="space-y-4 text-xs font-medium text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400 block text-[11px]">Nom</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">Joel K.</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Email</span>
                <span className="font-bold text-slate-900 dark:text-white">joel.kandidat@email.com</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Adresse</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  123 Rue Sainte-Catherine Ouest<br />
                  Montréal, QC H2X 1Y4, Canada
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Méthode de facturation</span>
                <span className="font-bold text-slate-900 dark:text-white">Carte par défaut</span>
              </div>
            </div>
          </div>

          <button className="w-full py-2.5 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs transition-colors flex items-center justify-center gap-2">
            <span>Modifier les informations</span>
          </button>
        </div>

      </div>

    </div>
  );
}

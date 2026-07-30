"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function PaymentVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Vérification de votre paiement en cours...");

  useEffect(() => {
    // Notch Pay renvoie sa propre référence dans ?reference=...
    // On priorise 'reference' (Notch Pay) sur 'ref' (notre ref locale)
    const reference = searchParams?.get("reference") || searchParams?.get("trxref") || searchParams?.get("ref");
    
    if (!reference) {
      setStatus("error");
      setMessage("Référence de paiement introuvable.");
      return;
    }

    const checkPayment = async () => {
      try {
        const res = await fetch(`/api/notchpay/status/${encodeURIComponent(reference)}`);
        const data = await res.json();

        if (data.success && (data.status === "complete" || data.status === "completed")) {
          setStatus("success");
          setMessage("Paiement confirmé ! Création de votre session en cours...");

          // Récupérer les identifiants depuis le localStorage
          const email = localStorage.getItem("tcf_reg_email");
          const password = localStorage.getItem("tcf_reg_pwd");
          const plan = localStorage.getItem("tcf_reg_plan") || "standard";

          if (email && password) {
            const supabase = createClient();
            await supabase.auth.signInWithPassword({ email, password });
            
            // Nettoyage et initialisation locale
            localStorage.removeItem("tcf_reg_pwd");
            localStorage.setItem("griffon_user_email", email);
            localStorage.setItem("griffon_user_plan", plan);
            document.cookie = `griffon_user_email=${encodeURIComponent(email)}; path=/; max-age=2592000`;
            document.cookie = `tcf_logged_in=true; path=/; max-age=2592000`;
            
            // Redirection vers le tableau de bord
            window.location.href = "/dashboard";
          } else {
            // Si le sessionStorage a été vidé (ex: autre navigateur), on redirige vers le login classique
            window.location.href = "/login?payment=success";
          }
        } else {
          setStatus("error");
          const normStatus = (data.status || "").toLowerCase();
          if (normStatus === "failed") {
            setMessage("Paiement refusé. Votre accès ne peut pas être activé tant que le paiement n'a pas été effectué avec succès. Veuillez réessayer.");
          } else if (normStatus === "canceled" || normStatus === "cancelled") {
            setMessage("Vous avez annulé le paiement. Veuillez réessayer pour accéder à votre abonnement.");
          } else if (normStatus === "expired") {
            setMessage("La session de paiement a expiré. Veuillez lancer un nouveau paiement.");
          } else {
            setMessage(data.error ? `Erreur technique: ${data.error}` : "Une erreur technique est survenue lors du traitement du paiement. Veuillez réessayer dans quelques instants.");
          }
        }
      } catch (err) {
        console.error("Erreur vérification paiement:", err);
        setStatus("error");
        setMessage(`Erreur technique (Frontend): ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    checkPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Vérification en cours</h2>
            <p className="text-slate-500 dark:text-slate-400">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Paiement validé</h2>
            <p className="text-slate-500 dark:text-slate-400">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-6">
            <XCircle className="h-12 w-12 text-rose-500" />
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Échec de la vérification</h2>
              <p className="text-slate-500 dark:text-slate-400">{message}</p>
            </div>
            
            <p className="text-xs text-slate-500 mt-2">
              Si vous avez déjà payé, veuillez patienter ou vous connecter manuellement.
            </p>
            <button
              onClick={() => {
                const plan = localStorage.getItem("tcf_reg_plan") || searchParams?.get("pack") || "standard";
                const ref = searchParams?.get("ref") || searchParams?.get("reference");
                window.location.href = `/api/notchpay/retry?ref=${ref}&pack=${plan}`;
              }}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors w-full"
            >
              Réessayer le paiement
            </button>
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors w-full"
            >
              Aller à la page de connexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>}>
      <PaymentVerifyContent />
    </Suspense>
  );
}

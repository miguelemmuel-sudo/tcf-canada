"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Cette page n'est plus accessible via un lien magique en production.
// Le flux de réinitialisation passe exclusivement par le code OTP à 6 chiffres
// sur la page /forgot-password. Cette page redirige automatiquement vers /forgot-password.
export default function ResetPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirection vers le flux OTP sur /forgot-password
    router.replace("/forgot-password");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3 text-slate-500">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      <p className="text-sm">Redirection en cours...</p>
    </div>
  );
}

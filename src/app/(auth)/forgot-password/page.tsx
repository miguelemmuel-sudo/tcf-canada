"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, KeyRound, CheckCircle2, Lock } from "lucide-react";

type Step = "email" | "code" | "newPassword" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Send verification code to email
  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !email.includes("@")) {
      setError("Veuillez saisir une adresse e-mail valide.");
      setLoading(false);
      return;
    }

    // Check if account exists
    const storedUsersRaw = localStorage.getItem("griffon_registered_users");
    const storedUsers: any[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
    const userExists = storedUsers.some((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!userExists) {
      setError("Aucun compte n'est associé à cet e-mail. Veuillez vérifier l'adresse.");
      setLoading(false);
      return;
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    setTimeout(() => {
      setLoading(false);
      setStep("code");
    }, 1000);
  };

  // Step 2: Verify code
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (inputCode.trim() !== generatedCode) {
      setError("Code de confirmation incorrect. Veuillez réessayer.");
      return;
    }

    setStep("newPassword");
  };

  // Step 3: Change password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    // Update password in localStorage
    const storedUsersRaw = localStorage.getItem("griffon_registered_users");
    if (storedUsersRaw) {
      const storedUsers: any[] = JSON.parse(storedUsersRaw);
      const updatedUsers = storedUsers.map((u) => {
        if (u.email.toLowerCase() === email.toLowerCase()) {
          return { ...u, password: newPassword };
        }
        return u;
      });
      localStorage.setItem("griffon_registered_users", JSON.stringify(updatedUsers));
    }

    setStep("success");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Mot de passe oublié</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {step === "email" && "Entrez votre e-mail pour recevoir votre code de réinitialisation."}
          {step === "code" && `Un code de confirmation à 6 chiffres a été généré pour ${email}.`}
          {step === "newPassword" && "Créez votre nouveau mot de passe."}
          {step === "success" && "Votre mot de passe a été modifié avec succès !"}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md">
          {error}
        </div>
      )}

      {/* Step 1: Request Email */}
      {step === "email" && (
        <form className="space-y-4" onSubmit={handleSendCode}>
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail du compte</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
              <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Envoi du code..." : "Envoyer le code de confirmation"}
          </Button>
        </form>
      )}

      {/* Step 2: Enter Code */}
      {step === "code" && (
        <form className="space-y-4" onSubmit={handleVerifyCode}>
          {/* Mocked Email Notification Box */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs space-y-1">
            <p className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <Mail className="h-4 w-4" /> Code de confirmation simulé :
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              Votre code de sécurité est : <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400 tracking-widest">{generatedCode}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Code de confirmation (6 chiffres)</Label>
            <div className="relative">
              <Input
                id="code"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                required
                className="text-center font-mono text-lg tracking-widest pl-10"
              />
              <KeyRound className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <Button className="w-full" type="submit">
            Vérifier le code
          </Button>
        </form>
      )}

      {/* Step 3: New Password */}
      {step === "newPassword" && (
        <form className="space-y-4" onSubmit={handleResetPassword}>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="pl-10"
              />
              <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pl-10"
              />
              <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <Button className="w-full" type="submit">
            Enregistrer le nouveau mot de passe
          </Button>
        </form>
      )}

      {/* Step 4: Success */}
      {step === "success" && (
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Vous pouvez désormais vous connecter avec vos nouveaux identifiants.
          </p>
          <Button className="w-full" onClick={() => router.push("/login")}>
            Se connecter maintenant
          </Button>
        </div>
      )}

      <div className="mt-6 text-center text-sm">
        <Link href="/login" className="font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Retour à la connexion
        </Link>
      </div>
    </motion.div>
  );
}

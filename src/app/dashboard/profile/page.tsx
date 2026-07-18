"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Bell, Globe, CreditCard, Camera } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mon Profil</h1>
        <p className="text-muted-foreground mt-1">Gérez vos informations personnelles et vos préférences.</p>
      </div>

      {/* Avatar + plan */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border/50 bg-white dark:bg-slate-950">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-red-700 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary/30">
                  M
                </div>
                <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white dark:bg-slate-900 border-2 border-border flex items-center justify-center hover:bg-slate-50 transition-colors shadow">
                  <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold">Miguel</p>
                <p className="text-muted-foreground text-sm">miguel@exemple.com</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20">Plan Premium</Badge>
                  <Badge variant="outline" className="text-xs">Membre depuis Juillet 2026</Badge>
                </div>
              </div>
              <Button variant="outline" className="hidden md:flex" asChild>
                <a href="/dashboard/settings">
                  <CreditCard className="h-4 w-4 mr-2" /> Gérer l'abonnement
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Informations personnelles */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border/50 bg-white dark:bg-slate-950">
          <CardContent className="p-6 space-y-5">
            <h2 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Informations personnelles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullname">Nom complet</Label>
                <Input id="fullname" defaultValue="Miguel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="miguel@exemple.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pays d'origine</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="country" className="pl-9" defaultValue="France" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Niveau cible</Label>
                <Input id="target" defaultValue="C1" />
              </div>
            </div>
            <Button className="mt-2">Sauvegarder les modifications</Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sécurité */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border/50 bg-white dark:bg-slate-950">
          <CardContent className="p-6 space-y-5">
            <h2 className="font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" /> Sécurité
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-pw">Mot de passe actuel</Label>
                <Input id="current-pw" type="password" placeholder="••••••••" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-pw">Nouveau mot de passe</Label>
                  <Input id="new-pw" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-pw">Confirmer</Label>
                  <Input id="confirm-pw" type="password" placeholder="••••••••" />
                </div>
              </div>
            </div>
            <Button variant="outline">Changer le mot de passe</Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-border/50 bg-white dark:bg-slate-950">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Notifications
            </h2>
            {[
              { label: "Rappels d'entraînement quotidien", desc: "Recevez un rappel si vous n'avez pas pratiqué.", enabled: true },
              { label: "Résultats et corrections par email", desc: "Notifications email après chaque examen.", enabled: true },
              { label: "Nouvelles fonctionnalités", desc: "Mises à jour et nouveautés de la plateforme.", enabled: false },
            ].map((notif) => (
              <div key={notif.label} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{notif.label}</p>
                  <p className="text-xs text-muted-foreground">{notif.desc}</p>
                </div>
                <div className={`relative h-6 w-11 rounded-full transition-colors ${notif.enabled ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`}>
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notif.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

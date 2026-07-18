"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, Globe } from "lucide-react";

const leaderboard = [
  { rank: 1, name: "Amira Touré", country: "🇨🇦", score: 96, badge: "🥇" },
  { rank: 2, name: "Jean-Paul Martin", country: "🇫🇷", score: 93, badge: "🥈" },
  { rank: 3, name: "Sarah Liu", country: "🇨🇳", score: 91, badge: "🥉" },
  { rank: 4, name: "Abdoulaye Diallo", country: "🇸🇳", score: 88, badge: null },
  { rank: 5, name: "Maria Santos", country: "🇧🇷", score: 86, badge: null },
  { rank: 6, name: "Yuki Tanaka", country: "🇯🇵", score: 85, badge: null },
  { rank: 7, name: "Fatima El Amrani", country: "🇲🇦", score: 83, badge: null },
  { rank: 8, name: "David Kim", country: "🇰🇷", score: 82, badge: null },
  { rank: 42, name: "Miguel (Vous)", country: "🇫🇷", score: 72, badge: null, isMe: true },
];

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Classement Mondial</h1>
        <p className="text-muted-foreground mt-1">Comparez vos performances avec les autres apprenants.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        {[
          { icon: Globe, label: "Mondial", active: true },
          { icon: Trophy, label: "Hebdomadaire", active: false },
          { icon: Medal, label: "Mon pays", active: false },
        ].map((tab) => (
          <button
            key={tab.label}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
              tab.active
                ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                : "border-border bg-white dark:bg-slate-950 text-muted-foreground hover:border-primary/40"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="border-border/50 bg-white dark:bg-slate-950">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500" /> Top Apprenants — Cette semaine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {leaderboard.map((user, i) => (
            <motion.div
              key={user.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                user.isMe
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              <div className="w-8 text-center font-bold text-sm text-muted-foreground">
                {user.badge || `#${user.rank}`}
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                <span className="text-sm font-bold text-primary">{user.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${user.isMe ? "text-primary" : ""}`}>
                  {user.name} <span className="text-base">{user.country}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden hidden md:block">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${user.score}%` }}
                  />
                </div>
                <Badge variant={user.isMe ? "default" : "outline"} className="font-bold min-w-[3.5rem] justify-center">
                  {user.score}%
                </Badge>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  CheckCircle2, 
  BrainCircuit, 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic, 
  BarChart3, 
  Award,
  ChevronRight,
  Star
} from "lucide-react";
import Link from "next/link";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-red-50 to-white dark:from-red-950/20 dark:to-background pt-24 pb-32">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="text-center max-w-4xl mx-auto space-y-8"
            >
              <motion.div variants={fadeIn} className="flex justify-center mb-4">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm">
                  <img src="https://flagcdn.com/ca.svg" alt="Drapeau du Canada" className="h-5 w-auto rounded-[2px] shadow-sm" />
                  <span className="text-sm md:text-base font-medium text-slate-700 dark:text-slate-200 flex items-center">
                    <span className="font-serif italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-primary text-lg md:text-xl tracking-wide drop-shadow-sm">Griffon</span> d'or TCF, votre référence de test de langue
                  </span>
                </div>
              </motion.div>
              <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Préparez votre <span className="text-primary">TCF Canada</span> avec intelligence.
              </motion.h1>
              <motion.p variants={fadeIn} className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Réussissez votre examen grâce à une plateforme complète comprenant des examens blancs, une IA correctrice, des statistiques avancées et un suivi personnalisé.
              </motion.p>
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" className="w-full sm:w-auto rounded-full text-lg h-14 px-8 shadow-lg shadow-primary/25" asChild>
                  <Link href="/register">Commencer maintenant <ChevronRight className="ml-2 h-5 w-5"/></Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full text-lg h-14 px-8 bg-white/50 backdrop-blur-sm" asChild>
                  <Link href="#features">Découvrir les fonctionnalités</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Pourquoi nous choisir */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50" id="features">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Pourquoi nous choisir ?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Tout ce dont vous avez besoin pour obtenir le meilleur score possible, réuni au même endroit.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Plus de 5000 questions", icon: BookOpen, desc: "Une base de données exhaustive couvrant tous les niveaux du CECRL." },
                { title: "IA Correctrice (Écrit)", icon: PenTool, desc: "Correction instantanée de vos productions écrites avec suggestions de vocabulaire." },
                { title: "IA Évaluatrice (Oral)", icon: Mic, desc: "Simulez l'épreuve orale. L'IA écoute, transcrit et évalue votre prononciation." },
                { title: "Simulations Officielles", icon: Award, desc: "Des examens blancs chronométrés reproduisant les conditions réelles." },
                { title: "Tableau de Progression", icon: BarChart3, desc: "Suivez votre évolution grâce à des graphiques et des statistiques détaillées." },
                { title: "Correction IA Détaillée", icon: BrainCircuit, desc: "Comprenez vos erreurs grâce aux explications fournies par notre assistant virtuel." }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full border-border/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{feature.desc}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Les 4 épreuves */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <h2 className="text-3xl md:text-5xl font-bold leading-tight">Maîtrisez les 4 épreuves obligatoires</h2>
                <p className="text-lg text-muted-foreground">Notre plateforme reproduit fidèlement l'interface officielle pour que vous soyez parfaitement à l'aise le jour J.</p>
                <ul className="space-y-4">
                  {[
                    { label: "Compréhension Orale (39 questions)", icon: Headphones },
                    { label: "Compréhension Écrite (39 questions)", icon: BookOpen },
                    { label: "Expression Écrite (3 tâches)", icon: PenTool },
                    { label: "Expression Orale (3 tâches)", icon: Mic },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center space-x-3 text-lg font-medium">
                      <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-2 overflow-hidden aspect-video flex items-center justify-center">
                   {/* Placeholder pour une image ou une démo */}
                   <div className="text-center space-y-4">
                     <BrainCircuit className="h-16 w-16 mx-auto text-primary animate-pulse" />
                     <p className="text-lg font-medium text-slate-500">Aperçu interactif de l'examen</p>
                   </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section className="py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ce qu'ils en pensent</h2>
              <div className="flex justify-center space-x-1 text-yellow-400 mb-4">
                {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-6 w-6 fill-current" />)}
              </div>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">Rejoignez des milliers de candidats qui ont réussi leur immigration grâce à TCF Canada Pro.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Amira T.", score: "C1", text: "L'IA pour la correction de l'expression écrite est incroyable. Elle m'a permis d'améliorer mon vocabulaire rapidement." },
                { name: "Jean-Paul M.", score: "B2", text: "Les simulations sont identiques à l'examen officiel. Je n'ai eu aucune surprise le jour J. Je recommande vivement !" },
                { name: "Sarah L.", score: "C2", text: "S'entraîner à l'oral seule était impossible avant de découvrir cette plateforme. L'évaluation vocale est très précise." },
              ].map((review, i) => (
                <Card key={i} className="bg-white/10 border-white/20 text-white backdrop-blur-md">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-lg">{review.name}</div>
                      <Badge variant="glass" className="bg-white/20 text-white border-none">Score obtenu : {review.score}</Badge>
                    </div>
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-4 w-4 fill-current" />)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="opacity-90 italic">"{review.text}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50" id="pricing">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Tarifs Simples et Transparents</h2>
              <p className="text-muted-foreground text-lg">Choisissez le plan qui correspond à votre rythme de révision.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
              
              {/* Gratuit */}
              <Card className="border-border/50 bg-white dark:bg-slate-900 shadow-sm">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">Gratuit</CardTitle>
                  <div className="text-4xl font-bold">0€<span className="text-lg text-muted-foreground font-normal">/mois</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Accès limité</li>
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> 20 questions de test</li>
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> 1 examen blanc complet</li>
                    <li className="flex items-center opacity-50"><CheckCircle2 className="h-4 w-4 mr-2" /> Correction IA</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-6" asChild><Link href="/register">Essayer</Link></Button>
                </CardContent>
              </Card>

              {/* Premium */}
              <Card className="border-primary shadow-xl shadow-primary/10 bg-white dark:bg-slate-900 relative scale-105 z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Badge className="bg-primary text-white uppercase tracking-wider px-3 py-1">Populaire</Badge>
                </div>
                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-2xl mb-2">Premium</CardTitle>
                  <div className="text-4xl font-bold">29€<span className="text-lg text-muted-foreground font-normal">/mois</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 text-sm font-medium">
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Toutes les fonctionnalités</li>
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Examens blancs illimités</li>
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Correction IA (Écrit & Oral)</li>
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Statistiques avancées</li>
                  </ul>
                  <Button className="w-full mt-6" asChild><Link href="/register">Choisir Premium</Link></Button>
                </CardContent>
              </Card>

              {/* Premium Plus */}
              <Card className="border-border/50 bg-white dark:bg-slate-900 shadow-sm">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">Premium Plus</CardTitle>
                  <div className="text-4xl font-bold">89€<span className="text-lg text-muted-foreground font-normal">/3 mois</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Tout le plan Premium</li>
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Corrections prioritaires</li>
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> 2 sessions de Coaching</li>
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Support VIP 24/7</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-6" asChild><Link href="/register">Choisir Premium Plus</Link></Button>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

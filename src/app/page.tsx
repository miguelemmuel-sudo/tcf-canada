"use client";
// Déploiement forcé (Vidage du cache)

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteNavbar } from "@/components/layout/SiteNavbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
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
  Star,
  UserCheck,
  Globe,
  Trophy,
  FileCheck2,
  Users
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
      <SiteNavbar />
      <main className="flex-1 pt-28">
        
        {/* Hero Section Griffon D'or */}
        <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 pt-8 pb-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Text Block */}
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="lg:col-span-6 space-y-6"
              >
                <motion.span variants={fadeIn} className="text-amber-600 dark:text-amber-400 font-extrabold text-sm md:text-base tracking-widest uppercase block">
                  RÉUSSISSEZ VOTRE TCF CANADA
                </motion.span>

                <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl font-black tracking-tight text-[#0e2238] dark:text-white leading-[1.1]">
                  Préparez votre TCF avec les experts <span className="text-amber-600 dark:text-amber-500">Griffon d'or</span>
                </motion.h1>

                <motion.p variants={fadeIn} className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed font-medium">
                  Boostez votre score au <strong>Test de Connaissance du Français (TCF Canada)</strong>.<br/>
                  Cours intensifs, examens blancs officiels (Compréhension et Expression) et coaching personnalisé.<br/>
                  Atteignez les niveaux NCLC 7+ pour votre projet d'immigration Entrée Express ou vos études au Canada.
                </motion.p>

                <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-[#0e2238] hover:bg-[#153252] text-white font-bold h-13 px-7 rounded-lg text-sm tracking-wide" 
                    asChild
                  >
                    <Link href="#features">DÉCOUVRIR NOS FORMATIONS</Link>
                  </Button>
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold h-13 px-7 rounded-lg text-sm tracking-wide shadow-md" 
                    asChild
                  >
                    <Link href="/register">ACCÉDER AU PACK GRIFFON D'OR</Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Right Image Block with Floating elements */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-6 relative flex justify-center"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 max-w-lg w-full">
                  <img 
                    src="/griffon_student.png" 
                    alt="Étudiante Griffon d'or TCF Canada" 
                    className="w-full h-auto object-cover"
                  />
                  {/* Floating Whatsapp Button */}
                  <a 
                    href="https://wa.me/237695903205" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="absolute bottom-4 right-4 rounded-full shadow-2xl transition-all hover:scale-110 hover:brightness-110 flex items-center justify-center"
                    aria-label="Contact WhatsApp"
                  >
                    <img 
                      src="/whatsapp.svg" 
                      alt="WhatsApp" 
                      className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-xl" 
                    />
                  </a>
                </div>
              </motion.div>

            </div>

            {/* Floating 4 Cards Feature Banner */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-12 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 md:p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                
                <div className="flex items-start gap-4 pr-4 pt-4 md:pt-0">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400/20 via-yellow-500/20 to-amber-600/10 border border-amber-400/60 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
                    <BookOpen className="h-6 w-6 text-amber-500 dark:text-yellow-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-amber-600 dark:text-yellow-400 text-base drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">Préparation TCF Intensive</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Plus de 10 000 cours progressifs pour maîtriser l'expression et la compréhension du français canadien.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 px-0 md:px-4 pt-4 md:pt-0">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400/20 via-yellow-500/20 to-amber-600/10 border border-amber-400/60 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
                    <FileCheck2 className="h-6 w-6 text-amber-500 dark:text-yellow-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-amber-600 dark:text-yellow-400 text-base drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">Examens Blancs Officiels</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Simulateur d'examen TCF en conditions réelles (Compréhension Orale, Écrite, etc.) avec chrono.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 px-0 md:px-4 pt-4 md:pt-0">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400/20 via-yellow-500/20 to-amber-600/10 border border-amber-400/60 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
                    <UserCheck className="h-6 w-6 text-amber-500 dark:text-yellow-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-amber-600 dark:text-yellow-400 text-base drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">Coaching Immigration</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Un suivi individuel pour cibler vos lacunes linguistiques et viser le niveau NCLC 9.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pl-0 lg:pl-4 pt-4 md:pt-0">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400/20 via-yellow-500/20 to-amber-600/10 border border-amber-400/60 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
                    <Trophy className="h-6 w-6 text-amber-500 dark:text-yellow-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-amber-600 dark:text-yellow-400 text-base drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">Objectif Entrée Express</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      La méthode prouvée pour décrocher vos points et réussir votre projet d'immigration canadienne.
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* Dark Key Statistics Banner */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-6 bg-[#0e2238] rounded-2xl shadow-xl p-6 md:p-8 text-white"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-x divide-slate-700/60">
                
                <div className="flex items-center gap-4 px-2">
                  <Users className="h-10 w-10 text-amber-500 shrink-0" />
                  <div>
                    <div className="text-2xl md:text-3xl font-black text-amber-500">1200+</div>
                    <div className="text-xs text-slate-300 font-medium">Étudiants formés</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 px-4">
                  <FileCheck2 className="h-10 w-10 text-amber-500 shrink-0" />
                  <div>
                    <div className="text-2xl md:text-3xl font-black text-amber-500">95%</div>
                    <div className="text-xs text-slate-300 font-medium">Taux de réussite</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 px-4">
                  <Globe className="h-10 w-10 text-amber-500 shrink-0" />
                  <div>
                    <div className="text-2xl md:text-3xl font-black text-amber-500">15+</div>
                    <div className="text-xs text-slate-300 font-medium">Pays représentés</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 px-4">
                  <Trophy className="h-10 w-10 text-amber-500 shrink-0" />
                  <div>
                    <div className="text-2xl md:text-3xl font-black text-amber-500">5+</div>
                    <div className="text-xs text-slate-300 font-medium">Années d'expérience</div>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </section>

        {/* Pourquoi nous choisir */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50" id="features">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#0e2238] dark:text-white">Pourquoi choisir Griffon d'or ?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Tout ce dont vous avez besoin pour obtenir le meilleur score TCF Canada, réuni au même endroit.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Banque de +10 000 Questions TCF", icon: BookOpen, desc: "Une base de données exhaustive couvrant tous les niveaux du CECRL (A1 à C2) pour l'immigration canadienne." },
                { title: "IA Correctrice (Expression Écrite)", icon: PenTool, desc: "Correction instantanée de vos textes avec suggestions de vocabulaire pour atteindre le niveau NCLC 9+." },
                { title: "Simulateur IA (Expression Orale)", icon: Mic, desc: "Simulez l'épreuve orale TCF Canada. L'IA écoute, transcrit et évalue votre prononciation et votre aisance." },
                { title: "Simulations TCF Officielles", icon: Award, desc: "Des examens blancs chronométrés reproduisant fidèlement les conditions réelles d'Entrée Express." },
                { title: "Tableau de Progression NCLC", icon: BarChart3, desc: "Suivez votre évolution grâce à des graphiques détaillés pour cibler vos points faibles avant l'examen." },
                { title: "Correction IA Détaillée", icon: BrainCircuit, desc: "Comprenez vos erreurs grâce aux explications fournies par notre examinateur IA virtuel." }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full border-border/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:shadow-lg hover:border-amber-500/30 transition-all duration-300">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400/20 via-yellow-500/20 to-amber-600/10 border border-amber-400/60 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/25">
                        <feature.icon className="h-6 w-6 text-amber-500 dark:text-yellow-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
                      </div>
                      <CardTitle className="text-xl text-amber-600 dark:text-yellow-400 font-extrabold drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">{feature.title}</CardTitle>
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
                <h2 className="text-3xl md:text-5xl font-bold leading-tight text-[#0e2238] dark:text-white">Maîtrisez les 4 épreuves obligatoires</h2>
                <p className="text-lg text-muted-foreground">Notre plateforme reproduit fidèlement l'interface officielle pour que vous soyez parfaitement à l'aise le jour J.</p>
                <ul className="space-y-4">
                  {[
                    { label: "Compréhension Orale (39 questions)", icon: Headphones },
                    { label: "Compréhension Écrite (39 questions)", icon: BookOpen },
                    { label: "Expression Écrite (3 tâches)", icon: PenTool },
                    { label: "Expression Orale (3 tâches)", icon: Mic },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center space-x-3 text-lg font-medium">
                      <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <span className="text-slate-800 dark:text-slate-200">{item.label}</span>
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
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-blue-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-2 overflow-hidden aspect-video flex items-center justify-center">
                   <div className="text-center space-y-4">
                     <BrainCircuit className="h-16 w-16 mx-auto text-amber-600 animate-pulse" />
                     <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Aperçu interactif de l'examen Griffon d'or</p>
                   </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50" id="packs">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#0e2238] dark:text-white">Nos Packs de Formation</h2>
              <p className="text-muted-foreground text-lg">Choisissez la formule adaptée à votre objectif TCF Canada.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
              
              <Card className="border-border/50 bg-white dark:bg-slate-900 shadow-sm">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2 text-[#0e2238] dark:text-white">Pack Standard</CardTitle>
                  <div className="text-4xl font-bold text-amber-600">100<span className="text-lg text-muted-foreground font-normal"> FCFA</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-amber-600" /> Accès plateforme 30 jours</li>
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-amber-600" /> 10 tests réels complets</li>
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-amber-600" /> Correction automatique</li>
                  </ul>
                  <Button variant="outline" className="w-full mt-6 border-amber-600 text-amber-600 hover:bg-amber-50" asChild><Link href="/register">S'inscrire</Link></Button>
                </CardContent>
              </Card>

              <Card className="border-amber-500 shadow-xl shadow-amber-500/10 bg-white dark:bg-slate-900 relative scale-105 z-10 overflow-visible mt-6 md:mt-0">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-amber-600 text-white uppercase tracking-wider px-3 py-1 font-bold whitespace-nowrap">Le plus populaire</Badge>
                </div>
                <CardHeader className="text-center pb-8 pt-10">
                  <CardTitle className="text-2xl mb-2 text-[#0e2238] dark:text-white">Pack Griffon d'Or</CardTitle>
                  <div className="text-4xl font-bold text-amber-600">17.500<span className="text-lg text-muted-foreground font-normal"> FCFA</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 text-sm font-medium">
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-amber-600" /> Accès illimité jusqu'à l'examen</li>
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-amber-600" /> Simulations et tests de 1h 30</li>
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-amber-600" /> Corrections IA + Formateurs humains</li>
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-amber-600" /> Messagerie directe avec Coach</li>
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-amber-600" /> Support personnalisé</li>
                  </ul>
                  <Button className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white font-bold" asChild><Link href="/register">Rejoindre le Pack</Link></Button>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-white dark:bg-slate-900 shadow-sm">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2 text-[#0e2238] dark:text-white">Pack VIP & Coaching</CardTitle>
                  <div className="text-4xl font-bold text-amber-600">50.000<span className="text-lg text-muted-foreground font-normal"> FCFA</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-amber-600" /> Tout le Pack Griffon d'Or inclus</li>
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-amber-600" /> Simulations et tests de 2h 00 (max)</li>
                    <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-amber-600" /> Coaching 1-on-1 avec expert</li>
                    <li className="flex items-start"><CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-amber-600 shrink-0" /> <span>Plus de 10 000 cours et 100 tests sur-mesure pour vous garantir une réussite absolue au TCF Canada !</span></li>
                  </ul>
                  <Button variant="outline" className="w-full mt-6 border-amber-600 text-amber-600 hover:bg-amber-50" asChild><Link href="/register">Postuler au VIP</Link></Button>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}


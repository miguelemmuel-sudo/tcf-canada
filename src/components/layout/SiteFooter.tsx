import Link from "next/link";
import { GraduationCap, Mail, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-amber-600" />
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              TCF Canada <span className="text-amber-600">Pro</span>
            </span>
          </Link>
          <p className="text-xs text-slate-500 leading-relaxed">
            La plateforme n°1 pour préparer et réussir votre test de connaissance du français pour l'immigration canadienne.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Formations TCF</h4>
          <ul className="space-y-2 text-xs text-slate-500">
            <li><Link href="#features" className="hover:text-amber-600 transition-colors">Fonctionnalités</Link></li>
            <li><Link href="#packs" className="hover:text-amber-600 transition-colors">Tarifs & Packs</Link></li>
            <li><Link href="/dashboard/courses" className="hover:text-amber-600 transition-colors">Catalogue de cours</Link></li>
            <li><Link href="/dashboard/exams" className="hover:text-amber-600 transition-colors">Examens blancs</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Contact Direct</h4>
          <ul className="space-y-2.5 text-xs text-slate-500">
            <li>
              <a href="mailto:griffondortcf@gmail.com" className="flex items-center gap-2 hover:text-amber-600 transition-colors font-medium">
                <Mail className="h-4 w-4 text-amber-600 shrink-0" />
                <span>griffondortcf@gmail.com</span>
              </a>
            </li>
            <li>
              <a href="tel:+237695903205" className="flex items-center gap-2 hover:text-amber-600 transition-colors font-medium">
                <Phone className="h-4 w-4 text-amber-600 shrink-0" />
                <span>+237 695 903 205</span>
              </a>
            </li>
            <li>
              <a 
                href="https://wa.me/237695903205" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-[#25D366] hover:text-[#1eab52] font-bold transition-colors"
              >
                <img src="/whatsapp.svg" alt="WhatsApp" className="h-5 w-5 shrink-0 object-contain" />
                <span>Assistance WhatsApp 24/7</span>
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Légal</h4>
          <ul className="space-y-2 text-xs text-slate-500">
            <li><Link href="/terms" className="hover:text-amber-600 transition-colors">Conditions d'utilisation</Link></li>
            <li><Link href="/privacy" className="hover:text-amber-600 transition-colors">Politique de confidentialité</Link></li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} TCF Canada Pro — Griffon d'Or. Tous droits réservés.
      </div>
    </footer>
  );
}

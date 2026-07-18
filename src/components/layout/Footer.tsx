import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">TCF Canada <span className="text-primary">Pro</span></span>
          </Link>
          <p className="text-sm text-muted-foreground">
            La plateforme n°1 pour préparer et réussir votre test de connaissance du français pour l'immigration canadienne.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Produit</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="#features" className="hover:text-primary transition-colors">Fonctionnalités</Link></li>
            <li><Link href="#pricing" className="hover:text-primary transition-colors">Tarifs</Link></li>
            <li><Link href="/courses" className="hover:text-primary transition-colors">Cours</Link></li>
            <li><Link href="/exams" className="hover:text-primary transition-colors">Examens blancs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="#faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Légal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/terms" className="hover:text-primary transition-colors">Conditions d'utilisation</Link></li>
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Politique de confidentialité</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} TCF Canada Pro. Tous droits réservés.
      </div>
    </footer>
  );
}

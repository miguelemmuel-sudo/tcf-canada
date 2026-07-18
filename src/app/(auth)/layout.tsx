import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 relative">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-6">
        <Link href="/" className="inline-flex items-center space-x-2">
          <GraduationCap className="h-10 w-10 text-primary" />
          <span className="text-3xl font-bold tracking-tight">TCF Canada <span className="text-primary">Pro</span></span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-slate-950 py-8 px-4 shadow-xl shadow-primary/5 sm:rounded-2xl sm:px-10 border border-slate-200 dark:border-slate-800">
          {children}
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { Zap, Twitter, Linkedin, Github } from 'lucide-react';

const LINKS = [
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Comment ça marche', href: '#how-it-works' },
  { label: 'Tarifs', href: '/pricing' },
  { label: 'Connexion', href: '/login' },
  { label: 'Inscription', href: '/register' },
];

const SOCIALS = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' },
];

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Top row */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-sm shadow-violet-600/30">
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-extrabold text-sm text-white tracking-tight">
                MarketPlan <span className="text-violet-400">IA</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Plateforme de stratégie marketing et de planification de contenu propulsée par l'IA pour les entreprises modernes.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-3 mt-6">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-violet-500/50 hover:bg-violet-500/10 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Nav links */}
          <div className="md:col-span-2 flex flex-wrap gap-x-10 gap-y-3 md:justify-end md:items-start">
            {LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-slate-500">© 2026 MarketPlan IA. Tous droits réservés.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Politique de Confidentialité</Link>
            <Link href="/terms" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Conditions d'Utilisation</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

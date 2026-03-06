'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

export default function HomePage() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('mp-theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('mp-theme', next);
  };

  const dk = theme === 'dark';

  const navLinks = [
    { label: 'Fonctionnalités', href: '#fonctionnalites' },
    { label: 'Comment ça marche', href: '#comment-ca-marche' },
    { label: 'Témoignages', href: '#temoignages' },
    { label: 'Tarifs', href: '#tarifs' },
    { label: 'FAQ', href: '#faq' },
  ];

  const features = [
    {
      id: 'ai', tag: 'IA', span: 'lg:col-span-2',
      accent: { dk: 'violet', li: 'violet' },
      title: 'IA Stratégique',
      desc: 'Générez une stratégie marketing complète, personnalisée et actionnable en quelques minutes. Personas, messages, canaux, plan d\'action — tout créé automatiquement.',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      ),
    },
    {
      id: 'swot', tag: 'Analyse', span: 'lg:col-span-1',
      accent: { dk: 'indigo', li: 'indigo' },
      title: 'Analyse SWOT',
      desc: 'Identifiez forces, faiblesses, opportunités et menaces automatiquement.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      id: 'cal', tag: 'Planning', span: 'lg:col-span-1',
      accent: { dk: 'fuchsia', li: 'fuchsia' },
      title: 'Calendrier de Contenu',
      desc: 'Planifiez et organisez vos publications sur tous vos réseaux sociaux.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
    {
      id: 'ava', tag: 'Méthode', span: 'lg:col-span-2',
      accent: { dk: 'orange', li: 'orange' },
      title: 'Cycle AVA',
      desc: 'Structurez vos actions selon la méthode éprouvée Avant / Pendant / Après pour maximiser l\'impact à chaque étape du parcours client.',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      ),
    },
    {
      id: 'pdf', tag: 'Export', span: 'lg:col-span-1',
      accent: { dk: 'emerald', li: 'emerald' },
      title: 'Export PDF Pro',
      desc: 'Exportez votre stratégie complète en PDF professionnel avec votre branding.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      id: 'team', tag: 'Équipe', span: 'lg:col-span-1',
      accent: { dk: 'rose', li: 'rose' },
      title: 'Multi-Rôles',
      desc: 'Gérez votre équipe avec des rôles Admin et Marketeur distincts.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
  ];

  const accentStyles: Record<string, { dkIcon: string; liIcon: string; dkBorder: string; liBorder: string; dkTag: string; liTag: string }> = {
    violet: { dkIcon: 'bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/25', liIcon: 'bg-violet-100 text-violet-600', dkBorder: 'hover:border-violet-500/40 hover:bg-violet-500/5', liBorder: 'hover:border-violet-300 hover:shadow-violet-100', dkTag: 'bg-violet-500/15 text-violet-400', liTag: 'bg-violet-100 text-violet-600' },
    indigo: { dkIcon: 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/25', liIcon: 'bg-indigo-100 text-indigo-600', dkBorder: 'hover:border-indigo-500/40 hover:bg-indigo-500/5', liBorder: 'hover:border-indigo-300 hover:shadow-indigo-100', dkTag: 'bg-indigo-500/15 text-indigo-400', liTag: 'bg-indigo-100 text-indigo-600' },
    fuchsia: { dkIcon: 'bg-fuchsia-500/20 text-fuchsia-400 ring-1 ring-fuchsia-500/25', liIcon: 'bg-fuchsia-100 text-fuchsia-600', dkBorder: 'hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5', liBorder: 'hover:border-fuchsia-300 hover:shadow-fuchsia-100', dkTag: 'bg-fuchsia-500/15 text-fuchsia-400', liTag: 'bg-fuchsia-100 text-fuchsia-600' },
    orange: { dkIcon: 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/25', liIcon: 'bg-orange-100 text-orange-600', dkBorder: 'hover:border-orange-500/40 hover:bg-orange-500/5', liBorder: 'hover:border-orange-300 hover:shadow-orange-100', dkTag: 'bg-orange-500/15 text-orange-400', liTag: 'bg-orange-100 text-orange-600' },
    emerald: { dkIcon: 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/25', liIcon: 'bg-emerald-100 text-emerald-600', dkBorder: 'hover:border-emerald-500/40 hover:bg-emerald-500/5', liBorder: 'hover:border-emerald-300 hover:shadow-emerald-100', dkTag: 'bg-emerald-500/15 text-emerald-400', liTag: 'bg-emerald-100 text-emerald-600' },
    rose: { dkIcon: 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/25', liIcon: 'bg-rose-100 text-rose-600', dkBorder: 'hover:border-rose-500/40 hover:bg-rose-500/5', liBorder: 'hover:border-rose-300 hover:shadow-rose-100', dkTag: 'bg-rose-500/15 text-rose-400', liTag: 'bg-rose-100 text-rose-600' },
  };

  const steps = [
    { num: '01', title: 'Remplissez le formulaire', desc: 'Décrivez votre entreprise, vos objectifs et votre marché cible en quelques clics.' },
    { num: '02', title: "L'IA génère votre stratégie", desc: 'Notre IA analyse vos données et crée une stratégie marketing complète et personnalisée.' },
    { num: '03', title: 'Planifiez votre contenu', desc: "Transformez votre stratégie en calendrier de publications prêt à l'emploi." },
    { num: '04', title: 'Exportez & Partagez', desc: 'Téléchargez votre plan en PDF professionnel et partagez-le avec votre équipe.' },
  ];

  const testimonials = [
    { name: 'Sophie Martin', role: 'Freelance Marketing', avatar: 'SM', text: "MarketPlan IA a révolutionné ma façon de travailler. Je génère des stratégies complètes en 5 minutes !", stars: 5, gradient: 'from-violet-500 to-purple-600' },
    { name: 'Thomas Dubois', role: 'CEO Startup', avatar: 'TD', text: "L'analyse SWOT automatique m'a permis d'identifier des opportunités que j'aurais manquées.", stars: 5, gradient: 'from-indigo-500 to-blue-600' },
    { name: 'Amina Benali', role: 'Responsable Marketing', avatar: 'AB', text: "Le calendrier de contenu est incroyable. Notre équipe est maintenant parfaitement synchronisée.", stars: 5, gradient: 'from-fuchsia-500 to-pink-600' },
  ];

  const plans = [
    {
      name: 'Gratuit', price: '0€', period: '/mois', desc: 'Parfait pour débuter',
      features: ['1 stratégie/mois', 'Analyse SWOT basique', '10 publications/mois', 'Export PDF standard', 'Support communautaire'],
      cta: 'Commencer gratuitement', popular: false,
    },
    {
      name: 'Pro', price: '29€', period: '/mois', desc: 'Pour les marketeurs avancés',
      features: ['Stratégies illimitées', 'SWOT avancé avec IA', 'Publications illimitées', 'Suggestions IA', 'Templates premium', 'Export PDF Pro', 'Support prioritaire'],
      cta: 'Essai gratuit 30 jours', popular: true,
    },
    {
      name: 'Business', price: '99€', period: '/mois', desc: 'Pour équipes & agences',
      features: ['Tout du plan Pro', 'Multi-comptes', 'Collaboration équipe', 'Analytics avancés', 'API personnalisée', 'Marque blanche', 'Support 24/7'],
      cta: "Contacter l'équipe", popular: false,
    },
  ];

  const faqs = [
    { q: "Comment l'IA génère-t-elle ma stratégie marketing ?", a: "Notre IA analyse les informations que vous fournissez (secteur, cible, objectifs) et génère automatiquement un plan structuré selon la méthode Avant/Pendant/Après. Elle propose des personas, messages, canaux et actions concrètes adaptés à votre contexte." },
    { q: "Puis-je personnaliser les stratégies générées ?", a: "Absolument ! Toutes les stratégies sont entièrement modifiables. Vous pouvez ajuster les personas, modifier les messages, ajouter ou retirer des canaux, et personnaliser chaque élément selon votre vision terrain." },
    { q: "Comment fonctionne le calendrier de contenu ?", a: "Une fois votre stratégie créée, planifiez vos publications sur différents réseaux sociaux. L'outil suggère du contenu adapté à chaque phase et vous permet d'organiser vos posts dans un calendrier intuitif avec rappels et statuts." },
    { q: "Mes données sont-elles sécurisées ?", a: "La sécurité est notre priorité. Toutes vos données sont chiffrées et stockées de manière sécurisée. Nous ne partageons jamais vos informations avec des tiers et vous conservez la propriété complète de vos stratégies." },
    { q: "Y a-t-il une période d'essai gratuite ?", a: "Oui ! Le plan Gratuit est disponible à vie sans carte bancaire. Le plan Pro inclut 30 jours d'essai gratuit pour tester toutes les fonctionnalités avancées sans engagement." },
  ];

  if (!mounted) return null;

  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-500 ${dk ? 'bg-[#08080F] text-white' : 'bg-white text-slate-900'}`}>

      {/* ── BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {dk ? (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-225 h-225 rounded-full bg-violet-700/10 blur-[180px]" />
            <div className="absolute top-1/2 -right-40 w-150 h-150 rounded-full bg-indigo-700/8 blur-[140px]" />
            <div className="absolute bottom-0 -left-40 w-125 h-125 rounded-full bg-fuchsia-700/8 blur-[120px]" />
          </>
        ) : (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-225 h-225 rounded-full bg-violet-200/60 blur-[180px]" />
            <div className="absolute top-2/3 right-0 w-150 h-150 rounded-full bg-indigo-200/50 blur-[140px]" />
          </>
        )}
      </div>

      {/* ═══════════════════════════════
          NAVBAR
      ═══════════════════════════════ */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? dk
            ? 'bg-[#08080F]/80 backdrop-blur-2xl border-b border-white/[0.07]'
            : 'bg-white/80 backdrop-blur-2xl border-b border-black/6 shadow-sm'
          : ''
      }`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-17.5">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="relative w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform">
                M
              </div>
              <span className={`font-bold text-[15px] ${dk ? 'text-white' : 'text-slate-900'}`}>
                MarketPlan <span className="text-violet-500">IA</span>
              </span>
            </Link>

            {/* Desktop nav — centered */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((l) => (
                <a key={l.label} href={l.href}
                  className={`px-4 py-2 rounded-xl text-[13.5px] font-medium transition-all duration-200 ${
                    dk ? 'text-white/45 hover:text-white hover:bg-white/7' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}>
                  {l.label}
                </a>
              ))}
            </div>

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-2">
              <button onClick={toggleTheme} aria-label="Thème"
                className={`w-9 h-9 rounded-xl grid place-items-center transition-all duration-200 ${
                  dk ? 'bg-white/7 hover:bg-white/12 text-white/45 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                }`}>
                {dk
                  ? <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
                  : <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
                }
              </button>
              <Link href="/login"
                className={`text-[13.5px] font-medium px-4 py-2 rounded-xl transition-all duration-200 ${
                  dk ? 'text-white/50 hover:text-white hover:bg-white/7' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}>
                Connexion
              </Link>
              <Link href="/register"
                className="text-[13.5px] font-bold px-5 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.03] transition-all duration-300">
                Commencer
              </Link>
            </div>

            {/* Mobile controls */}
            <div className="flex md:hidden items-center gap-2">
              <button onClick={toggleTheme} aria-label="Thème"
                className={`w-9 h-9 rounded-xl grid place-items-center ${dk ? 'bg-white/7 text-white/45' : 'bg-slate-100 text-slate-500'}`}>
                {dk
                  ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
                  : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
                }
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu"
                className={`w-9 h-9 flex flex-col justify-center items-center gap-1.25 rounded-xl ${dk ? 'hover:bg-white/7' : 'hover:bg-slate-100'}`}>
                <span className={`block w-5 h-0.5 origin-center transition-all duration-300 ${dk ? 'bg-white/70' : 'bg-slate-600'} ${mobileMenuOpen ? 'rotate-45 translate-y-1.75' : ''}`} />
                <span className={`block w-5 h-0.5 transition-all duration-300 ${dk ? 'bg-white/70' : 'bg-slate-600'} ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-5 h-0.5 origin-center transition-all duration-300 ${dk ? 'bg-white/70' : 'bg-slate-600'} ${mobileMenuOpen ? '-rotate-45 -translate-y-1.75' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-95' : 'max-h-0'}`}>
          <div className={`px-5 py-4 space-y-1 border-t ${dk ? 'bg-[#08080F]/95 border-white/[0.07]' : 'bg-white/95 border-slate-100'}`}>
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium ${dk ? 'text-white/55 hover:text-white hover:bg-white/7' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                {l.label}
              </a>
            ))}
            <div className={`pt-3 border-t space-y-2 ${dk ? 'border-white/[0.07]' : 'border-slate-100'}`}>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                className={`block w-full text-center py-3 rounded-xl text-sm font-medium border ${dk ? 'border-white/10 text-white/55' : 'border-slate-200 text-slate-600'}`}>
                Connexion
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-3 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm">
                Commencer gratuitement
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════
          HERO
      ═══════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-5 sm:px-8 pt-32 pb-24 z-10">

        {/* Badge */}
        <div className={`inline-flex items-center gap-2.5 rounded-full px-4 py-2 mb-10 border text-[13px] font-semibold tracking-wide ${
          dk ? 'bg-violet-500/10 border-violet-500/20 text-violet-300' : 'bg-violet-50 border-violet-200 text-violet-600'
        }`}>
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inset-0 rounded-full bg-violet-400 opacity-75" />
            <span className="relative rounded-full h-2 w-2 bg-violet-500" />
          </span>
          Propulsé par l&apos;Intelligence Artificielle
        </div>

        {/* Headline */}
        <h1 className={`font-black tracking-tight leading-[1.04] mb-6 max-w-4xl
          text-[2.6rem] sm:text-[3.8rem] md:text-[5.2rem] lg:text-[6rem]
          ${dk ? 'text-white' : 'text-slate-950'}`}>
          Votre stratégie<br />
          marketing{' '}
          <span className="bg-linear-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            propulsée
          </span>
        </h1>

        {/* Sub-headline */}
        <p className={`font-bold tracking-tight mb-8 text-[1.4rem] sm:text-[1.8rem] md:text-[2.2rem] ${dk ? 'text-white/30' : 'text-slate-400'}`}>
          par l&apos;IA en 5 minutes
        </p>

        {/* Description */}
        <p className={`text-base sm:text-lg max-w-xl mb-12 leading-relaxed ${dk ? 'text-white/45' : 'text-slate-500'}`}>
          Créez, analysez et planifiez votre marketing automatiquement.
          <br className="hidden sm:block" />
          Stratégie complète · SWOT · Calendrier intelligent · Export PDF.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center mb-12">
          <Link href="/register"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-linear-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white rounded-2xl font-bold text-[15px] shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.03] transition-all duration-300">
            Créer ma stratégie gratuitement
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <a href="#comment-ca-marche"
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-semibold text-[15px] border transition-all duration-300 ${
              dk
                ? 'bg-white/5 hover:bg-white/9 border-white/10 text-white/70 hover:text-white'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
            }`}>
            <svg className="w-4 h-4 shrink-0 text-violet-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
            Voir la démo
          </a>
        </div>

        {/* Trust */}
        <div className={`flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-[13px] font-medium mb-16 ${dk ? 'text-white/25' : 'text-slate-400'}`}>
          {['✓ Gratuit à vie', '✓ Sans carte bancaire', '✓ Données sécurisées', '✓ Support français'].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>

        {/* Stats */}
        <div className={`w-full max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 rounded-2xl border overflow-hidden ${
          dk ? 'bg-white/4 border-white/8' : 'bg-white border-slate-200 shadow-lg shadow-slate-200/60'
        }`}>
          {[
            { v: '10K+', l: 'Stratégies créées' },
            { v: '98%', l: 'Satisfaction' },
            { v: '5min', l: 'Temps moyen' },
            { v: '50+', l: 'Templates IA' },
          ].map((s, i) => (
            <div key={s.l}
              className={`py-5 text-center ${i < 3 ? `border-r ${dk ? 'border-white/8' : 'border-slate-100'}` : ''} ${i >= 2 ? `border-t sm:border-t-0 ${dk ? 'border-white/8' : 'border-slate-100'}` : ''}`}>
              <div className="text-2xl font-black bg-linear-to-br from-violet-500 to-indigo-500 bg-clip-text text-transparent">{s.v}</div>
              <div className={`text-xs font-medium mt-1 ${dk ? 'text-white/35' : 'text-slate-500'}`}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 ${dk ? 'text-white/18' : 'text-slate-300'}`}>
          <span className="text-[10px] tracking-[0.2em] uppercase font-medium">Scroll</span>
          <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════
          FEATURES — BENTO
      ═══════════════════════════════ */}
      <section id="fonctionnalites" className="relative py-28 sm:py-36 px-5 sm:px-8 lg:px-10 z-10">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase mb-5 border ${
              dk ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' : 'bg-violet-50 border-violet-200 text-violet-600'
            }`}>✦ Fonctionnalités</div>
            <h2 className={`text-4xl sm:text-5xl md:text-[3.5rem] font-black leading-[1.08] tracking-tight mb-5 ${dk ? 'text-white' : 'text-slate-950'}`}>
              Tout ce dont vous avez besoin<br />
              <span className="bg-linear-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">pour dominer votre marché</span>
            </h2>
            <p className={`text-lg max-w-xl mx-auto ${dk ? 'text-white/42' : 'text-slate-500'}`}>
              Une suite complète d&apos;outils marketing IA pour transformer votre approche digitale.
            </p>
          </div>

          {/* Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => {
              const a = accentStyles[f.accent.dk];
              const isLarge = f.span === 'lg:col-span-2';
              return (
                <div key={f.id}
                  className={`group relative rounded-2xl sm:rounded-3xl border transition-all duration-300 hover:-translate-y-1.5 overflow-hidden cursor-default ${f.span}
                    ${isLarge ? 'p-8 sm:p-10' : 'p-7'}
                    ${dk
                      ? `bg-white/3 border-white/8 ${a.dkBorder}`
                      : `bg-white border-slate-200 hover:shadow-xl ${a.liBorder}`
                    }`}>

                  {/* Tag */}
                  <span className={`absolute top-5 right-5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1.5 rounded-lg ${
                    dk ? a.dkTag : a.liTag
                  }`}>{f.tag}</span>

                  {/* Icon */}
                  <div className={`flex items-center justify-center rounded-xl mb-6 transition-transform duration-300 group-hover:scale-110 ${
                    isLarge ? 'w-14 h-14 rounded-2xl' : 'w-12 h-12'
                  } ${dk ? a.dkIcon : a.liIcon}`}>
                    {f.icon}
                  </div>

                  {/* Text */}
                  <h3 className={`font-black mb-3 ${isLarge ? 'text-2xl sm:text-3xl' : 'text-[1.1rem]'} ${dk ? 'text-white' : 'text-slate-900'}`}>
                    {f.title}
                  </h3>
                  <p className={`leading-relaxed ${isLarge ? 'text-base sm:text-lg max-w-md' : 'text-sm'} ${dk ? 'text-white/45' : 'text-slate-500'}`}>
                    {f.desc}
                  </p>

                  {/* CTA reveal on hover */}
                  <div className={`mt-6 flex items-center gap-1.5 text-sm font-bold opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 ${
                    dk ? `text-${f.accent.dk}-400` : `text-${f.accent.li}-600`
                  }`}>
                    En savoir plus
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════ */}
      <section id="comment-ca-marche" className="relative py-28 sm:py-36 px-5 sm:px-8 lg:px-10 z-10">
        <div className={`absolute inset-0 pointer-events-none ${dk ? 'bg-linear-to-b from-transparent via-indigo-950/12 to-transparent' : 'bg-linear-to-b from-transparent via-indigo-50/70 to-transparent'}`} />
        <div className="max-w-6xl mx-auto relative">

          <div className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase mb-5 border ${
              dk ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
            }`}>◎ Processus</div>
            <h2 className={`text-4xl sm:text-5xl md:text-[3.5rem] font-black leading-[1.08] tracking-tight mb-5 ${dk ? 'text-white' : 'text-slate-950'}`}>
              De l&apos;idée à la stratégie<br />
              <span className="bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">en 4 étapes simples</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <div key={step.num} className="relative group">
                {i < steps.length - 1 && (
                  <div className={`hidden lg:block absolute top-[3.2rem] left-full w-full h-px ${dk ? 'bg-linear-to-r from-violet-500/20 to-transparent' : 'bg-linear-to-r from-violet-300/40 to-transparent'}`} />
                )}
                <div className={`h-full rounded-2xl sm:rounded-3xl p-7 border text-center transition-all duration-300 hover:-translate-y-1.5 ${
                  dk
                    ? 'bg-white/3 border-white/8 hover:border-indigo-500/30 hover:bg-indigo-500/5'
                    : 'bg-white border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200'
                }`}>
                  <div className="text-5xl font-black bg-linear-to-br from-violet-500 to-indigo-500 bg-clip-text text-transparent mb-5 leading-none">{step.num}</div>
                  <h3 className={`text-[15px] font-bold mb-3 ${dk ? 'text-white' : 'text-slate-900'}`}>{step.title}</h3>
                  <p className={`text-sm leading-relaxed ${dk ? 'text-white/40' : 'text-slate-500'}`}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          AVA CYCLE
      ═══════════════════════════════ */}
      <section className="relative py-28 sm:py-36 px-5 sm:px-8 lg:px-10 z-10">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <h2 className={`text-4xl sm:text-5xl md:text-[3.5rem] font-black leading-[1.08] tracking-tight mb-5 ${dk ? 'text-white' : 'text-slate-950'}`}>
              Le cycle marketing{' '}
              <span className="bg-linear-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">AVA</span>
            </h2>
            <p className={`text-lg max-w-xl mx-auto ${dk ? 'text-white/42' : 'text-slate-500'}`}>
              Structurez vos actions pour maximiser chaque étape du parcours client
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { phase: 'AVANT', label: 'Prospect', dot: 'bg-red-500', dk: 'from-red-500/12 to-rose-500/5 border-red-500/20 hover:border-red-500/40', li: 'bg-red-50/60 border-red-200 hover:border-red-300 shadow-sm hover:shadow-lg', dkBadge: 'bg-red-500/15 text-red-300', liBadge: 'bg-red-100 text-red-700', items: ['Marché cible & Persona', 'Message marketing', 'Canaux de communication'] },
              { phase: 'PENDANT', label: 'Lead', dot: 'bg-amber-500', dk: 'from-amber-500/12 to-yellow-500/5 border-amber-500/20 hover:border-amber-500/40', li: 'bg-amber-50/60 border-amber-200 hover:border-amber-300 shadow-sm hover:shadow-lg', dkBadge: 'bg-amber-500/15 text-amber-300', liBadge: 'bg-amber-100 text-amber-700', items: ['Capture de prospects', 'Nurturing & fidélisation', 'Stratégie de conversion'] },
              { phase: 'APRÈS', label: 'Client', dot: 'bg-emerald-500', dk: 'from-emerald-500/12 to-green-500/5 border-emerald-500/20 hover:border-emerald-500/40', li: 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300 shadow-sm hover:shadow-lg', dkBadge: 'bg-emerald-500/15 text-emerald-300', liBadge: 'bg-emerald-100 text-emerald-700', items: ['Expérience client', 'Valeur client augmentée', 'Recommandation'] },
            ].map((p) => (
              <div key={p.phase}
                className={`rounded-2xl sm:rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-1.5 text-center ${
                  dk ? `bg-linear-to-br ${p.dk}` : `border ${p.li}`
                }`}>
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold mb-8 ${dk ? p.dkBadge : p.liBadge}`}>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${p.dot}`} />
                  {p.phase} — {p.label}
                </div>
                <ul className="space-y-3.5 text-left">
                  {p.items.map((item) => (
                    <li key={item} className={`flex items-center gap-3 text-sm font-medium ${dk ? 'text-white/55' : 'text-slate-700'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.dot}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════ */}
      <section id="temoignages" className="relative py-28 sm:py-36 px-5 sm:px-8 lg:px-10 z-10">
        <div className={`absolute inset-0 pointer-events-none ${dk ? 'bg-linear-to-b from-transparent via-fuchsia-950/8 to-transparent' : 'bg-linear-to-b from-transparent via-fuchsia-50/60 to-transparent'}`} />
        <div className="max-w-6xl mx-auto relative">

          <div className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase mb-5 border ${
              dk ? 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400' : 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-600'
            }`}>❝ Témoignages</div>
            <h2 className={`text-4xl sm:text-5xl md:text-[3.5rem] font-black leading-[1.08] tracking-tight mb-4 ${dk ? 'text-white' : 'text-slate-950'}`}>
              Ils nous font confiance
            </h2>
            <p className={`text-lg ${dk ? 'text-white/42' : 'text-slate-500'}`}>Plus de 10 000 marketeurs utilisent MarketPlan IA chaque jour</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.name}
                className={`rounded-2xl sm:rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center text-center ${
                  dk
                    ? 'bg-white/3 border-white/8 hover:border-fuchsia-500/28 hover:bg-fuchsia-500/4'
                    : 'bg-white border-slate-200 hover:border-fuchsia-200 hover:shadow-xl shadow-sm'
                }`}>

                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-5">
                  {[...Array(t.stars)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className={`text-sm sm:text-[15px] leading-relaxed mb-8 italic flex-1 ${dk ? 'text-white/55' : 'text-slate-600'}`}>
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex flex-col items-center gap-2.5">
                  <div className={`w-11 h-11 rounded-full bg-linear-to-br ${t.gradient} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                    {t.avatar}
                  </div>
                  <div className="text-center">
                    <div className={`font-bold text-sm ${dk ? 'text-white' : 'text-slate-900'}`}>{t.name}</div>
                    <div className={`text-xs mt-0.5 ${dk ? 'text-white/35' : 'text-slate-500'}`}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          PRICING
      ═══════════════════════════════ */}
      <section id="tarifs" className="relative py-28 sm:py-36 px-5 sm:px-8 lg:px-10 z-10">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase mb-5 border ${
              dk ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}>◆ Tarifs</div>
            <h2 className={`text-4xl sm:text-5xl md:text-[3.5rem] font-black leading-[1.08] tracking-tight mb-5 ${dk ? 'text-white' : 'text-slate-950'}`}>
              Simple &{' '}
              <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">transparent</span>
            </h2>
            <p className={`text-lg ${dk ? 'text-white/42' : 'text-slate-500'}`}>
              Choisissez le plan qui correspond à vos besoins.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            {plans.map((plan) => (
              <div key={plan.name}
                className={`relative rounded-2xl sm:rounded-3xl p-7 sm:p-8 border flex flex-col transition-all duration-300 hover:-translate-y-1.5 ${
                  plan.popular
                    ? dk
                      ? 'bg-linear-to-b from-violet-600/20 to-indigo-600/8 border-violet-500/40 shadow-2xl shadow-violet-500/12'
                      : 'bg-white border-violet-300 shadow-2xl shadow-violet-200/70'
                    : dk
                      ? 'bg-white/3 border-white/8 hover:border-white/14'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-lg'
                }`}>

                {plan.popular && (
                  <div className="absolute -top-4 inset-x-0 flex justify-center">
                    <span className="bg-linear-to-r from-violet-600 to-indigo-600 text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-lg shadow-violet-500/25">
                      ⭐ Le plus populaire
                    </span>
                  </div>
                )}

                {/* Plan info — centered */}
                <div className="text-center mt-2 mb-6">
                  <h3 className={`text-xl font-black mb-1 ${dk ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                  <p className={`text-sm mb-5 ${dk ? 'text-white/38' : 'text-slate-400'}`}>{plan.desc}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-5xl font-black ${dk ? 'text-white' : 'text-slate-950'}`}>{plan.price}</span>
                    <span className={`text-sm ${dk ? 'text-white/35' : 'text-slate-400'}`}>{plan.period}</span>
                  </div>
                </div>

                <div className={`h-px w-full mb-6 ${dk ? 'bg-white/7' : 'bg-slate-100'}`} />

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className={`flex items-center gap-3 text-[13.5px] ${dk ? 'text-white/58' : 'text-slate-700'}`}>
                      <div className={`w-5 h-5 rounded-full grid place-items-center shrink-0 ${
                        plan.popular
                          ? dk ? 'bg-violet-500/22' : 'bg-violet-100'
                          : dk ? 'bg-white/8' : 'bg-slate-100'
                      }`}>
                        <svg className={`w-3 h-3 ${plan.popular ? (dk ? 'text-violet-400' : 'text-violet-600') : (dk ? 'text-white/45' : 'text-slate-500')}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link href="/register"
                  className={`block w-full text-center py-3.5 rounded-xl font-bold text-[13.5px] transition-all duration-300 ${
                    plan.popular
                      ? 'bg-linear-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white shadow-lg shadow-violet-500/25 hover:scale-[1.02]'
                      : dk
                        ? 'bg-white/7 hover:bg-white/12 border border-white/10 text-white'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800'
                  }`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className={`mt-10 text-center text-sm ${dk ? 'text-white/25' : 'text-slate-400'}`}>
            ✓ 30 jours d&apos;essai gratuit &nbsp;·&nbsp; ✓ Sans engagement &nbsp;·&nbsp; ✓ Annulation à tout moment &nbsp;·&nbsp; ✓ Support en français
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════
          FAQ
      ═══════════════════════════════ */}
      <section id="faq" className="relative py-28 sm:py-36 px-5 sm:px-8 lg:px-10 z-10">
        <div className="max-w-2xl mx-auto">

          <div className="text-center mb-14">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase mb-5 border ${
              dk ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'
            }`}>? FAQ</div>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black leading-[1.1] tracking-tight mb-4 ${dk ? 'text-white' : 'text-slate-950'}`}>
              Questions fréquentes
            </h2>
            <p className={`text-base ${dk ? 'text-white/42' : 'text-slate-500'}`}>Tout ce que vous devez savoir sur MarketPlan IA</p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, i) => (
              <div key={i}
                className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
                  openFAQ === i
                    ? dk ? 'border-violet-500/30 bg-violet-500/5' : 'border-violet-200 bg-violet-50'
                    : dk ? 'border-white/8 bg-white/2 hover:border-white/14' : 'border-slate-200 bg-white shadow-sm hover:border-slate-300'
                }`}>
                <button
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
                  <span className={`font-semibold text-sm sm:text-[15px] ${dk ? 'text-white' : 'text-slate-900'}`}>{faq.q}</span>
                  <div className={`w-7 h-7 rounded-xl grid place-items-center shrink-0 transition-all duration-300 ${
                    openFAQ === i
                      ? dk ? 'bg-violet-500/20 text-violet-400 rotate-180' : 'bg-violet-100 text-violet-600 rotate-180'
                      : dk ? 'bg-white/8 text-white/35' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFAQ === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className={`px-6 pb-5 border-t ${dk ? 'border-white/[0.07]' : 'border-violet-100'}`}>
                    <p className={`text-sm leading-relaxed pt-4 ${dk ? 'text-white/52' : 'text-slate-600'}`}>{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          FINAL CTA
      ═══════════════════════════════ */}
      <section className="relative py-20 px-5 sm:px-8 lg:px-10 z-10">
        <div className="max-w-4xl mx-auto">
          <div className={`relative rounded-2xl sm:rounded-3xl overflow-hidden text-center px-8 py-16 sm:p-20 border ${
            dk
              ? 'bg-linear-to-br from-violet-700/22 via-indigo-600/18 to-fuchsia-700/12 border-violet-500/20'
              : 'bg-linear-to-br from-violet-600 via-indigo-600 to-fuchsia-600 border-transparent'
          }`}>
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-500/18 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-7 text-3xl ${dk ? 'bg-white/9' : 'bg-white/20'}`}>
                🚀
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-5 leading-[1.1] tracking-tight">
                Prêt à transformer<br />
                <span className={dk ? 'bg-linear-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent' : 'text-white/90'}>
                  votre marketing ?
                </span>
              </h2>
              <p className={`text-base sm:text-lg mb-10 max-w-md mx-auto ${dk ? 'text-white/45' : 'text-white/80'}`}>
                Rejoignez des milliers de marketeurs qui utilisent MarketPlan IA pour créer des stratégies gagnantes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                <Link href="/register"
                  className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-[15px] transition-all duration-300 hover:scale-[1.04] ${
                    dk
                      ? 'bg-linear-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white shadow-2xl shadow-violet-500/30'
                      : 'bg-white text-violet-700 hover:bg-white/92 shadow-2xl shadow-black/15'
                  }`}>
                  Commencer gratuitement
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link href="/login"
                  className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-[15px] transition-all duration-300 border ${
                    dk
                      ? 'bg-white/7 hover:bg-white/12 border-white/14 text-white'
                      : 'bg-white/12 hover:bg-white/22 border-white/30 text-white hover:text-white'
                  }`}>
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          FOOTER
      ═══════════════════════════════ */}
      <footer className={`relative z-10 border-t py-12 px-5 sm:px-8 lg:px-10 ${dk ? 'border-white/[0.07]' : 'border-slate-200'}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 grid place-items-center font-bold text-white text-sm group-hover:scale-105 transition-transform">
              M
            </div>
            <span className={`font-bold text-sm ${dk ? 'text-white/60' : 'text-slate-700'}`}>
              MarketPlan <span className="text-violet-500">IA</span>
            </span>
          </Link>
          <div className={`flex flex-wrap items-center justify-center gap-5 text-[13px] ${dk ? 'text-white/30' : 'text-slate-400'}`}>
            {['Confidentialité', "Conditions d'utilisation", 'Contact', 'Blog'].map((l) => (
              <a key={l} href="#" className="hover:text-violet-500 transition-colors">{l}</a>
            ))}
          </div>
          <p className={`text-xs ${dk ? 'text-white/17' : 'text-slate-400'}`}>
            © 2026 MarketPlan IA. Tous droits réservés.
          </p>
        </div>
      </footer>

    </div>
  );
}

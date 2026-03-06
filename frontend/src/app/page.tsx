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

  const stats = [
    { value: '10K+', label: 'Stratégies générées' },
    { value: '98%', label: 'Satisfaction client' },
    { value: '5min', label: 'Stratégie complète' },
    { value: '50+', label: 'Templates IA' },
  ];

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      ),
      title: 'IA Stratégique',
      desc: 'Générez une stratégie marketing complète en quelques minutes grâce à notre IA avancée.',
      darkIcon: 'bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/20',
      lightIcon: 'bg-violet-50 text-violet-600 ring-1 ring-violet-200',
      darkHover: 'hover:border-violet-500/30 hover:bg-violet-500/[0.04]',
      lightHover: 'hover:border-violet-200 hover:bg-violet-50/40',
      tag: 'IA',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      title: 'Analyse SWOT',
      desc: 'Identifiez vos forces, faiblesses, opportunités et menaces automatiquement.',
      darkIcon: 'bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/20',
      lightIcon: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200',
      darkHover: 'hover:border-indigo-500/30 hover:bg-indigo-500/[0.04]',
      lightHover: 'hover:border-indigo-200 hover:bg-indigo-50/40',
      tag: 'Analyse',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      title: 'Calendrier de Contenu',
      desc: 'Planifiez et organisez vos publications sur tous vos réseaux sociaux.',
      darkIcon: 'bg-fuchsia-500/15 text-fuchsia-400 ring-1 ring-fuchsia-500/20',
      lightIcon: 'bg-fuchsia-50 text-fuchsia-600 ring-1 ring-fuchsia-200',
      darkHover: 'hover:border-fuchsia-500/30 hover:bg-fuchsia-500/[0.04]',
      lightHover: 'hover:border-fuchsia-200 hover:bg-fuchsia-50/40',
      tag: 'Planification',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      title: 'Export PDF Pro',
      desc: 'Exportez votre stratégie complète en PDF professionnel avec votre branding.',
      darkIcon: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20',
      lightIcon: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
      darkHover: 'hover:border-emerald-500/30 hover:bg-emerald-500/[0.04]',
      lightHover: 'hover:border-emerald-200 hover:bg-emerald-50/40',
      tag: 'Export',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      ),
      title: 'Cycle AVA',
      desc: "Structurez vos actions selon le cycle Avant / Pendant / Après pour maximiser l'impact.",
      darkIcon: 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/20',
      lightIcon: 'bg-orange-50 text-orange-600 ring-1 ring-orange-200',
      darkHover: 'hover:border-orange-500/30 hover:bg-orange-500/[0.04]',
      lightHover: 'hover:border-orange-200 hover:bg-orange-50/40',
      tag: 'Méthode',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      title: 'Multi-Rôles',
      desc: 'Gérez votre équipe avec des rôles Admin et Marketeur distincts.',
      darkIcon: 'bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/20',
      lightIcon: 'bg-rose-50 text-rose-600 ring-1 ring-rose-200',
      darkHover: 'hover:border-rose-500/30 hover:bg-rose-500/[0.04]',
      lightHover: 'hover:border-rose-200 hover:bg-rose-50/40',
      tag: 'Équipe',
    },
  ];

  const steps = [
    { num: '01', title: 'Remplissez le formulaire', desc: 'Décrivez votre entreprise, vos objectifs et votre marché cible en quelques clics.' },
    { num: '02', title: "L'IA génère votre stratégie", desc: 'Notre intelligence artificielle analyse vos données et crée une stratégie marketing complète.' },
    { num: '03', title: 'Planifiez votre contenu', desc: "Transformez votre stratégie en calendrier de publications prêt à l'emploi." },
    { num: '04', title: 'Exportez & Partagez', desc: 'Téléchargez votre plan marketing en PDF professionnel et partagez-le avec votre équipe.' },
  ];

  const testimonials = [
    { name: 'Sophie Martin', role: 'Freelance Marketing', avatar: 'SM', text: "MarketPlan IA a révolutionné ma façon de travailler. Je génère des stratégies complètes en 5 minutes !", stars: 5, color: 'from-violet-500 to-purple-600' },
    { name: 'Thomas Dubois', role: 'CEO Startup', avatar: 'TD', text: "L'analyse SWOT automatique m'a permis d'identifier des opportunités que j'aurais manquées.", stars: 5, color: 'from-indigo-500 to-blue-600' },
    { name: 'Amina Benali', role: 'Responsable Marketing PME', avatar: 'AB', text: "Le calendrier de contenu est incroyable. Notre équipe est maintenant parfaitement synchronisée.", stars: 5, color: 'from-fuchsia-500 to-pink-600' },
  ];

  const plans = [
    {
      name: 'Gratuit',
      price: '0€',
      period: '/mois',
      desc: 'Parfait pour débuter',
      features: ['1 stratégie/mois', 'Analyse SWOT basique', '10 publications/mois', 'Export PDF standard', 'Support communautaire'],
      cta: 'Commencer gratuitement',
      popular: false,
    },
    {
      name: 'Pro',
      price: '29€',
      period: '/mois',
      desc: 'Pour les marketeurs avancés',
      features: ['Stratégies illimitées', 'SWOT avancé avec IA', 'Publications illimitées', 'Suggestions IA', 'Templates premium', 'Export PDF Pro', 'Support prioritaire'],
      cta: 'Essai gratuit 30 jours',
      popular: true,
    },
    {
      name: 'Business',
      price: '99€',
      period: '/mois',
      desc: 'Pour équipes & agences',
      features: ['Tout du plan Pro', 'Multi-comptes', 'Collaboration équipe', 'Analytics avancés', 'API personnalisée', 'Marque blanche', 'Support 24/7'],
      cta: "Contacter l'équipe",
      popular: false,
    },
  ];

  const faqs = [
    {
      q: "Comment l'IA génère-t-elle ma stratégie marketing ?",
      a: "Notre IA analyse les informations que vous fournissez (secteur, cible, objectifs) et génère automatiquement un plan structuré selon la méthode Avant/Pendant/Après. Elle propose des personas, messages, canaux et actions concrètes adaptés à votre contexte.",
    },
    {
      q: "Puis-je personnaliser les stratégies générées ?",
      a: "Absolument ! Toutes les stratégies sont entièrement modifiables. Vous pouvez ajuster les personas, modifier les messages, ajouter ou retirer des canaux, et personnaliser chaque élément selon votre vision terrain.",
    },
    {
      q: "Comment fonctionne le calendrier de contenu ?",
      a: "Une fois votre stratégie créée, planifiez vos publications sur différents réseaux sociaux. L'outil suggère du contenu adapté à chaque phase et vous permet d'organiser vos posts dans un calendrier intuitif avec rappels et statuts.",
    },
    {
      q: "Mes données sont-elles sécurisées ?",
      a: "La sécurité est notre priorité. Toutes vos données sont chiffrées et stockées de manière sécurisée. Nous ne partageons jamais vos informations avec des tiers et vous conservez la propriété complète de vos stratégies.",
    },
    {
      q: "Y a-t-il une période d'essai gratuite ?",
      a: "Oui ! Le plan Gratuit est disponible à vie sans carte bancaire. Le plan Pro inclut 30 jours d'essai gratuit pour tester toutes les fonctionnalités avancées sans engagement.",
    },
  ];

  if (!mounted) return null;

  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-500 ${dk ? 'bg-[#05050F] text-white' : 'bg-[#F7F8FC] text-slate-900'}`}>

      {/* ── MESH BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {dk ? (
          <>
            <div className="absolute -top-40 -left-20 w-175 h-175 bg-violet-700/20 rounded-full blur-[120px]" />
            <div className="absolute top-1/2 -right-40 w-150 h-150 bg-indigo-700/15 rounded-full blur-[120px]" />
            <div className="absolute -bottom-40 left-1/3 w-125 h-125 bg-fuchsia-700/10 rounded-full blur-[120px]" />
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{ backgroundImage: 'radial-gradient(circle, #a78bfa 1px, transparent 1px)', backgroundSize: '32px 32px' }}
            />
          </>
        ) : (
          <>
            <div className="absolute -top-40 -left-20 w-175 h-175 bg-violet-200/70 rounded-full blur-[120px]" />
            <div className="absolute top-1/2 -right-40 w-150 h-150 bg-indigo-200/60 rounded-full blur-[120px]" />
            <div className="absolute -bottom-40 left-1/3 w-125 h-125 bg-fuchsia-200/40 rounded-full blur-[120px]" />
            <div
              className="absolute inset-0 opacity-[0.3]"
              style={{ backgroundImage: 'radial-gradient(circle, #c4b5fd 1px, transparent 1px)', backgroundSize: '32px 32px' }}
            />
          </>
        )}
      </div>

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? dk
            ? 'bg-[#05050F]/90 backdrop-blur-2xl border-b border-white/6 shadow-2xl shadow-black/30'
            : 'bg-white/90 backdrop-blur-2xl border-b border-slate-200/80 shadow-lg shadow-slate-200/50'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-base font-black text-white shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform">
                M
              </div>
              <span className={`text-base md:text-lg font-bold tracking-tight ${dk ? 'text-white' : 'text-slate-900'}`}>
                MarketPlan <span className="text-violet-500">IA</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    dk
                      ? 'text-white/55 hover:text-white hover:bg-white/6'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}>
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA + Theme toggle */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleTheme}
                aria-label="Changer le thème"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  dk
                    ? 'bg-white/6 hover:bg-white/10 text-white/60 hover:text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                }`}>
                {dk ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                )}
              </button>
              <Link
                href="/login"
                className={`text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 ${
                  dk
                    ? 'text-white/65 hover:text-white hover:bg-white/6'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}>
                Connexion
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.03]">
                Commencer
              </Link>
            </div>

            {/* Mobile: theme + hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                aria-label="Changer le thème"
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${dk ? 'bg-white/6 text-white/60' : 'bg-slate-100 text-slate-500'}`}>
                {dk ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-xl transition-colors ${dk ? 'hover:bg-white/6' : 'hover:bg-slate-100'}`}
                aria-label="Menu">
                <span className={`block w-5 h-0.5 transition-all duration-300 origin-center ${dk ? 'bg-white/80' : 'bg-slate-600'} ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block w-5 h-0.5 transition-all duration-300 ${dk ? 'bg-white/80' : 'bg-slate-600'} ${mobileMenuOpen ? 'opacity-0 scale-x-0' : ''}`} />
                <span className={`block w-5 h-0.5 transition-all duration-300 origin-center ${dk ? 'bg-white/80' : 'bg-slate-600'} ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-125 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className={`backdrop-blur-2xl border-t px-4 py-6 space-y-1 ${dk ? 'bg-[#08081A]/97 border-white/6' : 'bg-white/97 border-slate-200'}`}>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${dk ? 'text-white/65 hover:text-white hover:bg-white/6' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                {link.label}
              </a>
            ))}
            <div className={`pt-4 border-t mt-2 space-y-2.5 ${dk ? 'border-white/6' : 'border-slate-100'}`}>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                className={`block w-full text-center px-4 py-3 border rounded-xl text-sm font-medium transition-all duration-200 ${dk ? 'border-white/10 text-white/65 hover:text-white' : 'border-slate-200 text-slate-600 hover:text-slate-900'}`}>
                Connexion
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-3 bg-linear-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold text-sm transition-all duration-200">
                Commencer gratuitement
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-16 md:pt-20 z-10">
        <div className="max-w-5xl mx-auto text-center w-full">

          {/* Badge */}
          <div className={`inline-flex items-center gap-2.5 rounded-full px-4 py-2 mb-8 border ${dk ? 'bg-violet-500/10 border-violet-500/25 text-violet-300' : 'bg-violet-50 border-violet-200 text-violet-600'}`}>
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse shrink-0" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide">Propulsé par l&apos;Intelligence Artificielle</span>
          </div>

          {/* Headline */}
          <h1 className={`text-5xl sm:text-6xl md:text-[80px] font-black mb-6 leading-[1.05] tracking-tight ${dk ? 'text-white' : 'text-slate-900'}`}>
            Votre stratégie<br />
            marketing{' '}
            <span className="bg-linear-to-r from-violet-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
              générée
            </span>
            <br />
            <span className={`text-4xl sm:text-5xl md:text-6xl font-bold ${dk ? 'text-white/65' : 'text-slate-500'}`}>
              par l&apos;IA en 5 minutes
            </span>
          </h1>

          <p className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${dk ? 'text-white/50' : 'text-slate-500'}`}>
            Créez des stratégies marketing complètes, analysez votre SWOT, planifiez
            votre contenu et exportez en PDF professionnel — automatisé par l&apos;IA.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <Link href="/register"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.03]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
              Créer ma stratégie gratuitement
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a href="#comment-ca-marche"
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 border ${
                dk
                  ? 'bg-white/4 hover:bg-white/8 border-white/10 hover:border-white/20 text-white/80 hover:text-white'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm'
              }`}>
              <svg className="w-5 h-5 text-violet-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
              Voir la démo
            </a>
          </div>

          {/* Trust line */}
          <div className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm mb-14 ${dk ? 'text-white/35' : 'text-slate-400'}`}>
            {['✓ Gratuit à vie', '✓ Sans carte bancaire', '✓ Données sécurisées'].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 ${
                  dk
                    ? 'bg-white/3 border-white/7 hover:bg-white/6 hover:border-white/10'
                    : 'bg-white border-slate-200 hover:border-violet-200 shadow-sm hover:shadow-md'
                }`}>
                <div className="text-2xl sm:text-3xl font-black bg-linear-to-br from-violet-500 to-indigo-500 bg-clip-text text-transparent mb-1">{stat.value}</div>
                <div className={`text-xs font-medium ${dk ? 'text-white/45' : 'text-slate-500'}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 ${dk ? 'text-white/25' : 'text-slate-400'}`}>
          <span className="text-xs font-medium tracking-widest uppercase">Défiler</span>
          <div className={`w-px h-10 bg-linear-to-b ${dk ? 'from-white/25 to-transparent' : 'from-slate-400 to-transparent'} animate-pulse`} />
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className={`text-xs font-bold tracking-widest uppercase mb-3 ${dk ? 'text-violet-400' : 'text-violet-600'}`}>Aperçu du tableau de bord</p>
            <h2 className={`text-2xl sm:text-3xl font-black ${dk ? 'text-white' : 'text-slate-900'}`}>Tout votre marketing en un seul endroit</h2>
          </div>

          <div className={`rounded-2xl sm:rounded-3xl overflow-hidden border shadow-2xl ${
            dk ? 'border-white/8 shadow-violet-500/10' : 'border-slate-200 shadow-slate-200/60'
          }`}>
            {/* Browser chrome */}
            <div className={`border-b px-4 py-3 flex items-center gap-3 ${dk ? 'bg-[#0f0f22] border-white/6' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className={`flex-1 rounded-lg px-4 py-1.5 text-xs text-center max-w-xs mx-auto font-mono ${dk ? 'bg-white/4 text-white/30' : 'bg-slate-100 text-slate-400'}`}>
                app.marketplan-ia.com/dashboard
              </div>
            </div>

            {/* Mobile dashboard */}
            <div className={`p-4 sm:hidden space-y-3 ${dk ? 'bg-[#0C0C1E]' : 'bg-slate-50'}`}>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Stratégies', value: '12', color: 'from-violet-500 to-purple-600', icon: '📋' },
                  { label: 'Publications', value: '48', color: 'from-indigo-500 to-blue-600', icon: '📅' },
                  { label: 'SWOT', value: '8', color: 'from-fuchsia-500 to-pink-600', icon: '🧩' },
                ].map((card) => (
                  <div key={card.label} className={`rounded-xl p-3 text-center border ${dk ? 'bg-white/4 border-white/7' : 'bg-white border-slate-200'}`}>
                    <div className="text-base mb-1">{card.icon}</div>
                    <div className={`text-xl font-black bg-linear-to-br ${card.color} bg-clip-text text-transparent`}>{card.value}</div>
                    <div className={`text-xs mt-0.5 ${dk ? 'text-white/40' : 'text-slate-500'}`}>{card.label}</div>
                  </div>
                ))}
              </div>
              <div className={`rounded-xl p-4 border ${dk ? 'bg-violet-500/10 border-violet-500/20' : 'bg-violet-50 border-violet-200'}`}>
                <div className={`text-xs font-semibold mb-1.5 ${dk ? 'text-violet-300' : 'text-violet-600'}`}>💡 Suggestion IA</div>
                <div className={`text-xs leading-relaxed ${dk ? 'text-white/60' : 'text-slate-600'}`}>Publiez du contenu éducatif le mardi matin pour maximiser votre engagement LinkedIn.</div>
              </div>
            </div>

            {/* Desktop dashboard */}
            <div className={`p-6 hidden sm:grid grid-cols-12 gap-4 min-h-72 ${dk ? 'bg-[#0C0C1E]' : 'bg-slate-50'}`}>
              {/* Sidebar */}
              <div className="col-span-2 space-y-1">
                {['Dashboard', 'Stratégies', 'SWOT', 'Calendrier', 'Export'].map((item, i) => (
                  <div
                    key={item}
                    className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-colors ${
                      i === 0
                        ? dk
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/25'
                          : 'bg-violet-100 text-violet-700 border border-violet-200'
                        : dk
                          ? 'text-white/35 hover:text-white/60 hover:bg-white/4'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}>
                    {item}
                  </div>
                ))}
              </div>

              {/* Main grid */}
              <div className="col-span-10 grid grid-cols-3 gap-4">
                {[
                  { label: 'Stratégies', value: '12', color: 'from-violet-500 to-purple-600', icon: '📋', w: '65%' },
                  { label: 'Publications', value: '48', color: 'from-indigo-500 to-blue-600', icon: '📅', w: '80%' },
                  { label: 'SWOT créés', value: '8', color: 'from-fuchsia-500 to-pink-600', icon: '🧩', w: '50%' },
                ].map((card) => (
                  <div key={card.label} className={`rounded-2xl p-4 border ${dk ? 'bg-white/4 border-white/7' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-medium ${dk ? 'text-white/40' : 'text-slate-500'}`}>{card.label}</span>
                      <span className="text-lg">{card.icon}</span>
                    </div>
                    <div className={`text-2xl font-black bg-linear-to-br ${card.color} bg-clip-text text-transparent`}>{card.value}</div>
                    <div className={`mt-3 h-1.5 rounded-full overflow-hidden ${dk ? 'bg-white/6' : 'bg-slate-100'}`}>
                      <div className={`h-full bg-linear-to-r ${card.color} rounded-full`} style={{ width: card.w }} />
                    </div>
                  </div>
                ))}

                {/* Chart */}
                <div className={`col-span-2 rounded-2xl p-4 border ${dk ? 'bg-white/4 border-white/7' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className={`text-xs font-medium mb-3 ${dk ? 'text-white/40' : 'text-slate-500'}`}>Performance des publications</div>
                  <div className="flex items-end gap-1 h-16">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-linear-to-t from-violet-600/60 to-indigo-500/40 hover:from-violet-500 hover:to-indigo-400 transition-colors cursor-pointer"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* AI card */}
                <div className={`rounded-2xl p-4 border ${dk ? 'bg-violet-500/10 border-violet-500/20' : 'bg-violet-50 border-violet-200'}`}>
                  <div className={`text-xs font-semibold mb-2 ${dk ? 'text-violet-300' : 'text-violet-600'}`}>💡 Suggestion IA</div>
                  <div className={`text-xs leading-relaxed ${dk ? 'text-white/60' : 'text-slate-600'}`}>Publiez du contenu éducatif le mardi matin pour maximiser votre engagement LinkedIn.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="fonctionnalites" className="relative py-16 sm:py-24 px-4 sm:px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold mb-5 border ${dk ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' : 'bg-violet-50 border-violet-200 text-violet-600'}`}>
              ✦ Fonctionnalités
            </span>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight ${dk ? 'text-white' : 'text-slate-900'}`}>
              Tout ce dont vous avez besoin<br />
              <span className="bg-linear-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">pour dominer votre marché</span>
            </h2>
            <p className={`text-base sm:text-lg max-w-2xl mx-auto ${dk ? 'text-white/50' : 'text-slate-500'}`}>
              Une suite complète d&apos;outils marketing alimentés par l&apos;IA pour transformer votre approche digitale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`group relative rounded-2xl sm:rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-1.5 cursor-pointer ${
                  dk
                    ? `bg-white/2.5 border-white/7 ${feature.darkHover}`
                    : `bg-white border-slate-200 hover:shadow-lg ${feature.lightHover}`
                }`}>
                <span className={`absolute top-5 right-5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-lg ${
                  dk ? 'bg-white/6 text-white/30' : 'bg-slate-100 text-slate-400'
                }`}>{feature.tag}</span>

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${
                  dk ? feature.darkIcon : feature.lightIcon
                }`}>
                  {feature.icon}
                </div>

                <h3 className={`text-base sm:text-lg font-bold mb-2.5 transition-colors ${dk ? 'text-white group-hover:text-violet-300' : 'text-slate-900 group-hover:text-violet-600'}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm leading-relaxed ${dk ? 'text-white/50' : 'text-slate-500'}`}>{feature.desc}</p>

                <div className={`mt-5 flex items-center gap-1.5 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 ${dk ? 'text-violet-400' : 'text-violet-600'}`}>
                  En savoir plus
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="comment-ca-marche" className="relative py-16 sm:py-24 px-4 sm:px-6 z-10">
        <div className={`absolute inset-0 pointer-events-none ${dk ? 'bg-linear-to-b from-transparent via-violet-950/8 to-transparent' : 'bg-linear-to-b from-transparent via-slate-100/50 to-transparent'}`} />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-14">
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold mb-5 border ${dk ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>
              ◎ Comment ça marche
            </span>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight ${dk ? 'text-white' : 'text-slate-900'}`}>
              De l&apos;idée à la stratégie<br />
              <span className="bg-linear-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">en 4 étapes simples</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step, i) => (
              <div key={step.num} className="relative group">
                {i < steps.length - 1 && (
                  <div className={`hidden lg:block absolute top-9 left-[calc(100%+0px)] w-full h-px z-10 bg-linear-to-r ${dk ? 'from-violet-500/30 to-transparent' : 'from-violet-300/60 to-transparent'}`} />
                )}
                <div className={`h-full rounded-2xl sm:rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-1 ${
                  dk
                    ? 'bg-white/2.5 border-white/7 hover:bg-indigo-500/5 hover:border-indigo-500/25'
                    : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-lg shadow-sm'
                }`}>
                  <div className="text-4xl font-black bg-linear-to-br from-violet-500 to-indigo-500 bg-clip-text text-transparent mb-4 leading-none">{step.num}</div>
                  <h3 className={`text-base font-bold mb-2.5 transition-colors ${dk ? 'text-white group-hover:text-indigo-300' : 'text-slate-900 group-hover:text-indigo-600'}`}>{step.title}</h3>
                  <p className={`text-sm leading-relaxed ${dk ? 'text-white/50' : 'text-slate-500'}`}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AVA CYCLE ── */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black mb-4 ${dk ? 'text-white' : 'text-slate-900'}`}>
              Le cycle marketing{' '}
              <span className="bg-linear-to-r from-fuchsia-500 to-violet-500 bg-clip-text text-transparent">AVA</span>
            </h2>
            <p className={`text-base sm:text-lg ${dk ? 'text-white/50' : 'text-slate-500'}`}>Structurez vos actions pour maximiser chaque étape du parcours client</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                phase: 'AVANT', label: 'Prospect', dot: 'bg-red-500',
                darkCard: 'bg-linear-to-br from-red-500/10 to-orange-500/5 border-red-500/20',
                lightCard: 'bg-red-50 border-red-200',
                darkBadge: 'bg-red-500/15 text-red-300 border border-red-500/20',
                lightBadge: 'bg-red-100 text-red-700 border border-red-200',
                items: ['Marché cible & Persona', 'Message marketing', 'Canaux de communication'],
              },
              {
                phase: 'PENDANT', label: 'Lead', dot: 'bg-amber-500',
                darkCard: 'bg-linear-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/20',
                lightCard: 'bg-amber-50 border-amber-200',
                darkBadge: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
                lightBadge: 'bg-amber-100 text-amber-700 border border-amber-200',
                items: ['Capture de prospects', 'Nurturing & fidélisation', 'Stratégie de conversion'],
              },
              {
                phase: 'APRÈS', label: 'Client', dot: 'bg-emerald-500',
                darkCard: 'bg-linear-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20',
                lightCard: 'bg-emerald-50 border-emerald-200',
                darkBadge: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
                lightBadge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
                items: ['Expérience client', 'Valeur client augmentée', 'Stratégie de recommandation'],
              },
            ].map((phase) => (
              <div key={phase.phase} className={`rounded-2xl sm:rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-1 ${dk ? phase.darkCard : phase.lightCard}`}>
                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold mb-5 ${dk ? phase.darkBadge : phase.lightBadge}`}>
                  <span className={`w-2 h-2 rounded-full ${phase.dot} shrink-0`} />
                  {phase.phase} — {phase.label}
                </div>
                <ul className="space-y-3">
                  {phase.items.map((item) => (
                    <li key={item} className={`flex items-center gap-3 text-sm ${dk ? 'text-white/65' : 'text-slate-700'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${phase.dot}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="temoignages" className="relative py-16 sm:py-24 px-4 sm:px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold mb-5 border ${dk ? 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400' : 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-600'}`}>
              ❝ Témoignages
            </span>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black ${dk ? 'text-white' : 'text-slate-900'}`}>Ils nous font confiance</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name}
                className={`rounded-2xl sm:rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-1 ${
                  dk
                    ? 'bg-white/2.5 border-white/7 hover:bg-white/5 hover:border-fuchsia-500/20'
                    : 'bg-white border-slate-200 hover:border-fuchsia-200 hover:shadow-lg shadow-sm'
                }`}>
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className={`text-sm leading-relaxed mb-6 ${dk ? 'text-white/65' : 'text-slate-600'}`}>&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-linear-to-br ${t.color} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className={`font-semibold text-sm ${dk ? 'text-white' : 'text-slate-900'}`}>{t.name}</div>
                    <div className={`text-xs ${dk ? 'text-white/40' : 'text-slate-500'}`}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="tarifs" className="relative py-16 sm:py-24 px-4 sm:px-6 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold mb-5 border ${dk ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
              ◆ Tarifs
            </span>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black mb-4 ${dk ? 'text-white' : 'text-slate-900'}`}>
              Tarification simple<br />
              <span className="bg-linear-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">et transparente</span>
            </h2>
            <p className={`text-base sm:text-lg ${dk ? 'text-white/50' : 'text-slate-500'}`}>
              Choisissez le plan qui correspond à vos besoins. Tous les plans incluent notre IA marketing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl sm:rounded-3xl p-6 sm:p-7 border transition-all duration-300 hover:-translate-y-1.5 flex flex-col ${
                  plan.popular
                    ? dk
                      ? 'bg-linear-to-b from-violet-600/15 to-indigo-600/5 border-violet-500/40 shadow-2xl shadow-violet-500/10'
                      : 'bg-white border-violet-300 shadow-2xl shadow-violet-200/60'
                    : dk
                      ? 'bg-white/2.5 border-white/7 hover:border-white/12'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-linear-to-r from-violet-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-violet-500/30 whitespace-nowrap">
                      ⭐ Le plus populaire
                    </span>
                  </div>
                )}
                <div className="mb-6 mt-1">
                  <h3 className={`text-xl font-bold mb-1 ${dk ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                  <p className={`text-sm mb-5 ${dk ? 'text-white/40' : 'text-slate-500'}`}>{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-black ${dk ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                    <span className={`text-sm ${dk ? 'text-white/40' : 'text-slate-500'}`}>{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-7 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-center gap-3 text-sm ${dk ? 'text-white/65' : 'text-slate-700'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${dk ? 'bg-violet-500/20' : 'bg-violet-100'}`}>
                        <svg className={`w-3 h-3 ${dk ? 'text-violet-400' : 'text-violet-600'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register"
                  className={`block w-full text-center py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.popular
                      ? 'bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 hover:scale-[1.02]'
                      : dk
                        ? 'bg-white/6 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800'
                  }`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className={`mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm ${dk ? 'text-white/35' : 'text-slate-400'}`}>
            {["✓ 30 jours d'essai gratuit", '✓ Sans engagement', '✓ Annulation à tout moment', '✓ Support en français'].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="relative py-16 sm:py-24 px-4 sm:px-6 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold mb-5 border ${dk ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
              ? FAQ
            </span>
            <h2 className={`text-3xl sm:text-4xl font-black mb-3 ${dk ? 'text-white' : 'text-slate-900'}`}>Questions fréquentes</h2>
            <p className={`text-base ${dk ? 'text-white/50' : 'text-slate-500'}`}>Tout ce que vous devez savoir sur MarketPlan IA</p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`rounded-xl sm:rounded-2xl border overflow-hidden transition-all duration-200 ${
                  openFAQ === i
                    ? dk ? 'border-violet-500/30 bg-violet-500/5' : 'border-violet-200 bg-violet-50/80'
                    : dk ? 'border-white/7 bg-white/2 hover:border-white/12' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                }`}>
                <button
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left">
                  <span className={`font-semibold text-sm sm:text-base ${dk ? 'text-white' : 'text-slate-900'}`}>{faq.q}</span>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                    openFAQ === i
                      ? dk ? 'bg-violet-500/20 text-violet-400 rotate-180' : 'bg-violet-100 text-violet-600 rotate-180'
                      : dk ? 'bg-white/6 text-white/40' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div className={`transition-all duration-300 overflow-hidden ${openFAQ === i ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className={`px-5 sm:px-6 pb-5 border-t ${dk ? 'border-white/6' : 'border-violet-100'}`}>
                    <p className={`text-sm leading-relaxed pt-4 ${dk ? 'text-white/60' : 'text-slate-600'}`}>{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 z-10">
        <div className="max-w-4xl mx-auto">
          <div className={`relative rounded-2xl sm:rounded-3xl p-10 sm:p-14 text-center overflow-hidden border ${
            dk
              ? 'bg-linear-to-br from-violet-600/20 via-indigo-600/15 to-fuchsia-600/10 border-violet-500/20'
              : 'bg-linear-to-br from-violet-600 via-indigo-600 to-fuchsia-600 border-transparent'
          }`}>
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 text-2xl ${dk ? 'bg-white/10' : 'bg-white/20'}`}>
                🚀
              </div>
              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black mb-4 ${dk ? 'text-white' : 'text-white'}`}>
                Prêt à transformer<br />
                <span className={dk ? 'bg-linear-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent' : 'text-white/90'}>
                  votre marketing ?
                </span>
              </h2>
              <p className={`text-base sm:text-lg mb-8 max-w-lg mx-auto ${dk ? 'text-white/50' : 'text-white/75'}`}>
                Rejoignez des milliers de marketeurs qui utilisent MarketPlan IA pour créer des stratégies gagnantes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register"
                  className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl sm:rounded-2xl font-bold text-base transition-all duration-300 hover:scale-[1.03] ${
                    dk
                      ? 'bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-2xl shadow-violet-500/30'
                      : 'bg-white text-violet-700 hover:bg-white/90 shadow-xl'
                  }`}>
                  Commencer gratuitement
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link href="/login"
                  className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl sm:rounded-2xl font-semibold text-base transition-all duration-300 border ${
                    dk
                      ? 'bg-white/6 hover:bg-white/10 border-white/10 hover:border-white/20 text-white/80 hover:text-white'
                      : 'bg-white/10 hover:bg-white/20 border-white/25 text-white'
                  }`}>
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={`relative border-t py-10 sm:py-12 px-4 sm:px-6 z-10 ${dk ? 'border-white/6' : 'border-slate-200'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white group-hover:scale-105 transition-transform">
                M
              </div>
              <span className={`font-bold text-sm ${dk ? 'text-white/70' : 'text-slate-700'}`}>
                MarketPlan <span className="text-violet-500">IA</span>
              </span>
            </Link>
            <div className={`flex flex-wrap items-center justify-center gap-6 text-sm ${dk ? 'text-white/35' : 'text-slate-400'}`}>
              {['Confidentialité', "Conditions d'utilisation", 'Contact'].map((l) => (
                <a key={l} href="#" className={`transition-colors duration-200 ${dk ? 'hover:text-white/70' : 'hover:text-slate-700'}`}>{l}</a>
              ))}
            </div>
            <p className={`text-xs ${dk ? 'text-white/20' : 'text-slate-400'}`}>
              © 2026 MarketPlan IA. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

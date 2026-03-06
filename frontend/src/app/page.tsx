'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

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
      icon: '🧠',
      title: 'IA Stratégique',
      desc: 'Générez une stratégie marketing complète en quelques minutes grâce à notre IA avancée.',
      color: 'from-violet-500 to-purple-600',
      glow: 'shadow-violet-500/25',
    },
    {
      icon: '📊',
      title: 'Analyse SWOT',
      desc: 'Identifiez vos forces, faiblesses, opportunités et menaces automatiquement.',
      color: 'from-indigo-500 to-blue-600',
      glow: 'shadow-indigo-500/25',
    },
    {
      icon: '📅',
      title: 'Calendrier de Contenu',
      desc: 'Planifiez et organisez vos publications sur tous vos réseaux sociaux.',
      color: 'from-fuchsia-500 to-pink-600',
      glow: 'shadow-fuchsia-500/25',
    },
    {
      icon: '📄',
      title: 'Export PDF Pro',
      desc: 'Exportez votre stratégie complète en PDF professionnel avec votre branding.',
      color: 'from-emerald-500 to-teal-600',
      glow: 'shadow-emerald-500/25',
    },
    {
      icon: '🎯',
      title: 'Cycle AVA',
      desc: 'Structurez vos actions selon le cycle Avant / Pendant / Après pour maximiser l\'impact.',
      color: 'from-orange-500 to-amber-600',
      glow: 'shadow-orange-500/25',
    },
    {
      icon: '👥',
      title: 'Multi-Rôles',
      desc: 'Gérez votre équipe avec des rôles Admin et Marketeur distincts.',
      color: 'from-rose-500 to-red-600',
      glow: 'shadow-rose-500/25',
    },
  ];

  const steps = [
    { num: '01', title: 'Remplissez le formulaire', desc: 'Décrivez votre entreprise, vos objectifs et votre marché cible en quelques clics.' },
    { num: '02', title: 'L\'IA génère votre stratégie', desc: 'Notre intelligence artificielle analyse vos données et crée une stratégie marketing complète.' },
    { num: '03', title: 'Planifiez votre contenu', desc: 'Transformez votre stratégie en calendrier de publications prêt à l\'emploi.' },
    { num: '04', title: 'Exportez & Partagez', desc: 'Téléchargez votre plan marketing en PDF professionnel et partagez-le avec votre équipe.' },
  ];

  const testimonials = [
    { name: 'Sophie Martin', role: 'Freelance Marketing', avatar: 'SM', text: 'MarketPlan IA a révolutionné ma façon de travailler. Je génère des stratégies complètes en 5 minutes !', stars: 5 },
    { name: 'Thomas Dubois', role: 'CEO Startup', avatar: 'TD', text: 'L\'analyse SWOT automatique m\'a permis d\'identifier des opportunités que j\'aurais manquées.', stars: 5 },
    { name: 'Amina Benali', role: 'Responsable Marketing PME', avatar: 'AB', text: 'Le calendrier de contenu est incroyable. Notre équipe est maintenant parfaitement synchronisée.', stars: 5 },
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

  return (
    <div className="min-h-screen bg-[#080812] text-white overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-fuchsia-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#080812]/95 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-lg font-bold shadow-lg shadow-violet-500/30">
                M
              </div>
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                MarketPlan <span className="text-violet-400">IA</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href}
                  className="text-sm text-white/60 hover:text-violet-300 transition-colors duration-200">
                  {link.label}
                </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login"
              className="text-sm text-white/70 hover:text-white px-4 py-2 rounded-lg transition-colors duration-200">
              Connexion
            </Link>
            <Link href="/register"
              className="text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105">
              Commencer
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-white/5 transition-colors"
            aria-label="Menu"
          >
            <span className={`block w-5 h-0.5 bg-white/80 transition-all duration-300 origin-center ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white/80 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white/80 transition-all duration-300 origin-center ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-[#0d0d22]/98 backdrop-blur-xl border-t border-white/5 px-4 py-6 space-y-1">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 text-sm font-medium">
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-white/5 mt-2 space-y-2.5">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-3 text-white/70 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200 text-sm">
                Connexion
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl font-semibold transition-all duration-200 text-sm">
                Commencer gratuitement
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-16 md:pt-20">
        <div className="max-w-5xl mx-auto text-center relative z-10 w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 mb-6 sm:mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-xs sm:text-sm text-violet-300 font-medium">Propulsé par l'Intelligence Artificielle</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-5 sm:mb-6 leading-tight tracking-tight">
            Votre stratégie marketing
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              générée par l'IA
            </span>
            <br />
            <span className="text-3xl sm:text-4xl md:text-6xl">en 5 minutes</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed px-2">
            Créez des stratégies marketing complètes, analysez votre SWOT, planifiez votre contenu digital
            et exportez le tout en PDF professionnel — automatisé par l'IA.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10 sm:mb-12 px-2">
            <Link href="/register"
              id="hero-cta-primary"
              className="group w-full sm:w-auto relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-6 sm:px-8 py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105">
              <span>🚀</span>
              Créer ma stratégie gratuitement
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a href="#comment-ca-marche"
              id="hero-cta-secondary"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-6 sm:px-8 py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 backdrop-blur-sm">
              <span>▶</span>
              Voir la démo
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-white/40 mb-10 sm:mb-14">
            {['✓ Gratuit à vie', '✓ Sans carte bancaire', '✓ Données sécurisées'].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 backdrop-blur-sm hover:bg-white/8 transition-colors">
                <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-xs sm:text-sm text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs">Défiler</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-violet-500/10">
            {/* Browser bar */}
            <div className="bg-[#0f0f1f] border-b border-white/5 px-4 py-3 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 bg-white/5 rounded-lg px-4 py-1.5 text-xs text-white/30 text-center max-w-xs mx-auto truncate">
                app.marketplan-ia.com/dashboard
              </div>
            </div>
            {/* Dashboard content — mobile simplified */}
            <div className="bg-[#0d0d1e] p-4 sm:p-6 sm:hidden space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Stratégies', value: '12', color: 'from-violet-500 to-purple-600', icon: '📋' },
                  { label: 'Publications', value: '48', color: 'from-indigo-500 to-blue-600', icon: '📅' },
                  { label: 'SWOT', value: '8', color: 'from-fuchsia-500 to-pink-600', icon: '🧩' },
                ].map((card) => (
                  <div key={card.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                    <div className="text-base mb-1">{card.icon}</div>
                    <div className={`text-xl font-black bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>{card.value}</div>
                    <div className="text-xs text-white/40 mt-0.5">{card.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 rounded-xl p-4">
                <div className="text-xs text-violet-300 mb-1.5">💡 Suggestion IA</div>
                <div className="text-xs text-white/60 leading-relaxed">Publiez du contenu éducatif le mardi matin pour maximiser votre engagement LinkedIn.</div>
              </div>
            </div>
            {/* Dashboard content — tablet/desktop full */}
            <div className="bg-[#0d0d1e] p-6 hidden sm:grid grid-cols-12 gap-4 min-h-80">
              {/* Sidebar */}
              <div className="col-span-2 space-y-2">
                {['Dashboard', 'Stratégies', 'SWOT', 'Calendrier', 'Export'].map((item, i) => (
                  <div key={item} className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-colors ${i === 0 ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30' : 'text-white/40 hover:text-white/60'}`}>
                    {item}
                  </div>
                ))}
              </div>
              {/* Main content */}
              <div className="col-span-10 grid grid-cols-3 gap-4">
                {[
                  { label: 'Stratégies', value: '12', color: 'from-violet-500 to-purple-600', icon: '📋' },
                  { label: 'Publications', value: '48', color: 'from-indigo-500 to-blue-600', icon: '📅' },
                  { label: 'SWOT créés', value: '8', color: 'from-fuchsia-500 to-pink-600', icon: '🧩' },
                ].map((card) => (
                  <div key={card.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-white/40">{card.label}</span>
                      <span className="text-lg">{card.icon}</span>
                    </div>
                    <div className={`text-2xl font-black bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>{card.value}</div>
                    <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${card.color} rounded-full`} style={{ width: '65%' }} />
                    </div>
                  </div>
                ))}
                {/* Chart */}
                <div className="col-span-2 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="text-xs text-white/40 mb-3">Performance des publications</div>
                  <div className="flex items-end gap-1 h-20">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-violet-600/60 to-indigo-500/60" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                {/* AI suggestion */}
                <div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 rounded-2xl p-4">
                  <div className="text-xs text-violet-300 mb-2">💡 Suggestion IA</div>
                  <div className="text-xs text-white/60 leading-relaxed">Publiez du contenu éducatif le mardi matin pour maximiser votre engagement LinkedIn.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="fonctionnalites" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 mb-5 sm:mb-6">
              <span className="text-xs sm:text-sm text-violet-300 font-medium">✨ Fonctionnalités</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Tout ce dont vous avez besoin
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">pour dominer votre marché</span>
            </h2>
            <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto px-2">
              Une suite complète d'outils marketing alimentés par l'IA pour transformer votre approche digitale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, i) => (
              <div key={feature.title}
                className="group relative bg-white/3 hover:bg-white/6 border border-white/8 hover:border-white/15 rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onMouseEnter={() => setActiveFeature(i % 3)}>
                <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-xl sm:text-2xl mb-4 sm:mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white group-hover:text-violet-300 transition-colors">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{feature.desc}</p>
                <div className="mt-3 sm:mt-4 flex items-center gap-2 text-violet-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  En savoir plus
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="comment-ca-marche" className="py-16 sm:py-24 px-4 sm:px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-5 sm:mb-6">
              <span className="text-xs sm:text-sm text-indigo-300 font-medium">🔄 Comment ça marche</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              De l'idée à la stratégie
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">en 4 étapes simples</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-violet-500/40 to-transparent z-10" />
                )}
                <div className="bg-white/3 border border-white/8 rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:bg-white/6 hover:border-violet-500/20 transition-all duration-300 group">
                  <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-3 sm:mb-4">{step.num}</div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 group-hover:text-violet-300 transition-colors">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AVA MARKETING CYCLE ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Le cycle marketing
              <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent"> AVA</span>
            </h2>
            <p className="text-white/50 text-base sm:text-lg px-2">Structurez vos actions pour maximiser chaque étape du parcours client</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                phase: 'AVANT', emoji: '🔴', label: 'Prospect',
                color: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/20', badge: 'bg-red-500/20 text-red-300',
                items: ['Marché cible & Persona', 'Message marketing', 'Canaux de communication'],
              },
              {
                phase: 'PENDANT', emoji: '🟡', label: 'Lead',
                color: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/20', badge: 'bg-yellow-500/20 text-yellow-300',
                items: ['Capture de prospects', 'Nurturing & fidélisation', 'Stratégie de conversion'],
              },
              {
                phase: 'APRÈS', emoji: '🟢', label: 'Client',
                color: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-500/20', badge: 'bg-emerald-500/20 text-emerald-300',
                items: ['Expérience client', 'Valeur client augmentée', 'Stratégie de recommandation'],
              },
            ].map((phase) => (
              <div key={phase.phase} className={`bg-gradient-to-br ${phase.color} border ${phase.border} rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:-translate-y-1 transition-all duration-300`}> 
                <div className={`inline-flex items-center gap-2 ${phase.badge} rounded-full px-3 py-1.5 text-sm font-bold mb-4`}>
                  {phase.emoji} {phase.phase} — {phase.label}
                </div>
                <ul className="space-y-3">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-white/70 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
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
      <section id="temoignages" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full px-4 py-2 mb-5 sm:mb-6">
              <span className="text-xs sm:text-sm text-fuchsia-300 font-medium">💬 Témoignages</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
              Ils nous font confiance
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white/3 border border-white/8 rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:bg-white/6 hover:border-violet-500/20 transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-white/40 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="tarifs" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-5 sm:mb-6">
              <span className="text-xs sm:text-sm text-emerald-300 font-medium">💎 Tarifs</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Tarification simple
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">et transparente</span>
            </h2>
            <p className="text-white/50 text-base sm:text-lg px-2">Choisissez le plan qui correspond à vos besoins. Tous les plans incluent notre IA marketing.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.name}
                className={`relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 border ${
                  plan.popular
                    ? 'bg-gradient-to-b from-violet-600/15 to-indigo-600/5 border-violet-500/40'
                    : 'bg-white/3 border-white/8 hover:border-white/15'
                }`}>
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-violet-500/30 whitespace-nowrap">
                      ⭐ Le plus populaire
                    </span>
                  </div>
                )}
                <div className="mb-6 mt-2">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-white/40 text-sm mb-4">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{plan.price}</span>
                    <span className="text-white/40 text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-white/70 text-sm">
                      <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register"
                  className={`block w-full text-center py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 text-sm ${
                    plan.popular
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                  }`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-white/40">
            {["✓ 30 jours d'essai gratuit", '✓ Sans engagement', '✓ Annulation à tout moment', '✓ Support en français'].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-5 sm:mb-6">
              <span className="text-xs sm:text-sm text-amber-300 font-medium">❓ FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">Questions fréquentes</h2>
            <p className="text-white/50 text-base sm:text-lg px-2">Tout ce que vous devez savoir sur MarketPlan IA</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white/3 border border-white/8 rounded-xl sm:rounded-2xl overflow-hidden hover:border-white/15 transition-colors">
                <button
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left hover:bg-white/3 transition-colors">
                  <span className="font-semibold text-sm sm:text-base">{faq.q}</span>
                  <svg
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${openFAQ === i ? 'rotate-180 text-violet-400' : 'text-white/40'}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`transition-all duration-300 overflow-hidden ${openFAQ === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-5 sm:px-6 pb-4 sm:pb-5 border-t border-white/5">
                    <p className="text-white/60 text-sm leading-relaxed pt-3 sm:pt-4">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-violet-600/20 via-indigo-600/20 to-fuchsia-600/20 border border-violet-500/20 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="text-4xl sm:text-5xl mb-5 sm:mb-6">🚀</div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
                Prêt à transformer
                <br />
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">votre marketing ?</span>
              </h2>
              <p className="text-white/50 text-base sm:text-lg mb-8 max-w-xl mx-auto px-2">
                Rejoignez des milliers de marketeurs qui utilisent MarketPlan IA pour créer des stratégies gagnantes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register"
                  id="cta-register-final"
                  className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-7 sm:px-8 py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105">
                  Commencer gratuitement
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="/login"
                  id="cta-login-final"
                  className="inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-7 sm:px-8 py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300">
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold">M</div>
              <span className="font-bold text-white/80">MarketPlan <span className="text-violet-400">IA</span></span>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-white/40">
              <a href="#" className="hover:text-white/70 transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-white/70 transition-colors">Conditions d'utilisation</a>
              <a href="#" className="hover:text-white/70 transition-colors">Contact</a>
            </div>
            <div className="text-sm text-white/30 text-center sm:text-right">
              © 2026 MarketPlan IA. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
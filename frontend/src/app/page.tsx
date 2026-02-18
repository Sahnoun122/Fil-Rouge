'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

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

  return (
    <div className="min-h-screen bg-[#080812] text-white overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-fuchsia-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#080812]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-lg font-bold shadow-lg shadow-violet-500/30">
              M
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              MarketPlan <span className="text-violet-400">IA</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Fonctionnalités', 'Comment ça marche', 'Témoignages', 'Tarifs'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '-').replace(/é/g, 'e').replace(/ç/g, 'c')}`}
                className="text-sm text-white/60 hover:text-white transition-colors duration-200 hover:text-violet-300">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login"
              className="text-sm text-white/70 hover:text-white px-4 py-2 rounded-lg transition-colors duration-200">
              Connexion
            </Link>
            <Link href="/register"
              className="text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
            <span className="text-sm text-violet-300 font-medium">Propulsé par l'Intelligence Artificielle</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
            Votre stratégie marketing
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              générée par l'IA
            </span>
            <br />
            en 5 minutes
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
            Créez des stratégies marketing complètes, analysez votre SWOT, planifiez votre contenu digital
            et exportez le tout en PDF professionnel — le tout automatisé par l'IA.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/register"
              id="hero-cta-primary"
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105">
              <span>🚀</span>
              Créer ma stratégie gratuitement
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a href="#comment-ca-marche"
              id="hero-cta-secondary"
              className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm">
              <span>▶</span>
              Voir la démo
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/8 transition-colors">
                <div className="text-3xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs">Défiler</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-violet-500/10">
            {/* Fake browser bar */}
            <div className="bg-[#0f0f1f] border-b border-white/5 px-4 py-3 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 bg-white/5 rounded-lg px-4 py-1.5 text-xs text-white/30 text-center max-w-sm mx-auto">
                app.marketplan-ia.com/dashboard
              </div>
            </div>
            {/* Dashboard mockup */}
            <div className="bg-[#0d0d1e] p-6 grid grid-cols-12 gap-4 min-h-80">
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
                {/* Metric cards */}
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
                {/* Chart area */}
                <div className="col-span-2 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="text-xs text-white/40 mb-3">Performance des publications</div>
                  <div className="flex items-end gap-2 h-20">
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

      {/* Features Grid */}
      <section id="fonctionnalites" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 mb-6">
              <span className="text-sm text-violet-300 font-medium">✨ Fonctionnalités</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Tout ce dont vous avez besoin
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">pour dominer votre marché</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Une suite complète d'outils marketing alimentés par l'IA pour transformer votre approche digitale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={feature.title}
                className={`group relative bg-white/3 hover:bg-white/6 border border-white/8 hover:border-white/15 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:${feature.glow} cursor-pointer`}
                onMouseEnter={() => setActiveFeature(i % 3)}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-violet-300 transition-colors">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{feature.desc}</p>
                <div className="mt-4 flex items-center gap-2 text-violet-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
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

      {/* How it works */}
      <section id="comment-ca-marche" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-6">
              <span className="text-sm text-indigo-300 font-medium">🔄 Comment ça marche</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              De l'idée à la stratégie
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">en 4 étapes simples</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-violet-500/40 to-transparent z-10" />
                )}
                <div className="bg-white/3 border border-white/8 rounded-3xl p-6 hover:bg-white/6 hover:border-violet-500/20 transition-all duration-300 group">
                  <div className="text-4xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-4">{step.num}</div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-violet-300 transition-colors">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketing Cycle Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Le cycle marketing
              <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent"> AVA</span>
            </h2>
            <p className="text-white/50 text-lg">Structurez vos actions pour maximiser chaque étape du parcours client</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div key={phase.phase} className={`bg-gradient-to-br ${phase.color} border ${phase.border} rounded-3xl p-6 hover:-translate-y-1 transition-all duration-300`}>
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

      {/* Testimonials */}
      <section id="temoignages" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full px-4 py-2 mb-6">
              <span className="text-sm text-fuchsia-300 font-medium">💬 Témoignages</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black">
              Ils nous font confiance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white/3 border border-white/8 rounded-3xl p-6 hover:bg-white/6 hover:border-violet-500/20 transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold">
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

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-violet-600/20 via-indigo-600/20 to-fuchsia-600/20 border border-violet-500/20 rounded-3xl p-12 text-center overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="text-5xl mb-6">🚀</div>
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Prêt à transformer
                <br />
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">votre marketing ?</span>
              </h2>
              <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
                Rejoignez des milliers de marketeurs qui utilisent MarketPlan IA pour créer des stratégies gagnantes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register"
                  id="cta-register-final"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105">
                  Commencer gratuitement
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="/login"
                  id="cta-login-final"
                  className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300">
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-bold">M</div>
              <span className="font-bold text-white/80">MarketPlan <span className="text-violet-400">IA</span></span>
            </div>
            <div className="flex items-center gap-8 text-sm text-white/40">
              <a href="#" className="hover:text-white/70 transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-white/70 transition-colors">Conditions d'utilisation</a>
              <a href="#" className="hover:text-white/70 transition-colors">Contact</a>
            </div>
            <div className="text-sm text-white/30">
              © 2025 MarketPlan IA. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
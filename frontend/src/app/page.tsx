'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Sparkles,
  BarChart3,
  Calendar,
  Lightbulb,
  TrendingUp,
  FileDown,
  LayoutDashboard,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Play,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  Zap,
  Target,
  Clock,
  Users,
  Briefcase,
  Store,
  PenTool,
  Rocket,
} from 'lucide-react';

// â”€â”€â”€ DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Who It\'s For', href: '#who-its-for' },
  { label: 'Benefits', href: '#benefits' },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Marketing Strategy Generator',
    desc: 'Generate a complete marketing strategy based on simple inputs about your business, audience, and goals.',
    color: 'violet',
    large: true,
  },
  {
    icon: BarChart3,
    title: 'SWOT Analysis',
    desc: 'Automatically generate strengths, weaknesses, opportunities, and threats.',
    color: 'indigo',
    large: false,
  },
  {
    icon: Calendar,
    title: 'Content Planning Calendar',
    desc: 'Organize all your social media content in a clear, interactive calendar.',
    color: 'fuchsia',
    large: false,
  },
  {
    icon: Lightbulb,
    title: 'Smart Content Suggestions',
    desc: 'AI suggests post ideas, captions, and hashtags tailored to your brand.',
    color: 'amber',
    large: false,
  },
  {
    icon: TrendingUp,
    title: 'Marketing Funnel Structure',
    desc: 'Organize your strategy into Prospect, Lead, and Client phases automatically.',
    color: 'emerald',
    large: false,
  },
  {
    icon: FileDown,
    title: 'PDF Export',
    desc: 'Export your full strategy and planning into a professional, branded PDF.',
    color: 'rose',
    large: false,
  },
  {
    icon: LayoutDashboard,
    title: 'Marketing Dashboard',
    desc: 'Track your strategies, publications, and AI recommendations in one place.',
    color: 'sky',
    large: false,
  },
  {
    icon: ShieldCheck,
    title: 'Admin Dashboard',
    desc: 'Manage users and monitor platform activity with full administrative control.',
    color: 'teal',
    large: false,
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Enter Your Business Info',
    desc: 'Provide basic information about your business, target audience, and marketing goals.',
  },
  {
    num: '02',
    title: 'AI Generates Your Strategy',
    desc: 'Our AI analyzes your inputs and creates a complete, personalized marketing strategy.',
  },
  {
    num: '03',
    title: 'Plan Your Content',
    desc: 'Schedule your posts and organize your social media content inside the marketing calendar.',
  },
  {
    num: '04',
    title: 'Export as PDF',
    desc: 'Download your full strategy and content plan as a professional PDF to share with your team.',
  },
];

const AUDIENCE = [
  { icon: Target, title: 'Digital Marketers', desc: 'Build data-driven strategies faster.' },
  { icon: Briefcase, title: 'Freelance Marketers', desc: 'Deliver polished strategies to clients.' },
  { icon: Rocket, title: 'Startups', desc: 'Launch with a clear marketing direction.' },
  { icon: Store, title: 'Small Businesses', desc: 'Compete smarter with AI-powered planning.' },
  { icon: PenTool, title: 'Content Creators', desc: 'Plan and organize all your content in one place.' },
  { icon: Users, title: 'Entrepreneurs', desc: 'Turn business ideas into actionable strategies.' },
];

const BENEFITS = [
  { icon: Clock, text: 'Save hours of strategic thinking' },
  { icon: Target, text: 'Build a clear marketing strategy' },
  { icon: Calendar, text: 'Plan your content efficiently' },
  { icon: Zap, text: 'Increase your marketing consistency' },
  { icon: LayoutDashboard, text: 'Centralize all marketing planning in one place' },
];

const PROBLEMS = [
  'No structured marketing plan',
  'Difficulty organizing content',
  'Lack of clear audience targeting',
  'Low conversion rates',
  'Wasted time and effort',
];

// â”€â”€â”€ COLOR MAP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const COLOR: Record<string, { dkIcon: string; liIcon: string; dkBorder: string; liBorder: string; dkTag: string; liTag: string; dkText: string; liText: string }> = {
  violet: { dkIcon: 'bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/25', liIcon: 'bg-violet-100 text-violet-600', dkBorder: 'hover:border-violet-500/40 hover:bg-violet-500/5', liBorder: 'hover:border-violet-300 hover:shadow-violet-100/60', dkTag: 'bg-violet-500/15 text-violet-300', liTag: 'bg-violet-100 text-violet-700', dkText: 'text-violet-400', liText: 'text-violet-600' },
  indigo: { dkIcon: 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/25', liIcon: 'bg-indigo-100 text-indigo-600', dkBorder: 'hover:border-indigo-500/40 hover:bg-indigo-500/5', liBorder: 'hover:border-indigo-300 hover:shadow-indigo-100/60', dkTag: 'bg-indigo-500/15 text-indigo-300', liTag: 'bg-indigo-100 text-indigo-700', dkText: 'text-indigo-400', liText: 'text-indigo-600' },
  fuchsia: { dkIcon: 'bg-fuchsia-500/20 text-fuchsia-400 ring-1 ring-fuchsia-500/25', liIcon: 'bg-fuchsia-100 text-fuchsia-600', dkBorder: 'hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5', liBorder: 'hover:border-fuchsia-300 hover:shadow-fuchsia-100/60', dkTag: 'bg-fuchsia-500/15 text-fuchsia-300', liTag: 'bg-fuchsia-100 text-fuchsia-700', dkText: 'text-fuchsia-400', liText: 'text-fuchsia-600' },
  amber: { dkIcon: 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/25', liIcon: 'bg-amber-100 text-amber-600', dkBorder: 'hover:border-amber-500/40 hover:bg-amber-500/5', liBorder: 'hover:border-amber-300 hover:shadow-amber-100/60', dkTag: 'bg-amber-500/15 text-amber-300', liTag: 'bg-amber-100 text-amber-700', dkText: 'text-amber-400', liText: 'text-amber-600' },
  emerald: { dkIcon: 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/25', liIcon: 'bg-emerald-100 text-emerald-600', dkBorder: 'hover:border-emerald-500/40 hover:bg-emerald-500/5', liBorder: 'hover:border-emerald-300 hover:shadow-emerald-100/60', dkTag: 'bg-emerald-500/15 text-emerald-300', liTag: 'bg-emerald-100 text-emerald-700', dkText: 'text-emerald-400', liText: 'text-emerald-600' },
  rose: { dkIcon: 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/25', liIcon: 'bg-rose-100 text-rose-600', dkBorder: 'hover:border-rose-500/40 hover:bg-rose-500/5', liBorder: 'hover:border-rose-300 hover:shadow-rose-100/60', dkTag: 'bg-rose-500/15 text-rose-300', liTag: 'bg-rose-100 text-rose-700', dkText: 'text-rose-400', liText: 'text-rose-600' },
  sky: { dkIcon: 'bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/25', liIcon: 'bg-sky-100 text-sky-600', dkBorder: 'hover:border-sky-500/40 hover:bg-sky-500/5', liBorder: 'hover:border-sky-300 hover:shadow-sky-100/60', dkTag: 'bg-sky-500/15 text-sky-300', liTag: 'bg-sky-100 text-sky-700', dkText: 'text-sky-400', liText: 'text-sky-600' },
  teal: { dkIcon: 'bg-teal-500/20 text-teal-400 ring-1 ring-teal-500/25', liIcon: 'bg-teal-100 text-teal-600', dkBorder: 'hover:border-teal-500/40 hover:bg-teal-500/5', liBorder: 'hover:border-teal-300 hover:shadow-teal-100/60', dkTag: 'bg-teal-500/15 text-teal-300', liTag: 'bg-teal-100 text-teal-700', dkText: 'text-teal-400', liText: 'text-teal-600' },
};

// â”€â”€â”€ MAIN COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type Theme = 'dark' | 'light';


export default function HomePage() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  if (!mounted) return null;

  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-500 ${dk ? 'bg-[#08080F] text-white' : 'bg-slate-50 text-slate-900'}`}>

      {/* -- AMBIENT BACKGROUND -- */}
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

      {/* ---------------------------------------
          NAVBAR
      --------------------------------------- */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? dk
            ? 'bg-[#08080F]/80 backdrop-blur-2xl border-b border-white/[0.07]'
            : 'bg-white/80 backdrop-blur-2xl border-b border-black/6 shadow-sm'
          : ''
      }`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform">
                M
              </div>
              <span className={`font-bold text-[15px] ${dk ? 'text-white' : 'text-slate-900'}`}>
                MarketPlan <span className="text-violet-500">IA</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map((l) => (
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
              <button onClick={toggleTheme} aria-label="Toggle theme"
                className={`w-9 h-9 rounded-xl grid place-items-center transition-all duration-200 ${
                  dk ? 'bg-white/7 hover:bg-white/12 text-white/45 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                }`}>
                {dk ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <Link href="/login"
                className={`text-[13.5px] font-medium px-4 py-2 rounded-xl transition-all duration-200 ${
                  dk ? 'text-white/50 hover:text-white hover:bg-white/7' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}>
                Login
              </Link>
              <Link href="/register"
                className="text-[13.5px] font-bold px-5 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.03] transition-all duration-300">
                Sign Up
              </Link>
            </div>

            {/* Mobile controls */}
            <div className="flex md:hidden items-center gap-2">
              <button onClick={toggleTheme} aria-label="Toggle theme"
                className={`w-9 h-9 rounded-xl grid place-items-center ${dk ? 'bg-white/7 text-white/45' : 'bg-slate-100 text-slate-500'}`}>
                {dk ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu"
                className={`w-9 h-9 grid place-items-center rounded-xl ${dk ? 'hover:bg-white/7' : 'hover:bg-slate-100'}`}>
                {mobileMenuOpen
                  ? <X className={`w-5 h-5 ${dk ? 'text-white/70' : 'text-slate-700'}`} />
                  : <Menu className={`w-5 h-5 ${dk ? 'text-white/70' : 'text-slate-700'}`} />
                }
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
          <div className={`px-5 py-4 space-y-1 border-t ${dk ? 'bg-[#08080F]/95 border-white/[0.07]' : 'bg-white/95 border-slate-100'}`}>
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium ${dk ? 'text-white/55 hover:text-white hover:bg-white/7' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                {l.label}
              </a>
            ))}
            <div className={`pt-3 border-t space-y-2 ${dk ? 'border-white/[0.07]' : 'border-slate-100'}`}>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                className={`block w-full text-center py-3 rounded-xl text-sm font-medium border ${dk ? 'border-white/10 text-white/55' : 'border-slate-200 text-slate-600'}`}>
                Login
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-3 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm">
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ---------------------------------------
          1. HERO SECTION
      --------------------------------------- */}
      <section className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center px-5 sm:px-8 lg:px-16 pt-28 pb-20 z-10 max-w-7xl mx-auto gap-12 lg:gap-16">

        {/* Left — Copy */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">

          {/* Badge */}
          <div className={`inline-flex items-center gap-2.5 rounded-full px-4 py-2 mb-8 border text-[13px] font-semibold tracking-wide ${
            dk ? 'bg-violet-500/10 border-violet-500/20 text-violet-300' : 'bg-violet-50 border-violet-200 text-violet-600'
          }`}>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inset-0 rounded-full bg-violet-400 opacity-75" />
              <span className="relative rounded-full h-2 w-2 bg-violet-500" />
            </span>
            Powered by Artificial Intelligence
          </div>

          {/* Headline */}
          <h1 className={`font-black tracking-tight leading-[1.05] mb-6 max-w-2xl
            text-[2.4rem] sm:text-[3.2rem] lg:text-[3.8rem]
            ${dk ? 'text-white' : 'text-slate-950'}`}>
            Build a Complete{' '}
            <span className="bg-linear-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              Marketing Strategy
            </span>{' '}
            in Minutes with AI
          </h1>

          {/* Subtitle */}
          <p className={`text-base sm:text-lg max-w-xl mb-10 leading-relaxed ${dk ? 'text-white/50' : 'text-slate-500'}`}>
            MarketPlan IA helps marketers, freelancers, startups and businesses generate a complete marketing strategy, SWOT analysis, and content calendar automatically using artificial intelligence.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3.5 items-center mb-5">
            <Link href="/register"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-linear-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white rounded-2xl font-bold text-[15px] shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.03] transition-all duration-300">
              Start Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a href="#features"
              className={`inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-semibold text-[15px] border transition-all duration-300 ${
                dk
                  ? 'bg-white/5 hover:bg-white/9 border-white/10 text-white/70 hover:text-white'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
              }`}>
              <Play className="w-4 h-4 text-violet-500 fill-violet-500" />
              See Features
            </a>
          </div>

          {/* Trust */}
          <p className={`text-[13px] font-medium ${dk ? 'text-white/25' : 'text-slate-400'}`}>
            ? No credit card required
          </p>
        </div>

        {/* Right — Mock Dashboard */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none">
          <div className={`relative rounded-2xl sm:rounded-3xl border overflow-hidden shadow-2xl ${
            dk ? 'bg-white/3 border-white/10 shadow-violet-500/10' : 'bg-white border-slate-200 shadow-slate-300/40'
          }`}>
            {/* Dashboard header bar */}
            <div className={`flex items-center gap-1.5 px-4 py-3 border-b ${dk ? 'bg-white/4 border-white/8' : 'bg-slate-50 border-slate-100'}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className={`ml-3 text-[12px] font-medium ${dk ? 'text-white/25' : 'text-slate-400'}`}>MarketPlan IA — Dashboard</span>
            </div>
            {/* Mock UI content */}
            <div className="p-6 space-y-4">
              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Strategies', val: '12', color: 'violet' },
                  { label: 'Posts Planned', val: '48', color: 'indigo' },
                  { label: 'Exports', val: '7', color: 'fuchsia' },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl p-3 text-center ${dk ? 'bg-white/4' : 'bg-slate-50 border border-slate-100'}`}>
                    <div className={`text-xl font-black bg-linear-to-br ${
                      s.color === 'violet' ? 'from-violet-400 to-indigo-400' :
                      s.color === 'indigo' ? 'from-indigo-400 to-blue-400' : 'from-fuchsia-400 to-pink-400'
                    } bg-clip-text text-transparent`}>{s.val}</div>
                    <div className={`text-[11px] mt-0.5 ${dk ? 'text-white/35' : 'text-slate-500'}`}>{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Strategy card */}
              <div className={`rounded-xl p-4 border ${dk ? 'bg-violet-500/8 border-violet-500/20' : 'bg-violet-50 border-violet-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <span className={`text-[13px] font-bold ${dk ? 'text-white' : 'text-slate-800'}`}>AI Strategy Generated</span>
                </div>
                <div className="space-y-1.5">
                  {['Target Audience Defined', 'SWOT Analysis Complete', 'Content Calendar Ready'].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className={`text-[12px] ${dk ? 'text-white/55' : 'text-slate-600'}`}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Calendar mock */}
              <div className={`rounded-xl p-4 border ${dk ? 'bg-white/3 border-white/8' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span className={`text-[13px] font-bold ${dk ? 'text-white' : 'text-slate-800'}`}>Content Calendar</span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {['M','T','W','T','F','S','S'].map((d, i) => (
                    <div key={i} className={`text-center text-[10px] font-bold ${dk ? 'text-white/25' : 'text-slate-400'}`}>{d}</div>
                  ))}
                  {Array.from({ length: 14 }, (_, i) => (
                    <div key={i} className={`h-6 rounded text-[10px] flex items-center justify-center font-medium ${
                      [2, 5, 9, 12].includes(i)
                        ? 'bg-violet-500 text-white'
                        : [1, 7].includes(i)
                          ? 'bg-indigo-500/30 text-indigo-400'
                          : dk ? 'bg-white/4 text-white/20' : 'bg-slate-100 text-slate-400'
                    }`}>{i + 1}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------
          2. PROBLEM SECTION
      --------------------------------------- */}
      <section className="relative py-24 sm:py-32 px-5 sm:px-8 lg:px-10 z-10">
        <div className={`absolute inset-0 pointer-events-none ${dk ? 'bg-linear-to-b from-transparent via-red-950/8 to-transparent' : 'bg-linear-to-b from-transparent via-red-50/60 to-transparent'}`} />
        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — Problems visual */}
            <div className="space-y-3">
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase mb-2 border ${
                dk ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
              }`}>? The Problem</div>
              {PROBLEMS.map((p) => (
                <div key={p} className={`flex items-center gap-3 rounded-xl px-5 py-4 border transition-all duration-200 ${
                  dk ? 'bg-red-500/5 border-red-500/15 text-white/60' : 'bg-red-50/60 border-red-100 text-slate-600'
                }`}>
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="text-sm font-medium">{p}</span>
                </div>
              ))}
            </div>

            {/* Right — Copy */}
            <div>
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.08] tracking-tight mb-6 ${dk ? 'text-white' : 'text-slate-950'}`}>
                Marketing Without{' '}
                <span className="bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  Strategy
                </span>{' '}
                Is Just Guessing
              </h2>
              <p className={`text-base sm:text-lg leading-relaxed ${dk ? 'text-white/48' : 'text-slate-500'}`}>
                Many businesses and creators publish content on social media without a clear marketing strategy. This leads to inconsistent communication, weak customer acquisition, and poor conversion results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------
          3. SOLUTION SECTION
      --------------------------------------- */}
      <section className="relative py-24 sm:py-32 px-5 sm:px-8 lg:px-10 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase mb-6 border ${
            dk ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' : 'bg-violet-50 border-violet-200 text-violet-600'
          }`}>? The Solution</div>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.08] tracking-tight mb-6 ${dk ? 'text-white' : 'text-slate-950'}`}>
            Your{' '}
            <span className="bg-linear-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              AI Marketing Assistant
            </span>
          </h2>
          <p className={`text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10 ${dk ? 'text-white/50' : 'text-slate-500'}`}>
            MarketPlan IA helps you transform ideas into a clear and structured marketing strategy. In just a few minutes, our AI generates a complete marketing plan, SWOT analysis, and content planning calendar.
          </p>
          {/* Key metrics */}
          <div className={`inline-grid grid-cols-2 sm:grid-cols-4 rounded-2xl border overflow-hidden ${
            dk ? 'bg-white/4 border-white/8' : 'bg-white border-slate-200 shadow-lg shadow-slate-200/60'
          }`}>
            {[
              { v: '5 min', l: 'Average time' },
              { v: '10K+', l: 'Strategies built' },
              { v: '98%', l: 'Satisfaction' },
              { v: '50+', l: 'AI templates' },
            ].map((s, i) => (
              <div key={s.l}
                className={`py-5 px-6 text-center ${i < 3 ? `border-r ${dk ? 'border-white/8' : 'border-slate-100'}` : ''}`}>
                <div className="text-2xl font-black bg-linear-to-br from-violet-500 to-indigo-500 bg-clip-text text-transparent">{s.v}</div>
                <div className={`text-xs font-medium mt-1 ${dk ? 'text-white/35' : 'text-slate-500'}`}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------
          4. FEATURES SECTION
      --------------------------------------- */}
      <section id="features" className="relative py-24 sm:py-32 px-5 sm:px-8 lg:px-10 z-10">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase mb-5 border ${
              dk ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' : 'bg-violet-50 border-violet-200 text-violet-600'
            }`}>? Features</div>
            <h2 className={`text-3xl sm:text-4xl lg:text-[3.2rem] font-black leading-[1.08] tracking-tight mb-4 ${dk ? 'text-white' : 'text-slate-950'}`}>
              Powerful Features
            </h2>
            <p className={`text-base sm:text-lg max-w-xl mx-auto ${dk ? 'text-white/42' : 'text-slate-500'}`}>
              Everything you need to build, plan, and execute your marketing strategy — all in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => {
              const c = COLOR[f.color];
              const Icon = f.icon;
              return (
                <div key={f.title}
                  className={`group relative rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 cursor-default p-7 ${
                    f.large ? 'sm:col-span-2 lg:col-span-2' : ''
                  } ${
                    dk
                      ? `bg-white/3 border-white/8 ${c.dkBorder}`
                      : `bg-white border-slate-200 hover:shadow-xl ${c.liBorder}`
                  }`}>
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${dk ? c.dkIcon : c.liIcon}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className={`font-bold text-base mb-2.5 ${dk ? 'text-white' : 'text-slate-900'}`}>{f.title}</h3>
                  <p className={`text-sm leading-relaxed ${dk ? 'text-white/45' : 'text-slate-500'}`}>{f.desc}</p>
                  {/* Hover CTA */}
                  <div className={`mt-5 flex items-center gap-1.5 text-sm font-semibold opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 ${dk ? c.dkText : c.liText}`}>
                    Learn more <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------
          5. HOW IT WORKS
      --------------------------------------- */}
      <section id="how-it-works" className="relative py-24 sm:py-32 px-5 sm:px-8 lg:px-10 z-10">
        <div className={`absolute inset-0 pointer-events-none ${dk ? 'bg-linear-to-b from-transparent via-indigo-950/12 to-transparent' : 'bg-linear-to-b from-transparent via-indigo-50/70 to-transparent'}`} />
        <div className="max-w-6xl mx-auto relative">

          <div className="text-center mb-14">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase mb-5 border ${
              dk ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
            }`}>? Process</div>
            <h2 className={`text-3xl sm:text-4xl lg:text-[3.2rem] font-black leading-[1.08] tracking-tight mb-4 ${dk ? 'text-white' : 'text-slate-950'}`}>
              How{' '}
              <span className="bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                MarketPlan IA
              </span>{' '}
              Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative group">
                {i < STEPS.length - 1 && (
                  <div className={`hidden lg:block absolute top-12 left-full w-full h-px ${dk ? 'bg-linear-to-r from-violet-500/20 to-transparent' : 'bg-linear-to-r from-violet-300/40 to-transparent'}`} />
                )}
                <div className={`h-full rounded-2xl p-7 border text-center transition-all duration-300 hover:-translate-y-1.5 ${
                  dk
                    ? 'bg-white/3 border-white/8 hover:border-indigo-500/30 hover:bg-indigo-500/5'
                    : 'bg-white border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200'
                }`}>
                  <div className="text-4xl font-black bg-linear-to-br from-violet-500 to-indigo-500 bg-clip-text text-transparent mb-4 leading-none">{step.num}</div>
                  <h3 className={`text-[14px] font-bold mb-2.5 ${dk ? 'text-white' : 'text-slate-900'}`}>{step.title}</h3>
                  <p className={`text-sm leading-relaxed ${dk ? 'text-white/40' : 'text-slate-500'}`}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------
          6. WHO IS IT FOR
      --------------------------------------- */}
      <section id="who-its-for" className="relative py-24 sm:py-32 px-5 sm:px-8 lg:px-10 z-10">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase mb-5 border ${
              dk ? 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400' : 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-600'
            }`}>? Audience</div>
            <h2 className={`text-3xl sm:text-4xl lg:text-[3.2rem] font-black leading-[1.08] tracking-tight mb-4 ${dk ? 'text-white' : 'text-slate-950'}`}>
              Who Is{' '}
              <span className="bg-linear-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                MarketPlan IA
              </span>{' '}
              For?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AUDIENCE.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.title}
                  className={`group rounded-2xl p-7 border transition-all duration-300 hover:-translate-y-1.5 ${
                    dk
                      ? 'bg-white/3 border-white/8 hover:border-fuchsia-500/30 hover:bg-fuchsia-500/4'
                      : 'bg-white border-slate-200 shadow-sm hover:shadow-xl hover:border-fuchsia-200'
                  }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${dk ? 'bg-fuchsia-500/15 text-fuchsia-400' : 'bg-fuchsia-100 text-fuchsia-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className={`font-bold text-base mb-2 ${dk ? 'text-white' : 'text-slate-900'}`}>{a.title}</h3>
                  <p className={`text-sm leading-relaxed ${dk ? 'text-white/42' : 'text-slate-500'}`}>{a.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------
          7. BENEFITS
      --------------------------------------- */}
      <section id="benefits" className="relative py-24 sm:py-32 px-5 sm:px-8 lg:px-10 z-10">
        <div className={`absolute inset-0 pointer-events-none ${dk ? 'bg-linear-to-b from-transparent via-emerald-950/8 to-transparent' : 'bg-linear-to-b from-transparent via-emerald-50/60 to-transparent'}`} />
        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — Copy */}
            <div>
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase mb-6 border ${
                dk ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
              }`}>? Why Choose Us</div>
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.08] tracking-tight mb-6 ${dk ? 'text-white' : 'text-slate-950'}`}>
                Why Choose{' '}
                <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  MarketPlan IA?
                </span>
              </h2>
              <p className={`text-base sm:text-lg leading-relaxed ${dk ? 'text-white/48' : 'text-slate-500'}`}>
                Stop wasting time on manual marketing planning. Let AI do the heavy lifting while you focus on what matters — growing your business.
              </p>
            </div>

            {/* Right — Benefits list */}
            <div className="space-y-3">
              {BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.text}
                    className={`flex items-center gap-4 rounded-xl px-5 py-4 border transition-all duration-200 hover:scale-[1.01] ${
                      dk ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-emerald-50/60 border-emerald-100 shadow-sm'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${dk ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className={`text-sm font-medium ${dk ? 'text-white/70' : 'text-slate-700'}`}>{b.text}</span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------
          8. FINAL CTA
      --------------------------------------- */}
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
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-7 ${dk ? 'bg-white/9' : 'bg-white/20'}`}>
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-5 leading-[1.1] tracking-tight">
                Start Building Your<br />
                <span className={dk ? 'bg-linear-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent' : 'text-white/90'}>
                  Marketing Strategy Today
                </span>
              </h2>
              <p className={`text-base sm:text-lg mb-10 max-w-md mx-auto ${dk ? 'text-white/45' : 'text-white/80'}`}>
                Join marketers and businesses using AI to build smarter marketing strategies.
              </p>
              <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                <Link href="/register"
                  className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-[15px] transition-all duration-300 hover:scale-[1.04] ${
                    dk
                      ? 'bg-linear-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white shadow-2xl shadow-violet-500/30'
                      : 'bg-white text-violet-700 hover:bg-white/92 shadow-2xl shadow-black/15'
                  }`}>
                  Create My Strategy
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/login"
                  className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-[15px] transition-all duration-300 border ${
                    dk
                      ? 'bg-white/7 hover:bg-white/12 border-white/14 text-white'
                      : 'bg-white/12 hover:bg-white/22 border-white/30 text-white'
                  }`}>
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------
          9. FOOTER
      --------------------------------------- */}
      <footer className={`relative z-10 border-t py-12 px-5 sm:px-8 lg:px-10 ${dk ? 'border-white/[0.07]' : 'border-slate-200'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

            {/* Brand */}
            <div>
              <Link href="/" className="flex items-center gap-2.5 group mb-4">
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 grid place-items-center font-bold text-white text-sm group-hover:scale-105 transition-transform shadow-lg shadow-violet-500/25">
                  M
                </div>
                <span className={`font-bold text-[15px] ${dk ? 'text-white' : 'text-slate-900'}`}>
                  MarketPlan <span className="text-violet-500">IA</span>
                </span>
              </Link>
              <p className={`text-sm leading-relaxed max-w-xs ${dk ? 'text-white/38' : 'text-slate-500'}`}>
                AI-powered marketing strategy and content planning platform.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${dk ? 'text-white/25' : 'text-slate-400'}`}>Navigation</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Features', href: '#features' },
                  { label: 'How It Works', href: '#how-it-works' },
                  { label: 'Benefits', href: '#benefits' },
                ].map((l) => (
                  <a key={l.label} href={l.href}
                    className={`text-sm transition-colors hover:text-violet-500 ${dk ? 'text-white/38' : 'text-slate-500'}`}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Account */}
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${dk ? 'text-white/25' : 'text-slate-400'}`}>Account</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Login', href: '/login' },
                  { label: 'Sign Up', href: '/register' },
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Pricing', href: '#pricing' },
                ].map((l) => (
                  <Link key={l.label} href={l.href}
                    className={`text-sm transition-colors hover:text-violet-500 ${dk ? 'text-white/38' : 'text-slate-500'}`}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className={`pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${dk ? 'border-white/[0.07]' : 'border-slate-100'}`}>
            <p className={`text-xs ${dk ? 'text-white/18' : 'text-slate-400'}`}>
              © 2026 MarketPlan IA. All rights reserved.
            </p>
            <div className={`flex items-center gap-5 text-[12px] ${dk ? 'text-white/28' : 'text-slate-400'}`}>
              {['Privacy Policy', 'Terms of Service', 'Contact'].map((l) => (
                <a key={l} href="#" className="hover:text-violet-500 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

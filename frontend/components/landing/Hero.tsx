import Link from 'next/link';
import { ArrowRight, CheckCircle2, BarChart3, CalendarDays, Sparkles, Target, TrendingUp, Users } from 'lucide-react';

const BARS = [
  { label: 'Positionnement de Marque', pct: 90, color: 'from-violet-500 to-purple-500' },
  { label: 'Analyse SWOT', pct: 75, color: 'from-emerald-400 to-teal-500' },
  { label: 'Calendrier de Contenu', pct: 85, color: 'from-amber-400 to-orange-500' },
  { label: 'Stratégie Multicanal', pct: 60, color: 'from-pink-400 to-rose-500' },
];

const STATS = [
  { icon: Target, label: 'Stratégies', value: '3', color: 'bg-violet-50 text-violet-600' },
  { icon: CalendarDays, label: 'Posts Planifiés', value: '24', color: 'bg-sky-50 text-sky-600' },
  { icon: BarChart3, label: 'Aperçus', value: '12', color: 'bg-emerald-50 text-emerald-600' },
];

const SOCIAL_PROOF = [
  { src: 'https://i.pravatar.cc/32?img=1', alt: 'Utilisateur 1' },
  { src: 'https://i.pravatar.cc/32?img=2', alt: 'Utilisateur 2' },
  { src: 'https://i.pravatar.cc/32?img=3', alt: 'Utilisateur 3' },
  { src: 'https://i.pravatar.cc/32?img=4', alt: 'Utilisateur 4' },
];

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-white pt-28 sm:pt-32 pb-20 lg:pb-28">
      {/* Dot-grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #ddd6fe 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.55,
        }}
      />
      {/* Radial fade over dots */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/0 via-white/60 to-white" />
      {/* Glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/3 w-96 h-96 rounded-full bg-violet-200/50 blur-3xl" />
        <div className="absolute top-20 right-0 w-80 h-80 rounded-full bg-purple-100/60 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left ── */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 border border-violet-200/80 px-4 py-1.5 text-xs font-semibold text-violet-700 mb-7 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Plateforme Marketing propulsée par l'IA
            </div>

            <h1 className="text-[2.6rem] sm:text-5xl xl:text-[3.5rem] font-black text-slate-900 leading-[1.06] tracking-tight max-w-xl mx-auto lg:mx-0">
              Pilotez votre{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent pb-1">
                  Stratégie Marketing
                </span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-violet-100/70 -skew-x-2 -z-0 rounded" />
              </span>
              {' '}en quelques minutes
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-500 leading-relaxed max-w-md mx-auto lg:mx-0">
              Générez automatiquement une stratégie marketing complète, une analyse SWOT et un calendrier de contenu. 
              Conçu pour les spécialistes du marketing, les startups et les entreprises.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-300/50 hover:shadow-violet-400/60 hover:-translate-y-0.5 transition-all"
              >
                Démarrer Gratuitement
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 rounded-xl bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all"
              >
                Comment ça marche
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-8 flex items-center gap-3 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {SOCIAL_PROOF.map((u) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={u.alt} src={u.src} alt={u.alt} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                ))}
              </div>
              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-800">10 000+</span> stratégies générées
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                ★★★★★ <span className="text-slate-400 font-normal">4.9/5</span>
              </div>
            </div>
          </div>

          {/* ── Right — Browser/App mockup ── */}
          <div className="relative mt-8 lg:mt-0">
            {/* Glow behind card */}
            <div className="absolute inset-0 -m-6 rounded-3xl bg-gradient-to-br from-violet-200/40 to-purple-200/30 blur-2xl" />

            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-violet-100/60 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <div className="ml-3 flex-1 bg-white border border-slate-200 rounded-md px-3 py-1 text-[11px] text-slate-400 font-mono">
                  app.marketplan.ia/dashboard
                </div>
              </div>

              {/* Violet header bar */}
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold text-violet-200 uppercase tracking-widest">Stratégie Marketing</p>
                    <p className="text-white font-bold text-sm mt-0.5">Q2 2026 — Acme Corp</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-400/20 border border-emerald-300/40 text-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    IA Active
                  </span>
                </div>
              </div>

              {/* Progress bars */}
              <div className="px-5 pt-5 pb-4 space-y-3.5 bg-white">
                {BARS.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="font-bold text-slate-800">{item.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 px-5 pb-5">
                {STATS.map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className={`rounded-xl p-3.5 text-center ${color.split(' ')[0]}`}>
                    <Icon className={`w-4 h-4 mx-auto mb-1.5 ${color.split(' ')[1]}`} />
                    <p className="text-lg font-black text-slate-900">{value}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating chips */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-slate-100 px-3.5 py-2.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-none">Stratégie Prête !</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Générée en 2 min 14s</p>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-slate-100 px-3.5 py-2.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-none">+38% Portée</p>
                <p className="text-[10px] text-slate-400 mt-0.5">vs trimestre précédent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
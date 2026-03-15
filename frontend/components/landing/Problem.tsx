import { AlertTriangle, XCircle } from 'lucide-react';

const PROBLEMS = [
  'Aucun plan marketing structuré',
  'Difficulté à organiser le contenu',
  'Manque de ciblage d\'audience clair',
  'Faibles taux de conversion',
  'Perte de temps et d\'efforts',
];

export default function Problem() {
  return (
    <section className="py-24 lg:py-32 bg-slate-950 relative overflow-hidden">
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Red glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full bg-red-700/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-4 py-1.5 text-xs font-bold text-red-400 mb-6 uppercase tracking-widest">
            <AlertTriangle className="w-3.5 h-3.5" />
            Le Problème
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
            Le Marketing Sans Stratégie{' '}
            <br className="hidden sm:block" />
            <span className="text-red-400">N'est Qu'une Devignette</span>
          </h2>
          <p className="mt-5 text-slate-400 text-base leading-relaxed">
            La plupart des entreprises publient du contenu sans plan, perdant temps et argent sur des stratégies
            qui ne fonctionnent pas.
          </p>
        </div>

        {/* Problem cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {PROBLEMS.map((problem) => (
            <div
              key={problem}
              className="group flex items-center gap-4 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-5 py-4 hover:bg-red-950/30 hover:border-red-500/20 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-colors">
                <XCircle className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-slate-300 text-sm font-medium">{problem}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

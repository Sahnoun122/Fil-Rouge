import { AlertTriangle, XCircle } from 'lucide-react';

const PROBLEMS = [
  'No structured marketing plan',
  'Difficulty organizing content',
  'Lack of clear audience targeting',
  'Low conversion rates',
  'Wasted time and effort',
];

export default function Problem() {
  return (
    <section className="py-20 lg:py-28 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Section header — centered */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-900/40 border border-red-500/30 px-4 py-2 text-xs font-semibold text-red-300 mb-6">
            <AlertTriangle className="w-3.5 h-3.5" />
            The Problem
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Marketing Without Strategy
            {' '}<span className="text-red-400">Is Just Guessing</span>
          </h2>
          <p className="mt-5 text-slate-400 text-lg leading-relaxed">
            Many businesses and creators publish content on social media without a clear marketing
            strategy. This leads to inconsistent communication, weak customer acquisition, and poor
            conversion results.
          </p>
        </div>

        {/* Problems list — two columns */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {PROBLEMS.map((problem) => (
            <div
              key={problem}
              className="flex items-center gap-3 bg-red-950/50 border border-red-500/20 rounded-2xl px-5 py-5 hover:border-red-500/40 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-red-900/60 flex items-center justify-center shrink-0">
                <XCircle className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-slate-200 text-sm font-medium leading-snug">{problem}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

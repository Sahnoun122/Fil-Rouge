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
    <section className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-red-900/40 border border-red-500/30 px-3.5 py-1.5 text-xs font-semibold text-red-300 mb-6">
              <AlertTriangle className="w-3.5 h-3.5" />
              The Problem
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Marketing Without Strategy
              <br />
              <span className="text-red-400">Is Just Guessing</span>
            </h2>
            <p className="mt-5 text-slate-300 text-lg leading-relaxed">
              Many businesses and creators publish content on social media without a clear marketing
              strategy. This leads to inconsistent communication, weak customer acquisition, and poor
              conversion results.
            </p>
          </div>

          <div className="space-y-3">
            {PROBLEMS.map((problem) => (
              <div
                key={problem}
                className="flex items-center gap-3 bg-red-950/40 border border-red-500/20 rounded-xl px-5 py-4"
              >
                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span className="text-slate-200 text-sm font-medium">{problem}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

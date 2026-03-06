import { CheckCircle2 } from 'lucide-react';

const BENEFITS = [
  {
    title: 'Save Hours of Strategic Thinking',
    description: 'Get a complete, professional marketing strategy in minutes instead of days.',
  },
  {
    title: 'Build a Clear Marketing Strategy',
    description: 'AI structures your goals, positioning, channels, messaging, and action plan.',
  },
  {
    title: 'Plan Your Content Efficiently',
    description: 'Fill your content calendar with smart, AI-generated post ideas and schedules.',
  },
  {
    title: 'Increase Your Marketing Consistency',
    description: 'Stay consistent across all platforms with a centralized, well-organized plan.',
  },
  {
    title: 'Centralize All Marketing Planning in One Place',
    description: 'Strategy, SWOT analysis, content calendar, and PDF export — all in one platform.',
  },
];

const STATS = [
  { number: '5 min', label: 'To get a full strategy' },
  { number: '8x', label: 'Faster than manual planning' },
  { number: '10k+', label: 'Strategies generated' },
  { number: '98%', label: 'User satisfaction rate' },
];

export default function Benefits() {
  return (
    <section className="py-20 lg:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Section heading — centered */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-4">Why Us</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Choose MarketPlan IA?
          </h2>
          <p className="mt-5 text-lg text-slate-500 leading-relaxed">
            Stop guessing and start growing with a platform built specifically for modern marketers
            and businesses who want real results.
          </p>
        </div>

        {/* Stats — 4 cards centered */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {STATS.map(({ number, label }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm hover:border-violet-200 hover:shadow-md transition-all">
              <p className="text-3xl font-black text-violet-600">{number}</p>
              <p className="text-sm text-slate-500 mt-2 leading-snug">{label}</p>
            </div>
          ))}
        </div>

        {/* Benefits — 2 column grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-white border border-slate-200 rounded-2xl p-6 flex gap-4 hover:border-violet-200 hover:shadow-sm transition-all"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 leading-snug">{benefit.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

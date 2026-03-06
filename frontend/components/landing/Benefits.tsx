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
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-violet-600 mb-3">Why Us</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Why Choose MarketPlan IA?
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Stop guessing and start growing with a platform built specifically for modern marketers
              and businesses who want real results.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">
              {STATS.map(({ number, label }) => (
                <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <p className="text-3xl font-black text-violet-600">{number}</p>
                  <p className="text-sm text-slate-600 mt-1.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex gap-4 hover:border-violet-300 hover:shadow-sm transition-all"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{benefit.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

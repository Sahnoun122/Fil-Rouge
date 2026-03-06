import Link from 'next/link';
import { ArrowRight, CheckCircle2, BarChart3, CalendarDays, Sparkles, Target } from 'lucide-react';

const DASHBOARD_BARS = [
  { label: 'Brand Positioning', pct: 90, color: 'from-violet-500 to-violet-500' },
  { label: 'SWOT Analysis', pct: 75, color: 'from-emerald-500 to-teal-500' },
  { label: 'Content Calendar', pct: 85, color: 'from-amber-500 to-orange-500' },
  { label: 'Channel Strategy', pct: 60, color: 'from-pink-500 to-rose-500' },
];

const STATS = [
  { icon: Target, label: 'Strategies', value: '3' },
  { icon: CalendarDays, label: 'Posts Planned', value: '24' },
  { icon: BarChart3, label: 'Insights', value: '12' },
];

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-slate-50 via-violet-50/40 to-white pt-32 sm:pt-36 pb-24 lg:pb-28">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -right-40 w-150 h-150 rounded-full bg-violet-100/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-40 w-125 h-125 rounded-full bg-purple-100/40 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Copy */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 border border-violet-200 px-4 py-2 text-xs font-semibold text-violet-700 mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Marketing Platform
            </div>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-slate-900 leading-[1.08] tracking-tight w-full max-w-xl mx-auto lg:mx-0">
              Build a Complete{' '}
              <span className="bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Marketing Strategy
              </span>
              {' '}in Minutes with AI
            </h1>
            <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
              MarketPlan IA helps marketers, freelancers, startups and businesses generate a complete
              marketing strategy, SWOT analysis, and content calendar automatically using artificial
              intelligence.
            </p>
            <div className="mt-10 flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-white rounded-xl bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-0.5"
              >
                Start Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-slate-700 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all"
              >
                See Features
              </Link>
            </div>
            <p className="mt-5 text-xs text-slate-500 flex items-center justify-center lg:justify-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              No credit card required &mdash; free to get started
            </p>
          </div>

          {/* Right — Mock Dashboard */}
          <div className="relative pb-8">
            <div className="bg-white rounded-3xl shadow-2xl shadow-violet-100 border border-slate-200/80 overflow-hidden">
              {/* Dashboard header */}
              <div className="bg-linear-to-r from-violet-600 to-purple-600 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-violet-200 uppercase tracking-wider">MarketPlan IA</p>
                    <p className="text-white font-bold text-sm mt-0.5">Marketing Strategy Q2 2026</p>
                  </div>
                  <span className="bg-emerald-400 text-emerald-900 text-xs font-bold px-2.5 py-1 rounded-full">
                    AI Active
                  </span>
                </div>
              </div>
              {/* Dashboard content */}
              <div className="p-6 space-y-4">
                {DASHBOARD_BARS.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                      <span>{item.label}</span>
                      <span>{item.pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-linear-to-r ${item.color}`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 pt-3">
                  {STATS.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-4 text-center">
                      <Icon className="w-4 h-4 text-violet-500 mx-auto mb-1.5" />
                      <p className="text-xl font-extrabold text-slate-900">{value}</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-5 -left-2 bg-white rounded-2xl shadow-xl border border-slate-200 px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Strategy Generated!</p>
                <p className="text-[10px] text-slate-400 mt-0.5">in under 3 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
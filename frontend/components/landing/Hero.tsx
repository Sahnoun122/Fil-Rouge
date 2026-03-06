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
    <section className="relative overflow-hidden bg-linear-to-br from-slate-50 via-violet-50/30 to-violet-50/20 pt-28 pb-20">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-32 w-150 h-150 rounded-full bg-violet-100/50 blur-3xl" />
        <div className="absolute -bottom-20 -left-32 w-125 h-125 rounded-full bg-violet-100/40 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">
          {/* Left — Copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 border border-violet-200 px-3.5 py-1.5 text-xs font-semibold text-violet-700 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Marketing Platform
            </div>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Build a Complete{' '}
              <span className="bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Marketing Strategy
              </span>
              {' '}in Minutes with AI
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-lg">
              MarketPlan IA helps marketers, freelancers, startups and businesses generate a complete
              marketing strategy, SWOT analysis, and content calendar automatically using artificial
              intelligence.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white rounded-xl bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-violet-700 transition-all shadow-lg shadow-violet-200 hover:shadow-violet-300"
              >
                Start Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-700 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all"
              >
                See Features
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              No credit card required
            </p>
          </div>

          {/* Right — Mock Dashboard */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200 border border-slate-200/60 overflow-hidden">
              {/* Dashboard header */}
              <div className="bg-linear-to-r from-violet-600 to-purple-600 px-5 py-4">
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
              <div className="p-5 space-y-4">
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
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {STATS.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                      <Icon className="w-4 h-4 text-violet-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-slate-900">{value}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-slate-200 px-4 py-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Strategy Generated!</p>
                <p className="text-[10px] text-slate-500">in under 3 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
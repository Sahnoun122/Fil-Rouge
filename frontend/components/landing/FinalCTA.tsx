import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-24 lg:py-32 bg-slate-950 relative overflow-hidden">
      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.07) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 text-xs font-bold text-violet-300 mb-8 uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          Get Started Today — It&#39;s Free
        </div>

        <h2 className="text-4xl sm:text-5xl xl:text-6xl font-black text-white leading-tight tracking-tight">
          Start Building Your
          <br />
          <span className="bg-linear-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            Marketing Strategy
          </span>
        </h2>

        <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-xl mx-auto">
          Join 10,000+ marketers and businesses using AI to build smarter, faster marketing strategies.
        </p>

        {/* CTA group */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-extrabold text-violet-700 bg-white rounded-xl hover:bg-violet-50 transition-all shadow-xl shadow-violet-900/30 hover:shadow-violet-900/50 hover:-translate-y-0.5"
          >
            Create My Strategy
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-slate-300 rounded-xl border border-white/10 hover:bg-white/5 hover:border-violet-500/30 transition-all"
          >
            See Features
          </Link>
        </div>

        <p className="mt-7 text-slate-500 text-sm">
          No credit card required · Free to start · Cancel anytime
        </p>
      </div>
    </section>
  );
}

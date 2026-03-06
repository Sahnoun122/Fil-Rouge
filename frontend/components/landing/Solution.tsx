import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Solution() {
  return (
    <section className="py-20 lg:py-28 bg-linear-to-br from-violet-600 via-violet-600 to-purple-700 relative overflow-hidden">
      {/* subtle bg texture */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-purple-900/30 blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 border border-white/30 px-4 py-2 text-xs font-semibold text-white/90 mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            The Solution
          </div>
          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-white leading-tight">
            Your AI Marketing Assistant
          </h2>
          <p className="mt-6 text-lg text-violet-100 leading-relaxed">
            MarketPlan IA helps you transform ideas into a clear and structured marketing strategy.
            In just a few minutes, our AI generates a complete marketing plan, SWOT analysis, and
            content planning calendar.
          </p>
          <Link
            href="#features"
            className="mt-10 inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-7 py-3.5 rounded-xl hover:bg-violet-50 transition-all text-sm shadow-xl hover:-translate-y-0.5"
          >
            Explore Features
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

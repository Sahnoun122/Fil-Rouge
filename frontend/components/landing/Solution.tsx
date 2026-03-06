import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Solution() {
  return (
    <section className="py-24 bg-linear-to-br from-violet-600 to-violet-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/20 border border-white/30 px-3.5 py-1.5 text-xs font-semibold text-white/90 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          The Solution
        </div>
        <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-white leading-tight">
          Your AI Marketing Assistant
        </h2>
        <p className="mt-6 text-lg text-violet-100 leading-relaxed max-w-2xl mx-auto">
          MarketPlan IA helps you transform ideas into a clear and structured marketing strategy.
          In just a few minutes, our AI generates a complete marketing plan, SWOT analysis, and
          content planning calendar.
        </p>
        <Link
          href="#features"
          className="mt-8 inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-6 py-3 rounded-xl hover:bg-violet-50 transition-colors text-sm shadow-lg"
        >
          Explore Features
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

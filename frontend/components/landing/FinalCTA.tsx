import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="relative py-28 bg-linear-to-br from-violet-500 via-violet-600 to-purple-700 overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 sm:px-8 lg:px-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/20 border border-white/30 px-4 py-2 text-xs font-semibold text-white/90 mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          Get Started Today — It&apos;s Free
        </div>

        <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
          Start Building Your Marketing
          <br />
          Strategy Today
        </h2>

        <p className="mt-6 text-lg text-violet-100/90 leading-relaxed">
          Join marketers and businesses using AI to build smarter marketing strategies.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-extrabold text-violet-700 bg-white rounded-xl hover:bg-violet-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
          >
            Create My Strategy
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="mt-6 text-violet-200/80 text-sm">
          No credit card required &middot; Free to start &middot; Cancel anytime
        </p>
      </div>
    </section>
  );
}

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Solution() {
  return (
    <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Violet glow center */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-violet-100/80 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Big centered card */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-violet-600 via-violet-700 to-purple-700 p-1 shadow-2xl shadow-violet-300/30">
          <div className="rounded-[22px] bg-gradient-to-br from-violet-600 via-violet-700 to-purple-800 px-8 py-14 sm:px-16 text-center relative overflow-hidden">
            {/* Inner blobs */}
            <div className="pointer-events-none absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 w-72 h-72 rounded-full bg-purple-900/40 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-4 py-1.5 text-xs font-bold text-white/90 mb-7 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                La Solution
              </div>

              <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
                Votre Assistant Marketing
                <br />
                Propulsé par l'IA
              </h2>

              <p className="mt-6 text-lg text-violet-200 leading-relaxed max-w-2xl mx-auto">
                MarketPlan IA transforme vos idées en une stratégie marketing structurée et exploitable
                en quelques minutes — complétée par une analyse SWOT et un calendrier de contenu.
              </p>

              <Link
                href="#features"
                className="mt-10 inline-flex items-center gap-2 bg-white text-violet-700 font-extrabold px-7 py-3.5 rounded-xl hover:bg-violet-50 transition-all text-sm shadow-xl shadow-black/20 hover:-translate-y-0.5"
              >
                Explorer les Fonctionnalités
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { CheckCircle2, TrendingUp } from 'lucide-react';

const BENEFITS = [
  { title: 'Économisez des heures de réflexion stratégique', description: 'Obtenez une stratégie marketing complète et professionnelle en quelques minutes au lieu de plusieurs jours.' },
  { title: 'Construisez une stratégie marketing claire', description: 'L\'IA structure vos objectifs, votre positionnement, vos canaux, votre message et votre plan d\'action.' },
  { title: 'Planifiez votre contenu efficacement', description: 'Remplissez votre calendrier de contenu avec des idées de publications et des plannings intelligents générés par l\'IA.' },
  { title: 'Augmentez la cohérence de votre marketing', description: 'Restez cohérent sur toutes les plateformes avec un plan centralisé et bien organisé.' },
  { title: 'Centralisez toute votre planification marketing', description: 'Stratégie, analyse SWOT, calendrier de contenu et exportation PDF — tout sur une seule plateforme.' },
];

const STATS = [
  { number: '5 min', label: 'Pour obtenir une stratégie complète', color: 'text-violet-600' },
  { number: '8×', label: 'Plus rapide que la planification manuelle', color: 'text-purple-600' },
  { number: '10k+', label: 'Stratégies générées', color: 'text-fuchsia-600' },
  { number: '98%', label: 'Taux de satisfaction des utilisateurs', color: 'text-pink-500' },
];

export default function Benefits() {
  return (
    <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-50/80 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-4">Pourquoi Nous</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Pourquoi Choisir{' '}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">MarketPlan IA ?</span>
          </h2>
          <p className="mt-5 text-base text-slate-500 leading-relaxed">
            Arrêtez de deviner. Commencez à croître avec une plateforme conçue pour les marketeurs modernes qui veulent de vrais résultats.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {STATS.map(({ number, label, color }) => (
            <div key={label} className="relative bg-white border border-slate-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:border-violet-200 transition-all overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/0 to-violet-50/0 group-hover:from-violet-50/50 group-hover:to-purple-50/30 transition-all duration-300" />
              <p className={`text-3xl font-black ${color} relative`}>{number}</p>
              <p className="text-xs text-slate-500 mt-2 leading-snug relative">{label}</p>
            </div>
          ))}
        </div>

        {/* Benefits grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="group flex gap-4 p-6 rounded-2xl border border-slate-100 bg-white hover:border-violet-200 hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 leading-snug">{benefit.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
          {/* Accent card */}
          <div className="flex gap-4 p-6 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-white">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1.5">Commencez À Croître Aujourd'hui</h3>
              <p className="text-sm text-violet-200 leading-relaxed">Rejoignez plus de 10 000 marketeurs qui utilisent déjà l'IA pour planifier plus intelligemment, et non plus durement.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

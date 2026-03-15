import { Users, Briefcase, Rocket, Store, PenTool, Lightbulb } from 'lucide-react';

const AUDIENCES = [
  { icon: Users, title: 'Marketeurs Digitaux', description: 'Gérez des stratégies complètes pour plusieurs clients à grande échelle.', color: 'bg-violet-500' },
  { icon: Briefcase, title: 'Marketeurs Freelance', description: 'Rendez des stratégies professionnelles à vos clients en quelques minutes, pas en quelques jours.', color: 'bg-purple-500' },
  { icon: Rocket, title: 'Startups', description: 'Lancez-vous avec un plan de go-to-market propulsé par l\'IA dès le premier jour.', color: 'bg-fuchsia-500' },
  { icon: Store, title: 'Petites Entreprises', description: 'Rivallisez avec les grandes marques grâce à une planification intelligente basée sur les données.', color: 'bg-pink-500' },
  { icon: PenTool, title: 'Créateurs de Contenu', description: 'Planifiez du contenu de manière cohérente, développez votre audience, monétisez votre marque.', color: 'bg-amber-500' },
  { icon: Lightbulb, title: 'Entrepreneurs', description: 'Transformez votre idée d\'entreprise en un plan marketing parfaitement actionnable.', color: 'bg-teal-500' },
];

export default function WhoIsItFor() {
  return (
    <section className="py-24 lg:py-32 bg-slate-950 relative overflow-hidden">
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-64 rounded-full bg-violet-700/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">Pour Tous</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            À qui s'adresse MarketPlan IA ?
          </h2>
          <p className="mt-5 text-base text-slate-400 leading-relaxed">
            Que vous soyez un créateur solo ou à la tête d'une équipe, MarketPlan IA s'adapte à vos besoins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {AUDIENCES.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="group relative flex gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-violet-500/30 transition-all duration-200 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-violet-500/0 group-hover:bg-violet-500/5 blur-2xl transition-all duration-300" />
              <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-1.5">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

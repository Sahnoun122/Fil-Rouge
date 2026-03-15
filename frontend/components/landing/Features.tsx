import {
  Sparkles,
  Target,
  CalendarDays,
  MessageSquare,
  Layers,
  FileDown,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';

const FEATURES = [
  { icon: Sparkles, title: 'Générateur de Stratégie IA', description: 'Générez une stratégie marketing complète à partir de simples informations sur votre entreprise.', gradient: 'from-violet-500 to-purple-600' },
  { icon: Target, title: 'Analyse SWOT', description: 'Générez automatiquement et instantanément vos forces, faiblesses, opportunités et menaces.', gradient: 'from-emerald-500 to-teal-600' },
  { icon: CalendarDays, title: 'Calendrier de Contenu', description: 'Organisez toutes vos publications sur les réseaux sociaux dans un calendrier clair, structuré et partageable.', gradient: 'from-amber-500 to-orange-500' },
  { icon: MessageSquare, title: 'Suggestions Intelligentes', description: 'L\'IA suggère des idées de publications, des légendes et des hashtags adaptés à votre audience.', gradient: 'from-sky-500 to-cyan-500' },
  { icon: Layers, title: 'Structure de Tunnel', description: 'Organisez automatiquement votre stratégie en phases Prospect, Lead et Client.', gradient: 'from-pink-500 to-rose-500' },
  { icon: FileDown, title: 'Exportation PDF', description: 'Exportez votre stratégie complète dans un PDF professionnel et magnifiquement formaté.', gradient: 'from-violet-500 to-indigo-600' },
  { icon: BarChart3, title: 'Tableau de Bord Marketing', description: 'Suivez les stratégies, les publications et les analyses de l\'IA en un seul endroit.', gradient: 'from-teal-500 to-cyan-600' },
  { icon: ShieldCheck, title: 'Tableau de Bord Admin', description: 'Gérez les utilisateurs et surveillez toute l\'activité de la plateforme avec un contrôle total.', gradient: 'from-slate-600 to-slate-800' },
];

const Features = () => {
  return (
    <section id="features" className="py-24 lg:py-32 bg-slate-950 relative overflow-hidden">
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 rounded-full bg-violet-700/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">Fonctionnalités</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Tout ce dont vous avez besoin pour{' '}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Croître Plus Vite</span>
          </h2>
          <p className="mt-5 text-base text-slate-400 leading-relaxed">
            Tous les outils pour concevoir, exécuter et mettre à l'échelle votre marketing — sur une seule plateforme.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, description, gradient }) => (
            <div
              key={title}
              className="group relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-violet-500/30 transition-all duration-200 overflow-hidden"
            >
              {/* Hover glow */}
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-violet-500/0 group-hover:bg-violet-500/10 blur-2xl transition-all duration-300" />
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2 leading-snug">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

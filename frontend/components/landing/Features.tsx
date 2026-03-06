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
  { icon: Sparkles, title: 'AI Strategy Generator', description: 'Generate a complete marketing strategy from simple inputs about your business.', gradient: 'from-violet-500 to-purple-600' },
  { icon: Target, title: 'SWOT Analysis', description: 'Auto-generate strengths, weaknesses, opportunities, and threats instantly.', gradient: 'from-emerald-500 to-teal-600' },
  { icon: CalendarDays, title: 'Content Calendar', description: 'Organize all social media posts in a clear, structured, shareable calendar.', gradient: 'from-amber-500 to-orange-500' },
  { icon: MessageSquare, title: 'Smart Suggestions', description: 'AI suggests post ideas, captions, and hashtags tailored to your audience.', gradient: 'from-sky-500 to-cyan-500' },
  { icon: Layers, title: 'Funnel Structure', description: 'Organize your strategy into Prospect, Lead, and Client phases automatically.', gradient: 'from-pink-500 to-rose-500' },
  { icon: FileDown, title: 'PDF Export', description: 'Export your full strategy into a professional, beautifully formatted PDF.', gradient: 'from-violet-500 to-indigo-600' },
  { icon: BarChart3, title: 'Marketing Dashboard', description: 'Track strategies, publications, and AI insights all in one place.', gradient: 'from-teal-500 to-cyan-600' },
  { icon: ShieldCheck, title: 'Admin Dashboard', description: 'Manage users and monitor all platform activity with complete control.', gradient: 'from-slate-600 to-slate-800' },
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
          <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">Features</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Everything You Need to{' '}
            <span className="bg-linear-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Grow Faster</span>
          </h2>
          <p className="mt-5 text-base text-slate-400 leading-relaxed">
            All the tools to build, execute, and scale your marketing — in one platform.
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
              <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg`}>
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

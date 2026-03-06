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
  {
    icon: Sparkles,
    title: 'AI Marketing Strategy Generator',
    description: 'Generate a complete marketing strategy based on simple inputs about your business.',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    icon: Target,
    title: 'SWOT Analysis',
    description: 'Automatically generate strengths, weaknesses, opportunities, and threats.',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: CalendarDays,
    title: 'Content Planning Calendar',
    description: 'Organize all your social media content in a clear, structured calendar.',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    icon: MessageSquare,
    title: 'Smart Content Suggestions',
    description: 'AI suggests post ideas, captions, and hashtags tailored to your audience.',
    bg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    icon: Layers,
    title: 'Marketing Funnel Structure',
    description: 'Organize your strategy into Prospect, Lead, and Client phases automatically.',
    bg: 'bg-pink-50',
    iconColor: 'text-pink-600',
  },
  {
    icon: FileDown,
    title: 'PDF Export',
    description: 'Export your full strategy and planning into a professional, shareable PDF.',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    icon: BarChart3,
    title: 'Marketing Dashboard',
    description: 'Track your strategies, publications, and AI recommendations in one place.',
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    icon: ShieldCheck,
    title: 'Admin Dashboard',
    description: 'Manage users and monitor all platform activity with full control.',
    bg: 'bg-slate-50',
    iconColor: 'text-slate-600',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-4">Features</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Powerful Features</h2>
          <p className="mt-5 text-lg text-slate-500 leading-relaxed">
            Everything you need to build, execute, and scale your marketing strategy — all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, description, bg, iconColor }) => (
            <div
              key={title}
              className="group flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-md hover:border-violet-200 hover:-translate-y-1 transition-all duration-200"
            >
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

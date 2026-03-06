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
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-bold uppercase tracking-wider text-violet-600 mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Powerful Features</h2>
          <p className="mt-4 text-lg text-slate-600">
            Everything you need to build, execute, and scale your marketing strategy — all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, description, bg, iconColor }) => (
            <div
              key={title}
              className="group p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-lg hover:border-violet-200 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

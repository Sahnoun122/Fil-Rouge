import { ClipboardEdit, Sparkles, CalendarDays, FileDown } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: ClipboardEdit,
    title: 'Enter Your Business Info',
    description: 'Enter basic information about your business, goals, target audience, and preferred channels.',
    color: 'bg-violet-100 text-violet-700',
    ring: 'bg-violet-600',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'AI Generates Your Strategy',
    description: 'Our AI instantly generates your complete marketing strategy, SWOT analysis, and funnel structure.',
    color: 'bg-purple-100 text-purple-700',
    ring: 'bg-purple-600',
  },
  {
    number: '03',
    icon: CalendarDays,
    title: 'Plan Your Content Calendar',
    description: 'Organize and schedule all your social media content inside the AI-powered marketing calendar.',
    color: 'bg-fuchsia-100 text-fuchsia-700',
    ring: 'bg-fuchsia-600',
  },
  {
    number: '04',
    icon: FileDown,
    title: 'Export as Professional PDF',
    description: 'Export your complete strategy and content planning as a clean, professional PDF to share.',
    color: 'bg-violet-100 text-violet-700',
    ring: 'bg-violet-500',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-bold uppercase tracking-wider text-violet-600 mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            How MarketPlan IA Works
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            From zero to a complete marketing strategy in 4 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ number, icon: Icon, title, description, color, ring }, index) => (
            <div key={number} className="relative">
              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-linear-to-r from-violet-200 to-violet-100 z-0" style={{ width: 'calc(100% - 2rem)', left: '50%' }} />
              )}
              <div className="relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-violet-200 transition-all text-center">
                {/* Step badge */}
                <div className={`w-10 h-10 rounded-full ${ring} text-white text-xs font-extrabold flex items-center justify-center mx-auto mb-4`}>
                  {number}
                </div>
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

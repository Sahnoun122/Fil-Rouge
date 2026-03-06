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
    <section id="how-it-works" className="py-20 lg:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-4">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How MarketPlan IA Works
          </h2>
          <p className="mt-5 text-lg text-slate-500 leading-relaxed">
            From zero to a complete marketing strategy in 4 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {STEPS.map(({ number, icon: Icon, title, description, color, ring }, index) => (
            <div key={number} className="relative flex flex-col">
              {/* Connector line — desktop only */}
              {index < STEPS.length - 1 && (
                <div
                  className="hidden lg:block absolute top-[52px] h-px bg-linear-to-r from-violet-300 to-violet-100 z-0"
                  style={{ left: '50%', width: '100%' }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center text-center bg-white rounded-2xl border border-slate-200 p-7 hover:shadow-md hover:border-violet-200 transition-all duration-200 h-full">
                {/* Step number */}
                <div className={`w-11 h-11 rounded-full ${ring} text-white text-xs font-extrabold flex items-center justify-center mb-5 shadow-sm`}>
                  {number}
                </div>
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-5`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-3 leading-snug">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

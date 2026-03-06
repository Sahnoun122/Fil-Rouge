import { ClipboardEdit, Sparkles, CalendarDays, FileDown } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: ClipboardEdit,
    title: 'Enter Your Business Info',
    description: 'Describe your business, goals, target audience, and preferred channels.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'AI Generates Your Strategy',
    description: 'Our AI instantly creates your full marketing strategy, SWOT, and funnel.',
    gradient: 'from-purple-500 to-fuchsia-600',
  },
  {
    number: '03',
    icon: CalendarDays,
    title: 'Plan Your Content',
    description: 'Schedule all social media content in the AI-powered marketing calendar.',
    gradient: 'from-fuchsia-500 to-pink-600',
  },
  {
    number: '04',
    icon: FileDown,
    title: 'Export as PDF',
    description: 'Download your complete strategy as a clean, professional PDF to share.',
    gradient: 'from-violet-500 to-indigo-600',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #e9d5ff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.4,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white via-white/20 to-white" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-4">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            From Zero to Full Strategy
            <br />
            <span className="bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">in 4 Simple Steps</span>
          </h2>
          <p className="mt-5 text-base text-slate-500 leading-relaxed">
            No marketing degree required. Just answer a few questions.
          </p>
        </div>

        {/* Steps with numbered connectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {STEPS.map(({ number, icon: Icon, title, description, gradient }, index) => (
            <div key={number} className="relative flex flex-col">
              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className="hidden xl:block absolute top-[28px] h-px bg-linear-to-r from-violet-300 to-violet-100 z-0"
                  style={{ left: '50%', width: '100%' }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center text-center bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-violet-200 hover:-translate-y-1 transition-all duration-200 p-7">
                {/* Numbered badge */}
                <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${gradient} flex items-center justify-center mb-6 shadow-md`}>
                  <span className="text-white text-sm font-black">{number}</span>
                </div>
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2 leading-snug">{title}</h3>
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

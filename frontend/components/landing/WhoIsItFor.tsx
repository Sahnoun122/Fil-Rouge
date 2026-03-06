import { Users, Briefcase, Rocket, Store, PenTool, Lightbulb } from 'lucide-react';

const AUDIENCES = [
  {
    icon: Users,
    title: 'Digital Marketers',
    description: 'Build and manage complete marketing strategies for multiple clients at once.',
  },
  {
    icon: Briefcase,
    title: 'Freelance Marketers',
    description: 'Deliver professional, structured strategies to clients in minutes, not days.',
  },
  {
    icon: Rocket,
    title: 'Startups',
    description: "Launch your brand with a clear AI-powered go-to-market plan from day one.",
  },
  {
    icon: Store,
    title: 'Small Businesses',
    description: 'Compete with bigger brands using smart, data-driven marketing planning.',
  },
  {
    icon: PenTool,
    title: 'Content Creators',
    description: 'Plan your content consistently, grow your audience, and monetize your brand.',
  },
  {
    icon: Lightbulb,
    title: 'Entrepreneurs',
    description: 'Turn your business idea into a fully structured, actionable marketing plan.',
  },
];

export default function WhoIsItFor() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-4">For Everyone</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Who Is MarketPlan IA For?
          </h2>
          <p className="mt-5 text-lg text-slate-500 leading-relaxed">
            Whether you&apos;re solo or running a team, MarketPlan IA adapts to your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {AUDIENCES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group flex gap-5 p-6 rounded-2xl border border-slate-200 hover:border-violet-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-white"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center shrink-0 group-hover:bg-violet-100 transition-colors">
                <Icon className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 leading-snug">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

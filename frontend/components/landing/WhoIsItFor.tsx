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
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-bold uppercase tracking-wider text-violet-600 mb-3">For Everyone</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Who Is MarketPlan IA For?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Whether you&apos;re solo or running a team, MarketPlan IA adapts to your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {AUDIENCES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group flex gap-4 p-5 rounded-2xl border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all bg-white"
            >
              <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center shrink-0 group-hover:bg-violet-100 transition-colors">
                <Icon className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

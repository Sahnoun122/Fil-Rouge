const SWOT = () => {
  const swotItems = [
    {
      title: "Forces",
      subtitle: "Strengths",
      description: "Identifiez vos avantages concurrentiels, compétences uniques et atouts internes.",
      examples: ["Expertise technique", "Équipe qualifiée", "Innovation"],
      color: "bg-green-500",
      bgColor: "bg-green-50", 
      borderColor: "border-green-200",
      textColor: "text-green-600",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: "Faiblesses", 
      subtitle: "Weaknesses",
      description: "Analysez vos limites internes et les aspects à améliorer dans votre organisation.",
      examples: ["Budget limité", "Manque d'expérience", "Ressources"],
      color: "bg-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200", 
      textColor: "text-red-600",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.624 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    {
      title: "Opportunités",
      subtitle: "Opportunities", 
      description: "Explorez les tendances du marché et opportunités externes à saisir.",
      examples: ["Marché émergent", "Nouvelles technologies", "Partenariats"],
      color: "bg-violet-500",
      bgColor: "bg-violet-50",
      borderColor: "border-violet-200",
      textColor: "text-violet-600", 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      title: "Menaces",
      subtitle: "Threats",
      description: "Anticipez les risques externes, la concurrence et les obstacles potentiels.",
      examples: ["Concurrence forte", "Réglementation", "Récession"],
      color: "bg-orange-500", 
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-600",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
  ];

  return (
    <section id="swot" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Analyse SWOT automatique
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Analysez votre position stratégique avec notre module SWOT intelligent. 
            Identifiez vos forces, faiblesses, opportunités et menaces en un clic.
          </p>
        </div>

        {/* SWOT Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {swotItems.map((item, index) => (
            <div 
              key={index}
              className={`${item.bgColor} ${item.borderColor} border-2 rounded-2xl p-8 hover:shadow-lg transition-all duration-300`}
            >
              {/* Header */}
              <div className="flex items-center mb-6">
                <div className={`${item.color} text-white w-14 h-14 rounded-xl flex items-center justify-center mr-4`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{item.title}</h3>
                  <p className={`${item.textColor} font-medium`}>{item.subtitle}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-600 mb-6 leading-relaxed">
                {item.description}
              </p>

              {/* Examples */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  Exemples
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.examples.map((example, exampleIndex) => (
                    <span 
                      key={exampleIndex}
                      className={`${item.textColor} bg-white px-3 py-1 rounded-full text-sm font-medium border ${item.borderColor}`}
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features section */}
        <div className="bg-slate-50 rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Fonctionnalités SWOT avancées
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Génération IA</h4>
              <p className="text-slate-600 text-sm">Notre IA analyse votre secteur et génère automatiquement votre SWOT personnalisé</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Personnalisation</h4>
              <p className="text-slate-600 text-sm">Modifiez et enrichissez votre analyse SWOT selon vos besoins spécifiques</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Intégration</h4>
              <p className="text-slate-600 text-sm">Votre SWOT s'intègre automatiquement dans votre stratégie marketing complète</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Créez votre première analyse SWOT
            </h3>
            <p className="text-slate-600 mb-8">
              Découvrez en quelques minutes les points clés de votre position stratégique
            </p>
            <button className="bg-violet-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-violet-700 transition-colors duration-200 mr-4">
              Générer mon SWOT
            </button>
            <button className="border-2 border-slate-300 text-slate-700 px-8 py-3 rounded-lg font-semibold hover:border-slate-400 transition-colors duration-200">
              Voir un exemple
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SWOT;
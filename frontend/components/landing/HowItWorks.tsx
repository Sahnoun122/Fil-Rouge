const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      title: "Remplissez le formulaire stratégique",
      description: "Décrivez votre entreprise, vos objectifs et votre audience cible en quelques minutes seulement.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      step: "02", 
      title: "Génération automatique par l'IA",
      description: "Notre IA analyse vos données et génère instantanément votre plan marketing complet + analyse SWOT.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      step: "03",
      title: "Calendrier + Export PDF",
      description: "Obtenez votre planning de contenu organisé et exportez tout en PDF professionnel.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Trois étapes simples pour transformer votre idée en stratégie marketing complète
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-dashed border-slate-300"></div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                {/* Step number */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white text-xl font-bold rounded-full mb-6">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  {step.title}
                </h3>
                
                <p className="text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section with demo video placeholder */}
        <div className="mt-20 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Voyez MarketPlan IA en action
            </h3>
            <p className="text-slate-600 mb-8">
              Découvrez comment créer une stratégie marketing complète en moins de 5 minutes
            </p>
            
            {/* Video placeholder */}
            <div className="bg-slate-100 rounded-xl p-16 border-2 border-dashed border-slate-300">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-slate-700 mb-2">
                  Vidéo de démonstration
                </h4>
                <p className="text-slate-500">
                  Cliquez pour voir MarketPlan IA en action
                </p>
              </div>
            </div>
            
            <div className="mt-8">
              <button className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200">
                Essayer maintenant gratuitement
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
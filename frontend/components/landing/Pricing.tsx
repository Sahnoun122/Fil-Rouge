const Pricing = () => {
  const plans = [
    {
      name: "Gratuit",
      price: "0€",
      period: "/mois",
      description: "Parfait pour débuter avec le marketing IA",
      features: [
        "1 stratégie marketing par mois",
        "Analyse SWOT basique",
        "10 publications/mois dans le calendrier",
        "Export PDF standard",
        "Support communautaire"
      ],
      limitations: [
        "Pas de suggestions IA avancées",
        "Pas de modèles personnalisés"
      ],
      buttonText: "Commencer gratuitement",
      buttonStyle: "border-2 border-slate-300 text-slate-700 hover:border-slate-400",
      popular: false
    },
    {
      name: "Pro",
      price: "29€",
      period: "/mois",
      description: "Pour les marketeurs qui veulent aller plus loin",
      features: [
        "Stratégies marketing illimitées",
        "Analyse SWOT avancée avec IA",
        "Publications illimitées",
        "Suggestions IA pour contenus",
        "Templates personnalisables",
        "Export PDF professionnel",
        "Support prioritaire"
      ],
      limitations: [],
      buttonText: "Commencer l'essai gratuit",
      buttonStyle: "bg-violet-600 text-white hover:bg-violet-700",
      popular: true
    },
    {
      name: "Business",
      price: "99€",
      period: "/mois", 
      description: "Pour les équipes et agences marketing",
      features: [
        "Tout du plan Pro",
        "Gestion multi-comptes",
        "Collaboration en équipe",
        "Analytiques avancées",
        "API personnalisée",
        "Formation dédiée",
        "Support 24/7",
        "Marque blanche"
      ],
      limitations: [],
      buttonText: "Contacter l'équipe",
      buttonStyle: "border-2 border-slate-300 text-slate-700 hover:border-slate-400",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Tarification simple et transparente
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Choisissez le plan qui correspond à vos besoins. 
            Tous les plans incluent notre IA marketing avancée.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
                plan.popular ? 'border-violet-500 scale-105' : 'border-slate-200'
              } hover:shadow-xl transition-all duration-300`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-violet-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Le plus populaire
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 ml-2">{plan.period}</span>
                </div>
                <p className="text-slate-600">
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <div className="mb-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, limitationIndex) => (
                    <li key={limitationIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-slate-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="text-slate-400">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${plan.buttonStyle}`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Trust section */}
        <div className="mt-20 text-center">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Pourquoi choisir MarketPlan IA ?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">30 jours d'essai</h4>
                <p className="text-slate-600 text-sm">Testez tous nos plans premium gratuitement pendant un mois complet</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Données sécurisées</h4>
                <p className="text-slate-600 text-sm">Vos stratégies marketing sont protégées avec un chiffrement de niveau bancaire</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Mises à jour IA</h4>
                <p className="text-slate-600 text-sm">Bénéficiez des dernières avancées en intelligence artificielle marketing</p>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-200">
              <p className="text-slate-500">
                <span className="font-semibold">+500 marketeurs</span> nous font confiance • 
                <span className="font-semibold"> 98% de satisfaction</span> • 
                <span className="font-semibold">Support en français</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
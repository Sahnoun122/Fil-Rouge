'use client';

import { useState } from 'react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Comment l'IA génère-t-elle ma stratégie marketing ?",
      answer: "Notre IA analyse les informations que vous fournissez (secteur d'activité, cible, objectifs) et utilise une base de connaissances marketing pour générer automatiquement un plan structuré selon la méthode Avant/Pendant/Après. Elle propose des personas, messages, canaux et actions concrètes adaptés à votre contexte."
    },
    {
      question: "Qu'est-ce que l'analyse SWOT automatique ?",
      answer: "L'analyse SWOT (Forces, Faiblesses, Opportunités, Menaces) est générée automatiquement en fonction de votre secteur et contexte. Notre IA identifie les points clés de votre position concurrentielle et vous propose des recommandations stratégiques personnalisées que vous pouvez ensuite modifier selon vos besoins."
    },
    {
      question: "Puis-je personnaliser les stratégies générées ?",
      answer: "Absolument ! Toutes les stratégies générées par l'IA sont entièrement modifiables. Vous pouvez ajuster les personas, modifier les messages, ajouter ou retirer des canaux de communication, et personnaliser chaque élément pour qu'il corresponde parfaitement à votre vision et réalité terrain."
    },
    {
      question: "Comment fonctionne le calendrier de contenu ?",
      answer: "Une fois votre stratégie créée, vous pouvez planifier vos publications sur différents réseaux sociaux (Facebook, Instagram, LinkedIn, TikTok...). L'outil vous suggère du contenu adapté à chaque phase de votre stratégie et vous permet d'organiser vos posts dans un calendrier intuitif avec rappels et statuts de publication."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "La sécurité est notre priorité. Toutes vos données sont chiffrées et stockées de manière sécurisée. Nous ne partageons jamais vos informations avec des tiers. Vous conservez la propriété complète de vos stratégies marketing et pouvez supprimer vos données à tout moment."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Questions fréquentes
          </h2>
          <p className="text-xl text-slate-600">
            Toutes les réponses à vos questions sur MarketPlan IA
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-6 text-left bg-white hover:bg-slate-50 transition-colors duration-200 flex justify-between items-center"
              >
                <h3 className="text-lg font-semibold text-slate-900 pr-8">
                  {faq.question}
                </h3>
                <svg 
                  className={`w-6 h-6 text-slate-400 transform transition-transform duration-200 flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6 pt-0">
                  <div className="border-t border-slate-200 pt-6">
                    <p className="text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-violet-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Vous avez d'autres questions ?
            </h3>
            <p className="text-slate-600 mb-6">
              Notre équipe support est là pour vous accompagner dans l'utilisation de MarketPlan IA
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-700 transition-colors duration-200">
                Contacter le support
              </button>
              <button className="border-2 border-violet-200 text-violet-600 px-6 py-3 rounded-lg font-semibold hover:border-violet-300 transition-colors duration-200">
                Consulter la documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
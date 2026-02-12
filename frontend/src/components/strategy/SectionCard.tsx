'use client';

import React from 'react';
import { Edit3, RefreshCw, Sparkles, Users, MessageSquare, Megaphone, UserPlus, Mail, ArrowRight, Heart, TrendingUp, Star } from 'lucide-react';
import { SectionCardProps } from '@/types/strategy';

const sectionIcons = {
  marcheTarget: Users,
  messageMarketing: MessageSquare,
  canauxCommunication: Megaphone,
  captureProspects: UserPlus,
  nurturing: Mail,
  conversion: ArrowRight,
  experienceClient: Heart,
  augmentationValeurClient: TrendingUp,
  recommandation: Star
};

const sectionTitles = {
  marcheTarget: 'Marché Cible',
  messageMarketing: 'Message Marketing',
  canauxCommunication: 'Canaux de Communication',
  captureProspects: 'Capture Prospects',
  nurturing: 'Nurturing',
  conversion: 'Conversion',
  experienceClient: 'Expérience Client',
  augmentationValeurClient: 'Augmentation Valeur Client',
  recommandation: 'Recommandation'
};

export const SectionCard: React.FC<SectionCardProps> = ({
  sectionKey,
  data,
  phaseKey,
  onRegenerate,
  onImprove,
  onEdit
}) => {
  const Icon = sectionIcons[sectionKey as keyof typeof sectionIcons];
  const title = sectionTitles[sectionKey as keyof typeof sectionTitles];

  const renderContent = () => {
    if (!data) return <p className="text-gray-500 text-sm">Aucune donnée disponible</p>;

    switch (sectionKey) {
      case 'marcheTarget':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Persona</h4>
              <p className="text-sm text-gray-600">{data.persona}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Besoins</h4>
              <ul className="space-y-1">
                {data.besoins?.map((besoin: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-violet-500 mr-2">•</span>
                    {besoin}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Problèmes</h4>
              <ul className="space-y-1">
                {data.problemes?.map((probleme: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    {probleme}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'messageMarketing':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Proposition de Valeur</h4>
              <p className="text-sm text-gray-600">{data.propositionValeur}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Message Principal</h4>
              <p className="text-sm text-gray-600">{data.messagePrincipal}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Ton de Communication</h4>
              <span className="inline-block bg-violet-100 text-violet-800 px-2 py-1 rounded-lg text-xs font-medium">
                {data.tonCommunication}
              </span>
            </div>
          </div>
        );

      case 'canauxCommunication':
        return (
          <div className="space-y-3">
            {data.plateformes?.map((platform: any, index: number) => (
              <div key={index} className="border-l-4 border-violet-500 pl-3">
                <h4 className="text-sm font-semibold text-gray-800 mb-1">{platform.platform}</h4>
                <div className="flex flex-wrap gap-1">
                  {platform.typesContenu?.map((type: string, typeIndex: number) => (
                    <span
                      key={typeIndex}
                      className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'captureProspects':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Landing Page</h4>
              <p className="text-sm text-gray-600">{data.landingPage}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Formulaire</h4>
              <ul className="space-y-1">
                {data.formulaire?.map((field: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-violet-500 mr-2">•</span>
                    {field}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Offre Incitative</h4>
              <p className="text-sm text-gray-600 bg-green-50 p-2 rounded-lg">{data.offreIncitative}</p>
            </div>
          </div>
        );

      case 'nurturing':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Séquence d&apos;Emails</h4>
              <ul className="space-y-1">
                {data.sequenceEmails?.map((email: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-blue-500 mr-2">{index + 1}.</span>
                    {email}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Contenus Éducatifs</h4>
              <ul className="space-y-1">
                {data.contenusEducatifs?.map((contenu: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-violet-500 mr-2">•</span>
                    {contenu}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'conversion':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Call-to-Actions</h4>
              <div className="flex flex-wrap gap-2">
                {data.cta?.map((cta: string, index: number) => (
                  <span
                    key={index}
                    className="inline-block bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {cta}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Offres</h4>
              <ul className="space-y-1">
                {data.offres?.map((offre: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    {offre}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Argumentaire de Vente</h4>
              <p className="text-sm text-gray-600">{data.argumentaireVente}</p>
            </div>
          </div>
        );

      case 'experienceClient':
        return (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Recommandations</h4>
            <ul className="space-y-2">
              {data.recommendations?.map((recommendation: string, index: number) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-pink-500 mr-2">♥</span>
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'augmentationValeurClient':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Upsell</h4>
              <ul className="space-y-1">
                {data.upsell?.map((item: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-green-500 mr-2">↗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Cross-sell</h4>
              <ul className="space-y-1">
                {data.crossSell?.map((item: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-blue-500 mr-2">↔</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Fidélité</h4>
              <ul className="space-y-1">
                {data.fidelite?.map((item: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-purple-500 mr-2">★</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'recommandation':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Parrainage</h4>
              <ul className="space-y-1">
                {data.parrainage?.map((item: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-violet-500 mr-2">👥</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Avis Clients</h4>
              <ul className="space-y-1">
                {data.avisClients?.map((item: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-yellow-500 mr-2">⭐</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Récompenses</h4>
              <ul className="space-y-1">
                {data.recompenses?.map((item: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-orange-500 mr-2">🎁</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-600">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center mb-4">
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-2 rounded-xl mr-3">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>

      {/* Content */}
      <div className="mb-6">
        {renderContent()}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onEdit(sectionKey, phaseKey)}
          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <Edit3 className="w-4 h-4 mr-1" />
          Éditer
        </button>
        <button
          onClick={() => onRegenerate(sectionKey, phaseKey)}
          className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Régénérer
        </button>
        <button
          onClick={() => onImprove(sectionKey, phaseKey)}
          className="flex items-center px-3 py-2 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition-colors text-sm font-medium"
        >
          <Sparkles className="w-4 h-4 mr-1" />
          Améliorer
        </button>
      </div>
    </div>
  );
};
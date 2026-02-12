'use client';

import React, { useState } from 'react';
import { X, Sparkles, RefreshCw } from 'lucide-react';

interface RegenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (instruction: string) => void;
  sectionTitle: string;
  actionType: 'regenerate' | 'improve';
  isLoading?: boolean;
}

export const RegenerateModal: React.FC<RegenerateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sectionTitle,
  actionType,
  isLoading = false
}) => {
  const [instruction, setInstruction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(instruction);
    setInstruction('');
  };

  const handleClose = () => {
    setInstruction('');
    onClose();
  };

  if (!isOpen) return null;

  const actionConfig = {
    regenerate: {
      title: 'Régénérer la section',
      icon: RefreshCw,
      description: 'Donnez des instructions pour régénérer complètement cette section',
      placeholder: 'Ex: Cibler une audience plus jeune, Ton plus professionnel, Inclure plus d&apos;émotions...',
      buttonText: 'Régénérer avec IA',
      buttonColor: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
    },
    improve: {
      title: 'Améliorer la section',
      icon: Sparkles,
      description: 'Donnez des instructions pour améliorer le contenu existant',
      placeholder: 'Ex: Rendre plus détaillé, Ajouter des exemples concrets, Simplifier le langage...',
      buttonText: 'Améliorer avec IA',
      buttonColor: 'from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'
    }
  };

  const config = actionConfig[actionType];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className={`bg-gradient-to-r ${config.buttonColor} p-2 rounded-xl mr-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
              <p className="text-sm text-gray-500">{sectionTitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">{config.description}</p>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Instructions pour l&apos;IA
              </label>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                rows={4}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-colors resize-none"
                placeholder={config.placeholder}
              />
              <p className="text-xs text-gray-500">
                Soyez précis dans vos instructions pour obtenir les meilleurs résultats
              </p>
            </div>
          </div>

          {/* Suggestions */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Suggestions rapides:</p>
            <div className="flex flex-wrap gap-2">
              {actionType === 'regenerate' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setInstruction('Cibler une audience plus jeune (25-35 ans)')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    Plus jeune
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstruction('Ton plus professionnel et sérieux')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    Plus professionnel
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstruction('Focus sur le luxe et la qualité premium')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    Plus luxueux
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setInstruction('Ajouter des exemples concrets et des chiffres')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    Plus d&apos;exemples
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstruction('Rendre plus détaillé et actionnable')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    Plus détaillé
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstruction('Simplifier et rendre plus accessible')}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    Simplifier
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !instruction.trim()}
              className={`flex-1 bg-gradient-to-r ${config.buttonColor} text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Génération...
                </>
              ) : (
                <>
                  <Icon className="w-4 h-4 mr-2" />
                  {config.buttonText}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
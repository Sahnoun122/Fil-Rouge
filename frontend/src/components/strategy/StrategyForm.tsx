'use client';

import React, { useState } from 'react';
import { BusinessForm } from '@/types/strategy';
import { Sparkles, Building2, Target, MapPin, DollarSign } from 'lucide-react';

interface StrategyFormProps {
  onSubmit: (data: BusinessForm) => void;
  isLoading?: boolean;
}

export const StrategyForm: React.FC<StrategyFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<BusinessForm>({
    businessName: '',
    industry: '',
    productOrService: '',
    targetAudience: '',
    mainObjective: 'leads',
    location: '',
    tone: 'professional',
    budget: undefined
  });

  const industries = [
    'E-commerce',
    'SaaS/Logiciel',
    'Conseil',
    'Immobilier',
    'Santé/Bien-être',
    'Éducation',
    'Finance',
    'Restauration',
    'Mode/Beauté',
    'Technologie',
    'Services',
    'Autre'
  ];

  const objectives = [
    { value: 'leads', label: 'Générer des prospects' },
    { value: 'sales', label: 'Augmenter les ventes' },
    { value: 'awareness', label: 'Améliorer la notoriété' },
    { value: 'engagement', label: 'Engager ma communauté' }
  ];

  const tones = [
    { value: 'friendly', label: 'Amical et décontracté' },
    { value: 'professional', label: 'Professionnel et sérieux' },
    { value: 'luxury', label: 'Premium et luxueux' },
    { value: 'young', label: 'Jeune et moderne' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof BusinessForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-3 rounded-2xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Générez votre One Page Marketing Plan
        </h1>
        <p className="text-gray-600">
          Remplissez ce formulaire et notre IA créera une stratégie marketing complète pour votre entreprise
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Name */}
          <div className="md:col-span-2">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Building2 className="w-4 h-4 mr-2 text-violet-500" />
              Nom de votre entreprise
            </label>
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-colors"
              placeholder="Ex: TechSolutions"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Secteur d&apos;activité
            </label>
            <select
              required
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-colors"
            >
              <option value="">Sélectionnez votre secteur</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          {/* Main Objective */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Target className="w-4 h-4 mr-2 text-violet-500" />
              Objectif principal
            </label>
            <select
              value={formData.mainObjective}
              onChange={(e) => handleInputChange('mainObjective', e.target.value as BusinessForm['mainObjective'])}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-colors"
            >
              {objectives.map(obj => (
                <option key={obj.value} value={obj.value}>{obj.label}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 mr-2 text-violet-500" />
              Localisation
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-colors"
              placeholder="Ex: Paris, France"
            />
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ton de communication
            </label>
            <select
              value={formData.tone}
              onChange={(e) => handleInputChange('tone', e.target.value as BusinessForm['tone'])}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-colors"
            >
              {tones.map(tone => (
                <option key={tone.value} value={tone.value}>{tone.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product or Service */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Décrivez votre produit ou service
          </label>
          <textarea
            required
            rows={4}
            value={formData.productOrService}
            onChange={(e) => handleInputChange('productOrService', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-colors resize-none"
            placeholder="Décrivez ce que vous vendez, ses avantages principaux et ce qui vous différencie..."
          />
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Audience cible
          </label>
          <textarea
            required
            rows={3}
            value={formData.targetAudience}
            onChange={(e) => handleInputChange('targetAudience', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-colors resize-none"
            placeholder="Qui sont vos clients idéaux ? Âge, profession, intérêts, problèmes qu'ils rencontrent..."
          />
        </div>

        {/* Budget (optional) */}
        <div>
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 mr-2 text-violet-500" />
            Budget marketing mensuel (optionnel)
          </label>
          <input
            type="number"
            min="0"
            value={formData.budget || ''}
            onChange={(e) => handleInputChange('budget', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-colors"
            placeholder="Ex: 1000"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Génération en cours...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Générer ma stratégie complète
            </>
          )}
        </button>
      </form>
    </div>
  );
};
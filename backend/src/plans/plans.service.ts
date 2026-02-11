import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Plan, PlanDocument, PlanType } from './entities/plan.entity';

@Injectable()
export class PlansService implements OnModuleInit {
  constructor(
    @InjectModel(Plan.name) private planModel: Model<PlanDocument>,
  ) {}

  async onModuleInit() {
    // Initialiser les plans par défaut au démarrage
    await this.initializeDefaultPlans();
  }

  // 🔍 RÉCUPÉRATION DES PLANS
  async getAllPlans(): Promise<PlanDocument[]> {
    return this.planModel
      .find({ isActive: true })
      .sort({ sortOrder: 1 })
      .exec();
  }

  async getPlanByType(type: PlanType): Promise<PlanDocument | null> {
    return this.planModel.findOne({ type, isActive: true }).exec();
  }

  async getPlanFeatures(type: PlanType): Promise<any> {
    const plan = await this.getPlanByType(type);
    if (!plan) {
      return this.getDefaultPlanFeatures(type);
    }
    return plan.features;
  }

  // 📊 INFORMATIONS TARIFAIRES
  async getPricingInfo(): Promise<any> {
    const plans = await this.getAllPlans();
    
    return plans.map(plan => ({
      type: plan.type,
      name: plan.name,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      features: plan.features,
      highlights: plan.highlights,
      savings: plan.yearlyPrice > 0 ? 
        Math.round(((plan.monthlyPrice * 12 - plan.yearlyPrice) / (plan.monthlyPrice * 12)) * 100) : 0
    }));
  }

  // 🔧 MÉTHODES UTILITAIRES
  private async initializeDefaultPlans(): Promise<void> {
    try {
      const existingPlans = await this.planModel.countDocuments();
      
      if (existingPlans === 0) {
        const defaultPlans = this.getDefaultPlans();
        await this.planModel.insertMany(defaultPlans);
        console.log('✅ Plans par défaut initialisés');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des plans:', error);
    }
  }

  private getDefaultPlans() {
    return [
      {
        type: 'free',
        name: 'Free',
        description: 'Parfait pour débuter avec les fonctionnalités de base',
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: {
          maxStrategiesPerMonth: 3,
          maxPublicationsPerMonth: 10,
          maxSwotPerMonth: 3,
          maxPdfExportsPerMonth: 3,
          maxTeamMembers: 1,
          prioritySupport: false,
          customBranding: false,
          apiAccess: false,
          advancedAnalytics: false,
          unlimitedExports: false,
        },
        highlights: [
          '3 stratégies par mois',
          '10 publications par mois',
          '3 analyses SWOT',
          'Support communautaire'
        ],
        isActive: true,
        sortOrder: 1,
      },
      {
        type: 'pro',
        name: 'Pro',
        description: 'Pour les professionnels qui ont besoin de plus de fonctionnalités',
        monthlyPrice: 29.99,
        yearlyPrice: 299.99,
        features: {
          maxStrategiesPerMonth: 25,
          maxPublicationsPerMonth: 100,
          maxSwotPerMonth: 25,
          maxPdfExportsPerMonth: 25,
          maxTeamMembers: 5,
          prioritySupport: true,
          customBranding: false,
          apiAccess: false,
          advancedAnalytics: true,
          unlimitedExports: false,
        },
        highlights: [
          '25 stratégies par mois',
          '100 publications par mois',
          'Équipe jusqu\'à 5 membres',
          'Analyses avancées',
          'Support prioritaire',
          'Économisez 17% sur l\'abonnement annuel'
        ],
        isActive: true,
        sortOrder: 2,
      },
      {
        type: 'business',
        name: 'Business',
        description: 'Solution complète pour les équipes et entreprises',
        monthlyPrice: 99.99,
        yearlyPrice: 999.99,
        features: {
          maxStrategiesPerMonth: -1, // illimité
          maxPublicationsPerMonth: -1, // illimité
          maxSwotPerMonth: -1, // illimité
          maxPdfExportsPerMonth: -1, // illimité
          maxTeamMembers: 50,
          prioritySupport: true,
          customBranding: true,
          apiAccess: true,
          advancedAnalytics: true,
          unlimitedExports: true,
        },
        highlights: [
          'Stratégies illimitées',
          'Publications illimitées',
          'Équipe jusqu\'à 50 membres',
          'Marque personnalisée',
          'Accès API',
          'Support dédié',
          'Économisez 17% sur l\'abonnement annuel'
        ],
        isActive: true,
        sortOrder: 3,
      },
    ];
  }

  private getDefaultPlanFeatures(type: PlanType) {
    const defaultFeatures = {
      free: {
        maxStrategiesPerMonth: 3,
        maxPublicationsPerMonth: 10,
        maxSwotPerMonth: 3,
        maxPdfExportsPerMonth: 3,
        maxTeamMembers: 1,
        prioritySupport: false,
        customBranding: false,
        apiAccess: false,
        advancedAnalytics: false,
        unlimitedExports: false,
      },
      pro: {
        maxStrategiesPerMonth: 25,
        maxPublicationsPerMonth: 100,
        maxSwotPerMonth: 25,
        maxPdfExportsPerMonth: 25,
        maxTeamMembers: 5,
        prioritySupport: true,
        customBranding: false,
        apiAccess: false,
        advancedAnalytics: true,
        unlimitedExports: false,
      },
      business: {
        maxStrategiesPerMonth: -1,
        maxPublicationsPerMonth: -1,
        maxSwotPerMonth: -1,
        maxPdfExportsPerMonth: -1,
        maxTeamMembers: 50,
        prioritySupport: true,
        customBranding: true,
        apiAccess: true,
        advancedAnalytics: true,
        unlimitedExports: true,
      },
    };

    return defaultFeatures[type];
  }

  // 📋 COMPARAISON DE PLANS
  async comparePlans(): Promise<any> {
    const plans = await this.getAllPlans();
    
    const features = [
      { key: 'maxStrategiesPerMonth', name: 'Stratégies par mois', type: 'limit' },
      { key: 'maxPublicationsPerMonth', name: 'Publications par mois', type: 'limit' },
      { key: 'maxSwotPerMonth', name: 'Analyses SWOT par mois', type: 'limit' },
      { key: 'maxPdfExportsPerMonth', name: 'Exports PDF par mois', type: 'limit' },
      { key: 'maxTeamMembers', name: 'Membres d\'équipe', type: 'number' },
      { key: 'prioritySupport', name: 'Support prioritaire', type: 'boolean' },
      { key: 'customBranding', name: 'Marque personnalisée', type: 'boolean' },
      { key: 'apiAccess', name: 'Accès API', type: 'boolean' },
      { key: 'advancedAnalytics', name: 'Analyses avancées', type: 'boolean' },
      { key: 'unlimitedExports', name: 'Exports illimités', type: 'boolean' },
    ];

    return {
      plans: plans.map(plan => ({
        type: plan.type,
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
      })),
      features: features.map(feature => ({
        name: feature.name,
        values: plans.map(plan => {
          const value = plan.features[feature.key];
          if (feature.type === 'limit' && value === -1) {
            return 'Illimité';
          }
          if (feature.type === 'boolean') {
            return value ? '✅' : '❌';
          }
          return value;
        })
      }))
    };
  }
}
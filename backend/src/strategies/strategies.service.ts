import { Injectable, ForbiddenException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Strategy, StrategyDocument, MainObjective, Tone } from './schemas/strategy.schema';
import { AiService } from '../ai/ai.service';
import { GenerateStrategyDto, RegenerateSectionDto, ImproveSectionDto } from './dto';
import { buildFullStrategyPrompt, buildRegenerateSectionPrompt, buildImproveSectionPrompt } from '../ai/prompts/strategy.prompts';

@Injectable()
export class StrategiesService {
  constructor(
    @InjectModel(Strategy.name) private strategyModel: Model<StrategyDocument>,
    private aiService: AiService,
  ) {}

  /**
   * Génère une stratégie marketing complète en utilisant l'IA
   */
  async generateFullStrategy(userId: string, dto: GenerateStrategyDto): Promise<StrategyDocument> {
    try {
      // Vérification du plan FREE : maximum 3 stratégies
      await this.checkFreePlanLimit(userId);

      // Construction des informations business depuis le DTO
      const businessInfo = {
        businessName: dto.businessName,
        industry: dto.industry,
        productOrService: dto.productOrService,
        targetAudience: dto.targetAudience,
        location: dto.location,
        mainObjective: dto.mainObjective,
        tone: dto.tone,
        budget: dto.budget,
      };

      // Construction du prompt pour l'IA
      const businessInfoForPrompt = {
        companyName: dto.businessName,
        industry: dto.industry,
        targetAudience: dto.targetAudience,
        products: dto.productOrService,
        objectives: this.getObjectiveDescription(dto.mainObjective),
        budget: dto.budget ? `${dto.budget}€` : 'Budget non spécifié',
        timeline: 'À définir selon les besoins',
      };

      const prompt = buildFullStrategyPrompt(businessInfoForPrompt);

      // Appel à l'IA avec parsing JSON automatique
      const generatedStrategy = await this.aiService.callNemotronAndParseJson(prompt);

      // Validation de la structure de réponse
      if (!generatedStrategy || !generatedStrategy.avant || !generatedStrategy.pendant || !generatedStrategy.apres) {
        throw new InternalServerErrorException('Format de réponse IA invalide');
      }

      // Transformation de la réponse IA vers le format MongoDB
      const strategyForMongo = this.transformAiResponseToMongoFormat(generatedStrategy);

      // Sauvegarde en base de données
      const strategyDocument = new this.strategyModel({
        userId: new Types.ObjectId(userId),
        businessInfo,
        generatedStrategy: strategyForMongo,
      });

      const savedStrategy = await strategyDocument.save();
      return savedStrategy;

    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      
      throw new InternalServerErrorException(
        `Erreur lors de la génération de la stratégie: ${error.message}`
      );
    }
  }

  /**
   * Récupère toutes les stratégies d'un utilisateur avec pagination
   */
  async findAll(userId: string, page: number = 1, limit: number = 10): Promise<{ strategies: StrategyDocument[], total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [strategies, total] = await Promise.all([
        this.strategyModel
          .find({ userId: new Types.ObjectId(userId) })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.strategyModel.countDocuments({ userId: new Types.ObjectId(userId) }),
      ]);

      return { strategies, total };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de la récupération des stratégies: ${error.message}`
      );
    }
  }

  /**
   * Récupère une stratégie spécifique par ID et userId
   */
  async findOne(userId: string, strategyId: string): Promise<StrategyDocument> {
    try {
      const strategy = await this.strategyModel
        .findOne({
          _id: new Types.ObjectId(strategyId),
          userId: new Types.ObjectId(userId),
        })
        .exec();

      if (!strategy) {
        throw new NotFoundException('Stratégie non trouvée');
      }

      return strategy;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException(
        `Erreur lors de la récupération de la stratégie: ${error.message}`
      );
    }
  }

  /**
   * Supprime une stratégie spécifique
   */
  async deleteOne(userId: string, strategyId: string): Promise<void> {
    try {
      const result = await this.strategyModel
        .deleteOne({
          _id: new Types.ObjectId(strategyId),
          userId: new Types.ObjectId(userId),
        })
        .exec();

      if (result.deletedCount === 0) {
        throw new NotFoundException('Stratégie non trouvée ou déjà supprimée');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException(
        `Erreur lors de la suppression de la stratégie: ${error.message}`
      );
    }
  }

  /**
   * Vérifie la limite du plan FREE (maximum 3 stratégies)
   */
  private async checkFreePlanLimit(userId: string): Promise<void> {
    const strategiesCount = await this.strategyModel
      .countDocuments({ userId: new Types.ObjectId(userId) })
      .exec();

    if (strategiesCount >= 3) {
      throw new ForbiddenException(
        'Limite du plan gratuit atteinte (3 stratégies maximum). Veuillez passer à un plan premium.'
      );
    }
  }

  /**
   * Convertit l'enum MainObjective en description lisible
   */
  private getObjectiveDescription(objective: MainObjective): string {
    const descriptions = {
      [MainObjective.LEADS]: 'Génération de prospects qualifiés',
      [MainObjective.SALES]: 'Augmentation des ventes directes', 
      [MainObjective.AWARENESS]: 'Accroissement de la notoriété de marque',
      [MainObjective.ENGAGEMENT]: 'Amélioration de l\'engagement client',
    };

    return descriptions[objective] || objective;
  }

  /**
   * Transforme la réponse de l'IA au format MongoDB
   * Cette méthode peut être étendue pour mapper spécifiquement les champs
   */
  private transformAiResponseToMongoFormat(aiResponse: any): any {
    // Pour l'instant, on assume que l'IA retourne déjà le bon format
    // Cette méthode peut être étendue pour faire des transformations spécifiques
    return {
      avant: {
        marcheCible: this.ensureValidMarcheCible(aiResponse.avant?.marcheCible),
        messageMarketing: this.ensureValidMessageMarketing(aiResponse.avant?.messageMarketing),
        canauxCommunication: this.ensureValidCanauxCommunication(aiResponse.avant?.canauxCommunication),
      },
      pendant: {
        captureProspects: this.ensureValidCaptureProspects(aiResponse.pendant?.captureProspects),
        nurturing: this.ensureValidNurturing(aiResponse.pendant?.nurturing),
        conversion: this.ensureValidConversion(aiResponse.pendant?.conversion),
      },
      apres: {
        experienceClient: this.ensureValidExperienceClient(aiResponse.apres?.experienceClient),
        augmentationValeurClient: this.ensureValidAugmentationValeurClient(aiResponse.apres?.augmentationValeurClient),
        recommandation: this.ensureValidRecommandation(aiResponse.apres?.recommandation),
      },
    };
  }

  // Méthodes de validation/transformation pour chaque section
  private ensureValidMarcheCible(data: any) {
    return {
      persona: data?.persona || '',
      besoins: Array.isArray(data?.besoins) ? data.besoins : [],
      problemes: Array.isArray(data?.problemes) ? data.problemes : [],
      comportementDigital: Array.isArray(data?.comportementDigital) ? data.comportementDigital : [],
    };
  }

  private ensureValidMessageMarketing(data: any) {
    return {
      propositionValeur: data?.propositionValeur || '',
      messagePrincipal: data?.messagePrincipal || '',
      tonCommunication: data?.tonCommunication || '',
    };
  }

  private ensureValidCanauxCommunication(data: any) {
    return {
      plateformes: Array.isArray(data?.plateformes) ? data.plateformes : [],
      typesContenu: {
        instagram: Array.isArray(data?.typesContenu?.instagram) ? data.typesContenu.instagram : [],
        tiktok: Array.isArray(data?.typesContenu?.tiktok) ? data.typesContenu.tiktok : [],
        linkedin: Array.isArray(data?.typesContenu?.linkedin) ? data.typesContenu.linkedin : [],
        facebook: Array.isArray(data?.typesContenu?.facebook) ? data.typesContenu.facebook : [],
      },
    };
  }

  private ensureValidCaptureProspects(data: any) {
    return {
      landingPage: data?.landingPage || '',
      formulaire: data?.formulaire || '',
      offreIncitative: Array.isArray(data?.offreIncitative) ? data.offreIncitative : [],
    };
  }

  private ensureValidNurturing(data: any) {
    return {
      sequenceEmails: Array.isArray(data?.sequenceEmails) ? data.sequenceEmails : [],
      contenusEducatifs: Array.isArray(data?.contenusEducatifs) ? data.contenusEducatifs : [],
      relances: Array.isArray(data?.relances) ? data.relances : [],
    };
  }

  private ensureValidConversion(data: any) {
    return {
      cta: Array.isArray(data?.cta) ? data.cta : [],
      offres: Array.isArray(data?.offres) ? data.offres : [],
      argumentaireVente: Array.isArray(data?.argumentaireVente) ? data.argumentaireVente : [],
    };
  }

  private ensureValidExperienceClient(data: any) {
    return {
      recommendations: Array.isArray(data?.recommendations) ? data.recommendations : [],
    };
  }

  private ensureValidAugmentationValeurClient(data: any) {
    return {
      upsell: Array.isArray(data?.upsell) ? data.upsell : [],
      crossSell: Array.isArray(data?.crossSell) ? data.crossSell : [],
      fidelite: Array.isArray(data?.fidelite) ? data.fidelite : [],
    };
  }

  private ensureValidRecommandation(data: any) {
    return {
      parrainage: Array.isArray(data?.parrainage) ? data.parrainage : [],
      avisClients: Array.isArray(data?.avisClients) ? data.avisClients : [],
      recompenses: Array.isArray(data?.recompenses) ? data.recompenses : [],
    };
  }

  /**
   * Régénère une section spécifique de la stratégie
   */
  async regenerateSection(userId: string, strategyId: string, dto: RegenerateSectionDto): Promise<StrategyDocument> {
    try {
      // Vérifier que la stratégie appartient à l'utilisateur
      const strategy = await this.findOne(userId, strategyId);

      // Récupérer la section existante
      const existingSection = this.getNestedValue(strategy.generatedStrategy, dto.sectionKey);
      if (!existingSection) {
        throw new NotFoundException(`Section "${dto.sectionKey}" non trouvée`);
      }

      // Construire les informations business pour le prompt
      const businessInfoForPrompt = {
        companyName: strategy.businessInfo.businessName,
        industry: strategy.businessInfo.industry,
        targetAudience: strategy.businessInfo.targetAudience,
        products: strategy.businessInfo.productOrService,
        objectives: this.getObjectiveDescription(strategy.businessInfo.mainObjective),
        budget: strategy.businessInfo.budget ? `${strategy.businessInfo.budget}€` : 'Budget non spécifié',
      };

      // Construire le prompt de régénération
      const prompt = buildRegenerateSectionPrompt(
        businessInfoForPrompt,
        dto.sectionKey,
        dto.instruction || 'Régénérez cette section avec un contenu frais et innovant',
        existingSection
      );

      // Appel à l'IA avec parsing JSON automatique
      const newSectionData = await this.aiService.callNemotronAndParseJson(prompt);

      // Mettre à jour la section dans la stratégie
      const updatedStrategy = strategy.toObject();
      this.setNestedValue(updatedStrategy.generatedStrategy, dto.sectionKey, newSectionData);

      // Sauvegarder les modifications
      const result = await this.strategyModel
        .findOneAndUpdate(
          {
            _id: new Types.ObjectId(strategyId),
            userId: new Types.ObjectId(userId),
          },
          { generatedStrategy: updatedStrategy.generatedStrategy },
          { new: true }
        )
        .exec();

      if (!result) {
        throw new NotFoundException('Stratégie non trouvée lors de la mise à jour');
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Erreur lors de la régénération de la section: ${error.message}`
      );
    }
  }

  /**
   * Améliore une section spécifique de la stratégie
   */
  async improveSection(userId: string, strategyId: string, dto: ImproveSectionDto): Promise<StrategyDocument> {
    try {
      // Vérifier que la stratégie appartient à l'utilisateur
      const strategy = await this.findOne(userId, strategyId);

      // Récupérer la section existante
      const existingSection = this.getNestedValue(strategy.generatedStrategy, dto.sectionKey);
      if (!existingSection) {
        throw new NotFoundException(`Section "${dto.sectionKey}" non trouvée`);
      }

      // Construire les informations business pour le prompt
      const businessInfoForPrompt = {
        companyName: strategy.businessInfo.businessName,
        industry: strategy.businessInfo.industry,
        targetAudience: strategy.businessInfo.targetAudience,
        products: strategy.businessInfo.productOrService,
        objectives: this.getObjectiveDescription(strategy.businessInfo.mainObjective),
        budget: strategy.businessInfo.budget ? `${strategy.businessInfo.budget}€` : 'Budget non spécifié',
      };

      // Construire le prompt d'amélioration
      const prompt = buildImproveSectionPrompt(
        businessInfoForPrompt,
        dto.sectionKey,
        dto.instruction || 'Améliorez cette section en la rendant plus précise et actionnable',
        existingSection
      );

      // Appel à l'IA avec parsing JSON automatique
      const improvedSectionData = await this.aiService.callNemotronAndParseJson(prompt);

      // Mettre à jour la section dans la stratégie
      const updatedStrategy = strategy.toObject();
      this.setNestedValue(updatedStrategy.generatedStrategy, dto.sectionKey, improvedSectionData);

      // Sauvegarder les modifications
      const result = await this.strategyModel
        .findOneAndUpdate(
          {
            _id: new Types.ObjectId(strategyId),
            userId: new Types.ObjectId(userId),
          },
          { generatedStrategy: updatedStrategy.generatedStrategy },
          { new: true }
        )
        .exec();

      if (!result) {
        throw new NotFoundException('Stratégie non trouvée lors de la mise à jour');
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Erreur lors de l'amélioration de la section: ${error.message}`
      );
    }
  }

  /**
   * Met à jour directement une section sans passer par l'IA
   */
  async updateSectionDirectly(userId: string, strategyId: string, sectionKey: string, data: any): Promise<StrategyDocument> {
    try {
      // Vérifier que la stratégie appartient à l'utilisateur
      const strategy = await this.findOne(userId, strategyId);

      // Vérifier que la section existe
      const existingSection = this.getNestedValue(strategy.generatedStrategy, sectionKey);
      if (existingSection === null) {
        throw new NotFoundException(`Section "${sectionKey}" non trouvée`);
      }

      // Mettre à jour la section dans la stratégie
      const updatedStrategy = strategy.toObject();
      this.setNestedValue(updatedStrategy.generatedStrategy, sectionKey, data);

      // Sauvegarder les modifications
      const result = await this.strategyModel
        .findOneAndUpdate(
          {
            _id: new Types.ObjectId(strategyId),
            userId: new Types.ObjectId(userId),
          },
          { generatedStrategy: updatedStrategy.generatedStrategy },
          { new: true }
        )
        .exec();

      if (!result) {
        throw new NotFoundException('Stratégie non trouvée lors de la mise à jour');
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Erreur lors de la mise à jour manuelle de la section: ${error.message}`
      );
    }
  }

  /**
   * Récupère une valeur nested dans un objet via une clé en notation dot
   */
  private getNestedValue(obj: any, sectionKey: string): any {
    return sectionKey.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * Définit une valeur nested dans un objet via une clé en notation dot
   */
  private setNestedValue(obj: any, sectionKey: string, value: any): void {
    const keys = sectionKey.split('.');
    const lastKey = keys.pop();
    
    if (!lastKey) {
      throw new Error('Section key invalide');
    }

    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);

    target[lastKey] = value;
  }
}
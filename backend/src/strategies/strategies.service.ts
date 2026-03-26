import {
  Injectable,
  ForbiddenException,
  HttpException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Strategy,
  StrategyDocument,
  MainObjective,
  Tone,
} from './schemas/strategy.schema';
import { AiService } from '../ai/ai.service';
import {
  GenerateStrategyDto,
  UpdateStrategyDto,
  RegenerateSectionDto,
  ImproveSectionDto,
  UpdateSectionDto,
} from './dto';
import {
  buildFullStrategyPrompt,
  buildRegenerateSectionPrompt,
  buildImproveSectionPrompt,
} from '../ai/prompts/strategy.prompts';
import { User, UserDocument } from '../users/entities/user.entity';
import { AiMonitoringService } from '../ai-monitoring/ai-monitoring.service';
import { AiFeatureType } from '../ai-monitoring/schemas/ai-log.schema';

type StrategyPhaseKey = 'avant' | 'pendant' | 'apres';

export interface StrategyPdfExportSection {
  key: string;
  title: string;
  content: unknown;
}

export interface StrategyPdfExportPhase {
  key: StrategyPhaseKey;
  title: string;
  subtitle: string;
  sections: StrategyPdfExportSection[];
}

export interface StrategyPdfExportPayload {
  strategyId: string;
  fileName: string;
  exportedAt: string;
  createdAt: string;
  updatedAt: string;
  businessInfo: {
    businessName: string;
    industry: string;
    productOrService: string;
    targetAudience: string;
    location: string;
    mainObjective: MainObjective;
    tone: Tone;
    budget?: number;
    language?: string;
  };
  phases: StrategyPdfExportPhase[];
}


@Injectable()
export class StrategiesService {
  constructor(
    @InjectModel(Strategy.name) private strategyModel: Model<StrategyDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private aiService: AiService,
    private readonly aiMonitoringService: AiMonitoringService,
  ) { }

  /**
   * Génère une stratégie marketing complète en utilisant l'IA
   */
  async generateFullStrategy(
    userId: string,
    dto: GenerateStrategyDto,
  ): Promise<StrategyDocument> {
    try {
      await this.checkFreePlanLimit(userId);

      const businessInfo = {
        businessName: dto.businessName,
        industry: dto.industry,
        productOrService: dto.productOrService,
        targetAudience: dto.targetAudience,
        location: dto.location,
        mainObjective: dto.mainObjective,
        tone: dto.tone,
        budget: dto.budget,
        language: dto.language,
      };

      const businessInfoForPrompt = {
        companyName: dto.businessName,
        industry: dto.industry,
        targetAudience: dto.targetAudience,
        products: dto.productOrService,
        objectives: this.getObjectiveDescription(dto.mainObjective),
        budget: dto.budget ? `${dto.budget}€` : 'Budget non specifie',
        timeline: 'A definir selon les besoins',
        language: dto.language,
      };

      const prompt = buildFullStrategyPrompt(businessInfoForPrompt);

      const strategyForMongo = await this.executeAiCallWithMonitoring({
        userId,
        featureType: 'strategy',
        actionType: 'generate_full_strategy',
        inputSummary: prompt,
        execute: async () => {
          const aiResponse = await this.aiService.callNemotronAndParseJson(
            prompt,
          ) as Record<string, unknown>;

          if (!aiResponse || !aiResponse['avant'] || !aiResponse['pendant'] || !aiResponse['apres']) {
            throw new InternalServerErrorException('Format de reponse IA invalide');
          }

          return this.transformAiResponseToMongoFormat(aiResponse);
        },
      });

      const strategyDocument = new this.strategyModel({
        userId: new Types.ObjectId(userId),
        businessInfo,
        generatedStrategy: strategyForMongo,
      });

      return await strategyDocument.save();
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof HttpException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Erreur lors de la generation de la strategie: ${error.message}`,
      );
    }
  }
  /**
   * Récupère toutes les stratégies d'un utilisateur avec pagination
   */
  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ strategies: StrategyDocument[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [strategies, total] = await Promise.all([
        this.strategyModel
          .find({ userId: new Types.ObjectId(userId) })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.strategyModel.countDocuments({
          userId: new Types.ObjectId(userId),
        }),
      ]);

      return { strategies, total };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de la récupération des stratégies: ${error.message}`,
      );
    }
  }

  /**
   * Récupère toutes les stratégies pour l'admin avec pagination et recherche.
   */
  async findAllForAdmin(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ strategies: StrategyDocument[]; total: number }> {
    try {
      const validatedPage = Math.max(1, page);
      const validatedLimit = Math.min(100, Math.max(1, limit));
      const skip = (validatedPage - 1) * validatedLimit;
      const filters = await this.buildAdminSearchFilter(search);

      const [strategies, total] = await Promise.all([
        this.strategyModel
          .find(filters)
          .select('userId businessInfo createdAt updatedAt')
          .populate('userId', 'fullName email companyName role')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(validatedLimit)
          .exec(),
        this.strategyModel.countDocuments(filters).exec(),
      ]);

      return { strategies, total };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de la récupération admin des stratégies: ${error.message}`,
      );
    }
  }

  /**
   * Récupère une stratégie précise pour l'admin.
   */
  async findOneForAdmin(strategyId: string): Promise<StrategyDocument> {
    try {
      const strategy = await this.strategyModel
        .findById(new Types.ObjectId(strategyId))
        .populate('userId', 'fullName email companyName role phone')
        .exec();

      if (!strategy) {
        throw new NotFoundException('Strategie non trouvee');
      }

      return strategy;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Erreur lors de la récupération admin de la stratégie: ${error.message}`,
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
        `Erreur lors de la récupération de la stratégie: ${error.message}`,
      );
    }
  }

  /**
   * Construit la charge utile pour export PDF d'une stratégie
   */
  async buildPdfExportPayload(
    userId: string,
    strategyId: string,
  ): Promise<StrategyPdfExportPayload> {
    const strategy = await this.findOne(userId, strategyId);
    const nowIso = new Date().toISOString();
    const createdAt = strategy.createdAt
      ? new Date(strategy.createdAt).toISOString()
      : nowIso;
    const updatedAt = strategy.updatedAt
      ? new Date(strategy.updatedAt).toISOString()
      : createdAt;

    const phases: StrategyPdfExportPhase[] = [
      {
        key: 'avant',
        title: 'Avant',
        subtitle: 'Attirer et positionner la marque',
        sections: [
          {
            key: 'marcheCible',
            title: 'Marche cible',
            content: strategy.generatedStrategy?.avant?.marcheCible ?? null,
          },
          {
            key: 'messageMarketing',
            title: 'Message marketing',
            content:
              strategy.generatedStrategy?.avant?.messageMarketing ?? null,
          },
          {
            key: 'canauxCommunication',
            title: 'Canaux de communication',
            content:
              strategy.generatedStrategy?.avant?.canauxCommunication ?? null,
          },
        ],
      },
      {
        key: 'pendant',
        title: 'Pendant',
        subtitle: 'Convertir et faire progresser les prospects',
        sections: [
          {
            key: 'captureProspects',
            title: 'Capture de prospects',
            content:
              strategy.generatedStrategy?.pendant?.captureProspects ?? null,
          },
          {
            key: 'nurturing',
            title: 'Nurturing',
            content: strategy.generatedStrategy?.pendant?.nurturing ?? null,
          },
          {
            key: 'conversion',
            title: 'Conversion',
            content: strategy.generatedStrategy?.pendant?.conversion ?? null,
          },
        ],
      },
      {
        key: 'apres',
        title: 'Apres',
        subtitle: 'Fideliser et activer la recommandation',
        sections: [
          {
            key: 'experienceClient',
            title: 'Experience client',
            content:
              strategy.generatedStrategy?.apres?.experienceClient ?? null,
          },
          {
            key: 'augmentationValeurClient',
            title: 'Augmentation de la valeur client',
            content:
              strategy.generatedStrategy?.apres?.augmentationValeurClient ??
              null,
          },
          {
            key: 'recommandation',
            title: 'Recommandation',
            content: strategy.generatedStrategy?.apres?.recommandation ?? null,
          },
        ],
      },
    ];

    return {
      strategyId: strategyId.toString(),
      fileName: this.buildPdfFileName(strategy.businessInfo.businessName),
      exportedAt: nowIso,
      createdAt,
      updatedAt,
      businessInfo: {
        businessName: strategy.businessInfo.businessName,
        industry: strategy.businessInfo.industry,
        productOrService: strategy.businessInfo.productOrService,
        targetAudience: strategy.businessInfo.targetAudience,
        location: strategy.businessInfo.location,
        mainObjective: strategy.businessInfo.mainObjective,
        tone: strategy.businessInfo.tone,
        budget: strategy.businessInfo.budget,
        language: strategy.businessInfo.language,
      },
      phases,
    };
  }

  /**
   * Supprime une stratégie spécifique
   */
  async updateStrategy(
    userId: string,
    strategyId: string,
    dto: UpdateStrategyDto,
  ): Promise<StrategyDocument> {
    try {
      const updated = await this.strategyModel
        .findOneAndUpdate(
          {
            _id: new Types.ObjectId(strategyId),
            userId: new Types.ObjectId(userId),
          },
          {
            businessInfo: {
              businessName: dto.businessName,
              industry: dto.industry,
              productOrService: dto.productOrService,
              targetAudience: dto.targetAudience,
              location: dto.location,
              mainObjective: dto.mainObjective,
              tone: dto.tone,
              budget: dto.budget,
            },
          },
          { new: true, runValidators: true },
        )
        .exec();

      if (!updated) {
        throw new NotFoundException('Strategie non trouvee');
      }

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Erreur lors de la mise a jour de la strategie: ${error.message}`,
      );
    }
  }

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
        `Erreur lors de la suppression de la stratégie: ${error.message}`,
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
        'Limite du plan gratuit atteinte (3 stratégies maximum). Veuillez passer à un plan premium.',
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
      [MainObjective.ENGAGEMENT]: "Amélioration de l'engagement client",
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
        messageMarketing: this.ensureValidMessageMarketing(
          aiResponse.avant?.messageMarketing,
        ),
        canauxCommunication: this.ensureValidCanauxCommunication(
          aiResponse.avant?.canauxCommunication,
        ),
      },
      pendant: {
        captureProspects: this.ensureValidCaptureProspects(
          aiResponse.pendant?.captureProspects,
        ),
        nurturing: this.ensureValidNurturing(aiResponse.pendant?.nurturing),
        conversion: this.ensureValidConversion(aiResponse.pendant?.conversion),
      },
      apres: {
        experienceClient: this.ensureValidExperienceClient(
          aiResponse.apres?.experienceClient,
        ),
        augmentationValeurClient: this.ensureValidAugmentationValeurClient(
          aiResponse.apres?.augmentationValeurClient,
        ),
        recommandation: this.ensureValidRecommandation(
          aiResponse.apres?.recommandation,
        ),
      },
    };
  }

  // Méthodes de validation/transformation pour chaque section
  private ensureValidMarcheCible(data: any) {
    if (
      !data ||
      !data.persona ||
      !data.besoins ||
      !data.problemes ||
      !data.comportementDigital
    ) {
      throw new InternalServerErrorException(
        'Données marché cible incomplètes dans la réponse IA',
      );
    }
    return {
      persona: data.persona,
      besoins: Array.isArray(data.besoins) ? data.besoins : [],
      problemes: Array.isArray(data.problemes) ? data.problemes : [],
      comportementDigital: Array.isArray(data.comportementDigital)
        ? data.comportementDigital
        : [],
    };
  }

  private ensureValidMessageMarketing(data: any) {
    if (
      !data ||
      !data.propositionValeur ||
      !data.messagePrincipal ||
      !data.tonCommunication
    ) {
      throw new InternalServerErrorException(
        'Données message marketing incomplètes dans la réponse IA',
      );
    }
    return {
      propositionValeur: data.propositionValeur,
      messagePrincipal: data.messagePrincipal,
      tonCommunication: data.tonCommunication,
    };
  }

  private ensureValidCanauxCommunication(data: any) {
    if (!data || !data.plateformes || !data.typesContenu) {
      throw new InternalServerErrorException(
        'Données canaux communication incomplètes dans la réponse IA',
      );
    }
    return {
      plateformes: Array.isArray(data.plateformes) ? data.plateformes : [],
      typesContenu: {
        instagram: Array.isArray(data.typesContenu?.instagram)
          ? data.typesContenu.instagram
          : [],
        tiktok: Array.isArray(data.typesContenu?.tiktok)
          ? data.typesContenu.tiktok
          : [],
        linkedin: Array.isArray(data.typesContenu?.linkedin)
          ? data.typesContenu.linkedin
          : [],
        facebook: Array.isArray(data.typesContenu?.facebook)
          ? data.typesContenu.facebook
          : [],
      },
    };
  }

  private ensureValidCaptureProspects(data: any) {
    if (
      !data ||
      !data.landingPage ||
      !data.formulaire ||
      !data.offreIncitative
    ) {
      throw new InternalServerErrorException(
        'Données capture prospects incomplètes dans la réponse IA',
      );
    }
    return {
      landingPage: data.landingPage,
      formulaire: data.formulaire,
      offreIncitative: Array.isArray(data.offreIncitative)
        ? data.offreIncitative
        : [],
    };
  }

  private ensureValidNurturing(data: any) {
    if (
      !data ||
      !data.sequenceEmails ||
      !data.contenusEducatifs ||
      !data.relances
    ) {
      throw new InternalServerErrorException(
        'Données nurturing incomplètes dans la réponse IA',
      );
    }
    return {
      sequenceEmails: Array.isArray(data.sequenceEmails)
        ? data.sequenceEmails
        : [],
      contenusEducatifs: Array.isArray(data.contenusEducatifs)
        ? data.contenusEducatifs
        : [],
      relances: Array.isArray(data.relances) ? data.relances : [],
    };
  }

  private ensureValidConversion(data: any) {
    if (!data || !data.cta || !data.offres || !data.argumentaireVente) {
      throw new InternalServerErrorException(
        'Données conversion incomplètes dans la réponse IA',
      );
    }
    return {
      cta: Array.isArray(data.cta) ? data.cta : [],
      offres: Array.isArray(data.offres) ? data.offres : [],
      argumentaireVente: Array.isArray(data.argumentaireVente)
        ? data.argumentaireVente
        : [],
    };
  }

  private ensureValidExperienceClient(data: any) {
    if (!data || !data.recommendations) {
      throw new InternalServerErrorException(
        'Données expérience client incomplètes dans la réponse IA',
      );
    }
    return {
      recommendations: Array.isArray(data.recommendations)
        ? data.recommendations
        : [],
    };
  }

  private ensureValidAugmentationValeurClient(data: any) {
    if (!data || !data.upsell || !data.crossSell || !data.fidelite) {
      throw new InternalServerErrorException(
        'Données augmentation valeur client incomplètes dans la réponse IA',
      );
    }
    return {
      upsell: Array.isArray(data.upsell) ? data.upsell : [],
      crossSell: Array.isArray(data.crossSell) ? data.crossSell : [],
      fidelite: Array.isArray(data.fidelite) ? data.fidelite : [],
    };
  }

  private ensureValidRecommandation(data: any) {
    if (!data || !data.parrainage || !data.avisClients || !data.recompenses) {
      throw new InternalServerErrorException(
        'Données recommandation incomplètes dans la réponse IA',
      );
    }
    return {
      parrainage: Array.isArray(data.parrainage) ? data.parrainage : [],
      avisClients: Array.isArray(data.avisClients) ? data.avisClients : [],
      recompenses: Array.isArray(data.recompenses) ? data.recompenses : [],
    };
  }

  /**
   * Régénère une section spécifique de la stratégie
   */
  async regenerateSection(
    userId: string,
    strategyId: string,
    dto: RegenerateSectionDto,
  ): Promise<StrategyDocument> {
    try {
      // Vérifier que la stratégie appartient à l'utilisateur
      const strategy = await this.findOne(userId, strategyId);

      // Récupérer la section existante
      const existingSection = this.getNestedValue(
        strategy.generatedStrategy,
        dto.sectionKey,
      );
      if (!existingSection) {
        throw new NotFoundException(`Section "${dto.sectionKey}" non trouvée`);
      }

      // Construire les informations business pour le prompt
      const businessInfoForPrompt = {
        companyName: strategy.businessInfo.businessName,
        industry: strategy.businessInfo.industry,
        targetAudience: strategy.businessInfo.targetAudience,
        products: strategy.businessInfo.productOrService,
        objectives: this.getObjectiveDescription(
          strategy.businessInfo.mainObjective,
        ),
        budget: strategy.businessInfo.budget
          ? `${strategy.businessInfo.budget}€`
          : 'Budget non spécifié',
        language: strategy.businessInfo.language,
      };

      // Construire le prompt de régénération
      const prompt = buildRegenerateSectionPrompt(
        businessInfoForPrompt,
        dto.sectionKey,
        dto.instruction ||
        'Régénérez cette section avec un contenu frais et innovant',
        existingSection,
      );

      // Appel à l'IA avec parsing JSON automatique
      const newSectionData = await this.executeAiCallWithMonitoring({
        userId,
        featureType: 'strategy',
        actionType: 'regenerate_section',
        relatedEntityId: strategyId,
        inputSummary: {
          sectionKey: dto.sectionKey,
          instruction:
            dto.instruction ||
            'Regenerate this section with fresh and actionable content',
          prompt,
        },
        execute: () => this.aiService.callNemotronAndParseJson(prompt),
      });

      // Mettre à jour la section dans la stratégie
      const updatedStrategy = strategy.toObject();
      this.setNestedValue(
        updatedStrategy.generatedStrategy,
        dto.sectionKey,
        newSectionData,
      );

      // Sauvegarder les modifications
      const result = await this.strategyModel
        .findOneAndUpdate(
          {
            _id: new Types.ObjectId(strategyId),
            userId: new Types.ObjectId(userId),
          },
          { generatedStrategy: updatedStrategy.generatedStrategy },
          { new: true },
        )
        .exec();

      if (!result) {
        throw new NotFoundException(
          'Stratégie non trouvée lors de la mise à jour',
        );
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Erreur lors de la régénération de la section: ${error.message}`,
      );
    }
  }

  /**
   * Améliore une section spécifique de la stratégie
   */
  async improveSection(
    userId: string,
    strategyId: string,
    dto: ImproveSectionDto,
  ): Promise<StrategyDocument> {
    try {
      // Vérifier que la stratégie appartient à l'utilisateur
      const strategy = await this.findOne(userId, strategyId);

      // Récupérer la section existante
      const existingSection = this.getNestedValue(
        strategy.generatedStrategy,
        dto.sectionKey,
      );
      if (!existingSection) {
        throw new NotFoundException(`Section "${dto.sectionKey}" non trouvée`);
      }

      // Construire les informations business pour le prompt
      const businessInfoForPrompt = {
        companyName: strategy.businessInfo.businessName,
        industry: strategy.businessInfo.industry,
        targetAudience: strategy.businessInfo.targetAudience,
        products: strategy.businessInfo.productOrService,
        objectives: this.getObjectiveDescription(
          strategy.businessInfo.mainObjective,
        ),
        budget: strategy.businessInfo.budget
          ? `${strategy.businessInfo.budget}€`
          : 'Budget non spécifié',
        language: strategy.businessInfo.language,
      };

      // Construire le prompt d'amélioration
      const prompt = buildImproveSectionPrompt(
        businessInfoForPrompt,
        dto.sectionKey,
        dto.instruction ||
        'Améliorez cette section en la rendant plus précise et actionnable',
        existingSection,
      );

      // Appel à l'IA avec parsing JSON automatique
      const improvedSectionData = await this.executeAiCallWithMonitoring({
        userId,
        featureType: 'strategy',
        actionType: 'improve_section',
        relatedEntityId: strategyId,
        inputSummary: {
          sectionKey: dto.sectionKey,
          instruction:
            dto.instruction ||
            'Improve this section with more precision and actionability',
          prompt,
        },
        execute: () => this.aiService.callNemotronAndParseJson(prompt),
      });

      // Mettre à jour la section dans la stratégie
      const updatedStrategy = strategy.toObject();
      this.setNestedValue(
        updatedStrategy.generatedStrategy,
        dto.sectionKey,
        improvedSectionData,
      );

      // Sauvegarder les modifications
      const result = await this.strategyModel
        .findOneAndUpdate(
          {
            _id: new Types.ObjectId(strategyId),
            userId: new Types.ObjectId(userId),
          },
          { generatedStrategy: updatedStrategy.generatedStrategy },
          { new: true },
        )
        .exec();

      if (!result) {
        throw new NotFoundException(
          'Stratégie non trouvée lors de la mise à jour',
        );
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Erreur lors de l'amélioration de la section: ${error.message}`,
      );
    }
  }

  /**
   * Met à jour directement une section sans passer par l'IA
   */
  async updateSection(
    userId: string,
    strategyId: string,
    dto: UpdateSectionDto,
  ): Promise<StrategyDocument> {
    try {
      // Vérifier que la stratégie appartient à l'utilisateur
      const strategy = await this.findOne(userId, strategyId);

      // Vérifier que la section existe
      const existingSection = this.getNestedValue(
        strategy.generatedStrategy,
        dto.sectionKey,
      );
      if (existingSection === null) {
        throw new NotFoundException(`Section "${dto.sectionKey}" non trouvée`);
      }

      // Mettre à jour la section dans la stratégie
      const updatedStrategy = strategy.toObject();
      this.setNestedValue(
        updatedStrategy.generatedStrategy,
        dto.sectionKey,
        dto.data,
      );

      // Sauvegarder les modifications
      const result = await this.strategyModel
        .findOneAndUpdate(
          {
            _id: new Types.ObjectId(strategyId),
            userId: new Types.ObjectId(userId),
          },
          { generatedStrategy: updatedStrategy.generatedStrategy },
          { new: true },
        )
        .exec();

      if (!result) {
        throw new NotFoundException(
          'Stratégie non trouvée lors de la mise à jour',
        );
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Erreur lors de la mise à jour manuelle de la section: ${error.message}`,
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

  private async buildAdminSearchFilter(
    search?: string,
  ): Promise<Record<string, unknown>> {
    const normalizedSearch = search?.trim();
    if (!normalizedSearch) {
      return {};
    }

    const safeSearch = this.escapeRegex(normalizedSearch);
    const regex = new RegExp(safeSearch, 'i');

    const matchedUsers = await this.userModel
      .find({
        $or: [
          { fullName: { $regex: regex } },
          { email: { $regex: regex } },
          { companyName: { $regex: regex } },
        ],
      })
      .select('_id')
      .lean()
      .exec();

    const matchedUserIds = matchedUsers.map((user) => user._id);
    const orFilters: Record<string, unknown>[] = [
      { 'businessInfo.businessName': { $regex: regex } },
      { 'businessInfo.industry': { $regex: regex } },
      { 'businessInfo.productOrService': { $regex: regex } },
    ];

    if (matchedUserIds.length > 0) {
      orFilters.push({ userId: { $in: matchedUserIds } });
    }

    return { $or: orFilters };
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private buildPdfFileName(businessName: string): string {
    const normalized = businessName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);

    const suffix = new Date().toISOString().slice(0, 10);
    const companyPart = normalized || 'strategie-marketing';
    return `${companyPart}-${suffix}.pdf`;
  }

  private async executeAiCallWithMonitoring<T>(params: {
    userId: string;
    featureType: AiFeatureType;
    actionType: string;
    relatedEntityId?: string;
    inputSummary?: unknown;
    execute: () => Promise<T>;
  }): Promise<T> {
    const startedAt = Date.now();

    try {
      const result = await params.execute();

      await this.aiMonitoringService.createLog({
        userId: params.userId,
        featureType: params.featureType,
        actionType: params.actionType,
        relatedEntityId: params.relatedEntityId,
        status: 'success',
        inputSummary: this.buildLogSummary(params.inputSummary),
        responseSummary: this.buildLogSummary(result),
        modelName: this.aiService.getModelName(),
        responseTimeMs: Date.now() - startedAt,
      });

      return result;
    } catch (error) {
      await this.aiMonitoringService.createLog({
        userId: params.userId,
        featureType: params.featureType,
        actionType: params.actionType,
        relatedEntityId: params.relatedEntityId,
        status: 'failed',
        inputSummary: this.buildLogSummary(params.inputSummary),
        modelName: this.aiService.getModelName(),
        responseTimeMs: Date.now() - startedAt,
        errorMessage: this.extractErrorMessage(error),
      });

      throw error;
    }
  }

  private buildLogSummary(payload: unknown, maxLength = 1200): string | undefined {
    if (payload === null || payload === undefined) {
      return undefined;
    }

    if (typeof payload === 'string') {
      const text = this.truncate(payload, maxLength);
      return text || undefined;
    }

    try {
      const text = this.truncate(JSON.stringify(payload), maxLength);
      return text || undefined;
    } catch {
      return undefined;
    }
  }

  private truncate(value: string, maxLength: number): string {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (!normalized) {
      return '';
    }

    if (normalized.length <= maxLength) {
      return normalized;
    }

    return `${normalized.slice(0, maxLength - 3)}...`;
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return this.truncate(error.message, 1200);
    }

    return this.truncate(String(error), 1200);
  }
}

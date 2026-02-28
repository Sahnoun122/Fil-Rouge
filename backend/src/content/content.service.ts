import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AiService } from '../ai/ai.service';
import {
  buildGenerateContentCampaignPrompt,
  buildRegeneratePlatformPrompt,
  buildRegenerateSinglePostPrompt,
} from '../ai/prompts/content.prompts';
import {
  Strategy,
  StrategyDocument,
} from '../strategies/schemas/strategy.schema';
import { User, UserDocument } from '../users/entities/user.entity';
import {
  ContentCampaignInputsDto,
  CreateContentCampaignDto,
  UpdateCampaignDto,
} from './dto';
import {
  CampaignSummary,
  ContentCampaign,
  ContentCampaignDocument,
  ContentCampaignInputs,
  ContentMode,
  ContentObjective,
  GeneratedPost,
} from './schemas/content-campaign.schema';

interface SchedulePayload {
  date: string;
  time: string;
}

interface PostSelector {
  postId?: string;
  index?: number;
}

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    @InjectModel(ContentCampaign.name)
    private readonly contentCampaignModel: Model<ContentCampaignDocument>,
    @InjectModel(Strategy.name)
    private readonly strategyModel: Model<StrategyDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly aiService: AiService,
  ) {}

  async createCampaign(
    userId: string,
    dto: CreateContentCampaignDto,
  ): Promise<ContentCampaignDocument> {
    const strategy = await this.getOwnedStrategyByIdOrThrow(
      userId,
      dto.strategyId,
    );
    const normalizedInputs = this.normalizeInputs(dto.inputs, dto.mode);
    const platforms = this.resolvePlatformsForCreation(
      strategy,
      normalizedInputs,
    );

    if (platforms.length === 0) {
      throw new BadRequestException(
        'Aucune plateforme trouvee: strategy.avant.canauxCommunication.plateformes est vide et inputs.platforms non fourni',
      );
    }

    const campaignDocument = new this.contentCampaignModel({
      userId: this.toObjectId(userId, 'userId'),
      strategyId: strategy._id,
      mode: dto.mode,
      name: this.resolveCampaignName(dto.name, strategy, dto.mode),
      objective: this.resolveObjective(strategy),
      platforms,
      inputs: normalizedInputs,
      campaignSummary: {
        contentPillars: normalizedInputs.contentPillars ?? [],
        postingPlan: {
          frequencyPerWeek: normalizedInputs.frequencyPerWeek,
        },
      },
      generatedPosts: [],
    });

    const savedCampaign = await campaignDocument.save();
    this.logger.log(
      `Campaign ${savedCampaign._id.toString()} created for user ${userId}`,
    );

    return savedCampaign;
  }

  async generateCampaign(
    userId: string,
    campaignId: string,
    instruction?: string,
  ): Promise<ContentCampaignDocument> {
    const campaign = await this.getOwnedCampaignOrThrow(userId, campaignId);
    const strategy = await this.getOwnedStrategyByIdOrThrow(
      userId,
      campaign.strategyId.toString(),
    );
    const generationPlatforms = this.resolvePlatformsForGeneration(
      strategy,
      campaign,
    );

    if (generationPlatforms.length === 0) {
      throw new BadRequestException(
        'Aucune plateforme trouvee pour la generation: strategy.avant.canauxCommunication.plateformes puis fallback inputs.platforms',
      );
    }

    try {
      const prompt = buildGenerateContentCampaignPrompt(
        strategy.generatedStrategy as unknown as Record<string, unknown>,
        strategy.businessInfo as unknown as Record<string, unknown>,
        campaign.mode,
        generationPlatforms,
        (campaign.inputs ?? {}) as unknown as Record<string, unknown>,
        instruction,
      );

      const aiResponse = await this.aiService.callNemotronAndParseJson(prompt);
      const generatedPosts = this.normalizeGeneratedPosts(
        aiResponse,
        generationPlatforms,
        {
          requireAllPlatforms: true,
        },
      );
      const campaignSummary = this.normalizeCampaignSummary(
        aiResponse,
        (campaign.inputs ?? {}) as unknown as Record<string, unknown>,
      );

      campaign.platforms = generationPlatforms;
      campaign.generatedPosts = generatedPosts;
      campaign.campaignSummary = campaignSummary;
      const savedCampaign = await campaign.save();

      this.logger.log(
        `Generated ${savedCampaign.generatedPosts.length} posts for campaign ${savedCampaign._id.toString()}`,
      );

      return savedCampaign;
    } catch (error) {
      this.logger.error(
        `Failed to generate posts for campaign ${campaignId}: ${error.message}`,
        error.stack,
      );
      throw this.wrapUnexpectedError(
        error,
        'Erreur lors de la generation du contenu',
      );
    }
  }

  async findAll(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ campaigns: ContentCampaignDocument[]; total: number }> {
    const sanitizedPage = Math.max(1, Number(page) || 1);
    const sanitizedLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    const skip = (sanitizedPage - 1) * sanitizedLimit;
    const ownerId = this.toObjectId(userId, 'userId');

    const [campaigns, total] = await Promise.all([
      this.contentCampaignModel
        .find({ userId: ownerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(sanitizedLimit)
        .exec(),
      this.contentCampaignModel.countDocuments({ userId: ownerId }).exec(),
    ]);

    return { campaigns, total };
  }

  async findOne(
    userId: string,
    campaignId: string,
  ): Promise<ContentCampaignDocument> {
    return this.getOwnedCampaignOrThrow(userId, campaignId);
  }

  async findAllForAdmin(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<{ campaigns: ContentCampaignDocument[]; total: number }> {
    const sanitizedPage = Math.max(1, Number(page) || 1);
    const sanitizedLimit = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (sanitizedPage - 1) * sanitizedLimit;
    const filters = await this.buildAdminSearchFilter(search);

    const [campaigns, total] = await Promise.all([
      this.contentCampaignModel
        .find(filters)
        .select(
          'userId strategyId name mode objective platforms campaignSummary generatedPosts createdAt updatedAt',
        )
        .populate('userId', 'fullName email companyName role')
        .populate(
          'strategyId',
          'businessInfo.businessName businessInfo.industry',
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(sanitizedLimit)
        .exec(),
      this.contentCampaignModel.countDocuments(filters).exec(),
    ]);

    return { campaigns, total };
  }

  async findOneForAdmin(campaignId: string): Promise<ContentCampaignDocument> {
    const campaignObjectId = this.toObjectId(campaignId, 'campaignId');
    const campaign = await this.contentCampaignModel
      .findById(campaignObjectId)
      .populate('userId', 'fullName email companyName role phone')
      .populate('strategyId', 'businessInfo.businessName businessInfo.industry')
      .exec();

    if (!campaign) {
      throw new NotFoundException('Campagne introuvable');
    }

    return campaign;
  }

  async updateCampaign(
    userId: string,
    campaignId: string,
    dto: UpdateCampaignDto,
  ): Promise<ContentCampaignDocument> {
    const campaign = await this.getOwnedCampaignOrThrow(userId, campaignId);

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (!name) {
        throw new BadRequestException(
          'Le nom de la campagne ne peut pas etre vide',
        );
      }
      campaign.name = name;
    }

    if (dto.inputs !== undefined) {
      campaign.inputs = this.normalizeInputs(dto.inputs, campaign.mode);
      const strategy = await this.getOwnedStrategyByIdOrThrow(
        userId,
        campaign.strategyId.toString(),
      );
      campaign.platforms = this.resolvePlatformsForGeneration(
        strategy,
        campaign,
      );
    }

    const savedCampaign = await campaign.save();
    this.logger.log(`Campaign ${campaignId} updated for user ${userId}`);
    return savedCampaign;
  }

  async regeneratePlatform(
    userId: string,
    campaignId: string,
    platform: string,
    instruction?: string,
  ): Promise<ContentCampaignDocument> {
    const campaign = await this.getOwnedCampaignOrThrow(userId, campaignId);
    const strategy = await this.getOwnedStrategyByIdOrThrow(
      userId,
      campaign.strategyId.toString(),
    );
    const generationPlatforms = this.resolvePlatformsForGeneration(
      strategy,
      campaign,
    );

    if (generationPlatforms.length === 0) {
      throw new BadRequestException(
        'Aucune plateforme trouvee pour la regeneration: strategy.avant.canauxCommunication.plateformes puis fallback inputs.platforms',
      );
    }

    const resolvedPlatform = this.resolveAllowedPlatform(
      platform,
      generationPlatforms,
    );

    if (!resolvedPlatform) {
      throw new BadRequestException(
        `Plateforme non autorisee: ${platform}. Plateformes valides: ${generationPlatforms.join(', ')}`,
      );
    }

    const existingPlatformPosts = campaign.generatedPosts.filter(
      (post) => post.platform.toLowerCase() === resolvedPlatform.toLowerCase(),
    );

    try {
      const prompt = buildRegeneratePlatformPrompt(
        strategy.generatedStrategy as unknown as Record<string, unknown>,
        strategy.businessInfo as unknown as Record<string, unknown>,
        campaign.mode,
        resolvedPlatform,
        existingPlatformPosts as unknown as Record<string, unknown>[],
        (campaign.inputs ?? {}) as unknown as Record<string, unknown>,
        instruction,
      );

      const aiResponse = await this.aiService.callNemotronAndParseJson(prompt);
      const regeneratedPlatformPosts = this.normalizeGeneratedPosts(
        aiResponse,
        generationPlatforms,
        {
          forcedPlatform: resolvedPlatform,
          requireAllPlatforms: true,
        },
      );

      const untouchedPosts = campaign.generatedPosts.filter(
        (post) =>
          post.platform.toLowerCase() !== resolvedPlatform.toLowerCase(),
      );

      campaign.platforms = generationPlatforms;
      campaign.generatedPosts = [
        ...untouchedPosts,
        ...regeneratedPlatformPosts,
      ];

      const savedCampaign = await campaign.save();
      this.logger.log(
        `Regenerated ${regeneratedPlatformPosts.length} posts for platform ${resolvedPlatform} in campaign ${campaignId}`,
      );

      return savedCampaign;
    } catch (error) {
      this.logger.error(
        `Failed to regenerate platform ${resolvedPlatform} for campaign ${campaignId}: ${error.message}`,
        error.stack,
      );
      throw this.wrapUnexpectedError(
        error,
        'Erreur lors de la regeneration de la plateforme',
      );
    }
  }

  async regeneratePost(
    userId: string,
    campaignId: string,
    selector: PostSelector,
    instruction?: string,
  ): Promise<ContentCampaignDocument> {
    const campaign = await this.getOwnedCampaignOrThrow(userId, campaignId);
    const strategy = await this.getOwnedStrategyByIdOrThrow(
      userId,
      campaign.strategyId.toString(),
    );

    if (!campaign.generatedPosts?.length) {
      throw new BadRequestException(
        'Aucun post disponible a regenerer pour cette campagne',
      );
    }

    const targetIndex = this.resolvePostIndex(campaign, selector);
    const existingPost = campaign.generatedPosts[targetIndex];
    const generationPlatforms = this.resolvePlatformsForGeneration(
      strategy,
      campaign,
    );
    const forcedPlatform =
      this.resolveAllowedPlatform(existingPost.platform, generationPlatforms) ??
      existingPost.platform;
    const singlePostPlatforms = this.mergeUniquePlatforms(generationPlatforms, [
      forcedPlatform,
    ]);

    try {
      const prompt = buildRegenerateSinglePostPrompt(
        strategy.generatedStrategy as unknown as Record<string, unknown>,
        strategy.businessInfo as unknown as Record<string, unknown>,
        campaign.mode,
        forcedPlatform,
        existingPost as unknown as Record<string, unknown>,
        (campaign.inputs ?? {}) as unknown as Record<string, unknown>,
        instruction,
      );

      const aiResponse = await this.aiService.callNemotronAndParseJson(prompt);
      const regeneratedPost = this.normalizeSinglePost(
        aiResponse,
        singlePostPlatforms,
        forcedPlatform,
      );

      const previousPostId = (
        existingPost as unknown as { _id?: Types.ObjectId }
      )._id;
      const replacement = {
        ...(regeneratedPost as unknown as Record<string, unknown>),
      };

      if (previousPostId) {
        replacement._id = previousPostId;
      }

      (campaign.generatedPosts as unknown as Array<Record<string, unknown>>)[
        targetIndex
      ] = replacement;
      campaign.platforms = this.mergeUniquePlatforms(
        campaign.platforms,
        generationPlatforms,
      );

      const savedCampaign = await campaign.save();
      this.logger.log(
        `Regenerated post #${targetIndex} for campaign ${campaignId}`,
      );

      return savedCampaign;
    } catch (error) {
      this.logger.error(
        `Failed to regenerate one post for campaign ${campaignId}: ${error.message}`,
        error.stack,
      );
      throw this.wrapUnexpectedError(
        error,
        'Erreur lors de la regeneration du post',
      );
    }
  }

  async deleteCampaign(userId: string, campaignId: string): Promise<void> {
    const campaign = await this.getOwnedCampaignOrThrow(userId, campaignId);
    await this.contentCampaignModel.deleteOne({ _id: campaign._id }).exec();
    this.logger.log(`Campaign ${campaignId} deleted by user ${userId}`);
  }

  private async getOwnedCampaignOrThrow(
    userId: string,
    campaignId: string,
  ): Promise<ContentCampaignDocument> {
    const campaignObjectId = this.toObjectId(campaignId, 'campaignId');
    const campaign = await this.contentCampaignModel
      .findById(campaignObjectId)
      .exec();

    if (!campaign) {
      throw new NotFoundException('Campagne introuvable');
    }

    if (campaign.userId.toString() !== userId) {
      throw new ForbiddenException(
        'Acces refuse: cette campagne ne vous appartient pas',
      );
    }

    return campaign;
  }

  private async getOwnedStrategyByIdOrThrow(
    userId: string,
    strategyId: string,
  ): Promise<StrategyDocument> {
    const strategyObjectId = this.toObjectId(strategyId, 'strategyId');
    const strategy = await this.strategyModel.findById(strategyObjectId).exec();

    if (!strategy) {
      throw new NotFoundException('Strategie introuvable');
    }

    if (strategy.userId.toString() !== userId) {
      throw new ForbiddenException(
        'Acces refuse: cette strategie ne vous appartient pas',
      );
    }

    return strategy;
  }

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} invalide`);
    }

    return new Types.ObjectId(value);
  }

  private extractPlatformsFromStrategy(strategy: StrategyDocument): string[] {
    const rawPlatforms = (
      strategy.generatedStrategy as unknown as {
        avant?: {
          canauxCommunication?: { plateformes?: unknown };
        };
      }
    )?.avant?.canauxCommunication?.plateformes;

    if (!Array.isArray(rawPlatforms)) {
      return [];
    }

    return this.normalizePlatforms(rawPlatforms);
  }

  private resolvePlatformsForCreation(
    strategy: StrategyDocument,
    inputs: ContentCampaignInputs,
  ): string[] {
    const inputsPlatforms = this.extractPlatformsFromInputs(inputs);
    if (inputsPlatforms.length > 0) {
      return inputsPlatforms;
    }

    const strategyPlatforms = this.extractPlatformsFromStrategy(strategy);
    if (strategyPlatforms.length > 0) {
      return strategyPlatforms;
    }

    return [];
  }

  private resolvePlatformsForGeneration(
    strategy: StrategyDocument,
    campaign: ContentCampaignDocument,
  ): string[] {
    const inputsPlatforms = this.extractPlatformsFromInputs(campaign.inputs);
    if (inputsPlatforms.length > 0) {
      return inputsPlatforms;
    }

    const strategyPlatforms = this.extractPlatformsFromStrategy(strategy);
    if (strategyPlatforms.length > 0) {
      return strategyPlatforms;
    }

    return this.normalizePlatforms(campaign.platforms ?? []);
  }

  private extractPlatformsFromInputs(inputs?: ContentCampaignInputs): string[] {
    if (!inputs) {
      return [];
    }

    return this.normalizePlatforms(inputs.platforms ?? []);
  }

  private normalizePlatforms(rawPlatforms: unknown[]): string[] {
    const deduped = new Map<string, string>();
    for (const rawPlatform of rawPlatforms) {
      if (typeof rawPlatform !== 'string') {
        continue;
      }
      const normalized = this.normalizePlatform(rawPlatform);
      if (!normalized) {
        continue;
      }
      deduped.set(normalized.toLowerCase(), normalized);
    }

    return Array.from(deduped.values());
  }

  private mergeUniquePlatforms(base: string[], extra: string[]): string[] {
    return this.normalizePlatforms([...(base ?? []), ...(extra ?? [])]);
  }

  private normalizePlatform(platform: string): string {
    const value = platform.trim();
    if (!value) {
      return '';
    }

    const lower = value.toLowerCase();
    if (lower.includes('instagram')) return 'Instagram';
    if (lower.includes('tiktok') || lower.includes('tik tok')) return 'TikTok';
    if (lower.includes('facebook')) return 'Facebook';
    if (lower.includes('linkedin')) return 'LinkedIn';
    if (lower === 'x' || lower.includes('twitter')) return 'X';
    if (lower.includes('youtube')) return 'YouTube';
    if (lower.includes('snapchat') || lower.includes('snap')) return 'Snapchat';
    if (lower.includes('pinterest')) return 'Pinterest';
    if (lower.includes('threads')) return 'Threads';

    return value
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  private resolveAllowedPlatform(
    platform: string,
    allowedPlatforms: string[],
  ): string | null {
    const normalizedRequested = this.normalizePlatform(platform);
    if (!normalizedRequested) {
      return null;
    }

    return (
      allowedPlatforms.find(
        (allowedPlatform) =>
          allowedPlatform.toLowerCase() === normalizedRequested.toLowerCase(),
      ) ?? null
    );
  }

  private resolveObjective(strategy: StrategyDocument): ContentObjective {
    const objective = String(
      strategy.businessInfo?.mainObjective ?? '',
    ).toLowerCase();

    if (objective === ContentObjective.LEADS) {
      return ContentObjective.LEADS;
    }
    if (objective === ContentObjective.SALES) {
      return ContentObjective.SALES;
    }
    if (objective === ContentObjective.AWARENESS) {
      return ContentObjective.AWARENESS;
    }
    if (objective === ContentObjective.ENGAGEMENT) {
      return ContentObjective.ENGAGEMENT;
    }

    return ContentObjective.AWARENESS;
  }

  private resolveCampaignName(
    requestedName: string | undefined,
    strategy: StrategyDocument,
    mode: ContentMode,
  ): string {
    const normalizedName = requestedName?.trim();
    if (normalizedName) {
      return normalizedName;
    }

    const businessName =
      strategy.businessInfo?.businessName?.trim() || 'Business';
    const modeLabel = mode === ContentMode.ADS ? 'Ads' : 'Content Marketing';
    return `${modeLabel} - ${businessName}`;
  }

  private normalizeInputs(
    inputs: ContentCampaignInputsDto | Record<string, unknown> | undefined,
    mode: ContentMode,
  ): ContentCampaignInputs {
    if (!inputs) {
      return {};
    }

    const inputsObject = inputs as Record<string, unknown>;

    const normalized: ContentCampaignInputs = {
      productOffer: this.normalizeOptionalString(inputsObject.productOffer),
      targetAudience: this.normalizeOptionalString(inputsObject.targetAudience),
      tone: this.normalizeOptionalString(inputsObject.tone),
      callToAction: this.normalizeOptionalString(inputsObject.callToAction),
      platforms: this.normalizePlatformsArray(
        inputsObject.platforms,
        'platforms',
      ),
    };

    const hasAdsFields =
      inputsObject.promoDetails !== undefined ||
      inputsObject.budget !== undefined;
    const hasContentMarketingFields =
      inputsObject.contentPillars !== undefined ||
      inputsObject.frequencyPerWeek !== undefined ||
      inputsObject.startDate !== undefined ||
      inputsObject.endDate !== undefined;

    if (mode === ContentMode.ADS && hasContentMarketingFields) {
      throw new BadRequestException(
        'Les champs contentPillars/frequencyPerWeek/startDate/endDate sont reserves au mode CONTENT_MARKETING',
      );
    }

    if (mode === ContentMode.CONTENT_MARKETING && hasAdsFields) {
      throw new BadRequestException(
        'Les champs promoDetails/budget sont reserves au mode ADS',
      );
    }

    if (mode === ContentMode.ADS) {
      normalized.promoDetails = this.normalizeOptionalString(
        inputsObject.promoDetails,
      );
      normalized.budget = this.normalizeOptionalNumber(
        inputsObject.budget,
        'budget',
      );
    }

    if (mode === ContentMode.CONTENT_MARKETING) {
      normalized.contentPillars = this.normalizeStringArray(
        inputsObject.contentPillars,
        30,
        'contentPillars',
      );
      normalized.frequencyPerWeek = this.normalizeOptionalInteger(
        inputsObject.frequencyPerWeek,
        'frequencyPerWeek',
        1,
        21,
      );
      normalized.startDate = this.normalizeOptionalDate(
        inputsObject.startDate,
        'startDate',
      );
      normalized.endDate = this.normalizeOptionalDate(
        inputsObject.endDate,
        'endDate',
      );

      if (normalized.startDate && normalized.endDate) {
        if (normalized.endDate.getTime() < normalized.startDate.getTime()) {
          throw new BadRequestException(
            'endDate doit etre posterieure a startDate',
          );
        }
      }
    }

    return normalized;
  }

  private normalizeOptionalString(value: unknown): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== 'string') {
      throw new BadRequestException('Valeur invalide: chaine attendue');
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  private normalizeOptionalNumber(
    value: unknown,
    fieldName: string,
  ): number | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    const parsedNumber = Number(value);
    if (!Number.isFinite(parsedNumber) || parsedNumber < 0) {
      throw new BadRequestException(
        `${fieldName} invalide: nombre positif attendu`,
      );
    }

    return parsedNumber;
  }

  private normalizeOptionalInteger(
    value: unknown,
    fieldName: string,
    min: number,
    max: number,
  ): number | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
      throw new BadRequestException(
        `${fieldName} invalide: entier entre ${min} et ${max} attendu`,
      );
    }

    return parsed;
  }

  private normalizeOptionalDate(
    value: unknown,
    fieldName: string,
  ): Date | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${fieldName} invalide: date attendue`);
    }

    return date;
  }

  private normalizePlatformsArray(
    value: unknown,
    fieldName: string,
  ): string[] | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (!Array.isArray(value)) {
      throw new BadRequestException(
        `Champ "${fieldName}" invalide: tableau attendu`,
      );
    }

    return this.normalizePlatforms(value);
  }

  private normalizeStringArray(
    value: unknown,
    maxItems: number,
    fieldName: string,
  ): string[] | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (!Array.isArray(value)) {
      throw new BadRequestException(
        `Champ "${fieldName}" invalide: tableau attendu`,
      );
    }

    if (value.length > maxItems) {
      throw new BadRequestException(
        `Champ "${fieldName}" invalide: maximum ${maxItems} elements`,
      );
    }

    return value.map((item, index) => {
      if (typeof item !== 'string') {
        throw new BadRequestException(
          `Champ "${fieldName}" invalide: element #${index + 1} doit etre une chaine`,
        );
      }
      return item.trim();
    });
  }

  private normalizeGeneratedPosts(
    payload: unknown,
    allowedPlatforms: string[],
    options?: { forcedPlatform?: string; requireAllPlatforms?: boolean },
  ): GeneratedPost[] {
    const generatedPosts = this.extractGeneratedPostsArray(payload);
    const normalizedPosts = generatedPosts.map((post, index) =>
      this.normalizeGeneratedPost(
        post,
        index,
        allowedPlatforms,
        options?.forcedPlatform,
      ),
    );

    if (normalizedPosts.length === 0) {
      throw new BadRequestException('Aucun post genere dans la reponse IA');
    }

    if (options?.requireAllPlatforms) {
      const requiredPlatforms = options.forcedPlatform
        ? [options.forcedPlatform]
        : allowedPlatforms;

      for (const platform of requiredPlatforms) {
        const hasPostForPlatform = normalizedPosts.some(
          (post) => post.platform.toLowerCase() === platform.toLowerCase(),
        );
        if (!hasPostForPlatform) {
          throw new BadRequestException(
            `La reponse IA ne contient pas de post pour la plateforme ${platform}`,
          );
        }
      }
    }

    return normalizedPosts;
  }

  private normalizeSinglePost(
    payload: unknown,
    allowedPlatforms: string[],
    forcedPlatform: string,
  ): GeneratedPost {
    const sourcePayload =
      (payload as { post?: unknown; generatedPost?: unknown })?.post ??
      (payload as { post?: unknown; generatedPost?: unknown })?.generatedPost ??
      payload;

    return this.normalizeGeneratedPost(
      sourcePayload,
      0,
      allowedPlatforms,
      forcedPlatform,
    );
  }

  private normalizeCampaignSummary(
    payload: unknown,
    inputs: Record<string, unknown> = {},
  ): CampaignSummary {
    const summaryPayload = this.extractCampaignSummaryPayload(payload);
    const aiPillars = this.normalizeLooseStringArray(
      summaryPayload.contentPillars,
    );
    const inputPillars = this.normalizeLooseStringArray(inputs.contentPillars);

    const contentPillars = (
      aiPillars.length > 0 ? aiPillars : inputPillars
    ).slice(0, 5);

    const postingPlan =
      summaryPayload.postingPlan &&
      typeof summaryPayload.postingPlan === 'object' &&
      !Array.isArray(summaryPayload.postingPlan)
        ? (summaryPayload.postingPlan as Record<string, unknown>)
        : {};

    const frequencyPerWeek =
      this.toInteger(postingPlan.frequencyPerWeek, 1, 21) ??
      this.toInteger(inputs.frequencyPerWeek, 1, 21) ??
      3;
    const durationWeeks =
      this.toPositiveInteger(postingPlan.durationWeeks) ??
      this.resolveDurationWeeks(inputs);

    return {
      contentPillars,
      postingPlan: {
        frequencyPerWeek,
        durationWeeks,
      },
    };
  }

  private extractCampaignSummaryPayload(
    payload: unknown,
  ): Record<string, unknown> {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return {};
    }

    const summary = (payload as { campaignSummary?: unknown }).campaignSummary;
    if (!summary || typeof summary !== 'object' || Array.isArray(summary)) {
      return {};
    }

    return summary as Record<string, unknown>;
  }

  private extractGeneratedPostsArray(payload: unknown): unknown[] {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException(
        'Format IA invalide: tableau de posts attendu',
      );
    }

    const objectPayload = payload as {
      generatedPosts?: unknown;
      posts?: unknown;
    };

    if (Array.isArray(objectPayload.generatedPosts)) {
      return objectPayload.generatedPosts;
    }

    if (Array.isArray(objectPayload.posts)) {
      return objectPayload.posts;
    }

    throw new BadRequestException(
      'Format IA invalide: generatedPosts/posts manquant',
    );
  }

  private normalizeGeneratedPost(
    postPayload: unknown,
    index: number,
    allowedPlatforms: string[],
    forcedPlatform?: string,
  ): GeneratedPost {
    if (
      !postPayload ||
      typeof postPayload !== 'object' ||
      Array.isArray(postPayload)
    ) {
      throw new BadRequestException(
        `Format IA invalide: generatedPosts[${index}] doit etre un objet`,
      );
    }

    const post = postPayload as Record<string, unknown>;

    const rawPlatform =
      forcedPlatform ?? this.normalizeOptionalString(post.platform);
    if (!rawPlatform) {
      throw new BadRequestException(
        `generatedPosts[${index}].platform est obligatoire`,
      );
    }

    const platform = this.resolveAllowedPlatform(rawPlatform, allowedPlatforms);
    if (!platform) {
      throw new BadRequestException(
        `generatedPosts[${index}].platform non autorisee: ${rawPlatform}`,
      );
    }

    const type =
      this.normalizeOptionalString(post.type) ??
      this.defaultTypeForPlatform(platform);
    const caption = this.extractRequiredString(
      post.caption,
      `generatedPosts[${index}].caption`,
    );

    const normalized: GeneratedPost = {
      platform,
      type,
      caption,
    };

    const description = this.normalizeOptionalString(post.description);
    if (description) normalized.description = description;

    const title = this.normalizeOptionalString(post.title);
    if (title) normalized.title = title;

    const hashtags = this.normalizeStringArray(post.hashtags, 30, 'hashtags');
    if (hashtags) normalized.hashtags = hashtags;

    const hook = this.normalizeOptionalString(post.hook);
    if (hook) normalized.hook = hook;

    const cta = this.normalizeOptionalString(post.cta);
    if (cta) normalized.cta = cta;

    const adCopyVariantA = this.normalizeOptionalString(post.adCopyVariantA);
    if (adCopyVariantA) normalized.adCopyVariantA = adCopyVariantA;

    const adCopyVariantB = this.normalizeOptionalString(post.adCopyVariantB);
    if (adCopyVariantB) normalized.adCopyVariantB = adCopyVariantB;

    const adCopyVariantC = this.normalizeOptionalString(post.adCopyVariantC);
    if (adCopyVariantC) normalized.adCopyVariantC = adCopyVariantC;

    const suggestedVisual = this.normalizeOptionalString(post.suggestedVisual);
    if (suggestedVisual) normalized.suggestedVisual = suggestedVisual;

    const schedule = this.normalizeSchedule(post.schedule);
    if (schedule) normalized.schedule = schedule;

    return normalized;
  }

  private normalizeSchedule(value: unknown): SchedulePayload | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new BadRequestException('schedule invalide: objet attendu');
    }

    const payload = value as { date?: unknown; time?: unknown };
    const date = this.normalizeOptionalString(payload.date);
    const time = this.normalizeOptionalString(payload.time);

    if (!date && !time) {
      return undefined;
    }

    if (!date || !time) {
      throw new BadRequestException(
        'schedule invalide: date et time sont requis',
      );
    }

    return { date, time };
  }

  private extractRequiredString(value: unknown, fieldName: string): string {
    if (typeof value !== 'string') {
      throw new BadRequestException(`${fieldName} est obligatoire`);
    }

    const normalized = value.trim();
    if (!normalized) {
      throw new BadRequestException(`${fieldName} ne peut pas etre vide`);
    }

    return normalized;
  }

  private defaultTypeForPlatform(platform: string): string {
    const lower = platform.toLowerCase();
    if (lower === 'instagram') return 'post';
    if (lower === 'tiktok') return 'tiktok';
    if (lower === 'facebook') return 'post';
    if (lower === 'linkedin') return 'post';
    if (lower === 'youtube') return 'short';
    if (lower === 'snapchat') return 'story';
    if (lower === 'pinterest') return 'pin';
    if (lower === 'threads') return 'thread';
    return 'post';
  }

  private resolvePostIndex(
    campaign: ContentCampaignDocument,
    selector: PostSelector,
  ): number {
    if (!selector?.postId && selector?.index === undefined) {
      throw new BadRequestException('postId ou index est requis');
    }

    if (selector.postId) {
      if (!Types.ObjectId.isValid(selector.postId)) {
        throw new BadRequestException('postId invalide');
      }

      const postIndex = campaign.generatedPosts.findIndex(
        (post) =>
          (post as unknown as { _id?: Types.ObjectId })._id?.toString() ===
          selector.postId,
      );

      if (postIndex < 0) {
        throw new NotFoundException('Post introuvable dans la campagne');
      }

      return postIndex;
    }

    const index = selector.index as number;
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= campaign.generatedPosts.length
    ) {
      throw new BadRequestException(
        `index invalide: valeur attendue entre 0 et ${campaign.generatedPosts.length - 1}`,
      );
    }

    return index;
  }

  private normalizeLooseStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const normalizedValues: string[] = [];
    for (const item of value) {
      if (typeof item !== 'string') {
        continue;
      }
      const normalized = item.trim();
      if (!normalized) {
        continue;
      }
      if (!normalizedValues.includes(normalized)) {
        normalizedValues.push(normalized);
      }
    }

    return normalizedValues;
  }

  private toInteger(
    value: unknown,
    min: number,
    max: number,
  ): number | undefined {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
      return undefined;
    }
    return parsed;
  }

  private toPositiveInteger(value: unknown): number | undefined {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return undefined;
    }
    return parsed;
  }

  private resolveDurationWeeks(inputs: Record<string, unknown>): number {
    const startDate = new Date(String(inputs?.startDate ?? ''));
    const endDate = new Date(String(inputs?.endDate ?? ''));

    if (
      !Number.isNaN(startDate.getTime()) &&
      !Number.isNaN(endDate.getTime())
    ) {
      const diffMs = endDate.getTime() - startDate.getTime();
      if (diffMs >= 0) {
        return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7)));
      }
    }

    return 4;
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

    const [matchedUsers, matchedStrategies] = await Promise.all([
      this.userModel
        .find({
          $or: [
            { fullName: { $regex: regex } },
            { email: { $regex: regex } },
            { companyName: { $regex: regex } },
          ],
        })
        .select('_id')
        .lean()
        .exec(),
      this.strategyModel
        .find({
          $or: [
            { 'businessInfo.businessName': { $regex: regex } },
            { 'businessInfo.industry': { $regex: regex } },
            { 'businessInfo.productOrService': { $regex: regex } },
          ],
        })
        .select('_id')
        .lean()
        .exec(),
    ]);

    const matchedUserIds = matchedUsers.map((user) => user._id);
    const matchedStrategyIds = matchedStrategies.map(
      (strategy) => strategy._id,
    );
    const orFilters: Record<string, unknown>[] = [
      { name: { $regex: regex } },
      { platforms: { $regex: regex } },
    ];

    if (matchedUserIds.length > 0) {
      orFilters.push({ userId: { $in: matchedUserIds } });
    }

    if (matchedStrategyIds.length > 0) {
      orFilters.push({ strategyId: { $in: matchedStrategyIds } });
    }

    return { $or: orFilters };
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private wrapUnexpectedError(error: unknown, message: string): Error {
    if (
      error instanceof BadRequestException ||
      error instanceof ForbiddenException ||
      error instanceof NotFoundException
    ) {
      return error;
    }

    return new InternalServerErrorException(message);
  }
}

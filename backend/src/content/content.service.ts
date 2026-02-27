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
  buildRegeneratePostPrompt,
} from '../ai/prompts/content.prompts';
import { Strategy, StrategyDocument } from '../strategies/schemas/strategy.schema';
import {
  ContentCampaignInputsDto,
  CreateContentCampaignDto,
  GenerateContentDto,
  RegeneratePlatformDto,
  RegeneratePostDto,
  UpdateCampaignDto,
} from './dto';
import {
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

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    @InjectModel(ContentCampaign.name)
    private readonly contentCampaignModel: Model<ContentCampaignDocument>,
    @InjectModel(Strategy.name)
    private readonly strategyModel: Model<StrategyDocument>,
    private readonly aiService: AiService,
  ) {}

  async createCampaign(
    userId: string,
    dto: CreateContentCampaignDto,
  ): Promise<ContentCampaignDocument> {
    const strategy = await this.getOwnedStrategyByIdOrThrow(userId, dto.strategyId);
    const platforms = this.extractPlatformsFromStrategy(strategy);

    if (platforms.length === 0) {
      throw new BadRequestException(
        'Aucune plateforme trouvee dans la strategie (avant.canauxCommunication.plateformes)',
      );
    }

    const campaignDocument = new this.contentCampaignModel({
      userId: this.toObjectId(userId, 'userId'),
      strategyId: strategy._id,
      mode: dto.mode,
      name: this.resolveCampaignName(dto.name, strategy, dto.mode),
      objective: this.resolveObjective(strategy),
      platforms,
      inputs: this.normalizeInputs(dto.inputs, dto.mode),
      generatedPosts: [],
    });

    const savedCampaign = await campaignDocument.save();
    this.logger.log(`Campaign ${savedCampaign._id.toString()} created for user ${userId}`);

    return savedCampaign;
  }

  async generateCampaign(
    userId: string,
    campaignId: string,
    dto: GenerateContentDto,
  ): Promise<ContentCampaignDocument> {
    const campaign = await this.getOwnedCampaignOrThrow(userId, campaignId);
    const strategy = await this.getOwnedStrategyByIdOrThrow(userId, campaign.strategyId.toString());

    try {
      const prompt = buildGenerateContentCampaignPrompt({
        mode: campaign.mode,
        objective: campaign.objective,
        platforms: campaign.platforms,
        businessInfo: strategy.businessInfo as unknown as Record<string, unknown>,
        strategy: strategy.generatedStrategy as unknown as Record<string, unknown>,
        inputs: (campaign.inputs ?? {}) as unknown as Record<string, unknown>,
        instruction: dto?.instruction,
      });

      const aiResponse = await this.aiService.callNemotronAndParseJson(prompt);
      const generatedPosts = this.normalizeGeneratedPosts(aiResponse, campaign.platforms, {
        requireAllPlatforms: true,
      });

      campaign.generatedPosts = generatedPosts as GeneratedPost[];
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
      throw this.wrapUnexpectedError(error, 'Erreur lors de la generation du contenu');
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

  async findOne(userId: string, campaignId: string): Promise<ContentCampaignDocument> {
    return this.getOwnedCampaignOrThrow(userId, campaignId);
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
        throw new BadRequestException('Le nom de la campagne ne peut pas etre vide');
      }
      campaign.name = name;
    }

    if (dto.inputs !== undefined) {
      campaign.inputs = this.normalizeInputs(dto.inputs, campaign.mode);
    }

    const savedCampaign = await campaign.save();
    this.logger.log(`Campaign ${campaignId} updated for user ${userId}`);
    return savedCampaign;
  }

  async regeneratePlatform(
    userId: string,
    campaignId: string,
    dto: RegeneratePlatformDto,
  ): Promise<ContentCampaignDocument> {
    const campaign = await this.getOwnedCampaignOrThrow(userId, campaignId);
    const strategy = await this.getOwnedStrategyByIdOrThrow(userId, campaign.strategyId.toString());
    const platform = this.resolveAllowedPlatform(dto.platform, campaign.platforms);

    if (!platform) {
      throw new BadRequestException(
        `Plateforme non autorisee pour cette campagne: ${dto.platform}`,
      );
    }

    const existingPlatformPosts = campaign.generatedPosts.filter(
      (post) => post.platform.toLowerCase() === platform.toLowerCase(),
    );

    try {
      const prompt = buildRegeneratePlatformPrompt({
        mode: campaign.mode,
        objective: campaign.objective,
        platforms: campaign.platforms,
        platform,
        businessInfo: strategy.businessInfo as unknown as Record<string, unknown>,
        strategy: strategy.generatedStrategy as unknown as Record<string, unknown>,
        inputs: (campaign.inputs ?? {}) as unknown as Record<string, unknown>,
        existingPlatformPosts:
          existingPlatformPosts as unknown as Record<string, unknown>[],
        instruction: dto.instruction,
      });

      const aiResponse = await this.aiService.callNemotronAndParseJson(prompt);
      const regeneratedPlatformPosts = this.normalizeGeneratedPosts(aiResponse, campaign.platforms, {
        forcedPlatform: platform,
        requireAllPlatforms: true,
      });

      const untouchedPosts = campaign.generatedPosts.filter(
        (post) => post.platform.toLowerCase() !== platform.toLowerCase(),
      );

      campaign.generatedPosts = [
        ...(untouchedPosts as GeneratedPost[]),
        ...(regeneratedPlatformPosts as GeneratedPost[]),
      ];

      const savedCampaign = await campaign.save();
      this.logger.log(
        `Regenerated ${regeneratedPlatformPosts.length} posts for platform ${platform} in campaign ${campaignId}`,
      );

      return savedCampaign;
    } catch (error) {
      this.logger.error(
        `Failed to regenerate platform ${platform} for campaign ${campaignId}: ${error.message}`,
        error.stack,
      );
      throw this.wrapUnexpectedError(error, 'Erreur lors de la regeneration de la plateforme');
    }
  }

  async regeneratePost(
    userId: string,
    campaignId: string,
    dto: RegeneratePostDto,
  ): Promise<ContentCampaignDocument> {
    const campaign = await this.getOwnedCampaignOrThrow(userId, campaignId);
    const strategy = await this.getOwnedStrategyByIdOrThrow(userId, campaign.strategyId.toString());

    if (!campaign.generatedPosts?.length) {
      throw new BadRequestException('Aucun post disponible a regenerer pour cette campagne');
    }

    const targetIndex = this.resolvePostIndex(campaign, dto);
    const existingPost = campaign.generatedPosts[targetIndex];

    try {
      const prompt = buildRegeneratePostPrompt({
        mode: campaign.mode,
        objective: campaign.objective,
        platforms: campaign.platforms,
        platform: existingPost.platform,
        businessInfo: strategy.businessInfo as unknown as Record<string, unknown>,
        strategy: strategy.generatedStrategy as unknown as Record<string, unknown>,
        inputs: (campaign.inputs ?? {}) as unknown as Record<string, unknown>,
        existingPost: existingPost as unknown as Record<string, unknown>,
        instruction: dto.instruction,
      });

      const aiResponse = await this.aiService.callNemotronAndParseJson(prompt);
      const regeneratedPost = this.normalizeSinglePost(
        aiResponse,
        campaign.platforms,
        existingPost.platform,
      );

      const previousPostId = (existingPost as unknown as { _id?: Types.ObjectId })._id;
      const replacement = {
        ...(regeneratedPost as unknown as Record<string, unknown>),
      };

      if (previousPostId) {
        replacement._id = previousPostId;
      }

      (campaign.generatedPosts as unknown as Array<Record<string, unknown>>)[targetIndex] =
        replacement;

      const savedCampaign = await campaign.save();
      this.logger.log(`Regenerated post #${targetIndex} for campaign ${campaignId}`);

      return savedCampaign;
    } catch (error) {
      this.logger.error(
        `Failed to regenerate one post for campaign ${campaignId}: ${error.message}`,
        error.stack,
      );
      throw this.wrapUnexpectedError(error, 'Erreur lors de la regeneration du post');
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
    const campaign = await this.contentCampaignModel.findById(campaignObjectId).exec();

    if (!campaign) {
      throw new NotFoundException('Campagne introuvable');
    }

    if (campaign.userId.toString() !== userId) {
      throw new ForbiddenException('Acces refuse: cette campagne ne vous appartient pas');
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
      throw new ForbiddenException('Acces refuse: cette strategie ne vous appartient pas');
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

    return value
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  private resolveAllowedPlatform(platform: string, allowedPlatforms: string[]): string | null {
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
    const objective = String(strategy.businessInfo?.mainObjective ?? '').toLowerCase();

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

    const businessName = strategy.businessInfo?.businessName?.trim() || 'Business';
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
    };

    const hasAdsFields =
      inputsObject.promoDetails !== undefined || inputsObject.budget !== undefined;
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
      normalized.promoDetails = this.normalizeOptionalString(inputsObject.promoDetails);
      normalized.budget = this.normalizeOptionalNumber(inputsObject.budget, 'budget');
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
      normalized.startDate = this.normalizeOptionalDate(inputsObject.startDate, 'startDate');
      normalized.endDate = this.normalizeOptionalDate(inputsObject.endDate, 'endDate');

      if (normalized.startDate && normalized.endDate) {
        if (normalized.endDate.getTime() < normalized.startDate.getTime()) {
          throw new BadRequestException('endDate doit etre posterieure a startDate');
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

  private normalizeOptionalNumber(value: unknown, fieldName: string): number | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    const parsedNumber = Number(value);
    if (!Number.isFinite(parsedNumber) || parsedNumber < 0) {
      throw new BadRequestException(`${fieldName} invalide: nombre positif attendu`);
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

  private normalizeOptionalDate(value: unknown, fieldName: string): Date | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${fieldName} invalide: date attendue`);
    }

    return date;
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
      throw new BadRequestException(`Champ "${fieldName}" invalide: tableau attendu`);
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
      this.normalizeGeneratedPost(post, index, allowedPlatforms, options?.forcedPlatform),
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

    return this.normalizeGeneratedPost(sourcePayload, 0, allowedPlatforms, forcedPlatform);
  }

  private extractGeneratedPostsArray(payload: unknown): unknown[] {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Format IA invalide: tableau de posts attendu');
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

    throw new BadRequestException('Format IA invalide: generatedPosts/posts manquant');
  }

  private normalizeGeneratedPost(
    postPayload: unknown,
    index: number,
    allowedPlatforms: string[],
    forcedPlatform?: string,
  ): GeneratedPost {
    if (!postPayload || typeof postPayload !== 'object' || Array.isArray(postPayload)) {
      throw new BadRequestException(
        `Format IA invalide: generatedPosts[${index}] doit etre un objet`,
      );
    }

    const post = postPayload as Record<string, unknown>;

    const rawPlatform = forcedPlatform ?? this.normalizeOptionalString(post.platform);
    if (!rawPlatform) {
      throw new BadRequestException(`generatedPosts[${index}].platform est obligatoire`);
    }

    const platform = this.resolveAllowedPlatform(rawPlatform, allowedPlatforms);
    if (!platform) {
      throw new BadRequestException(
        `generatedPosts[${index}].platform non autorisee: ${rawPlatform}`,
      );
    }

    const type =
      this.normalizeOptionalString(post.type) ?? this.defaultTypeForPlatform(platform);
    const caption = this.extractRequiredString(
      post.caption,
      `generatedPosts[${index}].caption`,
    );

    const normalized: GeneratedPost = {
      platform,
      type,
      caption,
    };

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
      throw new BadRequestException('schedule invalide: date et time sont requis');
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
    return 'post';
  }

  private resolvePostIndex(campaign: ContentCampaignDocument, dto: RegeneratePostDto): number {
    if (!dto.postId && dto.index === undefined) {
      throw new BadRequestException('postId ou index est requis');
    }

    if (dto.postId) {
      const postIndex = campaign.generatedPosts.findIndex(
        (post) =>
          (post as unknown as { _id?: Types.ObjectId })._id?.toString() === dto.postId,
      );

      if (postIndex < 0) {
        throw new NotFoundException('Post introuvable dans la campagne');
      }

      return postIndex;
    }

    const index = dto.index as number;
    if (index < 0 || index >= campaign.generatedPosts.length) {
      throw new BadRequestException('index invalide');
    }

    return index;
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

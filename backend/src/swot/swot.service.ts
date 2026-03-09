import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AiService } from '../ai/ai.service';
import { AiMonitoringService } from '../ai-monitoring/ai-monitoring.service';
import { AiFeatureType } from '../ai-monitoring/schemas/ai-log.schema';
import {
  buildImproveSwotPrompt,
  buildSwotFromStrategyPrompt,
} from '../ai/prompts/swot.prompts';
import {
  Strategy,
  StrategyDocument,
} from '../strategies/schemas/strategy.schema';
import { User, UserDocument } from '../users/entities/user.entity';
import {
  CreateSwotDto,
  GenerateSwotDto,
  ImproveSwotDto,
  UpdateSwotDto,
} from './dto';
import { Swot, SwotDocument } from './schemas/swot.schema';

type SwotMatrixKey = 'strengths' | 'weaknesses' | 'opportunities' | 'threats';

interface SwotMatrix {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface SwotInputsPayload {
  notesInternes?: string;
  notesExternes?: string;
  concurrents?: string[];
  ressources?: string[];
  objectifs?: string;
}

export interface SwotPdfExportPayload {
  swotId: string;
  fileName: string;
  title: string;
  exportedAt: string;
  createdAt: string;
  updatedAt: string;
  isAiGenerated: boolean;
  user: {
    id: string;
    fullName: string;
    email: string;
    companyName?: string;
  };
  strategy: {
    id: string;
    businessName: string;
    industry: string;
  };
  inputs: {
    notesInternes?: string;
    notesExternes?: string;
    concurrents: string[];
    ressources: string[];
    objectifs?: string;
  };
  matrix: SwotMatrix;
}

@Injectable()
export class SwotService {
  private readonly swotKeys: SwotMatrixKey[] = [
    'strengths',
    'weaknesses',
    'opportunities',
    'threats',
  ];

  constructor(
    @InjectModel(Swot.name) private readonly swotModel: Model<SwotDocument>,
    @InjectModel(Strategy.name)
    private readonly strategyModel: Model<StrategyDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly aiService: AiService,
    private readonly aiMonitoringService: AiMonitoringService,
  ) {}

  async createManual(
    userId: string,
    dto: CreateSwotDto,
  ): Promise<SwotDocument> {
    const strategy = await this.getOwnedStrategyOrThrow(userId, dto.strategyId);

    const swotPayload = this.validateSwotPayload(
      { ...this.getEmptySwot(), ...(dto.swot ?? {}) },
      true,
    );

    const swotDocument = new this.swotModel({
      userId: this.toObjectId(userId, 'userId'),
      strategyId: strategy._id,
      title: this.resolveTitle(dto.title, strategy),
      inputs: this.normalizeInputs(dto.inputs),
      swot: swotPayload,
      isAiGenerated: false,
    });

    return swotDocument.save();
  }

  async generateFromStrategy(
    userId: string,
    dto: GenerateSwotDto,
  ): Promise<SwotDocument> {
    const strategy = await this.getOwnedStrategyOrThrow(userId, dto.strategyId);

    const strategyJson = strategy.generatedStrategy as unknown as Record<
      string,
      unknown
    >;
    const businessInfo = strategy.businessInfo as unknown as Record<
      string,
      unknown
    >;
    const inputs = this.normalizeInputs(dto.inputs);

    const prompt = buildSwotFromStrategyPrompt(
      strategyJson,
      businessInfo,
      inputs as unknown as Record<string, unknown>,
    );
    const validatedSwot = await this.executeAiCallWithMonitoring({
      userId,
      featureType: 'swot',
      actionType: 'generate_swot_from_strategy',
      relatedEntityId: dto.strategyId,
      inputSummary: {
        strategyId: dto.strategyId,
        inputs,
        prompt,
      },
      execute: async () => {
        const aiResult = await this.aiService.callNemotronAndParseJson(prompt);
        return this.validateSwotPayload(aiResult, true);
      },
    });

    const swotDocument = new this.swotModel({
      userId: this.toObjectId(userId, 'userId'),
      strategyId: strategy._id,
      title: this.resolveTitle(undefined, strategy),
      inputs,
      swot: validatedSwot,
      isAiGenerated: true,
    });

    return swotDocument.save();
  }

  async improveSwot(
    userId: string,
    swotId: string,
    dto: ImproveSwotDto,
  ): Promise<SwotDocument> {
    const swotDocument = await this.getOwnedSwotOrThrow(userId, swotId);
    const strategy = await this.getOwnedStrategyByIdOrThrow(
      userId,
      swotDocument.strategyId.toString(),
    );

    const prompt = buildImproveSwotPrompt(
      strategy.generatedStrategy as unknown as Record<string, unknown>,
      swotDocument.swot as unknown as Record<string, unknown>,
      (swotDocument.inputs ?? {}) as unknown as Record<string, unknown>,
      dto.instruction ?? '',
    );

    const validatedSwot = await this.executeAiCallWithMonitoring({
      userId,
      featureType: 'swot',
      actionType: 'improve_swot',
      relatedEntityId: swotId,
      inputSummary: {
        swotId,
        instruction: dto.instruction ?? '',
        prompt,
      },
      execute: async () => {
        const aiResult = await this.aiService.callNemotronAndParseJson(prompt);
        return this.validateSwotPayload(aiResult, true);
      },
    });

    swotDocument.swot = validatedSwot;
    swotDocument.isAiGenerated = true;

    return swotDocument.save();
  }

  async findAll(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ swots: SwotDocument[]; total: number }> {
    const sanitizedPage = Math.max(1, Number(page) || 1);
    const sanitizedLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const ownerId = this.toObjectId(userId, 'userId');

    const [swots, total] = await Promise.all([
      this.swotModel
        .find({ userId: ownerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(sanitizedLimit)
        .exec(),
      this.swotModel.countDocuments({ userId: ownerId }).exec(),
    ]);

    return { swots, total };
  }

  async findOne(userId: string, swotId: string): Promise<SwotDocument> {
    return this.getOwnedSwotOrThrow(userId, swotId);
  }

  async buildPdfExportPayload(
    userId: string,
    swotId: string,
  ): Promise<SwotPdfExportPayload> {
    const swotDocument = await this.getOwnedSwotOrThrow(userId, swotId);
    return this.buildPdfExportPayloadInternal(swotDocument);
  }

  async findAllForAdmin(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<{ swots: SwotDocument[]; total: number }> {
    const sanitizedPage = Math.max(1, Number(page) || 1);
    const sanitizedLimit = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (sanitizedPage - 1) * sanitizedLimit;
    const filters = await this.buildAdminSearchFilter(search);

    const [swots, total] = await Promise.all([
      this.swotModel
        .find(filters)
        .select(
          'userId strategyId title swot isAiGenerated createdAt updatedAt',
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
      this.swotModel.countDocuments(filters).exec(),
    ]);

    return { swots, total };
  }

  async findOneForAdmin(swotId: string): Promise<SwotDocument> {
    const swotObjectId = this.toObjectId(swotId, 'swotId');
    const swot = await this.swotModel
      .findById(swotObjectId)
      .populate('userId', 'fullName email companyName role')
      .populate('strategyId', 'businessInfo.businessName businessInfo.industry')
      .exec();

    if (!swot) {
      throw new NotFoundException('SWOT introuvable');
    }

    return swot;
  }

  async buildPdfExportPayloadForAdmin(
    swotId: string,
  ): Promise<SwotPdfExportPayload> {
    const swotObjectId = this.toObjectId(swotId, 'swotId');
    const swotDocument = await this.swotModel.findById(swotObjectId).exec();

    if (!swotDocument) {
      throw new NotFoundException('SWOT introuvable');
    }

    return this.buildPdfExportPayloadInternal(swotDocument);
  }

  async deleteOne(userId: string, swotId: string): Promise<void> {
    const swotDocument = await this.getOwnedSwotOrThrow(userId, swotId);
    await this.swotModel.deleteOne({ _id: swotDocument._id }).exec();
  }

  async updateOne(
    userId: string,
    swotId: string,
    dto: UpdateSwotDto,
  ): Promise<SwotDocument> {
    const swotDocument = await this.getOwnedSwotOrThrow(userId, swotId);

    if (dto.title !== undefined) {
      swotDocument.title = dto.title.trim();
    }

    if (dto.inputs !== undefined) {
      swotDocument.inputs = this.normalizeInputs(dto.inputs);
    }

    if (dto.swot !== undefined) {
      const mergedSwot = {
        ...this.getEmptySwot(),
        ...((swotDocument.swot as unknown as Record<string, unknown>) ?? {}),
        ...dto.swot,
      };
      swotDocument.swot = this.validateSwotPayload(mergedSwot, true);
      swotDocument.isAiGenerated = false;
    }

    return swotDocument.save();
  }

  private async getOwnedStrategyOrThrow(
    userId: string,
    strategyId: string,
  ): Promise<StrategyDocument> {
    return this.getOwnedStrategyByIdOrThrow(userId, strategyId);
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

  private async getOwnedSwotOrThrow(
    userId: string,
    swotId: string,
  ): Promise<SwotDocument> {
    const swotObjectId = this.toObjectId(swotId, 'swotId');
    const swot = await this.swotModel.findById(swotObjectId).exec();

    if (!swot) {
      throw new NotFoundException('SWOT introuvable');
    }

    if (swot.userId.toString() !== userId) {
      throw new ForbiddenException(
        'Acces refuse: ce SWOT ne vous appartient pas',
      );
    }

    return swot;
  }

  private resolveTitle(
    title: string | undefined,
    strategy: StrategyDocument,
  ): string {
    const normalizedTitle = title?.trim();
    if (normalizedTitle) {
      return normalizedTitle;
    }

    const businessName = strategy.businessInfo?.businessName?.trim();
    return businessName ? `SWOT - ${businessName}` : 'SWOT';
  }

  private async buildPdfExportPayloadInternal(
    swotDocument: SwotDocument,
  ): Promise<SwotPdfExportPayload> {
    const nowIso = new Date().toISOString();
    const createdAt = swotDocument.createdAt
      ? new Date(swotDocument.createdAt).toISOString()
      : nowIso;
    const updatedAt = swotDocument.updatedAt
      ? new Date(swotDocument.updatedAt).toISOString()
      : createdAt;

    const [userSource, strategySource] = await Promise.all([
      this.userModel
        .findById(swotDocument.userId)
        .select('fullName email companyName')
        .lean()
        .exec(),
      this.strategyModel
        .findById(swotDocument.strategyId)
        .select('businessInfo.businessName businessInfo.industry')
        .lean()
        .exec(),
    ]);

    const userRecord = userSource as {
      _id: Types.ObjectId;
      fullName?: string;
      email?: string;
      companyName?: string;
    } | null;
    const strategyRecord = strategySource as {
      _id: Types.ObjectId;
      businessInfo?: { businessName?: string; industry?: string };
    } | null;
    const inputs = (swotDocument.inputs ?? {}) as SwotInputsPayload;

    const matrix: SwotMatrix = {
      strengths: Array.isArray(swotDocument.swot?.strengths)
        ? swotDocument.swot.strengths
        : [],
      weaknesses: Array.isArray(swotDocument.swot?.weaknesses)
        ? swotDocument.swot.weaknesses
        : [],
      opportunities: Array.isArray(swotDocument.swot?.opportunities)
        ? swotDocument.swot.opportunities
        : [],
      threats: Array.isArray(swotDocument.swot?.threats)
        ? swotDocument.swot.threats
        : [],
    };

    return {
      swotId: swotDocument._id.toString(),
      fileName: this.buildPdfFileName(swotDocument.title),
      title: swotDocument.title,
      exportedAt: nowIso,
      createdAt,
      updatedAt,
      isAiGenerated: Boolean(swotDocument.isAiGenerated),
      user: {
        id: userRecord?._id?.toString() ?? swotDocument.userId.toString(),
        fullName: userRecord?.fullName ?? 'Utilisateur',
        email: userRecord?.email ?? '-',
        companyName: userRecord?.companyName,
      },
      strategy: {
        id:
          strategyRecord?._id?.toString() ?? swotDocument.strategyId.toString(),
        businessName: strategyRecord?.businessInfo?.businessName ?? 'Strategie',
        industry: strategyRecord?.businessInfo?.industry ?? '-',
      },
      inputs: {
        notesInternes: this.toOptionalString(inputs.notesInternes),
        notesExternes: this.toOptionalString(inputs.notesExternes),
        concurrents: this.toStringArray(inputs.concurrents, 20),
        ressources: this.toStringArray(inputs.ressources, 20),
        objectifs: this.toOptionalString(inputs.objectifs),
      },
      matrix,
    };
  }

  private normalizeInputs(inputs?: SwotInputsPayload): SwotInputsPayload {
    if (!inputs) {
      return {};
    }

    return {
      notesInternes: this.normalizeOptionalString(inputs.notesInternes),
      notesExternes: this.normalizeOptionalString(inputs.notesExternes),
      concurrents: this.normalizeStringArray(inputs.concurrents, 20),
      ressources: this.normalizeStringArray(inputs.ressources, 20),
      objectifs: this.normalizeOptionalString(inputs.objectifs),
    };
  }

  private validateSwotPayload(payload: unknown, strict = true): SwotMatrix {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new BadRequestException('JSON SWOT invalide: objet attendu');
    }

    const swotPayload = payload as Record<string, unknown>;

    if (strict) {
      for (const key of this.swotKeys) {
        if (!(key in swotPayload)) {
          throw new BadRequestException(
            `JSON SWOT invalide: champ "${key}" manquant`,
          );
        }
      }
    }

    const result: SwotMatrix = this.getEmptySwot();

    for (const key of this.swotKeys) {
      const value = swotPayload[key];
      const normalized = this.normalizeStringArray(value, 6, key);
      result[key] = normalized;
    }

    return result;
  }

  private normalizeStringArray(
    value: unknown,
    maxItems: number,
    fieldName = 'array',
  ): string[] {
    if (value === undefined || value === null) {
      return [];
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

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} invalide`);
    }

    return new Types.ObjectId(value);
  }

  private getEmptySwot(): SwotMatrix {
    return {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    };
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

    const orFilters: Record<string, unknown>[] = [{ title: { $regex: regex } }];

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

  private toOptionalString(value: unknown): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  private toStringArray(value: unknown, maxItems = 20): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, maxItems);
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

  private buildPdfFileName(title: string): string {
    const normalized = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);

    const datePart = new Date().toISOString().slice(0, 10);
    return `${normalized || 'swot'}-${datePart}.pdf`;
  }
}

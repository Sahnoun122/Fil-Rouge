import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AiService } from '../ai/ai.service';
import {
  buildImproveSwotPrompt,
  buildSwotFromStrategyPrompt,
} from '../ai/prompts/swot.prompts';
import { Strategy, StrategyDocument } from '../strategies/schemas/strategy.schema';
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
    @InjectModel(Strategy.name) private readonly strategyModel: Model<StrategyDocument>,
    private readonly aiService: AiService,
  ) {}

  async createManual(userId: string, dto: CreateSwotDto): Promise<SwotDocument> {
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

  async generateFromStrategy(userId: string, dto: GenerateSwotDto): Promise<SwotDocument> {
    const strategy = await this.getOwnedStrategyOrThrow(userId, dto.strategyId);

    const strategyJson = strategy.generatedStrategy as unknown as Record<string, unknown>;
    const businessInfo = strategy.businessInfo as unknown as Record<string, unknown>;
    const inputs = this.normalizeInputs(dto.inputs);

    const prompt = buildSwotFromStrategyPrompt(
      strategyJson,
      businessInfo,
      inputs as unknown as Record<string, unknown>,
    );
    const aiResult = await this.aiService.callNemotronAndParseJson(prompt);
    const validatedSwot = this.validateSwotPayload(aiResult, true);

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

  async improveSwot(userId: string, swotId: string, dto: ImproveSwotDto): Promise<SwotDocument> {
    const swotDocument = await this.getOwnedSwotOrThrow(userId, swotId);
    const strategy = await this.getOwnedStrategyByIdOrThrow(userId, swotDocument.strategyId.toString());

    const prompt = buildImproveSwotPrompt(
      strategy.generatedStrategy as unknown as Record<string, unknown>,
      swotDocument.swot as unknown as Record<string, unknown>,
      (swotDocument.inputs ?? {}) as unknown as Record<string, unknown>,
      dto.instruction ?? '',
    );

    const aiResult = await this.aiService.callNemotronAndParseJson(prompt);
    const validatedSwot = this.validateSwotPayload(aiResult, true);

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

  async deleteOne(userId: string, swotId: string): Promise<void> {
    const swotDocument = await this.getOwnedSwotOrThrow(userId, swotId);
    await this.swotModel.deleteOne({ _id: swotDocument._id }).exec();
  }

  async updateOne(userId: string, swotId: string, dto: UpdateSwotDto): Promise<SwotDocument> {
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

  private async getOwnedStrategyOrThrow(userId: string, strategyId: string): Promise<StrategyDocument> {
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
      throw new ForbiddenException('Acces refuse: cette strategie ne vous appartient pas');
    }

    return strategy;
  }

  private async getOwnedSwotOrThrow(userId: string, swotId: string): Promise<SwotDocument> {
    const swotObjectId = this.toObjectId(swotId, 'swotId');
    const swot = await this.swotModel.findById(swotObjectId).exec();

    if (!swot) {
      throw new NotFoundException('SWOT introuvable');
    }

    if (swot.userId.toString() !== userId) {
      throw new ForbiddenException('Acces refuse: ce SWOT ne vous appartient pas');
    }

    return swot;
  }

  private resolveTitle(title: string | undefined, strategy: StrategyDocument): string {
    const normalizedTitle = title?.trim();
    if (normalizedTitle) {
      return normalizedTitle;
    }

    const businessName = strategy.businessInfo?.businessName?.trim();
    return businessName ? `SWOT - ${businessName}` : 'SWOT';
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
          throw new BadRequestException(`JSON SWOT invalide: champ "${key}" manquant`);
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
}

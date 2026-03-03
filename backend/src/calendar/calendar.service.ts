import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ContentCampaignDocument } from '../content/schemas/content-campaign.schema';
import { StrategyDocument } from '../strategies/schemas/strategy.schema';
import {
  CreateScheduledPostDto,
  ListScheduledPostsDto,
  UpdateScheduledPostDto,
} from './dto';
import { MoveScheduledPostDto } from './dto/move-scheduled-post.dto';
import {
  ScheduledPost,
  ScheduledPostDocument,
  ScheduledPostStatus,
} from './schemas/scheduled-post.schema';

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(ScheduledPost.name)
    private readonly scheduledPostModel: Model<ScheduledPostDocument>,
    @InjectModel('Strategy')
    private readonly strategyModel: Model<StrategyDocument>,
    @InjectModel('ContentCampaign')
    private readonly contentCampaignModel: Model<ContentCampaignDocument>,
  ) {}

  async createScheduledPost(
    userId: string,
    dto: CreateScheduledPostDto,
  ): Promise<ScheduledPostDocument> {
    await this.validateOwnershipOfRelations(
      userId,
      dto.strategyId ?? null,
      dto.campaignId ?? null,
    );

    const scheduledPost = new this.scheduledPostModel({
      userId: this.toObjectId(userId, 'userId'),
      strategyId: this.toOptionalObjectId(dto.strategyId),
      campaignId: this.toOptionalObjectId(dto.campaignId),
      platform: dto.platform,
      postType: dto.postType,
      title: this.normalizeOptionalString(dto.title),
      caption: this.normalizeRequiredString(dto.caption, 'caption'),
      hashtags: this.normalizeStringArray(dto.hashtags),
      mediaUrls: this.normalizeStringArray(dto.mediaUrls),
      scheduledAt: dto.scheduledAt,
      status: this.resolveStatus(dto.status, dto.scheduledAt),
      timezone: this.normalizeRequiredString(dto.timezone, 'timezone'),
      notes: this.normalizeOptionalString(dto.notes),
    });

    return scheduledPost.save();
  }

  async listScheduledPosts(
    userId: string,
    query: ListScheduledPostsDto,
  ): Promise<{
    posts: ScheduledPostDocument[];
    total: number;
    page?: number;
    limit?: number;
    pages?: number;
  }> {
    this.assertValidRange(query.rangeStart, query.rangeEnd);

    const filters: Record<string, unknown> = {
      userId: this.toObjectId(userId, 'userId'),
      scheduledAt: {
        $gte: query.rangeStart,
        $lte: query.rangeEnd,
      },
    };

    if (query.platform) {
      filters.platform = query.platform;
    }

    if (query.status) {
      filters.status = query.status;
    }

    const shouldPaginate =
      query.page !== undefined || query.limit !== undefined;
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));

    if (shouldPaginate) {
      const skip = (page - 1) * limit;
      const [posts, total] = await Promise.all([
        this.scheduledPostModel
          .find(filters)
          .sort({ scheduledAt: 1, createdAt: 1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.scheduledPostModel.countDocuments(filters).exec(),
      ]);

      return {
        posts,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    }

    const [posts, total] = await Promise.all([
      this.scheduledPostModel
        .find(filters)
        .sort({ scheduledAt: 1, createdAt: 1 })
        .exec(),
      this.scheduledPostModel.countDocuments(filters).exec(),
    ]);

    return {
      posts,
      total,
    };
  }

  async findScheduledPostById(
    userId: string,
    postId: string,
  ): Promise<ScheduledPostDocument> {
    return this.getOwnedScheduledPostOrThrow(userId, postId);
  }

  async updateScheduledPost(
    userId: string,
    postId: string,
    dto: UpdateScheduledPostDto,
  ): Promise<ScheduledPostDocument> {
    const scheduledPost = await this.getOwnedScheduledPostOrThrow(
      userId,
      postId,
    );

    if (this.hasOwn(dto, 'strategyId') || this.hasOwn(dto, 'campaignId')) {
      const strategyId = this.hasOwn(dto, 'strategyId')
        ? (dto.strategyId ?? null)
        : (scheduledPost.strategyId?.toString() ?? null);
      const campaignId = this.hasOwn(dto, 'campaignId')
        ? (dto.campaignId ?? null)
        : (scheduledPost.campaignId?.toString() ?? null);

      await this.validateOwnershipOfRelations(userId, strategyId, campaignId);
    }

    if (this.hasOwn(dto, 'strategyId')) {
      scheduledPost.strategyId = this.toOptionalObjectId(dto.strategyId);
    }

    if (this.hasOwn(dto, 'campaignId')) {
      scheduledPost.campaignId = this.toOptionalObjectId(dto.campaignId);
    }

    if (this.hasOwn(dto, 'platform') && dto.platform) {
      scheduledPost.platform = dto.platform;
    }

    if (this.hasOwn(dto, 'postType') && dto.postType) {
      scheduledPost.postType = dto.postType;
    }

    if (this.hasOwn(dto, 'title')) {
      scheduledPost.title = this.normalizeOptionalString(dto.title);
    }

    if (this.hasOwn(dto, 'caption') && dto.caption !== undefined) {
      scheduledPost.caption = this.normalizeRequiredString(
        dto.caption,
        'caption',
      );
    }

    if (this.hasOwn(dto, 'hashtags')) {
      scheduledPost.hashtags = this.normalizeStringArray(dto.hashtags);
    }

    if (this.hasOwn(dto, 'mediaUrls')) {
      scheduledPost.mediaUrls = this.normalizeStringArray(dto.mediaUrls);
    }

    if (this.hasOwn(dto, 'scheduledAt') && dto.scheduledAt) {
      scheduledPost.scheduledAt = dto.scheduledAt;
    }

    if (this.hasOwn(dto, 'timezone') && dto.timezone !== undefined) {
      scheduledPost.timezone = this.normalizeRequiredString(
        dto.timezone,
        'timezone',
      );
    }

    if (this.hasOwn(dto, 'notes')) {
      scheduledPost.notes = this.normalizeOptionalString(dto.notes);
    }

    if (this.hasOwn(dto, 'status') || this.hasOwn(dto, 'scheduledAt')) {
      const targetStatus = this.hasOwn(dto, 'status')
        ? dto.status
        : scheduledPost.status;
      scheduledPost.status = this.resolveStatus(
        targetStatus,
        scheduledPost.scheduledAt,
      );
    }

    return scheduledPost.save();
  }

  async moveScheduledPost(
    userId: string,
    postId: string,
    dto: MoveScheduledPostDto,
  ): Promise<ScheduledPostDocument> {
    const scheduledPost = await this.getOwnedScheduledPostOrThrow(
      userId,
      postId,
    );
    scheduledPost.scheduledAt = dto.scheduledAt;
    scheduledPost.status = this.resolveStatus(
      scheduledPost.status,
      scheduledPost.scheduledAt,
    );

    return scheduledPost.save();
  }

  async deleteScheduledPost(userId: string, postId: string): Promise<void> {
    const scheduledPost = await this.getOwnedScheduledPostOrThrow(
      userId,
      postId,
    );
    await this.scheduledPostModel.deleteOne({ _id: scheduledPost._id }).exec();
  }

  private async getOwnedScheduledPostOrThrow(
    userId: string,
    postId: string,
  ): Promise<ScheduledPostDocument> {
    const postObjectId = this.toObjectId(postId, 'postId');
    const scheduledPost = await this.scheduledPostModel
      .findById(postObjectId)
      .exec();

    if (!scheduledPost) {
      throw new NotFoundException('Publication planifiee introuvable');
    }

    if (scheduledPost.userId.toString() !== userId) {
      throw new ForbiddenException(
        'Acces refuse: cette publication ne vous appartient pas',
      );
    }

    return scheduledPost;
  }

  private async validateOwnershipOfRelations(
    userId: string,
    strategyId?: string | null,
    campaignId?: string | null,
  ): Promise<void> {
    const [strategy, campaign] = await Promise.all([
      strategyId
        ? this.getOwnedStrategyOrThrow(userId, strategyId)
        : Promise.resolve(null),
      campaignId
        ? this.getOwnedCampaignOrThrow(userId, campaignId)
        : Promise.resolve(null),
    ]);

    if (
      strategy &&
      campaign &&
      campaign.strategyId?.toString() !== strategy._id.toString()
    ) {
      throw new BadRequestException(
        'campaignId ne correspond pas a la strategyId fournie',
      );
    }
  }

  private async getOwnedStrategyOrThrow(
    userId: string,
    strategyId: string,
  ): Promise<StrategyDocument> {
    const strategy = await this.strategyModel
      .findById(this.toObjectId(strategyId, 'strategyId'))
      .exec();

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

  private async getOwnedCampaignOrThrow(
    userId: string,
    campaignId: string,
  ): Promise<ContentCampaignDocument> {
    const campaign = await this.contentCampaignModel
      .findById(this.toObjectId(campaignId, 'campaignId'))
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

  private assertValidRange(rangeStart: Date, rangeEnd: Date): void {
    if (rangeEnd.getTime() < rangeStart.getTime()) {
      throw new BadRequestException(
        'rangeEnd doit etre posterieure ou egale a rangeStart',
      );
    }
  }

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} invalide`);
    }

    return new Types.ObjectId(value);
  }

  private toOptionalObjectId(value?: string | null): Types.ObjectId | null {
    if (!value) {
      return null;
    }

    return this.toObjectId(value, 'objectId');
  }

  private normalizeRequiredString(value: string, fieldName: string): string {
    const normalized = value.trim();
    if (!normalized) {
      throw new BadRequestException(`${fieldName} ne peut pas etre vide`);
    }

    return normalized;
  }

  private normalizeOptionalString(value?: string | null): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const normalized = value.trim();
    return normalized ? normalized : null;
  }

  private normalizeStringArray(values?: string[] | null): string[] {
    if (!values?.length) {
      return [];
    }

    return Array.from(
      new Set(
        values.map((value) => value.trim()).filter((value) => value.length > 0),
      ),
    );
  }

  private resolveStatus(
    status: ScheduledPostStatus | undefined,
    scheduledAt: Date,
  ): ScheduledPostStatus {
    if (status === ScheduledPostStatus.PUBLISHED) {
      return ScheduledPostStatus.PUBLISHED;
    }

    if (scheduledAt.getTime() < Date.now()) {
      return ScheduledPostStatus.LATE;
    }

    return ScheduledPostStatus.PLANNED;
  }

  private hasOwn<T extends object>(value: T, key: keyof T): boolean {
    return Object.prototype.hasOwnProperty.call(value, key);
  }
}

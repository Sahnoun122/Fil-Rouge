import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ContentCampaignDocument,
  GeneratedPost,
} from '../content/schemas/content-campaign.schema';
import { StrategyDocument } from '../strategies/schemas/strategy.schema';
import {
  CreateScheduledPostDto,
  ListScheduledPostsDto,
  UpdateScheduledPostDto,
} from './dto';
import { MoveScheduledPostDto } from './dto/move-scheduled-post.dto';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CalendarPlatform,
  ScheduledPost,
  ScheduledPostDocument,
  ScheduledPostStatus,
  ScheduledPostType,
} from './schemas/scheduled-post.schema';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);
  private readonly autoScheduleNotePrefix = 'AUTO_SCHEDULE:';

  constructor(
    @InjectModel(ScheduledPost.name)
    private readonly scheduledPostModel: Model<ScheduledPostDocument>,
    @InjectModel('Strategy')
    private readonly strategyModel: Model<StrategyDocument>,
    @InjectModel('ContentCampaign')
    private readonly contentCampaignModel: Model<ContentCampaignDocument>,
    private readonly notificationsService: NotificationsService,
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

    const timezone = this.normalizeRequiredString(dto.timezone, 'timezone');
    this.assertNotScheduledAfterToday(dto.scheduledAt, timezone);

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
      timezone,
      notes: this.normalizeOptionalString(dto.notes),
    });

    const createdPost = await scheduledPost.save();
    await this.safeUpsertRemindersForPost(createdPost);
    return createdPost;
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
    return this.listScheduledPostsForOwner(
      this.toObjectId(userId, 'userId'),
      query,
    );
  }

  async listScheduledPostsForAdmin(
    userId: string,
    query: ListScheduledPostsDto,
  ): Promise<{
    posts: ScheduledPostDocument[];
    total: number;
    page?: number;
    limit?: number;
    pages?: number;
  }> {
    return this.listScheduledPostsForOwner(
      this.toObjectId(userId, 'userId'),
      query,
    );
  }

  private async listScheduledPostsForOwner(
    ownerId: Types.ObjectId,
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
      userId: ownerId,
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

    if (this.hasOwn(dto, 'scheduledAt') || this.hasOwn(dto, 'timezone')) {
      this.assertNotScheduledAfterToday(
        scheduledPost.scheduledAt,
        scheduledPost.timezone,
      );
    }

    const updatedPost = await scheduledPost.save();
    await this.safeUpsertRemindersForPost(updatedPost);
    return updatedPost;
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
    this.assertNotScheduledAfterToday(
      scheduledPost.scheduledAt,
      scheduledPost.timezone,
    );
    scheduledPost.status = this.resolveStatus(
      scheduledPost.status,
      scheduledPost.scheduledAt,
    );

    const movedPost = await scheduledPost.save();
    await this.safeUpsertRemindersForPost(movedPost);
    return movedPost;
  }

  async deleteScheduledPost(userId: string, postId: string): Promise<void> {
    const scheduledPost = await this.getOwnedScheduledPostOrThrow(
      userId,
      postId,
    );
    await this.scheduledPostModel.deleteOne({ _id: scheduledPost._id }).exec();
    await this.safeDeleteRemindersForPost(scheduledPost._id);
  }

  async syncCampaignAutoSchedule(
    userId: string,
    campaign: ContentCampaignDocument,
  ): Promise<void> {
    if (campaign.userId.toString() !== userId) {
      throw new ForbiddenException(
        'Acces refuse: cette campagne ne vous appartient pas',
      );
    }

    const userObjectId = this.toObjectId(userId, 'userId');
    const removablePosts = await this.scheduledPostModel
      .find({
        userId: userObjectId,
        campaignId: campaign._id,
        notes: { $regex: `^${this.autoScheduleNotePrefix}` },
        status: {
          $in: [ScheduledPostStatus.PLANNED, ScheduledPostStatus.LATE],
        },
      })
      .select('_id')
      .exec();

    if (removablePosts.length) {
      const removableIds = removablePosts.map((post) => post._id);
      await this.scheduledPostModel
        .deleteMany({
          _id: { $in: removableIds },
        })
        .exec();
      await this.safeDeleteRemindersForPosts(removableIds);
    }

    const documentsToInsert = campaign.generatedPosts.flatMap((post, index) =>
      this.buildAutoScheduledDocuments(campaign, post, index),
    );

    if (!documentsToInsert.length) {
      return;
    }

    const insertedPosts = (await this.scheduledPostModel.insertMany(
      documentsToInsert,
      {
        ordered: true,
      },
    )) as ScheduledPostDocument[];

    await this.safeUpsertRemindersForPosts(insertedPosts);

    this.logger.log(
      `Synced ${documentsToInsert.length} scheduled posts for campaign ${campaign._id.toString()}`,
    );
  }

  private async safeUpsertRemindersForPost(
    post: ScheduledPostDocument,
  ): Promise<void> {
    try {
      await this.notificationsService.upsertRemindersForScheduledPost(post);
    } catch (error) {
      this.logger.error(
        `Failed to upsert reminders for scheduled post ${post._id.toString()}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async safeUpsertRemindersForPosts(
    posts: ScheduledPostDocument[],
  ): Promise<void> {
    if (!posts.length) {
      return;
    }

    try {
      await this.notificationsService.upsertRemindersForScheduledPosts(posts);
    } catch (error) {
      this.logger.error(
        'Failed to upsert reminders for auto-scheduled campaign posts',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async safeDeleteRemindersForPost(
    postId: Types.ObjectId,
  ): Promise<void> {
    try {
      await this.notificationsService.deleteRemindersForPost(postId);
    } catch (error) {
      this.logger.error(
        `Failed to delete reminders for scheduled post ${postId.toString()}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async safeDeleteRemindersForPosts(
    postIds: Types.ObjectId[],
  ): Promise<void> {
    if (!postIds.length) {
      return;
    }

    try {
      await this.notificationsService.deleteRemindersForPosts(postIds);
    } catch (error) {
      this.logger.error(
        'Failed to delete reminders for auto-scheduled campaign posts',
        error instanceof Error ? error.stack : undefined,
      );
    }
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

  private buildAutoScheduledDocuments(
    campaign: ContentCampaignDocument,
    post: GeneratedPost,
    index: number,
  ): Array<Record<string, unknown>> {
    if (!post.schedule?.date || !post.schedule?.time) {
      return [];
    }

    const platform = this.mapContentPlatformToCalendarPlatform(post.platform);
    if (!platform) {
      this.logger.warn(
        `Skipping calendar sync for unsupported platform "${post.platform}" in campaign ${campaign._id.toString()}`,
      );
      return [];
    }

    const timezone = post.schedule.timezone?.trim() || 'UTC';
    const scheduledAt = this.zonedDateTimeToUtc(
      post.schedule.date,
      post.schedule.time,
      timezone,
    );
    this.assertNotScheduledAfterToday(scheduledAt, timezone);

    return [
      {
        userId: campaign.userId,
        strategyId: campaign.strategyId ?? null,
        campaignId: campaign._id,
        platform,
        postType: this.mapGeneratedPostType(post.type),
        title: this.normalizeOptionalString(post.title),
        caption: this.normalizeRequiredString(post.caption, 'caption'),
        hashtags: this.normalizeStringArray(post.hashtags),
        mediaUrls: [],
        scheduledAt,
        status: this.resolveStatus(undefined, scheduledAt),
        timezone,
        notes: `${this.autoScheduleNotePrefix}${campaign._id.toString()}:${index}`,
      },
    ];
  }

  private mapContentPlatformToCalendarPlatform(
    platform: string,
  ): CalendarPlatform | null {
    const normalized = platform.trim().toLowerCase();
    if (normalized.includes('instagram')) return CalendarPlatform.INSTAGRAM;
    if (normalized.includes('tiktok') || normalized.includes('tik tok')) {
      return CalendarPlatform.TIKTOK;
    }
    if (normalized.includes('facebook')) return CalendarPlatform.FACEBOOK;
    if (normalized.includes('linkedin')) return CalendarPlatform.LINKEDIN;
    if (normalized === 'x' || normalized.includes('twitter')) {
      return CalendarPlatform.X;
    }
    if (normalized.includes('youtube')) return CalendarPlatform.YOUTUBE;
    if (normalized.includes('snapchat') || normalized.includes('snap')) {
      return CalendarPlatform.SNAPCHAT;
    }
    if (normalized.includes('pinterest')) return CalendarPlatform.PINTEREST;
    if (normalized.includes('threads')) return CalendarPlatform.THREADS;

    return null;
  }

  private mapGeneratedPostType(type?: string): ScheduledPostType {
    const normalized = type?.trim().toLowerCase() ?? '';

    if (normalized.includes('reel')) return ScheduledPostType.REEL;
    if (normalized.includes('story')) return ScheduledPostType.STORY;
    if (normalized.includes('carousel')) return ScheduledPostType.CAROUSEL;
    if (normalized.includes('video') || normalized.includes('short')) {
      return ScheduledPostType.VIDEO;
    }
    if (normalized.includes('ad')) return ScheduledPostType.AD;
    if (normalized.includes('tiktok')) return ScheduledPostType.TIKTOK;

    return ScheduledPostType.POST;
  }

  private zonedDateTimeToUtc(
    date: string,
    time: string,
    timezone: string,
  ): Date {
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
    const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time.trim());

    if (!dateMatch || !timeMatch) {
      throw new BadRequestException(
        `schedule invalide: ${date} ${time} pour timezone ${timezone}`,
      );
    }

    const target = {
      year: Number(dateMatch[1]),
      month: Number(dateMatch[2]),
      day: Number(dateMatch[3]),
      hour: Number(timeMatch[1]),
      minute: Number(timeMatch[2]),
    };

    let utcMillis = Date.UTC(
      target.year,
      target.month - 1,
      target.day,
      target.hour,
      target.minute,
    );

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const zonedParts = this.getDatePartsInTimezone(
        new Date(utcMillis),
        timezone,
      );
      const zonedAsUtc = Date.UTC(
        zonedParts.year,
        zonedParts.month - 1,
        zonedParts.day,
        zonedParts.hour,
        zonedParts.minute,
      );
      const targetAsUtc = Date.UTC(
        target.year,
        target.month - 1,
        target.day,
        target.hour,
        target.minute,
      );
      const diff = zonedAsUtc - targetAsUtc;
      if (diff === 0) {
        break;
      }
      utcMillis -= diff;
    }

    return new Date(utcMillis);
  }

  private getDatePartsInTimezone(
    date: Date,
    timezone: string,
  ): {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  } {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    const parts = formatter.formatToParts(date);
    const values = new Map<string, string>();

    for (const part of parts) {
      if (part.type !== 'literal') {
        values.set(part.type, part.value);
      }
    }

    return {
      year: Number(values.get('year')),
      month: Number(values.get('month')),
      day: Number(values.get('day')),
      hour: Number(values.get('hour')),
      minute: Number(values.get('minute')),
    };
  }

  private assertNotScheduledAfterToday(
    scheduledAt: Date,
    timezone: string,
  ): void {
    const scheduledDateTimeKey = this.getDateTimeKeyInTimezone(
      scheduledAt,
      timezone,
    );
    const nowDateTimeKey = this.getDateTimeKeyInTimezone(new Date(), timezone);

    if (scheduledDateTimeKey <= nowDateTimeKey) {
      throw new BadRequestException(
        'Planification refusee: la date/heure doit etre strictement dans le futur',
      );
    }
  }

  private getDateTimeKeyInTimezone(date: Date, timezone: string): string {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      });
      const parts = formatter.formatToParts(date);
      const values = new Map<string, string>();

      for (const part of parts) {
        if (part.type !== 'literal') {
          values.set(part.type, part.value);
        }
      }

      const year = values.get('year');
      const month = values.get('month');
      const day = values.get('day');
      const hour = values.get('hour');
      const minute = values.get('minute');
      const second = values.get('second');

      if (!year || !month || !day || !hour || !minute || !second) {
        throw new BadRequestException(`Timezone invalide: ${timezone}`);
      }

      return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    } catch {
      throw new BadRequestException(`Timezone invalide: ${timezone}`);
    }
  }
}

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { PipelineStage } from 'mongoose';
import { User, UserDocument } from '../users/entities/user.entity';
import { FilterAiLogsDto } from './dto/filter-ai-logs.dto';
import {
  AiFeatureType,
  AiLog,
  AiLogDocument,
  AiLogStatus,
} from './schemas/ai-log.schema';

export interface CreateAiLogInput {
  userId: string;
  featureType: AiFeatureType;
  actionType: string;
  relatedEntityId?: string;
  status: AiLogStatus;
  inputSummary?: string;
  responseSummary?: string;
  modelName?: string;
  responseTimeMs?: number;
  errorMessage?: string;
}

export interface AiLogsPagination {
  page?: number;
  limit?: number;
}

export interface AiLogsResult {
  logs: AiLogDocument[];
  total: number;
  page: number;
  limit: number;
}

export interface AiUsageByFeatureItem {
  featureType: AiFeatureType;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  averageResponseTimeMs: number;
  lastUsedAt: Date | null;
}

export interface AiUsageByUserItem {
  userId: string;
  user: {
    fullName?: string;
    email?: string;
    companyName?: string;
    role?: string;
  };
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  averageResponseTimeMs: number;
  lastUsedAt: Date | null;
}

export interface AiUsageOverTimeItem {
  date: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTimeMs: number;
}

export interface AiOverviewResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  averageResponseTimeMs: number;
  uniqueUsers: number;
  latestRequestAt: Date | null;
  usageByFeature: AiUsageByFeatureItem[];
  topUsers: AiUsageByUserItem[];
}

type CsvCellValue = string | number | boolean | null | undefined;

@Injectable()
export class AiMonitoringService {
  private readonly logger = new Logger(AiMonitoringService.name);

  constructor(
    @InjectModel(AiLog.name)
    private readonly aiLogModel: Model<AiLogDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async createLog(payload: CreateAiLogInput): Promise<AiLogDocument | null> {
    try {
      if (!Types.ObjectId.isValid(payload.userId)) {
        this.logger.warn(
          `Skipping AI log creation: invalid userId "${payload.userId}"`,
        );
        return null;
      }

      const logDocument = new this.aiLogModel({
        userId: new Types.ObjectId(payload.userId),
        featureType: payload.featureType,
        actionType: this.sanitizeText(payload.actionType, 120) ?? 'unknown',
        relatedEntityId: this.sanitizeText(payload.relatedEntityId, 120),
        status: payload.status,
        inputSummary: this.sanitizeText(payload.inputSummary, 3000),
        responseSummary: this.sanitizeText(payload.responseSummary, 4000),
        modelName: this.sanitizeText(payload.modelName, 150),
        responseTimeMs: this.normalizeResponseTime(payload.responseTimeMs),
        errorMessage: this.sanitizeText(payload.errorMessage, 3000),
      });

      return await logDocument.save();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.error(`Failed to create AI log: ${message}`);
      return null;
    }
  }

  async getOverview(
    filters: Partial<FilterAiLogsDto> = {},
  ): Promise<AiOverviewResult> {
    const match = await this.buildMatchFilters(filters);

    const [summaryList, usageByFeature, topUsers, uniqueUsers] =
      await Promise.all([
        this.aiLogModel
          .aggregate([
            { $match: match },
            {
              $group: {
                _id: null,
                totalRequests: { $sum: 1 },
                successfulRequests: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'success'] }, 1, 0],
                  },
                },
                failedRequests: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'failed'] }, 1, 0],
                  },
                },
                averageResponseTimeMs: { $avg: '$responseTimeMs' },
                latestRequestAt: { $max: '$createdAt' },
              },
            },
          ])
          .exec(),
        this.getUsageByFeature(filters),
        this.getUsageByUser(filters, 10),
        this.aiLogModel.distinct('userId', match).exec(),
      ]);

    const summary = (summaryList[0] as {
      totalRequests?: number;
      successfulRequests?: number;
      failedRequests?: number;
      averageResponseTimeMs?: number;
      latestRequestAt?: Date | null;
    }) ?? {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTimeMs: 0,
      latestRequestAt: null,
    };

    const totalRequests = Number(summary.totalRequests ?? 0);
    const successfulRequests = Number(summary.successfulRequests ?? 0);
    const failedRequests = Number(summary.failedRequests ?? 0);
    const averageResponseTimeMs = Math.round(
      Number(summary.averageResponseTimeMs ?? 0),
    );
    const successRate =
      totalRequests > 0
        ? Number(((successfulRequests / totalRequests) * 100).toFixed(2))
        : 0;

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate,
      averageResponseTimeMs,
      uniqueUsers: uniqueUsers.length,
      latestRequestAt: (summary.latestRequestAt as Date | null) ?? null,
      usageByFeature,
      topUsers,
    };
  }

  async getLogs(
    filters: Partial<FilterAiLogsDto> = {},
    pagination: AiLogsPagination = {},
  ): Promise<AiLogsResult> {
    const page = this.normalizePage(pagination.page ?? filters.page);
    const limit = this.normalizeLimit(pagination.limit ?? filters.limit);
    const skip = (page - 1) * limit;
    const match = await this.buildMatchFilters(filters);

    const [logs, total] = await Promise.all([
      this.aiLogModel
        .find(match)
        .populate('userId', 'fullName email companyName role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.aiLogModel.countDocuments(match).exec(),
    ]);

    return {
      logs,
      total,
      page,
      limit,
    };
  }

  async getLogById(id: string): Promise<AiLogDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Id de log IA invalide');
    }

    const log = await this.aiLogModel
      .findById(new Types.ObjectId(id))
      .populate('userId', 'fullName email companyName role')
      .exec();

    if (!log) {
      throw new NotFoundException('Log IA introuvable');
    }

    return log;
  }

  async getLogByIdForUser(id: string, userId: string): Promise<AiLogDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Id de log IA invalide');
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Utilisateur authentifie invalide');
    }

    const log = await this.aiLogModel
      .findOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      })
      .populate('userId', 'fullName email companyName role')
      .exec();

    if (!log) {
      throw new NotFoundException('Log IA introuvable');
    }

    return log;
  }

  async getUsageByFeature(
    filters: Partial<FilterAiLogsDto> = {},
  ): Promise<AiUsageByFeatureItem[]> {
    const match = await this.buildMatchFilters(filters);

    const usage = await this.aiLogModel
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: '$featureType',
            totalRequests: { $sum: 1 },
            successfulRequests: {
              $sum: {
                $cond: [{ $eq: ['$status', 'success'] }, 1, 0],
              },
            },
            failedRequests: {
              $sum: {
                $cond: [{ $eq: ['$status', 'failed'] }, 1, 0],
              },
            },
            averageResponseTimeMs: { $avg: '$responseTimeMs' },
            lastUsedAt: { $max: '$createdAt' },
          },
        },
        {
          $sort: {
            totalRequests: -1,
            _id: 1,
          },
        },
      ])
      .exec();

    return usage.map((item) => {
      const totalRequests = Number(item.totalRequests ?? 0);
      const successfulRequests = Number(item.successfulRequests ?? 0);
      const failedRequests = Number(item.failedRequests ?? 0);

      return {
        featureType: item._id as AiFeatureType,
        totalRequests,
        successfulRequests,
        failedRequests,
        successRate:
          totalRequests > 0
            ? Number(((successfulRequests / totalRequests) * 100).toFixed(2))
            : 0,
        averageResponseTimeMs: Math.round(
          Number(item.averageResponseTimeMs ?? 0),
        ),
        lastUsedAt: (item.lastUsedAt as Date | null) ?? null,
      };
    });
  }

  async getUsageByUser(
    filters: Partial<FilterAiLogsDto> = {},
    limit = 50,
  ): Promise<AiUsageByUserItem[]> {
    const match = await this.buildMatchFilters(filters);
    const safeLimit = Math.min(200, Math.max(1, Number(limit) || 50));

    return this.aggregateUsageByUser(match, safeLimit);
  }

  async getUsageOverTime(
    filters: Partial<FilterAiLogsDto> = {},
  ): Promise<AiUsageOverTimeItem[]> {
    const match = await this.buildMatchFilters(filters);

    const usage = await this.aiLogModel
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
              },
            },
            totalRequests: { $sum: 1 },
            successfulRequests: {
              $sum: {
                $cond: [{ $eq: ['$status', 'success'] }, 1, 0],
              },
            },
            failedRequests: {
              $sum: {
                $cond: [{ $eq: ['$status', 'failed'] }, 1, 0],
              },
            },
            averageResponseTimeMs: { $avg: '$responseTimeMs' },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ])
      .exec();

    return usage.map((item) => ({
      date: String(item._id ?? ''),
      totalRequests: Number(item.totalRequests ?? 0),
      successfulRequests: Number(item.successfulRequests ?? 0),
      failedRequests: Number(item.failedRequests ?? 0),
      averageResponseTimeMs: Math.round(Number(item.averageResponseTimeMs ?? 0)),
    }));
  }

  async getActionTypeSuggestions(
    filters: Partial<FilterAiLogsDto> = {},
    search?: string,
    limit = 8,
  ): Promise<string[]> {
    const safeLimit = Math.min(20, Math.max(1, Number(limit) || 8));
    const match = await this.buildMatchFilters({
      ...filters,
      actionType: undefined,
    });

    const normalizedSearch = this.sanitizeText(search, 120);
    if (normalizedSearch) {
      match.actionType = {
        $regex: new RegExp(this.escapeRegex(normalizedSearch), 'i'),
      };
    }

    const suggestions = await this.aiLogModel
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: '$actionType',
            totalRequests: { $sum: 1 },
            lastUsedAt: { $max: '$createdAt' },
          },
        },
        {
          $sort: {
            totalRequests: -1,
            lastUsedAt: -1,
            _id: 1,
          },
        },
        { $limit: safeLimit },
        {
          $project: {
            _id: 0,
            actionType: '$_id',
          },
        },
      ])
      .exec();

    return suggestions
      .map((item) =>
        typeof item.actionType === 'string' ? item.actionType.trim() : '',
      )
      .filter((item) => item.length > 0);
  }

  async exportLogsCsv(filters: Partial<FilterAiLogsDto> = {}): Promise<string> {
    const match = await this.buildMatchFilters(filters);

    const logs = await this.aiLogModel
      .find(match)
      .populate('userId', 'fullName email companyName role')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const headers = [
      'logId',
      'userId',
      'userFullName',
      'userEmail',
      'featureType',
      'actionType',
      'status',
      'responseTimeMs',
      'modelName',
      'relatedEntityId',
      'inputSummary',
      'responseSummary',
      'errorMessage',
      'createdAt',
      'updatedAt',
    ];

    const rows = logs.map((log) => {
      const populatedUser = this.extractPopulatedUser(log.userId);
      let rawUserId: unknown = log.userId;

      if (typeof log.userId === 'object' && log.userId !== null) {
        const maybeUser = log.userId as { _id?: unknown };
        if ('_id' in maybeUser && maybeUser._id) {
          rawUserId = maybeUser._id;
        }
      }

      return [
        this.objectIdToString(log._id),
        this.objectIdToString(rawUserId),
        populatedUser?.fullName ?? '',
        populatedUser?.email ?? '',
        log.featureType ?? '',
        log.actionType ?? '',
        log.status ?? '',
        log.responseTimeMs ?? '',
        log.modelName ?? '',
        log.relatedEntityId ?? '',
        log.inputSummary ?? '',
        log.responseSummary ?? '',
        log.errorMessage ?? '',
        log.createdAt ? new Date(log.createdAt).toISOString() : '',
        log.updatedAt ? new Date(log.updatedAt).toISOString() : '',
      ];
    });

    return this.buildCsv(headers, rows);
  }

  async exportUsageByUserCsv(
    filters: Partial<FilterAiLogsDto> = {},
  ): Promise<string> {
    const match = await this.buildMatchFilters(filters);
    const usage = await this.aggregateUsageByUser(match);

    const headers = [
      'userId',
      'fullName',
      'email',
      'companyName',
      'role',
      'totalRequests',
      'successfulRequests',
      'failedRequests',
      'successRate',
      'averageResponseTimeMs',
      'lastUsedAt',
    ];

    const rows = usage.map((item) => [
      item.userId,
      item.user.fullName ?? '',
      item.user.email ?? '',
      item.user.companyName ?? '',
      item.user.role ?? '',
      item.totalRequests,
      item.successfulRequests,
      item.failedRequests,
      item.successRate,
      item.averageResponseTimeMs,
      item.lastUsedAt ? new Date(item.lastUsedAt).toISOString() : '',
    ]);

    return this.buildCsv(headers, rows);
  }

  async exportUserLogsCsv(
    userId: string,
    filters: Partial<FilterAiLogsDto> = {},
  ): Promise<string> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('userId invalide pour export');
    }

    return this.exportLogsCsv({
      ...filters,
      userId,
      userSearch: undefined,
    });
  }

  private async aggregateUsageByUser(
    match: Record<string, unknown>,
    limit?: number,
  ): Promise<AiUsageByUserItem[]> {
    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $group: {
          _id: '$userId',
          totalRequests: { $sum: 1 },
          successfulRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'success'] }, 1, 0],
            },
          },
          failedRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'failed'] }, 1, 0],
            },
          },
          averageResponseTimeMs: { $avg: '$responseTimeMs' },
          lastUsedAt: { $max: '$createdAt' },
        },
      },
      {
        $sort: {
          totalRequests: -1,
          _id: 1,
        },
      },
    ];

    if (typeof limit === 'number' && Number.isFinite(limit) && limit > 0) {
      pipeline.push({ $limit: Math.trunc(limit) } as PipelineStage);
    }

    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          totalRequests: 1,
          successfulRequests: 1,
          failedRequests: 1,
          averageResponseTimeMs: 1,
          lastUsedAt: 1,
          user: {
            fullName: '$user.fullName',
            email: '$user.email',
            companyName: '$user.companyName',
            role: '$user.role',
          },
        },
      },
    );

    const usage = await this.aiLogModel.aggregate(pipeline).exec();

    return usage.map((item) => {
      const totalRequests = Number(item.totalRequests ?? 0);
      const successfulRequests = Number(item.successfulRequests ?? 0);
      const failedRequests = Number(item.failedRequests ?? 0);
      const rawUserId = item.userId;

      return {
        userId:
          typeof rawUserId?.toString === 'function'
            ? rawUserId.toString()
            : String(rawUserId ?? ''),
        user: {
          fullName:
            typeof item.user?.fullName === 'string'
              ? item.user.fullName
              : undefined,
          email:
            typeof item.user?.email === 'string' ? item.user.email : undefined,
          companyName:
            typeof item.user?.companyName === 'string'
              ? item.user.companyName
              : undefined,
          role: typeof item.user?.role === 'string' ? item.user.role : undefined,
        },
        totalRequests,
        successfulRequests,
        failedRequests,
        successRate:
          totalRequests > 0
            ? Number(((successfulRequests / totalRequests) * 100).toFixed(2))
            : 0,
        averageResponseTimeMs: Math.round(
          Number(item.averageResponseTimeMs ?? 0),
        ),
        lastUsedAt: (item.lastUsedAt as Date | null) ?? null,
      };
    });
  }

  private extractPopulatedUser(
    value: unknown,
  ): { fullName?: string; email?: string; companyName?: string; role?: string } | null {
    if (typeof value !== 'object' || value === null) {
      return null;
    }

    const source = value as Record<string, unknown>;

    return {
      fullName: typeof source.fullName === 'string' ? source.fullName : undefined,
      email: typeof source.email === 'string' ? source.email : undefined,
      companyName:
        typeof source.companyName === 'string' ? source.companyName : undefined,
      role: typeof source.role === 'string' ? source.role : undefined,
    };
  }

  private objectIdToString(value: unknown): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof (value as { toString?: () => string }).toString === 'function') {
      return (value as { toString: () => string }).toString();
    }

    return '';
  }

  private buildCsv(headers: string[], rows: CsvCellValue[][]): string {
    const lines = [headers.map((header) => this.formatCsvCell(header)).join(',')];

    for (const row of rows) {
      lines.push(row.map((cell) => this.formatCsvCell(cell)).join(','));
    }

    return lines.join('\n');
  }

  private formatCsvCell(value: CsvCellValue): string {
    if (value === null || value === undefined) {
      return '';
    }

    const normalized = String(value);
    if (!/[",\r\n]/.test(normalized)) {
      return normalized;
    }

    return `"${normalized.replace(/"/g, '""')}"`;
  }

  private async buildMatchFilters(
    filters: Partial<FilterAiLogsDto>,
  ): Promise<Record<string, unknown>> {
    const match: Record<string, unknown> = {};
    let resolvedUserId: Types.ObjectId | undefined;

    if (filters.userId) {
      if (!Types.ObjectId.isValid(filters.userId)) {
        throw new BadRequestException('userId filtre invalide');
      }
      resolvedUserId = new Types.ObjectId(filters.userId);
    }

    const userSearch = this.sanitizeText(filters.userSearch, 120);
    if (userSearch) {
      const escapedSearch = this.escapeRegex(userSearch);
      const regex = new RegExp(escapedSearch, 'i');

      const matchingUsers = await this.userModel
        .find(
          {
            $or: [{ fullName: regex }, { email: regex }],
          },
          { _id: 1 },
        )
        .limit(500)
        .lean()
        .exec();

      const matchingIds = matchingUsers
        .map((user) => {
          const rawId = user?._id;
          return rawId ? new Types.ObjectId(String(rawId)) : null;
        })
        .filter((item): item is Types.ObjectId => item !== null);

      if (resolvedUserId) {
        const hasMatchedExplicitUser = matchingIds.some(
          (item) => item.toString() === resolvedUserId?.toString(),
        );
        match.userId = hasMatchedExplicitUser ? resolvedUserId : { $in: [] };
      } else {
        match.userId = matchingIds.length > 0 ? { $in: matchingIds } : { $in: [] };
      }
    } else if (resolvedUserId) {
      match.userId = resolvedUserId;
    }

    if (filters.featureType) {
      match.featureType = filters.featureType;
    }

    if (filters.status) {
      match.status = filters.status;
    }

    if (filters.actionType) {
      const actionType = this.sanitizeText(filters.actionType, 120);
      if (actionType) {
        match.actionType = actionType;
      }
    }

    const createdAtRange = this.buildDateRange(filters.dateFrom, filters.dateTo);
    if (createdAtRange) {
      match.createdAt = createdAtRange;
    }

    return match;
  }

  private buildDateRange(
    dateFrom?: string,
    dateTo?: string,
  ): Record<string, Date> | undefined {
    if (!dateFrom && !dateTo) {
      return undefined;
    }

    let parsedFrom: Date | undefined;
    let parsedTo: Date | undefined;

    if (dateFrom) {
      parsedFrom = this.parseDate(dateFrom, false);
    }

    if (dateTo) {
      parsedTo = this.parseDate(dateTo, true);
    }

    if (parsedFrom && parsedTo && parsedFrom > parsedTo) {
      parsedFrom = this.parseDate(dateTo as string, false);
      parsedTo = this.parseDate(dateFrom as string, true);
    }

    const range: Record<string, Date> = {};
    if (parsedFrom) {
      range.$gte = parsedFrom;
    }
    if (parsedTo) {
      range.$lte = parsedTo;
    }

    return range;
  }

  private parseDate(value: string, endOfDay: boolean): Date {
    const normalized = value.trim();
    const parsed = new Date(normalized);

    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`Date invalide: ${value}`);
    }

    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (endOfDay && dateOnlyPattern.test(normalized)) {
      parsed.setUTCHours(23, 59, 59, 999);
    }

    return parsed;
  }

  private sanitizeText(value: string | undefined, maxLength: number): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const normalized = value.replace(/\s+/g, ' ').trim();
    if (!normalized) {
      return undefined;
    }

    if (normalized.length <= maxLength) {
      return normalized;
    }

    return `${normalized.slice(0, maxLength - 3)}...`;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private normalizeResponseTime(value: number | undefined): number | undefined {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      return undefined;
    }

    return Math.round(value);
  }

  private normalizePage(value: number | undefined): number {
    return Math.max(1, Number(value) || 1);
  }

  private normalizeLimit(value: number | undefined): number {
    return Math.min(100, Math.max(1, Number(value) || 20));
  }
}

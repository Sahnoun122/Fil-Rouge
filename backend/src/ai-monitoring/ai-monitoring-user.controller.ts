import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilterAiLogsDto } from './dto/filter-ai-logs.dto';
import { FilterMyAiLogsDto } from './dto/filter-my-ai-logs.dto';
import { AiMonitoringService } from './ai-monitoring.service';

@Controller('ai-monitoring')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AiMonitoringUserController {
  constructor(private readonly aiMonitoringService: AiMonitoringService) {}

  @Get('overview')
  async getMyOverview(@Req() req: Request, @Query() filters: FilterMyAiLogsDto) {
    const userId = this.getAuthenticatedUserId(req);
    const scopedFilters = this.withUserScope(userId, filters);
    const overview = await this.aiMonitoringService.getOverview(scopedFilters);

    return {
      success: true,
      data: overview,
    };
  }

  @Get('logs')
  async getMyLogs(@Req() req: Request, @Query() filters: FilterMyAiLogsDto) {
    const userId = this.getAuthenticatedUserId(req);
    const scopedFilters = this.withUserScope(userId, filters);
    const result = await this.aiMonitoringService.getLogs(scopedFilters, {
      page: filters.page,
      limit: filters.limit,
    });

    return {
      success: true,
      data: {
        logs: result.logs,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: Math.ceil(result.total / result.limit),
        },
      },
    };
  }

  @Get('logs/:id')
  async getMyLogById(@Req() req: Request, @Param('id') id: string) {
    const userId = this.getAuthenticatedUserId(req);
    const log = await this.aiMonitoringService.getLogByIdForUser(id, userId);

    return {
      success: true,
      data: log,
    };
  }

  @Get('usage-by-feature')
  async getMyUsageByFeature(
    @Req() req: Request,
    @Query() filters: FilterMyAiLogsDto,
  ) {
    const userId = this.getAuthenticatedUserId(req);
    const scopedFilters = this.withUserScope(userId, filters);
    const usage = await this.aiMonitoringService.getUsageByFeature(scopedFilters);

    return {
      success: true,
      data: usage,
    };
  }

  @Get('usage-over-time')
  async getMyUsageOverTime(@Req() req: Request, @Query() filters: FilterMyAiLogsDto) {
    const userId = this.getAuthenticatedUserId(req);
    const scopedFilters = this.withUserScope(userId, filters);
    const usage = await this.aiMonitoringService.getUsageOverTime(scopedFilters);

    return {
      success: true,
      data: usage,
    };
  }

  private withUserScope(
    userId: string,
    filters: FilterMyAiLogsDto,
  ): Partial<FilterAiLogsDto> {
    return {
      userId,
      page: filters.page,
      limit: filters.limit,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      featureType: filters.featureType,
      status: filters.status,
      actionType: filters.actionType,
    };
  }

  private getAuthenticatedUserId(req: Request): string {
    const rawUser = req.user as
      | { sub?: string; id?: string; _id?: { toString(): string } }
      | undefined;
    const rawId = rawUser?.sub ?? rawUser?.id ?? rawUser?._id?.toString();

    if (!rawId || typeof rawId !== 'string') {
      throw new BadRequestException('Utilisateur authentifie invalide');
    }

    return rawId;
  }
}

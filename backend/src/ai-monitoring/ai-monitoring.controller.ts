import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { FilterAiLogsDto } from './dto/filter-ai-logs.dto';
import { AiMonitoringService } from './ai-monitoring.service';

@Controller('admin/ai-monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AiMonitoringController {
  constructor(private readonly aiMonitoringService: AiMonitoringService) {}

  @Get('overview')
  async getOverview(@Query() filters: FilterAiLogsDto) {
    const overview = await this.aiMonitoringService.getOverview(filters);

    return {
      success: true,
      data: overview,
    };
  }

  @Get('logs')
  async getLogs(@Query() filters: FilterAiLogsDto) {
    const result = await this.aiMonitoringService.getLogs(filters, {
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
  async getLogById(@Param('id') id: string) {
    const log = await this.aiMonitoringService.getLogById(id);

    return {
      success: true,
      data: log,
    };
  }

  @Get('usage-by-feature')
  async getUsageByFeature(@Query() filters: FilterAiLogsDto) {
    const usage = await this.aiMonitoringService.getUsageByFeature(filters);

    return {
      success: true,
      data: usage,
    };
  }

  @Get('usage-by-user')
  async getUsageByUser(@Query() filters: FilterAiLogsDto) {
    const usage = await this.aiMonitoringService.getUsageByUser(
      filters,
      filters.limit ?? 50,
    );

    return {
      success: true,
      data: usage,
    };
  }

  @Get('exports/logs.csv')
  async exportLogsCsv(
    @Query() filters: FilterAiLogsDto,
    @Res() res: Response,
  ) {
    const csv = await this.aiMonitoringService.exportLogsCsv(filters);
    const fileName = `ai-monitoring-logs-${this.buildDateSuffix()}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.status(200).send(csv);
  }

  @Get('exports/usage-by-user.csv')
  async exportUsageByUserCsv(
    @Query() filters: FilterAiLogsDto,
    @Res() res: Response,
  ) {
    const csv = await this.aiMonitoringService.exportUsageByUserCsv(filters);
    const fileName = `ai-monitoring-usage-by-user-${this.buildDateSuffix()}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.status(200).send(csv);
  }

  @Get('exports/users/:userId/logs.csv')
  async exportLogsCsvByUser(
    @Param('userId') userId: string,
    @Query() filters: FilterAiLogsDto,
    @Res() res: Response,
  ) {
    const csv = await this.aiMonitoringService.exportUserLogsCsv(
      userId,
      filters,
    );
    const fileName = `ai-monitoring-user-${userId}-logs-${this.buildDateSuffix()}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.status(200).send(csv);
  }

  private buildDateSuffix(): string {
    return new Date().toISOString().slice(0, 10);
  }
}

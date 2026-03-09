import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
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
}

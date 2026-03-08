import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { StrategiesService } from './strategies.service';
import {
  GenerateStrategyDto,
  UpdateStrategyDto,
  RegenerateSectionDto,
  ImproveSectionDto,
  UpdateSectionDto,
  AdminStrategiesQueryDto,
} from './dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('strategies')
@UseGuards(JwtAuthGuard)
export class StrategiesController {
  constructor(private readonly strategiesService: StrategiesService) {}

  /**
   * Génère une stratégie marketing complète
   */
  @Post('generate-full')
  @HttpCode(HttpStatus.CREATED)
  async generateFullStrategy(
    @Body() generateStrategyDto: GenerateStrategyDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const strategy = await this.strategiesService.generateFullStrategy(
      userId,
      generateStrategyDto,
    );

    return {
      success: true,
      message: 'Stratégie générée avec succès',
      data: strategy,
    };
  }

  /**
   * Récupère toutes les stratégies de l'utilisateur connecté avec pagination
   */
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;

    // Validation des paramètres de pagination
    const validatedPage = Math.max(1, pageNumber);
    const validatedLimit = Math.min(50, Math.max(1, limitNumber)); // Max 50 par page

    const result = await this.strategiesService.findAll(
      userId,
      validatedPage,
      validatedLimit,
    );

    return {
      success: true,
      data: {
        strategies: result.strategies,
        pagination: {
          page: validatedPage,
          limit: validatedLimit,
          total: result.total,
          pages: Math.ceil(result.total / validatedLimit),
        },
      },
    };
  }

  /**
   * RÃ©cupÃ¨re toutes les stratÃ©gies pour l'admin avec pagination
   */
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findAllForAdmin(@Query() query: AdminStrategiesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search;

    const result = await this.strategiesService.findAllForAdmin(
      page,
      limit,
      search,
    );

    return {
      success: true,
      data: {
        strategies: result.strategies,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      },
    };
  }

  /**
   * Récupère une stratégie précise pour l'admin
   */
  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findOneForAdmin(@Param('id') strategyId: string) {
    const strategy = await this.strategiesService.findOneForAdmin(strategyId);

    return {
      success: true,
      data: strategy,
    };
  }

  /**
   * Récupère une stratégie spécifique par son ID
   */
  @Get(':id')
  async findOne(
    @Param('id') strategyId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const strategy = await this.strategiesService.findOne(userId, strategyId);

    return {
      success: true,
      data: strategy,
    };
  }

  /**
   * Retourne la charge utile de la strategie pour export PDF
   */
  @Get(':id/export-pdf')
  async exportPdf(
    @Param('id') strategyId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const payload = await this.strategiesService.buildPdfExportPayload(
      userId,
      strategyId,
    );

    return {
      success: true,
      data: payload,
    };
  }

  /**
   * Met à jour les informations business d'une stratégie
   */
  @Patch(':id')
  async updateStrategy(
    @Param('id') strategyId: string,
    @Body() updateStrategyDto: UpdateStrategyDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const strategy = await this.strategiesService.updateStrategy(
      userId,
      strategyId,
      updateStrategyDto,
    );

    return {
      success: true,
      message: 'Stratégie mise à jour avec succès',
      data: strategy,
    };
  }

  /**
   * Supprime une stratégie spécifique
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOne(
    @Param('id') strategyId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    await this.strategiesService.deleteOne(userId, strategyId);

    return {
      success: true,
      message: 'Stratégie supprimée avec succès',
    };
  }

  /**
   * Régénère une section spécifique de la stratégie
   */
  @Post(':id/regenerate-section')
  async regenerateSection(
    @Param('id') strategyId: string,
    @Body() regenerateSectionDto: RegenerateSectionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const strategy = await this.strategiesService.regenerateSection(
      userId,
      strategyId,
      regenerateSectionDto,
    );

    return {
      success: true,
      message: `Section "${regenerateSectionDto.sectionKey}" régénérée avec succès`,
      data: strategy,
    };
  }

  /**
   * Améliore une section spécifique de la stratégie
   */
  @Post(':id/improve-section')
  async improveSection(
    @Param('id') strategyId: string,
    @Body() improveSectionDto: ImproveSectionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const strategy = await this.strategiesService.improveSection(
      userId,
      strategyId,
      improveSectionDto,
    );

    return {
      success: true,
      message: `Section "${improveSectionDto.sectionKey}" améliorée avec succès`,
      data: strategy,
    };
  }

  /**
   * Met à jour manuellement une section spécifique de la stratégie
   */
  @Patch(':id/update-section')
  async updateSection(
    @Param('id') strategyId: string,
    @Body() updateSectionDto: UpdateSectionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;

    const updatedStrategy = await this.strategiesService.updateSection(
      userId,
      strategyId,
      updateSectionDto,
    );

    return {
      success: true,
      message: `Section "${updateSectionDto.sectionKey}" mise à jour avec succès`,
      data: updatedStrategy,
    };
  }
}

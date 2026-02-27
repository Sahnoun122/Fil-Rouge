import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import {
  AdminSwotQueryDto,
  CreateSwotDto,
  GenerateSwotDto,
  ImproveSwotDto,
  UpdateSwotDto,
} from './dto';
import { SwotService } from './swot.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('swot')
@UseGuards(JwtAuthGuard)
export class SwotController {
  constructor(private readonly swotService: SwotService) {}

  @Post('manual')
  @HttpCode(HttpStatus.CREATED)
  async createManual(
    @Body() createSwotDto: CreateSwotDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const swot = await this.swotService.createManual(userId, createSwotDto);

    return {
      success: true,
      message: 'SWOT manuel cree avec succes',
      data: swot,
    };
  }

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generate(
    @Body() generateSwotDto: GenerateSwotDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const swot = await this.swotService.generateFromStrategy(userId, generateSwotDto);

    return {
      success: true,
      message: 'SWOT genere avec succes',
      data: swot,
    };
  }

  @Post(':id/improve')
  async improve(
    @Param('id') swotId: string,
    @Body() improveSwotDto: ImproveSwotDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const swot = await this.swotService.improveSwot(userId, swotId, improveSwotDto);

    return {
      success: true,
      message: 'SWOT ameliore avec succes',
      data: swot,
    };
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const validatedPage = Math.max(1, pageNumber);
    const validatedLimit = Math.min(50, Math.max(1, limitNumber));

    const result = await this.swotService.findAll(userId, validatedPage, validatedLimit);

    return {
      success: true,
      data: {
        swots: result.swots,
        pagination: {
          page: validatedPage,
          limit: validatedLimit,
          total: result.total,
          pages: Math.ceil(result.total / validatedLimit),
        },
      },
    };
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findAllForAdmin(@Query() query: AdminSwotQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search;

    const result = await this.swotService.findAllForAdmin(page, limit, search);

    return {
      success: true,
      data: {
        swots: result.swots,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      },
    };
  }

  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findOneForAdmin(@Param('id') swotId: string) {
    const swot = await this.swotService.findOneForAdmin(swotId);

    return {
      success: true,
      data: swot,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') swotId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const swot = await this.swotService.findOne(userId, swotId);

    return {
      success: true,
      data: swot,
    };
  }

  @Patch(':id')
  async updateOne(
    @Param('id') swotId: string,
    @Body() updateSwotDto: UpdateSwotDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const swot = await this.swotService.updateOne(userId, swotId, updateSwotDto);

    return {
      success: true,
      message: 'SWOT mis a jour avec succes',
      data: swot,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOne(
    @Param('id') swotId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    await this.swotService.deleteOne(userId, swotId);

    return {
      success: true,
      message: 'SWOT supprime avec succes',
    };
  }
}

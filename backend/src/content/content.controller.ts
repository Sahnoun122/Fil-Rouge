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
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateContentCampaignDto,
  GenerateContentDto,
  RegeneratePlatformDto,
  RegeneratePostDto,
  UpdateCampaignDto,
} from './dto';
import { ContentService } from './content.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('campaigns')
  @HttpCode(HttpStatus.CREATED)
  async createCampaign(
    @Body() createCampaignDto: CreateContentCampaignDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const campaign = await this.contentService.createCampaign(userId, createCampaignDto);

    return {
      success: true,
      message: 'Campaign created successfully',
      data: campaign,
    };
  }

  @Post('campaigns/:id/generate')
  async generateCampaign(
    @Param('id') campaignId: string,
    @Body() generateContentDto: GenerateContentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const campaign = await this.contentService.generateCampaign(
      userId,
      campaignId,
      generateContentDto?.instruction,
    );

    return {
      success: true,
      message: 'Campaign content generated successfully',
      data: campaign,
    };
  }

  @Get('campaigns')
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

    const result = await this.contentService.findAll(userId, validatedPage, validatedLimit);

    return {
      success: true,
      data: {
        campaigns: result.campaigns,
        pagination: {
          page: validatedPage,
          limit: validatedLimit,
          total: result.total,
          pages: Math.ceil(result.total / validatedLimit),
        },
      },
    };
  }

  @Get('campaigns/:id')
  async findOne(
    @Param('id') campaignId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const campaign = await this.contentService.findOne(userId, campaignId);

    return {
      success: true,
      data: campaign,
    };
  }

  @Patch('campaigns/:id')
  async updateCampaign(
    @Param('id') campaignId: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const campaign = await this.contentService.updateCampaign(
      userId,
      campaignId,
      updateCampaignDto,
    );

    return {
      success: true,
      message: 'Campaign updated successfully',
      data: campaign,
    };
  }

  @Post('campaigns/:id/regenerate-platform')
  async regeneratePlatform(
    @Param('id') campaignId: string,
    @Body() regeneratePlatformDto: RegeneratePlatformDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const campaign = await this.contentService.regeneratePlatform(
      userId,
      campaignId,
      regeneratePlatformDto.platform,
      regeneratePlatformDto.instruction,
    );

    return {
      success: true,
      message: `Platform ${regeneratePlatformDto.platform} regenerated successfully`,
      data: campaign,
    };
  }

  @Post('campaigns/:id/regenerate-post')
  async regeneratePost(
    @Param('id') campaignId: string,
    @Body() regeneratePostDto: RegeneratePostDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const campaign = await this.contentService.regeneratePost(
      userId,
      campaignId,
      {
        postId: regeneratePostDto.postId,
        index: regeneratePostDto.index,
      },
      regeneratePostDto.instruction,
    );

    return {
      success: true,
      message: 'Post regenerated successfully',
      data: campaign,
    };
  }

  @Delete('campaigns/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCampaign(
    @Param('id') campaignId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    await this.contentService.deleteCampaign(userId, campaignId);

    return {
      success: true,
      message: 'Campaign deleted successfully',
    };
  }
}

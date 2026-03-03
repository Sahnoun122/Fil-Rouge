import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateScheduledPostDto,
  ListScheduledPostsDto,
  MoveScheduledPostDto,
  UpdateScheduledPostDto,
} from './dto';
import { CalendarService } from './calendar.service';

@Controller('calendar/posts')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  async create(
    @Body() createScheduledPostDto: CreateScheduledPostDto,
    @Req() req: Request,
  ) {
    const userId = this.getAuthenticatedUserId(req);
    const post = await this.calendarService.createScheduledPost(
      userId,
      createScheduledPostDto,
    );

    return {
      success: true,
      message: 'Publication planifiee creee avec succes',
      data: post,
    };
  }

  @Get()
  async findAll(@Query() query: ListScheduledPostsDto, @Req() req: Request) {
    const userId = this.getAuthenticatedUserId(req);
    const result = await this.calendarService.listScheduledPosts(userId, query);

    return {
      success: true,
      data: {
        posts: result.posts,
        total: result.total,
        ...(result.page !== undefined
          ? {
              pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                pages: result.pages,
              },
            }
          : {}),
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = this.getAuthenticatedUserId(req);
    const post = await this.calendarService.findScheduledPostById(userId, id);

    return {
      success: true,
      data: post,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateScheduledPostDto: UpdateScheduledPostDto,
    @Req() req: Request,
  ) {
    const userId = this.getAuthenticatedUserId(req);
    const post = await this.calendarService.updateScheduledPost(
      userId,
      id,
      updateScheduledPostDto,
    );

    return {
      success: true,
      message: 'Publication planifiee mise a jour avec succes',
      data: post,
    };
  }

  @Patch(':id/move')
  async move(
    @Param('id') id: string,
    @Body() moveScheduledPostDto: MoveScheduledPostDto,
    @Req() req: Request,
  ) {
    const userId = this.getAuthenticatedUserId(req);
    const post = await this.calendarService.moveScheduledPost(
      userId,
      id,
      moveScheduledPostDto,
    );

    return {
      success: true,
      message: 'Publication planifiee deplacee avec succes',
      data: post,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const userId = this.getAuthenticatedUserId(req);
    await this.calendarService.deleteScheduledPost(userId, id);

    return {
      success: true,
      message: 'Publication planifiee supprimee avec succes',
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

import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findMine(@Req() req: Request) {
    const userId = this.getAuthenticatedUserId(req);
    const notifications =
      await this.notificationsService.getUserNotifications(userId);

    return {
      success: true,
      data: notifications,
    };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: Request) {
    const userId = this.getAuthenticatedUserId(req);
    const notification = await this.notificationsService.markNotificationAsRead(
      userId,
      id,
    );

    return {
      success: true,
      message: 'Notification marquee comme lue',
      data: notification,
    };
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: Request) {
    const userId = this.getAuthenticatedUserId(req);
    const updatedCount =
      await this.notificationsService.markAllNotificationsAsRead(userId);

    return {
      success: true,
      message: 'Toutes les notifications ont ete marquees comme lues',
      data: {
        updatedCount,
      },
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

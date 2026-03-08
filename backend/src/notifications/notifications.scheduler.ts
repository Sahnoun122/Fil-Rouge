import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsScheduler {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Cron(CronExpression.EVERY_SECOND)
  async handleDueReminders(): Promise<void> {
    await this.notificationsService.processDueReminders();
  }
}

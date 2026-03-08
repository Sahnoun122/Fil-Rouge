import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ScheduledPost,
  ScheduledPostSchema,
} from '../calendar/schemas/scheduled-post.schema';
import { User, UserSchema } from '../users/entities/user.entity';
import { EmailService, LoggerEmailService } from './email/email.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsScheduler } from './notifications.scheduler';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationSchema } from './schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: ScheduledPost.name, schema: ScheduledPostSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsScheduler,
    {
      provide: EmailService,
      useClass: LoggerEmailService,
    },
  ],
  exports: [NotificationsService, EmailService],
})
export class NotificationsModule {}

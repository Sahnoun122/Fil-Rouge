import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ContentCampaign,
  ContentCampaignSchema,
} from '../content/schemas/content-campaign.schema';
import {
  Strategy,
  StrategySchema,
} from '../strategies/schemas/strategy.schema';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import {
  ScheduledPost,
  ScheduledPostSchema,
} from './schemas/scheduled-post.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule,
    MongooseModule.forFeature([
      { name: ScheduledPost.name, schema: ScheduledPostSchema },
      { name: Strategy.name, schema: StrategySchema },
      { name: ContentCampaign.name, schema: ContentCampaignSchema },
    ]),
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}

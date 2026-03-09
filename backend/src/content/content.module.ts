import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from '../ai/ai.module';
import { CalendarModule } from '../calendar/calendar.module';
import {
  Strategy,
  StrategySchema,
} from '../strategies/schemas/strategy.schema';
import { User, UserSchema } from '../users/entities/user.entity';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import {
  ContentCampaign,
  ContentCampaignSchema,
} from './schemas/content-campaign.schema';
import { AutoSchedulerService } from './auto-scheduler.service';
import { AiMonitoringModule } from '../ai-monitoring/ai-monitoring.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContentCampaign.name, schema: ContentCampaignSchema },
      { name: Strategy.name, schema: StrategySchema },
      { name: User.name, schema: UserSchema },
    ]),
    AiModule,
    CalendarModule,
    AiMonitoringModule,
  ],
  controllers: [ContentController],
  providers: [ContentService, AutoSchedulerService],
  exports: [ContentService],
})
export class ContentModule {}

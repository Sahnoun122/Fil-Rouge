import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from '../ai/ai.module';
import { Strategy, StrategySchema } from '../strategies/schemas/strategy.schema';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import {
  ContentCampaign,
  ContentCampaignSchema,
} from './schemas/content-campaign.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContentCampaign.name, schema: ContentCampaignSchema },
      { name: Strategy.name, schema: StrategySchema },
    ]),
    AiModule,
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from '../ai/ai.module';
import { Strategy, StrategySchema } from '../strategies/schemas/strategy.schema';
import { SwotController } from './swot.controller';
import { Swot, SwotSchema } from './schemas/swot.schema';
import { SwotService } from './swot.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Swot.name, schema: SwotSchema },
      { name: Strategy.name, schema: StrategySchema },
    ]),
    AiModule,
  ],
  controllers: [SwotController],
  providers: [SwotService],
  exports: [SwotService],
})
export class SwotModule {}

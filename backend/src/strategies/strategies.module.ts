import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StrategiesService } from './strategies.service';
import { StrategiesController } from './strategies.controller';
import { Strategy, StrategySchema } from './schemas/strategy.schema';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Strategy.name, schema: StrategySchema },
    ]),
    AiModule,
  ],
  controllers: [StrategiesController],
  providers: [StrategiesService],
  exports: [StrategiesService],
})
export class StrategiesModule {}
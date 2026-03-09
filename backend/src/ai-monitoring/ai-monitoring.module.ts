import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiMonitoringController } from './ai-monitoring.controller';
import { AiMonitoringService } from './ai-monitoring.service';
import { AiLog, AiLogSchema } from './schemas/ai-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AiLog.name, schema: AiLogSchema }]),
  ],
  controllers: [AiMonitoringController],
  providers: [AiMonitoringService],
  exports: [AiMonitoringService],
})
export class AiMonitoringModule {}

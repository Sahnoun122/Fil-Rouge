import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiMonitoringController } from './ai-monitoring.controller';
import { AiMonitoringService } from './ai-monitoring.service';
import { AiLog, AiLogSchema } from './schemas/ai-log.schema';
import { User, UserSchema } from '../users/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiLog.name, schema: AiLogSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AiMonitoringController],
  providers: [AiMonitoringService],
  exports: [AiMonitoringService],
})
export class AiMonitoringModule {}

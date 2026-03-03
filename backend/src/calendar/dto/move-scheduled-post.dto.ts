import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class MoveScheduledPostDto {
  @Type(() => Date)
  @IsDate()
  scheduledAt: Date;
}

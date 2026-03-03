import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  CalendarPlatform,
  ScheduledPostStatus,
} from '../schemas/scheduled-post.schema';

export class ListScheduledPostsDto {
  @Type(() => Date)
  @IsDate()
  rangeStart: Date;

  @Type(() => Date)
  @IsDate()
  rangeEnd: Date;

  @IsOptional()
  @IsEnum(CalendarPlatform)
  platform?: CalendarPlatform;

  @IsOptional()
  @IsEnum(ScheduledPostStatus)
  status?: ScheduledPostStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDate,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  CalendarPlatform,
  ScheduledPostStatus,
  ScheduledPostType,
} from '../schemas/scheduled-post.schema';

export class CreateScheduledPostDto {
  @IsOptional()
  @IsMongoId()
  strategyId?: string | null;

  @IsOptional()
  @IsMongoId()
  campaignId?: string | null;

  @IsEnum(CalendarPlatform)
  platform: CalendarPlatform;

  @IsEnum(ScheduledPostType)
  postType: ScheduledPostType;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string | null;

  @IsString()
  @MaxLength(5000)
  caption: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  hashtags?: string[] | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(2000, { each: true })
  mediaUrls?: string[] | null;

  @Type(() => Date)
  @IsDate()
  scheduledAt: Date;

  @IsOptional()
  @IsEnum(ScheduledPostStatus)
  status?: ScheduledPostStatus;

  @IsString()
  @MaxLength(100)
  timezone: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}

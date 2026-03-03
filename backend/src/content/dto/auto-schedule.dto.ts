import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  Min,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export enum AutoScheduleExcludedDay {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

const TIME_WINDOW_PATTERN =
  /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/;

export class PreferredTimeWindowsDto {
  @IsOptional()
  @IsArray()
  @Matches(TIME_WINDOW_PATTERN, { each: true })
  instagram?: string[];

  @IsOptional()
  @IsArray()
  @Matches(TIME_WINDOW_PATTERN, { each: true })
  tiktok?: string[];

  @IsOptional()
  @IsArray()
  @Matches(TIME_WINDOW_PATTERN, { each: true })
  facebook?: string[];

  @IsOptional()
  @IsArray()
  @Matches(TIME_WINDOW_PATTERN, { each: true })
  linkedin?: string[];

  @IsOptional()
  @IsArray()
  @Matches(TIME_WINDOW_PATTERN, { each: true })
  x?: string[];

  @IsOptional()
  @IsArray()
  @Matches(TIME_WINDOW_PATTERN, { each: true })
  youtube?: string[];

  @IsOptional()
  @IsArray()
  @Matches(TIME_WINDOW_PATTERN, { each: true })
  snapchat?: string[];

  @IsOptional()
  @IsArray()
  @Matches(TIME_WINDOW_PATTERN, { each: true })
  pinterest?: string[];

  @IsOptional()
  @IsArray()
  @Matches(TIME_WINDOW_PATTERN, { each: true })
  threads?: string[];
}

export class AutoScheduleDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(21)
  frequencyPerWeek: number;

  @IsString()
  @MaxLength(100)
  timezone: string;

  @IsOptional()
  @IsArray()
  @IsEnum(AutoScheduleExcludedDay, { each: true })
  excludedDays?: AutoScheduleExcludedDay[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PreferredTimeWindowsDto)
  preferredTimeWindows?: PreferredTimeWindowsDto;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  syncToCalendar?: boolean;
}

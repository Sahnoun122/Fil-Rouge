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
  Max,
  MaxLength,
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

export type PreferredTimeWindowsDto = Record<string, string[]>;

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
  preferredTimeWindows?: PreferredTimeWindowsDto;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  syncToCalendar?: boolean;
}

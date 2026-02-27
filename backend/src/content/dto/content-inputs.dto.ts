import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ContentCampaignInputsDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  productOffer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  targetAudience?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  tone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  callToAction?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  promoDetails?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budget?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contentPillars?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(21)
  frequencyPerWeek?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  platforms?: string[];
}

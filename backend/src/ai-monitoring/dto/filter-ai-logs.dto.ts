import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  AI_FEATURE_TYPES,
  AI_LOG_STATUSES,
} from '../schemas/ai-log.schema';
import type { AiFeatureType, AiLogStatus } from '../schemas/ai-log.schema';

export class FilterAiLogsDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed)) {
      return value;
    }

    return Math.max(1, parsed);
  })
  @IsInt({ message: 'La page doit etre un nombre entier' })
  @Min(1, { message: 'La page doit etre superieure ou egale a 1' })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed)) {
      return value;
    }

    return Math.min(100, Math.max(1, parsed));
  })
  @IsInt({ message: 'La limite doit etre un nombre entier' })
  @Min(1, { message: 'La limite doit etre superieure ou egale a 1' })
  @Max(100, { message: 'La limite ne peut pas depasser 100' })
  limit?: number = 20;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsDateString(
    {},
    { message: 'dateFrom doit etre une date ISO valide (YYYY-MM-DD)' },
  )
  dateFrom?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsDateString(
    {},
    { message: 'dateTo doit etre une date ISO valide (YYYY-MM-DD)' },
  )
  dateTo?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsMongoId({ message: 'userId doit etre un ObjectId Mongo valide' })
  userId?: string;

  @IsOptional()
  @IsString({ message: 'userSearch doit etre une chaine de caracteres' })
  @MaxLength(120, {
    message: 'userSearch ne peut pas depasser 120 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  userSearch?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEnum(AI_FEATURE_TYPES, {
    message: `featureType doit etre l'une des valeurs: ${AI_FEATURE_TYPES.join(', ')}`,
  })
  featureType?: AiFeatureType;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEnum(AI_LOG_STATUSES, {
    message: `status doit etre l'une des valeurs: ${AI_LOG_STATUSES.join(', ')}`,
  })
  status?: AiLogStatus;

  @IsOptional()
  @IsString({ message: 'actionType doit etre une chaine de caracteres' })
  @MaxLength(120, {
    message: 'actionType ne peut pas depasser 120 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  actionType?: string;
}

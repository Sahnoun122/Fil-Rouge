import { Transform, TransformFnParams } from 'class-transformer';
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

const normalizeDateString = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  const normalized = value.trim();
  if (!normalized) {
    return normalized;
  }

  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (isoPattern.test(normalized)) {
    return normalized;
  }

  const localPattern = /^(\d{2})[/-](\d{2})[/-](\d{4})$/;
  const match = normalized.match(localPattern);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }

  return normalized;
};

export class FilterAiLogsDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed)) {
      return value as unknown;
    }

    return Math.max(1, parsed);
  })
  @IsInt({ message: 'La page doit etre un nombre entier' })
  @Min(1, { message: 'La page doit etre superieure ou egale a 1' })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed)) {
      return value as unknown;
    }

    return Math.min(100, Math.max(1, parsed));
  })
  @IsInt({ message: 'La limite doit etre un nombre entier' })
  @Min(1, { message: 'La limite doit etre superieure ou egale a 1' })
  @Max(100, { message: 'La limite ne peut pas depasser 100' })
  limit?: number = 20;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => normalizeDateString(value))
  @IsDateString(
    {},
    { message: 'dateFrom doit etre une date ISO valide (YYYY-MM-DD)' },
  )
  dateFrom?: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => normalizeDateString(value))
  @IsDateString(
    {},
    { message: 'dateTo doit etre une date ISO valide (YYYY-MM-DD)' },
  )
  dateTo?: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : (value as unknown)))
  @IsMongoId({ message: 'userId doit etre un ObjectId Mongo valide' })
  userId?: string;

  @IsOptional()
  @IsString({ message: 'userSearch doit etre une chaine de caracteres' })
  @MaxLength(120, {
    message: 'userSearch ne peut pas depasser 120 caracteres',
  })
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : (value as unknown)))
  userSearch?: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : (value as unknown)))
  @IsEnum(AI_FEATURE_TYPES, {
    message: `featureType doit etre l'une des valeurs: ${AI_FEATURE_TYPES.join(', ')}`,
  })
  featureType?: AiFeatureType;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : (value as unknown)))
  @IsEnum(AI_LOG_STATUSES, {
    message: `status doit etre l'une des valeurs: ${AI_LOG_STATUSES.join(', ')}`,
  })
  status?: AiLogStatus;

  @IsOptional()
  @IsString({ message: 'actionType doit etre une chaine de caracteres' })
  @MaxLength(120, {
    message: 'actionType ne peut pas depasser 120 caracteres',
  })
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : (value as unknown)))
  actionType?: string;
}

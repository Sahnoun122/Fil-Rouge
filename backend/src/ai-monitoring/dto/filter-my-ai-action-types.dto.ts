import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { AI_FEATURE_TYPES, AI_LOG_STATUSES } from '../schemas/ai-log.schema';
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

export class FilterMyAiActionTypesDto {
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
  @IsString({ message: 'q doit etre une chaine de caracteres' })
  @MaxLength(120, {
    message: 'q ne peut pas depasser 120 caracteres',
  })
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : (value as unknown)))
  q?: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed)) {
      return value as unknown;
    }

    return Math.min(20, Math.max(1, parsed));
  })
  @IsInt({ message: 'La limite doit etre un nombre entier' })
  @Min(1, { message: 'La limite doit etre superieure ou egale a 1' })
  @Max(20, { message: 'La limite ne peut pas depasser 20' })
  limit?: number = 8;
}

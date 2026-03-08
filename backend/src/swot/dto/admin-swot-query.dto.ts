import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AdminSwotQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La page doit etre un nombre entier' })
  @Min(1, { message: 'La page doit etre superieure ou egale a 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La limite doit etre un nombre entier' })
  @Min(1, { message: 'La limite doit etre superieure ou egale a 1' })
  @Max(100, { message: 'La limite ne peut pas depasser 100' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'La recherche doit etre une chaine de caracteres' })
  @MaxLength(100, {
    message: 'La recherche ne peut pas depasser 100 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  search?: string;
}

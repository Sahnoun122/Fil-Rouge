import { Type } from 'class-transformer';
import {
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class RegeneratePostDto {
  @IsOptional()
  @IsMongoId()
  postId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  index?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  instruction?: string;
}

import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GenerateContentDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  instruction?: string;
}

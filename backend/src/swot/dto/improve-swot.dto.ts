import { IsOptional, IsString } from 'class-validator';

export class ImproveSwotDto {
  @IsOptional()
  @IsString()
  instruction?: string;
}

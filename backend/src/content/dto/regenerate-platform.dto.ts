import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RegeneratePlatformDto {
  @IsString()
  @MaxLength(80)
  platform: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  instruction?: string;
}

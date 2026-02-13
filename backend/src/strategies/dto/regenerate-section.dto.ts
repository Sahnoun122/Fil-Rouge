import { IsString, IsOptional } from 'class-validator';

export class RegenerateSectionDto {
  @IsString()
  sectionKey: string;

  @IsOptional()
  @IsString()
  instruction?: string;
}
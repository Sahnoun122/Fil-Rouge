import { IsString, IsOptional } from 'class-validator';

export class ImproveSectionDto {
  @IsString()
  sectionKey: string;

  @IsOptional()
  @IsString()
  instruction?: string;
}
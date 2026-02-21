import { IsArray, IsOptional, IsString } from 'class-validator';

export class SwotInputsDto {
  @IsOptional()
  @IsString()
  notesInternes?: string;

  @IsOptional()
  @IsString()
  notesExternes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  concurrents?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ressources?: string[];

  @IsOptional()
  @IsString()
  objectifs?: string;
}

export class SwotManualDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  strengths?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  weaknesses?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  opportunities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  threats?: string[];
}

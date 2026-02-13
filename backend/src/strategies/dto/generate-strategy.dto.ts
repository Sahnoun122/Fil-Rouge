import { IsString, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { MainObjective, Tone } from '../schemas/strategy.schema';

export class GenerateStrategyDto {
  @IsString()
  businessName: string;

  @IsString()
  industry: string;

  @IsString()
  productOrService: string;

  @IsString()
  targetAudience: string;

  @IsString()
  location: string;

  @IsEnum(MainObjective)
  mainObjective: MainObjective;

  @IsEnum(Tone)
  tone: Tone;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;
}
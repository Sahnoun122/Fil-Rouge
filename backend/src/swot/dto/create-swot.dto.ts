import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { SwotInputsDto, SwotManualDto } from './swot-payload.dto';

export class CreateSwotDto {
  @IsString()
  strategyId: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SwotInputsDto)
  inputs?: SwotInputsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SwotManualDto)
  swot?: SwotManualDto;
}

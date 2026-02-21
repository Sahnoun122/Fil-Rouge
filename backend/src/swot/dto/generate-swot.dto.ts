import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { SwotInputsDto } from './swot-payload.dto';

export class GenerateSwotDto {
  @IsString()
  strategyId: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SwotInputsDto)
  inputs?: SwotInputsDto;

  @IsOptional()
  @IsString()
  instruction?: string;
}

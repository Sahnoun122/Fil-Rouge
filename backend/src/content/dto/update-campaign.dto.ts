import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ContentCampaignInputsDto } from './content-inputs.dto';

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ContentCampaignInputsDto)
  inputs?: ContentCampaignInputsDto;
}

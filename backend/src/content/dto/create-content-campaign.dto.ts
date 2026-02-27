import { Type } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ContentMode } from '../schemas/content-campaign.schema';
import { ContentCampaignInputsDto } from './content-inputs.dto';

export class CreateContentCampaignDto {
  @IsMongoId()
  strategyId: string;

  @IsEnum(ContentMode)
  mode: ContentMode;

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

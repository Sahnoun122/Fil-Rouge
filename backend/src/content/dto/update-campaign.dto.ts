import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ContentCampaignInputsDto } from './content-inputs.dto';

class PostScheduleDto {
  @IsDateString()
  date: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  time: string;

  @IsString()
  @MaxLength(100)
  timezone: string;
}

class UpdateGeneratedPostScheduleDto {
  @IsOptional()
  @IsMongoId()
  postId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  index?: number;

  @ValidateNested()
  @Type(() => PostScheduleDto)
  schedule: PostScheduleDto;
}

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateGeneratedPostScheduleDto)
  generatedPosts?: UpdateGeneratedPostScheduleDto[];
}

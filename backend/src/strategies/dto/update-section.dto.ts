import { IsString, IsObject } from 'class-validator';

export class UpdateSectionDto {
  @IsString()
  sectionKey: string;

  @IsObject()
  data: object;
}
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Le nom complet doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'Le nom complet ne peut pas dépasser 100 caractères' })
  @Transform(({ value }) => value?.trim())
  fullName?: string;

  @IsOptional()
  @IsString({ message: 'Le numéro de téléphone doit être une chaîne de caractères' })
  @MaxLength(20, { message: 'Le numéro de téléphone ne peut pas dépasser 20 caractères' })
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Le nom de l\'entreprise doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères' })
  @Transform(({ value }) => value?.trim())
  companyName?: string;

  @IsOptional()
  @IsString({ message: 'Le secteur d\'activité doit être une chaîne de caractères' })
  @MaxLength(50, { message: 'Le secteur d\'activité ne peut pas dépasser 50 caractères' })
  @Transform(({ value }) => value?.trim())
  industry?: string;
}

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Le mot de passe actuel est requis' })
  @IsString({ message: 'Le mot de passe actuel doit être une chaîne de caractères' })
  currentPassword: string;

  @IsNotEmpty({ message: 'Le nouveau mot de passe est requis' })
  @IsString({ message: 'Le nouveau mot de passe doit être une chaîne de caractères' })
  newPassword: string;
}
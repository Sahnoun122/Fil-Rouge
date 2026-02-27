import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  Matches,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import type { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Le nom complet doit etre une chaine de caracteres' })
  @MaxLength(100, { message: 'Le nom complet ne peut pas depasser 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  fullName?: string;

  @IsOptional()
  @IsString({ message: 'Le numero de telephone doit etre une chaine de caracteres' })
  @MaxLength(20, { message: 'Le numero de telephone ne peut pas depasser 20 caracteres' })
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @IsOptional()
  @IsString({ message: "Le nom de l'entreprise doit etre une chaine de caracteres" })
  @MaxLength(100, { message: "Le nom de l'entreprise ne peut pas depasser 100 caracteres" })
  @Transform(({ value }) => value?.trim())
  companyName?: string;

  @IsOptional()
  @IsString({ message: "Le secteur d'activite doit etre une chaine de caracteres" })
  @MaxLength(50, { message: "Le secteur d'activite ne peut pas depasser 50 caracteres" })
  @Transform(({ value }) => value?.trim())
  industry?: string;
}

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Le mot de passe actuel est requis' })
  @IsString({ message: 'Le mot de passe actuel doit etre une chaine de caracteres' })
  currentPassword: string;

  @IsNotEmpty({ message: 'Le nouveau mot de passe est requis' })
  @IsString({ message: 'Le nouveau mot de passe doit etre une chaine de caracteres' })
  newPassword: string;
}

export class AdminCreateUserDto {
  @IsNotEmpty({ message: 'Le nom complet est requis' })
  @IsString({ message: 'Le nom complet doit etre une chaine de caracteres' })
  @MaxLength(100, { message: 'Le nom complet ne peut pas depasser 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @IsNotEmpty({ message: "L'email est requis" })
  @IsEmail({}, { message: "Format d'email invalide" })
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  email: string;

  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @IsString({ message: 'Le mot de passe doit etre une chaine de caracteres' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message:
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractere special',
  })
  password: string;

  @IsOptional()
  @IsString({ message: 'Le numero de telephone doit etre une chaine de caracteres' })
  @MaxLength(20, { message: 'Le numero de telephone ne peut pas depasser 20 caracteres' })
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @IsOptional()
  @IsString({ message: "Le nom de l'entreprise doit etre une chaine de caracteres" })
  @MaxLength(150, { message: "Le nom de l'entreprise ne peut pas depasser 150 caracteres" })
  @Transform(({ value }) => value?.trim())
  companyName?: string;

  @IsOptional()
  @IsString({ message: "Le secteur d'activite doit etre une chaine de caracteres" })
  @MaxLength(100, { message: "Le secteur d'activite ne peut pas depasser 100 caracteres" })
  @Transform(({ value }) => value?.trim())
  industry?: string;

  @IsOptional()
  @IsIn(['admin', 'user'], { message: 'Le role doit etre admin ou user' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  role?: UserRole = 'user';

  @IsOptional()
  @IsBoolean({ message: 'Le statut actif doit etre un booleen' })
  isActive?: boolean = true;
}

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Le nom complet doit etre une chaine de caracteres' })
  @MaxLength(100, { message: 'Le nom complet ne peut pas depasser 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  fullName?: string;

  @IsOptional()
  @IsEmail({}, { message: "Format d'email invalide" })
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  email?: string;

  @IsOptional()
  @IsString({ message: 'Le mot de passe doit etre une chaine de caracteres' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message:
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractere special',
  })
  password?: string;

  @IsOptional()
  @IsString({ message: 'Le numero de telephone doit etre une chaine de caracteres' })
  @MaxLength(20, { message: 'Le numero de telephone ne peut pas depasser 20 caracteres' })
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @IsOptional()
  @IsString({ message: "Le nom de l'entreprise doit etre une chaine de caracteres" })
  @MaxLength(150, { message: "Le nom de l'entreprise ne peut pas depasser 150 caracteres" })
  @Transform(({ value }) => value?.trim())
  companyName?: string;

  @IsOptional()
  @IsString({ message: "Le secteur d'activite doit etre une chaine de caracteres" })
  @MaxLength(100, { message: "Le secteur d'activite ne peut pas depasser 100 caracteres" })
  @Transform(({ value }) => value?.trim())
  industry?: string;

  @IsOptional()
  @IsIn(['admin', 'user'], { message: 'Le role doit etre admin ou user' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  role?: UserRole;

  @IsOptional()
  @IsBoolean({ message: 'Le statut actif doit etre un booleen' })
  isActive?: boolean;
}

export class UpdateUserRoleDto {
  @IsNotEmpty({ message: 'Le role est requis' })
  @IsIn(['admin', 'user'], { message: 'Le role doit etre admin ou user' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  role: UserRole;
}

export class AdminUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La page doit etre un nombre entier' })
  @Min(1, { message: 'La page doit etre superieure ou egale a 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La limite doit etre un nombre entier' })
  @Min(1, { message: 'La limite doit etre superieure ou egale a 1' })
  @Max(100, { message: 'La limite ne peut pas depasser 100' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'La recherche doit etre une chaine de caracteres' })
  @MaxLength(100, { message: 'La recherche ne peut pas depasser 100 caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  search?: string;

  @IsOptional()
  @IsIn(['admin', 'user'], { message: 'Le role doit etre admin ou user' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  role?: UserRole;

  @IsOptional()
  @IsIn(['active', 'inactive'], { message: "Le statut doit etre 'active' ou 'inactive'" })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  status?: 'active' | 'inactive';
}

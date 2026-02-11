import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches, Transform } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Le nom complet est requis' })
  @IsString({ message: 'Le nom complet doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'Le nom complet ne peut pas dépasser 100 caractères' })
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @IsNotEmpty({ message: 'L\'email est requis' })
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial' }
  )
  password: string;

  @IsNotEmpty({ message: 'Le numéro de téléphone est requis' })
  @IsString({ message: 'Le numéro de téléphone doit être une chaîne de caractères' })
  @Matches(
    /^[+]?[0-9\s\-\(\)]{10,15}$/,
    { message: 'Format de numéro de téléphone invalide' }
  )
  @Transform(({ value }) => value?.trim())
  phone: string;

  @IsNotEmpty({ message: 'Le nom de l\'entreprise est requis' })
  @IsString({ message: 'Le nom de l\'entreprise doit être une chaîne de caractères' })
  @MaxLength(150, { message: 'Le nom de l\'entreprise ne peut pas dépasser 150 caractères' })
  @Transform(({ value }) => value?.trim())
  companyName: string;

  @IsNotEmpty({ message: 'Le secteur d\'activité est requis' })
  @IsString({ message: 'Le secteur d\'activité doit être une chaîne de caractères' })
  @MaxLength(100, { message: 'Le secteur d\'activité ne peut pas dépasser 100 caractères' })
  @Transform(({ value }) => value?.trim())
  industry: string;
}
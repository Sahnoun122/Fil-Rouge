import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
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

  @IsNotEmpty({ message: 'Le numero de telephone est requis' })
  @IsString({ message: 'Le numero de telephone doit etre une chaine de caracteres' })
  @Matches(/^[+]?[0-9\s\-\(\)]{10,15}$/, { message: 'Format de numero de telephone invalide' })
  @Transform(({ value }) => value?.trim())
  phone: string;

  @IsNotEmpty({ message: "Le nom de l'entreprise est requis" })
  @IsString({ message: "Le nom de l'entreprise doit etre une chaine de caracteres" })
  @MaxLength(150, { message: "Le nom de l'entreprise ne peut pas depasser 150 caracteres" })
  @Transform(({ value }) => value?.trim())
  companyName: string;

  @IsNotEmpty({ message: "Le secteur d'activite est requis" })
  @IsString({ message: "Le secteur d'activite doit etre une chaine de caracteres" })
  @MaxLength(100, { message: "Le secteur d'activite ne peut pas depasser 100 caracteres" })
  @Transform(({ value }) => value?.trim())
  industry: string;
}

import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Le token de reinitialisation est requis' })
  @IsString({ message: 'Le token doit etre une chaine de caracteres' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  token: string;

  @IsNotEmpty({ message: 'Le nouveau mot de passe est requis' })
  @IsString({
    message: 'Le nouveau mot de passe doit etre une chaine de caracteres',
  })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caracteres',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractere special',
    },
  )
  newPassword: string;
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      usernameField: 'email', // Utiliser email au lieu de username
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<UserDocument> {
    // Trouver l'utilisateur avec le mot de passe
    const user = await this.usersService.findByEmailWithPassword(email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifications de sécurité
    if (!user.isActive) {
      throw new UnauthorizedException('Compte désactivé');
    }

    return user;
  }
}
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '../../users/users.service';
import { UserDocument } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  role: string;
  plan: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<UserDocument> {
    const user = await this.usersService.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Compte désactivé');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('Compte banni');
    }

    return user;
  }
}
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';
import { UserDocument, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    emailVerified: boolean;
    lastLoginAt?: Date;
  };
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      const existingUser = await this.usersService.findByEmail(registerDto.email);
      if (existingUser) {
        throw new ConflictException('Cet email est deja utilise');
      }

      const user = await this.usersService.createUser({
        fullName: registerDto.fullName,
        email: registerDto.email,
        password: registerDto.password,
        phone: registerDto.phone,
        companyName: registerDto.companyName,
        industry: registerDto.industry,
      });

      const tokens = await this.generateTokens(user);

      await this.usersService.updateRefreshToken(user._id.toString(), tokens.refreshToken);
      await this.usersService.updateLastLogin(user._id.toString());

      return {
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          lastLoginAt: user.lastLoginAt,
        },
        tokens,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la creation du compte');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      const user = await this.usersService.findByEmailWithPassword(loginDto.email);

      if (!user) {
        this.logger.warn(`Login reject: user not found for email=${loginDto.email}`);
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }

      if (!user.isActive) {
        this.logger.warn(`Login reject: inactive account email=${loginDto.email}`);
        throw new UnauthorizedException('Votre compte a ete desactive');
      }

      // First compare exact input; then compare trimmed input to tolerate accidental spaces.
      const candidates = [loginDto.password];
      const trimmedPassword = loginDto.password.trim();
      if (trimmedPassword !== loginDto.password) {
        candidates.push(trimmedPassword);
      }

      let isPasswordValid = false;
      for (const candidate of candidates) {
        // eslint-disable-next-line no-await-in-loop
        if (await bcrypt.compare(candidate, user.password)) {
          isPasswordValid = true;
          break;
        }
      }

      if (!isPasswordValid) {
        this.logger.warn(`Login reject: invalid password for email=${loginDto.email}`);
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }

      const tokens = await this.generateTokens(user);

      await Promise.all([
        this.usersService.updateRefreshToken(user._id.toString(), tokens.refreshToken),
        this.usersService.updateLastLogin(user._id.toString()),
      ]);

      return {
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          lastLoginAt: new Date(),
        },
        tokens,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la connexion');
    }
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Token de rafraichissement invalide');
      }

      const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Token de rafraichissement invalide');
      }

      const newTokens = await this.generateTokens(user);
      await this.usersService.updateRefreshToken(user._id.toString(), newTokens.refreshToken);

      return newTokens;
    } catch {
      throw new UnauthorizedException('Token de rafraichissement invalide');
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    try {
      await this.usersService.removeRefreshToken(userId);
      return { message: 'Deconnexion reussie' };
    } catch {
      throw new BadRequestException('Erreur lors de la deconnexion');
    }
  }

  async validateUserByEmail(email: string): Promise<UserDocument | null> {
    try {
      return await this.usersService.findByEmail(email);
    } catch {
      return null;
    }
  }

  async validateUserById(userId: string): Promise<UserDocument | null> {
    try {
      const user = await this.usersService.findById(userId);
      return user?.isActive ? user : null;
    } catch {
      return null;
    }
  }

  private async generateTokens(user: UserDocument): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET') || 'default-secret',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret',
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}

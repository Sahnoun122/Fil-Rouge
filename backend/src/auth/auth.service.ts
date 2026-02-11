import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';
import { User, UserDocument, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: string; // user ID
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
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // 🔐 AUTHENTIFICATION
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      // Vérifier si l'email n'est pas déjà utilisé
      const existingUser = await this.usersService.findByEmail(registerDto.email);
      if (existingUser) {
        throw new ConflictException('Cet email est déjà utilisé');
      }

      // Créer le nouvel utilisateur
      const user = await this.usersService.createUser({
        fullName: registerDto.fullName,
        email: registerDto.email,
        password: registerDto.password,
        phone: registerDto.phone,
        companyName: registerDto.companyName,
        industry: registerDto.industry,
      });

      // Générer les tokens JWT
      const tokens = await this.generateTokens(user);

      // Sauvegarder le refresh token
      // Sauvegarder le refresh token
      await this.usersService.updateRefreshToken(user._id.toString(), tokens.refreshToken);

      // Mettre à jour la date de dernière connexion
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
      throw new BadRequestException('Erreur lors de la création du compte');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      // Récupérer l'utilisateur avec le mot de passe
      const user = await this.usersService.findByEmailWithPassword(loginDto.email);
      
      if (!user) {
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }

      // Vérifier que le compte est actif
      if (!user.isActive) {
        throw new UnauthorizedException('Votre compte a été désactivé');
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }

      // Générer les nouveaux tokens
      const tokens = await this.generateTokens(user);

      // Sauvegarder le refresh token et mettre à jour la dernière connexion
      await Promise.all([
        this.usersService.updateRefreshToken(user._id.toString(), tokens.refreshToken),
        this.usersService.updateLastLogin(user._id.toString())
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
      // Vérifier le refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Récupérer l'utilisateur
      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Token de rafraîchissement invalide');
      }

      // Vérifier que le refresh token correspond
      const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Token de rafraîchissement invalide');
      }

      // Générer de nouveaux tokens
      const newTokens = await this.generateTokens(user);

      // Mettre à jour le refresh token
      await this.usersService.updateRefreshToken(user._id.toString(), newTokens.refreshToken);

      return newTokens;

    } catch (error) {
      throw new UnauthorizedException('Token de rafraîchissement invalide');
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    try {
      // Supprimer le refresh token
      await this.usersService.removeRefreshToken(userId);
      
      return { message: 'Déconnexion réussie' };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la déconnexion');
    }
  }

  // 🔐 VALIDATION
  async validateUserByEmail(email: string): Promise<UserDocument | null> {
    try {
      return await this.usersService.findByEmail(email);
    } catch (error) {
      return null;
    }
  }

  async validateUserById(userId: string): Promise<UserDocument | null> {
    try {
      const user = await this.usersService.findById(userId);
      return user?.isActive ? user : null;
    } catch (error) {
      return null;
    }
  }

  // 🛠️ UTILITAIRES PRIVÉES
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
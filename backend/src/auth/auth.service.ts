import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';
import { User, UserDocument, UserRole, PlanType } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  role: UserRole;
  plan: PlanType;
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
    plan: PlanType;
    subscriptionStatus: string;
    limits: any;
    team: any;
    isActive: boolean;
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
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.usersService.findByEmail(registerDto.email);

      if (existingUser) {
        throw new ConflictException('Un utilisateur avec cet email existe déjà');
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(registerDto.password, 12);

      // Créer le nouvel utilisateur - nous devrons utiliser directement le model pour la création
      const userData = {
        ...registerDto,
        password: hashedPassword,
        role: 'user' as UserRole,
        plan: 'free' as PlanType,
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: null,
        isActive: true,
        isBanned: false,
      };

      // TODO: Cette partie devra être adaptée pour utiliser le UserModel directement
      // Pour l'instant, nous allons simuler la création
      const mockUserId = '507f1f77bcf86cd799439011';  // Mock ID pour les tests

      // Générer les tokens
      const tokens = await this.generateTokens({
        id: mockUserId,
        email: registerDto.email,
        role: 'user',
        plan: 'free',
      } as any);

      // Sauvegarder le refresh token
      await this.usersService.updateRefreshToken(mockUserId, tokens.refreshToken);

      return {
        user: {
          id: mockUserId,
          fullName: registerDto.fullName,
          email: registerDto.email,
          role: 'user',
          plan: 'free',
          subscriptionStatus: 'active',
          limits: {
            maxStrategiesPerMonth: 3,
            maxPublicationsPerMonth: 10,
            maxSwotPerMonth: 3,
            maxPdfExportsPerMonth: 3,
          },
          team: {
            maxMembers: 1,
            members: [],
          },
          isActive: true,
        },
        tokens,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de l\'inscription');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      // Valider l'utilisateur
      const user = await this.validateUser(loginDto.email, loginDto.password);

      if (!user) {
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }

      // Mettre à jour la dernière connexion
      await this.usersService.updateLastLogin(user._id.toString());

      // Générer les tokens
      const tokens = await this.generateTokens(user);

      // Sauvegarder le refresh token
      await this.usersService.updateRefreshToken(user._id.toString(), tokens.refreshToken);

      return {
        user: this.sanitizeUser(user),
        tokens,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la connexion');
    }
  }

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmailWithPassword(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null;
    }

    // Vérifications de sécurité
    if (!user.isActive) {
      throw new UnauthorizedException('Compte désactivé');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('Compte banni');
    }

    return user;
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as JwtPayload;

      const user = await this.usersService.findById(payload.sub);
      
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Token invalide');
      }

      // Vérifier le refresh token
      const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);

      if (!isTokenValid) {
        throw new UnauthorizedException('Token invalide');
      }

      // Vérifications de sécurité
      if (!user.isActive || user.isBanned) {
        throw new UnauthorizedException('Compte non autorisé');
      }

      // Générer de nouveaux tokens
      const tokens = await this.generateTokens(user);

      // Sauvegarder le nouveau refresh token
      await this.usersService.updateRefreshToken(user._id.toString(), tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  // 🔧 MÉTHODES UTILITAIRES
  private async generateTokens(user: UserDocument): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      plan: user.plan,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: UserDocument): any {
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      limits: user.limits,
      team: user.team,
      isActive: user.isActive,
    };
  }

  // 📊 INFORMATIONS UTILISATEUR
  async getMe(userId: string): Promise<any> {
    const user = await this.usersService.getProfile(userId);
    return this.sanitizeUser(user);
  }

  async getUserPermissions(user: UserDocument): Promise<any> {
    return {
      canManageTeam: ['pro', 'business'].includes(user.plan),
      canAccessProFeatures: ['pro', 'business'].includes(user.plan),
      canAccessBusinessFeatures: user.plan === 'business',
      isAdmin: user.role === 'admin',
      maxTeamMembers: user.team.maxMembers,
      limits: user.limits,
    };
  }
}
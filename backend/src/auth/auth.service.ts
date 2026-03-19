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
import { createHash, randomBytes } from 'crypto';

import { UsersService } from '../users/users.service';
import { UserDocument, UserRole } from '../users/entities/user.entity';
import { EmailService } from '../notifications/email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      const existingUser = await this.usersService.findByEmail(
        registerDto.email,
      );
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

      await this.usersService.updateRefreshToken(
        user._id.toString(),
        tokens.refreshToken,
      );
      await this.usersService.updateLastLogin(user._id.toString());

      return {
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          role: user.role,
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
      const user = await this.usersService.findByEmailWithPassword(
        loginDto.email,
      );

      if (!user) {
        this.logger.warn(
          `Login reject: user not found for email=${loginDto.email}`,
        );
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }

      if (user.isBanned) {
        this.logger.warn(
          `Login reject: banned account email=${loginDto.email}`,
        );
        throw new UnauthorizedException('Votre compte a ete banni');
      }

      // First compare exact input; then compare trimmed input to tolerate accidental spaces.
      const candidates = [loginDto.password];
      const trimmedPassword = loginDto.password.trim();
      if (trimmedPassword !== loginDto.password) {
        candidates.push(trimmedPassword);
      }

      let isPasswordValid = false;
      for (const candidate of candidates) {
        if (await bcrypt.compare(candidate, user.password)) {
          isPasswordValid = true;
          break;
        }
      }

      if (!isPasswordValid) {
        this.logger.warn(
          `Login reject: invalid password for email=${loginDto.email}`,
        );
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }

      const tokens = await this.generateTokens(user);

      await Promise.all([
        this.usersService.updateRefreshToken(
          user._id.toString(),
          tokens.refreshToken,
        ),
        this.usersService.updateLastLogin(user._id.toString()),
      ]);

      return {
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          role: user.role,
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
      this.logger.log(`[refreshTokens] Tentative de refresh avec token: ${refreshToken?.slice(0, 20)}...`);
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      this.logger.log(`[refreshTokens] Payload decode: ${JSON.stringify(payload)}`);

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        this.logger.warn(`[refreshTokens] Utilisateur non trouvé pour sub=${payload.sub}`);
        throw new UnauthorizedException('Token de rafraichissement invalide (user)');
      }
      if (!user.refreshToken) {
        this.logger.warn(`[refreshTokens] Pas de refreshToken stocké pour user=${user._id}`);
        throw new UnauthorizedException('Token de rafraichissement invalide (no token)');
      }

      if (user.isBanned) {
        this.logger.warn(`[refreshTokens] Compte banni pour user=${user._id}`);
        throw new UnauthorizedException('Votre compte a ete banni');
      }

      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      if (!isRefreshTokenValid) {
        this.logger.warn(`[refreshTokens] Token fourni ne correspond pas au token stocké pour user=${user._id}`);
        throw new UnauthorizedException('Token de rafraichissement invalide (mismatch)');
      }

      const newTokens = await this.generateTokens(user);
      await this.usersService.updateRefreshToken(
        user._id.toString(),
        newTokens.refreshToken,
      );

      this.logger.log(`[refreshTokens] Refresh réussi pour user=${user._id}`);
      return newTokens;
    } catch (err) {
      this.logger.error(`[refreshTokens] Echec: ${err?.message}`);
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

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const genericMessage =
      'Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.';

    try {
      const user = await this.usersService.findByEmail(forgotPasswordDto.email);

      if (!user || user.isBanned) {
        return { message: genericMessage };
      }

      const resetToken = randomBytes(32).toString('hex');
      const resetTokenHash = this.hashValue(resetToken);
      const expiresInMinutes = this.getResetPasswordExpiryMinutes();
      const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

      await this.usersService.setResetPasswordToken(
        user._id.toString(),
        resetTokenHash,
        expiresAt,
      );

      try {
        await this.emailService.sendPasswordResetEmail({
          to: user.email,
          fullName: user.fullName,
          resetUrl: this.buildResetPasswordUrl(resetToken),
          expiresInMinutes,
        });
      } catch (error) {
        await this.usersService.clearResetPasswordToken(user._id.toString());
        this.logger.error(
          `Password reset email failed for email=${user.email}`,
          error instanceof Error ? error.stack : undefined,
        );
        throw new BadRequestException(
          "Erreur lors de l'envoi de l'email de reinitialisation",
        );
      }

      return { message: genericMessage };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'Erreur lors de la demande de reinitialisation du mot de passe',
      );
    }
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    try {
      const resetTokenHash = this.hashValue(resetPasswordDto.token);
      const user =
        await this.usersService.findByResetPasswordToken(resetTokenHash);

      if (!user) {
        throw new BadRequestException(
          'Le lien de reinitialisation est invalide ou expire',
        );
      }

      if (user.isBanned) {
        throw new UnauthorizedException('Votre compte a ete banni');
      }

      user.password = resetPasswordDto.newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = null;
      await user.save();

      await this.usersService.removeRefreshToken(user._id.toString());

      return { message: 'Mot de passe reinitialise avec succes' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new BadRequestException(
        'Erreur lors de la reinitialisation du mot de passe',
      );
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
      return user?.isBanned ? null : user;
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
        secret:
          this.configService.get<string>('JWT_SECRET') || 'default-secret',
        expiresIn: '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'default-refresh-secret',
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private hashValue(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private getResetPasswordExpiryMinutes(): number {
    const rawValue = this.configService.get<string>(
      'RESET_PASSWORD_EXPIRES_MINUTES',
    );
    const parsedValue = Number(rawValue || 30);

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      return 30;
    }

    return parsedValue;
  }

  private buildResetPasswordUrl(token: string): string {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const configuredUrl =
      this.configService.get<string>('RESET_PASSWORD_URL') ||
      `${frontendUrl.replace(/\/$/, '')}/reset-password`;

    const resetUrl = new URL(configuredUrl);
    resetUrl.searchParams.set('token', token);
    return resetUrl.toString();
  }
}

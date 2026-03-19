import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 🚪 Inscription d'un nouvel utilisateur
   */ @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<{
    success: boolean;
    message: string;
    data: AuthResponse;
  }> {
    try {
      const result = await this.authService.register(registerDto);

      return {
        success: true,
        message: 'Compte créé avec succès',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🔑 Connexion utilisateur
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<{
    success: boolean;
    message: string;
    data: AuthResponse;
  }> {
    try {
      const result = await this.authService.login(loginDto);

      return {
        success: true,
        message: 'Connexion réussie',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🔄 Rafraîchissement du token d'accès
   */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{
    success: boolean;
    message: string;
  }> {
    const result = await this.authService.forgotPassword(forgotPasswordDto);

    return {
      success: true,
      message: result.message,
    };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{
    success: boolean;
    message: string;
  }> {
    const result = await this.authService.resetPassword(resetPasswordDto);

    return {
      success: true,
      message: result.message,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string): Promise<{
    success: boolean;
    message: string;
    data: { accessToken: string; refreshToken: string };
  }> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token requis');
    }

    try {
      const newTokens = await this.authService.refreshTokens(refreshToken);

      return {
        success: true,
        message: 'Token rafraîchi avec succès',
        data: newTokens,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🚪 Déconnexion utilisateur
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any): Promise<{
    success: boolean;
    message: string;
  }> {
    const userId = req.user.sub || req.user.userId;

    try {
      const result = await this.authService.logout(userId);

      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   *  Validation du token d'accès
   */
  @Get('validate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async validateToken(@Request() req: any): Promise<{
    success: boolean;
    message: string;
    data: {
      valid: boolean;
      user: any;
    };
  }> {
    return {
      success: true,
      message: 'Token valide',
      data: {
        valid: true,
        user: req.user,
      },
    };
  }
}

import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UseGuards, 
  Request,
  HttpCode, 
  HttpStatus,
  ValidationPipe,
  SetMetadata
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

// Décorateur pour marquer une route comme publique
export const Public = () => SetMetadata('isPublic', true);

// Décorateur pour définir les rôles requis
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 🔐 === AUTHENTIFICATION PUBLIQUE ===
  
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login-passport')
  @HttpCode(HttpStatus.OK)
  async loginWithPassport(@Request() req) {
    // L'utilisateur est déjà validé par LocalStrategy
    const user = req.user;
    
    // Générer les tokens
    const tokens = await this.authService['generateTokens'](user);
    
    // Sauvegarder le refresh token
    await this.authService['usersService'].updateRefreshToken(
      user._id.toString(), 
      tokens.refreshToken
    );

    return {
      user: this.authService['sanitizeUser'](user),
      tokens,
    };
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  // 🔒 === ROUTES PROTÉGÉES ===

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    await this.authService.logout(req.user._id.toString());
    return { message: 'Déconnexion réussie' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.authService.getMe(req.user._id.toString());
  }

  @UseGuards(JwtAuthGuard)
  @Get('permissions')
  async getUserPermissions(@Request() req) {
    return this.authService.getUserPermissions(req.user);
  }

  // 🛡️ === TESTS DE PROTECTION PAR RÔLE ===

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin-only')
  async adminOnlyRoute() {
    return { message: 'Cette route est réservée aux administrateurs' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  @Get('authenticated-only')
  async authenticatedOnlyRoute(@Request() req) {
    return { 
      message: 'Route pour utilisateurs authentifiés',
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role
      }
    };
  }

  // 📊 === INFORMATIONS SYSTÈME ===

  @Public()
  @Get('health')
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'auth-service'
    };
  }
}
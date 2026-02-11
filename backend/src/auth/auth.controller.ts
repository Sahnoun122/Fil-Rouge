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
  SetMetadata,
  UsePipes,
  UnauthorizedException
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard, Roles } from './guards/roles.guard';

// Décorateur pour marquer une route comme publique
export const Public = () => SetMetadata('isPublic', true);

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 🔐 AUTHENTIFICATION PUBLIQUE

  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    return {
      success: true,
      message: 'API d\'authentification en ligne',
      timestamp: new Date().toISOString()
    };
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    
    return {
      success: true,
      message: 'Compte créé avec succès',
      user: result.user,
      tokens: result.tokens
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    
    return {
      success: true,
      message: 'Connexion réussie',
      user: result.user,
      tokens: result.tokens
    };
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    const tokens = await this.authService.refreshTokens(refreshToken);
    
    return {
      success: true,
      message: 'Tokens renouvelés avec succès',
      ...tokens
    };
  }

  // 🔒 AUTHENTIFICATION PROTÉGÉE

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Request() req) {
    const user = await this.authService.validateUserById(req.user.sub);
    
    return {
      success: true,
      message: 'Utilisateur récupéré avec succès',
      data: user
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('permissions')
  async getUserPermissions(@Request() req) {
    const user = await this.authService.validateUserById(req.user.sub);
    
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    
    const permissions = {
      canManageUsers: user.role === 'admin',
      canViewAdminPanel: user.role === 'admin',
      canEditProfile: true,
      canChangePassword: true,
    };
    
    return {
      success: true,
      message: 'Permissions récupérées avec succès',
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role
        },
        permissions
      }
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    const result = await this.authService.logout(req.user.sub);
    
    return {
      success: true,
      message: result.message
    };
  }

  // 🛡️ ROUTE ADMIN UNIQUEMENT

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin-only')
  async adminOnlyRoute(@Request() req) {
    return {
      success: true,
      message: 'Accès autorisé - Route admin',
      data: {
        userId: req.user.sub,
        email: req.user.email,
        role: req.user.role,
        accessTime: new Date().toISOString()
      }
    };
  }
}
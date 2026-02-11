import { 
  Controller, 
  Get, 
  Put, 
  Body, 
  Request, 
  UseGuards,
  Query,
  Param,
  ValidationPipe,
  UsePipes
} from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UpdateUserDto, ChangePasswordDto } from './dto/user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 📋 GESTION PROFIL UTILISATEUR

  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.sub);
    return {
      success: true,
      message: 'Profil récupéré avec succès',
      data: user
    };
  }

  @Put('profile')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const updatedUser = await this.usersService.updateProfile(req.user.sub, updateUserDto);
    
    return {
      success: true,
      message: 'Profil mis à jour avec succès',
      data: updatedUser
    };
  }

  @Put('password')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    const result = await this.usersService.changePassword(req.user.sub, changePasswordDto);
    
    return {
      success: true,
      message: result.message
    };
  }

  // 🔒 ROUTES ADMIN UNIQUEMENT

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    const result = await this.usersService.getAllUsers(pageNum, limitNum);
    
    return {
      success: true,
      message: 'Liste des utilisateurs récupérée avec succès',
      data: result
    };
  }

  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getUserStats() {
    const stats = await this.usersService.getUserStats();
    
    return {
      success: true,
      message: 'Statistiques récupérées avec succès',
      data: stats
    };
  }

  @Put('admin/:userId/toggle-status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async toggleUserStatus(@Param('userId') userId: string) {
    const updatedUser = await this.usersService.toggleUserStatus(userId);
    
    return {
      success: true,
      message: `Statut de l'utilisateur ${updatedUser.isActive ? 'activé' : 'désactivé'} avec succès`,
      data: updatedUser
    };
  }

  @Put('admin/:userId/role')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateUserRole(
    @Param('userId') userId: string,
    @Body('role') role: 'admin' | 'user'
  ) {
    const updatedUser = await this.usersService.updateUserRole(userId, role);
    
    return {
      success: true,
      message: `Rôle de l'utilisateur mis à jour avec succès`,
      data: updatedUser
    };
  }

  @Get('admin/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getUserById(@Param('userId') userId: string) {
    const user = await this.usersService.findById(userId);
    
    return {
      success: true,
      message: 'Utilisateur récupéré avec succès',
      data: user
    };
  }
}
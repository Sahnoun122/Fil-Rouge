import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { UsersService } from './users.service';
import {
  AdminUsersQueryDto,
  ChangePasswordDto,
  UpdateUserDto,
  UpdateUserRoleDto,
} from './dto/user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req: any) {
    const userId = this.getAuthenticatedUserId(req);
    const user = await this.usersService.findById(userId);

    return {
      success: true,
      message: 'Profil recupere avec succes',
      data: user,
    };
  }

  @Put('profile')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateProfile(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = this.getAuthenticatedUserId(req);
    const updatedUser = await this.usersService.updateProfile(userId, updateUserDto);

    return {
      success: true,
      message: 'Profil mis a jour avec succes',
      data: updatedUser,
    };
  }

  @Put('password')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = this.getAuthenticatedUserId(req);
    const result = await this.usersService.changePassword(userId, changePasswordDto);

    return {
      success: true,
      message: result.message,
    };
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getAllUsers(@Query() query: AdminUsersQueryDto) {
    const result = await this.usersService.getAllUsers(query.page ?? 1, query.limit ?? 10, {
      search: query.search,
      role: query.role,
      status: query.status,
    });

    return {
      success: true,
      message: 'Liste des utilisateurs recuperee avec succes',
      data: result,
    };
  }

  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getUserStats() {
    const stats = await this.usersService.getUserStats();

    return {
      success: true,
      message: 'Statistiques recuperees avec succes',
      data: stats,
    };
  }

  @Put('admin/:userId/toggle-status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async toggleUserStatus(@Request() req: any, @Param('userId') userId: string) {
    const adminId = this.getAuthenticatedUserId(req);
    const updatedUser = await this.usersService.toggleUserStatus(userId, adminId);

    return {
      success: true,
      message: `Statut utilisateur ${updatedUser.isActive ? 'active' : 'desactive'} avec succes`,
      data: updatedUser,
    };
  }

  @Put('admin/:userId/role')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateUserRole(
    @Request() req: any,
    @Param('userId') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    const adminId = this.getAuthenticatedUserId(req);
    const updatedUser = await this.usersService.updateUserRole(userId, updateUserRoleDto.role, adminId);

    return {
      success: true,
      message: 'Role utilisateur mis a jour avec succes',
      data: updatedUser,
    };
  }

  @Get('admin/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getUserById(@Param('userId') userId: string) {
    const user = await this.usersService.findById(userId);

    return {
      success: true,
      message: 'Utilisateur recupere avec succes',
      data: user,
    };
  }

  private getAuthenticatedUserId(req: any): string {
    const rawId = req?.user?.sub ?? req?.user?.id ?? req?.user?._id?.toString?.();

    if (!rawId || typeof rawId !== 'string') {
      throw new BadRequestException('Utilisateur authentifie invalide');
    }

    return rawId;
  }
}

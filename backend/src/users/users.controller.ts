import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
  AdminCreateUserDto,
  AdminUpdateUserDto,
  AdminUsersQueryDto,
  BanUserDto,
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
    const updatedUser = await this.usersService.updateProfile(
      userId,
      updateUserDto,
    );

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
    const result = await this.usersService.changePassword(
      userId,
      changePasswordDto,
    );

    return {
      success: true,
      message: result.message,
    };
  }

  @Delete('profile')
  async deleteOwnAccount(@Request() req: any) {
    const userId = this.getAuthenticatedUserId(req);
    await this.usersService.deleteOwnAccount(userId);

    return {
      success: true,
      message: 'Compte supprime avec succes',
    };
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getAllUsers(@Query() query: AdminUsersQueryDto) {
    const result = await this.usersService.getAllUsers(
      query.page ?? 1,
      query.limit ?? 10,
      {
        search: query.search,
        role: query.role,
      },
    );

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
    const updatedUser = await this.usersService.updateUserRole(
      userId,
      updateUserRoleDto.role,
      adminId,
    );

    return {
      success: true,
      message: 'Role utilisateur mis a jour avec succes',
      data: updatedUser,
    };
  }

  @Put('admin/:userId/ban')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async setUserBanStatus(
    @Request() req: any,
    @Param('userId') userId: string,
    @Body() banUserDto: BanUserDto,
  ) {
    const adminId = this.getAuthenticatedUserId(req);
    const shouldBan = banUserDto.ban ?? true;
    const updatedUser = await this.usersService.setUserBanStatus(
      userId,
      shouldBan,
      adminId,
      banUserDto.reason,
    );

    return {
      success: true,
      message: shouldBan
        ? 'Utilisateur banni avec succes'
        : 'Utilisateur debanni avec succes',
      data: updatedUser,
    };
  }

  @Post('admin')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createUserByAdmin(@Body() createUserDto: AdminCreateUserDto) {
    const createdUser = await this.usersService.createUser({
      fullName: createUserDto.fullName,
      email: createUserDto.email,
      password: createUserDto.password,
      phone: createUserDto.phone,
      companyName: createUserDto.companyName,
      industry: createUserDto.industry,
      role: createUserDto.role ?? 'user',
    });

    return {
      success: true,
      message: 'Utilisateur cree avec succes',
      data: createdUser,
    };
  }

  @Put('admin/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateUserByAdmin(
    @Request() req: any,
    @Param('userId') userId: string,
    @Body() updateUserDto: AdminUpdateUserDto,
  ) {
    const adminId = this.getAuthenticatedUserId(req);
    const updatedUser = await this.usersService.updateUserByAdmin(
      userId,
      updateUserDto,
      adminId,
    );

    return {
      success: true,
      message: 'Utilisateur mis a jour avec succes',
      data: updatedUser,
    };
  }

  @Delete('admin/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async deleteUserByAdmin(
    @Request() req: any,
    @Param('userId') userId: string,
  ) {
    const adminId = this.getAuthenticatedUserId(req);
    await this.usersService.deleteUserByAdmin(userId, adminId);

    return {
      success: true,
      message: 'Utilisateur supprime avec succes',
    };
  }

  @Get('admin/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getUserById(@Param('userId') userId: string) {
    const user = await this.usersService.findByIdOrThrow(userId);

    return {
      success: true,
      message: 'Utilisateur recupere avec succes',
      data: user,
    };
  }

  private getAuthenticatedUserId(req: any): string {
    const rawId =
      req?.user?.sub ?? req?.user?.id ?? req?.user?._id?.toString?.();

    if (!rawId || typeof rawId !== 'string') {
      throw new BadRequestException('Utilisateur authentifie invalide');
    }

    return rawId;
  }
}

import { 
  Controller, 
  Get, 
  Put, 
  Post,
  Delete,
  Body, 
  Param, 
  Query,
  UseGuards, 
  Request,
  HttpCode, 
  HttpStatus,
  ValidationPipe 
} from '@nestjs/common';

import { UsersService, UpdateUserDto, UpdatePlanDto, AddTeamMemberDto, AdminUpdateUserDto, UserFilterDto } from './users.service';

// Guards et Décorateurs d'Auth
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';  
import { Public, Roles } from '../auth/auth.controller';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 👤 === GESTION DU PROFIL ===

  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user._id.toString());
  }

  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto
  ) {
    return this.usersService.updateProfile(req.user._id.toString(), updateUserDto);
  }

  @Put('password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    await this.usersService.changePassword(
      req.user._id.toString(), 
      body.currentPassword, 
      body.newPassword
    );
    return { message: 'Mot de passe modifié avec succès' };
  }

  // 👥 === GESTION D'ÉQUIPE ===

  @Post('team/members')
  // TODO: Ajouter guard pour vérifier le plan Pro/Business
  async addTeamMember(
    @Request() req,
    @Body(ValidationPipe) addTeamMemberDto: AddTeamMemberDto
  ) {
    return this.usersService.addTeamMember(req.user._id.toString(), addTeamMemberDto);
  }

  @Put('team/members/:memberId')
  async updateTeamMember(
    @Request() req,
    @Param('memberId') memberId: string,
    @Body() body: { role: 'editor' | 'viewer' | 'manager' }
  ) {
    return this.usersService.updateTeamMember(req.user._id.toString(), memberId, body.role);
  }

  @Delete('team/members/:memberId')
  async removeTeamMember(
    @Request() req,
    @Param('memberId') memberId: string
  ) {
    return this.usersService.removeTeamMember(req.user._id.toString(), memberId);
  }

  // 💳 === GESTION DES ABONNEMENTS ===

  @Put('plan')
  @HttpCode(HttpStatus.OK)
  async updatePlan(
    @Request() req,
    @Body(ValidationPipe) updatePlanDto: UpdatePlanDto
  ) {
    return this.usersService.updatePlan(req.user._id.toString(), updatePlanDto);
  }

  @Get('subscription-status')
  async getSubscriptionStatus(@Request() req) {
    const user = await this.usersService.findById(req.user._id.toString());
    return {
      plan: user?.plan,
      subscriptionStatus: user?.subscriptionStatus,
      limits: user?.limits,
      isSubscriptionActive: user?.isSubscriptionActive()
    };
  }

  // 🛡️ === ADMINISTRATION (ADMIN SEULEMENT) ===

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('admin/all')
  async getAllUsers(@Query() filterDto: UserFilterDto) {
    return this.usersService.getAllUsers(filterDto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('admin/stats')
  async getUserStats() {
    return this.usersService.getUserStats();
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('admin/:userId')
  async getUserById(@Param('userId') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put('admin/:userId')
  async adminUpdateUser(
    @Param('userId') userId: string,
    @Body(ValidationPipe) adminUpdateDto: AdminUpdateUserDto
  ) {
    return this.usersService.adminUpdateUser(userId, adminUpdateDto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post('admin/:userId/ban')
  @HttpCode(HttpStatus.OK)
  async banUser(@Param('userId') userId: string) {
    return this.usersService.adminUpdateUser(userId, { isBanned: true });
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post('admin/:userId/unban')
  @HttpCode(HttpStatus.OK)
  async unbanUser(@Param('userId') userId: string) {
    return this.usersService.adminUpdateUser(userId, { isBanned: false });
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post('admin/:userId/activate')
  @HttpCode(HttpStatus.OK)
  async activateUser(@Param('userId') userId: string) {
    return this.usersService.adminUpdateUser(userId, { isActive: true });
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post('admin/:userId/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivateUser(@Param('userId') userId: string) {
    return this.usersService.adminUpdateUser(userId, { isActive: false });
  }
}
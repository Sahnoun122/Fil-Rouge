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
  HttpCode, 
  HttpStatus,
  ValidationPipe 
} from '@nestjs/common';

import { UsersService, UpdateUserDto, UpdatePlanDto, AddTeamMemberDto, AdminUpdateUserDto, UserFilterDto } from './users.service';

// TODO: Ces imports seront créés dans le module auth
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';  
// import { CurrentUser, UserId, Roles } from '../auth/auth.decorators';

@Controller('users')
// @UseGuards(JwtAuthGuard) // TODO: Décommenter quand le guard sera créé
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 👤 === GESTION DU PROFIL ===

  @Get('profile')
  async getProfile(/* @UserId() userId: string */) {
    // TODO: Utiliser le vrai userId du token JWT
    const mockUserId = '507f1f77bcf86cd799439011';
    return this.usersService.getProfile(mockUserId);
  }

  @Put('profile')
  async updateProfile(
    /* @UserId() userId: string, */
    @Body(ValidationPipe) updateUserDto: UpdateUserDto
  ) {
    // TODO: Utiliser le vrai userId du token JWT
    const mockUserId = '507f1f77bcf86cd799439011';
    return this.usersService.updateProfile(mockUserId, updateUserDto);
  }

  @Put('password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    /* @UserId() userId: string, */
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    // TODO: Utiliser le vrai userId du token JWT
    const mockUserId = '507f1f77bcf86cd799439011';
    await this.usersService.changePassword(mockUserId, body.currentPassword, body.newPassword);
    return { message: 'Mot de passe modifié avec succès' };
  }

  // 👥 === GESTION D'ÉQUIPE ===

  @Post('team/members')
  // @RequirePlans('pro', 'business') // TODO: Ajouter quand le guard sera créé
  async addTeamMember(
    /* @UserId() userId: string, */
    @Body(ValidationPipe) addTeamMemberDto: AddTeamMemberDto
  ) {
    const mockUserId = '507f1f77bcf86cd799439011';
    return this.usersService.addTeamMember(mockUserId, addTeamMemberDto);
  }

  @Put('team/members/:memberId')
  async updateTeamMember(
    /* @UserId() userId: string, */
    @Param('memberId') memberId: string,
    @Body() body: { role: 'editor' | 'viewer' | 'manager' }
  ) {
    const mockUserId = '507f1f77bcf86cd799439011';
    return this.usersService.updateTeamMember(mockUserId, memberId, body.role);
  }

  @Delete('team/members/:memberId')
  async removeTeamMember(
    /* @UserId() userId: string, */
    @Param('memberId') memberId: string
  ) {
    const mockUserId = '507f1f77bcf86cd799439011';
    return this.usersService.removeTeamMember(mockUserId, memberId);
  }

  // 💳 === GESTION DES ABONNEMENTS ===

  @Put('plan')
  @HttpCode(HttpStatus.OK)
  async updatePlan(
    /* @UserId() userId: string, */
    @Body(ValidationPipe) updatePlanDto: UpdatePlanDto
  ) {
    const mockUserId = '507f1f77bcf86cd799439011';
    return this.usersService.updatePlan(mockUserId, updatePlanDto);
  }

  @Get('subscription-status')
  async getSubscriptionStatus(/* @CurrentUser() user: any */) {
    const mockUserId = '507f1f77bcf86cd799439011';
    const user = await this.usersService.findById(mockUserId);
    return {
      plan: user?.plan,
      subscriptionStatus: user?.subscriptionStatus,
      limits: user?.limits,
      isSubscriptionActive: user?.isSubscriptionActive()
    };
  }

  // 🛡️ === ADMINISTRATION (ADMIN SEULEMENT) ===

  @Get('admin/all')
  // @UseGuards(RolesGuard)
  // @Roles('admin')
  async getAllUsers(@Query() filterDto: UserFilterDto) {
    return this.usersService.getAllUsers(filterDto);
  }

  @Get('admin/stats')
  // @UseGuards(RolesGuard)
  // @Roles('admin')
  async getUserStats() {
    return this.usersService.getUserStats();
  }

  @Get('admin/:userId')
  // @UseGuards(RolesGuard)
  // @Roles('admin')
  async getUserById(@Param('userId') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put('admin/:userId')
  // @UseGuards(RolesGuard)
  // @Roles('admin')
  async adminUpdateUser(
    @Param('userId') userId: string,
    @Body(ValidationPipe) adminUpdateDto: AdminUpdateUserDto
  ) {
    return this.usersService.adminUpdateUser(userId, adminUpdateDto);
  }

  @Post('admin/:userId/ban')
  // @UseGuards(RolesGuard)
  // @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async banUser(@Param('userId') userId: string) {
    return this.usersService.adminUpdateUser(userId, { isBanned: true });
  }

  @Post('admin/:userId/unban')
  // @UseGuards(RolesGuard)
  // @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async unbanUser(@Param('userId') userId: string) {
    return this.usersService.adminUpdateUser(userId, { isBanned: false });
  }

  @Post('admin/:userId/activate')
  // @UseGuards(RolesGuard)
  // @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async activateUser(@Param('userId') userId: string) {
    return this.usersService.adminUpdateUser(userId, { isActive: true });
  }

  @Post('admin/:userId/deactivate')
  // @UseGuards(RolesGuard)
  // @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async deactivateUser(@Param('userId') userId: string) {
    return this.usersService.adminUpdateUser(userId, { isActive: false });
  }
}
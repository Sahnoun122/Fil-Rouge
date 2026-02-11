import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument, UserRole, PlanType, TeamMemberRole } from './entities/user.entity';

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  industry?: string;
}

export interface UpdatePlanDto {
  plan: PlanType;
  subscriptionStatus?: 'active' | 'expired' | 'canceled';
  subscriptionEndDate?: Date;
}

export interface AddTeamMemberDto {
  userId: string;
  role: TeamMemberRole;
}

export interface AdminUpdateUserDto {
  role?: UserRole;
  plan?: PlanType;
  subscriptionStatus?: 'active' | 'expired' | 'canceled';
  isActive?: boolean;
  isBanned?: boolean;
  subscriptionEndDate?: Date;
}

export interface UserFilterDto {
  role?: UserRole;
  plan?: PlanType;
  subscriptionStatus?: 'active' | 'expired' | 'canceled';
  isActive?: boolean;
  isBanned?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // 🔍 RECHERCHE ET RÉCUPÉRATION
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).select('+password').exec();
  }

  async getProfile(userId: string): Promise<UserDocument> {
    const user = await this.userModel
      .findById(userId)
      .populate('team.members.userId', 'fullName email')
      .exec();
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return user;
  }

  // ✏️ GESTION DU PROFIL
  async updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    try {
      // Vérifier si le nouvel email existe déjà
      if (updateUserDto.email) {
        const existingUser = await this.userModel.findOne({
          email: updateUserDto.email.toLowerCase(),
          _id: { $ne: userId },
        });

        if (existingUser) {
          throw new ConflictException('Cet email est déjà utilisé');
        }
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(userId, updateUserDto, { new: true })
        .populate('team.members.userId', 'fullName email')
        .exec();

      if (!updatedUser) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la mise à jour du profil');
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.userModel.findById(userId).select('+password').exec();
      
      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // Vérifier le mot de passe actuel
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Mot de passe actuel incorrect');
      }

      // Hasher le nouveau mot de passe
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Mettre à jour le mot de passe et invalider les tokens
      user.password = hashedNewPassword;
      user.refreshToken = null;
      await user.save();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors du changement de mot de passe');
    }
  }

  // 👥 GESTION D'ÉQUIPE
  async addTeamMember(userId: string, addTeamMemberDto: AddTeamMemberDto): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(userId).exec();
      const memberToAdd = await this.userModel.findById(addTeamMemberDto.userId).exec();

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      if (!memberToAdd) {
        throw new NotFoundException('Membre à ajouter non trouvé');
      }

      // Vérifier si l'utilisateur peut ajouter des membres
      if (!user.canAddTeamMember()) {
        throw new ForbiddenException('Limite d\'équipe atteinte pour votre plan');
      }

      // Vérifier si le membre n'est pas déjà dans l'équipe
      const existingMember = user.team.members.find(
        member => member.userId.toString() === addTeamMemberDto.userId
      );

      if (existingMember) {
        throw new ConflictException('Ce membre fait déjà partie de l\'équipe');
      }

      // Ajouter le membre
      user.team.members.push({
        userId: new Types.ObjectId(addTeamMemberDto.userId),
        role: addTeamMemberDto.role,
        addedAt: new Date(),
      });

      return await user.save();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de l\'ajout du membre');
    }
  }

  async updateTeamMember(userId: string, memberId: string, role: TeamMemberRole): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(userId).exec();

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      const memberIndex = user.team.members.findIndex(
        member => member.userId.toString() === memberId
      );

      if (memberIndex === -1) {
        throw new NotFoundException('Membre non trouvé dans l\'équipe');
      }

      // Mettre à jour le rôle
      user.team.members[memberIndex].role = role;

      return await user.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la mise à jour du membre');
    }
  }

  async removeTeamMember(userId: string, memberId: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(userId).exec();

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      const memberIndex = user.team.members.findIndex(
        member => member.userId.toString() === memberId
      );

      if (memberIndex === -1) {
        throw new NotFoundException('Membre non trouvé dans l\'équipe');
      }

      // Supprimer le membre
      user.team.members.splice(memberIndex, 1);

      return await user.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la suppression du membre');
    }
  }

  // 💳 GESTION DES ABONNEMENTS
  async updatePlan(userId: string, updatePlanDto: UpdatePlanDto): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(userId).exec();

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // Mettre à jour le plan et les informations d'abonnement
      user.plan = updatePlanDto.plan;
      
      if (updatePlanDto.subscriptionStatus) {
        user.subscriptionStatus = updatePlanDto.subscriptionStatus;
      }

      if (updatePlanDto.subscriptionEndDate) {
        user.subscriptionEndDate = updatePlanDto.subscriptionEndDate;
      } else if (updatePlanDto.plan === 'free') {
        user.subscriptionEndDate = null;
      }

      return await user.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la mise à jour du plan');
    }
  }

  // 🔧 MÉTHODES UTILITAIRES
  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const hashedRefreshToken = refreshToken ? await bcrypt.hash(refreshToken, 12) : null;
    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: hashedRefreshToken,
    }).exec();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      lastLoginAt: new Date(),
    }).exec();
  }

  // 🛠️ ADMINISTRATION (pour les admins)
  async getAllUsers(filterDto: UserFilterDto): Promise<any> {
    const filter: any = {};
    
    if (filterDto.role) filter.role = filterDto.role;
    if (filterDto.plan) filter.plan = filterDto.plan;
    if (filterDto.subscriptionStatus) filter.subscriptionStatus = filterDto.subscriptionStatus;
    if (filterDto.isActive !== undefined) filter.isActive = filterDto.isActive;
    if (filterDto.isBanned !== undefined) filter.isBanned = filterDto.isBanned;
    
    if (filterDto.search) {
      filter.$or = [
        { fullName: { $regex: filterDto.search, $options: 'i' } },
        { email: { $regex: filterDto.search, $options: 'i' } },
        { companyName: { $regex: filterDto.search, $options: 'i' } },
      ];
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const skip = (page - 1) * limit;

    const users = await this.userModel
      .find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.userModel.countDocuments(filter);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async adminUpdateUser(userId: string, adminUpdateDto: AdminUpdateUserDto): Promise<UserDocument> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      adminUpdateDto,
      { new: true }
    ).exec();

    if (!updatedUser) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return updatedUser;
  }

  // 📊 STATISTIQUES
  async getUserStats(): Promise<any> {
    const totalUsers = await this.userModel.countDocuments().exec();
    const activeUsers = await this.userModel.countDocuments({ isActive: true }).exec();
    
    const planCounts = await this.userModel.aggregate([
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 }
        }
      }
    ]);

    const plans = {
      free: planCounts.find(p => p._id === 'free')?.count || 0,
      pro: planCounts.find(p => p._id === 'pro')?.count || 0,
      business: planCounts.find(p => p._id === 'business')?.count || 0,
    };

    return {
      totalUsers,
      activeUsers,
      plans
    };
  }
}
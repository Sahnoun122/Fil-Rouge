import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument, UserRole } from './entities/user.entity';
import { UpdateUserDto, ChangePasswordDto } from './dto/user.dto';

export interface CreateUserData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  companyName?: string;
  industry?: string;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // 📋 CRÉATION ET RÉCUPÉRATION
  async createUser(userData: CreateUserData): Promise<UserDocument> {
    try {
      const newUser = new this.userModel({
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        companyName: userData.companyName,
        industry: userData.industry,
        role: userData.role || 'user',
      });

      return await newUser.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
      throw new BadRequestException('Erreur lors de la création de l\'utilisateur');
    }
  }

  async findById(id: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findById(id).exec();
    } catch (error) {
      return null;
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch (error) {
      return null;
    }
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findOne({ email }).select('+password').exec();
    } catch (error) {
      return null;
    }
  }

  // 📝 MISE À JOUR
  async updateProfile(userId: string, updateData: UpdateUserDto): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }

      // Mettre à jour les champs modifiés
      const allowedFields = ['fullName', 'phone', 'companyName', 'industry'];
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          user[field] = updateData[field];
        }
      });

      return await user.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la mise à jour du profil');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findById(userId).select('+password');
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }

      // Vérifier l'ancien mot de passe
      const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Mot de passe actuel incorrect');
      }

      // Mettre à jour le mot de passe (sera hashé automatiquement par le middleware)
      user.password = changePasswordDto.newPassword;
      await user.save();

      return { message: 'Mot de passe modifié avec succès' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors du changement de mot de passe');
    }
  }

  // 🔐 GESTION TOKEN
  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await this.userModel.findByIdAndUpdate(userId, { 
        refreshToken: hashedRefreshToken 
      });
    } catch (error) {
      throw new BadRequestException('Erreur lors de la mise à jour du token');
    }
  }

  async removeRefreshToken(userId: string): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, { 
        $unset: { refreshToken: 1 }
      });
    } catch (error) {
      throw new BadRequestException('Erreur lors de la suppression du token');
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, { 
        lastLoginAt: new Date() 
      });
    } catch (error) {
      // Ne pas lancer d'erreur car ce n'est pas critique
      console.error('Erreur mise à jour dernière connexion:', error);
    }
  }

  // 🔒 GESTION ADMIN
  async getAllUsers(page: number = 1, limit: number = 10): Promise<{
    users: UserDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [users, total] = await Promise.all([
        this.userModel
          .find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.userModel.countDocuments()
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        users,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des utilisateurs');
    }
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    admins: number;
    emailVerified: number;
    recentSignups: number;
  }> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        total,
        active,
        inactive,
        admins,
        emailVerified,
        recentSignups
      ] = await Promise.all([
        this.userModel.countDocuments(),
        this.userModel.countDocuments({ isActive: true }),
        this.userModel.countDocuments({ isActive: false }),
        this.userModel.countDocuments({ role: 'admin' }),
        this.userModel.countDocuments({ emailVerified: true }),
        this.userModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
      ]);

      return {
        total,
        active,
        inactive,
        admins,
        emailVerified,
        recentSignups
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des statistiques');
    }
  }

  async toggleUserStatus(userId: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }

      user.isActive = !user.isActive;
      return await user.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la modification du statut');
    }
  }

  async updateUserRole(userId: string, role: UserRole): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }

      user.role = role;
      return await user.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la modification du rôle');
    }
  }
}
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument, UserRole } from './entities/user.entity';
import { AdminUpdateUserDto, ChangePasswordDto, UpdateUserDto } from './dto/user.dto';

export interface CreateUserData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  companyName?: string;
  industry?: string;
  role?: UserRole;
}

export interface AdminUsersFilters {
  search?: string;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

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

      const savedUser = await newUser.save();
      const safeUser = await this.userModel.findById(savedUser._id).exec();

      if (!safeUser) {
        throw new BadRequestException("Erreur lors de la creation de l'utilisateur");
      }

      return safeUser;
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException('Cet email est deja utilise');
      }
      throw new BadRequestException("Erreur lors de la creation de l'utilisateur");
    }
  }

  async findById(id: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findById(id).exec();
    } catch {
      return null;
    }
  }

  async findByIdOrThrow(id: string): Promise<UserDocument> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch {
      return null;
    }
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findOne({ email }).select('+password').exec();
    } catch {
      return null;
    }
  }

  async updateProfile(userId: string, updateData: UpdateUserDto): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }

      const allowedFields: Array<keyof UpdateUserDto> = ['fullName', 'phone', 'companyName', 'industry'];
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          user[field] = updateData[field] as never;
        }
      }

      return await user.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la mise a jour du profil');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findById(userId).select('+password');
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Mot de passe actuel incorrect');
      }

      user.password = changePasswordDto.newPassword;
      await user.save();

      return { message: 'Mot de passe modifie avec succes' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors du changement de mot de passe');
    }
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await this.userModel.findByIdAndUpdate(userId, {
        refreshToken: hashedRefreshToken,
      });
    } catch {
      throw new BadRequestException('Erreur lors de la mise a jour du token');
    }
  }

  async removeRefreshToken(userId: string): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, {
        $unset: { refreshToken: 1 },
      });
    } catch {
      throw new BadRequestException('Erreur lors de la suppression du token');
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, {
        lastLoginAt: new Date(),
      });
    } catch (error) {
      console.error('Erreur mise a jour derniere connexion:', error);
    }
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    filters: AdminUsersFilters = {},
  ): Promise<{
    users: UserDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const query: Record<string, unknown> = {};

      if (filters.role) {
        query.role = filters.role;
      }

      if (filters.search) {
        const safeSearch = this.escapeRegex(filters.search);
        const searchRegex = new RegExp(safeSearch, 'i');

        query.$or = [
          { fullName: searchRegex },
          { email: searchRegex },
          { companyName: searchRegex },
        ];
      }

      const [users, total] = await Promise.all([
        this.userModel
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.userModel.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit) || 1;

      return {
        users,
        total,
        page,
        limit,
        totalPages,
      };
    } catch {
      throw new BadRequestException('Erreur lors de la recuperation des utilisateurs');
    }
  }

  async getUserStats(): Promise<{
    total: number;
    admins: number;
    recentSignups: number;
  }> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [total, admins, recentSignups] = await Promise.all([
        this.userModel.countDocuments(),
        this.userModel.countDocuments({ role: 'admin' }),
        this.userModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      ]);

      return {
        total,
        admins,
        recentSignups,
      };
    } catch {
      throw new BadRequestException('Erreur lors de la recuperation des statistiques');
    }
  }

  async updateUserRole(userId: string, role: UserRole, currentAdminId?: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }

      if (currentAdminId && user._id.toString() === currentAdminId) {
        throw new BadRequestException('Vous ne pouvez pas modifier votre propre role');
      }

      if (user.role === 'admin' && role === 'user') {
        const otherAdmins = await this.userModel.countDocuments({
          role: 'admin',
          _id: { $ne: user._id },
        });

        if (otherAdmins === 0) {
          throw new BadRequestException('Impossible de retirer le role du dernier administrateur');
        }
      }

      user.role = role;
      return await user.save();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la modification du role');
    }
  }

  async updateUserByAdmin(
    userId: string,
    updateData: AdminUpdateUserDto,
    currentAdminId?: string,
  ): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }

      if (currentAdminId && user._id.toString() === currentAdminId) {
        if (updateData.role === 'user') {
          throw new BadRequestException('Vous ne pouvez pas modifier votre propre role');
        }
      }

      const nextRole = updateData.role ?? user.role;

      if (user.role === 'admin' && nextRole !== 'admin') {
        const otherAdmins = await this.userModel.countDocuments({
          role: 'admin',
          _id: { $ne: user._id },
        });

        if (otherAdmins === 0) {
          throw new BadRequestException(
            'Impossible de modifier le dernier administrateur',
          );
        }
      }

      const allowedFields: Array<keyof AdminUpdateUserDto> = [
        'fullName',
        'email',
        'password',
        'phone',
        'companyName',
        'industry',
        'role',
      ];

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          user[field] = updateData[field] as never;
        }
      }

      return await user.save();
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      if (error?.code === 11000) {
        throw new ConflictException('Cet email est deja utilise');
      }

      throw new BadRequestException("Erreur lors de la mise a jour de l'utilisateur");
    }
  }

  async deleteUserByAdmin(userId: string, currentAdminId?: string): Promise<void> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('Utilisateur introuvable');
      }

      if (currentAdminId && user._id.toString() === currentAdminId) {
        throw new BadRequestException('Vous ne pouvez pas supprimer votre propre compte');
      }

      if (user.role === 'admin') {
        const otherAdmins = await this.userModel.countDocuments({
          role: 'admin',
          _id: { $ne: user._id },
        });

        if (otherAdmins === 0) {
          throw new BadRequestException('Impossible de supprimer le dernier administrateur');
        }
      }

      await this.userModel.findByIdAndDelete(userId).exec();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException("Erreur lors de la suppression de l'utilisateur");
    }
  }

  private escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

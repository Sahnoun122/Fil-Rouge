import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

// 📌 Types pour les rôles et plans
export type UserRole = 'admin' | 'user';
export type PlanType = 'free' | 'pro' | 'business';
export type SubscriptionStatus = 'active' | 'expired' | 'canceled';
export type TeamMemberRole = 'editor' | 'viewer' | 'manager';

// 📌 Interface pour les membres de l'équipe
export interface TeamMember {
  userId: Types.ObjectId;
  role: TeamMemberRole;
  addedAt: Date;
}

// 📌 Interface pour les limites
export interface UserLimits {
  maxStrategiesPerMonth: number;
  maxPublicationsPerMonth: number;
  maxSwotPerMonth: number;
  maxPdfExportsPerMonth: number;
}

// 📌 Interface pour l'équipe
export interface UserTeam {
  maxMembers: number;
  members: TeamMember[];
}

@Schema({
  timestamps: true,
  collection: 'users',
})
export class User {
  // 👤 Informations personnelles
  @Prop({
    required: true,
    trim: true,
    maxlength: 100
  })
  fullName: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  })
  email: string;

  @Prop({
    required: true,
    minlength: 6
  })
  password: string; // hashed

  @Prop({
    required: true,
    trim: true,
    match: /^[+]?[0-9\s\-\(\)]{10,15}$/
  })
  phone: string;

  // 🏢 Informations business
  @Prop({
    required: true,
    trim: true,
    maxlength: 150
  })
  companyName: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 100
  })
  industry: string;

  // 🔐 Auth & Role
  @Prop({
    required: true,
    enum: ['admin', 'user'],
    default: 'user'
  })
  role: UserRole;

  @Prop({
    required: false,
    select: false // Ne pas inclure par défaut dans les requêtes
  })
  refreshToken?: string;

  @Prop({
    type: Date,
    default: null
  })
  lastLoginAt?: Date;

  // 💳 Subscription / Plans
  @Prop({
    required: true,
    enum: ['free', 'pro', 'business'],
    default: 'free'
  })
  plan: PlanType;

  @Prop({
    required: true,
    enum: ['active', 'expired', 'canceled'],
    default: 'active'
  })
  subscriptionStatus: SubscriptionStatus;

  @Prop({
    type: Date,
    default: Date.now
  })
  subscriptionStartDate: Date;

  @Prop({
    type: Date,
    default: null
  })
  subscriptionEndDate?: Date;

  // 📌 Limits حسب plan
  @Prop({
    type: {
      maxStrategiesPerMonth: { type: Number, required: true },
      maxPublicationsPerMonth: { type: Number, required: true },
      maxSwotPerMonth: { type: Number, required: true },
      maxPdfExportsPerMonth: { type: Number, required: true }
    },
    required: true,
    default: function() {
      const planLimits = {
        free: {
          maxStrategiesPerMonth: 3,
          maxPublicationsPerMonth: 10,
          maxSwotPerMonth: 3,
          maxPdfExportsPerMonth: 3
        },
        pro: {
          maxStrategiesPerMonth: 25,
          maxPublicationsPerMonth: 100,
          maxSwotPerMonth: 25,
          maxPdfExportsPerMonth: 25
        },
        business: {
          maxStrategiesPerMonth: -1,
          maxPublicationsPerMonth: -1,
          maxSwotPerMonth: -1,
          maxPdfExportsPerMonth: -1
        }
      };
      const plan = (this as any).plan || 'free';
      return planLimits[plan];
    }
  })
  limits: UserLimits;

  // 👥 Team
  @Prop({
    type: {
      maxMembers: { type: Number, required: true, default: 1 },
      members: [{
        userId: { type: Types.ObjectId, ref: 'User', required: true },
        role: { 
          type: String, 
          enum: ['editor', 'viewer', 'manager'],
          required: true 
        },
        addedAt: { type: Date, default: Date.now }
      }]
    },
    required: true,
    default: function() {
      const plan = (this as any).plan || 'free';
      const maxMembers = {
        free: 1,
        pro: 5,
        business: 50
      };
      return {
        maxMembers: maxMembers[plan],
        members: []
      };
    }
  })
  team: UserTeam;

  // 🛡️ Security
  @Prop({
    required: true,
    default: true
  })
  isActive: boolean;

  @Prop({
    required: true,
    default: false
  })
  isBanned: boolean;

  // 📅 Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// 📌 Indexs 
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ plan: 1 });
UserSchema.index({ subscriptionStatus: 1 });
UserSchema.index({ isActive: 1, isBanned: 1 });

// 📌 Middleware pré-save
UserSchema.pre('save', function(next) {
  if (this.isModified('plan')) {
    const planLimits = {
      free: { maxStrategiesPerMonth: 3, maxPublicationsPerMonth: 10, maxSwotPerMonth: 3, maxPdfExportsPerMonth: 3, maxMembers: 1 },
      pro: { maxStrategiesPerMonth: 25, maxPublicationsPerMonth: 100, maxSwotPerMonth: 25, maxPdfExportsPerMonth: 25, maxMembers: 5 },
      business: { maxStrategiesPerMonth: -1, maxPublicationsPerMonth: -1, maxSwotPerMonth: -1, maxPdfExportsPerMonth: -1, maxMembers: 50 }
    };

    const planConfig = planLimits[this.plan];
    this.limits = {
      maxStrategiesPerMonth: planConfig.maxStrategiesPerMonth,
      maxPublicationsPerMonth: planConfig.maxPublicationsPerMonth,
      maxSwotPerMonth: planConfig.maxSwotPerMonth,
      maxPdfExportsPerMonth: planConfig.maxPdfExportsPerMonth
    };
    this.team.maxMembers = planConfig.maxMembers;
  }
  next();
});

// 📌 Méthodes d'instance
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  return userObject;
};

UserSchema.methods.isSubscriptionActive = function(): boolean {
  if (this.plan === 'free') return true;
  return this.subscriptionStatus === 'active' && (!this.subscriptionEndDate || this.subscriptionEndDate > new Date());
};

UserSchema.methods.canAddTeamMember = function(): boolean {
  return this.team.members.length < this.team.maxMembers;
};

UserSchema.methods.hasReachedLimit = function(limitType: keyof UserLimits, currentUsage: number): boolean {
  const limit = this.limits[limitType];
  return limit !== -1 && currentUsage >= limit;
};
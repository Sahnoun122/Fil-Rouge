import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, CallbackError } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'user';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  collection: 'users'
})
export class User {
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
    trim: true
  })
  email: string;

  @Prop({
    required: true,
    select: false // Par défaut, ne pas inclure le mot de passe dans les requêtes
  })
  password: string;

  @Prop({
    trim: true,
    maxlength: 20
  })
  phone?: string;

  @Prop({
    trim: true,
    maxlength: 150
  })
  companyName?: string;

  @Prop({
    trim: true,
    maxlength: 100
  })
  industry?: string;

  @Prop({
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  })
  role: UserRole;

  @Prop({
    default: true
  })
  isActive: boolean;

  @Prop({
    default: false
  })
  emailVerified: boolean;

  @Prop({
    type: Date,
    default: null
  })
  emailVerifiedAt?: Date;

  @Prop({
    select: false // Ne pas inclure le refresh token dans les requêtes par défaut
  })
  refreshToken?: string;

  @Prop({
    type: Date,
    default: null
  })
  lastLoginAt?: Date;

  // Timestamps automatiques (createdAt, updatedAt)
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// 🔐 Middleware pour hasher le mot de passe avant sauvegarde
UserSchema.pre('save', async function (this: UserDocument) {
  // Ne hasher que si le mot de passe a été modifié
  if (!this.isModified('password')) {
    return;
  }

  try {
    // Générer un salt et hasher le mot de passe
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
  } catch (error) {
    throw error;
  }
});

// 🔍 Méthode d'instance pour comparer les mots de passe
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 📊 Index pour optimiser les requêtes
// Note: email a déjà un index unique via "unique: true" dans le @Prop
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

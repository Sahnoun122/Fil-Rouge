import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type UserDocument = User & Document;

// 📌 Types pour les rôles
export type UserRole = 'admin' | 'user';

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
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Email format invalide'
    }
  })
  email: string;

  @Prop({
    required: true,
    minlength: 8,
    select: false
  })
  password: string;

  @Prop({
    trim: true,
    maxlength: 20
  })
  phone?: string;

  // 🏢 Informations professionnelles
  @Prop({
    trim: true,
    maxlength: 100
  })
  companyName?: string;

  @Prop({
    trim: true,
    maxlength: 50
  })
  industry?: string;

  // 🔑 Rôle et statut
  @Prop({
    required: true,
    enum: ['admin', 'user'],
    default: 'user'
  })
  role: UserRole;

  @Prop({
    required: true,
    default: true
  })
  isActive: boolean;

  @Prop({
    required: true,
    default: false
  })
  emailVerified: boolean;

  // 🔐 Authentification
  @Prop({
    select: false
  })
  refreshToken?: string;

  // 🕒 Horodatages
  @Prop()
  lastLoginAt?: Date;

  // 📅 Timestamps automatiques
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// 🔒 Middleware de hachage du mot de passe avant sauvegarde
UserSchema.pre('save', async function(this: UserDocument) {
  // Hasher le mot de passe uniquement s'il a été modifié
  if (this.isModified('password')) {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
});

// 📌 Méthodes d'instance
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  return userObject;
};

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save();
};

// 📌 Index pour optimiser les requêtes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });
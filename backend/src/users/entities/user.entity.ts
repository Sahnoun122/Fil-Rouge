import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'user';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  collection: 'users',
})
export class User {
  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  fullName: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    required: true,
    select: false,
  })
  password: string;

  @Prop({
    trim: true,
    maxlength: 20,
  })
  phone?: string;

  @Prop({
    trim: true,
    maxlength: 150,
  })
  companyName?: string;

  @Prop({
    trim: true,
    maxlength: 100,
  })
  industry?: string;

  @Prop({
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  })
  role: UserRole;

  @Prop({
    default: false,
  })
  isBanned: boolean;

  @Prop({
    type: Date,
    default: null,
  })
  bannedAt?: Date | null;

  @Prop({
    trim: true,
    maxlength: 250,
  })
  banReason?: string;

  @Prop({
    select: false,
  })
  refreshToken?: string;

  @Prop({
    type: Date,
    default: null,
  })
  lastLoginAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (this: UserDocument) {
  if (!this.isModified('password')) {
    return;
  }

  const saltRounds = 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.index({ role: 1 });
UserSchema.index({ isBanned: 1 });
UserSchema.index({ createdAt: -1 });

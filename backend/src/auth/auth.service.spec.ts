// src/auth/auth.service.spec.ts - Tests unitaires pour AuthService

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import {
  AuthService,
  JwtPayload,
  AuthTokens,
} from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { EmailService } from '../notifications/email/email.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let emailService: jest.Mocked<EmailService>;

  const mockUser: any = {
    _id: '60f0c5a5c0e8d50015a5b1a1',
    fullName: 'John Doe',
    email: 'john@example.com',
    password: '$2a$10$hashedPassword',
    role: 'user' as UserRole,
    isActive: true,
    isBanned: false,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockTokens: AuthTokens = {
    accessToken: 'mock.access.token',
    refreshToken: 'mock.refresh.token',
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn(),
      updateRefreshToken: jest.fn(),
      updateLastLogin: jest.fn(),
      removeRefreshToken: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const mockEmailService = {
      sendPasswordResetEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    emailService = module.get(EmailService);

    // Configuration par défaut des mocks
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'JWT_SECRET':
          return 'test-secret';
        case 'JWT_REFRESH_SECRET':
          return 'test-refresh-secret';
        default:
          return undefined;
      }
    });

    jwtService.signAsync.mockResolvedValue('mockToken');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUserByEmail', () => {
    it('should return user when found', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      const result = await authService.validateUserByEmail('john@example.com');
      expect(result).toEqual(mockUser);
      expect(usersService.findByEmail).toHaveBeenCalledWith('john@example.com');
    });

    it('should return null when not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const result = await authService.validateUserByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const loginDto = { email: 'john@example.com', password: 'password123' };

    it('should return tokens and user data on successful login', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      const result = await authService.login(loginDto);

      expect(result).toBeDefined();
      expect(result.user.email).toBe('john@example.com');
      expect(result.tokens).toBeDefined();
      expect(usersService.updateRefreshToken).toHaveBeenCalled();
      expect(usersService.updateLastLogin).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is banned', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue({ ...mockUser, isBanned: true });

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const registerDto = {
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
    };

    it('should successfully register a new user', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.createUser.mockResolvedValue({ ...mockUser, email: 'jane@example.com' });

      const result = await authService.register(registerDto as any);

      expect(result).toBeDefined();
      expect(result.user.email).toBe('jane@example.com');
      expect(usersService.createUser).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.register(registerDto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens for valid refresh token', async () => {
      const refreshToken = 'valid.refresh.token';
      jwtService.verifyAsync.mockResolvedValue({ sub: mockUser._id });
      usersService.findById.mockResolvedValue({ ...mockUser, refreshToken: 'hashedRefreshToken' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.refreshTokens(refreshToken);

      expect(result).toBeDefined();
      expect(jwtService.verifyAsync).toHaveBeenCalled();
      expect(usersService.updateRefreshToken).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error());
      await expect(authService.refreshTokens('invalid')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should call usersService.removeRefreshToken', async () => {
      await authService.logout('userId');
      expect(usersService.removeRefreshToken).toHaveBeenCalledWith('userId');
    });
  });
});

// test/auth/auth.service.spec.ts - Tests unitaires pour AuthService

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { AuthService, JwtPayload, AuthTokens } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { UserRole } from '../../src/users/entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    _id: '60f0c5a5c0e8d50015a5b1a1',
    fullName: 'John Doe',
    email: 'john@example.com',
    password: '$2a$10$hashedPassword',
    role: UserRole.USER,
    isActive: true,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
    save: jest.fn().mockResolvedValue(true),
    toObject: jest.fn().mockReturnValue({
      _id: '60f0c5a5c0e8d50015a5b1a1',
      fullName: 'John Doe',
      email: 'john@example.com',
      role: UserRole.USER,
      isActive: true,
      emailVerified: false,
    }),
  };

  const mockTokens: AuthTokens = {
    accessToken: 'mock.access.token',
    refreshToken: 'mock.refresh.token',
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
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
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Configuration par défaut des mocks
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'JWT_SECRET':
          return 'test-secret';
        case 'JWT_EXPIRES_IN':
          return '1h';
        case 'JWT_REFRESH_EXPIRES_IN':
          return '7d';
        default:
          return undefined;
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      // Act
      const result = await authService.validateUser('john@example.com', 'password123');

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe('john@example.com');
      expect(result.fullName).toBe('John Doe');
      expect(usersService.findByEmail).toHaveBeenCalledWith('john@example.com');
    });

    it('should return null when user not found', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(null);

      // Act
      const result = await authService.validateUser('notfound@example.com', 'password123');

      // Assert
      expect(result).toBeNull();
      expect(usersService.findByEmail).toHaveBeenCalledWith('notfound@example.com');
    });

    it('should return null when password is invalid', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      // Act
      const result = await authService.validateUser('john@example.com', 'wrongpassword');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when user is inactive', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.findByEmail.mockResolvedValue(inactiveUser as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      // Act
      const result = await authService.validateUser('john@example.com', 'password123');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return tokens and user data on successful login', async () => {
      // Arrange
      const loginDto = { email: 'john@example.com', password: 'password123' };
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jwtService.sign.mockReturnValueOnce('access.token').mockReturnValueOnce('refresh.token');

      // Act
      const result = await authService.login(loginDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBe('access.token');
      expect(result.tokens.refreshToken).toBe('refresh.token');
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockUser.save).toHaveBeenCalled(); // lastLoginAt updated
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      // Arrange
      const loginDto = { email: 'john@example.com', password: 'wrongpassword' };
      usersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginDto)).rejects.toThrow('Email ou mot de passe incorrect');
    });
  });

  describe('register', () => {
    const registerDto = {
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      phone: '+1234567890',
      companyName: 'Test Corp',
      industry: 'Technology',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(null);
      const newUser = { ...mockUser, fullName: 'Jane Smith', email: 'jane@example.com' };
      usersService.create.mockResolvedValue(newUser as any);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedPassword'));
      jwtService.sign.mockReturnValueOnce('access.token').mockReturnValueOnce('refresh.token');

      // Act
      const result = await authService.register(registerDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.user.email).toBe('jane@example.com');
      expect(result.user.fullName).toBe('Jane Smith');
      expect(result.tokens).toBeDefined();
      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashedPassword',
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser as any);

      // Act & Assert
      await expect(authService.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(authService.register(registerDto)).rejects.toThrow('Cet email est déjà utilisé');
    });
  });

  describe('refreshTokens', () => {
    const refreshToken = 'valid.refresh.token';
    const mockPayload: JwtPayload = {
      sub: '60f0c5a5c0e8d50015a5b1a1',
      email: 'john@example.com',
      role: UserRole.USER,
    };

    it('should return new tokens for valid refresh token', async () => {
      // Arrange
      jwtService.verify.mockReturnValue(mockPayload);
      usersService.findById.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValueOnce('new.access.token').mockReturnValueOnce('new.refresh.token');

      // Act
      const result = await authService.refreshTokens(refreshToken);

      // Assert
      expect(result).toBeDefined();
      expect(result.accessToken).toBe('new.access.token');
      expect(result.refreshToken).toBe('new.refresh.token');
      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, {
        secret: 'test-secret',
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      // Arrange
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(authService.refreshTokens('invalid.token')).rejects.toThrow(UnauthorizedException);
      await expect(authService.refreshTokens('invalid.token')).rejects.toThrow('Token de rafraîchissement invalide');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      jwtService.verify.mockReturnValue(mockPayload);
      usersService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refreshTokens(refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      jwtService.verify.mockReturnValue(mockPayload);
      usersService.findById.mockResolvedValue(inactiveUser as any);

      // Act & Assert
      await expect(authService.refreshTokens(refreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      // Arrange
      const payload: JwtPayload = {
        sub: '60f0c5a5c0e8d50015a5b1a1',
        email: 'john@example.com',
        role: UserRole.USER,
      };
      jwtService.sign.mockReturnValueOnce('access.token').mockReturnValueOnce('refresh.token');

      // Act
      const result = await authService.generateTokens(payload);

      // Assert
      expect(result).toBeDefined();
      expect(result.accessToken).toBe('access.token');
      expect(result.refreshToken).toBe('refresh.token');
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(jwtService.sign).toHaveBeenNthCalledWith(1, payload, { expiresIn: '1h' });
      expect(jwtService.sign).toHaveBeenNthCalledWith(2, payload, { expiresIn: '7d' });
    });
  });

  describe('validateRefreshToken', () => {
    it('should return payload for valid refresh token', () => {
      // Arrange
      const token = 'valid.refresh.token';
      const expectedPayload: JwtPayload = {
        sub: '60f0c5a5c0e8d50015a5b1a1',
        email: 'john@example.com',
        role: UserRole.USER,
      };
      jwtService.verify.mockReturnValue(expectedPayload);

      // Act
      const result = authService.validateRefreshToken(token);

      // Assert
      expect(result).toEqual(expectedPayload);
      expect(jwtService.verify).toHaveBeenCalledWith(token, { secret: 'test-secret' });
    });

    it('should return null for invalid refresh token', () => {
      // Arrange
      const token = 'invalid.token';
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      const result = authService.validateRefreshToken(token);

      // Assert
      expect(result).toBeNull();
    });
  });
});
// test/auth/auth.controller.spec.ts - Tests pour AuthController

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { Response } from 'express';

import { AuthController } from '../../src/auth/auth.controller';
import { AuthService, AuthResponse } from '../../src/auth/auth.service';
import { LocalAuthGuard } from '../../src/auth/guards/local-auth.guard';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { UserRole } from '../../src/users/entities/user.entity';
import { LoginDto } from '../../src/auth/dto/login.dto';
import { RegisterDto } from '../../src/auth/dto/register.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser = {
    id: '60f0c5a5c0e8d50015a5b1a1',
    fullName: 'John Doe',
    email: 'john@example.com',
    role: UserRole.USER,
    isActive: true,
    emailVerified: false,
    lastLoginAt: new Date(),
  };

  const mockTokens = {
    accessToken: 'mock.access.token',
    refreshToken: 'mock.refresh.token',
  };

  const mockAuthResponse: AuthResponse = {
    user: mockUser,
    tokens: mockTokens,
  };

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
      refreshTokens: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '+1234567890',
      companyName: 'Test Corp',
      industry: 'Technology',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      authService.register.mockResolvedValue(mockAuthResponse);

      // Act
      const result = await authController.register(registerDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Inscription réussie');
      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe(mockTokens.accessToken);
      expect(result.refreshToken).toBe(mockTokens.refreshToken);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should handle registration conflict', async () => {
      // Arrange
      authService.register.mockRejectedValue(new ConflictException('Cet email est déjà utilisé'));

      // Act & Assert
      await expect(authController.register(registerDto)).rejects.toThrow(ConflictException);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should validate required fields', async () => {
      // Arrange
      const invalidDto = { ...registerDto, email: '' };

      // Act & Assert
      // Note: La validation sera gérée par les ValidationPipes en production
      await expect(authController.register(invalidDto)).rejects.toThrow();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    const mockRequest = {
      user: mockUser,
    };

    it('should successfully login a user', async () => {
      // Arrange
      authService.login.mockResolvedValue(mockAuthResponse);

      // Act
      const result = await authController.login(mockRequest as any, loginDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Connexion réussie');
      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe(mockTokens.accessToken);
      expect(result.refreshToken).toBe(mockTokens.refreshToken);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle login failure', async () => {
      // Arrange
      authService.login.mockRejectedValue(new UnauthorizedException('Email ou mot de passe incorrect'));

      // Act & Assert
      await expect(authController.login(mockRequest as any, loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle missing user in request', async () => {
      // Arrange
      const emptyRequest = { user: null };

      // Act & Assert
      await expect(authController.login(emptyRequest as any, loginDto)).rejects.toThrow();
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto = {
      refreshToken: 'valid.refresh.token',
    };

    it('should successfully refresh tokens', async () => {
      // Arrange
      const newTokens = {
        accessToken: 'new.access.token',
        refreshToken: 'new.refresh.token',
      };
      authService.refreshTokens.mockResolvedValue(newTokens);

      // Act
      const result = await authController.refreshToken(refreshTokenDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Tokens rafraîchis avec succès');
      expect(result.accessToken).toBe(newTokens.accessToken);
      expect(result.refreshToken).toBe(newTokens.refreshToken);
      expect(authService.refreshTokens).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
    });

    it('should handle invalid refresh token', async () => {
      // Arrange
      authService.refreshTokens.mockRejectedValue(new UnauthorizedException('Token de rafraîchissement invalide'));

      // Act & Assert
      await expect(authController.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle missing refresh token', async () => {
      // Arrange
      const invalidDto = { refreshToken: '' };

      // Act & Assert
      await expect(authController.refreshToken(invalidDto)).rejects.toThrow();
    });
  });

  describe('getProfile', () => {
    const mockRequest = {
      user: mockUser,
    };

    it('should return user profile', async () => {
      // Act
      const result = await authController.getProfile(mockRequest as any);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should handle missing user in request', async () => {
      // Arrange
      const emptyRequest = { user: null };

      // Act & Assert
      await expect(authController.getProfile(emptyRequest as any)).rejects.toThrow();
    });
  });

  describe('logout', () => {
    const mockRequest = {
      user: mockUser,
    };

    const mockResponse = {
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    it('should successfully logout user', async () => {
      // Arrange
      authService.logout.mockResolvedValue();

      // Act
      const result = await authController.logout(mockRequest as any, mockResponse);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Déconnexion réussie');
      expect(authService.logout).toHaveBeenCalledWith(mockUser.id);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken');
    });

    it('should handle logout error gracefully', async () => {
      // Arrange
      authService.logout.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      // Le logout devrait réussir même si le service échoue
      const result = await authController.logout(mockRequest as any, mockResponse);
      expect(result.success).toBe(true);
      expect(mockResponse.clearCookie).toHaveBeenCalled();
    });
  });

  describe('validateToken', () => {
    const mockRequest = {
      user: mockUser,
    };

    it('should validate token successfully', async () => {
      // Act
      const result = await authController.validateToken(mockRequest as any);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Token valide');
      expect(result.user).toEqual(mockUser);
    });

    it('should handle invalid token', async () => {
      // Arrange
      const invalidRequest = { user: null };

      // Act & Assert
      await expect(authController.validateToken(invalidRequest as any)).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };
      authService.login.mockRejectedValue(new Error('Unexpected database error'));

      // Act & Assert
      await expect(authController.login({ user: mockUser } as any, loginDto)).rejects.toThrow();
    });

    it('should handle service unavailable errors', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      authService.register.mockRejectedValue(new Error('Service temporarily unavailable'));

      // Act & Assert
      await expect(authController.register(registerDto)).rejects.toThrow();
    });
  });

  describe('Input Validation', () => {
    it('should handle malformed request bodies', async () => {
      // Arrange
      const malformedDto = null;

      // Act & Assert
      await expect(authController.register(malformedDto as any)).rejects.toThrow();
      await expect(authController.login({ user: mockUser } as any, malformedDto as any)).rejects.toThrow();
    });

    it('should handle extremely long input values', async () => {
      // Arrange
      const extremeDto: RegisterDto = {
        fullName: 'A'.repeat(10000),
        email: 'test@example.com',
        password: 'password123',
      };

      // Note: En production, ceci serait géré par les ValidationPipes
      // Ici on teste la robustesse du contrôleur
      await expect(authController.register(extremeDto)).rejects.toThrow();
    });
  });
});
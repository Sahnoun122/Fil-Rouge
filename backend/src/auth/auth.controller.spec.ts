
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService, AuthResponse } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser = {
    id: '60f0c5a5c0e8d50015a5b1a1',
    fullName: 'John Doe',
    email: 'john@example.com',
    role: 'user' as UserRole,
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
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
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
      authService.register.mockResolvedValue(mockAuthResponse);

      const result = await authController.register(registerDto as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAuthResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should handle registration conflict', async () => {
      authService.register.mockRejectedValue(new ConflictException('Cet email est déjà utilisé'));
      await expect(authController.register(registerDto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should successfully login a user', async () => {
      authService.login.mockResolvedValue(mockAuthResponse);

      const result = await authController.login(loginDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('refresh', () => {
    it('should successfully refresh tokens', async () => {
      const tokens = { accessToken: 'newA', refreshToken: 'newR' };
      authService.refreshTokens.mockResolvedValue(tokens);

      const result = await authController.refresh('oldR');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(tokens);
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      authService.logout.mockResolvedValue({ message: 'Deconnexion reussie' });
      const req = { user: { sub: 'userId' } };
      
      const result = await authController.logout(req);

      expect(result.success).toBe(true);
      expect(authService.logout).toHaveBeenCalledWith('userId');
    });
  });

  describe('validateToken', () => {
    it('should return token validation info', async () => {
      const req = { user: mockUser };
      const result = await authController.validateToken(req);
      expect(result.success).toBe(true);
      expect(result.data.user).toEqual(mockUser);
    });
  });
});

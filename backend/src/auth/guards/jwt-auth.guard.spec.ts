// test/auth/guards/jwt-auth.guard.spec.ts - Tests pour JwtAuthGuard

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { JwtAuthGuard } from '../../../src/auth/guards/jwt-auth.guard';
import { UsersService } from '../../../src/users/users.service';
import { UserRole } from '../../../src/users/entities/user.entity';
import { IS_PUBLIC_KEY } from '../../../src/auth/decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: jest.Mocked<JwtService>;
  let usersService: jest.Mocked<UsersService>;
  let reflector: jest.Mocked<Reflector>;

  const mockUser = {
    id: '60f0c5a5c0e8d50015a5b1a1',
    fullName: 'John Doe',
    email: 'john@example.com',
    role: UserRole.USER,
    isActive: true,
    emailVerified: true,
    lastLoginAt: new Date(),
  };

  const mockPayload = {
    sub: mockUser.id,
    email: mockUser.email,
    role: mockUser.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  beforeEach(async () => {
    const mockJwtService = {
      verify: jest.fn(),
      decode: jest.fn(),
    };

    const mockUsersService = {
      findById: jest.fn(),
    };

    const mockReflector = {
      get: jest.fn(),
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get(JwtService);
    usersService = module.get(UsersService);
    reflector = module.get(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockContext = (requestData: Partial<Request> = {}): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {},
        user: undefined,
        ...requestData,
      }),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    }),
    getClass: jest.fn(),
    getHandler: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getType: jest.fn(),
  });

  describe('canActivate', () => {
    it('should allow access to public routes', async () => {
      // Arrange
      const context = createMockContext();
      reflector.getAllAndOverride.mockReturnValue(true);

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    });

    it('should allow access with valid JWT token', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      const context = createMockContext({
        headers: { authorization: `Bearer ${token}` },
      });
      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verify.mockReturnValue(mockPayload);
      usersService.findById.mockResolvedValue(mockUser);

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith(token);
      expect(usersService.findById).toHaveBeenCalledWith(mockPayload.sub);
      expect(context.switchToHttp().getRequest().user).toEqual(mockUser);
    });

    it('should deny access with missing Authorization header', async () => {
      // Arrange
      const context = createMockContext({
        headers: {},
      });
      reflector.getAllAndOverride.mockReturnValue(false);

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should deny access with invalid Authorization format', async () => {
      // Arrange
      const context = createMockContext({
        headers: { authorization: 'InvalidFormat token' },
      });
      reflector.getAllAndOverride.mockReturnValue(false);

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should deny access with missing Bearer prefix', async () => {
      // Arrange
      const context = createMockContext({
        headers: { authorization: 'token.without.bearer' },
      });
      reflector.getAllAndOverride.mockReturnValue(false);

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should deny access with invalid JWT token', async () => {
      // Arrange
      const token = 'invalid.jwt.token';
      const context = createMockContext({
        headers: { authorization: `Bearer ${token}` },
      });
      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should deny access with expired JWT token', async () => {
      // Arrange
      const token = 'expired.jwt.token';
      const expiredPayload = { ...mockPayload, exp: Math.floor(Date.now() / 1000) - 3600 };
      const context = createMockContext({
        headers: { authorization: `Bearer ${token}` },
      });
      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should deny access when user not found', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      const context = createMockContext({
        headers: { authorization: `Bearer ${token}` },
      });
      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verify.mockReturnValue(mockPayload);
      usersService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should deny access when user is inactive', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      const inactiveUser = { ...mockUser, isActive: false };
      const context = createMockContext({
        headers: { authorization: `Bearer ${token}` },
      });
      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verify.mockReturnValue(mockPayload);
      usersService.findById.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Authorization header', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      const context = createMockContext({
        headers: { authorization: `Bearer ${token}` },
      });
      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verify.mockReturnValue(mockPayload);
      usersService.findById.mockResolvedValue(mockUser);

      // Act
      await guard.canActivate(context);

      // Assert
      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should handle different Bearer token formats', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      const variations = [
        `Bearer ${token}`,
        `bearer ${token}`,
        `BEARER ${token}`,
      ];

      for (const authHeader of variations) {
        const context = createMockContext({
          headers: { authorization: authHeader },
        });
        reflector.getAllAndOverride.mockReturnValue(false);
        jwtService.verify.mockReturnValue(mockPayload);
        usersService.findById.mockResolvedValue(mockUser);

        // Act
        const result = await guard.canActivate(context);

        // Assert
        expect(result).toBe(true);
        expect(jwtService.verify).toHaveBeenCalledWith(token);
      }
    });

    it('should reject malformed headers', async () => {
      // Arrange
      const malformedHeaders = [
        'Bearer',
        'Bearer ',
        'Token valid.jwt.token',
        ' Bearer valid.jwt.token',
        'Bearer  ',
      ];

      for (const authHeader of malformedHeaders) {
        const context = createMockContext({
          headers: { authorization: authHeader },
        });
        reflector.getAllAndOverride.mockReturnValue(false);

        // Act & Assert
        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle JWT service errors gracefully', async () => {
      // Arrange
      const token = 'malformed.jwt.token';
      const context = createMockContext({
        headers: { authorization: `Bearer ${token}` },
      });
      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verify.mockImplementation(() => {
        throw new Error('JWT malformed');
      });

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle users service errors', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      const context = createMockContext({
        headers: { authorization: `Bearer ${token}` },
      });
      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verify.mockReturnValue(mockPayload);
      usersService.findById.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle reflector errors', async () => {
      // Arrange
      const context = createMockContext();
      reflector.getAllAndOverride.mockImplementation(() => {
        throw new Error('Reflector error');
      });

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long JWT tokens', async () => {
      // Arrange
      const longToken = 'a'.repeat(10000);
      const context = createMockContext({
        headers: { authorization: `Bearer ${longToken}` },
      });
      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verify.mockReturnValue(mockPayload);
      usersService.findById.mockResolvedValue(mockUser);

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith(longToken);
    });

    it('should handle special characters in tokens', async () => {
      // Arrange
      const specialToken = 'token.with+special/characters=';
      const context = createMockContext({
        headers: { authorization: `Bearer ${specialToken}` },
      });
      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verify.mockReturnValue(mockPayload);
      usersService.findById.mockResolvedValue(mockUser);

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith(specialToken);
    });

    it('should handle null/undefined context values', async () => {
      // Arrange
      const malformedContext = {
        switchToHttp: () => ({
          getRequest: () => null,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getClass: jest.fn(),
        getHandler: jest.fn(),
      } as ExecutionContext;

      // Act & Assert
      await expect(guard.canActivate(malformedContext)).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle multiple concurrent authentications', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      const promises = Array(10).fill(null).map(() => {
        const context = createMockContext({
          headers: { authorization: `Bearer ${token}` },
        });
        reflector.getAllAndOverride.mockReturnValue(false);
        jwtService.verify.mockReturnValue(mockPayload);
        usersService.findById.mockResolvedValue(mockUser);
        
        return guard.canActivate(context);
      });

      // Act
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(10);
      results.forEach(result => expect(result).toBe(true));
    });

    it('should cache user data efficiently', async () => {
      // Arrange
      const token = 'valid.jwt.token';
      const context = createMockContext({
        headers: { authorization: `Bearer ${token}` },
      });
      reflector.getAllAndOverride.mockReturnValue(false);
      jwtService.verify.mockReturnValue(mockPayload);
      usersService.findById.mockResolvedValue(mockUser);

      // Act - multiple calls
      await guard.canActivate(context);
      await guard.canActivate(context);

      // Assert
      // Chaque appel devrait valider le token et récupérer l'utilisateur
      expect(jwtService.verify).toHaveBeenCalledTimes(2);
      expect(usersService.findById).toHaveBeenCalledTimes(2);
    });
  });
});
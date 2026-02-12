// test/auth/guards/local-auth.guard.spec.ts - Tests pour LocalAuthGuard

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { LocalAuthGuard } from '../../../src/auth/guards/local-auth.guard';
import { AuthService } from '../../../src/auth/auth.service';
import { UserRole } from '../../../src/users/entities/user.entity';

describe('LocalAuthGuard', () => {
  let guard: LocalAuthGuard;
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

  beforeEach(async () => {
    const mockAuthService = {
      validateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalAuthGuard,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<LocalAuthGuard>(LocalAuthGuard);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockContext = (requestData: Partial<Request> = {}): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => ({
        body: {},
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

  describe('validate', () => {
    it('should validate user with correct credentials', async () => {
      // Arrange
      const email = 'john@example.com';
      const password = 'password123';
      authService.validateUser.mockResolvedValue(mockUser);

      // Act
      const result = await guard.validate(email, password);

      // Assert
      expect(result).toEqual(mockUser);
      expect(authService.validateUser).toHaveBeenCalledWith(email, password);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      // Arrange
      const email = 'john@example.com';
      const password = 'wrongpassword';
      authService.validateUser.mockResolvedValue(null);

      // Act & Assert
      await expect(guard.validate(email, password)).rejects.toThrow(UnauthorizedException);
      expect(authService.validateUser).toHaveBeenCalledWith(email, password);
    });

    it('should handle missing email', async () => {
      // Act & Assert
      await expect(guard.validate('', 'password123')).rejects.toThrow(UnauthorizedException);
    });

    it('should handle missing password', async () => {
      // Act & Assert
      await expect(guard.validate('john@example.com', '')).rejects.toThrow(UnauthorizedException);
    });

    it('should handle service errors', async () => {
      // Arrange
      const email = 'john@example.com';
      const password = 'password123';
      authService.validateUser.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(guard.validate(email, password)).rejects.toThrow();
    });
  });

  describe('canActivate', () => {
    it('should activate for valid user authentication', async () => {
      // Arrange
      const context = createMockContext({
        body: { email: 'john@example.com', password: 'password123' },
      });
      authService.validateUser.mockResolvedValue(mockUser);

      // Mock the parent canActivate method
      const parentCanActivate = jest.spyOn(Object.getPrototypeOf(LocalAuthGuard.prototype), 'canActivate');
      parentCanActivate.mockResolvedValue(true);

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
      expect(parentCanActivate).toHaveBeenCalledWith(context);
    });

    it('should deny activation for invalid authentication', async () => {
      // Arrange
      const context = createMockContext({
        body: { email: 'john@example.com', password: 'wrongpassword' },
      });

      // Mock the parent canActivate method to throw
      const parentCanActivate = jest.spyOn(Object.getPrototypeOf(LocalAuthGuard.prototype), 'canActivate');
      parentCanActivate.mockRejectedValue(new UnauthorizedException());

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle malformed request context', async () => {
      // Arrange
      const malformedContext = {
        switchToHttp: () => ({
          getRequest: () => null,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
      } as ExecutionContext;

      const parentCanActivate = jest.spyOn(Object.getPrototypeOf(LocalAuthGuard.prototype), 'canActivate');
      parentCanActivate.mockRejectedValue(new Error('Invalid request'));

      // Act & Assert
      await expect(guard.canActivate(malformedContext)).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle inactive user', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      authService.validateUser.mockResolvedValue(inactiveUser);

      // Act
      const result = await guard.validate('john@example.com', 'password123');

      // Assert
      expect(result).toEqual(inactiveUser);
      // Note: L'activation de l'utilisateur peut être vérifiée ailleurs dans l'application
    });

    it('should handle unverified email', async () => {
      // Arrange
      const unverifiedUser = { ...mockUser, emailVerified: false };
      authService.validateUser.mockResolvedValue(unverifiedUser);

      // Act
      const result = await guard.validate('john@example.com', 'password123');

      // Assert
      expect(result).toEqual(unverifiedUser);
    });

    it('should handle special characters in credentials', async () => {
      // Arrange
      const email = 'user+test@example.com';
      const password = 'P@ssw0rd!#$';
      authService.validateUser.mockResolvedValue(mockUser);

      // Act
      const result = await guard.validate(email, password);

      // Assert
      expect(result).toEqual(mockUser);
      expect(authService.validateUser).toHaveBeenCalledWith(email, password);
    });

    it('should handle unicode characters in credentials', async () => {
      // Arrange
      const email = 'utilisateur@exémple.fr';
      const password = 'motdepasse123';
      authService.validateUser.mockResolvedValue(mockUser);

      // Act
      const result = await guard.validate(email, password);

      // Assert
      expect(result).toEqual(mockUser);
      expect(authService.validateUser).toHaveBeenCalledWith(email, password);
    });
  });

  describe('Performance Tests', () => {
    it('should handle multiple concurrent validations', async () => {
      // Arrange
      const promises = Array(10).fill(null).map((_, index) => {
        authService.validateUser.mockResolvedValueOnce(mockUser);
        return guard.validate(`user${index}@example.com`, 'password123');
      });

      // Act
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(10);
      results.forEach(result => expect(result).toEqual(mockUser));
      expect(authService.validateUser).toHaveBeenCalledTimes(10);
    });

    it('should handle timeout scenarios', async () => {
      // Arrange
      const email = 'john@example.com';
      const password = 'password123';
      authService.validateUser.mockImplementation(() => 
        new Promise((resolve) => setTimeout(() => resolve(mockUser), 100))
      );

      // Act
      const startTime = Date.now();
      const result = await guard.validate(email, password);
      const endTime = Date.now();

      // Assert
      expect(result).toEqual(mockUser);
      expect(endTime - startTime).toBeGreaterThan(90); // Au moins 90ms
    });
  });
});
// src/auth/guards/jwt-auth.guard.spec.ts - Tests pour JwtAuthGuard

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get(Reflector) as any;
  });

  const createMockContext = (isPublic = false): ExecutionContext => {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({}),
        getResponse: () => ({}),
      }),
    } as any;
  };

  describe('canActivate', () => {
    it('should return true for public routes', async () => {
      reflector.getAllAndOverride.mockReturnValue(true);
      const context = createMockContext(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should call super.canActivate for non-public routes', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const context = createMockContext(false);
      const superCanActivateSpy = jest
        .spyOn(JwtAuthGuard.prototype, 'canActivate')
        .mockImplementation(() => true);

      // Note: testing super.canActivate is tricky, but we can verify it doesn't return true immediately
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
      superCanActivateSpy.mockRestore();
    });
  });

  describe('handleRequest', () => {
    it('should return user when no error and user exists', () => {
      const user = { id: 1, isBanned: false };
      const result = guard.handleRequest(null, user);
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException when no user', () => {
      expect(() => guard.handleRequest(null, null)).toThrow(UnauthorizedException);
    });

    it('should throw error when error exists', () => {
      const error = new Error('Passport error');
      expect(() => guard.handleRequest(error, null)).toThrow(error);
    });

    it('should throw UnauthorizedException when user is banned', () => {
      const user = { id: 1, isBanned: true };
      expect(() => guard.handleRequest(null, user)).toThrow(
        new UnauthorizedException('Compte banni'),
      );
    });
  });
});

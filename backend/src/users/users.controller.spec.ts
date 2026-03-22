import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockUser = {
    id: '60f0c5a5c0e8d50015a5b1a1',
    fullName: 'John Doe',
    email: 'john@example.com',
    role: 'user' as UserRole,
  };

  const mockRequest = {
    user: {
      sub: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
    },
  };

  beforeEach(async () => {
    const mockUsersService = {
      findById: jest.fn(),
      findByIdOrThrow: jest.fn(),
      updateProfile: jest.fn(),
      updatePreferences: jest.fn(),
      changePassword: jest.fn(),
      deleteOwnAccount: jest.fn(),
      getAllUsers: jest.fn(),
      getUserStats: jest.fn(),
      updateUserRole: jest.fn(),
      setUserBanStatus: jest.fn(),
      createUser: jest.fn(),
      updateUserByAdmin: jest.fn(),
      deleteUserByAdmin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      service.findById.mockResolvedValue(mockUser as any);
      const result = await controller.getProfile(mockRequest);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(service.findById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw BadRequestException if user not authenticated', async () => {
      await expect(controller.getProfile({})).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateProfile', () => {
    it('should update and return profile', async () => {
      const dto = { fullName: 'New Name' };
      const updatedUser = { ...mockUser, ...dto };
      service.updateProfile.mockResolvedValue(updatedUser as any);

      const result = await controller.updateProfile(mockRequest, dto);
      expect(result.success).toBe(true);
      expect(result.data.fullName).toBe('New Name');
    });
  });

  describe('admin operations', () => {
    it('should get all users', async () => {
      const queryResult = { users: [mockUser], total: 1, page: 1, limit: 10, totalPages: 1 };
      service.getAllUsers.mockResolvedValue(queryResult as any);

      const result = await controller.getAllUsers({ page: 1, limit: 10 });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(queryResult);
    });

    it('should update user role', async () => {
      service.updateUserRole.mockResolvedValue({ ...mockUser, role: 'admin' as UserRole } as any);
      const result = await controller.updateUserRole(mockRequest, 'otherId', { role: 'admin' as UserRole });
      expect(result.success).toBe(true);
      expect(service.updateUserRole).toHaveBeenCalledWith('otherId', 'admin', mockUser.id);
    });

    it('should set ban status', async () => {
      service.setUserBanStatus.mockResolvedValue({ ...mockUser, isBanned: true } as any);
      const result = await controller.setUserBanStatus(mockRequest, 'otherId', { ban: true, reason: 'Test' });
      expect(result.success).toBe(true);
      expect(service.setUserBanStatus).toHaveBeenCalledWith('otherId', true, mockUser.id, 'Test');
    });
  });
});

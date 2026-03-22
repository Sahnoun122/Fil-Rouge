import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { UsersService } from './users.service';
import { User, UserDocument } from './entities/user.entity';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<UserDocument>;

  const mockUser: any = {
    _id: '60f0c5a5c0e8d50015a5b1a1',
    fullName: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    role: 'user',
    isActive: true,
    isBanned: false,
    save: jest.fn(),
    exec: jest.fn(),
  };

  class MockQuery {
    private result: any = null;
    constructor(result: any = null) {
      this.result = result;
    }
    select = jest.fn().mockReturnThis();
    sort = jest.fn().mockReturnThis();
    skip = jest.fn().mockReturnThis();
    limit = jest.fn().mockReturnThis();
    exec = jest.fn().mockImplementation(() => Promise.resolve(this.result));
    then = jest.fn().mockImplementation((resolve, reject) => {
      return Promise.resolve(this.result).then(resolve, reject);
    });
  }

  class MockModel {
    constructor(public data: any) {
      Object.assign(this, data);
    }
    save() {
      return Promise.resolve(this);
    }
    markModified = jest.fn();

    static find = jest.fn().mockReturnValue(new MockQuery());
    static findOne = jest.fn().mockReturnValue(new MockQuery());
    static findById = jest.fn().mockReturnValue(new MockQuery());
    static findByIdAndUpdate = jest.fn().mockReturnValue(new MockQuery());
    static findByIdAndDelete = jest.fn().mockReturnValue(new MockQuery());
    static countDocuments = jest.fn().mockReturnValue(new MockQuery());
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: MockModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const createDto = {
      fullName: 'New User',
      email: 'new@example.com',
      password: 'password123',
    };

    it('should successfully create a user', async () => {
      const savedUser = { ...mockUser, ...createDto };
      (MockModel.findById as jest.Mock).mockReturnValue(new MockQuery(savedUser));

      const result = await service.createUser(createDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createDto.email);
    });

    it('should throw ConflictException on duplicate email', async () => {
      jest.spyOn(MockModel.prototype, 'save').mockRejectedValue({ code: 11000 });

      await expect(service.createUser(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      (MockModel.findById as jest.Mock).mockReturnValue(new MockQuery(mockUser));

      const result = await service.findById(mockUser._id);
      expect(result).toEqual(mockUser);
    });

    it('should return null if not found', async () => {
      (MockModel.findById as jest.Mock).mockReturnValue(new MockQuery(null));

      const result = await service.findById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      (MockModel.findOne as jest.Mock).mockReturnValue(new MockQuery(mockUser));

      const result = await service.findByEmail(mockUser.email);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should update user fields', async () => {
      const updatedUser = { ...mockUser, fullName: 'Updated Name' };
      (MockModel.findById as jest.Mock).mockResolvedValue(updatedUser);
      updatedUser.save = jest.fn().mockResolvedValue(updatedUser);

      const result = await service.updateProfile(mockUser._id, { fullName: 'Updated Name' });
      expect(result.fullName).toBe('Updated Name');
      expect(updatedUser.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      (MockModel.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.updateProfile('id', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('changePassword', () => {
    const dto = { currentPassword: 'old', newPassword: 'new' };

    it('should change password successfully', async () => {
      const user = { 
        ...mockUser, 
        password: 'hashedOld', 
        save: jest.fn().mockResolvedValue(true) 
      };
      (MockModel.findById as jest.Mock).mockReturnValue(new MockQuery(user));
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.changePassword(mockUser._id, dto);
      expect(result.message).toBeDefined();
      expect(user.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if current password incorrect', async () => {
      const user = { ...mockUser, password: 'hashedOld' };
      (MockModel.findById as jest.Mock).mockReturnValue(new MockQuery(user));
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(mockUser._id, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateRefreshToken', () => {
    it('should hash and save refresh token', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedToken');
      (MockModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      await service.updateRefreshToken(mockUser._id, 'token');
      expect(bcrypt.hash).toHaveBeenCalledWith('token', 10);
      expect(MockModel.findByIdAndUpdate).toHaveBeenCalledWith(mockUser._id, {
        refreshToken: 'hashedToken',
      });
    });
  });

  describe('setUserBanStatus', () => {
    it('should set ban status successfully', async () => {
      const user = { ...mockUser, isBanned: false, save: jest.fn().mockResolvedValue(true) };
      (MockModel.findById as jest.Mock).mockResolvedValue(user);

      const result = await service.setUserBanStatus(mockUser._id, true, 'adminId', 'Reason');
      expect(user.isBanned).toBe(true);
      expect(user.banReason).toBe('Reason');
      expect(user.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when banning last admin', async () => {
      const admin = { ...mockUser, role: 'admin', isBanned: false };
      (MockModel.findById as jest.Mock).mockResolvedValue(admin);
      (MockModel.countDocuments as jest.Mock).mockResolvedValue(0);

      await expect(service.setUserBanStatus('adminId', true, 'otherAdminId')).rejects.toThrow(BadRequestException);
    });
  });
});

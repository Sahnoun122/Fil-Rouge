import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { AiMonitoringService } from './ai-monitoring.service';
import { AiFeatureType, AiLog, AiLogStatus } from './schemas/ai-log.schema';
import { User } from '../users/entities/user.entity';

describe('AiMonitoringService', () => {
  let service: AiMonitoringService;

  const mockUserId = new Types.ObjectId().toString();
  const mockLogId = new Types.ObjectId().toString();

  const mockAiLog = {
    _id: mockLogId,
    userId: mockUserId,
    featureType: 'content',
    actionType: 'generate',
    status: 'success',
    save: jest.fn().mockImplementation(function() { return Promise.resolve(this); }),
  };

  class MockQuery {
    private result: unknown;
    constructor(result: unknown = null) { this.result = result; }
    populate = jest.fn().mockReturnThis();
    sort = jest.fn().mockReturnThis();
    skip = jest.fn().mockReturnThis();
    limit = jest.fn().mockReturnThis();
    lean = jest.fn().mockReturnThis();
    exec = jest.fn().mockImplementation(() => Promise.resolve(this.result));
    then = jest.fn().mockImplementation((resolve: (val: unknown) => void, reject: (err: unknown) => void) => Promise.resolve(this.result).then(resolve, reject));
  }

  class MockModel {
    constructor(public data?: Record<string, unknown>) { if (data) Object.assign(this, data); }
    save(): Promise<unknown> { return Promise.resolve(this); }
    static find = jest.fn().mockReturnValue(new MockQuery());
    static findOne = jest.fn().mockReturnValue(new MockQuery());
    static findById = jest.fn().mockReturnValue(new MockQuery());
    static aggregate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    });
    static distinct = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    });
    static countDocuments = jest.fn().mockReturnValue(new MockQuery());
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiMonitoringService,
        {
          provide: getModelToken(AiLog.name),
          useValue: MockModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: MockModel,
        },
      ],
    }).compile();

    service = module.get<AiMonitoringService>(AiMonitoringService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createLog', () => {
    it('should successfully create a log', async () => {
      const payload = {
        userId: mockUserId,
        featureType: 'content' as AiFeatureType,
        actionType: 'generate',
        status: 'success' as AiLogStatus,
      };

      jest.spyOn(MockModel.prototype, 'save').mockResolvedValue(mockAiLog);
      const result = await service.createLog(payload);
      expect(result).toBeDefined();
    });

    it('should return null if userId is invalid', async () => {
      const result = await service.createLog({ userId: 'invalid', featureType: 'content' as AiFeatureType, actionType: 'test', status: 'success' as AiLogStatus });
      expect(result).toBeNull();
    });
  });

  describe('getOverview', () => {
    it('should return overview stats', async () => {
      const mockSummary = [{ totalRequests: 10, successfulRequests: 8, failedRequests: 2, averageResponseTimeMs: 150 }];
      (MockModel.aggregate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockSummary).mockResolvedValueOnce([]).mockResolvedValueOnce([]), // for other calls
      });
      (MockModel.distinct as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getOverview();
      expect(result.totalRequests).toBe(10);
      expect(result.successRate).toBe(80);
    });
  });

  describe('getLogById', () => {
    it('should return a log if found', async () => {
      (MockModel.findById as jest.Mock).mockReturnValue(new MockQuery(mockAiLog));
      const result = await service.getLogById(mockLogId);
      expect(result).toEqual(mockAiLog);
    });

    it('should throw NotFoundException if not found', async () => {
      (MockModel.findById as jest.Mock).mockReturnValue(new MockQuery(null));
      await expect(service.getLogById(mockLogId)).rejects.toThrow(NotFoundException);
    });
  });
});

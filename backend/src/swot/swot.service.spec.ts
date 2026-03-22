import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';

import { SwotService } from './swot.service';
import { Swot } from './schemas/swot.schema';
import { Strategy } from '../strategies/schemas/strategy.schema';
import { User } from '../users/entities/user.entity';
import { AiService } from '../ai/ai.service';
import { AiMonitoringService } from '../ai-monitoring/ai-monitoring.service';

describe('SwotService', () => {
  let service: SwotService;
  let aiService: jest.Mocked<AiService>;
  let aiMonitoringService: jest.Mocked<AiMonitoringService>;

  const mockUserId = new Types.ObjectId().toString();
  const mockSwotId = new Types.ObjectId().toString();
  const mockStrategyId = new Types.ObjectId().toString();

  const mockSwot = {
    _id: mockSwotId,
    userId: mockUserId,
    strategyId: mockStrategyId,
    title: 'Test SWOT',
    swot: { strengths: ['S1'], weaknesses: ['W1'], opportunities: ['O1'], threats: ['T1'] },
    save: jest.fn().mockImplementation(function() { return Promise.resolve(this); }),
  };

  const mockStrategy = {
    _id: mockStrategyId,
    userId: mockUserId,
    businessInfo: { businessName: 'Test Business' },
    generatedStrategy: {},
  };

  class MockQuery {
    private result: any;
    constructor(result: any = null) { this.result = result; }
    select = jest.fn().mockReturnThis();
    populate = jest.fn().mockReturnThis();
    sort = jest.fn().mockReturnThis();
    skip = jest.fn().mockReturnThis();
    limit = jest.fn().mockReturnThis();
    lean = jest.fn().mockReturnThis();
    exec = jest.fn().mockImplementation(() => Promise.resolve(this.result));
    then = jest.fn().mockImplementation((resolve, reject) => Promise.resolve(this.result).then(resolve, reject));
  }

  class MockModel {
    constructor(public data: any) { Object.assign(this, data); }
    save() { return Promise.resolve(this); }
    static find = jest.fn().mockReturnValue(new MockQuery());
    static findById = jest.fn().mockReturnValue(new MockQuery());
    static countDocuments = jest.fn().mockReturnValue(new MockQuery());
    static deleteOne = jest.fn().mockReturnValue(new MockQuery());
  }

  beforeEach(async () => {
    const mockAiService = {
      callNemotronAndParseJson: jest.fn(),
      getModelName: jest.fn().mockReturnValue('test-model'),
    };
    const mockAiMonitoringService = {
      createLog: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SwotService,
        {
          provide: getModelToken(Swot.name),
          useValue: MockModel,
        },
        {
          provide: getModelToken(Strategy.name),
          useValue: MockModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: MockModel,
        },
        { provide: AiService, useValue: mockAiService },
        { provide: AiMonitoringService, useValue: mockAiMonitoringService },
      ],
    }).compile();

    service = module.get<SwotService>(SwotService);
    aiService = module.get(AiService);
    aiMonitoringService = module.get(AiMonitoringService);
  });

  describe('createManual', () => {
    it('should successfully create a manual SWOT', async () => {
      const dto = {
        strategyId: mockStrategyId,
        swot: { strengths: ['S1'], weaknesses: ['W1'], opportunities: ['O1'], threats: ['T1'] },
      };

      (MockModel.findById as jest.Mock).mockReturnValue(new MockQuery(mockStrategy));
      jest.spyOn(MockModel.prototype, 'save').mockResolvedValue(mockSwot);

      const result = await service.createManual(mockUserId, dto);
      expect(result).toBeDefined();
    });
  });

  describe('generateFromStrategy', () => {
    it('should successfully generate SWOT via AI', async () => {
      const dto = { strategyId: mockStrategyId };
      const aiResult = { strengths: ['S1'], weaknesses: ['W1'], opportunities: ['O1'], threats: ['T1'] };

      (MockModel.findById as jest.Mock).mockReturnValue(new MockQuery(mockStrategy));
      aiService.callNemotronAndParseJson.mockResolvedValue(aiResult);
      jest.spyOn(MockModel.prototype, 'save').mockResolvedValue(mockSwot);

      const result = await service.generateFromStrategy(mockUserId, dto);
      expect(result).toBeDefined();
      expect(aiService.callNemotronAndParseJson).toHaveBeenCalled();
      expect(aiMonitoringService.createLog).toHaveBeenCalled();
    });

    it('should throw BadRequestException if AI return invalid formats', async () => {
       const dto = { strategyId: mockStrategyId };
      (MockModel.findById as jest.Mock).mockReturnValue(new MockQuery(mockStrategy));
      aiService.callNemotronAndParseJson.mockResolvedValue({ invalid: 'field' });

      await expect(service.generateFromStrategy(mockUserId, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return swots and total', async () => {
      (MockModel.find as jest.Mock).mockReturnValue(new MockQuery([]));
      (MockModel.countDocuments as jest.Mock).mockReturnValue(new MockQuery(0));

      const result = await service.findAll(mockUserId);
      expect(result.swots).toBeDefined();
      expect(result.total).toBe(0);
    });
  });
});

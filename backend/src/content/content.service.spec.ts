import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';

import { ContentService } from './content.service';
import { ContentCampaign } from './schemas/content-campaign.schema';
import { Strategy } from '../strategies/schemas/strategy.schema';
import { User } from '../users/entities/user.entity';
import { AiService } from '../ai/ai.service';
import { AiMonitoringService } from '../ai-monitoring/ai-monitoring.service';
import { AutoSchedulerService } from './auto-scheduler.service';
import { CalendarService } from '../calendar/calendar.service';

describe('ContentService', () => {
  let service: ContentService;
  let aiService: jest.Mocked<AiService>;
  let calendarService: jest.Mocked<CalendarService>;

  const mockUserId = new Types.ObjectId().toString();
  const mockStrategyId = new Types.ObjectId().toString();
  const mockCampaignId = new Types.ObjectId().toString();

  const mockStrategy = {
    _id: mockStrategyId,
    userId: mockUserId,
    businessInfo: { businessName: 'Test Business' },
    generatedStrategy: { 
      avant: { 
        canauxCommunication: { plateformes: ['Instagram', 'Facebook'] } 
      } 
    },
  };

  const mockCampaign: any = {
    _id: mockCampaignId,
    userId: mockUserId,
    strategyId: mockStrategyId,
    name: 'Test Campaign',
    mode: 'CONTENT_MARKETING',
    platforms: ['Instagram'],
    inputs: {},
    generatedPosts: [],
    save: jest.fn().mockImplementation(function() { return Promise.resolve(this); }),
  };

  class MockQuery {
    private result: any;
    constructor(result: any = null) { this.result = result; }
    select = jest.fn().mockReturnThis();
    populate = jest.fn().mockReturnThis();
    sort = jest.fn().mockReturnThis();
    skip = jest.fn().mockReturnThis();
    limit = jest.fn().mockReturnThis();
    exec = jest.fn().mockImplementation(() => Promise.resolve(this.result));
    then = jest.fn().mockImplementation((resolve, reject) => Promise.resolve(this.result).then(resolve, reject));
  }

  class MockModel {
    constructor(public data: any) { Object.assign(this, data); }
    save() { return Promise.resolve(this); }
    static find = jest.fn().mockReturnValue(new MockQuery());
    static findOne = jest.fn().mockReturnValue(new MockQuery());
    static findById = jest.fn().mockReturnValue(new MockQuery());
    static deleteOne = jest.fn().mockReturnValue(new MockQuery());
    static countDocuments = jest.fn().mockReturnValue(new MockQuery());
  }

  beforeEach(async () => {
    const mockAiService = {
      callNemotronAndParseJson: jest.fn(),
      getModelName: jest.fn().mockReturnValue('mock-model'),
    };
    const mockAiMonitoringService = {
      createLog: jest.fn(),
    };
    const mockAutoSchedulerService = {
      createSchedule: jest.fn(),
    };
    const mockCalendarService = {
      syncCampaignAutoSchedule: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: getModelToken(ContentCampaign.name),
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
        { provide: AutoSchedulerService, useValue: mockAutoSchedulerService },
        { provide: CalendarService, useValue: mockCalendarService },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
    aiService = module.get(AiService);
    calendarService = module.get(CalendarService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCampaign', () => {
    it('should successfully create a campaign', async () => {
      const dto = {
        strategyId: mockStrategyId,
        mode: 'CONTENT_MARKETING' as any,
        inputs: {},
      };

      (MockModel.findById as jest.Mock).mockReturnValue(new MockQuery(mockStrategy));
      jest.spyOn(MockModel.prototype, 'save').mockResolvedValue(mockCampaign);

      const result = await service.createCampaign(mockUserId, dto);
      expect(result).toBeDefined();
      expect(MockModel.findById).toHaveBeenCalled();
    });

    it('should throw NotFoundException if strategy not found', async () => {
      (MockModel.findById as jest.Mock).mockReturnValue(new MockQuery(null));
      await expect(service.createCampaign(mockUserId, { 
        strategyId: new Types.ObjectId().toString(), 
        mode: 'CONTENT_MARKETING' as any, 
        inputs: {} 
      }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return campaigns and total count', async () => {
      (MockModel.find as jest.Mock).mockReturnValue(new MockQuery([mockCampaign]));
      (MockModel.countDocuments as jest.Mock).mockReturnValue(new MockQuery(1));

      const result = await service.findAll(mockUserId);
      expect(result.campaigns).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('generateCampaign', () => {
    it('should successfully generate posts', async () => {
      const gPosts = [
        { platform: 'Instagram', caption: 'Insta Post', type: 'image' },
        { platform: 'Facebook', caption: 'FB Post', type: 'image' }
      ];
      (MockModel.findById as jest.Mock)
        .mockReturnValueOnce(new MockQuery(mockCampaign))
        .mockReturnValueOnce(new MockQuery(mockStrategy));
        
      aiService.callNemotronAndParseJson.mockResolvedValue({ 
        posts: gPosts,
        summary: { contentPillars: ['Pillar 1'] }
      });

      const result = await service.generateCampaign(mockUserId, mockCampaignId);
      expect(result).toBeDefined();
      expect(aiService.callNemotronAndParseJson).toHaveBeenCalled();
      expect(result.generatedPosts).toHaveLength(2);
    });

    it('should throw BadRequestException if campaign has no platforms', async () => {
      const campaignNoPlatforms = { ...mockCampaign, platforms: [], strategyId: mockStrategyId };
      (MockModel.findById as jest.Mock)
        .mockReturnValueOnce(new MockQuery(campaignNoPlatforms))
        .mockReturnValueOnce(new MockQuery(mockStrategy));

      await expect(service.generateCampaign(mockUserId, mockCampaignId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteCampaign', () => {
    it('should successfully delete campaign', async () => {
      (MockModel.findById as jest.Mock).mockReturnValue(new MockQuery(mockCampaign));
      (MockModel.deleteOne as jest.Mock).mockReturnValue(new MockQuery({ deletedCount: 1 }));

      await service.deleteCampaign(mockUserId, mockCampaignId);
      expect(MockModel.deleteOne).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user does not own campaign', async () => {
      const otherCampaign = { ...mockCampaign, userId: 'otherUser' };
      (MockModel.findById as jest.Mock).mockReturnValue(new MockQuery(otherCampaign));

      await expect(service.deleteCampaign(mockUserId, mockCampaignId))
        .rejects.toThrow(ForbiddenException);
    });
  });
});

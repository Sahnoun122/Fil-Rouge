import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';

import { CalendarService } from './calendar.service';
import { ScheduledPost } from './schemas/scheduled-post.schema';
import { NotificationsService } from '../notifications/notifications.service';

describe('CalendarService', () => {
  let service: CalendarService;
  let notificationsService: jest.Mocked<NotificationsService>;

  const mockUserId = new Types.ObjectId().toString();
  const mockPostId = new Types.ObjectId().toString();
  const mockCampaignId = new Types.ObjectId().toString();

  const mockScheduledPost = {
    _id: mockPostId,
    userId: mockUserId,
    campaignId: mockCampaignId,
    platform: 'Instagram',
    scheduledAt: new Date(Date.now() + 86400000), // 1 day in the future
    status: 'planned',
    timezone: 'UTC',
    save: jest.fn().mockImplementation(function() { return Promise.resolve(this); }),
  };

  class MockQuery {
    private result: any;
    constructor(result: any = null) { this.result = result; }
    select = jest.fn().mockReturnThis();
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
    static deleteMany = jest.fn().mockReturnValue(new MockQuery());
    static countDocuments = jest.fn().mockReturnValue(new MockQuery());
    static insertMany = jest.fn().mockResolvedValue([]);
  }

  beforeEach(async () => {
    const mockNotificationsService = {
      upsertRemindersForScheduledPost: jest.fn(),
      upsertRemindersForScheduledPosts: jest.fn(),
      deleteRemindersForPost: jest.fn(),
      deleteRemindersForPosts: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        {
          provide: getModelToken(ScheduledPost.name),
          useValue: MockModel,
        },
        {
          provide: getModelToken('Strategy'),
          useValue: MockModel,
        },
        {
          provide: getModelToken('ContentCampaign'),
          useValue: MockModel,
        },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
    notificationsService = module.get(NotificationsService);
  });

  describe('createScheduledPost', () => {
    it('should successfully create a post', async () => {
      const dto = {
        platform: 'Instagram' as any,
        postType: 'post' as any,
        caption: 'Test caption',
        scheduledAt: new Date(Date.now() + 3600000), // 1h future
        timezone: 'UTC',
      };

      (MockModel.findById as jest.Mock).mockReturnValue(new MockQuery(null)); // for relations check
      jest.spyOn(MockModel.prototype, 'save').mockResolvedValue(mockScheduledPost);

      const result = await service.createScheduledPost(mockUserId, dto);
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException for past date', async () => {
      const dto = {
        platform: 'Instagram' as any,
        postType: 'post' as any,
        caption: 'Test',
        scheduledAt: new Date(Date.now() - 3600000),
        timezone: 'UTC',
      };

      await expect(service.createScheduledPost(mockUserId, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteScheduledPost', () => {
    it('should successfully delete post', async () => {
      (MockModel.findById as jest.Mock).mockReturnValue(new MockQuery(mockScheduledPost));
      (MockModel.deleteOne as jest.Mock).mockReturnValue(new MockQuery({ deletedCount: 1 }));

      await service.deleteScheduledPost(mockUserId, mockPostId);
      expect(MockModel.deleteOne).toHaveBeenCalled();
      expect(notificationsService.deleteRemindersForPost).toHaveBeenCalled();
    });
  });

  describe('syncCampaignAutoSchedule', () => {
    it('should sync posts for campaign', async () => {
      const campaign: any = {
        _id: mockCampaignId,
        userId: mockUserId,
        generatedPosts: [{
          platform: 'Instagram',
          type: 'image',
          caption: 'Test',
          schedule: { date: '2100-01-01', time: '12:00', timezone: 'UTC' }
        }]
      };

      (MockModel.find as jest.Mock).mockReturnValue(new MockQuery([])); // No old posts to remove
      (MockModel.insertMany as jest.Mock).mockResolvedValue([mockScheduledPost]);

      await service.syncCampaignAutoSchedule(mockUserId, campaign);
      expect(MockModel.insertMany).toHaveBeenCalled();
    });
  });
});

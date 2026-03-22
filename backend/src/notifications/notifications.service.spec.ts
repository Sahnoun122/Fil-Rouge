import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { NotificationsService } from './notifications.service';
import { Notification } from './schemas/notification.schema';
import { ScheduledPost } from '../calendar/schemas/scheduled-post.schema';
import { User } from '../users/entities/user.entity';
import { EmailService } from './email/email.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let emailService: jest.Mocked<EmailService>;

  const mockUserId = new Types.ObjectId().toString();
  const mockPostId = new Types.ObjectId().toString();

  const mockUser = {
    _id: mockUserId,
    email: 'test@example.com',
    preferences: { emailNotifications: true, contentReminders: true },
  };

  const mockPost = {
    _id: mockPostId,
    userId: mockUserId,
    platform: 'Instagram',
    postType: 'post',
    scheduledAt: new Date(Date.now() + 7200000), // 2 hours future
    status: 'planned',
    timezone: 'UTC',
  };

  class MockQuery {
    private result: any;
    constructor(result: any = null) { this.result = result; }
    sort = jest.fn().mockReturnThis();
    limit = jest.fn().mockReturnThis();
    exec = jest.fn().mockImplementation(() => Promise.resolve(this.result));
    then = jest.fn().mockImplementation((resolve, reject) => Promise.resolve(this.result).then(resolve, reject));
  }

  class MockModel {
    constructor(public data: any) { Object.assign(this, data); }
    static find = jest.fn().mockReturnValue(new MockQuery());
    static findById = jest.fn().mockReturnValue(new MockQuery());
    static findOne = jest.fn().mockReturnValue(new MockQuery());
    static findOneAndUpdate = jest.fn().mockReturnValue(new MockQuery());
    static deleteMany = jest.fn().mockReturnValue(new MockQuery());
    static bulkWrite = jest.fn().mockResolvedValue({ upsertedCount: 1 });
    static updateOne = jest.fn().mockReturnValue(new MockQuery());
  }

  beforeEach(async () => {
    const mockEmailService = {
      sendReminderEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getModelToken(Notification.name),
          useValue: MockModel,
        },
        {
          provide: getModelToken(ScheduledPost.name),
          useValue: MockModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: MockModel,
        },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    emailService = module.get(EmailService);
  });

  describe('upsertRemindersForScheduledPost', () => {
    it('should successfully build and upsert reminders', async () => {
      await service.upsertRemindersForScheduledPost(mockPost as any);
      expect(MockModel.bulkWrite).toHaveBeenCalled();
    });
  });

  describe('processDueReminders', () => {
    it('should process reminders and send email if needed', async () => {
      const mockReminder = {
        _id: new Types.ObjectId(),
        userId: mockUserId,
        postId: mockPostId,
        type: 'EMAIL',
        title: 'Test',
        message: 'Test Message',
        scheduledFor: new Date(),
        sentAt: null,
      };

      (MockModel.find as jest.Mock).mockReturnValue(new MockQuery([mockReminder]));
      (MockModel.findOneAndUpdate as jest.Mock).mockReturnValue(new MockQuery({ ...mockReminder, sentAt: new Date() }));
      (MockModel.findById as jest.Mock)
        .mockReturnValueOnce(new MockQuery(mockPost)) // for post lookup
        .mockReturnValueOnce(new MockQuery(mockUser)); // for user lookup

      const count = await service.processDueReminders();
      expect(count).toBe(1);
      expect(emailService.sendReminderEmail).toHaveBeenCalled();
    });
  });

  describe('getUserNotifications', () => {
    it('should return sent in-app notifications', async () => {
      (MockModel.find as jest.Mock).mockReturnValue(new MockQuery([]));
      const result = await service.getUserNotifications(mockUserId);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

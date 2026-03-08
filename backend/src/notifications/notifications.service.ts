import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ScheduledPost,
  ScheduledPostDocument,
  ScheduledPostStatus,
} from '../calendar/schemas/scheduled-post.schema';
import { User, UserDocument } from '../users/entities/user.entity';
import { EmailService } from './email/email.service';
import {
  Notification,
  NotificationDocument,
  NotificationReminderType,
  NotificationType,
} from './schemas/notification.schema';

type ReminderDefinition = {
  reminderType: NotificationReminderType;
  minutesBefore: number;
  relativeText: string;
  messagePrefix: string;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly maxReminderDelayMs = 60 * 1000;
  private readonly reminderDefinitions: ReminderDefinition[] = [
    {
      reminderType: NotificationReminderType.BEFORE_60_MIN,
      minutesBefore: 60,
      relativeText: 'dans 1 heure',
      messagePrefix: 'Votre',
    },
    {
      reminderType: NotificationReminderType.BEFORE_30_MIN,
      minutesBefore: 30,
      relativeText: 'dans 30 minutes',
      messagePrefix: 'Rappel : votre',
    },
    {
      reminderType: NotificationReminderType.BEFORE_10_MIN,
      minutesBefore: 10,
      relativeText: 'dans 10 minutes',
      messagePrefix: 'Attention : votre',
    },
  ];

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(ScheduledPost.name)
    private readonly scheduledPostModel: Model<ScheduledPostDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly emailService: EmailService,
  ) {}

  async upsertRemindersForScheduledPost(
    post: ScheduledPostDocument,
  ): Promise<void> {
    const now = new Date();

    await this.notificationModel
      .deleteMany({
        postId: post._id,
        sentAt: null,
      })
      .exec();

    if (
      post.status === ScheduledPostStatus.PUBLISHED ||
      post.scheduledAt.getTime() <= now.getTime()
    ) {
      return;
    }

    const reminders = this.buildReminderPayloads(post, now);
    if (!reminders.length) {
      return;
    }

    await this.notificationModel.bulkWrite(
      reminders.map((reminder) => ({
        updateOne: {
          filter: {
            userId: reminder.userId,
            postId: reminder.postId,
            type: reminder.type,
            reminderType: reminder.reminderType,
            scheduledFor: reminder.scheduledFor,
          },
          update: { $setOnInsert: reminder },
          upsert: true,
        },
      })),
      { ordered: false },
    );
  }

  async upsertRemindersForScheduledPosts(
    posts: ScheduledPostDocument[],
  ): Promise<void> {
    for (const post of posts) {
      await this.upsertRemindersForScheduledPost(post);
    }
  }

  async deleteRemindersForPost(postId: string | Types.ObjectId): Promise<void> {
    await this.notificationModel
      .deleteMany({ postId: this.toObjectId(postId, 'postId') })
      .exec();
  }

  async deleteRemindersForPosts(
    postIds: Array<string | Types.ObjectId>,
  ): Promise<void> {
    if (!postIds.length) {
      return;
    }

    const normalizedIds = postIds.map((postId) =>
      this.toObjectId(postId, 'postId'),
    );
    await this.notificationModel
      .deleteMany({
        postId: { $in: normalizedIds },
      })
      .exec();
  }

  async processDueReminders(limit = 250): Promise<number> {
    const now = new Date();
    const reminders = await this.notificationModel
      .find({
        sentAt: null,
        scheduledFor: { $lte: now },
      })
      .sort({ scheduledFor: 1, createdAt: 1 })
      .limit(limit)
      .exec();

    let processedCount = 0;

    for (const reminder of reminders) {
      const processed = await this.processOneReminder(reminder, now);
      if (processed) {
        processedCount += 1;
      }
    }

    if (processedCount > 0) {
      this.logger.log(`Processed ${processedCount} scheduled reminders`);
    }

    return processedCount;
  }

  async getUserNotifications(userId: string): Promise<NotificationDocument[]> {
    const userObjectId = this.toObjectId(userId, 'userId');
    return this.notificationModel
      .find({
        userId: userObjectId,
        type: NotificationType.IN_APP,
        sentAt: { $ne: null },
      })
      .sort({ sentAt: -1, createdAt: -1 })
      .exec();
  }

  async markNotificationAsRead(
    userId: string,
    notificationId: string,
  ): Promise<NotificationDocument> {
    const userObjectId = this.toObjectId(userId, 'userId');
    const notificationObjectId = this.toObjectId(notificationId, 'id');

    const notification = await this.notificationModel
      .findOneAndUpdate(
        {
          _id: notificationObjectId,
          userId: userObjectId,
          type: NotificationType.IN_APP,
          sentAt: { $ne: null },
        },
        { $set: { isRead: true } },
        { new: true },
      )
      .exec();

    if (!notification) {
      throw new NotFoundException('Notification introuvable');
    }

    return notification;
  }

  async markAllNotificationsAsRead(userId: string): Promise<number> {
    const userObjectId = this.toObjectId(userId, 'userId');
    const result = await this.notificationModel
      .updateMany(
        {
          userId: userObjectId,
          type: NotificationType.IN_APP,
          sentAt: { $ne: null },
          isRead: false,
        },
        { $set: { isRead: true } },
      )
      .exec();

    return result.modifiedCount;
  }

  private async processOneReminder(
    reminder: NotificationDocument,
    now: Date,
  ): Promise<boolean> {
    const claimedReminder = await this.notificationModel
      .findOneAndUpdate(
        {
          _id: reminder._id,
          sentAt: null,
          scheduledFor: { $lte: now },
        },
        { $set: { sentAt: now } },
        { new: true },
      )
      .exec();

    if (!claimedReminder) {
      return false;
    }

    if (
      now.getTime() - claimedReminder.scheduledFor.getTime() >
      this.maxReminderDelayMs
    ) {
      await this.notificationModel.deleteOne({ _id: claimedReminder._id }).exec();
      return false;
    }

    const post = await this.scheduledPostModel.findById(claimedReminder.postId).exec();
    if (
      !post ||
      post.status === ScheduledPostStatus.PUBLISHED ||
      post.scheduledAt.getTime() <= now.getTime()
    ) {
      await this.notificationModel.deleteOne({ _id: claimedReminder._id }).exec();
      return false;
    }

    if (claimedReminder.type === NotificationType.IN_APP) {
      return true;
    }

    const user = await this.userModel.findById(claimedReminder.userId).exec();
    if (!user?.email) {
      this.logger.warn(
        `Skipping EMAIL reminder ${claimedReminder._id.toString()} because user email is missing`,
      );
      return false;
    }

    try {
      await this.emailService.sendReminderEmail({
        to: user.email,
        subject: claimedReminder.title,
        text: claimedReminder.message,
      });

      await this.notificationModel
        .updateOne(
          { _id: claimedReminder._id },
          {
            $set: {
              isRead: true,
            },
          },
        )
        .exec();

      return true;
    } catch (error) {
      await this.notificationModel
        .updateOne(
          { _id: claimedReminder._id },
          {
            $set: { sentAt: null },
          },
        )
        .exec();

      this.logger.error(
        `Failed to send EMAIL reminder ${claimedReminder._id.toString()}`,
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }
  }

  private buildReminderPayloads(
    post: ScheduledPostDocument,
    now: Date,
  ): Array<Omit<Notification, 'createdAt' | 'updatedAt'>> {
    const payloads: Array<Omit<Notification, 'createdAt' | 'updatedAt'>> = [];

    for (const definition of this.reminderDefinitions) {
      const scheduledFor = new Date(
        post.scheduledAt.getTime() - definition.minutesBefore * 60 * 1000,
      );

      if (scheduledFor.getTime() <= now.getTime()) {
        continue;
      }

      const title = this.buildTitle(post, definition);
      const message = this.buildMessage(post, definition);

      payloads.push(
        {
          userId: post.userId,
          postId: post._id,
          type: NotificationType.IN_APP,
          reminderType: definition.reminderType,
          title,
          message,
          isRead: false,
          sentAt: null,
          scheduledFor,
        },
        {
          userId: post.userId,
          postId: post._id,
          type: NotificationType.EMAIL,
          reminderType: definition.reminderType,
          title,
          message,
          isRead: false,
          sentAt: null,
          scheduledFor,
        },
      );
    }

    return payloads;
  }

  private buildTitle(
    post: ScheduledPostDocument,
    definition: ReminderDefinition,
  ): string {
    const platformLabel = this.toTitleCase(post.platform);
    const typeLabel = this.toTitleCase(post.postType);
    return `Rappel ${platformLabel} ${typeLabel} ${definition.relativeText}`;
  }

  private buildMessage(
    post: ScheduledPostDocument,
    definition: ReminderDefinition,
  ): string {
    const platformLabel = this.toTitleCase(post.platform);
    const typeLabel = this.toTitleCase(post.postType);
    const scheduledAtLabel = this.formatInTimezone(post.scheduledAt, post.timezone);
    const preview = this.getPostPreview(post.title, post.caption);

    const baseMessage = `${definition.messagePrefix} ${typeLabel} ${platformLabel} est prevu ${definition.relativeText}.`;
    const details = ` Plateforme: ${platformLabel}. Type: ${typeLabel}. Heure prevue: ${scheduledAtLabel} (${post.timezone}).`;
    const previewText = preview ? ` Apercu: "${preview}".` : '';

    return `${baseMessage}${details}${previewText}`;
  }

  private getPostPreview(title?: string | null, caption?: string | null): string {
    const normalizedTitle = title?.trim();
    if (normalizedTitle) {
      return this.truncate(normalizedTitle, 120);
    }

    const normalizedCaption = caption?.trim();
    if (!normalizedCaption) {
      return '';
    }

    return this.truncate(normalizedCaption, 120);
  }

  private truncate(value: string, maxLength: number): string {
    if (value.length <= maxLength) {
      return value;
    }

    return `${value.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
  }

  private formatInTimezone(date: Date, timezone: string): string {
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(date);
    } catch {
      return new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(date);
    }
  }

  private toTitleCase(value: string): string {
    const normalized = value.trim().replace(/_/g, ' ');
    if (!normalized) {
      return value;
    }

    return normalized
      .split(/\s+/)
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(' ');
  }

  private toObjectId(
    value: string | Types.ObjectId,
    fieldName: string,
  ): Types.ObjectId {
    if (value instanceof Types.ObjectId) {
      return value;
    }

    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} invalide`);
    }

    return new Types.ObjectId(value);
  }
}

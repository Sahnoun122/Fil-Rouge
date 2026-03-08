import { Injectable, Logger } from '@nestjs/common';

export interface ReminderEmailPayload {
  to: string;
  subject: string;
  text: string;
}

export abstract class EmailService {
  abstract sendReminderEmail(payload: ReminderEmailPayload): Promise<void>;
}

@Injectable()
export class LoggerEmailService extends EmailService {
  private readonly logger = new Logger(LoggerEmailService.name);

  async sendReminderEmail(payload: ReminderEmailPayload): Promise<void> {
    this.logger.log(
      `Email reminder sent to ${payload.to} with subject "${payload.subject}"`,
    );
  }
}

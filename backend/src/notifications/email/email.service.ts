import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

export interface ReminderEmailPayload {
  to: string;
  subject: string;
  text: string;
}

export interface PasswordResetEmailPayload {
  to: string;
  resetUrl: string;
  fullName?: string;
  expiresInMinutes: number;
}

type GenericEmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export abstract class EmailService {
  abstract sendReminderEmail(payload: ReminderEmailPayload): Promise<void>;
  abstract sendPasswordResetEmail(
    payload: PasswordResetEmailPayload,
  ): Promise<void>;
}

@Injectable()
export class LoggerEmailService extends EmailService {
  private readonly logger = new Logger(LoggerEmailService.name);
  private transporter: Transporter | null | undefined;

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async sendReminderEmail(payload: ReminderEmailPayload): Promise<void> {
    await this.sendEmail({
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: `<p>${payload.text}</p>`,
    });
  }

  async sendPasswordResetEmail(
    payload: PasswordResetEmailPayload,
  ): Promise<void> {
    const recipientName = payload.fullName?.trim() || 'Bonjour';
    const text = [
      `${recipientName},`,
      '',
      'Vous avez demande la reinitialisation de votre mot de passe.',
      `Ce lien est valide pendant ${payload.expiresInMinutes} minutes :`,
      payload.resetUrl,
      '',
      "Si vous n'etes pas a l'origine de cette demande, ignorez simplement cet email.",
    ].join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <p>${recipientName},</p>
        <p>Vous avez demande la reinitialisation de votre mot de passe.</p>
        <p>Ce lien est valide pendant ${payload.expiresInMinutes} minutes.</p>
        <p>
          <a
            href="${payload.resetUrl}"
            style="display: inline-block; padding: 12px 20px; background: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600;"
          >
            Reinitialiser mon mot de passe
          </a>
        </p>
        <p style="word-break: break-all;">${payload.resetUrl}</p>
        <p>Si vous n'etes pas a l'origine de cette demande, ignorez simplement cet email.</p>
      </div>
    `;

    await this.sendEmail({
      to: payload.to,
      subject: 'Reinitialisation de votre mot de passe',
      text,
      html,
    });
  }

  private async sendEmail(payload: GenericEmailPayload): Promise<void> {
    const transporter = this.getTransporter();

    if (!transporter) {
      this.logger.warn(
        `SMTP non configure. Email non envoye a ${payload.to}. Sujet="${payload.subject}"`,
      );
      this.logger.debug(payload.text);
      return;
    }

    await transporter.sendMail({
      from: this.getFromAddress(),
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });
  }

  private getTransporter(): Transporter | null {
    if (this.transporter !== undefined) {
      return this.transporter;
    }

    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') || 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (!host || !port || !user || !pass) {
      this.transporter = null;
      return this.transporter;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    return this.transporter;
  }

  private getFromAddress(): string {
    const fromEmail =
      this.configService.get<string>('FROM_EMAIL') ||
      this.configService.get<string>('SMTP_USER') ||
      'no-reply@marketplan-ia.local';
    const fromName =
      this.configService.get<string>('FROM_NAME') || 'MarketPlan IA';

    return `"${fromName}" <${fromEmail}>`;
  }
}

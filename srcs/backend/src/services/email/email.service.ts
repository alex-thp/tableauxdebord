import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  attachmentFilename: string;
  attachmentBuffer: Buffer;
}

export interface SendMailResult {
  dryRun: boolean;
  to: string;
  subject: string;
  messageId?: string;
}

/**
 * Envoi d'emails avec pièce jointe.
 *
 * GARDE-FOU : tant que la variable d'environnement EMAIL_SENDING_ENABLED n'est pas
 * exactement "true", AUCUN email n'est réellement envoyé, quelle que soit la
 * configuration SMTP présente — sendMail() se contente de logger ce qui aurait été
 * envoyé (mode "dry-run"). C'est le seul interrupteur qui contrôle l'envoi réel ;
 * il vit uniquement dans .env côté serveur, jamais côté frontend.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  private isSendingEnabled(): boolean {
    return process.env.EMAIL_SENDING_ENABLED === 'true';
  }

  getMode(): 'dry-run' | 'live' {
    return this.isSendingEnabled() ? 'live' : 'dry-run';
  }

  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
          : undefined,
      });
    }
    return this.transporter;
  }

  async sendMail(input: SendMailInput): Promise<SendMailResult> {
    if (!this.isSendingEnabled()) {
      this.logger.warn(
        `[DRY-RUN] Email NON envoyé à ${input.to} — sujet: "${input.subject}", ` +
          `pièce jointe: ${input.attachmentFilename} (${input.attachmentBuffer.length} octets). ` +
          `Pour activer l'envoi réel : EMAIL_SENDING_ENABLED=true + SMTP_* dans .env.`,
      );
      return { dryRun: true, to: input.to, subject: input.subject };
    }

    const info = await this.getTransporter().sendMail({
      from: process.env.SMTP_FROM || process.env.EMAIL_ADMIN,
      to: input.to,
      subject: input.subject,
      html: input.html,
      attachments: [
        {
          filename: input.attachmentFilename,
          content: input.attachmentBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    this.logger.log(`Email envoyé à ${input.to} (messageId=${info.messageId})`);
    return { dryRun: false, to: input.to, subject: input.subject, messageId: info.messageId };
  }
}

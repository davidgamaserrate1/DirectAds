import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: false,
        auth: { user, pass },
      });
    } else {
      this.logger.warn(
        'SMTP não configurado. Emails serão simulados no console.',
      );
    }
  }

  async sendCampaignEmail(
    to: string,
    campaignName: string,
    content: string,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.log(
        `[MOCK EMAIL] Para: ${to} | Campanha: ${campaignName} | Conteúdo: ${content.substring(0, 100)}...`,
      );
      return;
    }

    const fromEmail = this.config.get<string>('SMTP_USER');

    await this.transporter.sendMail({
      from: `"AI Campaign Manager" <${fromEmail}>`,
      to,
      subject: `📢 ${campaignName}`,
      text: content,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">${campaignName}</h2>
        <div style="white-space: pre-wrap; line-height: 1.6;">${content}</div>
        <hr style="margin-top: 2rem; border-color: #e5e7eb;" />
        <p style="color: #9ca3af; font-size: 12px;">Enviado via AI Campaign Manager</p>
      </div>`,
    });

    this.logger.log(`Email enviado para ${to} - Campanha: ${campaignName}`);
  }
}

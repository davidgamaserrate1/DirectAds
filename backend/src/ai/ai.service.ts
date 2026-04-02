import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI | null = null;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn(
        'OPENAI_API_KEY não configurada. Usando fallback de conteúdo mock.',
      );
    }
  }

  async generateCampaignContent(
    objective: string,
    clientType: string,
  ): Promise<{ content: string }> {
    if (!this.openai) {
      return { content: this.getFallbackContent(objective, clientType) };
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Você é um especialista em marketing digital. Crie textos de campanha persuasivos, diretos e focados em conversão. Responda apenas com o texto da campanha, sem explicações adicionais.',
          },
          {
            role: 'user',
            content: `Crie um texto de campanha com base nas informações:\nObjetivo: ${objective}\nPúblico: ${clientType}\n\nO texto deve ser persuasivo, direto e focado em conversão.`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const content =
        response.choices[0]?.message?.content ||
        this.getFallbackContent(objective, clientType);

      return { content };
    } catch (error) {
      this.logger.error('Erro ao gerar conteúdo com IA', error);
      return { content: this.getFallbackContent(objective, clientType) };
    }
  }

  private getFallbackContent(objective: string, clientType: string): string {
    return `🚀 Campanha Especial para ${clientType}!\n\n${objective}\n\nNão perca essa oportunidade exclusiva! Entre em contato agora e descubra como podemos ajudar você a alcançar seus objetivos.\n\n✨ Oferta por tempo limitado!\n📩 Responda este email para saber mais.`;
  }
}

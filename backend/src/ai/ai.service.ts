import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private client: OpenAI | null = null;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    if (apiKey) {
      this.client = new OpenAI({
        apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      });
    } else {
      this.logger.warn(
        'GROQ_API_KEY não configurada. Usando fallback de conteúdo mock.',
      );
    }
  }

  async generateCampaignContent(
    objective: string,
    clientType: string,
  ): Promise<{ content: string }> {
    if (!this.client) {
      return { content: this.getFallbackContent(objective, clientType) };
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content:
              'Você é um especialista em marketing digital. Crie textos de campanha persuasivos, diretos e focados em conversão. REGRAS OBRIGATÓRIAS: responda SOMENTE com texto corrido. PROIBIDO usar markdown, asteriscos, hífens, bullet points, listas, colchetes, links fictícios ou cabeçalhos e limite de 255 caracteres. Use emojis para destacar e quebras de linha para separar parágrafos.',
          },
          {
            role: 'user',
            content: `Crie um texto de campanha com base nas informações:
                Objetivo: ${objective} 
                Público: ${clientType}
                O texto deve ser persuasivo, direto e focado em conversão.
            `,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const raw =
        response.choices[0]?.message?.content ||
        this.getFallbackContent(objective, clientType);

      const content = this.sanitizeContent(raw);

      return { content };
    } catch (error) {
      this.logger.error('Erro ao gerar conteúdo com IA', error);
      return { content: this.getFallbackContent(objective, clientType) };
    }
  }

  private sanitizeContent(text: string): string {
    return text
      .replace(/\*\*/g, '')
      .replace(/^#{1,6}\s/gm, '')
      .replace(/^[-*]\s/gm, '➜ ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\[([^\]]+)\]/g, '$1')
      .trim();
  }

  private getFallbackContent(objective: string, clientType: string): string {
    return `🚀 Campanha Especial para ${clientType}!\n\n${objective}\n\nNão perca essa oportunidade exclusiva! Entre em contato agora e descubra como podemos ajudar você a alcançar seus objetivos.\n\n✨ Oferta por tempo limitado!\n📩 Responda este email para saber mais.`;
  }
}

import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CampaignStatus } from '@prisma/client';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { EmailService } from '../email/email.service';
import { ClientsService } from '../clients/clients.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly emailService: EmailService,
    private readonly clientsService: ClientsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateCampaignDto) {
    const [clientsWithType] = await this.clientsService.findByType(dto.clientType);
    if (!clientsWithType) {
      throw new BadRequestException(
        `Nenhum cliente encontrado com o tipo "${dto.clientType}"`,
      );
    }
    return this.prisma.campaign.create({ data: dto });
  }

  async findAll() {
    return this.prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { logs: true } } },
    });
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        logs: {
          include: { client: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }
    return campaign;
  }

  async update(id: string, dto: UpdateCampaignDto) {
    await this.findOne(id);
    return this.prisma.campaign.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.campaign.delete({ where: { id } });
  }

  async generateContent(objective: string, clientType: string) {
    return this.aiService.generateCampaignContent(objective, clientType);
  }

  async send(id: string) {
    const campaign = await this.findOne(id);
    const clients = await this.clientsService.findByType(campaign.clientType);

    if (!clients.length) {
      throw new BadRequestException(
        `Nenhum cliente encontrado com o tipo "${campaign.clientType}"`,
      );
    }

    await this.prisma.campaign.update({
      where: { id },
      data: { status: CampaignStatus.SENT },
    });

    this.eventEmitter.emit('campaign.send', {
      campaign,
      clients,
    });

    return {
      campaignId: id,
      totalClients: clients.length,
      message: 'Campanha em envio. Os emails estão sendo processados em background.',
    };
  }

  @OnEvent('campaign.send')
  async handleCampaignSend(payload: {
    campaign: { id: string; name: string; content: string };
    clients: { id: string; email: string }[];
  }) {
    const { campaign, clients } = payload;
    this.logger.log(
      `Processando envio da campanha "${campaign.name}" para ${clients.length} clientes...`,
    );

    for (const client of clients) {
      try {
        await this.emailService.sendCampaignEmail(
          client.email,
          campaign.name,
          campaign.content,
        );
        await this.prisma.campaignLog.create({
          data: {
            campaignId: campaign.id,
            clientId: client.id,
            status: 'SENT',
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido';
        this.logger.error(`Erro ao enviar para ${client.email}: ${errorMessage}`);
        await this.prisma.campaignLog.create({
          data: {
            campaignId: campaign.id,
            clientId: client.id,
            status: 'ERROR',
            error: errorMessage,
          },
        });
      }
    }

    this.logger.log(`Envio da campanha "${campaign.name}" finalizado.`);
  }
}

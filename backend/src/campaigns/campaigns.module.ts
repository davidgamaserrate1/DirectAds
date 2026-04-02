import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { AiModule } from '../ai/ai.module';
import { EmailModule } from '../email/email.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [AiModule, EmailModule, ClientsModule],
  controllers: [CampaignsController],
  providers: [CampaignsService],
})
export class CampaignsModule {}

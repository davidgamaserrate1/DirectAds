import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { GenerateContentDto } from './dto/generate-content.dto';

@ApiTags('Campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova campanha' })
  create(@Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as campanhas' })
  findAll() {
    return this.campaignsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar campanha por ID' })
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar campanha' })
  update(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.campaignsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover campanha' })
  remove(@Param('id') id: string) {
    return this.campaignsService.remove(id);
  }

  @Post('generate-content')
  @ApiOperation({ summary: 'Gerar conteúdo de campanha com IA' })
  generateContent(@Body() dto: GenerateContentDto) {
    return this.campaignsService.generateContent(dto.objective, dto.clientType);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Enviar campanha para clientes segmentados' })
  send(@Param('id') id: string) {
    return this.campaignsService.send(id);
  }
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCampaignDto {
  @ApiPropertyOptional({ example: 'Campanha de Verão Atualizada' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'Novo objetivo' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  objective?: string;

  @ApiPropertyOptional({ example: 'emagrecimento' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  clientType?: string;

  @ApiPropertyOptional({ example: 'Novo conteúdo...' })
  @IsOptional()
  @IsString()
  content?: string;
}

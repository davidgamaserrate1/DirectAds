import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Campanha de Verão' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'Aumentar vendas de produtos fitness' })
  @IsString()
  @MinLength(5)
  objective: string;

  @ApiProperty({ example: 'fitness', description: 'Tipo de cliente alvo' })
  @IsString()
  @MinLength(2)
  clientType: string;

  @ApiProperty({
    example: 'Conteúdo da campanha...',
    required: false,
  })
  @IsString()
  content: string;
}

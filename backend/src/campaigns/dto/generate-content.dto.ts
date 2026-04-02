import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class GenerateContentDto {
  @ApiProperty({ example: 'Aumentar vendas de produtos fitness' })
  @IsString()
  @MinLength(5)
  objective: string;

  @ApiProperty({ example: 'fitness' })
  @IsString()
  @MinLength(2)
  clientType: string;
}

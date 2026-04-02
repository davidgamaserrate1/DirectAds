import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    const existing = await this.prisma.client.findFirst({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Já existe um cliente com este email');
    }

    return this.prisma.client.create({ data: dto });
  }

  async findAllTypes() {
    const usersTypes = await this.prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      distinct: ['type'],
      select: { type: true },
    });
    return usersTypes.map((client) => client.type);
  }

  async findAll(type?: string) {
    const where = type ? { type } : {};
    return this.prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return client;
  }

  async update(id: string, dto: UpdateClientDto) {
    const existing = await this.prisma.client.findFirst({
      where: { email: dto.email },
    });

    if (existing && existing.id !== id) {
      throw new ConflictException('Já existe um outro cliente com este email');
    }

    await this.findOne(id);
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.delete({ where: { id } });
  }

  async findByType(type: string) {
    return this.prisma.client.findMany({ where: { type } });
  }
}

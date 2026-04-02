import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('senha123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@campaign.ai' },
    update: {},
    create: {
      email: 'admin@campaign.ai',
      password: hashedPassword,
      name: 'Admin',
    },
  });

  console.log(`✅ User created: ${user.email}`);

  const clientsData = [
    { name: 'João Silva', email: 'joao@fitness.com', type: 'fitness' },
    { name: 'Maria Oliveira', email: 'maria@fitness.com', type: 'fitness' },
    { name: 'Carlos Lima', email: 'carlos@emagrecer.com', type: 'emagrecimento' },
    { name: 'Ana Santos', email: 'ana@emagrecer.com', type: 'emagrecimento' },
    { name: 'Pedro Souza', email: 'pedro@tech.com', type: 'tecnologia' },
    { name: 'Lucia Mendes', email: 'lucia@tech.com', type: 'tecnologia' },
    { name: 'Fernando Costa', email: 'fernando@saude.com', type: 'saude' },
    { name: 'Camila Rocha', email: 'camila@saude.com', type: 'saude' },
  ];

  for (const data of clientsData) {
    const client = await prisma.client.upsert({
      where: { email: data.email },
      update: {},
      create: data,
    });
    console.log(`✅ Client created: ${client.name} (${client.type})`);
  }

  const campaign = await prisma.campaign.create({
    data: {
      name: 'Campanha Fitness Verão 2026',
      objective: 'Aumentar engajamento e vendas de produtos fitness',
      clientType: 'fitness',
      content:
        '🏋️ Chegou o Verão! Transforme seu corpo com nossos produtos fitness exclusivos. Aproveite 30% de desconto em toda a linha!',
      status: 'DRAFT',
    },
  });

  console.log(`✅ Campaign created: ${campaign.name}`);
  console.log('🌱 Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

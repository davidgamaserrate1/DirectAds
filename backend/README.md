# Backend — AI Campaign Manager

API NestJS para gerenciamento de campanhas de marketing com geração de conteúdo via IA (Groq).

## Pré-requisitos

- Node.js >= 18
- Docker e Docker Compose
- (Opcional) Chave de API do [Groq](https://console.groq.com) para geração de conteúdo com IA

## Setup

### 1. Subir o banco de dados

Na raiz do projeto (`/teste`):

```bash
docker compose up -d
```

Isso sobe um PostgreSQL 16 na porta **5433**.

### 2. Instalar dependências

```bash
cd backend
npm install
```

### 3. Configurar variáveis de ambiente

Crie o arquivo `.env` na pasta `backend/`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/campaign_ai?schema=public"
JWT_SECRET="uma-chave-secreta-qualquer"
FRONTEND_URL="http://localhost:3000"
PORT=3001

# IA (opcional — sem ela, conteúdo mock é retornado)
GROQ_API_KEY="sua-chave-groq"

# E-mail (opcional — sem ele, envios são logados no console)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-app-password
```

### 4. Rodar migrations e seed

```bash
npx prisma migrate dev
npx prisma db seed
```

O seed cria:
- **Usuário admin:** `admin@campaign.ai` / `senha123`
- **8 clientes** de 4 tipos (fitness, emagrecimento, tecnologia, saúde)
- **1 campanha** de exemplo em rascunho

### 5. Iniciar o servidor

```bash
npm run start:dev
```

Servidor disponível em **http://localhost:3001**

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Registro de usuário |
| POST | `/auth/login` | Login (retorna JWT) |
| GET | `/auth/profile` | Perfil do usuário autenticado |
| GET | `/clients` | Listar clientes |
| GET | `/clients/types` | Listar tipos de clientes únicos |
| POST | `/clients` | Criar cliente |
| PATCH | `/clients/:id` | Atualizar cliente |
| DELETE | `/clients/:id` | Excluir cliente |
| GET | `/campaigns` | Listar campanhas |
| GET | `/campaigns/:id` | Detalhe da campanha (com logs) |
| POST | `/campaigns` | Criar campanha |
| PATCH | `/campaigns/:id` | Atualizar campanha |
| DELETE | `/campaigns/:id` | Excluir campanha |
| POST | `/campaigns/generate-content` | Gerar conteúdo com IA |
| POST | `/campaigns/:id/send` | Disparar campanha (async) |

Documentação Swagger: **http://localhost:3001/api/docs**

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Servidor em modo watch |
| `npm run build` | Build de produção |
| `npm run start:prod` | Rodar build |
| `npm run prisma:migrate` | Rodar migrations |
| `npm run prisma:seed` | Popular banco com dados iniciais |
| `npm run prisma:studio` | Abrir Prisma Studio (GUI do banco) |

# AI Campaign Manager

Aplicação full-stack para gerenciamento de campanhas de marketing com geração de conteúdo por inteligência artificial. Permite criar clientes segmentados por tipo, gerar conteúdo automaticamente via IA (Groq/LLaMA) e disparar campanhas por e-mail.

## Demo

- **Frontend:** https://front-end-production-2173.up.railway.app
- **Backend (Swagger):** https://back-end-production-ce2c.up.railway.app/api/docs

---

## Stack

| Camada         | Tecnologia                          |
| -------------- | ----------------------------------- |
| Frontend       | Next.js 16 (App Router, standalone) |
| Backend        | NestJS 11                           |
| Banco de Dados | PostgreSQL 16                       |
| ORM            | Prisma 5                            |
| Linguagem      | TypeScript                          |
| Containerização| Docker + Docker Compose             |

---

## Como rodar localmente

### Pré-requisitos

- Node.js 20+
- PostgreSQL 16 (ou Docker)
- npm

### Opção 1 — Com Docker (recomendado)

```bash
git clone https://github.com/davidgamaserrate1/DirectAds.git
cd DirectAds
```

Configure o arquivo de variáveis de ambiente do backend:

```bash
cp backend/.env.example backend/.env
# Edite backend/.env com suas credenciais (DATABASE_URL, JWT_SECRET, etc.)
```

> O `docker-compose.yml` já injeta as variáveis essenciais (DATABASE_URL, JWT_SECRET), mas para habilitar **geração de conteúdo com IA** e **envio de e-mails** é necessário preencher `GROQ_API_KEY` e as variáveis `SMTP_*` no `.env`.

```bash
docker compose up --build
```

Acesse:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001
- **Swagger:** http://localhost:3001/api/docs

O Docker Compose já cuida de:
- Subir o PostgreSQL
- Rodar as migrations (`prisma migrate deploy`)
- Popular o banco com dados de exemplo (seed)
- Iniciar o backend (NestJS) e o frontend (Next.js + nginx)

### Opção 2 — Manualmente

#### 1. PostgreSQL

Crie um banco chamado `campaign_ai` no PostgreSQL local.

#### 2. Backend

```bash
cd backend
cp .env.example .env   # ajuste DATABASE_URL e demais variáveis
npm install
npx prisma migrate dev
npm run prisma:seed
npm run start:dev
```

#### 3. Frontend

```bash
cd frontend
cp .env.example .env   # ajuste NEXT_PUBLIC_API_URL
npm install
npm run dev
```

---

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável       | Descrição                                    | Exemplo                                              |
| -------------- | -------------------------------------------- | ---------------------------------------------------- |
| `DATABASE_URL` | Connection string do PostgreSQL              | `postgresql://postgres:postgres@localhost:5433/campaign_ai` |
| `JWT_SECRET`   | Chave secreta para assinatura dos tokens JWT | `minha-chave-secreta`                                |
| `PORT`         | Porta do servidor                            | `3001`                                               |
| `FRONTEND_URL` | URL do frontend (CORS)                       | `http://localhost:3000`                              |
| `GROQ_API_KEY` | Chave da API Groq para geração de conteúdo   | `gsk_...` (opcional — usa fallback mock)             |
| `SMTP_HOST`    | Host SMTP para envio de e-mails              | `smtp.gmail.com` (opcional)                          |
| `SMTP_PORT`    | Porta SMTP                                   | `587` (opcional)                                     |
| `SMTP_USER`    | Usuário SMTP                                 | `email@gmail.com` (opcional)                         |
| `SMTP_PASS`    | Senha/app password SMTP                      | (opcional)                                           |

### Frontend (`frontend/.env`)

| Variável              | Descrição              | Exemplo                |
| --------------------- | ---------------------- | ---------------------- |
| `NEXT_PUBLIC_API_URL`  | URL base da API backend | `http://localhost:3001` |

---

## Decisões técnicas e arquiteturais

### Arquitetura geral

- **Monorepo simples** com `backend/` e `frontend/` na raiz, cada um com seu `Dockerfile` e `package.json`. Facilita o deploy em serviços separados no Railway mantendo um único repositório.
- **Backend desacoplado do frontend** — a API REST é totalmente independente, documentada via Swagger e consumida pelo frontend por HTTP (axios).

### Backend

- **NestJS com módulos por domínio** (`auth/`, `clients/`, `campaigns/`, `email/`, `ai/`, `prisma/`). Cada módulo encapsula controller, service e DTOs, seguindo o padrão do framework.
- **Prisma como ORM** — migrations versionadas, schema declarativo e type-safe. O client gerado garante tipagem forte em todas as queries.
- **JWT com Passport** — autenticação stateless com guard reutilizável (`JwtAuthGuard`). O token é validado em todas as rotas protegidas.
- **ValidationPipe global** com `class-validator` — DTOs validados automaticamente em todas as rotas. Propriedades não declaradas são rejeitadas (`forbidNonWhitelisted`).
- **Geração de conteúdo via Groq (LLaMA)** — o serviço de IA usa a SDK da OpenAI apontando para o endpoint da Groq. Se a chave não estiver configurada, um fallback mock é utilizado.
- **Envio de e-mails via Nodemailer** — suporta SMTP configurável. Sem configuração, os e-mails são simulados no console.

### Frontend

- **Next.js 16 com App Router** — layouts aninhados, rotas protegidas via middleware, e `output: 'standalone'` para build otimizado em produção.
- **Tailwind CSS 4** — estilização utility-first sem configuração extra. Responsivo com classes `md:` e `lg:`.
- **react-hook-form + Zod** — validação de formulários no client com schemas Zod reutilizáveis. Erros exibidos inline nos campos.
- **axios com interceptors** — instância centralizada que injeta o token JWT e redireciona para login em caso de 401.
- **Contexts para autenticação** — `AuthContext` gerencia o estado do usuário logado, token e funções de login/logout/register.

### Containerização

- **Multi-stage Dockerfiles** para ambos os serviços (deps → build → runner), reduzindo o tamanho final das imagens.
- **nginx no frontend** — serve os assets estáticos do Next.js com cache immutable de 365 dias e faz proxy reverso para o standalone server.
- **Docker Compose** para desenvolvimento local com PostgreSQL, backend e frontend orquestrados juntos.

### Deploy

- **Railway** com 3 serviços: PostgreSQL (provisionado pelo Railway), Backend e Frontend, ambos apontando para o mesmo repositório com `Root Directory` configurado.

---

## Estrutura do projeto

```
DirectAds/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Schema do banco (User, Client, Campaign, CampaignLog)
│   │   ├── seed.ts                # Dados iniciais (admin + clientes + campanha)
│   │   └── migrations/            # Migrations versionadas
│   ├── src/
│   │   ├── main.ts                # Bootstrap: CORS, ValidationPipe, Swagger
│   │   ├── app.module.ts          # Módulo raiz
│   │   ├── auth/                  # Registro, login, JWT strategy e guard
│   │   ├── clients/               # CRUD de clientes (nome, email, tipo)
│   │   ├── campaigns/             # CRUD de campanhas + envio + geração IA
│   │   ├── ai/                    # Integração com Groq (LLaMA) via SDK OpenAI
│   │   ├── email/                 # Envio de e-mails via Nodemailer
│   │   └── prisma/                # PrismaService global
│   ├── Dockerfile
│   └── railway.toml
├── frontend/
│   ├── src/
│   │   ├── app/                   # Páginas (App Router)
│   │   │   ├── login/             # Tela de login
│   │   │   ├── register/          # Tela de registro
│   │   │   └── (dashboard)/       # Layout autenticado
│   │   │       ├── dashboard/     # Página principal
│   │   │       ├── clients/       # Listagem + modal de CRUD
│   │   │       └── campaigns/     # Listagem, criação e edição
│   │   ├── components/            # UI reutilizável (button, input, modal, sidebar)
│   │   ├── contexts/              # AuthContext
│   │   ├── hooks/                 # Custom hooks (useCampaigns, useClients, etc.)
│   │   ├── lib/                   # axios instance, Zod validators
│   │   ├── services/              # Camada de serviço (API calls)
│   │   └── types/                 # Tipos TypeScript compartilhados
│   ├── Dockerfile
│   ├── nginx.conf
│   └── railway.toml
└── docker-compose.yml
```

---

## Modelos do banco de dados

| Modelo        | Descrição                                                      |
| ------------- | -------------------------------------------------------------- |
| `User`        | Usuário do sistema (email, senha hash, nome)                   |
| `Client`      | Cliente/destinatário das campanhas (nome, email, tipo/segmento)|
| `Campaign`    | Campanha de marketing (nome, objetivo, tipo de cliente alvo, conteúdo gerado, status DRAFT/SENT) |
| `CampaignLog` | Registro de envio por cliente (status SENT/ERROR, mensagem de erro) |

---

## Seed

Ao rodar o seed (`npm run prisma:seed` ou via Docker), o banco é populado com:

- **1 usuário admin:** `admin@campaign.ai` / `senha123`
- **8 clientes** de 4 segmentos: fitness, emagrecimento, tecnologia e saúde
- **1 campanha** de exemplo em status DRAFT

---

## IA e envio de e-mails

Duas funcionalidades dependem de serviços externos e só funcionam plenamente quando as variáveis de ambiente estão configuradas:

| Funcionalidade              | Variável necessária        | Comportamento sem a variável                        |
| --------------------------- | -------------------------- | --------------------------------------------------- |
| Geração de conteúdo com IA  | `GROQ_API_KEY`             | Retorna um conteúdo mock/placeholder                |
| Envio de e-mails            | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | E-mails são simulados no console (log)  |

No **deploy em produção** (Railway), essas variáveis estão configuradas e ambas as funcionalidades ficam ativas. Rodando **localmente sem as chaves**, o restante da aplicação funciona normalmente — apenas a geração de IA e o disparo real de e-mails ficam desabilitados.

---

## Funcionalidades

- **Autenticação** — registro e login com JWT, rotas protegidas por middleware (frontend) e guard (backend)
- **CRUD de Clientes** — criação, listagem, edição e exclusão com modal e validação Zod
- **CRUD de Campanhas** — criação com seleção de segmento, edição (DRAFT), visualização (SENT)
- **Geração de conteúdo com IA** — clique em "Gerar com IA" para criar o texto da campanha automaticamente via Groq/LLaMA
- **Envio de campanhas** — dispara e-mails para todos os clientes do segmento selecionado, registrando logs de envio
- **Interface responsiva** — sidebar colapsável em mobile, layout adaptativo em todas as telas
- **Estados visuais** — loading spinners, mensagens de erro do backend, estados vazios, badges de status

---

## Dependências e justificativas

### Backend

| Pacote                          | Justificativa                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| `@nestjs/common`, `core`, `platform-express` | Framework base do NestJS — estrutura modular, DI, controllers, pipes                   |
| `@nestjs/config`                | Leitura de variáveis de ambiente com tipagem e validação                                        |
| `@nestjs/jwt`                   | Geração e verificação de tokens JWT para autenticação                                           |
| `@nestjs/passport`              | Integração do Passport.js com NestJS para estratégias de auth                                   |
| `@nestjs/swagger`               | Geração automática da documentação Swagger a partir dos decoradores                             |
| `@nestjs/event-emitter`         | Event emitter nativo do NestJS para desacoplamento de efeitos colaterais (ex: após envio)       |
| `@prisma/client`                | Client do Prisma — queries type-safe geradas a partir do schema                                 |
| `bcrypt`                        | Hash de senhas com salt — padrão da indústria para armazenamento seguro                         |
| `class-transformer`             | Transformação de objetos para DTOs — necessário para o ValidationPipe do NestJS                 |
| `class-validator`               | Decoradores de validação para DTOs — integra com o ValidationPipe global                        |
| `nodemailer`                    | Envio de e-mails via SMTP — biblioteca consolidada e sem dependências pesadas                   |
| `openai`                        | SDK oficial da OpenAI — usada para chamar a API da Groq (compatível) para geração de conteúdo  |
| `passport`, `passport-jwt`      | Estratégia JWT para autenticação — extraí e valida o token do header Authorization              |
| `reflect-metadata`              | Necessário para decoradores do TypeScript (base do NestJS)                                      |
| `rxjs`                          | Dependência core do NestJS para programação reativa                                             |
| `prisma` (dev)                  | CLI do Prisma para migrations, generate e studio                                                |
| `ts-node` (dev)                 | Execução direta de TypeScript — usado para rodar o seed                                         |
| `typescript` (dev)              | Compilador TypeScript                                                                           |

### Frontend

| Pacote                  | Justificativa                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| `next`                  | Framework React com App Router, SSR, routing e otimizações de build                        |
| `react`, `react-dom`    | Biblioteca base para UI declarativa                                                        |
| `axios`                 | Cliente HTTP com interceptors — permite injetar token JWT e tratar erros centralizadamente  |
| `react-hook-form`       | Gerenciamento de formulários performático — evita re-renders desnecessários                 |
| `@hookform/resolvers`   | Integração do react-hook-form com Zod para validação via schema                            |
| `zod`                   | Validação de dados com inferência de tipos — schemas reutilizáveis entre client e server   |
| `lucide-react`          | Biblioteca de ícones SVG otimizados — tree-shakeable, sem peso desnecessário               |
| `tailwindcss` (dev)     | Framework CSS utility-first — estilização rápida e consistente sem CSS customizado         |
| `@tailwindcss/postcss` (dev) | Plugin PostCSS para processar as classes do Tailwind no build                          |
| `typescript` (dev)      | Compilador TypeScript                                                                      |

---

## API (Swagger)

A documentação completa da API está disponível em `/api/docs` (Swagger UI).

### Principais endpoints

| Método | Rota                         | Descrição                            | Auth |
| ------ | ---------------------------- | ------------------------------------ | ---- |
| POST   | `/auth/register`             | Registrar novo usuário               | Não  |
| POST   | `/auth/login`                | Login (retorna JWT)                  | Não  |
| GET    | `/auth/profile`              | Dados do usuário logado              | Sim  |
| GET    | `/clients`                   | Listar clientes                      | Sim  |
| POST   | `/clients`                   | Criar cliente                        | Sim  |
| PUT    | `/clients/:id`               | Atualizar cliente                    | Sim  |
| DELETE | `/clients/:id`               | Remover cliente                      | Sim  |
| GET    | `/clients/types`             | Listar tipos/segmentos de clientes   | Sim  |
| GET    | `/campaigns`                 | Listar campanhas                     | Sim  |
| POST   | `/campaigns`                 | Criar campanha                       | Sim  |
| GET    | `/campaigns/:id`             | Detalhes da campanha                 | Sim  |
| PUT    | `/campaigns/:id`             | Atualizar campanha                   | Sim  |
| DELETE | `/campaigns/:id`             | Remover campanha                     | Sim  |
| POST   | `/campaigns/generate-content`| Gerar conteúdo com IA                | Sim  |
| POST   | `/campaigns/:id/send`        | Enviar campanha por e-mail           | Sim  |

---

## Credenciais do seed

| Campo | Valor              |
| ----- | ------------------ |
| Email | `admin@campaign.ai`|
| Senha | `senha123`         |

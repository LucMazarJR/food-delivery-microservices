# Guia de Desenvolvimento em Grupo

> Como o time vai trabalhar junto | Git + NestJS + Docker + Organização

---

## Estrutura do projeto — polyrepo em um único repositório

Cada serviço é uma **aplicação NestJS completamente independente**: tem seu próprio `package.json`, seu próprio `node_modules`, seu próprio `tsconfig.json`. Elas vivem em pastas separadas dentro do mesmo repositório GitHub.

```
ava-bim-2/
│
├── .gitignore              ← ignora node_modules/ e .env em qualquer subpasta
├── .env.example
├── docker-compose.yml      ← orquestra todos os containers
├── readme.md
│
├── api_gateway/            ← NestJS app independente
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   └── ...
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── Dockerfile
│
├── auth_service/           ← NestJS app independente
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── Dockerfile
│
├── user-service/           ← NestJS app independente (configurado)
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── .env.example
│   └── Dockerfile
│
├── monitoring/
│   └── prometheus.yml
│
└── Docs/
```

O `docker-compose.yml` e os arquivos da raiz são compartilhados pelo time inteiro. Cada pasta de serviço pertence a uma pessoa.

---

## Checklist geral do projeto

### Planejamento
- [ ] Escolher o tema e definir os domínios de cada serviço
- [ ] Mapear os endpoints de cada serviço
- [ ] Definir as portas de cada serviço (para não conflitar)
- [ ] Dividir responsabilidades entre o time

### Infraestrutura e base
- [ ] Criar repositório no GitHub com todos como colaboradores
- [ ] Definir estrutura de pastas e criar branches por serviço
- [ ] Criar `.env.example` com todas as variáveis necessárias
- [ ] `docker-compose.yml` com banco de dados rodando
- [ ] `Dockerfile` funcionando para cada serviço
- [ ] `docker-compose up` sobe tudo sem erro

### Auth Service
- [ ] Registro de usuário
- [ ] Login com geração de JWT
- [ ] Endpoint `/metrics` exposto

### API Gateway
- [ ] Guard de JWT (retorna 401 se token inválido ou ausente)
- [ ] Roteamento para todos os serviços via `HttpService`
- [ ] Headers internos repassados (`x-user-id`, `x-user-role`)
- [ ] Documentação Swagger em `/api-docs` cobrindo todos os endpoints
- [ ] Endpoint `/metrics` exposto

### Serviços de negócio
- [ ] Cada serviço com seu CRUD implementado
- [ ] `RolesGuard` protegendo rotas que exigem permissão (403 para não autorizados)
- [ ] Regras de negócio do domínio funcionando
- [ ] Comunicação HTTP entre serviços onde necessário
- [ ] Endpoint `/metrics` exposto em cada um

### Observabilidade
- [ ] Prometheus coletando métricas de todos os serviços
- [ ] Dashboard no Grafana com requisições/s, latência e erros
- [ ] Script de teste de carga (k6) cobrindo o fluxo principal

### Deploy
- [ ] `docker-compose up` sobe tudo a partir de um clone limpo do repositório
- [ ] `.env.example` preenchido o suficiente para qualquer pessoa rodar o projeto
- [ ] (opcional) serviços publicados em nuvem (Render, Railway, etc.)

### Apresentação
- [ ] Fluxo completo funcionando via Gateway
- [ ] Swagger acessível mostrando todos os endpoints documentados
- [ ] k6 rodando ao vivo com métricas aparecendo no Grafana

---

## Organização do repositório Git

### Serviços e branches

| Serviço | Pasta | Branch | Porta externa |
|---|---|---|---|
| API Gateway | `api_gateway/` | `gateway` | 3000 |
| Autenticação | `auth_service/` | `auth` | — |
| Usuários | `user-service/` | `user` | 3001 |

```
main
├── user        ← user-service (usuários e perfis)
├── auth        ← auth_service (autenticação e JWT)
├── gateway     ← api_gateway (entrada, roteamento, Swagger)
└── menu        ← [serviço de negócio adicional]
```

Regra simples: **cada pessoa trabalha na sua branch**. O `docker-compose.yml` e arquivos da raiz ficam na `main` e são atualizados via Pull Request conforme cada serviço é integrado.

```bash
# Clonar o repositório
git clone https://github.com/usuario/ava-bim-2.git
cd ava-bim-2

# Criar sua branch (nome do serviço, sem prefixo)
git checkout -b user

# Publicar a branch no GitHub pela primeira vez
git push -u origin user

# Nas próximas vezes, só:
git push

# Ver todas as branches (locais e remotas)
git branch -a

# Trocar de branch
git checkout main
git checkout user
```

### Convenção de mensagens de commit

Os commits usam **conventional commits escopados** — o escopo identifica o serviço:

```
tipo(escopo): descrição curta
```

| Prefixo | Quando usar |
|---------|-------------|
| `feat(user):` | nova funcionalidade no user-service |
| `feat(auth):` | nova funcionalidade no auth_service |
| `feat(gateway):` | nova funcionalidade no api_gateway |
| `fix(user):` | correção de bug |
| `chore(user):` | configuração, dependências |
| `docs:` | documentação (sem escopo de serviço) |
| `refactor(auth):` | refatoração sem mudar comportamento |

Exemplos reais do projeto:

```bash
git commit -m "feat(user): add docker file and init docker compose"
git commit -m "chore(user): initial service configuration"
git commit -m "chore(gateway): init api_gateway service"
git commit -m "docs: update documentation for nest.js"
```

---

## Como rodar o projeto

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose
- Node.js 22+ (para desenvolvimento local fora do Docker)

### Do zero

```bash
git clone <url-do-repo>
cd ava-bim-2

# Copiar e preencher o .env de cada serviço
cp user-service/.env.example user-service/.env
# ... repetir para cada serviço configurado

# Subir tudo
docker-compose up -d
```

### Verificar endpoints

```
http://localhost:3000   → api_gateway
http://localhost:3001   → user-service
```

---

## Primeiros passos — criando seu serviço

### 1. Criar o projeto NestJS

Na raiz do repositório, na sua branch:

```bash
# Instalar o CLI do NestJS (uma vez só, global)
npm install -g @nestjs/cli

# Criar o projeto NestJS na pasta do seu serviço
nest new nome-do-servico --skip-git

# O CLI vai criar a pasta com tudo configurado:
# src/app.module.ts, src/main.ts, package.json, tsconfig.json, etc.
```

A flag `--skip-git` é importante — evita que o NestJS crie um repositório Git separado dentro da pasta do serviço.

### 2. Rodar localmente

```bash
cd nome-do-servico
npm run start:dev   # modo watch, reinicia ao salvar
```

---

## Fluxo de trabalho diário

### Começando — sincronizar com o que o time fez

```bash
git checkout main
git pull origin main

git checkout user   # sua branch
git merge main
```

Faça isso antes de começar a trabalhar. Evita conflitos grandes no final.

### Salvando o progresso — commit frequente

```bash
git status

# Adicionar arquivos específicos (nunca git add -A cegamente)
git add user-service/src/users/users.service.ts
git add user-service/src/users/users.controller.ts

git commit -m "feat(user): implementar CRUD de usuários"

git push origin user
```

### Abrindo Pull Request — quando o serviço estiver pronto

1. Acesse o repositório no GitHub
2. Clique em **"Compare & pull request"** na sua branch
3. Título direto: `feat(user): user-service completo`
4. Descrição: o que foi implementado e como testar
5. Peça para alguém do time revisar antes de fazer merge na `main`

---

## Criando os containers Docker

### Dockerfile

Cada serviço tem seu próprio `Dockerfile` dentro da sua pasta. O estágio `development` usa hot reload — o código fonte é montado via volume no compose, então alterações refletem sem rebuild.

```dockerfile
# TODO: adicionar estágio production (npm run build → node dist/main)
FROM node:22-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]
```

### docker-compose.yml — padrão por serviço

Cada serviço segue o mesmo padrão: uma entrada para a aplicação (`<nome>-app`) e uma para o banco (`<nome>-db`). O volume duplo no serviço app garante o hot reload sem perder o `node_modules` do container.

```yaml
services:

  # --- nome-do-servico ---
  nome-app:
    build:
      context: ./nome-do-servico     # pasta do serviço
      target: development
    env_file:
      - ./nome-do-servico/.env
    ports:
      - "300X:3000"                  # porta externa:interna (3000 é o padrão NestJS)
    volumes:
      - ./nome-do-servico:/usr/src/app   # monta o código → hot reload
      - /usr/src/app/node_modules        # preserva o node_modules do container
    depends_on:
      - nome-db

  nome-db:
    image: mongo
    env_file:
      - ./nome-do-servico/.env
    volumes:
      - nome-data:/data/db

volumes:
  nome-data:
```

Para adicionar um novo serviço, copie o bloco acima, troque `nome` e ajuste a porta externa.

### .env.example de cada serviço

Cada serviço tem seu próprio `.env.example` dentro da sua pasta:

```
# Credenciais MongoDB
MONGO_INITDB_ROOT_USERNAME=
MONGO_INITDB_ROOT_PASSWORD=
MONGODB_URI=mongodb://usuario:senha@nome-db:27017/nomedb?authSource=admin

# Porta interna do NestJS
PORT=3000
```

Nunca commite o `.env` — ele já está no `.gitignore`. Cada membro cria o seu localmente com base no `.env.example`.

---

## Comandos Docker essenciais

```bash
# Subir todos os containers em background
docker-compose up -d

# Subir e rebuildar imagens após mudança de código
docker-compose up -d --build

# Ver os logs de um serviço específico
docker-compose logs -f users-app

# Parar tudo
docker-compose down

# Parar e apagar os volumes (reseta o banco)
docker-compose down -v

# Rebuild de um serviço específico
docker-compose up -d --build users-app

# Ver status dos containers
docker-compose ps
```

---

## Testando seu serviço isolado

Durante o desenvolvimento, você não precisa subir todos os containers. Suba só o banco e seu serviço:

```bash
# Sobe só o banco e o serviço em desenvolvimento
docker-compose up -d users-db users-app

# Ou rode localmente sem Docker (mais rápido no dia a dia):
cd user-service
npm run start:dev
```

O NestJS em modo `start:dev` usa hot reload — reinicia automaticamente ao salvar arquivos.

Para conectar localmente sem Docker, configure `MONGODB_URI=mongodb://localhost:27017/users` no `.env` do serviço e suba só o MongoDB via Docker.

Quando estiver funcionando isolado, avise o time para integrar no compose completo.

---

## Comunicação interna entre serviços

O módulo `HttpModule` do NestJS (`@nestjs/axios`) é a forma recomendada para chamar outros serviços internamente.

```typescript
// No module:
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
})

// No service:
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

constructor(private readonly httpService: HttpService) {}

async buscarRecurso(id: string) {
  const { data } = await firstValueFrom(
    this.httpService.get(`${process.env.USER_SERVICE_URL}/users/${id}`)
  );
  return data;
}
```

Dentro do Docker, a URL é o **nome do serviço no docker-compose**: `http://users-app:3000`. No desenvolvimento local, é `http://localhost:3001`.

---

## Dicas para evitar conflitos

- **Não mexa em arquivos de outros serviços.** Se precisar, converse antes
- **O `docker-compose.yml` é compartilhado** — alinhem antes de fazer merge de mudanças nele
- **Antes de abrir PR**, rode `docker-compose up --build` localmente e confirme que tudo sobe
- **Variável de ambiente nova**: adicione ao `.env.example` do serviço antes de fazer merge
- **Nunca commite `node_modules/`** — o `.gitignore` já cobre, mas confirme antes do primeiro push de cada serviço
- **Nunca commite `.env`** — use `.env.example` como referência para o time

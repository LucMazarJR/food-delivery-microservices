# Food Delivery — Microsserviços

Plataforma de delivery de comida construída do zero para aprender arquitetura de microsserviços na prática: como separar domínios, fazer serviços conversarem, proteger rotas com JWT e monitorar tudo rodando.

> **✅ Projeto finalizado.** Trabalho de faculdade (Web I) concluído com os 9 microsserviços implementados, API Gateway com autenticação JWT, observabilidade via Prometheus/Grafana e teste de carga com k6. Autorização por papel (`RolesGuard`) foi desenhada mas não entrou no escopo entregue — ver [Docs/conceitos-microsservicos.md](Docs/conceitos-microsservicos.md#8-autorização--controlando-o-que-cada-usuário-pode-fazer-não-implementado).

---

## O que estamos aprendendo

O projeto existe para colocar a mão na massa em tecnologias que aparecem em qualquer stack backend moderno:

- **NestJS** — como estruturar uma API com módulos, controllers, services e injeção de dependência
- **Docker** — como containerizar serviços e fazê-los conversar numa rede interna sem expor tudo para fora
- **JWT** — como autenticação stateless funciona de verdade: assinar tokens, validar, carregar dados do usuário sem bater no banco a cada requisição
- **API Gateway** — por que existe um ponto de entrada único, Guards globais e o decorator `@Public()` para rotas abertas
- **MongoDB** — banco orientado a documentos, um por serviço para manter o isolamento
- **class-validator** — como DTOs validam entrada de dados automaticamente via `ValidationPipe` global
- **Prometheus + Grafana** — como coletar e visualizar métricas de múltiplos serviços em tempo real
- **k6** — como simular carga e ver o sistema se comportar sob pressão

---

## O projeto

Uma plataforma de delivery completa com 9 serviços separados por domínio:

```
  Cliente/Postman ──────► gateway-app :3000
                                │
                                ├──► auth-app        :3002  (login / JWT)
                                ├──► users-app       :3001  (usuários)
                                ├──► orders-app      :3003  (pedidos)
                                ├──► delivery-app    :3004  (entregas)
                                ├──► restaurant-app  :3005  (restaurantes)
                                ├──► tracking-app    :3006  (rastreamento)
                                ├──► payment-app     :3007  (pagamentos)
                                └──► menu-app        :3008  (cardápios)

  users-db / orders-db / delivery-db / restaurant-db
  tracking-db / payment-db / menu-db  (MongoDB — um por serviço)

  prometheus  :9090
  grafana     :3009
```

Tudo orquestrado via Docker Compose. O cliente só conhece o Gateway — nunca acessa os serviços diretamente.

---

## Serviços

| Serviço | Pasta | Porta externa | Status |
|---|---|---|---|
| API Gateway | `api-gateway/` | 3000 | ✅ Implementado |
| User Service | `user-service/` | 3001 | ✅ Implementado |
| Auth Service | `auth-service/` | 3002 | ✅ Implementado |
| Orders Service | `orders-service/` | 3003 | ✅ Implementado |
| Delivery Service | `delivery-service/` | 3004 | ✅ Implementado |
| Restaurant Service | `restaurant-service/` | 3005 | ✅ Implementado |
| Tracking Service | `tracking-service/` | 3006 | ✅ Implementado |
| Payment Service | `payment-service/` | 3007 | ✅ Implementado |
| Menu Service | `menu-service/` | 3008 | ✅ Implementado |

### API Gateway
Ponto de entrada único. Guard JWT global protege todas as rotas — use `@Public()` para abrir exceções. Roteia para todos os serviços via `HttpService`. Swagger centralizado em `localhost:3000/api`.

### Auth Service
Recebe e-mail e senha, busca o usuário no user-service via HTTP interno, valida a senha e devolve um JWT assinado. Único serviço que conhece o `JWT_SECRET`. Swagger em `localhost:3002/api`.

### User Service
Gerencia usuários da plataforma. CRUD completo com MongoDB, senhas hasheadas com bcrypt. Expõe busca por e-mail (rota interna usada pelo auth-service). Swagger em `localhost:3001/api`.

### Orders Service
Gerencia pedidos da plataforma. CRUD completo com MongoDB e rota de prioridade de entrega. Swagger em `localhost:3003/api`.

### Delivery Service
Gerencia entregas com controle de status. CRUD completo com MongoDB. Swagger em `localhost:3004/api`.

### Restaurant Service
Gerencia restaurantes com filtro por dono. CRUD completo com MongoDB. Swagger em `localhost:3005/api`.

### Tracking Service
Rastreamento em tempo real das entregas com suporte a WebSocket. MongoDB para persistência. Swagger em `localhost:3006/api`.

### Payment Service
Processamento e gerenciamento de pagamentos. CRUD completo com MongoDB. Swagger em `localhost:3007/api`.

### Menu Service
Gerencia cardápios e itens dos restaurantes. Dono pode editar o próprio cardápio; clientes só consultam. Swagger em `localhost:3008/api`.

---

## Como rodar

Só precisa ter Docker instalado.

```bash
git clone https://github.com/LucMazarJR/ava-bim-2.git
cd ava-bim-2

# Cada serviço tem seu próprio .env
cp api-gateway/.env.example     api-gateway/.env
cp auth-service/.env.example    auth-service/.env
cp user-service/.env.example    user-service/.env
cp orders-service/.env.example  orders-service/.env
cp delivery-service/.env.example delivery-service/.env
cp restaurant-service/.env.example restaurant-service/.env
cp tracking-service/.env.example  tracking-service/.env
cp payment-service/.env.example   payment-service/.env
cp menu-service/.env.example    menu-service/.env
cp .env.example .env

# Subir todos os serviços
docker-compose up -d
```

```bash
# Ver status dos containers
docker-compose ps

# Logs de um serviço
docker-compose logs -f auth-app

# Rebuild após mudar Dockerfile
docker-compose up -d --build

# Derrubar tudo (preserva os bancos)
docker-compose down

# Derrubar e resetar os bancos
docker-compose down -v
```

### Teste de carga com k6

```bash
# Rodar o script de carga (envia métricas para o Prometheus)
docker-compose --profile load-test run k6
```

---

## Endpoints

### Swagger por serviço

| Serviço | URL do Swagger |
|---|---|
| API Gateway | http://localhost:3000/api |
| User Service | http://localhost:3001/api |
| Auth Service | http://localhost:3002/api |
| Orders Service | http://localhost:3003/api |
| Delivery Service | http://localhost:3004/api |
| Restaurant Service | http://localhost:3005/api |
| Tracking Service | http://localhost:3006/api |
| Payment Service | http://localhost:3007/api |
| Menu Service | http://localhost:3008/api |

### Monitoramento

| Ferramenta | URL | Credenciais |
|---|---|---|
| Prometheus | http://localhost:9090 | — |
| Grafana | http://localhost:3009 | admin / admin |

---

## Documentação

- [Conceitos de microsserviços](Docs/conceitos-microsservicos.md) — teoria por trás das decisões de arquitetura, com os padrões reais usados no projeto
- [Guia de desenvolvimento](Docs/guia-desenvolvimento.md) — Git, Docker, padrões estabelecidos e organização do time

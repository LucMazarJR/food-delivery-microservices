# Food Delivery — Microsserviços

Plataforma de delivery de comida sendo construída do zero para aprender arquitetura de microsserviços na prática: como separar domínios, fazer serviços conversarem, proteger rotas com JWT e monitorar tudo rodando.

> **Em desenvolvimento.** User service e auth service implementados. API Gateway, menu service e observabilidade em andamento.

---

## O que estamos aprendendo

O projeto existe para colocar a mão na massa em tecnologias que aparecem em qualquer stack backend moderno:

- **NestJS** — como estruturar uma API com módulos, controllers, services e injeção de dependência
- **Docker** — como containerizar serviços e fazê-los conversar numa rede interna sem expor tudo para fora
- **JWT** — como autenticação stateless funciona de verdade: assinar tokens, validar, carregar dados do usuário sem bater no banco a cada requisição
- **API Gateway** — por que existe um ponto de entrada único e o que ele faz antes de repassar a requisição
- **MongoDB** — banco orientado a documentos, um por serviço para manter o isolamento
- **Prometheus + Grafana** — como coletar e visualizar métricas de múltiplos serviços em tempo real
- **k6** — como simular carga e ver o sistema se comportar sob pressão

---

## O projeto

Uma plataforma de delivery simples com serviços separados por domínio:

```
  Cliente/Postman ──────► api_gateway :3000
                                │
                                ├──► auth-service   :3002
                                ├──► user-service   :3001
                                └──► menu-service   :3003

  users-db  (MongoDB)
  menu-db   (MongoDB)
  prometheus :9090
  grafana    :3030
```

Tudo orquestrado via Docker Compose. O cliente só conhece o Gateway — nunca acessa os serviços diretamente.

---

## Serviços

| Serviço | Branch | Porta | Status |
|---|---|---|---|
| API Gateway | `gateway` | 3000 | Em desenvolvimento |
| Auth Service | `auth` | 3002 | Em desenvolvimento |
| User Service | `user` | 3001 | Implementado |
| Menu Service | `menu` | 3003 | Não iniciado |

### User Service
Gerencia usuários da plataforma (clientes e donos de restaurante). CRUD completo com MongoDB, senhas com bcrypt. Expõe busca por email para o auth service usar internamente.

### Auth Service
Recebe email e senha, busca o usuário no user service, valida a senha com bcrypt e devolve um JWT assinado. É o único serviço que conhece o `JWT_SECRET`.

### API Gateway
Ponto de entrada único. Valida o JWT via Guard antes de repassar qualquer requisição, injeta `x-user-id` e `x-user-role` nos headers internos e roteia para o serviço correto. Também hospeda o Swagger em `/api-docs`.  
**Estado atual:** estrutura inicializada, roteamento e Guard ainda não implementados.

### Menu Service
Vai gerenciar restaurantes, cardápios e itens. O dono do restaurante pode editar o próprio cardápio; clientes só consultam.  
**Estado atual:** não iniciado.

---

## Como rodar

Só precisa ter Docker instalado.

```bash
git clone https://github.com/LucMazarJR/ava-bim-2.git
cd ava-bim-2

cp user-service/.env.example  user-service/.env
cp auth-service/.env.example  auth-service/.env
# preencher as variáveis nos .env criados

docker-compose up -d
```

```bash
# Ver status dos containers
docker-compose ps

# Logs de um serviço
docker-compose logs -f auth-app

# Rebuild após mudar dependência
docker-compose up -d --build

# Derrubar tudo (preserva os bancos)
docker-compose down

# Derrubar e resetar os bancos
docker-compose down -v
```

---

## Documentação

- [Conceitos de microsserviços](Docs/conceitos-microsservicos.md) — teoria por trás das decisões de arquitetura
- [Guia de desenvolvimento](Docs/guia-desenvolvimento.md) — Git, Docker e como cada serviço foi configurado

# Conceitos de Arquitetura de Microsserviços

> Material de apoio teórico | Trabalho de Faculdade — Web I

---

## 1. O problema que microsserviços resolvem

### O monolito

No início de qualquer projeto, o mais natural é construir tudo junto: um único processo Node.js com todas as rotas, toda a lógica de negócio, um único banco de dados. Isso se chama **monolito**.

O monolito funciona bem enquanto o projeto é pequeno. O problema aparece conforme ele cresce:

- Um bug em qualquer parte pode derrubar **toda** a aplicação
- Para suportar mais usuários, você precisa escalar a aplicação **inteira**, mesmo que só uma parte esteja sobrecarregada
- Times diferentes mexendo no mesmo código causam conflito constante
- Um deploy de uma feature pequena exige restartar **tudo**

### A proposta dos microsserviços

Microsserviços dividem a aplicação em **serviços menores e independentes**, onde cada um é responsável por **um domínio do negócio**.

| Característica | Monolito | Microsserviços |
|---|---|---|
| Processos | 1 processo, 1 servidor | N processos, N servidores |
| Banco de dados | 1 banco compartilhado | Banco isolado por serviço |
| Deploy | All-or-nothing | Independente por serviço |
| Escala | Tudo junto | Só o que precisa |
| Falha | Um bug pode derrubar tudo | Falha isolada por serviço |

---

## 2. Containers Docker — um por serviço

Cada microsserviço roda em seu próprio **container Docker**. Um container é como um "mini servidor" independente: tem seu próprio processo Node.js, sua própria porta, seu próprio sistema de arquivos isolado.

```
┌─────────────────────────────────────────────────────────┐
│                    docker-compose                        │
│                                                         │
│  ┌─────────────────┐    ┌─────────────────┐             │
│  │  api-gateway    │    │  auth-service   │             │
│  │  porta: 3000    │    │  porta: 3001    │             │
│  └─────────────────┘    └─────────────────┘             │
│                                                         │
│  ┌─────────────────┐    ┌─────────────────┐             │
│  │ event-service   │    │ ticket-service  │             │
│  │  porta: 3002    │    │  porta: 3003    │             │
│  └─────────────────┘    └─────────────────┘             │
│                                                         │
│  ┌─────────────────┐    ┌──────────────────────┐        │
│  │    mongodb      │    │  prometheus + grafana │        │
│  │  porta: 27017   │    │  portas: 9090 / 3030  │        │
│  └─────────────────┘    └──────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

O **docker-compose** é o arquivo que orquestra todos esses containers: define a rede interna entre eles, as portas expostas e as variáveis de ambiente.

Dentro dessa rede, os containers se comunicam pelo **nome do serviço**. O api-gateway não chama `http://localhost:3001` — ele chama `http://auth-service:3001`, porque `auth-service` é o nome do container na rede interna Docker.

---

## 3. Componentes da arquitetura

### API Gateway

O Gateway é o **único ponto de entrada** da aplicação. O mundo externo (Postman, frontend, browser) só conhece o Gateway — nunca acessa os serviços diretamente.

Responsabilidades:
1. **Receber** todas as requisições externas
2. **Validar o JWT** — token inválido é rejeitado aqui mesmo
3. **Rotear** para o serviço correto com base na URL
4. **Repassar** informações do usuário nos headers internos (`x-user-id`, `x-user-role`)

```
POST /auth/login    → http://auth-service:3001/login
GET  /events        → http://event-service:3002/events
POST /tickets       → http://ticket-service:3003/tickets
```

O cliente nunca sabe que existem múltiplos serviços. Para ele, tudo vem de `localhost:3000`.

### Auth Service

Responsável por tudo relacionado a identidade:
- Registrar usuário (`POST /register`)
- Fazer login e devolver JWT (`POST /login`)

É o **único** serviço que conhece o `JWT_SECRET`. Os outros serviços não validam token — quem faz isso é o Gateway.

### Serviços de negócio

Implementam a lógica da aplicação. Não validam JWT — confiam que, se a requisição chegou, o Gateway já autenticou. Usam o `x-user-id` repassado para saber quem é o usuário.

---

## 4. Fluxo completo de uma requisição

### Login (rota pública)

```
1. Cliente → POST localhost:3000/auth/login { email, password }
2. Gateway recebe → repassa para auth-service (sem validar token, login não precisa)
3. auth-service verifica email/senha no MongoDB
4. auth-service gera JWT com payload { userId, email, role }
5. auth-service devolve { token: "eyJ..." }
6. Gateway devolve a resposta para o cliente
```

### Requisição autenticada

```
1. Cliente → GET localhost:3000/tickets
   Header: Authorization: Bearer eyJ...

2. Gateway extrai o token do header
3. Gateway verifica a assinatura com JWT_SECRET
   → Token inválido: retorna 401, para aqui
   → Token válido: decodifica { userId: "abc123", role: "user" }

4. Gateway adiciona headers internos:
   x-user-id: abc123
   x-user-role: user

5. Gateway repassa → http://ticket-service:3003/tickets

6. ticket-service lê req.headers['x-user-id']
7. ticket-service consulta MongoDB, retorna os dados

8. Gateway devolve a resposta para o cliente
```

---

## 5. JWT — como o token funciona

O JWT (JSON Web Token) tem 3 partes separadas por `.`:

```
eyJhbGciOiJIUzI1NiJ9 . eyJ1c2VySWQiOiIxMjMifQ . assinatura
       HEADER                   PAYLOAD              SIGNATURE
```

- **Header** — algoritmo de assinatura (HS256)
- **Payload** — dados do usuário. É decodificável por qualquer um, **não coloque senha aqui**
- **Signature** — garante que o token não foi adulterado. Só quem tem o `JWT_SECRET` consegue criar uma assinatura válida

O que acontece na validação:
1. Gateway extrai `Bearer eyJ...`
2. Chama `jsonwebtoken.verify(token, JWT_SECRET)`
3. Se a assinatura bater → retorna o payload decodificado
4. Se não bater (token adulterado ou expirado) → lança erro → responde 401

---

## 6. Observabilidade — Prometheus e Grafana

### O que é observabilidade?

É a capacidade de entender o que está acontecendo dentro da aplicação em tempo real. Para este projeto, o foco é **métricas**:

- Número de requisições por segundo
- Latência média das respostas
- Taxa de erros por serviço

### Como Prometheus coleta métricas

Prometheus funciona no modelo **pull**: periodicamente vai nos serviços buscar métricas no endpoint `/metrics`.

Em cada serviço Node.js, a lib `prom-client` expõe automaticamente esse endpoint com dados de CPU, memória, contagem e latência de requisições HTTP.

```
Serviço Node.js        Prometheus            Grafana
  GET /metrics  ◄──── coleta a cada 15s ◄── consulta e exibe
```

O `prometheus.yml` diz quais serviços monitorar:

```yaml
scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:3000']

  - job_name: 'auth-service'
    static_configs:
      - targets: ['auth-service:3001']
```

O Grafana lê do Prometheus e exibe dashboards com gráficos em tempo real.

---

## 7. Testes de carga com k6

O k6 simula múltiplos usuários fazendo requisições simultâneas. Você define quantos usuários virtuais, por quanto tempo, e o que cada um faz.

**Exemplo conceitual de script:**

```
Por 30 segundos, com 50 usuários simultâneos:
  1. Faz POST /auth/login
  2. Pega o token da resposta
  3. Faz GET /events com o token
  4. Faz POST /tickets reservando um ingresso
  5. Verifica se as respostas foram 200/201

Critério de sucesso: 95% das requisições abaixo de 500ms
```

O objetivo na apresentação é rodar o k6 enquanto o Grafana exibe os gráficos de métricas subindo em tempo real — isso demonstra que a observabilidade está funcionando.

---

## 8. Por que separar domínios?

Para justificar o uso de microsserviços, os domínios precisam ser **naturalmente independentes**. No sistema de eventos deste projeto:

| Serviço | Domínio | Responsabilidade |
|---------|---------|-----------------|
| auth-service | Identidade | Quem é o usuário |
| event-service | Eventos | O que existe para comprar |
| ticket-service | Ingressos | O que o usuário comprou |
| api-gateway | Entrada | Como o mundo acessa tudo |

Cada um pode evoluir, ser deployado e escalar independentemente. Se o event-service cair, o login ainda funciona. Se o ticket-service precisar de mais recursos em dia de venda, só ele é escalado.

# sistema-cardapio

Sistema multiempresa de cardápio digital, painel administrativo e registro de pedidos com encaminhamento ao WhatsApp.

## Tecnologias

- TypeScript
- Java
- Maven
- Spring Boot
- Next.js
- React
- PostgreSQL
- Flyway
- Docker Compose

## Projetos e componentes

- [backend](backend/README.md)
- [frontend](frontend/README.md)

---

## Documentação anterior

# Sistema Cardápio

MVP multiempresa de cardápio digital, painel administrativo e registro de pedidos antes do redirecionamento ao WhatsApp.

## Stack

- Frontend: Next.js, React e TypeScript
- Backend: Java 21 e Spring Boot
- Banco: PostgreSQL, com migrações Flyway
- Imagens: armazenadas no PostgreSQL e servidas pela API

## Estrutura

- `frontend`: aplicação única para `sistema.com/{slug}` e `admin.sistema.com`
- `backend`: API REST organizada como monólito modular
- `compose.yaml`: PostgreSQL para desenvolvimento local

## Desenvolvimento local

1. Copie `.env.example` para `.env` se precisar alterar os padrões.
2. Inicie o banco com `docker compose up -d db`.
3. Execute a API com `mvn -f backend/pom.xml spring-boot:run`.
4. Em outro terminal, instale e execute o frontend com `npm --prefix frontend install` e `npm --prefix frontend run dev`.

Por padrão, o PostgreSQL do Docker fica em `localhost:5433`, a API em `http://localhost:8080`, o frontend em `http://localhost:3000` e o Swagger UI em `http://localhost:8080/swagger-ui.html`.

Para simular os domínios localmente, use os hosts `cardapio.localhost:3000` e `admin.localhost:3000`.

## Primeiro acesso administrativo

O primeiro superadministrador não é criado com credenciais fixas no código. Configure no ambiente da API:

```text
APP_BOOTSTRAP_ADMIN_ENABLED=true
APP_BOOTSTRAP_ADMIN_EMAIL=admin@sistema.local
APP_BOOTSTRAP_ADMIN_PASSWORD=uma-senha-forte
```

Após a primeira inicialização, desative `APP_BOOTSTRAP_ADMIN_ENABLED`. O login fica disponível em `http://admin.localhost:3000/login`.

## Funcionalidades entregues

- gestão multiempresa e administradores, com isolamento por empresa;
- dados, identidade visual, banner, redes sociais, entrega fixa ou por bairro e horários;
- categorias, produtos, imagens, disponibilidade, variações, complementos e promoções;
- cardápio público responsivo com busca, carrinho e checkout;
- cálculo de preços e taxa exclusivamente no backend;
- pedido persistido antes do redirecionamento para o WhatsApp;
- painel de pedidos, status e trilha de alterações;
- cadastro opcional do cliente e histórico vinculado ao telefone;
- QR Code baixável do cardápio.
- pedido mínimo, prazo estimado, frete grátis por valor e cupons com validade, limite e primeira compra;
- pizza meio a meio com limite de sabores e cálculo automático pelo sabor mais caro;
- temas visuais, QR Code com logo em PNG de alta resolução e SVG;
- painel Kanban com atualização de pedidos em tempo real;
- analytics de visitas, produtos visualizados, carrinho, checkout, conversão e vendas.

O acompanhamento público por link e a impressão térmica não fazem parte do escopo atual.

## Produção

### API na Integrator VPS

1. Instale Java 21 e PostgreSQL 16 (ou use um PostgreSQL gerenciado).
2. Crie banco e usuário exclusivos para a aplicação.
3. Gere o artefato com `mvn -f backend/pom.xml clean package`.
4. Configure as variáveis de `.env.example`, usando uma chave JWT aleatória com pelo menos 32 caracteres e `APP_BOOTSTRAP_ADMIN_ENABLED=false` após o primeiro acesso.
5. Execute o JAR como serviço do sistema e publique-o atrás de Nginx ou Apache com HTTPS.
6. Restrinja o CORS ao domínio real do frontend e mantenha o endpoint `/actuator/health` no monitoramento.
7. Programe backup diário do PostgreSQL. As imagens também estão no banco e fazem parte desse backup.

As migrações Flyway são aplicadas automaticamente ao iniciar a API. Antes de atualizar produção, faça backup e teste a nova versão em um banco de homologação.

### Frontend na Locaweb

Este frontend usa SSR, middleware por domínio e rotas de API do Next.js; portanto, a hospedagem precisa executar Node.js 20, não apenas arquivos estáticos. Rode `npm --prefix frontend ci` e `npm --prefix frontend run build`, e inicie com `npm --prefix frontend start`.

Configure:

```text
NEXT_PUBLIC_API_URL=https://api.seudominio.com.br
NEXT_PUBLIC_PUBLIC_APP_URL=https://seudominio.com.br
PUBLIC_APP_HOST=seudominio.com.br
ADMIN_APP_HOST=admin.seudominio.com.br
```

Crie DNS e certificados para o domínio público, `admin` e `api`. Se o plano da Locaweb não oferecer processo Node.js persistente e proxy reverso, use uma VPS/Cloud para o frontend ou um provedor compatível com Next.js SSR.

## Validação

- Backend: `mvn -f backend/pom.xml test`
- Frontend: `npm --prefix frontend run build`
- Banco real: `docker compose up -d db` e inicialização da API para validar as migrações PostgreSQL

## Publicação no GitHub

Este repositório reúne o código-fonte e a documentação do projeto. Dependências instaladas, builds, backups, bancos locais e chaves privadas não acompanham a publicação. As configurações sensíveis identificadas foram substituídas por marcadores ou referências a variáveis de ambiente; configure seus próprios valores antes de executar os componentes.

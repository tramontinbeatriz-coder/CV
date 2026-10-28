# colocar no ar

## jeito mais simples (tudo pelo site da Vercel, sem terminal)

1. Em https://vercel.com/new, importe o repositório `CV`. Em **Root Directory** escolha `nos`.
   Se o primeiro deploy falhar, tudo bem: siga para o passo 2.
2. **Settings → Git → Production Branch**: coloque `claude/great-hypatia-f8pjx8` (a branch do site da nós).
3. **Storage**: crie um banco **Turso** e um **Blob** e conecte os dois ao projeto.
   Eles criam sozinhos as variáveis do banco e das fotos.
4. **Settings → Environment Variables**:

   | variável | valor |
   | --- | --- |
   | `AUTH_SECRET` | uma frase longa e aleatória (40+ caracteres) |
   | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | seu login do painel (senha com 8+ caracteres) |
   | `PAYMENT_PROVIDER` + credenciais | veja `PAGAMENTOS.md` (para testar: Asaas com `ASAAS_SANDBOX=true`) |

5. **Deployments → Redeploy**. O build cria as tabelas e o seu acesso ao painel sozinho.
   O site fica em `https://<projeto>.vercel.app` até você ligar um domínio.

`SITE_URL` é opcional: sem ela, o site usa o endereço `.vercel.app`. Defina quando ligar o domínio.

## jeito manual

Recomendado: **Vercel** (site) + **Turso** (banco) + **Vercel Blob** (fotos) + **Mercado Pago** + **Resend**.
Todos têm plano gratuito suficiente para começar.

## 1. banco (Turso)

```bash
# https://docs.turso.tech/cli/installation
turso auth signup
turso db create nos
turso db show nos --url          # → DATABASE_URL (libsql://...)
turso db tokens create nos       # → DATABASE_AUTH_TOKEN
```

Crie as tabelas e o primeiro acesso ao painel **a partir do seu computador**:

```bash
DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm run db:migrate
DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm run admin:create -- voce@email.com "senha-forte" "Seu nome"
```

(Não rode o `db:seed` em produção, a não ser que queira os exemplos lá.)

## 2. Vercel

1. Importe o repositório em https://vercel.com/new e em **Root Directory** escolha `nos`.
2. Em **Storage → Blob**, crie um blob store e conecte ao projeto (cria `BLOB_READ_WRITE_TOKEN`).
3. Em **Settings → Environment Variables**, adicione (veja `.env.example`):

   | variável | valor |
   | --- | --- |
   | `SITE_URL` | `https://seudominio.com.br` |
   | `DATABASE_URL`, `DATABASE_AUTH_TOKEN` | do Turso |
   | `AUTH_SECRET` | `openssl rand -base64 48` |
   | `STORAGE_PROVIDER` | `vercel-blob` |
   | `PAYMENT_PROVIDER` + credenciais | veja `PAGAMENTOS.md` |
   | `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `EMAIL_FROM` | do Resend |

4. Deploy. Configure o domínio em **Settings → Domains**.
5. Cadastre a URL do webhook no provedor de pagamento (`https://seudominio.com.br/api/webhooks/mercadopago`).

## 3. conferir

- abra o site no celular e compartilhe um link de encontro no WhatsApp (deve aparecer a imagem de prévia);
- faça uma inscrição de teste com o provedor em modo teste;
- entre no `/admin`, veja a inscrição e baixe o CSV.

## hospedagem própria (VPS)

Também roda em qualquer servidor Node 20+: `npm ci && npm run build && npm start`.
Nesse caso dá para usar `DATABASE_URL=file:./data/nos.db` e `STORAGE_PROVIDER=local`
(faça backup das pastas `data/` e `storage/`).

## Instagram automático (opcional)

Para a home mostrar os últimos posts de @thenos.club (a seção do Instagram, perto do rodapé):

1. No app do Instagram, deixe a @thenos.club como **conta profissional** (criadora de conteúdo ou empresa).
2. Em https://developers.facebook.com crie um app (tipo *Empresa*) e adicione o produto **Instagram** →
   *API do Instagram com login do Instagram*.
3. Em **Gerar tokens de acesso**, adicione a conta @thenos.club, entre com o login dela e clique em
   **Gerar token**. Copie o token (é de longa duração, vale 60 dias).
4. Coloque o token na variável `INSTAGRAM_ACCESS_TOKEN` (na Vercel: Settings → Environment Variables) e
   faça um novo deploy.

O site **renova o token sozinho** a cada 7 dias e guarda o novo no banco — não precisa repetir o passo 3,
desde que o site receba visitas pelo menos uma vez a cada ~50 dias. Os posts são atualizados de hora em hora.
Sem token (ou se o Instagram falhar), a seção mostra as fotos em destaque da galeria.

**Se a Meta só oferecer "API setup with Facebook login"** (acontece em algumas contas), também funciona:
a @thenos.club precisa estar ligada a uma Página do Facebook. Em **Tools → Graph API Explorer**, escolha o app,
adicione as permissões `instagram_basic`, `pages_show_list` e `pages_read_engagement` e clique em
**Generate Access Token**. Depois, no ícone ⓘ do token → **Open in Access Token Tool** → **Extend Access Token**,
e use esse token longo (começa com `EAA`) em `INSTAGRAM_ACCESS_TOKEN`. O site troca sozinho pelo token da
Página, que não expira.


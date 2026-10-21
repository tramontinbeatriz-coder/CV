# colocar no ar

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

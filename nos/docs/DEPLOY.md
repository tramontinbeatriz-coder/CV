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

Para a home mostrar os últimos posts de @thenos.club, gere um token da *Instagram API with Instagram
Login* (conta profissional) e coloque em `INSTAGRAM_ACCESS_TOKEN`. O token vale 60 dias e precisa ser
renovado. Sem token, a seção usa as fotos em destaque da galeria.

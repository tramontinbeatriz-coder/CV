# nós — site

Site da **nós**, comunidade de experiências presenciais para mulheres em Porto Alegre.
Divulga os próximos encontros, recebe inscrições com pagamento online, mostra a galeria
dos encontros passados e tem um **painel administrativo** para editar tudo sem mexer em código.

| para… | leia |
| --- | --- |
| usar o painel (eventos, fotos, textos, inscrições) | [`docs/PAINEL.md`](docs/PAINEL.md) |
| configurar o pagamento (Mercado Pago / Stripe) | [`docs/PAGAMENTOS.md`](docs/PAGAMENTOS.md) |
| colocar o site no ar | [`docs/DEPLOY.md`](docs/DEPLOY.md) |
| entender a identidade visual e onde mudar | [`docs/DESIGN.md`](docs/DESIGN.md) |

---

## rodar no seu computador

Precisa de **Node.js 20+** (recomendado 22).

```bash
cd nos
npm install
cp .env.example .env.local      # depois edite: AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run setup                   # cria o banco local e os dados de exemplo
npm run dev                     # http://localhost:3000
```

- **site:** http://localhost:3000
- **painel:** http://localhost:3000/admin — entre com o `ADMIN_EMAIL` / `ADMIN_PASSWORD` do `.env.local`

> Gere um `AUTH_SECRET` forte com `openssl rand -base64 48`.
> Os pagamentos começam em **modo teste** (`PAYMENT_PROVIDER=mock`): dá para fazer o fluxo
> completo (inscrição → checkout → confirmação) sem cobrar ninguém.

### comandos

| comando | o que faz |
| --- | --- |
| `npm run dev` | site em modo desenvolvimento |
| `npm run build` / `npm start` | versão de produção |
| `npm run setup` | aplica as migrações do banco + dados de exemplo |
| `npm run db:seed -- --reset` | apaga e recria **só** o conteúdo de exemplo |
| `npm run admin:create -- email "senha" "Nome"` | cria acesso ao painel (ou troca a senha) |
| `npm run db:generate` | gera migração depois de mudar `src/lib/db/schema.ts` |
| `npm test` | testes unitários (vagas, preços, assinaturas de webhook) |
| `npm run build && npm run test:e2e` | teste completo com navegador, num banco separado |

---

## conteúdo de exemplo

O `npm run setup` cria dados **fictícios**, todos marcados com a etiqueta “conteúdo de exemplo”:

- **defesa pessoal com fran** — data, horário e local do exemplo que vocês enviaram; preço, descrição
  e itens são `[exemplo]`/`[placeholder]`;
- **café & conversa** (poucas vagas) e **ateliê de cerâmica** (esgotado, com lista de espera) —
  inventados só para mostrar os status;
- um **rascunho** que não aparece no site;
- duas galerias passadas (**defesa pessoal** e **wine experience**, agosto) com fotos de exemplo.

As fotos em `public/samples/` são imagens abstratas geradas com a paleta da marca e a etiqueta
“foto de exemplo”. Troque tudo pelo painel. Textos que ainda precisam ser definidos por vocês
(e-mail, WhatsApp, política de privacidade, regras de cancelamento…) estão como `[placeholder]`
e aparecem destacados em amarelo no painel.

---

## arquitetura

```
nos/
├── src/
│   ├── app/
│   │   ├── (site)/            FRONTEND público: home, sobre, eventos, inscrição, confirmação, passados
│   │   │   └── actions.ts     ações do servidor do site (inscrição, lista de espera, checkout teste)
│   │   ├── admin/             PAINEL: login + (painel)/ eventos, inscrições, galeria, conteúdo, conta
│   │   │   └── actions.ts     ações do painel (todas checam login)
│   │   ├── api/
│   │   │   ├── webhooks/[provider]   avisos de pagamento (mercadopago, stripe)
│   │   │   ├── admin/export          CSV de inscrições (protegido)
│   │   │   └── calendario/[token]    arquivo .ics da confirmação
│   │   ├── media/[...path]    serve as fotos enviadas (armazenamento local)
│   │   └── sitemap, robots, opengraph-image, icon
│   ├── proxy.ts               bloqueia /admin sem login
│   ├── components/            brand/ (logo, “nó”), site/, admin/
│   └── lib/
│       ├── db/                BANCO: schema (Drizzle) + conexão libSQL
│       ├── auth.ts, session.ts  AUTENTICAÇÃO: bcrypt + cookie JWT httpOnly
│       ├── payments/          PAGAMENTOS: interface + mock, mercadopago, stripe
│       ├── registrations.ts   inscrição, reserva de vaga, confirmação, lista de espera
│       ├── spots.ts           regras de vagas e status (testado)
│       ├── storage.ts         STORAGE de imagens: local ou Vercel Blob (+ otimização)
│       ├── notifications/     confirmação por e-mail (Resend) e WhatsApp (webhook)
│       ├── content.ts         todos os textos editáveis e seus padrões
│       └── instagram.ts       integração opcional com posts do Instagram
├── drizzle/                   migrações SQL
├── scripts/                   migrate, seed, create-admin, e2e
└── tests/                     testes unitários
```

| camada | escolha | por quê |
| --- | --- | --- |
| frontend + backend | **Next.js 16** (App Router, Server Actions), TypeScript, Tailwind CSS 4 | um projeto só, rápido, ótimo SEO |
| banco | **libSQL/SQLite** via Drizzle ORM — arquivo local no dev, **Turso** em produção | zero instalação local, plano grátis generoso, backup fácil |
| autenticação | e-mail + senha (bcrypt) com sessão em cookie assinado | simples e seguro para poucas pessoas administrando |
| pagamentos | interface própria com **Mercado Pago** (recomendado: Pix + cartão), **Stripe** e **modo teste** | trocar de provedor = mudar 1 variável |
| imagens | pasta local no dev, **Vercel Blob** em produção; toda foto é reduzida e convertida para WebP | carregamento rápido no celular |
| e-mail | console no dev, **Resend** em produção | — |

### como funciona a inscrição

1. A pessoa preenche o formulário → o servidor, **numa transação**, confere as vagas e cria a
   inscrição como `pendente`, **reservando a vaga** por `SPOT_HOLD_MINUTES` (padrão 30 min).
2. Ela vai para o **checkout seguro do provedor** (Pix/cartão). Nenhum dado de cartão passa pelo nosso servidor.
3. O provedor avisa por **webhook** (e o site também confere quando ela volta): a inscrição vira
   `pago`, a vaga passa a contar como ocupada, a confirmação é enviada e aparece a página
   **“você está dentro! 🤍”** (com botão para adicionar à agenda).
4. Se o pagamento falha ou a reserva vence, a vaga volta a ficar disponível.
5. Sem vagas → o botão vira **“lista de espera”** e o formulário vira cadastro na lista.

Status exibido: **inscrições abertas → últimas vagas → esgotado**, automático pelas vagas
(`LAST_SPOTS_THRESHOLD`), ou forçado no painel; **encerrado** quando a data passa ou quando marcado.

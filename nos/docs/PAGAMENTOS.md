# pagamentos

O site nunca recebe nem guarda dados de cartão: a pessoa paga no **checkout seguro do provedor**
e o provedor avisa o site por **webhook**. O preço vem de cada encontro (definido no painel).

Escolha o provedor com uma variável:

```env
PAYMENT_PROVIDER=mock         # modo teste (padrão)
PAYMENT_PROVIDER=mercadopago  # recomendado no Brasil: Pix + cartão + boleto
PAYMENT_PROVIDER=stripe       # cartão (e Pix, se ativado na conta)
```

## modo teste (`mock`)

Nada é cobrado. Depois do formulário, abre uma página “checkout de teste” com os botões
**simular pagamento aprovado** e **simular recusa**. Serve para testar todo o fluxo — vagas,
confirmação, e-mail no terminal, lista de espera. Nunca deixe `mock` no site publicado.

## Mercado Pago (recomendado)

1. Crie uma aplicação em https://www.mercadopago.com.br/developers/panel/app (produto: *Checkout Pro*).
2. Em **credenciais de teste**, copie o *Access Token* (`TEST-...`) → `MERCADOPAGO_ACCESS_TOKEN`.
3. Em **Webhooks → configurar notificações**:
   - URL: `https://SEU-SITE/api/webhooks/mercadopago`
   - evento: **Pagamentos**
   - copie a **assinatura secreta** → `MERCADOPAGO_WEBHOOK_SECRET`
4. `.env` (ou variáveis na Vercel):
   ```env
   PAYMENT_PROVIDER=mercadopago
   SITE_URL=https://SEU-SITE
   MERCADOPAGO_ACCESS_TOKEN=TEST-...
   MERCADOPAGO_WEBHOOK_SECRET=...
   ```
5. Teste com os [cartões de teste](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/your-integrations/test/cards)
   e um usuário comprador de teste. Se o checkout pedir, use `MERCADOPAGO_USE_SANDBOX=true`.
6. Tudo certo? Troque para as **credenciais de produção** (`APP_USR-...`) e `MERCADOPAGO_USE_SANDBOX=false`.

Como funciona: o site cria uma *preferência* com o valor do encontro e o id da inscrição
(`external_reference`), a expiração igual à reserva da vaga e as URLs de volta. No webhook, o site
**consulta o pagamento na API do Mercado Pago** com o seu token antes de confirmar — então um aviso
falso não consegue confirmar inscrição. Quando a pessoa volta para o site, ele também confere o status
direto (não depende só do webhook).

## Stripe

1. Em https://dashboard.stripe.com/test/apikeys copie a *secret key* (`sk_test_...`) → `STRIPE_SECRET_KEY`.
2. Em **Developers → Webhooks → add endpoint**:
   - URL: `https://SEU-SITE/api/webhooks/stripe`
   - eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
     `checkout.session.async_payment_failed`, `checkout.session.expired`
   - copie o *signing secret* (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`
3. `PAYMENT_PROVIDER=stripe`. Métodos de pagamento (cartão, Pix) são ativados no dashboard da Stripe.
4. Localmente, dá para testar webhooks com `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

## outro provedor (Asaas, Pagar.me, PagBank…)

Crie `src/lib/payments/<provedor>.ts` implementando a interface `PaymentProvider`
(`src/lib/payments/types.ts`):

- `createCheckout({ registration, event })` → devolve a URL do checkout e a referência;
- `handleWebhook(request, rawBody)` → valida a assinatura e devolve `{ registrationId, outcome }`;
- `fetchStatus(registration)` (opcional) → consulta o status quando a pessoa volta.

Registre em `src/lib/payments/index.ts`. O webhook fica automaticamente em `/api/webhooks/<provedor>`.
(Obs.: o Asaas exige CPF do cliente — seria preciso adicionar esse campo ao formulário.)

## confirmações por e-mail e WhatsApp

Assim que o pagamento é aprovado, o site envia a confirmação:

- **e-mail:** `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `EMAIL_FROM="nós <ola@seudominio.com.br>"`
  (verifique o domínio no Resend). Sem isso, o e-mail só aparece no terminal (`console`).
- **WhatsApp:** `WHATSAPP_PROVIDER=webhook` + `WHATSAPP_WEBHOOK_URL`. O site faz um POST com
  `{ phone, text, registrationId, event, name }` — conecte em Z-API, Twilio, Make ou Zapier.
  O texto da mensagem fica em `src/lib/notifications/index.ts`.

## reembolsos e cancelamentos

O estorno é feito no painel do provedor. Depois, no painel da nós, mude a inscrição para
**reembolsado** (ou deixe o webhook do provedor fazer isso) — a vaga é liberada automaticamente.

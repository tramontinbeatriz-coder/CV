# financeiro (painel → financeiro)

A página **/admin/financeiro** mostra receita, gastos e lucro por encontro. Ela junta duas fontes:

- **vendas de ingressos pelo site**: as inscrições pagas, direto do banco do site;
- **planilha "NÓS • Financial Dashboard"** (Google Sheets, conta da Nós), aba **Razão 🧠**: os gastos de cada encontro e as receitas que não passaram pelo site (Pix direto, dinheiro…).

A página lê a planilha de novo toda vez que é aberta, então é só continuar preenchendo a planilha como sempre.

## como preencher a aba "Razão"

O painel procura a linha de cabeçalho com as colunas abaixo (a ordem não importa):

| Evento/Categoria | Tipo de Gasto/Receita | Valor | Categoria | Forma Pgto |
|---|---|---|---|---|
| Harmonização | taças | R$ 155,00 | Gasto | Pix |
| Defesa Pessoal | ingressos | R$ 1.200,00 | Receita | Pix |

- **Evento/Categoria**: o nome do encontro. Ele é ligado ao encontro do site com nome parecido (sem ligar para acento ou maiúscula): "Harmonização" casa com "Harmonização de vinhos". Se houver dois encontros com o mesmo nome, vale o mais recente que já aconteceu.
- Nomes que não são encontro (**Investimento, Estoque, Marketing, Geral, Outros, Custos fixos, Equipamentos, Materiais**) aparecem separados em "outros gastos", mas entram no total.
- **Categoria**: "Receita" (ou "Entrada") soma como receita; qualquer outra coisa ("Gasto", "Despesa") conta como gasto.
- Linhas sem valor são ignoradas.
- **Não lance na planilha os ingressos vendidos pelo site**: eles já entram sozinhos. Se tiver "ingresso" como receita na planilha e também vendas no site para o mesmo encontro, o painel mostra um aviso ⚠ de que pode estar contado duas vezes.

## ligar a planilha (jeito simples: publicar em CSV)

1. Abra a planilha logada na conta da Nós.
2. **Arquivo → Compartilhar → Publicar na Web**.
3. Em "Link", escolha a aba **Razão 🧠** (no lugar de "Documento inteiro") e **Valores separados por vírgula (.csv)** (no lugar de "Página da Web"). Clique em **Publicar** e confirme.
4. Copie o link (termina com `output=csv`) e cole no painel, em **financeiro → ligar a planilha**.

Pronto, não precisa mexer na Vercel. Só a aba Razão fica publicada, e só quem tem o link (que é longo e aleatório) consegue ver. Para parar de publicar: mesmo menu, botão **Parar de publicar**.

## jeito mais privado (opcional): conta de serviço do Google

Assim nada fica publicado: a planilha é compartilhada só com um "robô" do Google.

1. Em https://console.cloud.google.com crie um projeto (ex.: "nos-site").
2. Ative a **Google Sheets API** (menu "APIs e serviços → Biblioteca").
3. "APIs e serviços → Credenciais → Criar credenciais → Conta de serviço". Dê um nome e conclua.
4. Abra a conta criada → aba **Chaves → Adicionar chave → JSON**. Um arquivo é baixado.
5. Na Vercel (projeto nos → Settings → Environment Variables) crie `GOOGLE_SERVICE_ACCOUNT_JSON` e cole o conteúdo inteiro do arquivo. Faça um redeploy.
6. Na planilha, **Compartilhar** com o e-mail da conta de serviço (termina com `iam.gserviceaccount.com`) como **Leitor**.
7. No painel, cole o link normal da planilha (o da barra de endereço, `…/spreadsheets/d/…/edit`).

O painel lê a aba cujo nome começa com "Razão".

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

## lançar e apagar pelo painel: conta de serviço do Google

Com isso o painel ganha o formulário **novo lançamento** (vai direto para a próxima linha livre da aba Razão) e um botão **apagar** em cada lançamento (a linha fica em branco na planilha; nada mais é mexido). Também deixa de precisar do link publicado: nada fica público e os números aparecem na hora.

A "conta de serviço" é um usuário-robô do Google que só acessa o que for compartilhado com ele.

1. Entre em https://console.cloud.google.com com a conta da Nós (thenossclub@gmail.com). Se pedir, aceite os termos.
2. No topo, clique no seletor de projeto → **Novo projeto** → nome `nos-site` → **Criar**. Confira que ele ficou selecionado no topo.
3. Na busca do topo, digite **Google Sheets API**, abra e clique em **Ativar**.
4. Na busca, digite **Contas de serviço** (IAM e administrador) → **Criar conta de serviço** → nome `nos-site` → **Criar e continuar** → **Concluir** (pode pular as permissões).
5. Clique na conta criada → aba **Chaves** → **Adicionar chave → Criar nova chave → JSON → Criar**. Um arquivo `.json` é baixado. Guarde-o bem: ele é a senha do robô.
6. Na Vercel: projeto **nos → Settings → Environment Variables**. Nome `GOOGLE_SERVICE_ACCOUNT_JSON`, valor: abra o arquivo `.json` num editor de texto, copie **tudo** e cole. Salve.
7. Ainda na Vercel: **Deployments** → no último, menu **⋯ → Redeploy**.
8. Volte ao painel → financeiro. Agora o quadro "planilha ligada" mostra o e-mail do robô (termina com `iam.gserviceaccount.com`). Na planilha, clique em **Compartilhar**, adicione esse e-mail como **Editor** (desmarque "notificar").
9. No painel, em **trocar link**, cole o link normal da planilha (o da barra de endereço, termina com `/edit…`).

Pronto: o formulário de lançamento aparece. Se quiser, desfaça a publicação em CSV (Arquivo → Compartilhar → Publicar na Web → Parar de publicar).

O painel lê e escreve na aba cujo nome começa com "Razão", usando as colunas do cabeçalho (Evento/Categoria, Tipo de Gasto/Receita, Valor, Categoria, Forma Pgto). O valor é gravado como número, então use a formatação de moeda na coluna Valor da planilha para ele aparecer como R$.

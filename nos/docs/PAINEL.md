# como usar o painel

Endereço: **`/admin`** (ex.: `https://seusite.com.br/admin`). Entre com e-mail e senha.
O painel funciona no celular também.

## criar um novo encontro

1. **encontros → + novo encontro**
2. Preencha:
   - **nome do encontro** (ex.: *defesa pessoal com fran*) — escreva em minúsculas, é o estilo da nós;
   - **frase de destaque** — a frase curtinha que aparece em itálico;
   - **descrição curta** (cards da agenda) e **descrição completa** (página do encontro; deixe uma
     linha em branco entre parágrafos);
   - **data, horário, duração, local, endereço** e, se quiser, o **link do Google Maps**;
   - **valor** (ex.: `90,00`; `0` = gratuito) e **número total de vagas**;
   - **foto principal** — pode escolher direto do celular, o painel reduz o tamanho sozinho;
   - **o que está incluso** e **informações importantes** — um item por linha.
3. Deixe **publicado no site** desmarcado se quiser revisar antes. Logada no painel, você consegue abrir
   a página do rascunho pelo botão **ver no site**.
4. Clique em **criar encontro**. Depois é só marcar **publicado** e salvar.

**Dica:** para repetir um formato, abra um encontro antigo e clique em **duplicar** — a cópia nasce
como rascunho, com as vagas zeradas. Troque a data e publique.

## status e vagas

- **automático (recomendado):** o site mostra *inscrições abertas*, muda para *últimas vagas* quando
  restam poucas e para *esgotado* quando acabam. Quando a data passa, vira *encerrado*.
- Você pode **forçar** um status (ex.: *encerrado* para parar as inscrições antes).
- Quando esgota, o botão vira **lista de espera**. Quem entra na lista aparece na página do encontro
  no painel e em **inscrições → lista de espera**.
- Enquanto alguém está pagando, a vaga fica **reservada** por 30 minutos (aparece em rosa na barra de vagas).
- Não dá para reduzir o total de vagas abaixo do número de inscrições já pagas.

## inscrições

**inscrições** mostra todo mundo: nome, e-mail, telefone (clique abre o WhatsApp), encontro, status
do pagamento e data. Filtre por encontro, status ou busca e clique em **baixar CSV** para abrir no
Excel/Google Planilhas.

Mudar o status manualmente:
- **pago ✓** — ex.: alguém pagou por Pix direto. Ocupa a vaga e envia a confirmação.
- **cancelado** / **reembolsado** — libera a vaga. (O estorno do dinheiro é feito no painel do Mercado Pago/Stripe.)

## excluir um encontro

Só é possível excluir encontros **sem inscrições pagas** (para não perder registros). Para tirar um
encontro com inscrições do ar, desmarque **publicado** ou use o status **encerrado**.

## fotos e eventos passados

**eventos passados & fotos → + nova galeria** → preencha nome, data e local → **adicionar fotos**
(pode arrastar várias de uma vez). Em cada foto:
- **← →** muda a ordem;
- **★ destacar** coloca a foto na home, na seção *nós em fotos*;
- escreva uma **descrição** curta (ajuda quem usa leitor de tela) e clique em **ok**;
- **apagar** remove.

Atalho: na página de um encontro que já aconteceu, **criar galeria de fotos** cria a galeria com a
foto de capa e as fotos extras do encontro.

## textos, contato e cores

**textos, contato e cores** tem tudo o que não é evento: frases da home, página *sobre*, Instagram,
e-mail, WhatsApp, textos de SEO (Google/WhatsApp), política de privacidade, regras de cancelamento,
fotos da home/sobre e a **paleta de cores**. Salvou, está no ar. Campos em amarelo ainda são
`[placeholder]`. Em cores, **restaurar cores originais** volta para a identidade do manual.

## acessos

- **minha conta** → trocar senha.
- Para dar acesso a outra pessoa (precisa do terminal do projeto):
  `npm run admin:create -- email@exemplo.com "senha-forte" "Nome"`

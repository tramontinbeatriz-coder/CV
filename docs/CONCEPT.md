# Beatriz Tramontin — conceito do portfolio

Este documento reúne o conceito, a copy e as decisões de design do site. O código implementa exatamente o que está aqui. Todo o texto vive em `src/content/site.ts`.

> **Regra de conteúdo:** nada foi inventado. Tudo o que você ainda não me passou aparece como placeholder `[[assim]]` no código. No site, ele aparece destacado em terracota com sublinhado tracejado, então não tem como ir ao ar sem ninguém perceber. A lista completa está no fim deste documento.

---

## 0. Ideia central

**Posicionamento em uma frase:** *Beatriz transforma ideias complexas em coisas que acontecem, conectando estratégia, tecnologia, comunicação e pessoas, entre países, times e disciplinas.*

**O fio da narrativa:** o site todo conta uma única história. Em RI você aprende a fazer sistemas diferentes trabalharem juntos, e é isso que você faz até hoje, agora com muito mais tecnologia no meio. A palavra que amarra tudo é **tradução**: entre tecnologia e negócio, entre times, entre países.

**Como o site demonstra em vez de afirmar:**
- Nada de adjetivos soltos. Os pilares de "How I work" vêm com **"In practice"**, que liga cada habilidade a uma evidência real.
- Os números aparecem grandes e com contexto (+120% · 4 · 20+).
- O Innovation Tournament é enquadrado explicitamente como problema de estratégia e gestão, não como evento: *"From the outside it looked like an event. From the inside, it was a strategy and project management problem in four countries."*

---

## 1. Arquitetura do site

```
/                       Home (one-page narrativo)
├── Hero                Nome, headline, intro, CTAs, status
├── 01 About            Narrativa RI → tecnologia → SAP → Business AI; fatos; linha do tempo
├── 02 Selected work
│   ├── 01 Innovation Tournament   (destaque: capa grande + métricas)
│   ├── 02 SAP Business AI         (linha editorial imagem/texto)
│   └── 03 Across borders          (faixa escura visual: regiões + funções)
├── 03 How I work       4 pilares com prova "In practice"
├── 04 Beyond work      Nós em destaque (projeto independente) + outros interesses
└── 05 Contact          "Let's build something interesting." + footer

/work/innovation-tournament/   Case study completo
/work/sap-business-ai/         Case study completo
/work/across-borders/          Case study completo
/work/nos/                     Case study completo (o Nós tem página própria, igual aos projetos profissionais)
```

Cada case study segue a mesma estrutura: **título → contexto → meu papel → desafio → o que fiz → impacto → competências**, com métricas grandes e galeria de imagens.

**Por que o Nós fica em "Beyond work" e também ganha um case completo:** na home ele aparece como um bloco editorial grande (não um card pequeno) e o link leva a um case com a mesma estrutura dos projetos da SAP e do Tournament. Assim ele aparece como projeto independente de verdade, não como hobby.

---

## 2. Texto final por seção

*(Idioma do site: inglês, pensando em hiring managers de empresas globais.)*

### Navigation
`Beatriz Tramontin` · About · Work · How I work · Beyond work · Contact · LinkedIn ↗

### Hero
- **Eyebrow:** STRATEGY · INNOVATION · COMMUNICATION · TECHNOLOGY
- **Nome:** BEATRIZ TRAMONTIN
- **Headline:** I turn ideas into things that *happen.*
- **Intro:** I'm Beatriz — Bia, to most people. I work in Business AI and innovation at SAP, connecting technology, business and the people who need to move both forward. Trained in International Relations, I do my best work between countries, teams and disciplines.
- **CTAs:** View my work ↓ · About me · LinkedIn ↗
- **Status:** Currently: Business AI & Innovation at SAP · Working across: Latin America & the Americas · Also: Co-founder of Nós

**Opções de headline consideradas:**
1. **I turn ideas into things that happen.** ← *escolhida*: é humana, direta e diz exatamente o que você quer que o recrutador pense ("ela transforma ideias em algo concreto"), sem nenhum clichê.
2. Where strategy meets people, technology and momentum.
3. Ideas, made real — across borders.
4. Good ideas need a plan, a team and a translator.
5. Strategy you can actually run.
6. Strategy, innovation & communication — across borders. *(usada como tagline do footer)*

### 01 · About
- **Headline:** A career built in the *spaces between.*
- **Lede:** International Relations taught me how different systems learn to work together. I've been doing that ever since — with a lot more technology involved.
- **Narrativa:**
  1. I studied International Relations at ESPM: a degree about how countries, institutions and people with different interests find common ground. It turned out to be excellent training for innovation work, where the hard part is rarely the idea — it's getting everyone to build it together.
  2. From there my path moved into technology and innovation, and to SAP, where I work with Business AI. My days sit where strategic projects, client conversations and cross-team coordination meet: running workshops, presenting AI solutions to clients, and making sure business, product and technology teams are moving towards the same outcome.
  3. Technology is a real part of what I do, and I enjoy it. But what I bring is the connection — translating complex ideas into decisions, turning conversations into plans, and getting people from different countries and functions to move in the same direction.
- **Citação:** "Most of my work is translation — between technology and business, between teams, between countries."
- **Linha do tempo:** 01 International Relations (ESPM) → 02 Technology & innovation → 03 SAP → 04 Business AI (Now). Os anos são placeholders.
- **Fatos:** Education · Now · Regions · Languages `[[placeholder]]` · Independent

### 02 · Selected work
- **Headline:** Complex things, *given structure.*
- **Lede:** Three projects, one pattern: take something with many moving parts, give it a shape, and get people moving with it.

**01 — Innovation Tournament** · *Strategy · Program management · Innovation*
- Tagline: One innovation program, four Latin American countries, run end to end.
- Context: A multinational innovation program running across four Latin American countries at the same time — bringing together participants, mentors and judges around real projects, with local teams and stakeholders in each market.
- My role: I led execution end to end: from planning and prioritisation to coordinating people across countries and evaluating the final projects.
- Challenge: Make a single program work in four countries at once — each with its own teams, timelines and priorities — while coordinating a large network of mentors, judges and participants and keeping the quality bar consistent across more than twenty projects.
- What I did: coordinated mentors/judges/participants em 4 países · aligned international teams and stakeholders around one timeline and shared strategic priorities · structured and improved the program with test-and-learn · facilitated collaboration across teams · evaluated 20+ projects · developed high-impact innovation initiatives.
- Impact: +120% growth in acquisition and engagement — and a program format that got better while it was running, not only after it ended.
- Métricas: **+120%** acquisition & engagement · **4** Latin American countries · **20+** projects evaluated
- Pull quote: From the outside it looked like an event. From the inside, it was a strategy and project management problem in four countries.

**02 — SAP Business AI** · *Technology · Client engagement · Strategy*
- Tagline: Translating AI into conversations — and initiatives — that make sense for the business.
- Challenge: AI is complex, fast-moving and easy to overpromise. The work is making it concrete — what it means for a specific business, which problem it solves, and what it takes to get there.
- What I did: client engagement on AI solutions · workshops · client presentations · strategic projects & innovation · coordination across business, product and technology.
- Métricas: **3** functions connected (business, product & technology) · `[[#]]` workshops · `[[#]]` presentations
- Pull quote: The hardest part of AI is rarely the technology. It's the conversation around it.

**03 — Across borders** · *International · Cross-functional · Stakeholders*
- Headline visual: Four countries. One program. *Many ways of working.*
- Challenge: Distance is the easy part. The real work is alignment: different priorities, cultures and communication styles moving on the same timeline.
- Visual: faixa escura com "livro-razão" de regiões (Latin America → 4 países `[[placeholder]]`; The Americas → `[[mercados]]`) e as funções que você coordena (Business, Product, Technology, Clients, Mentors, Judges, Participants).

### 03 · How I work
- **Headline:** Four things I bring *to any project.*
- **Lede:** Not adjectives — habits. And where you can see them in practice.

| Pilar | Linha | In practice |
|---|---|---|
| Strategy | Turning ideas into structured initiatives. | Defining priorities and one shared timeline for a program running in four countries at once. |
| Innovation | Exploring new ways to solve problems and create value. | Improving a live program through test-and-learn — and helping clients explore what AI can do for their business. |
| Communication | Connecting people, ideas and business needs. | Translating AI into client workshops and presentations. Building the voice and brand of Nós. |
| Execution | Moving projects from concept to reality. | Mentors, judges, participants and 20+ projects, delivered end to end. A community built from an idea. |

### 04 · Beyond work
- **Headline:** The things I build *on my own time.*
- **Lede:** Same instincts, different setting: an idea, a community, and the work of making it real.
- **Nós** (Independent project · Co-founder): A community and in-person experience for women in Porto Alegre — co-founded and built from an idea.
  Nós — Portuguese for both "us" and "knots" — is a community for women in Porto Alegre, built around in-person experiences, events and the connections that come out of them.
  What I do: Experience design · Community · Events · Partnerships · Branding · Communication & content · Audience experience
  CTAs: Read the story → · `[[@instagram]]` ↗
- **Also on my mind:** 3 slots `[[placeholder]]` para interesses/projetos criativos.

### 05 · Contact
- **Headline:** Let's build something *interesting.*
- **Lede:** I'm open to conversations about strategic projects, innovation, brand and product marketing, communications, and international work — especially where technology and people meet.
- Linhas: LinkedIn → "Connect on LinkedIn ↗" · Email → `[[seu email]]` + botão "Copy email"

### Footer
Beatriz Tramontin · Strategy, innovation & communication — across borders. · © ano · `[[Cidade]]` · Back to top ↑

---

## 3. Headlines e subheadlines (resumo)

| Seção | Headline | Subheadline |
|---|---|---|
| Hero | I turn ideas into things that *happen.* | Strategy · Innovation · Communication · Technology |
| About | A career built in the *spaces between.* | International Relations taught me how different systems learn to work together… |
| Work | Complex things, *given structure.* | Three projects, one pattern… |
| Across borders | Four countries. One program. *Many ways of working.* | Different markets, different rhythms, one shared outcome. |
| How I work | Four things I bring *to any project.* | Not adjectives — habits. |
| Beyond | The things I build *on my own time.* | Same instincts, different setting. |
| Contact | Let's build something *interesting.* | Open to conversations about… |

Padrão tipográfico: a segunda metade de cada headline vem em **itálico serif na cor de destaque**. Vira uma assinatura visual reconhecível em todo o site.

## 4. CTAs

| Local | CTA | Destino |
|---|---|---|
| Hero | **View my work ↓** (primário, sólido) | #work |
| Hero | About me (contorno) | #about |
| Hero / Nav | LinkedIn ↗ | perfil `[[placeholder]]` |
| Projetos | Read the case → | /work/… |
| Nós | **Read the story →** · @instagram ↗ | /work/nos · Instagram |
| Case study | ← All work · **Next case →** | home / próximo case |
| Contact | Connect on LinkedIn ↗ · email → · Copy email | — |

## 5. Layout por seção (desktop, grid de 12 colunas)

- **Nav:** fixa, transparente no topo. Depois de 24px de scroll ganha fundo marfim translúcido com blur. Esconde ao rolar para baixo e volta ao rolar para cima.
- **Hero:** ocupa 100% da altura da tela. Headline serif enorme nas colunas 1–9, retrato 3:4 nas colunas 10–12. Intro + CTAs embaixo, faixa de status em 3 colunas separada por um fio fino.
- **Section header (padrão):** fio fino no topo; "01 —— ABOUT" nas colunas 1–3; headline + lede nas colunas 4–12.
- **About:** foto + ficha de fatos (1–4) | narrativa + citação com fio terracota (6–12). Linha do tempo horizontal de 4 passos no fim da seção.
- **Work:** o projeto destaque tem capa 16:9 de ponta a ponta, título grande à esquerda e métricas à direita. Os demais vêm em linha editorial, com imagem de 7 colunas e texto de 4, alternando o lado.
- **Across borders:** faixa charcoal de largura total (a única mudança de ritmo do meio da página). Intro à esquerda e "livro-razão" de regiões à direita.
- **How I work:** 4 colunas com fio no topo, que fica terracota no hover. Número, título serif, linha e "In practice" alinhados por subgrid.
- **Beyond:** imagem do Nós (1–7) + título "Nós" gigante e texto (9–12). Métricas e galeria de 3 imagens quadradas embaixo. "Also on my mind" em 3 colunas.
- **Contact:** fundo charcoal, headline enorme, links como linhas grandes de tabela.
- **Case study:** cabeçalho com título display + ficha (Role/Scope/Org/Year). Capa, métricas, capítulos em 2 colunas (rótulo | texto), citação central em itálico, galeria, competências e "Next case" em tamanho display.

## 6. Direção visual

**"Revista de estratégia, não site corporativo."** A referência é a diagramação editorial de revistas e de estúdios de brand strategy: muito espaço em branco, tipografia grande fazendo o papel de imagem, fios finos (hairlines) no lugar de caixas e cards, e números como protagonistas.

- Sem gradientes, sem sombras, sem ícones decorativos (só setas tipográficas ↗ → ↓).
- Pouquíssimos "cards": os projetos são linhas editoriais, não uma grade de caixinhas.
- Uma única faixa escura no meio (Across borders) e o fechamento escuro (Contact) dão ritmo.
- O feminino aparece na serif com itálico expressivo e na cor terracota, sem rosa, sem floral.

## 7. Paleta

| Token | Hex | Uso |
|---|---|---|
| Paper (ivory) | `#F4F0E8` | fundo principal |
| Paper 2 (sand) | `#EBE5D9` | placeholders, hover |
| Line | `#D6CEBF` | fios/hairlines |
| Ink (charcoal) | `#1B1A18` | texto, faixas escuras |
| Ink 2 | `#3B3935` | texto corrido |
| Muted | `#6F6A62` | legendas, rótulos (contraste 4.7:1) |
| **Accent: Terracotta** | `#A8431F` | *a única cor de destaque*: itálicos das headlines, números de seção, detalhes (contraste 5.3:1 no marfim) |
| Accent on ink | `#E2825C` | a mesma terracota, clareada para fundos escuros |

**Por que terracota:** é quente e humana sem ser "feminina clichê", tem cara de editorial/internacional e se afasta completamente do azul corporativo de tech (e da SAP).

## 8. Tipografia

- **Headlines:** *Instrument Serif* (regular + itálico). Serif editorial condensada, elegante e contemporânea. O itálico é o gesto de marca.
- **Texto e UI:** *Instrument Sans* (variável). Sans limpa, desenhada para parear com a serif.
- As fontes são auto-hospedadas via Fontsource (sem chamadas ao Google, carregamento rápido).

| Nível | Tamanho (fluido) | Uso |
|---|---|---|
| Display | 50 → 140px | headline do hero, títulos de case |
| H2 | 40 → 84px | headlines de seção |
| H3 | 30 → 48px | títulos de projeto |
| H4 | 22 → 30px | subtítulos, taglines |
| Lede | 21 → 27px (serif) | introduções |
| Body | 16 → 17.4px | texto corrido |
| Label | 12px, CAPS, tracking 0.12em | rótulos e metadados |

## 9. Microcopy

- Nav: "Menu" / "Close" (mobile), "Skip to content" (acessibilidade)
- Projetos: "Read the case →", "Challenge", "Skills"
- Case: "← All work", "Context", "My role", "The challenge", "What I did", "Impact", "Skills in play", "Next case"
- Pilares: "In practice"
- Nós: "Independent project · Co-founder", "What I do", "Read the story →"
- Contato: "Copy email" → "Copied ✓"
- Footer: "Back to top ↑"
- Placeholders de imagem: "PHOTO · 16:9" + descrição exata da foto

## 10. Animações e interações

Todas são sutis, rápidas e desligadas automaticamente com `prefers-reduced-motion`.

- **Entrada do hero:** os blocos sobem 28px com fade, em cascata (CSS puro, sem JS).
- **Reveal no scroll:** elementos marcados com `data-reveal` sobem e aparecem com stagger de 90ms (IntersectionObserver).
- **Contagem dos números:** +120%, 4 e 20+ contam de 0 até o valor ao entrarem na tela, com ease-out.
- **Links:** o sublinhado cresce da esquerda para a direita. As setas se deslocam 3–4px no hover.
- **Imagens de projeto:** zoom de 3% em 1.2s no hover.
- **Pilares:** o fio do topo vira terracota da esquerda para a direita no hover.
- **Nav:** some ao rolar para baixo e reaparece ao rolar para cima.
- **Menu mobile:** tela cheia, links serif grandes entrando em cascata.
- **Next case:** o fundo esquenta e o título fica terracota no hover.

Sugestões para uma v2: cursor customizado nos cards, transição de página com View Transitions API, marquee lento com os nomes dos países.

## 11. Imagens por projeto

Cada slot tem um placeholder no site com a descrição exata. Diretrizes gerais: fotos **reais**, luz natural, momentos espontâneos em vez de poses. Nada de stock. Desfoque telas, logos de clientes e informação confidencial.

| Local | Formato | Foto ideal |
|---|---|---|
| Hero | 3:4 | Retrato editorial, luz natural, fundo neutro (marfim/pedra/concreto), meio corpo, postura relaxada. Sem crachá ou fundo corporativo. |
| About | 4:3 | Você em ação: facilitando, apresentando, em sessão de trabalho. |
| Innovation Tournament: capa | 16:9 | Plano aberto do programa: palco/abertura, sala cheia, vários times. |
| Innovation Tournament: galeria | 4:3 / 3:4 | Mentores com um time · pitch/jurados · bastidores (você coordenando, cronograma) · foto de grupo multi-país. |
| SAP Business AI: capa | 16:9 | Você facilitando um workshop (quadro, post-its). Evite slides confidenciais e excesso de branding SAP. |
| SAP: galeria | 4:3 | Detalhe dos outputs do workshop · sessão com times de negócio/produto/tech. |
| Across borders | 16:9 / 4:3 | Encontro presencial com times de outros países · você em contexto numa viagem de trabalho · foto com o time multicultural. |
| Nós: capa | 4:3 | A melhor foto de um evento: mulheres juntas, luz quente, momento real. |
| Nós: galeria | 1:1 | Identidade visual (logo, posts, impressos) · detalhe do evento (mesa, kit, sinalização) · momento espontâneo da comunidade. |
| Social share | 1200×630 | `public/og.jpg`: retrato + nome sobre fundo marfim. |

Para adicionar uma foto: coloque o arquivo em `public/images/...` e preencha `src: 'images/...'` no slot correspondente em `site.ts`. O placeholder é trocado automaticamente pela imagem.

## 12. Desktop e mobile

**Desktop (≥ 961px):** grid de 12 colunas, largura máxima de 1400px, headlines muito grandes, layouts assimétricos (texto 4–5 colunas × imagem 7).

**Tablet (≤ 960px):** nav vira botão "Menu"; hero empilha (headline → intro → retrato → status); pilares em 2×2; linha do tempo em 2×2.

**Mobile (≤ 560–620px):**
- Tipografia fluida com `clamp()`: a headline do hero fica em ~50px e continua sendo o elemento dominante.
- Gutter lateral de 16px, sem scroll horizontal (testado em 390px).
- CTAs do hero ocupam a largura toda (área de toque ≥ 44px).
- Faixa de status vira lista de pares rótulo/valor.
- Linha do tempo vira vertical, com o fio à esquerda.
- Métricas empilham com o número grande à esquerda.
- Galeria do Nós: 1 imagem grande + 2 lado a lado.
- Menu em tela cheia com links serif grandes e fechamento com Esc.
- Animações mais curtas. O conteúdo é 100% legível sem JavaScript.

---

## Placeholders a preencher

Busque por `[[` em `src/content/site.ts`:

- **Links:** URL do LinkedIn · email · @ do Instagram do Nós
- **Pessoal:** cidade/país · idiomas de trabalho
- **Linha do tempo:** anos de cada etapa · cargo exato na SAP e ano de entrada
- **Innovation Tournament:** organização · ano · nomes dos 4 países
- **SAP Business AI:** nº de workshops · nº de apresentações · 1 resultado concreto
- **Across borders:** total de países · idiomas · mercados nas Américas · 1–2 outros exemplos de iniciativas internacionais
- **Nós:** ano de fundação · nº de eventos · mulheres alcançadas · parceiros
- **Beyond work:** 3 interesses/projetos criativos
- **Imagens:** todos os slots acima + `public/og.jpg`

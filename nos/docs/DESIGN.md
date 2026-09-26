# identidade visual no site

Baseado no manual **“nós: letras & logos & cores”**.

## cores

| nome | hex | uso |
| --- | --- | --- |
| verde nós | `#235c4c` | fundo de destaque (topo, fotos, rodapé), títulos, botões |
| creme | `#f1f1e5` | fundo principal, texto sobre o verde |
| lima | `#dded91` | detalhes: traço do logo, botões sobre o verde, “inscrições abertas” |
| rosa | `#e18fa6` | pontos de cor: o “nó”, datas, “últimas vagas” — usado com parcimônia |
| cinza claro | `#f3f4f7` | fundo alternativo das seções (como as páginas do manual) |
| texto | `#173d33` | verde bem escuro para leitura longa |

Editáveis sem código em **painel → textos, contato e cores → cores**. No código, estão em
`src/app/globals.css` (`:root`) e viram classes Tailwind (`bg-green`, `text-lime`, `text-pink`…).

## tipografia

| papel | manual | no site |
| --- | --- | --- |
| logo e títulos | Playfair Display Black Italic | **Playfair Display 900 itálico** (igual) |
| rótulos em caixa alta espaçada, texto corrido | Sanchez | **Sanchez** (igual) |
| subtítulos em itálico | TT Ramillas Italic | Playfair Display 400 itálico (TT Ramillas é paga) |
| frases manuscritas | Brittany Signature | Allison (Brittany é paga) |
| formulários e painel | — | Instrument Sans, para legibilidade |

Se vocês tiverem licença web da TT Ramillas e da Brittany, coloque os arquivos em `public/fonts/`,
declare com `@font-face` em `globals.css` e troque as variáveis `--font-script` / o `.italic-serif`.

## elementos da marca

- **logo “nós”** — vetor extraído do manual: `src/components/brand/Logo.tsx` (`<Logo />`), sempre em
  `currentColor` (muda de cor com `text-*`). Também em `public/brand/nos-logo.svg`.
- **o traço** antes do “nós” — aparece no logo completo (`<Lockup />`) e antes dos rótulos (`.dash`).
- **o rabisco / “nó”** — `public/brand/no-rabisco.svg` (`<Knot />`): marcadores de lista, selo girando
  na home, carregamento, menu, 404 (“deu nó.”).
- **“entre nós”** — a palavra “entre” em itálico sobre o logo, como no manual (hero da home e fim do *sobre*).

## princípios

- tudo em **lowercase**, inclusive “nós”;
- muito respiro, fotos grandes, composição assimétrica, pequenas rotações (nada “perfeito” demais);
- verde como base forte, creme para respirar, lima e rosa só como pontos de cor;
- microanimações suaves (entrada ao rolar, faixa de palavras, selo girando, zoom nas fotos) — todas
  desligadas automaticamente para quem prefere menos movimento (`prefers-reduced-motion`);
- fotos com um leve **granulado** e, no topo da home, tingidas de verde (duotone) para unificar.

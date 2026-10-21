# Coloridamente: design system e specs da landing

Fonte de verdade para o Senior Frontend Engineer. Tokens em `src/styles/theme.css` (nomes são contrato com `src/components/cinematic/**`). A copy em PT-BR deste documento é final.

## 1. Princípios
- Fotografia protagonista, muito espaço negativo, tudo alinhado à esquerda (exceção: capítulo 4 do hero, centralizado).
- Recurso assinatura: a **barra de cor**, faixa de controle de cor da gráfica com as 5 cores da logo (coral, olive, sun, mint, blush; ordem fixa, cantos vivos). **Barra = sequência/progresso** (hero, etapas). **Patch** (quadrado de 12px) = categoria. Fora disso, não aparece.
- Cores da logo só como preenchimento. Texto é sempre ink, ink-soft, paper ou paper-soft. Nada de paleta padrão do Tailwind (azul, `black`, `white`).
- Raio 2–6px (`rounded-xs|sm|md`; maiores não existem), sem sombras (o kit foi removido do tema), sem gradiente decorativo; só os véus funcionais do hero.
- Proibido: eyebrow, caixa-alta, palavra colorida/itálica no título, numeração fora das etapas, fade-up por seção, prazos, preços, quantidades, materiais não visíveis, depoimentos, contatos inventados.

## 2. Tokens
| Token | Valor | Uso | Contraste do par usado |
|---|---|---|---|
| `paper` | #FAF9F6 | fundo da página, texto sobre ink | ink sobre paper 14.7:1 |
| `ink` | #242424 | texto, contorno de controle, bloco de conversão | ink sobre studio 12.0:1 |
| `ink-soft` | #5C5A55 | texto secundário (nunca no hero) | 6.5:1 em paper, 5.3:1 em studio |
| `paper-soft` | #C9C7C2 | texto secundário sobre ink | 9.2:1 |
| `line` | ink 12% | fios, divisórias, trilho de progresso (ink/20% sobre o vídeo) | decorativo |
| `studio` | #E4E2DF | fundo do vídeo, placas dos stills | — |
| `sun` / `sun-deep` | #F9C848 / #F0B92A | CTA primário / hover-active | ink sobre sun 9.9:1, sobre sun-deep 8.6:1 |
| `coral` | #E98071 | patch "Agendas e cadernos" | ink sobre coral 5.8:1; coral em paper 2.6:1 (não é texto) |
| `olive` | #A7B571 | patch "Papelaria corporativa" | ink sobre olive 7.0:1 |
| `sun` | #F9C848 | patch "Brindes personalizados" | sun em paper 1.5:1 → patch leva `ring-1 ring-inset ring-ink/15` |
| `mint` | #A8DEC9 | patch "Impressão 3D" | mint em paper 1.4:1 → idem |
| `blush` | #F6AAA7 | `::selection` (ink sobre blush 8.3:1), barra | — |
| `font-display` / `font-sans` | Fraunces Variable / Figtree Variable | títulos / UI e texto | — |
| `ease-out-soft` / `ease-in-out-soft` | (.22,1,.36,1) / (.65,0,.35,1) | entradas e hover / trocas de estado | — |
| `spacing-header` | 60px; 72px ≥ lg | `h-header`, `pt-header`, `scroll-padding` | — |
| `spacing-section` / `spacing-gutter` | clamp(80→160px) / clamp(16→48px) | `py-section` / `px-gutter` | — |

Patches nunca são o único portador da informação: sempre acompanham o nome da categoria. Foco: `--focus-ring` = ink; `surface-ink` troca para sun (9.9:1 sobre ink).

## 3. Tipografia
| Utilitário | Fonte | Tamanho (375 → 1440px) | Entrelinha | Peso | Uso |
|---|---|---|---|---|---|
| `text-display-xl` | Fraunces | 40 → 72px | 1.02 | 460 | títulos dos capítulos do hero (cap. 1 é o único `h1`) |
| `text-display-lg` | Fraunces | 32 → 56px | 1.06 | 480 | títulos de seção (`h2`) |
| `text-display-md` | Fraunces | 22 → 28px | 1.18 | 540 | card, etapa, produto (`h3`), links do menu mobile |
| `text-lead` | Figtree | 18 → 21px | 1.5 | 400 | texto de apoio sob `h2` e no hero |
| `text-body` | Figtree | 16 → 17px | 1.6 | 400 | descrições |
| `text-small` | Figtree | 14px | 1.5 | 400/500 | nav, categoria no ProductCard, rodapé |

- Fraunces sempre com `'SOFT' 100, 'WONK' 0` (ecoa as serifas macias da logo); `opsz` automático. Ajuste por elemento via `[--fv-soft:50]`, nunca reescrevendo `font-variation-settings`.
- Sentence case em tudo. Botões: Figtree 600. Nav: Figtree 500. Números das etapas: `tabular-nums`.
- Medida: `measure` (65ch) em todo parágrafo; descrições de card `max-w-[44ch]`; etapas `max-w-[32ch]`. Títulos com `text-wrap: balance` (já na base).

## 4. Grid e espaço
- `container-page`: máx. 1360px, gutter 16px (mobile) → 48px. Colunas: 4 (< md, gap 16) / 8 (md, gap 24) / 12 (≥ lg, gap 32).
- Escala de espaço (base 4px): 4, 8, 12, 16, 20, 24, 32, 48, 64, 96, 128. Entre seções: `py-section`. Título → conteúdo: `mt-12 lg:mt-16`. Imagem → título: `mt-5`. Título → descrição: `mt-2`. Descrição → link: `mt-4`.
- Âncoras: `#o-que-criamos`, `#como-funciona`, `#produtos`, `#orcamento`. `html` já tem `scroll-padding-top: var(--spacing-header)`.
- Z-index: header 50, menu mobile 60, skip link 70. Imagens: sempre `width`/`height` ou `aspect-*` (zero CLS), `<picture>` AVIF + WebP.

## 5. Componentes
**Skip link**: "Pular para o conteúdo" → `#conteudo` (`<main>`), `sr-only focus:not-sr-only`, fundo paper, borda ink.

**Header** (`fixed inset-x-0 top-0 z-50 h-header`)
- Sobre o hero: fundo transparente, sem fio. Após o fim do hero (IntersectionObserver em sentinela): `bg-paper border-b border-line`, transição de `background-color` 240ms `ease-out-soft`.
- ≥ lg: logo (`/brand/logo-coloridamente.svg`, altura 44px, `width=108 height=44`, link para o topo, alt "Coloridamente") | nav `aria-label="Principal"` com `site.nav`, Figtree 500 15px, gap 32px, TextLink sem sublinhado em repouso | Button secundário compacto "Solicitar orçamento".
- < lg: logo 34px + botão "Menu" (mín. 44×44, texto visível "Menu", `aria-expanded`, `aria-controls="menu-mobile"`).
- Menu mobile: painel `fixed inset-0 z-60 bg-paper`; topo com logo + botão "Fechar"; lista `site.nav` em `text-display-md`, itens `min-h-14` com `border-b border-line`; base com Button primário "Solicitar orçamento" `w-full`. Esc fecha; foco preso; foco inicial no 1º link e de volta ao "Menu" ao fechar; scroll do documento travado; clicar num link fecha e navega.

**Button** (todo link de WhatsApp: `whatsappUrl()`/`productMessage()`, `target="_blank" rel="noopener noreferrer"`, sufixo `sr-only` " (abre o WhatsApp)")
| Variante | Repouso | Hover | Active | Focus-visible |
|---|---|---|---|---|
| Primário | `bg-sun text-ink`, Figtree 600 16px, `min-h-12 px-6 rounded-sm`, seta em `<span aria-hidden>` com gap 10px | `bg-sun-deep`, seta `translate-x-1` | `bg-sun-deep translate-y-px` | outline 2px `--focus-ring`, offset 3px |
| Secundário | transparente, `border-[1.5px] border-ink text-ink`, Figtree 600 15px, `h-10 px-4 rounded-sm` (h-12 fora do header) | `bg-ink text-paper` | `translate-y-px` | idem |
| TextLink | ink, Figtree 500, `underline decoration-1 underline-offset-4 decoration-ink/40` | `decoration-ink decoration-2` | — | idem |
A seta "→" existe só nos dois CTAs fixados pelo briefing; nenhum outro link leva seta.

**CategoryCard** (`<article class="group relative">`)
- Figura `aspect-[4/3] bg-studio rounded-xs overflow-hidden`; `<picture>` do still (768/1280), `object-cover object-[44%_50%]` (esconde a marca d'água do canto inferior direito; não altere), `sizes="(min-width:1024px) 76vw, 134vw"`, `loading="lazy"`.
- Linha `mt-5 flex items-center gap-3`: patch `h-3 w-3 rounded-[1px] ring-1 ring-inset ring-ink/15 bg-{cor}` + `h3.text-display-md`.
- `p.text-body.text-ink-soft max-w-[44ch] mt-2`; TextLink "Solicitar orçamento" `mt-4` com `::after absolute inset-0` (card todo clicável, um único tab stop), `aria-label="Solicitar orçamento de {título} pelo WhatsApp"`, href `whatsappUrl(productMessage(título))`.
- Cor → classe por mapa literal (`{ coral: 'bg-coral', … }`), nunca interpolação de string.

**ProcessStep** (`<ol role="list">` de 4 `<li>`)
- Barra: `color-bar color-bar-fill h-1` cobrindo as 4 colunas (desktop) ou vertical `w-1` à esquerda (mobile: `[--bar-angle:180deg] [--bar-from:inset(0_0_100%_0)]`).
- Cada etapa: tique ink 2×12px pendurado na barra no início da coluna; número ("1"–"4", Fraunces `text-display-md tabular-nums`); `h3.text-display-md`; `p.text-body.text-ink-soft max-w-[32ch] mt-2`. Única numeração da página (é sequência real).

**ProductCard** (`<li>` em `<ul role="list">`)
- Figura `aspect-[4/3] bg-paper isolate overflow-hidden`; `<img>` `object-contain mix-blend-multiply` (o fundo branco da foto some no papel), `width`/`height` do `images-manifest.json`, srcset 480/800/1200.
- `sizes`: largo `(min-width:1024px) 46vw, (min-width:640px) 50vw, 100vw`; regular `(min-width:1024px) 31vw, (min-width:640px) 50vw, 100vw`.
- `h3.text-display-md mt-4`; `p.text-body.text-ink-soft max-w-[46ch] mt-2`; rodapé `mt-4 flex flex-wrap items-center justify-between gap-3`: patch + nome da categoria (`text-small text-ink-soft`) | TextLink "Solicitar orçamento" (`productMessage(nome)`, `aria-label="Solicitar orçamento de {nome} pelo WhatsApp"`).
- Dados em `src/data/categories.ts` e `src/data/products.ts`: `{ id, name, description, category, image: { name, width, height, alt } }`. Novo produto = nova linha; foto com fundo branco liso. Sem filtros até 8 itens.

**Bloco de conversão** (`<section id="orcamento" class="surface-ink py-section">`): `h2.text-display-lg` (cols 1–7) | coluna 8–12 alinhada à base: `p.text-lead.text-paper-soft measure`, Button primário `mt-8`, `p.text-small.text-paper-soft mt-4`.

**Footer** (`bg-paper pt-16 pb-10`): logo 56px | nav `aria-label="Rodapé"` (lista vertical, TextLink sem sublinhado em repouso) | TextLink de WhatsApp. Base `mt-12 pt-6 border-t border-line text-small text-ink-soft`. Ano via `new Date().getFullYear()`.

## 6. Seções (layout, wireframe, copy final)
**Hero** (implementado pelo motion; documentado aqui). Canvas pinned ~400vh, 4 capítulos, fundo studio. Desktop: texto em cols 1–5, centrado na vertical, véu `linear-gradient(90deg, rgb(228 226 223/.9) 0, rgb(228 226 223/.65) 38%, transparent 62%)`. Cap. 4: texto centralizado no alto (`pt-header` + 8vh), véu `linear-gradient(180deg, rgb(228 226 223/.9) 0, transparent 45%)`. No hero todo texto é ink (o véu sobre objetos pretos derruba o ink-soft abaixo de AA). Progresso: 4 segmentos 40×3px (mobile 32×3), gap 6px, trilho ink/20%; cada segmento mostra sua fatia de uma barra contínua (`bg-size:400% 100%`, `bg-position-x: 0 / 33.33% / 66.67% / 100%`), revelada com `scaleX` origem à esquerda; `aria-hidden`. Mobile: canvas sticky no topo (58svh), texto abaixo sobre studio, progresso sob o canvas. Reduced motion: sem pin, os 4 capítulos legíveis em sequência sobre stills.
```
DESKTOP                                                MOBILE
[logo]          O que criamos  Como funciona  … [Solicitar orçamento]   [logo]           [Menu]
░░░░░░░░░░░░░░ véu                                     ┌───────────────────┐
H1 display-xl (cols 1–5)        (frame do vídeo)       │  canvas 58svh     │
lead                                                   └───────────────────┘
▬ ▬ ▬ ▬  progresso                                     ▬ ▬ ▬ ▬   H1 + lead
```
| Cap. | Título (`text-display-xl`) | Apoio (`text-lead`) |
|---|---|---|
| 1 (`h1`) | Sua marca merece sair do comum. | Criamos produtos personalizados que transformam ideias em algo único. |
| 2 | Cada detalhe carrega a sua identidade. | Agendas, cadernos e materiais feitos para representar sua empresa. |
| 3 | Criatividade que ganha forma. | Design, funcionalidade e personalidade em cada criação. |
| 4 | Sua ideia. Nossa criatividade. | Produtos personalizados para valorizar a sua marca. CTA primário: **Quero personalizar meus produtos →** |
Copy dos capítulos fixada pelo briefing (literal, não alterar).
Rótulo do canvas (`role="img"`): "Caderno de espiral com capa personalizada se abre e dá lugar a uma agenda e a objetos de mesa pretos."

**A. O que criamos** (`#o-que-criamos`). `h2` + `text-lead` em cols 1–6. Grid lg: linha 1 = card largo cols 1–7 + card estreito cols 9–12 com `lg:mt-28`; linha 2 = estreito cols 1–5 + largo cols 7–12 com `lg:mt-28`; `gap-y-20`. md: 2 colunas, a da direita com `mt-16`. Mobile: 1 coluna, `gap-y-14`.
```
DESKTOP                                          MOBILE
O que criamos (h2)        lead                   O que criamos / lead
[▓▓▓▓▓▓ still 4:3 ▓▓▓▓▓▓]   ...                  [▓▓▓ still 4:3 ▓▓▓]
■ Agendas e cadernos     [▓▓ still ▓▓]           ■ Agendas e cadernos
texto / Solicitar…       ■ Papelaria corporativa texto / Solicitar orçamento
[▓▓ still ▓▓]   [▓▓▓▓▓▓ still 4:3 ▓▓▓▓▓▓]         (… 4 cards empilhados)
```
Título: **O que criamos**. Apoio: "Produtos corporativos personalizados com a identidade da sua empresa, do papel aos objetos de mesa."
| Card | Patch | Still (`/frames/v1/stills/`) | Descrição | alt |
|---|---|---|---|---|
| Agendas e cadernos | coral | 0100 | Capa e páginas com a sua marca, em agendas diárias e cadernos pautados ou lisos. | Agenda de espiral aberta com páginas de horários e a marca AEA, com uma folha sendo virada. |
| Papelaria corporativa | olive | 0052 | Itens de papelaria com a identidade visual da empresa, para o uso da equipe e para entregar a clientes e parceiros. | Caderno de espiral fechado com capa branca e ondas em tons de azul. |
| Brindes personalizados | sun | 0240 | Combinações de papelaria e objetos de mesa com a sua marca, para presentear clientes, parceiros e equipes. | Agenda aberta com a marca AEA ao lado de porta-canetas, suporte de celular, organizador e bandeja pretos. |
| Impressão 3D | mint | 0160 | Objetos de mesa impressos em 3D, como porta-canetas, suporte de celular e bandejas. | Porta-canetas canelado com duas canetas, suporte de celular e bandeja pretos ao lado de um caderno aberto. |

**B. A sua marca, do seu jeito** (`#como-funciona`). `h2` cols 1–6, `text-lead` cols 8–12 alinhado à base. Barra + 4 colunas iguais (lg) / lista vertical com barra à esquerda e `pl-8` (mobile).
```
DESKTOP                                                    MOBILE
A sua marca, do seu jeito (h2)            lead             ▐ 1 Sua ideia
████████████████████████████████████████ barra (scroll)    ▐   texto
|1 Sua ideia   |2 Personalização |3 Produção |4 Produto final ▐ 2 Personalização …
 texto          texto             texto       texto        ▐ 4 Produto final
```
Apoio: "Um caminho simples, do primeiro contato ao produto pronto com a sua marca."
1. **Sua ideia**: Você conta pelo WhatsApp o que precisa: o tipo de produto, para quem é e como imagina o resultado.
2. **Personalização**: Definimos juntos como a sua marca entra no produto: capa, páginas, cores e detalhes.
3. **Produção**: Com tudo definido, o seu pedido segue para a produção.
4. **Produto final**: Os produtos ficam prontos com a sua marca, para usar no dia a dia ou presentear.

**C. Produtos em destaque** (`#produtos`). `h2` + `text-lead` cols 1–6. Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-x-6 lg:gap-x-8 gap-y-14 lg:gap-y-20`; itens de índice `i % 5 ∈ {0,1}` = largo (`lg:col-span-3`), demais `lg:col-span-2`. Após o grid, `mt-16`: TextLink "Procura outro produto? Conte a sua ideia pelo WhatsApp." (`whatsappUrl()`).
```
DESKTOP                                        MOBILE
Produtos em destaque (h2) / lead               Produtos em destaque / lead
[  agenda-2027 4:3  ] [ kit 3D 4:3 ]           [ foto 4:3 ] nome / texto
[ capa ]  [ pautado ]  [ liso ]                ■ categoria   Solicitar orçamento
Procura outro produto? …                        (… 5 itens empilhados)
```
Apoio: "Exemplos de produtos personalizados com a identidade visual de uma empresa." Ordem dos dados = ordem da tabela.
| Imagem (`/images/products/`) | Categoria | Nome | Descrição | alt |
|---|---|---|---|---|
| agenda-2027 | Agendas e cadernos | Agenda 2027 | Agenda diária com horários, minicalendário do mês e quadro de anotações, com a marca na capa. | Agenda de espiral aberta nos dias 1 e 2 de janeiro, com horários e quadro de anotações, ao lado da capa "Agenda 2027" com a marca AEA Contabilidade Consultiva. |
| kit-mesa-impressao-3d | Impressão 3D | Kit de mesa em impressão 3D | Suporte de celular, porta-lápis, bandeja oval e porta-clipes em preto, com acabamento canelado. | Suporte de celular com um telefone, porta-lápis com dois lápis, bandeja oval com óculos e caneta e porta-clipes, todos pretos e canelados. |
| caderno-espiral-capa | Agendas e cadernos | Caderno com capa personalizada | Capa branca com a marca e ondas em tons de azul, com encadernação em espiral. | Caderno de espiral branca com capa branca, a marca AEA Contabilidade Consultiva ao centro e ondas em tons de azul na lateral. |
| caderno-aberto-pautado | Agendas e cadernos | Caderno pautado personalizado | Folhas pautadas com a marca no topo e o grafismo da capa nos cantos. | Caderno de espiral aberto com folhas pautadas, a marca AEA no alto de cada página e ondas azuis nos cantos inferiores. |
| caderno-aberto-liso | Agendas e cadernos | Caderno liso personalizado | Folhas sem pauta com a marca no topo e o grafismo da capa nos cantos. | Caderno de espiral aberto com folhas lisas, a marca AEA no alto de cada página e ondas azuis nos cantos inferiores. |

**D. Conversão** (`#orcamento`, único bloco escuro)
```
DESKTOP                                                  MOBILE
Vamos criar algo com a      Conte o que você precisa…    Vamos criar algo com a sua marca?
sua marca? (cols 1–7)       [Solicitar meu orçamento →]  texto / [CTA w-full] / nota
                            O atendimento é feito…
```
Título: **Vamos criar algo com a sua marca?** Texto: "Conte o que você precisa e vamos transformar sua ideia em um produto personalizado." CTA: **Solicitar meu orçamento →** (`whatsappUrl()`; `w-full` < sm). Nota: "O atendimento é feito pelo WhatsApp."

**E. Rodapé**
```
DESKTOP                                                 MOBILE
[logo 56px]    O que criamos        Fale com a gente    [logo]
               Como funciona        pelo WhatsApp       nav (lista) / WhatsApp
               Produtos / Orçamento                     ─────────
────────────────────────────────────────────────        © 2026 Coloridamente. …
```
Nav: `site.nav`. Contato: "Fale com a gente pelo WhatsApp" (`whatsappUrl()`). Base: "© {ano} Coloridamente. Produtos corporativos personalizados." Logo alt: "Coloridamente".

## 7. Microinterações
| Elemento | Gatilho | Efeito | Duração / easing | Reduced motion |
|---|---|---|---|---|
| Botão primário | hover / active | `bg-sun-deep`; seta +4px / `translate-y-px` | 160ms cor, 240ms seta, `ease-out-soft` / 80ms | só a cor muda |
| Botão secundário, TextLink | hover | inverte para ink / sublinhado 1→2px e ink 100% | 160ms `ease-out-soft` | igual (sem movimento) |
| CategoryCard | hover, `focus-within` | patch 12→40px de largura (vira barra); imagem `scale-[1.03]` | 400ms / 600ms `ease-out-soft` | patch muda sem transição; sem escala |
| ProductCard | hover, `focus-within` | imagem `scale-[1.02]` | 600ms `ease-out-soft` | sem escala |
| Header | sair do hero | transparente → paper + fio | 240ms `ease-out-soft` | instantâneo |
| Menu mobile | abrir / fechar | fade + `translate-y` −8px→0 / fade | 240ms `ease-out-soft` / 160ms `ease-in-out-soft` | sem transição |
| Barra das etapas | scroll | preenche da esquerda (ou do topo) via `color-bar-fill` | ligada ao scroll | já estática e cheia |
Nada de fade/slide de entrada por seção; o tema já zera transições e animações com `prefers-reduced-motion: reduce`.

## 8. Critérios de aceitação
- [ ] Só tokens do tema: nenhum hex solto, `black`/`white`/`blue-*`, `shadow-*`, `rounded-lg+` ou gradiente fora dos véus do hero e da `color-bar`.
- [ ] Um único `h1` (capítulo 1 do hero); `h2` por seção com `aria-labelledby`; `h3` em cards e etapas.
- [ ] Texto ≥ 4.5:1 (pares da §2); texto colorido com cores da logo não existe; patch sempre com nome ao lado.
- [ ] Foco visível em todo elemento interativo (ink em claro, sun em `surface-ink`); ordem de tab = ordem visual; skip link funciona.
- [ ] Menu mobile: Esc, foco preso, retorno de foco, `aria-expanded`, scroll travado; alvos ≥ 44×44px.
- [ ] Todos os CTAs usam `whatsappUrl()`/`productMessage()`, abrem em nova aba e anunciam "(abre o WhatsApp)"; nenhum número no código.
- [ ] Copy idêntica a este documento; nenhum prazo, preço, quantidade, material não visível, depoimento ou contato.
- [ ] Toda imagem com `alt` da tabela, `width`/`height` ou `aspect-*`, AVIF + WebP, `loading="lazy"` abaixo da dobra; CLS ≈ 0.
- [ ] Stills em 4:3 com `object-[44%_50%]`: marca d'água não aparece em 320, 768, 1024 e 1440px.
- [ ] Fotos de produto sem retângulo visível sobre o papel (`mix-blend-multiply`).
- [ ] 320px sem rolagem horizontal; gutter ≥ 16px; linhas de texto < 80ch.
- [ ] Header 60/72px; âncoras não ficam sob o header.
- [ ] `prefers-reduced-motion`: sem escala, sem pin, barra estática; conteúdo do hero completo.
- [ ] Galeria renderiza a partir de `src/data/products.ts`; adicionar um item não exige mexer em JSX.

## 9. Revisão "isto parece template?"
- Risco "fundo creme + serifa + terracota": o coral virou uma das 5 cores de categoria (não é acento); o CTA é sun; a Fraunces roda em SOFT 100, macia como a logo, não como serifa editorial de alto contraste.
- Risco "kit de cards SaaS": as categorias são figuras sem caixa num grid assimétrico 7/5 com deslocamento; os produtos se dissolvem no papel em vez de ficarem em caixas arredondadas; o tema remove os raios acima de 6px e as sombras.
- Contestei a cor por etapa: colidiria com a cor por categoria. As etapas usam a barra contínua (sequência) e as categorias usam o patch (identidade). A barra saiu da conversão e do rodapé.
- A seção A usa stills do filme (placas studio, continua o hero) e a C usa as fotos de catálogo, para não repetir a mesma foto em seções vizinhas.
- A seta "→" fica só nos dois CTAs do briefing. Fora do hero, o único movimento que não depende de hover é o preenchimento da barra das etapas.

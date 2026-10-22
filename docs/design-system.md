# Coloridamente: design system das propostas 04 e 05

O site tem duas páginas, implementadas a partir das propostas 04 e 05 do showcase
"5 possibilidades. Uma identidade." (`Coloridamente_Propostas_de_Site.pdf`):

| Página | URL | Proposta | Código |
| --- | --- | --- | --- |
| Institucional premium | `/` | 04 · "Confiança para fazer negócios." | `src/pages/institucional/` |
| Scroll cinematográfico | `/cinematografico/` | 05 · "Uma experiência memorável." | `src/pages/cinematografico/` |

Cabeçalho, rodapé, botões, etapas e fotos de produto são compartilhados (`src/components/shared/`).
Tokens em `src/styles/theme.css`.

## Paleta

Layout e tipografia seguem as propostas; a paleta é **off-white + grafite**, com o **coral da logo
como cor de ação** e as demais cores da marca só como acento (barra de cor, marcadores). Sem
domínio de verde ou amarelo.

| Token | Valor | Uso |
| --- | --- | --- |
| `paper` / `ink` / `soft` | #FAF9F5 / #262624 / #5C5B57 | base clara, texto, texto secundário (6,6:1) |
| `card` / `line` | #EEEBE4 / #E6E3DC | moldura das fotos (raio 18px), fios |
| `graphite` / `graphite-deep` | #2A2927 / #1F1E1C | "Como funciona" (proposta 04), rodapé |
| `night` / `night-box` | #1F1E1C / #2B2A27 | palco e caixas da proposta 05 |
| `on-dark` | #E6E3DC | texto de apoio sobre grafite/night (11:1) |
| `coral` → `coral-deep` | #E98071 → #E06A58 | **todo CTA de orçamento** (texto ink, 5,7:1) |
| `blush-soft` | #FBE6E2 | faixa de fechamento |
| `mint-ink` | #ABDAD0 | contador "01 / 04" sobre night |
| barra de cor | coral, oliva, amarelo, menta, rosa | assinatura da marca |

Tipografia: **Lato** 400/700/900 (`text-display-1/2/3`, `text-lead`, `text-body`, `text-label`).
Cabeçalho claro com a **logo oficial** (`/brand/logo-coloridamente.svg`) nas duas páginas.

## Funil (as duas páginas)

1. **Atenção — hero:** promessa + "Solicitar orçamento" (WhatsApp) + "Ver produtos" e o número
   do WhatsApp visível. CTA também fixo no cabeçalho.
2. **Interesse — ocasiões (04):** boas-vindas à equipe, presentes para clientes, eventos e feiras,
   dia a dia do escritório; cada uma abre o WhatsApp com a ocasião na mensagem.
   Na 05, a história fixada termina com o CTA.
3. **Desejo — produtos:** 4 itens (um caderno pautado, com a opção sem pauta no texto), cada um
   com "Quero orçamento deste" e o nome do item na mensagem.
4. **Confiança — como funciona:** 4 etapas e CTA "Comece pelo primeiro passo".
5. **Objeções — dúvidas:** acordeão nativo (sem prazos, preços ou quantidades inventados).
6. **Ação — fechamento:** "Vamos criar algo com a sua marca?" + CTA + número.
7. **Mobile:** barra fixa "Solicitar orçamento pelo WhatsApp" fora do hero/história e do fechamento.

## Proposta 04 — Institucional premium (`/`)

Hero claro com etiqueta, título "Uma marca forte / também se vê / nos detalhes.", foto da agenda
em moldura `card`, barra de cor e "Papelaria / Corporativo / Acessórios para escritório";
entrada orquestrada uma vez no carregamento.

## Proposta 05 — Scroll cinematográfico (`/cinematografico/`)

História fixada (pin de 3 telas): contador "01 / 04", 4 fotos que trocam com cortina e aproximação,
caixa sobreposta montando "Quando a sua / marca ganha / forma." linha a linha, texto de apoio e CTA
na 4ª etapa, traços coral de progresso e paralaxe (GSAP ScrollTrigger). Sem movimento: sem pin,
título completo e as 4 fotos em grade. Depois: produtos em sequência, etapas, dúvidas e fechamento.

## Regras

- Todo CTA usa `whatsappUrl()` / `productMessage()` (`src/config/site.ts`), abre em nova aba e
  anuncia "(abre o WhatsApp)".
- Um único h1 por página; linhas visuais do título separadas por espaço para leitores de tela.
- Imagens com `alt`, `width`/`height`, AVIF/WebP responsivos; sem rolagem horizontal de 320 a 1440px.
- As fotos com a marca AEA são exemplos de personalização para um cliente.
- Todo CTA de orçamento é coral (ou grafite sobre fundos coloridos); nenhum outro elemento usa o coral como fundo.
- Os vídeos de produto em `video/` são para redes sociais e não entram no site.

# Coloridamente: design system das propostas 04 e 05

O site tem duas páginas, implementadas a partir das propostas 04 e 05 do showcase
"5 possibilidades. Uma identidade." (`Coloridamente_Propostas_de_Site.pdf`):

| Página | URL | Proposta | Código |
| --- | --- | --- | --- |
| Institucional premium | `/` | 04 · "Confiança para fazer negócios." | `src/pages/institucional/` |
| Scroll cinematográfico | `/cinematografico/` | 05 · "Uma experiência memorável." | `src/pages/cinematografico/` |

Cabeçalho, rodapé, botões, etapas e fotos de produto são compartilhados (`src/components/shared/`).
Tokens em `src/styles/theme.css`.

## Tokens

| Token | Valor | Uso |
| --- | --- | --- |
| `forest` / `forest-deep` | #30443B / #263730 | fundo da proposta 04 / rodapé |
| `night` / `night-box` | #202622 / #252D29 | fundo da proposta 05 / caixa de texto e blocos alternados |
| `paper` / `ink` / `soft` | #FAF9F5 / #262924 / #575B53 | seções claras (soft = texto secundário, 6,9:1) |
| `mist` / `haze` | #E1E9E1 / #D2DDD4 | texto de apoio sobre forest (8,4:1) / night (11,6:1) |
| `mint-ink` | #ABDAD0 | contadores e rótulos sobre night |
| `sun-soft` → `sun` | #F4CF6E → #F9C848 | CTA principal ("Solicitar proposta"), hover |
| `coral-btn` → `coral` | #E89481 → #E98071 | pílula "Orçamento", traços de progresso |
| `card` | #E9E8E2 | moldura das fotos (raio 18px, foto interna raio 4px) |
| barra de cor | coral, oliva, amarelo, menta, rosa | assinatura da marca (rodapé, orçamento) |

Tipografia: **Lato** 400/700/900. `text-display-1` (h1, 40→76px, 900), `text-display-2` (h2),
`text-display-3` (h3), `text-lead`, `text-body`, `text-label` (12px, 700, caixa-alta, tracking 0,12em,
usado como nas propostas: etiqueta do hero, categorias, contadores).

## Proposta 04 — Institucional premium (`/`)

1. **Hero (forest):** etiqueta "Produtos personalizados para empresas" em pílula translúcida;
   h1 "Uma marca forte / também se vê / nos detalhes." (Lato 900, branco); apoio em `mist`;
   pílula amarela "Solicitar proposta ↗" (WhatsApp); foto da agenda (raio 6px) com fio e
   "Papelaria / Corporativo / Impressão 3D". Entrada orquestrada uma vez no carregamento
   (wipe da etiqueta, linhas do título subindo da máscara, foto assentando, fio desenhando, CTA).
2. **Sobre (paper):** h2 + texto + 3 pilares (papelaria, brindes, acessórios de mesa).
3. **Produtos (paper):** galeria orientada a dados (`src/data/products.ts`), 2 em destaque + 3.
4. **Como funciona (forest):** 4 etapas numeradas (sequência real).
5. **Orçamento (sun):** "Vamos criar algo com a sua marca?" + pílula grafite.
6. **Rodapé (forest-deep):** logo oficial, navegação, link para a outra página, WhatsApp.

## Proposta 05 — Scroll cinematográfico (`/cinematografico/`)

1. **História fixada (night, pin de 3 telas):** contador "01 / 04" em menta; cartão de foto
   (`card`) com 4 produtos que trocam com cortina de baixo para cima e aproximação (escala 1,22→1);
   caixa `night-box` sobreposta à esquerda montando "Quando a sua / marca ganha / forma." linha
   a linha e, na 4ª etapa, "Uma experiência para descobrir cada detalhe enquanto você navega.";
   "Role para explorar ↓"; 4 traços coral que preenchem por etapa; camadas em velocidades
   diferentes (paralaxe). GSAP ScrollTrigger com scrub. Sem movimento (`prefers-reduced-motion`):
   sem pin, título completo e as 4 fotos em grade.
2. **Produtos (night):** sequência alternada cartão/texto com contador "01 / 05", entrada por scroll.
3. **Como funciona (night-box)**, **Orçamento (night)**, **Rodapé (night-box)**.

## Regras

- Todo CTA usa `whatsappUrl()` / `productMessage()` (`src/config/site.ts`), abre em nova aba e
  anuncia "(abre o WhatsApp)".
- Um único h1 por página; linhas visuais do título separadas por espaço para leitores de tela.
- Imagens com `alt`, `width`/`height`, AVIF/WebP responsivos; sem rolagem horizontal de 320 a 1440px.
- As fotos com a marca AEA são exemplos de personalização para um cliente.
- Os vídeos de produto em `video/` são para redes sociais e não entram no site.

# Coloridamente — landing page

Site da Coloridamente (produtos personalizados para empresas) com duas páginas, a partir das
propostas 04 e 05 do showcase de site. O objetivo é gerar pedidos de orçamento pelo WhatsApp.

| Página | URL | Proposta |
| --- | --- | --- |
| Institucional premium | `/` | 04 |
| Scroll cinematográfico | `/cinematografico/` | 05 |

Stack: React 19 + TypeScript + Vite 8 (multipágina) + Tailwind CSS v4 + GSAP/ScrollTrigger.
Design system e especificações: [`docs/design-system.md`](docs/design-system.md).

## Rodar localmente

```bash
npm install
npm run dev                  # http://localhost:5173
npm run build && npm run preview
```

## Configuração

| Variável | Obrigatória | Uso |
| --- | --- | --- |
| `VITE_WHATSAPP_NUMBER` | Sim, no build da Cloudflare | Número comercial com DDI e DDD, só dígitos. O padrão atual está em `.env` (versionado). Uma variável com o mesmo nome no painel da Cloudflare tem prioridade. Se ficar vazio, o build na Cloudflare falha de propósito, para nunca publicar CTAs sem destino. |
| `VITE_SITE_URL` | Não | URL pública final (sem `/` no fim). Gera `canonical`, `og:url`, `og:image` absoluta e `sitemap.xml`. |

A mensagem padrão do WhatsApp e a navegação ficam em `src/config/site.ts`.

## Produtos e categorias

Os produtos da galeria ficam em `src/data/products.ts`. Para incluir um item:

1. Coloque a foto original em `assets-src/products/<nome>.webp`.
2. Rode `npm run assets -- images` (gera AVIF/WebP em 480/800/1200 px).
3. Adicione o item em `src/data/products.ts` usando o mesmo `<nome>`.

## Estrutura

- `index.html` → `src/pages/institucional/` (proposta 04)
- `cinematografico/index.html` → `src/pages/cinematografico/` (proposta 05)
- `src/components/shared/`: cabeçalho, rodapé, pílulas, etapas, fotos de produto
- `src/data/`: produtos, categorias e etapas (conteúdo separado da apresentação)
- Imagens de compartilhamento: `npm run og` captura o hero de cada página em 1200×630.

Para regenerar fotos, logo e ícones: `npm run assets` (ffmpeg, ImageMagick, poppler-utils,
Python 3 e Chromium do Playwright; o build da Cloudflare não precisa deles).

## Vídeos (redes sociais)

`video/` guarda os vídeos de produto, o institucional 9:16 e o pipeline de pós-produção
([`video/README.md`](video/README.md)). Eles **não** são usados no site.

## Deploy na Cloudflare (Workers com assets estáticos)

O projeto é publicado como um Worker só de assets (`wrangler.toml` → `[assets] directory = "./dist"`).
No painel, em **Workers & Pages → projeto → Settings → Build**:

- Build command: pode ficar vazio (o `[build]` do `wrangler.toml` roda `npm run build` dentro do `wrangler deploy`)
- Deploy command: `npx wrangler deploy`
- Root directory: vazio
- Branch de produção: `main`

O número do WhatsApp vem do `.env`; uma variável `VITE_WHATSAPP_NUMBER` em **Build variables**
tem prioridade. Node 22 é detectado pelo `.nvmrc`.

Pela linha de comando:

```bash
npx wrangler login
npm run deploy
```

`public/_headers` define cache imutável para `/assets/*` e cabeçalhos de segurança;
URLs inexistentes servem `404.html`.

## Testes

```bash
npm run build
npm run test:e2e     # Playwright: desktop e mobile contra o build de produção
```

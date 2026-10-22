# Coloridamente — landing page

Landing page da Coloridamente (produtos personalizados para empresas) com uma sequência
cinematográfica frame a frame controlada pela rolagem. O objetivo da página é gerar pedidos
de orçamento pelo WhatsApp.

Stack: React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + GSAP/ScrollTrigger + Canvas.

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

## Sequência cinematográfica

A animação do topo usa a sequência vertical (9:16) montada a partir dos três vídeos de produto
(papelaria, bloco de mesa e acessórios). O pipeline completo, incluindo o vídeo institucional e o
master da animação, está em [`video/`](video/README.md):

- Frames: `public/frames/v3/` (WebP 12 fps, desktop 720×1280 e mobile 540×960, stills AVIF/WebP).
- Manifest: `src/data/scroll-manifest.json` (quantidade, caminhos e limites de cada cena).
- Textos e intervalos de cada capítulo: `src/data/chapters.ts`.

Para regenerar: `bash video/scripts/build-video.sh all` (aumente `FRAMES_VERSION` no script quando
o conteúdo mudar, para invalidar o cache imutável).

Os quadros estáticos da seção "O que criamos" vêm do vídeo horizontal anterior
(`assets-src/video-coloridamente.mp4` → `public/frames/v2/stills/`, via `npm run assets -- frames`).

Ferramentas necessárias só para regenerar assets: ffmpeg (libx264, libwebp, libaom-av1),
ImageMagick, poppler-utils, Python 3 e Chromium do Playwright. O build da Cloudflare não precisa delas.

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

`public/_headers` define cache imutável para `/frames/*` e `/assets/*` e cabeçalhos de segurança;
URLs inexistentes servem `404.html`.

## Testes

```bash
npm run build
npm run test:e2e     # Playwright: desktop e mobile contra o build de produção
```

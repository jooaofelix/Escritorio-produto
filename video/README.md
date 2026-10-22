# Vídeo institucional Coloridamente

Pós-produção dos três vídeos de produto em uma apresentação 9:16 para redes sociais
(os vídeos não são usados no site). Tudo é gerado por `video/scripts/build-video.sh` (ffmpeg) e pelas cenas de
`video/motion/` (renderizadas quadro a quadro no Chromium do Playwright).

## Entregas

| Arquivo | Uso | Formato |
| --- | --- | --- |
| `out/coloridamente-institucional.mp4` | Versão A: apresentações e redes sociais | 1080×1920, 30 fps CFR, H.264 High, ~18,7 s, áudio silencioso |
| `out/coloridamente-scroll-master.mp4` | Versão B: sequência só com os produtos | 1080×1920, 24 fps, H.264 High, ~13,6 s, sem áudio |

## Fontes

- `src/01-papelaria.mp4`, `src/02-bloco-de-mesa.mp4`, `src/03-acessorios.mp4`: vídeos originais (720×1280, 24 fps).
- Logo: `public/brand/logo-coloridamente.svg` (vetor original extraído do PDF oficial, sem alterações).

## Etapas

```bash
bash video/scripts/build-video.sh normalize      # recorte 9:16 sem marca d'água, 1080x1920, cor
bash video/scripts/build-video.sh master         # Versão B
bash video/scripts/build-video.sh frames         # sequência de frames WebP (opcional; o site não usa)
bash video/scripts/build-video.sh motion         # abertura e encerramento (Chromium)
bash video/scripts/build-video.sh institucional  # Versão A
bash video/scripts/build-video.sh all            # tudo, nessa ordem
```

Requisitos: ffmpeg com libx264, libwebp e libaom-av1; ImageMagick; Node com as dependências do
projeto (`npm install`) e o Chromium do Playwright.

## Decisões de edição

- **Recorte:** os três vídeos já são 9:16. Um recorte de 692×1230 (zoom 1,04×), preso ao topo, exclui
  a marca d'água "Dola AI" do canto inferior sem cortar nenhum produto. O zoom de 1,25–1,30× cortaria
  as bordas do bloco aberto, por isso não foi usado.
- **Cor:** o vídeo de acessórios tinha fundo bege; um ganho por canal o aproxima do off-white das
  outras cenas sem tingir os produtos pretos.
- **Transições:** abertura → papelaria e papelaria → bloco com dissolve "luminoso" (crossfade com leve
  elevação de luminância no meio, continuidade pelo fundo claro); bloco → acessórios com crossfade.
  Acessórios → encerramento é um corte em quadro idêntico (invisível).
- **Encerramento:** parte do último quadro dos acessórios com push-in lento, véu off-white, logo
  oficial e "Sua ideia ganha forma aqui." em Fraunces.

Para alterar textos, tempos ou a composição da abertura/encerramento, edite `video/motion/*.html`
e rode as etapas `motion` e `institucional`. Para trocar um vídeo de produto, substitua o arquivo em
`src/`, aumente `FRAMES_VERSION` no script e rode `all`.

# Coloridamente · motion showcase das 5 propostas de site

Vídeo de apresentação comercial (28 s, 1920×1080, 30 fps, H.264 + AAC, sem narração) das cinco
direções de site do PDF `Coloridamente_Propostas_de_Site.pdf` (páginas 3 a 7).

**Entrega:** `out/coloridamente-site-showcase.mp4`

## Como foi feito

- **Remotion + React/TypeScript**, animação 100% baseada em quadros (`useCurrentFrame`), sem autoplay nem rolagem real.
- Cada proposta foi **reconstruída em camadas** a partir das medidas do PDF (posição, corpo e peso da Lato, cores),
  com as **fotos originais em alta** do repositório no mesmo enquadramento do PDF. A composição `Fidelidade1…5`
  desenha cada proposta na escala da página do PDF para conferência por sobreposição (diferença ≤ 1 px).
- Os layouts são apresentados como **conceitos**: o rodapé de cada cena repete "Coloridamente / Exploração digital"
  do PDF. A sequência "frame a frame" do conceito 05 é **simulada** com fotos, máscaras, escala e paralaxe, sem 3D.
- A segunda linha de cards do catálogo, revelada pela rolagem, usa produtos e nomes reais de `src/data/products.ts`.
- **Trilha original** (eletrônica leve, 120 BPM) e efeitos sutis gerados por código em `scripts/music.py`:
  sem samples nem música de terceiros, livre para uso. Normalizada em -16 LUFS: discreta, mas audível no celular.

## Estrutura

```
src/
  config.ts            tempos das cenas, cores, fontes, easing, poses de câmera, caminhos das fotos
  Showcase.tsx         composição principal: câmera, transições entre cenas, textos, trilha
  Root.tsx             composições "Showcase" e "Fidelidade1…5"
  components/
    Browser.tsx        moldura de navegador, cabeçalho comum, imagem, botão, cursor
    Text.tsx           Lato + linha de texto com métricas do PDF (tracking ajustado à largura original)
    SceneLabel.tsx     "0X / NOME", frase de apoio, barra de cor e rodapé
  scenes/              Abertura, Vitrine, Catalogo, Estudio, Institucional, Cinema, Encerramento
  lib/anim.ts          easing, keyframes de câmera, interpolação
  logoPaths.ts         logo oficial separado em 85 formas (gerado por scripts/gen-logo.cjs)
public/
  img/                 fotos originais dos produtos (assets-src/products do repositório)
  brand/               logo oficial em SVG
  fonts/               Lato 400/700/900 (SIL OFL)
  audio/trilha.mp3     trilha gerada por scripts/music.py
scripts/
  render.sh            render final + faststart + verificação
  music.py             trilha e efeitos sonoros
  gen-logo.cjs         SVG do logo → src/logoPaths.ts
```

## Renderizar de novo

```bash
cd videos/coloridamente-showcase
npm install
bash scripts/render.sh                       # usa o Chrome que o Remotion baixar
# em ambientes sem download do Chrome, aponte um Chromium headless:
BROWSER=/caminho/headless_shell bash scripts/render.sh
# para regerar a trilha (requer numpy, scipy e soundfile):
PY=python3 bash scripts/render.sh
```

Pré-visualização interativa: `npx remotion studio`.

Licença do Remotion: gratuita para pessoas físicas e empresas com até 3 funcionários; empresas maiores precisam de
uma licença comercial (remotion.pro).

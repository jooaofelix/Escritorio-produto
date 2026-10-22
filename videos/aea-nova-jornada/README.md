# AEA · Nova jornada de trabalho (motion 9:16)

Vídeo explicativo de 2min06s para a AEA Contabilidade Consultiva sobre a nova jornada de trabalho
(EC nº 141/2026), feito a partir dos cards "Comunicado aos clientes" e "Guia prático para empresários".

- **Vídeo final:** `out/aea-nova-jornada-9x16.mp4` (1080×1920, 30 fps, H.264 + AAC, -14 LUFS)
- **Legendas:** `out/aea-nova-jornada.srt`
- **Roteiro, narração, direção de arte e textos de publicação:** [`roteiro.md`](roteiro.md)

## Como funciona

| Arquivo | Papel |
|---|---|
| `narracao.json` | texto de cada fala (`fala` = o que a voz lê, `legenda` = como aparece escrito) e pausas |
| `scripts/tts.py` | gera a voz (Piper pt-BR "faber", via sherpa-onnx), `audio/narracao.wav`, `composition/timing.js` e o `.srt` |
| `composition/index.html` + `main.js` | a animação (HTML/CSS + GSAP). Cada cena começa na sua fala e os destaques caem na palavra falada |
| `scripts/render.mjs` | captura a animação quadro a quadro no Chromium (Playwright) e codifica com ffmpeg; exporta os efeitos em `audio/sfx.json` |
| `scripts/audio.py` | trilha original + efeitos sincronizados + mixagem com ducking sob a voz |
| `scripts/build.sh` | roda tudo e entrega o MP4 normalizado |

Para ver a animação ao vivo no navegador: abra `composition/index.html?play` (sem som).
Para conferir um quadro: `composition/index.html?t=42.5`, ou `node scripts/render.mjs --stills 10,42.5`.

## Gerar de novo

Requisitos: Node 22 com Playwright (`npm install` na raiz do repositório), ffmpeg, Python 3 com
`sherpa-onnx numpy scipy soundfile` e a voz `vits-piper-pt_BR-faber-medium`
([download](https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-pt_BR-faber-medium.tar.bz2)).

```bash
PY=/caminho/python MODELOS=/pasta/das/vozes bash scripts/build.sh
# mantendo a narração atual (só refaz animação, trilha e vídeo):
PULAR_TTS=1 PY=/caminho/python bash scripts/build.sh
```

## Trocas comuns

- **Mudar um texto falado:** edite `narracao.json` e rode o build completo; os tempos da animação se ajustam sozinhos.
- **Locução humana:** grave cada fala como `audio/falas/sNN.wav` (48 kHz), monte `audio/narracao.wav` e atualize
  `inicio`/`duracao` em `composition/timing.js` com os tempos reais; depois rode com `PULAR_TTS=1`.
- **Logo oficial:** o símbolo foi redesenhado em vetor a partir do card (`<symbol id="aeaMark">` em
  `composition/index.html`). Se a AEA tiver o arquivo vetorial oficial, substitua o conteúdo desse símbolo.
- **Telefone, datas e textos na tela:** estão em `composition/index.html` e na lista `ACOES` de `composition/main.js`.

Fontes Montserrat e Nunito Sans (SIL OFL) e GSAP estão incluídos em `composition/` para o render funcionar offline.

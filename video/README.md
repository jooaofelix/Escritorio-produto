# Vídeo institucional Coloridamente

Pós-produção dos três vídeos de produto em uma apresentação 9:16 para redes sociais
(os vídeos não são usados no site). Tudo é gerado por `video/scripts/build-video.sh` (ffmpeg) e pelas cenas de
`video/motion/` (renderizadas quadro a quadro no Chromium do Playwright).

## Entregas

| Arquivo | Uso | Formato |
| --- | --- | --- |
| `out/coloridamente-institucional.mp4` | Versão A: apresentações e redes sociais | 1080×1920, 30 fps CFR, H.264 High, ~18,7 s, áudio silencioso |
| `out/coloridamente-scroll-master.mp4` | Versão B: sequência só com os produtos | 1080×1920, 24 fps, H.264 High, ~13,6 s, sem áudio |
| `out/coloridamente-reels-demo-site.mp4` | Reels: demonstração do site e do pedido pelo WhatsApp, com narração e música ambiente | 1080×1920, 30 fps, H.264 High, 38 s, AAC estéreo (−16 LUFS) |
| `out/coloridamente-reels-demo-site-so-musica.mp4` | Mesmo vídeo sem narração, só com a música ambiente | 1080×1920, 30 fps, H.264 High, 38 s, AAC estéreo |

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

## Reels de demonstração do site (HyperFrames)

`video/instagram/` é um projeto [HyperFrames](https://hyperframes.heygen.com) (HTML + GSAP renderizado
em MP4). O roteiro leva quem vê o post até o site e do site até o WhatsApp:

| Tempo | Cena | Narração |
| --- | --- | --- |
| 0–6 s | Gancho sobre os produtos | "Sua marca na mesa de cada pessoa. Agenda, cadernos e acessórios com a identidade da sua empresa." |
| 5,6–17,4 s | Celular navegando pelo site real (início → ocasiões → Agenda 2027) | "No nosso site, você conhece a Linha Office em poucos toques." / "Escolha a ocasião: boas-vindas, presentes, eventos ou o dia a dia." / "Encontrou o produto? Toque em: quero orçamento deste." |
| 17,4–24,6 s | WhatsApp abre com a mensagem do site já escrita; envio e resposta | "O WhatsApp já abre com a mensagem pronta. É só enviar, e a gente te ajuda a montar o seu orçamento." |
| 24,8–31,6 s | Como funciona, em 4 passos | "Do primeiro contato ao produto pronto: a sua ideia, a personalização, a produção e o produto final." |
| 31–38 s | Chamada final: "Acesse o site" (link na bio), sem número de contato | "Acesse o site pelo link da bio e peça o seu orçamento. Coloridamente: sua ideia ganha forma aqui." |

**Áudio** (`instagram/assets/audio/`): a narração é sintética, gerada localmente com
`hyperframes tts` (Kokoro, voz `pf_dora`, pt-BR, velocidade 1,05), um arquivo por fala, normalizada
a −16 LUFS. Os textos ficam em `narracao.tsv`. A música ambiente é original, gerada por
`instagram/scripts/musica-ambiente.py` (pad em Fá maior, arpejo e baixo a 80 bpm; sem direitos de
terceiros) e mixada cerca de 10 dB abaixo da voz. Para trocar uma fala, gere o arquivo de novo e
ajuste o `data-start`/`data-duration` do `<audio>` e os tempos das animações em `index.html`:

```bash
npx hyperframes@0.8.190 tts "texto da fala" -v pf_dora -l pt-br -s 1.05 -o fala.wav
ffmpeg -i fala.wav -af loudnorm=I=-16:TP=-1.5:LRA=7 -ar 48000 -ac 1 assets/audio/narracao-NN.wav
python musica-ambiente.py raw.wav 38.5   # requer numpy e soundfile
ffmpeg -i raw.wav -af "aecho=0.8:0.6:180|370|620:0.35|0.25|0.15,lowpass=f=7000,afade=t=in:d=1.5,afade=t=out:st=35.8:d=2.6,loudnorm=I=-26:TP=-3:LRA=11" \
  -c:a aac -b:a 160k assets/audio/musica-ambiente.m4a
```

As telas do site em `instagram/assets/site/` são capturas do build (`npm run build && npm run preview`)
em um celular de 390×844 px com escala 3×: a página inteira em faixas de 1000 px CSS, sem o cabeçalho
e a barra de orçamento fixos, que entram como camadas separadas. O número do WhatsApp do bloco inicial
foi apagado da captura (`page-0.jpg`), para o vídeo não mostrar contato direto. Se o site mudar, refaça as capturas
e confira as constantes `SCROLL` e `BUTTON_Y` no fim de `instagram/index.html`.

```bash
cd video/instagram
npx hyperframes@0.8.190 check                    # lint, layout e contraste
npx hyperframes@0.8.190 snapshot --at 6,12.5,17  # quadros de conferência
npx hyperframes@0.8.190 render -q high -o render.mp4
ffmpeg -i render.mp4 -c:v libx264 -preset slow -crf 18 -profile:v high -level:v 4.2 -pix_fmt yuv420p \
  -c:a aac -b:a 160k -movflags +faststart ../out/coloridamente-reels-demo-site.mp4
```

Mantenha o link do site na bio, já que a cena final aponta para ele.

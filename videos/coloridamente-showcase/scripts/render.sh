#!/usr/bin/env bash
# Renderiza out/coloridamente-site-showcase.mp4 (1920×1080, 30 fps, H.264 + AAC).
#   bash scripts/render.sh
# Variáveis opcionais:
#   BROWSER=<executável do Chrome/Chromium headless>  (padrão: o que o Remotion baixar)
#   PY=<python com numpy, scipy e soundfile>  para regerar a trilha a partir de scripts/music.py
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -n "${PY:-}" ]; then
  "$PY" scripts/music.py
  # trilha discreta: -18 LUFS, pico -1,5 dBTP
  ffmpeg -y -hide_banner -loglevel error -i public/audio/trilha.wav -af loudnorm=I=-18:TP=-1.5:LRA=7 -ar 48000 -c:a libmp3lame -b:a 256k public/audio/trilha.mp3
  rm -f public/audio/trilha.wav
fi

mkdir -p out
npx remotion render Showcase out/.render.mp4 ${BROWSER:+--browser-executable="$BROWSER"}
ffmpeg -y -hide_banner -loglevel error -i out/.render.mp4 -c copy -movflags +faststart out/coloridamente-site-showcase.mp4
rm -f out/.render.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration -of compact out/coloridamente-site-showcase.mp4

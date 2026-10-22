#!/usr/bin/env bash
# Gera o vídeo final: narração → animação → trilha/efeitos → MP4.
#   PY=<python com sherpa-onnx, soundfile, numpy e scipy> MODELOS=<pasta das vozes> bash scripts/build.sh
# Pule a narração (mantendo a atual) com PULAR_TTS=1.
set -euo pipefail
cd "$(dirname "$0")/.."
PY="${PY:-python3}"

if [ "${PULAR_TTS:-0}" != "1" ]; then
  "$PY" scripts/tts.py --modelos "${MODELOS:?defina MODELOS com a pasta que contém vits-piper-pt_BR-faber-medium}"
fi
node scripts/render.mjs --workers "${WORKERS:-4}"
"$PY" scripts/audio.py

# normalização em duas passagens para -14 LUFS (padrão de Reels, YouTube e WhatsApp)
medidas=$(ffmpeg -hide_banner -nostats -i audio/mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
val() { echo "$medidas" | sed -n "s/.*\"$1\" : \"\(.*\)\".*/\1/p"; }
filtro="loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(val input_i):measured_TP=$(val input_tp):measured_LRA=$(val input_lra):measured_thresh=$(val input_thresh):offset=$(val target_offset):linear=true"

ffmpeg -y -hide_banner -loglevel error -i out/.video.mp4 -i audio/mix.wav \
  -map 0:v -map 1:a -c:v copy -af "$filtro" -ar 48000 -c:a aac -b:a 192k -shortest -movflags +faststart \
  out/aea-nova-jornada-9x16.mp4
rm -f out/.video.mp4
echo "pronto: out/aea-nova-jornada-9x16.mp4"

#!/usr/bin/env bash
# Gera todos os assets estáticos a partir de assets-src/.
# Requisitos locais: ffmpeg (libwebp + libaom-av1), ImageMagick, poppler (pdftocairo), npx.
# Os arquivos gerados são versionados em public/ e src/data/, então o build
# da Cloudflare Pages não precisa dessas ferramentas.
#
# Uso: npm run assets            (tudo)
#      npm run assets -- frames  (só a sequência de frames)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/assets-src"
PUB="$ROOT/public"
DATA="$ROOT/src/data"
VIDEO="$SRC/video-coloridamente.mp4"
FRAMES_VERSION="v1"
ONLY="${1:-all}"

# Sequência: desktop usa todos os frames do vídeo; mobile usa 1 a cada 2, menores.
D_W=1280; D_Q=72
M_W=960;  M_Q=64; M_STEP=2

ff() { ffmpeg -hide_banner -loglevel error -y "$@"; }

build_frames() {
  local out="$PUB/frames/$FRAMES_VERSION"
  rm -rf "$out" && mkdir -p "$out/d" "$out/m" "$out/stills"

  ff -i "$VIDEO" -an -vf "scale=${D_W}:-2:flags=lanczos" \
    -c:v libwebp -quality "$D_Q" -compression_level 6 -preset photo "$out/d/%04d.webp"
  ff -i "$VIDEO" -an -vf "select='not(mod(n\,${M_STEP}))',scale=${M_W}:-2:flags=lanczos" -fps_mode vfr \
    -c:v libwebp -quality "$M_Q" -compression_level 6 -preset photo "$out/m/%04d.webp"

  # Quadros representativos de cada capítulo (fallback e prefers-reduced-motion).
  # Índices 0-based do vídeo original.
  local stills=(0 52 100 160 240)
  for n in "${stills[@]}"; do
    local name; name=$(printf '%04d' "$n")
    for w in 768 1280; do
      ff -i "$VIDEO" -an -vf "select='eq(n\,$n)',scale=${w}:-2:flags=lanczos" -frames:v 1 \
        -c:v libwebp -quality 78 "$out/stills/$name-$w.webp"
      ff -i "$VIDEO" -an -vf "select='eq(n\,$n)',scale=${w}:-2:flags=lanczos,format=yuv420p" -frames:v 1 \
        -c:v libaom-av1 -still-picture 1 -crf 30 -b:v 0 -cpu-used 4 "$out/stills/$name-$w.avif"
    done
  done

  local d_count m_count
  d_count=$(find "$out/d" -name '*.webp' | wc -l | tr -d ' ')
  m_count=$(find "$out/m" -name '*.webp' | wc -l | tr -d ' ')
  local d_h m_h fps
  d_h=$(identify -format '%h' "$out/d/0001.webp")
  m_h=$(identify -format '%h' "$out/m/0001.webp")
  fps=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$VIDEO" | awk -F/ '{print $1/$2}')
  local d_kb m_kb
  d_kb=$(du -sk "$out/d" | cut -f1); m_kb=$(du -sk "$out/m" | cut -f1)

  mkdir -p "$DATA"
  cat > "$DATA/frames-manifest.json" <<JSON
{
  "version": "$FRAMES_VERSION",
  "sourceFps": $fps,
  "sourceFrameCount": $d_count,
  "desktop": { "path": "/frames/$FRAMES_VERSION/d/", "count": $d_count, "step": 1, "width": $D_W, "height": $d_h, "totalKB": $d_kb },
  "mobile": { "path": "/frames/$FRAMES_VERSION/m/", "count": $m_count, "step": $M_STEP, "width": $M_W, "height": $m_h, "totalKB": $m_kb },
  "pad": 4,
  "ext": "webp",
  "stills": { "path": "/frames/$FRAMES_VERSION/stills/", "frames": [$(IFS=,; echo "${stills[*]}")], "widths": [768, 1280] }
}
JSON
  echo "frames: desktop=$d_count (${d_kb}KB) mobile=$m_count (${m_kb}KB)"
}

build_images() {
  local out="$PUB/images/products"
  rm -rf "$out" && mkdir -p "$out"
  local json="[" first=1
  for f in "$SRC"/products/*.webp; do
    local name; name=$(basename "$f" .webp)
    local sw sh; sw=$(identify -format '%w' "$f"); sh=$(identify -format '%h' "$f")
    local widths=()
    for w in 480 800 1200; do [ "$w" -le "$sw" ] && widths+=("$w"); done
    for w in "${widths[@]}"; do
      ff -i "$f" -vf "scale=${w}:-2:flags=lanczos" -c:v libwebp -quality 78 "$out/$name-$w.webp"
      ff -i "$f" -vf "scale=${w}:-2:flags=lanczos,format=yuv420p" -c:v libaom-av1 -still-picture 1 \
        -crf 32 -b:v 0 -cpu-used 4 "$out/$name-$w.avif"
    done
    [ $first -eq 1 ] && first=0 || json+=","
    json+="{\"name\":\"$name\",\"width\":$sw,\"height\":$sh,\"widths\":[$(IFS=,; echo "${widths[*]}")]}"
  done
  json+="]"
  echo "$json" > "$DATA/images-manifest.json"
  echo "images: $(find "$out" -type f | wc -l | tr -d ' ') arquivos ($(du -sh "$out" | cut -f1))"
}

build_brand() {
  local tmp; tmp=$(mktemp -d)
  mkdir -p "$PUB/brand"
  # Logo vetorial oficial: só recorta o viewBox na área do desenho e otimiza.
  pdftocairo -svg "$SRC/logo-coloridamente.pdf" "$tmp/logo.svg"
  sed -i -E 's/width="1080" height="1080" viewBox="0 0 1080 1080"/width="868" height="352" viewBox="106 364 868 352"/' "$tmp/logo.svg"
  npx -y svgo@3.3.2 --quiet --precision 2 -i "$tmp/logo.svg" -o "$PUB/brand/logo-coloridamente.svg"

  # Raster transparente em alta (Open Graph, e-mail, materiais externos).
  pdftocairo -png -transp -r 288 -singlefile "$SRC/logo-coloridamente.pdf" "$tmp/logo4x"
  convert "$tmp/logo4x.png" -crop 3472x1408+424+1456 +repage "$tmp/logo-crop.png"
  convert "$tmp/logo-crop.png" -resize 1200x "$PUB/brand/logo-coloridamente-1200.png"

  # Ícone: só os vetores do cacto, isolados da logo oficial.
  python3 -I "$ROOT/scripts/extract-icon.py" "$tmp/logo.svg" "$tmp/icon.svg"
  npx -y svgo@3.3.2 --quiet --precision 1 -i "$tmp/icon.svg" -o "$PUB/favicon.svg"
  PW_CHROMIUM="${PW_CHROMIUM:-}" node "$ROOT/scripts/render-icons.mjs" "$PUB/favicon.svg" "$tmp"
  cp "$tmp/icon-512.png" "$tmp/apple-touch-icon.png" "$tmp/favicon-32.png" "$PUB/"
  convert "$tmp/favicon-16.png" "$tmp/favicon-32.png" "$tmp/favicon-48.png" "$PUB/favicon.ico"

  # Open Graph 1200x630: composição final do vídeo + logo.
  ff -i "$VIDEO" -an -vf "select='eq(n\,240)',crop=1180:620:0:0,scale=1200:630:flags=lanczos" -frames:v 1 "$tmp/og-bg.png"
  convert "$tmp/og-bg.png" \( "$tmp/logo-crop.png" -resize 420x \) -gravity north -geometry +0+34 -composite \
    -quality 86 "$PUB/og-image.jpg"
  rm -rf "$tmp"
  echo "brand: $(du -h "$PUB/brand/logo-coloridamente.svg" | cut -f1) svg"
}

case "$ONLY" in
  frames) build_frames ;;
  images) build_images ;;
  brand)  build_brand ;;
  all)    build_frames; build_images; build_brand ;;
  *) echo "alvo desconhecido: $ONLY (use frames|images|brand|all)"; exit 1 ;;
esac

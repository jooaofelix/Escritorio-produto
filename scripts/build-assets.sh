#!/usr/bin/env bash
# Gera todos os assets estáticos a partir de assets-src/.
# Requisitos locais: ffmpeg (libwebp + libaom-av1), ImageMagick, poppler (pdftocairo), npx.
# Os arquivos gerados são versionados em public/ e src/data/, então o build
# da Cloudflare Pages não precisa dessas ferramentas.
#
# Uso: npm run assets            (tudo)
#      npm run assets -- images  (só as fotos de produto)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/assets-src"
PUB="$ROOT/public"
DATA="$ROOT/src/data"
ff() { ffmpeg -hide_banner -loglevel error -y "$@"; }

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

  rm -rf "$tmp"
  echo "brand: $(du -h "$PUB/brand/logo-coloridamente.svg" | cut -f1) svg"
}

case "$ONLY" in
  images) build_images ;;
  brand)  build_brand ;;
  all)    build_images; build_brand ;;
  *) echo "alvo desconhecido: $ONLY (use images|brand|all)"; exit 1 ;;
esac

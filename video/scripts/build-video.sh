#!/usr/bin/env bash
# Pós-produção da apresentação Coloridamente (ffmpeg).
#
#   bash video/scripts/build-video.sh normalize    clipes 9:16 1080x1920 sem marca d'água
#   bash video/scripts/build-video.sh master       Versão B: coloridamente-scroll-master.mp4
#   bash video/scripts/build-video.sh motion       renderiza abertura e encerramento (Chromium)
#   bash video/scripts/build-video.sh institucional  Versão A: coloridamente-institucional.mp4
#   bash video/scripts/build-video.sh frames       frames WebP + manifest para a landing page
#   bash video/scripts/build-video.sh all          tudo, na ordem acima
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
V="$ROOT/video"
BUILD="${VIDEO_BUILD:-$V/build}"
OUT="${VIDEO_OUT:-$V/out}"
mkdir -p "$BUILD/clips" "$OUT"

ff() { ffmpeg -hide_banner -loglevel error -y "$@"; }

# Ordem das cenas = ordem do storyboard.
CLIPS=(01-papelaria 02-bloco-de-mesa 03-acessorios)

# Recorte 9:16 que exclui a marca d'água "Dola AI" (y >= 1235 no quadro 720x1280):
# zoom de só 1,04x, centralizado na horizontal e preso ao topo, sem cortar produtos.
CROP="crop=692:1230:14:0"
SCALE="scale=1080:1920:flags=lanczos,unsharp=5:5:0.45:5:5:0,setsar=1"
# O vídeo 03 tem fundo bege; ganho por canal leva a um off-white quente próximo das outras cenas.
GRADE_03="colorchannelmixer=rr=1.035:gg=1.075:bb=1.115"

# Transições (segundos). XF = entre produtos; XF_INTRO = abertura -> primeira cena.
XF=0.75
XF_INTRO=0.6
# Dissolve "luminoso": crossfade com leve elevação em direção ao off-white no meio da
# transição (continuidade pelo fundo claro, sem flash). LIFT = intensidade no pico.
LIFT=0.22
# A elevação vale só para a luminância (PLANE 0); nos planos de cor (U/V) é um crossfade puro.
LUMA_DISSOLVE="xfade=transition=custom:expr='if(eq(PLANE\,0)\,(A*P+B*(1-P))+(235-(A*P+B*(1-P)))*${LIFT}*sin(PI*P)\,A*P+B*(1-P))'"

COLOR_TAGS="-colorspace bt709 -color_primaries bt709 -color_trc bt709"
X264_MASTER="-c:v libx264 -preset slow -crf 14 -profile:v high -pix_fmt yuv420p $COLOR_TAGS -movflags +faststart -an"
X264_DELIVERY="-c:v libx264 -preset slow -crf 18 -profile:v high -level:v 4.2 -pix_fmt yuv420p $COLOR_TAGS -movflags +faststart"

clip_duration() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }

normalize() {
  for name in "${CLIPS[@]}"; do
    local vf="$CROP"
    [ "$name" = "03-acessorios" ] && vf="$vf,$GRADE_03"
    ff -i "$V/src/$name.mp4" -an -vf "$vf,$SCALE,fps=24" \
      -c:v libx264 -preset slow -crf 12 -pix_fmt yuv420p "$BUILD/clips/$name.mp4"
  done
  # Quadros de referência para a abertura (1º quadro) e o encerramento (último quadro).
  ff -i "$BUILD/clips/01-papelaria.mp4" -frames:v 1 "$BUILD/first-frame.png"
  ff -sseof -0.05 -i "$BUILD/clips/03-acessorios.mp4" -frames:v 1 -update 1 "$BUILD/last-frame.png"
  echo "normalize: ${#CLIPS[@]} clipes 1080x1920 em $BUILD/clips"
}

# Encadeia os 3 clipes com transições; $1 = fps de saída, $2 = arquivo.
chain_products() {
  local fps="$1" out="$2"
  local d1 d2
  d1=$(clip_duration "$BUILD/clips/01-papelaria.mp4")
  d2=$(clip_duration "$BUILD/clips/02-bloco-de-mesa.mp4")
  local o1 o2
  o1=$(awk -v a="$d1" -v x="$XF" 'BEGIN{printf "%.4f", a-x}')
  o2=$(awk -v a="$d1" -v b="$d2" -v x="$XF" 'BEGIN{printf "%.4f", a+b-2*x}')
  ff -i "$BUILD/clips/01-papelaria.mp4" -i "$BUILD/clips/02-bloco-de-mesa.mp4" -i "$BUILD/clips/03-acessorios.mp4" \
    -filter_complex "[0:v]settb=1/24000,setpts=PTS-STARTPTS[a];[1:v]settb=1/24000,setpts=PTS-STARTPTS[b];[2:v]settb=1/24000,setpts=PTS-STARTPTS[c];\
[a][b]${LUMA_DISSOLVE}:duration=${XF}:offset=${o1}[ab];\
[ab][c]xfade=transition=fade:duration=${XF}:offset=${o2},fps=${fps},format=yuv420p[v]" \
    -map "[v]" $X264_MASTER -r "$fps" "$out"
}

master() {
  chain_products 24 "$OUT/coloridamente-scroll-master.mp4"
  echo "master: $(clip_duration "$OUT/coloridamente-scroll-master.mp4")s"
}

# Sequência de frames (opcional; o site não usa) a partir do scroll-master (24 fps): 1 a cada 2 quadros = 12 fps,
# espaçamento uniforme. Desktop 720x1280 (resolução nativa dos vídeos), mobile 540x960.
FRAMES_VERSION="v3"
FRAME_STEP=2
STILL_TIMES=(3.6 7.7 10.2 13.6)   # segundos no master: um quadro representativo por capítulo

frames() {
  local master="$OUT/coloridamente-scroll-master.mp4"
  local pub="$OUT/frames/$FRAMES_VERSION"
  rm -rf "$pub" && mkdir -p "$pub/d" "$pub/m" "$pub/stills"
  local sel="select='not(mod(n\,${FRAME_STEP}))'"
  ff -i "$master" -vf "$sel,scale=720:1280:flags=lanczos" -fps_mode vfr \
    -c:v libwebp -quality 66 -compression_level 6 -preset photo "$pub/d/%04d.webp"
  ff -i "$master" -vf "$sel,scale=540:960:flags=lanczos" -fps_mode vfr \
    -c:v libwebp -quality 60 -compression_level 6 -preset photo "$pub/m/%04d.webp"

  local fps count still_frames=()
  fps=$(awk -v s="$FRAME_STEP" 'BEGIN{print 24/s}')
  count=$(find "$pub/d" -name '*.webp' | wc -l | tr -d ' ')
  for t in "${STILL_TIMES[@]}"; do
    local k; k=$(awk -v t="$t" -v f="$fps" -v c="$count" 'BEGIN{k=int(t*f+0.5); if(k>c-1)k=c-1; print k}')
    still_frames+=("$k")
    local name; name=$(printf '%04d' "$k")
    for w in 540 1080; do
      ff -ss "$(awk -v k="$k" -v f="$fps" 'BEGIN{printf "%.4f", k/f}')" -i "$master" -frames:v 1 \
        -vf "scale=${w}:-2:flags=lanczos" -c:v libwebp -quality 78 "$pub/stills/$name-$w.webp"
      ff -ss "$(awk -v k="$k" -v f="$fps" 'BEGIN{printf "%.4f", k/f}')" -i "$master" -frames:v 1 \
        -vf "scale=${w}:-2:flags=lanczos,format=yuv420p" -c:v libaom-av1 -still-picture 1 -crf 30 -b:v 0 -cpu-used 4 \
        "$pub/stills/$name-$w.avif"
    done
  done

  # Limites de cena = meio de cada transição, em índices da sequência de frames.
  local d1 d2 d3
  d1=$(clip_duration "$BUILD/clips/01-papelaria.mp4")
  d2=$(clip_duration "$BUILD/clips/02-bloco-de-mesa.mp4")
  d3=$(clip_duration "$BUILD/clips/03-acessorios.mp4")
  local b1 b2
  b1=$(awk -v a="$d1" -v x="$XF" -v f="$fps" 'BEGIN{print int((a-x/2)*f+0.5)}')
  b2=$(awk -v a="$d1" -v b="$d2" -v x="$XF" -v f="$fps" 'BEGIN{print int((a+b-1.5*x)*f+0.5)}')
  local d_kb m_kb
  d_kb=$(du -sk "$pub/d" | cut -f1); m_kb=$(du -sk "$pub/m" | cut -f1)
  cat > "$pub/manifest.json" <<JSON
{
  "version": "$FRAMES_VERSION",
  "source": "video/out/coloridamente-scroll-master.mp4",
  "aspect": "9:16",
  "fps": $fps,
  "count": $count,
  "pad": 4,
  "ext": "webp",
  "desktop": { "path": "/frames/$FRAMES_VERSION/d/", "width": 720, "height": 1280, "totalKB": $d_kb },
  "mobile": { "path": "/frames/$FRAMES_VERSION/m/", "width": 540, "height": 960, "totalKB": $m_kb },
  "scenes": [
    { "id": "papelaria", "start": 0, "end": $((b1 - 1)) },
    { "id": "bloco-de-mesa", "start": $b1, "end": $((b2 - 1)) },
    { "id": "acessorios", "start": $b2, "end": $((count - 1)) }
  ],
  "transitions": [
    { "from": "papelaria", "to": "bloco-de-mesa", "start": $(awk -v a="$d1" -v x="$XF" -v f="$fps" 'BEGIN{print int((a-x)*f+0.5)}'), "end": $(awk -v a="$d1" -v f="$fps" 'BEGIN{print int(a*f+0.5)}') },
    { "from": "bloco-de-mesa", "to": "acessorios", "start": $(awk -v a="$d1" -v b="$d2" -v x="$XF" -v f="$fps" 'BEGIN{print int((a+b-2*x)*f+0.5)}'), "end": $(awk -v a="$d1" -v b="$d2" -v x="$XF" -v f="$fps" 'BEGIN{print int((a+b-x)*f+0.5)}') }
  ],
  "stills": { "path": "/frames/$FRAMES_VERSION/stills/", "frames": [$(IFS=,; echo "${still_frames[*]}")], "widths": [540, 1080] }
}
JSON
  echo "frames: $count (12 fps) desktop ${d_kb}KB, mobile ${m_kb}KB; cenas 0-$((b1-1)) / $b1-$((b2-1)) / $b2-$((count-1))"
}

# Abertura e encerramento: quadros PNG renderizados no Chromium (video/motion).
motion() {
  (cd "$ROOT" && node video/motion/render.mjs all)
}

# Versão A, 30 fps: abertura -> 3 produtos -> encerramento.
INTRO_XF_OFFSET=1.6
institucional() {
  local fps=30
  local n_intro n_outro
  n_intro=$(find "$BUILD/intro" -name '*.png' | wc -l | tr -d ' ')
  n_outro=$(find "$BUILD/outro" -name '*.png' | wc -l | tr -d ' ')
  [ "$n_intro" -gt 0 ] && [ "$n_outro" -gt 0 ] || { echo "rode a etapa motion antes"; exit 1; }
  local d1 d2 d3
  d1=$(clip_duration "$BUILD/clips/01-papelaria.mp4")
  d2=$(clip_duration "$BUILD/clips/02-bloco-de-mesa.mp4")
  d3=$(clip_duration "$BUILD/clips/03-acessorios.mp4")
  local l1 l2 o2 o3
  l1=$(awk -v o="$INTRO_XF_OFFSET" -v a="$d1" 'BEGIN{printf "%.4f", o+a}')
  o2=$(awk -v l="$l1" -v x="$XF" 'BEGIN{printf "%.4f", l-x}')
  l2=$(awk -v l="$l1" -v b="$d2" -v x="$XF" 'BEGIN{printf "%.4f", l+b-x}')
  o3=$(awk -v l="$l2" -v x="$XF" 'BEGIN{printf "%.4f", l-x}')
  local norm="fps=${fps},settb=1/30000,setpts=PTS-STARTPTS,format=yuv420p"
  ff -framerate "$fps" -i "$BUILD/intro/%04d.png" \
     -i "$BUILD/clips/01-papelaria.mp4" -i "$BUILD/clips/02-bloco-de-mesa.mp4" -i "$BUILD/clips/03-acessorios.mp4" \
     -framerate "$fps" -i "$BUILD/outro/%04d.png" \
     -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=48000" \
     -filter_complex "[0:v]scale=1080:1920,setsar=1,${norm}[i];[1:v]${norm}[a];[2:v]${norm}[b];[3:v]${norm}[c];[4:v]scale=1080:1920,setsar=1,${norm}[e];\
[i][a]${LUMA_DISSOLVE}:duration=${XF_INTRO}:offset=${INTRO_XF_OFFSET}[ia];\
[ia][b]${LUMA_DISSOLVE}:duration=${XF}:offset=${o2}[ib];\
[ib][c]xfade=transition=fade:duration=${XF}:offset=${o3}[ic];\
[ic][e]concat=n=2:v=1:a=0,format=yuv420p[v]" \
     -map "[v]" -map 5:a -c:a aac -b:a 96k -shortest $X264_DELIVERY -r "$fps" "$OUT/coloridamente-institucional.mp4"
  echo "institucional: $(clip_duration "$OUT/coloridamente-institucional.mp4")s"
}

case "${1:-all}" in
  normalize) normalize ;;
  master) master ;;
  frames) frames ;;
  motion) motion ;;
  institucional) institucional ;;
  all) normalize; master; frames; motion; institucional ;;
  *) echo "etapa desconhecida: $1"; exit 1 ;;
esac

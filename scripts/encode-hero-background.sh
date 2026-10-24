#!/usr/bin/env bash
# Encodes the hero background: a faint grayscale loop of joined shots, plus
# its poster.
#
#   scripts/encode-hero-background.sh <input> <cut> <cut> ... <end>
#
# Times are in seconds into <input>. The shots run from 0 to the first cut,
# between consecutive cuts, and from the last cut to <end>. They join with
# XFADE-second crossfades, play at SPEED, and the tail crossfades into the
# head so the loop has no jump. Crossfades are timed after the slowdown.
#
# Writes to public/hero/:
#   bg-1280.{webm,mp4}   1280x720 (16:9), md and up
#   bg-720.{webm,mp4}    404x720 (9:16 center crop), below md
#   bg-poster.{webp,jpg} the loop's first frame, 1280x720
#
# Needs ffmpeg with libvpx-vp9, libx264 and libwebp. Without a system build:
#   npm i --no-save ffmpeg-static
#   FFMPEG="$(node -p "require('ffmpeg-static')")" scripts/encode-hero-background.sh ...
# Keep source footage in /media-src (git-ignored), not /public.
set -euo pipefail

if [[ $# -lt 2 ]]; then
  sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'
  exit 1
fi

INPUT=$1
shift
BOUNDS=(0 "$@")
FFMPEG=${FFMPEG:-ffmpeg}
XFADE=${XFADE:-0.5}
SPEED=${SPEED:-0.6}
FPS=${FPS:-24}
OUT=${OUT:-public/hero}

calc() { awk "BEGIN { print $1 }"; }

mkdir -p "$OUT"
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

ff() { "$FFMPEG" -hide_banner -loglevel error -y "$@"; }

# Each shot: trimmed, slowed, grayscale, re-timed to FPS with blended frames.
SHOTS=$((${#BOUNDS[@]} - 1))
GRAPH="[0:v]split=$SHOTS$(for ((i = 0; i < SHOTS; i++)); do printf '[s%d]' "$i"; done);"
LENGTHS=()
for ((i = 0; i < SHOTS; i++)); do
  from=${BOUNDS[i]}
  to=${BOUNDS[i + 1]}
  GRAPH+="[s$i]trim=start=$from:end=$to,setpts=(PTS-STARTPTS)/$SPEED,"
  GRAPH+="framerate=fps=$FPS,hue=s=0,hqdn3d=2:2:4:4,setsar=1[c$i];"
  LENGTHS+=("$(calc "($to - $from) / $SPEED")")
done

# Chain the crossfades; each offset is the joined length so far minus XFADE.
prev=c0
total=${LENGTHS[0]}
for ((i = 1; i < SHOTS; i++)); do
  offset=$(calc "$total - $XFADE")
  GRAPH+="[$prev][c$i]xfade=transition=fade:duration=$XFADE:offset=$offset[j$i];"
  prev=j$i
  total=$(calc "$total + ${LENGTHS[i]} - $XFADE")
done

# Loop seam: play [XFADE, total], then crossfade its tail into [0, XFADE].
# Output ends on the frame it starts with.
GRAPH+="[$prev]split[a][b];"
GRAPH+="[a]trim=start=$XFADE,setpts=PTS-STARTPTS,fps=$FPS[body];"
GRAPH+="[b]trim=end=$XFADE,setpts=PTS-STARTPTS,fps=$FPS[head];"
GRAPH+="[body][head]xfade=transition=fade:duration=$XFADE:offset=$(calc "$total - 2 * $XFADE"),format=yuv420p[v]"

# Lossless master; every deliverable is cut from it.
ff -t "${BOUNDS[-1]}" -i "$INPUT" -filter_complex "$GRAPH" -map "[v]" -an \
  -c:v libx264 -qp 0 -preset veryfast "$WORK/master.mkv"

encode() { # <name> <filter> <vp9 crf> <x264 crf>
  ff -i "$WORK/master.mkv" -vf "$2" -an -pix_fmt yuv420p \
    -c:v libvpx-vp9 -b:v 0 -crf "$3" -row-mt 1 -deadline good -cpu-used 2 \
    "$OUT/bg-$1.webm"
  ff -i "$WORK/master.mkv" -vf "$2" -an -pix_fmt yuv420p \
    -c:v libx264 -profile:v high -preset slow -crf "$4" -movflags +faststart \
    "$OUT/bg-$1.mp4"
}

encode 1280 "scale=1280:720:flags=lanczos" 42 30
encode 720 "crop=w='trunc(ih*9/16/2)*2':h=ih,scale=404:720:flags=lanczos" 42 30

ff -i "$WORK/master.mkv" -vf "scale=1280:720:flags=lanczos" -frames:v 1 \
  -c:v libwebp -quality 60 "$OUT/bg-poster.webp"
ff -i "$WORK/master.mkv" -vf "scale=1280:720:flags=lanczos" -frames:v 1 \
  -q:v 6 "$OUT/bg-poster.jpg"

printf 'Loop length: %ss\n' "$(calc "$total - $XFADE")"

# Budgets: 1280 under 2.5MB, 720 under 1.2MB.
status=0
for f in "$OUT"/bg-*; do
  bytes=$(wc -c <"$f")
  limit=0
  case $f in
    *-720.*) limit=1200000 ;;
    *-1280.*) limit=2500000 ;;
  esac
  flag=""
  if ((limit && bytes > limit)); then flag="  OVER BUDGET"; status=1; fi
  printf '%-30s %8d bytes%s\n' "$f" "$bytes" "$flag"
done
exit $status

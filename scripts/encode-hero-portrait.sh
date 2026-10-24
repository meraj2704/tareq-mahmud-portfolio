#!/usr/bin/env bash
# Encodes the hero "living portrait": a silent 4:5 loop plus its poster.
#
#   scripts/encode-hero-portrait.sh <input> <start> <duration> [center-x] [center-y]
#
# <start> and <duration> are in seconds. The crop is centered on
# (center-x, center-y), given as fractions of the frame (default 0.5 0.4,
# where a face usually sits). The last LOOP_FADE seconds crossfade into the
# first, so the clip reads <duration> + LOOP_FADE seconds of source and loops
# without a jump.
#
# Writes to public/hero/:
#   portrait-720.{webm,mp4}   576x720, md and up
#   portrait-480.{webm,mp4}   384x480, below md
#   portrait-poster.{webp,jpg} the loop's first frame, 576x720
#
# Needs ffmpeg with libvpx-vp9, libx264 and libwebp. Without a system build:
#   npm i --no-save ffmpeg-static
#   FFMPEG="$(node -p "require('ffmpeg-static')")" scripts/encode-hero-portrait.sh ...
# Keep source footage in /media-src (git-ignored), not /public.
set -euo pipefail

if [[ $# -lt 3 ]]; then
  sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'
  exit 1
fi

INPUT=$1
START=$2
DURATION=$3
CX=${4:-0.5}
CY=${5:-0.4}
FFMPEG=${FFMPEG:-ffmpeg}
LOOP_FADE=${LOOP_FADE:-0.5}
FPS=${FPS:-24}
OUT=${OUT:-public/hero}

calc() { awk "BEGIN { print $1 }"; }

mkdir -p "$OUT"
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

ff() { "$FFMPEG" -hide_banner -loglevel error -y "$@"; }

# Largest 4:5 window that fits, clamped inside the frame, at even sizes.
CROP="crop=w='trunc(min(iw,ih*4/5)/2)*2':h='trunc(min(ih,iw*5/4)/2)*2'"
CROP+=":x='clip(iw*$CX-ow/2,0,iw-ow)':y='clip(ih*$CY-oh/2,0,ih-oh)'"

# Loop seam: play source [fade, duration + fade], then crossfade its tail
# into source [0, fade]. Output ends on the frame it starts with.
LOOP="[0:v]$CROP,scale=576:720:flags=lanczos,setsar=1,split[a][b];"
LOOP+="[a]trim=start=$LOOP_FADE,setpts=PTS-STARTPTS,fps=$FPS[body];"
LOOP+="[b]trim=end=$LOOP_FADE,setpts=PTS-STARTPTS,fps=$FPS[head];"
LOOP+="[body][head]xfade=transition=fade:duration=$LOOP_FADE:offset=$(calc "$DURATION - $LOOP_FADE"),format=yuv420p[v]"

# Lossless master; every deliverable is cut from it.
ff -ss "$START" -t "$(calc "$DURATION + $LOOP_FADE")" -i "$INPUT" \
  -filter_complex "$LOOP" -map "[v]" -an \
  -c:v libx264 -qp 0 -preset veryfast "$WORK/master.mkv"

encode() { # <height> <width> <vp9 crf> <x264 crf>
  local h=$1 w=$2 scale="scale=$2:$1:flags=lanczos"
  ff -i "$WORK/master.mkv" -vf "$scale" -an -pix_fmt yuv420p \
    -c:v libvpx-vp9 -b:v 0 -crf "$3" -row-mt 1 -deadline good -cpu-used 2 \
    "$OUT/portrait-$h.webm"
  ff -i "$WORK/master.mkv" -vf "$scale" -an -pix_fmt yuv420p \
    -c:v libx264 -profile:v high -preset slow -crf "$4" -movflags +faststart \
    "$OUT/portrait-$h.mp4"
}

encode 720 576 34 24
encode 480 384 36 26

ff -i "$WORK/master.mkv" -frames:v 1 -c:v libwebp -quality 82 "$OUT/portrait-poster.webp"
ff -i "$WORK/master.mkv" -frames:v 1 -q:v 3 "$OUT/portrait-poster.jpg"

# Budgets: 480 under 1.5MB, 720 under 2.5MB.
status=0
for f in "$OUT"/portrait-*; do
  bytes=$(wc -c <"$f")
  limit=0
  case $f in
    *-480.*) limit=1500000 ;;
    *-720.*) limit=2500000 ;;
  esac
  flag=""
  if ((limit && bytes > limit)); then flag="  OVER BUDGET"; status=1; fi
  printf '%-36s %8d bytes%s\n' "$f" "$bytes" "$flag"
done
exit $status

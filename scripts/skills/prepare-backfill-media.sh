#!/usr/bin/env bash
# One-off, for the first fill: turns the walkthrough videos delivered in August into files a browser can
# stream, named for `skillpack.cjs export`. Lossless where it can be: the 84 MP4s are only re-wrapped
# (index to the front, metadata dropped); the geo-effect-validator QuickTime recording is re-encoded.
#
#   prepare-backfill-media.sh <压缩包.zip> <交付_geo-effect-validator.zip> <out-dir>
#
# Needs unzip and ffmpeg (set FFMPEG=/path/to/ffmpeg if it is not on PATH).
# Writes <out-dir>/<id>.mp4 and <out-dir>/<id>.jpg: a poster from 90% of the way in, where these recordings
# mostly show what the skill delivered (their first seconds are the same start-up screen). Replace any that miss.
set -euo pipefail
FFMPEG=${FFMPEG:-ffmpeg}
packs=$1
geo=$2
out=$3
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
mkdir -p "$out"

poster() { # <video> <jpg>: the frame 90% of the way in, or the first frame if that cannot be read
  local length at
  length=$({ "$FFMPEG" -i "$1" 2>&1 || true; } | sed -n 's/.*Duration: \([0-9:.]*\),.*/\1/p' | awk -F: '{ print $1 * 3600 + $2 * 60 + $3 }')
  at=$(awk -v d="${length:-0}" 'BEGIN { printf "%.2f", d * 0.9 }')
  "$FFMPEG" -v error -y -ss "$at" -i "$1" -frames:v 1 -q:v 3 "$2" 2>/dev/null || "$FFMPEG" -v error -y -i "$1" -frames:v 1 -q:v 3 "$2"
}

unzip -q "$packs" -d "$work/packs"
for pack in "$work"/packs/*/*-WH.zip; do
  id=$(basename "$pack" -WH.zip)
  clip=$(unzip -Z1 "$pack" | grep -iE '\.mp4$' | head -1)
  unzip -p "$pack" "$clip" > "$work/source.mp4"
  "$FFMPEG" -v error -y -i "$work/source.mp4" -map 0 -c copy -map_metadata -1 -movflags +faststart "$out/$id.mp4"
  poster "$out/$id.mp4" "$out/$id.jpg"
  echo "✓ $id"
done

unzip -q "$geo" -d "$work/geo"
mov=$(find "$work/geo" -iname '*.mov' -not -path '*__MACOSX*' | head -1)
"$FFMPEG" -v error -y -i "$mov" -map 0:v:0 -map '0:a:0?' -vf "scale='min(1920,iw)':-2,fps=30" \
  -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -c:a aac -b:a 96k -map_metadata -1 -movflags +faststart \
  "$out/geo-effect-validator.mp4"
poster "$out/geo-effect-validator.mp4" "$out/geo-effect-validator.jpg"
echo "✓ geo-effect-validator"

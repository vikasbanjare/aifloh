#!/usr/bin/env bash
# Encode a master film for the scroll-scrubbed hero.
# Usage: [FPS=48] scripts/encode-hero.sh master.mp4 [crop-x-fraction-for-phone, default 0.5]
# GOP (keyframe spacing in frames) defaults to 2; at FPS=48 use GOP=4 for the same spacing in time.
# FPS defaults to 24; use 48 for an interpolated master (twice the frames to scrub through, so scroll steps are half as big).
# Writes public/media/film/hero-wide.mp4/.webm, hero-tall.mp4/.webm and four webp posters (first/last frame, wide/tall).
# Keyframe every 2 frames + no B-frames = near-instant seeks forwards and backwards. No audio.
set -euo pipefail
IN="$1"; CX="${2:-0.5}"; OUT=public/media/film; FPS="${FPS:-24}"; GOP="${GOP:-2}"
mkdir -p "$OUT"
COMMON=(-an -c:v libx264 -pix_fmt yuv420p -profile:v high -preset slow -g "$GOP" -keyint_min "$GOP" -bf 0 -sc_threshold 0 -movflags +faststart -r "$FPS")
ffmpeg -y -v error -i "$IN" -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" -crf 26 "${COMMON[@]}" "$OUT/hero-wide.mp4"
ffmpeg -y -v error -i "$IN" -vf "scale=-2:1280,crop=720:1280:(in_w-720)*${CX}:0" -crf 27 "${COMMON[@]}" "$OUT/hero-tall.mp4"
# VP9 WebM twin for browsers without H.264 (some Chromium builds); same keyframe spacing
VP9=(-an -c:v libvpx-vp9 -b:v 0 -g "$GOP" -keyint_min "$GOP" -row-mt 1 -deadline good -cpu-used 2 -r "$FPS")
ffmpeg -y -v error -i "$OUT/hero-wide.mp4" -crf 36 "${VP9[@]}" "$OUT/hero-wide.webm"
ffmpeg -y -v error -i "$OUT/hero-tall.mp4" -crf 37 "${VP9[@]}" "$OUT/hero-tall.webm"
for v in wide tall; do
  ffmpeg -y -v error -i "$OUT/hero-$v.mp4" -frames:v 1 -c:v libwebp -quality 78 "$OUT/hero-$v-start.webp"
  ffmpeg -y -v error -sseof -0.1 -i "$OUT/hero-$v.mp4" -frames:v 1 -update 1 -c:v libwebp -quality 78 "$OUT/hero-$v-end.webp"
done
ls -la "$OUT"/hero-*

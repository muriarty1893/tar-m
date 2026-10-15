#!/usr/bin/env bash
# Builds the home hero's wide background video from a portrait clip (docs/3d-model.md).
# The clip plays sharp in the middle; the sides are its first frame mirrored outward and blurred
# progressively, like a shallow depth of field. Usage: scripts/hero-video.sh clip.mp4 [crop-bottom-px]
set -euo pipefail
src="$1"
cut="${2:-80}" # the bottom strip to drop (Kling AI's watermark)
out=public/hero
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

IFS=, read -r w h < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$src")
ch=$((h - cut))
ffmpeg -v error -y -i "$src" -vf "crop=$w:$ch:0:0,scale=-2:800" -an -c:v libx264 -crf 18 "$tmp/clip.mp4"
cw=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$tmp/clip.mp4")
half=$((cw / 2))
x=$(((1920 - cw) / 2))

# Static wide frame: [F right half | F mirrored | F | F mirrored | F left half], then blur the sides.
ffmpeg -v error -y -i "$tmp/clip.mp4" -frames:v 1 "$tmp/F.png"
magick "$tmp/F.png" -flop "$tmp/Fh.png"
magick "$tmp/F.png" -crop "${half}x800+${half}+0" +repage "$tmp/Fr.png"
magick "$tmp/F.png" -crop "${half}x800+0+0" +repage "$tmp/Fl.png"
magick "$tmp/Fr.png" "$tmp/Fh.png" "$tmp/F.png" "$tmp/Fh.png" "$tmp/Fl.png" +append -gravity center -crop 1920x800+0+0 +repage "$tmp/wide.png"
magick "$tmp/wide.png" -blur 0x14 "$tmp/blur.png"
ramp=380
magick -size 800x$ramp gradient:black-white -rotate -90 "$tmp/rampL.png"
magick "$tmp/rampL.png" -flop "$tmp/rampR.png"
magick -size 1920x800 xc:black "$tmp/rampL.png" -geometry +$((x - ramp))+0 -composite \
  \( -size "${cw}x800" xc:white \) -geometry +$x+0 -composite "$tmp/rampR.png" -geometry +$((x + cw))+0 -composite "$tmp/mask.png"
magick "$tmp/blur.png" "$tmp/wide.png" "$tmp/mask.png" -composite "$tmp/static.png"

# The moving clip on top, its side edges feathered into the still.
fc="[1:v]format=yuva420p,geq=lum='p(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':a='255*min(1\,min(X\,W-1-X)/40)'[v];[0:v][v]overlay=$x:0:shortest=1,format=yuv420p"
ffmpeg -v error -y -loop 1 -framerate 30 -i "$tmp/static.png" -i "$tmp/clip.mp4" -filter_complex "$fc" -an \
  -c:v libx264 -profile:v high -crf 25 -preset slow -movflags +faststart "$out/hero-video.mp4"
ffmpeg -v error -y -loop 1 -framerate 30 -i "$tmp/static.png" -i "$tmp/clip.mp4" -filter_complex "$fc" -an \
  -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 "$out/hero-video.webm"
ffmpeg -v error -y -i "$out/hero-video.mp4" -frames:v 1 -c:v libwebp -quality 80 "$out/hero-video-start.webp"
ffmpeg -v error -y -sseof -0.05 -i "$out/hero-video.mp4" -frames:v 1 -c:v libwebp -quality 82 "$out/hero-video-end.webp"
ls -la "$out"/hero-video*

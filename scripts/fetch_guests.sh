#!/usr/bin/env bash
# Phase 7. Fetch the guest-lecture playlist: auto-captions first (cheap, and the
# primary source), then video-only 1080p streams for slide reconstruction.
#
# Video 11 of the playlist (xvHdw0Cm_RY, Dieter Fox) is a *private* video and
# cannot be fetched; it is deliberately absent from PAIRS.
set -u
cd "$(dirname "$0")/.." || exit 1
mkdir -p transcripts/guests video/guests

# "index:youtube_id:slug"
PAIRS=(
  "01:aG8NPTPhwkE:gupta"
  "02:qvTP6T5oq1w:xu"
  "03:fHHLmTu9sFk:kumar"
  "04:CPmTpXA5azw:wagenmaker"
  "05:tvFvIEOBKfM:chi"
  "06:VS7Ulaugevg:xiao"
  "07:fqkp_wkov6M:reed"
  "08:pzolgvyWEFY:vuong"
  "09:oBEkY6NeE_o:sharma"
  "10:0XB7fNS_ONg:beyer"
)

echo "=== stage 1: auto-captions ==="
for pair in "${PAIRS[@]}"; do
  IFS=: read -r idx vid slug <<<"$pair"
  if ls "transcripts/guests/g${idx}_${slug}."*.vtt >/dev/null 2>&1; then
    echo "SKIP subs g${idx} (exists)"; continue
  fi
  yt-dlp -q --no-warnings --skip-download \
    --write-auto-subs --sub-langs "en-orig" --sub-format vtt \
    -o "transcripts/guests/g${idx}_${slug}.%(ext)s" \
    "https://www.youtube.com/watch?v=${vid}" \
    && echo "DONE subs g${idx} ${slug}" || echo "FAIL subs g${idx} ${slug}"
done

echo "=== stage 2: 1080p video-only ==="
for pair in "${PAIRS[@]}"; do
  IFS=: read -r idx vid slug <<<"$pair"
  if ls "video/guests/g${idx}."* >/dev/null 2>&1; then
    echo "SKIP video g${idx} (exists)"; continue
  fi
  yt-dlp -q --no-warnings -f "bestvideo[height<=1080]" \
    -o "video/guests/g${idx}.%(ext)s" \
    "https://www.youtube.com/watch?v=${vid}" \
    && echo "DONE video g${idx}" || echo "FAIL video g${idx}"
done
echo "ALL GUEST DOWNLOADS FINISHED"

#!/usr/bin/env bash
# Download video-only 1080p streams for all 11 lectures, lecture 4 first (used to
# calibrate the slide extractor). Files land in video/vNN.<ext>, gitignored.
set -u
cd "$(dirname "$0")/../video" || exit 1

# "index:youtube_id", lecture 4 first for calibration
PAIRS=(
  "04:90raNpc11tQ"
  "01:X0k14u6pSxw" "02:5-Bb84eTTqQ" "03:Ef4R5s1LqoQ"
  "05:AdTGz8YnnlE" "06:qd6Ldsuu46I" "07:imSTfMJjp7M" "08:cTTmUZlOF2s"
  "09:dtofzDY9zuo" "10:CxhrjQuGEuE" "11:eL4lcy1KNzE"
)

for pair in "${PAIRS[@]}"; do
  idx="${pair%%:*}"; vid="${pair##*:}"
  if ls "v${idx}."* >/dev/null 2>&1; then
    echo "SKIP v${idx} (exists)"; continue
  fi
  echo "=== downloading v${idx} ($vid) ==="
  yt-dlp -q --no-warnings -f "bestvideo[height<=1080]" \
    -o "v${idx}.%(ext)s" "https://www.youtube.com/watch?v=${vid}" \
    && echo "DONE v${idx}" || echo "FAIL v${idx}"
done
echo "ALL VIDEO DOWNLOADS FINISHED"

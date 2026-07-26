#!/usr/bin/env bash
# Phase 7. Reconstruct each guest deck from its recording.
#
# The guest talks are Zoom screen-shares: the slide fills the frame but a live
# speaker webcam (and sometimes a column of participant thumbnails) is composited
# over the right-hand edge. Those pixels change every frame, so they are excluded
# from change detection via --ignore. The saved frames are the untouched originals.
set -u
cd "$(dirname "$0")/.." || exit 1

# rightmost 15% covers the speaker tile (top-right) and the thumbnail column
IGNORE="0.85,0.0,1.0,1.0"

SLUGS=(gupta xu kumar wagenmaker chi xiao reed vuong sharma beyer)

for i in "${!SLUGS[@]}"; do
  n=$((i + 1))
  idx=$(printf "%02d" "$n")
  slug="${SLUGS[$i]}"
  out="slides_png/guest${idx}_${slug}"
  if [ -f "$out/manifest.json" ]; then
    echo "SKIP g${idx} ${slug} (exists)"; continue
  fi
  echo "=== extracting g${idx} ${slug} ==="
  python3 scripts/extract_slides.py "video/guests/g${idx}.mp4" "$n" slides_png \
    --prefix "guest${idx}_${slug}" --ignore "$IGNORE" \
    && echo "DONE g${idx}" || echo "FAIL g${idx}"
done
echo "ALL GUEST SLIDE EXTRACTION FINISHED"

#!/usr/bin/env bash
# Build the book (or a subset) to PDF via pandoc + XeLaTeX.
# Usage: build.sh out.pdf chapters/01-introduction.md [more.md ...]
#        build.sh                      # -> build/robot-learning.pdf, all chapters
set -euo pipefail
export PATH="$HOME/.TinyTeX/bin/x86_64-linux:$HOME/miniforge3/bin:$PATH"
cd "$(dirname "$0")/.."

OUT="${1:-build/robot-learning.pdf}"; [ $# -gt 0 ] && shift || true
if [ $# -gt 0 ]; then FILES=("$@"); else FILES=(chapters/*.md); fi

pandoc "${FILES[@]}" \
  --from markdown+tex_math_dollars+raw_tex+fenced_divs+pipe_tables+implicit_figures \
  --pdf-engine=xelatex \
  --top-level-division=chapter \
  --toc --toc-depth=2 --number-sections \
  --metadata-file=build/crossref.yaml \
  --filter pandoc-crossref \
  -H build/preamble.tex \
  -V documentclass=book -V classoption=twoside -V fontsize=11pt \
  --resource-path=.:chapters \
  -o "$OUT"
echo "built $OUT"
export PATH="$HOME/miniforge3/bin:$PATH"
pdfinfo "$OUT" 2>/dev/null | grep -E "^Pages" || true

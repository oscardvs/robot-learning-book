#!/usr/bin/env python3
"""OCR reconstructed slides into a greppable text layer per lecture.

This stands in for `pdftotext` on the (unavailable) PDF. It is a *secondary*
source: equations and symbols OCR poorly and must be read from the images
directly. Its job is to make slide text searchable for terminology
reconciliation (hard rule #4) and the final verification pass.

Writes slides/lecture{NN}.txt with one block per slide:

    ===== slide 007  [08:24] =====
    <ocr text>

Usage: ocr_slides.py <slides_png_root> <lecture_index> <out_dir>
"""

import json
import subprocess
import sys
from pathlib import Path


def fmt_ts(t):
    t = int(round(t))
    return f"{t // 60:02d}:{t % 60:02d}"


def ocr(path):
    out = subprocess.run(
        ["tesseract", str(path), "stdout", "--psm", "3", "-l", "eng"],
        capture_output=True, text=True,
    )
    lines = [ln.rstrip() for ln in out.stdout.splitlines()]
    # collapse runs of blank lines
    cleaned, blank = [], False
    for ln in lines:
        if ln.strip():
            cleaned.append(ln); blank = False
        elif not blank:
            cleaned.append(""); blank = True
    return "\n".join(cleaned).strip()


def main(root, index, out_dir):
    lec_dir = Path(root) / f"lecture{int(index):02d}"
    manifest = json.loads((lec_dir / "manifest.json").read_text())
    out_dir = Path(out_dir); out_dir.mkdir(parents=True, exist_ok=True)

    blocks = [f"# Lecture {index} — slide OCR (secondary source; verify math visually)",
              f"# {sum(1 for s in manifest['slides'] if s['kind']=='slide')} slides\n"]
    for s in manifest["slides"]:
        if s["kind"] != "slide":
            blocks.append(f"===== [{fmt_ts(s['t'])}] revisit of slide {s['dup_of']} =====\n")
            continue
        text = ocr(lec_dir / s["file"])
        blocks.append(f"===== slide {s['n']:03d}  [{fmt_ts(s['t_start'])}] =====\n{text}\n")

    out_path = out_dir / f"lecture{int(index):02d}.txt"
    out_path.write_text("\n".join(blocks) + "\n")
    words = sum(len(b.split()) for b in blocks)
    print(f"L{int(index):02d}: OCR -> {out_path} ({words:,} words)")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3])

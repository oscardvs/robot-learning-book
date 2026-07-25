#!/usr/bin/env python3
"""Build contact-sheet montages of a lecture's reconstructed slides.

Lets me view every slide for coverage in a few image reads; I then open
individual full-res frames for slides with equations or fine detail.

Each cell is labelled with the reconstructed slide number and timestamp so I
can cross-reference the transcript and cite locations.

Usage: montage_slides.py <slides_png_root> <lecture_index> [--cols 3] [--rows 3]
       [--cell 660]
"""

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def load_font(size):
    for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def fmt_ts(t):
    t = int(round(t))
    return f"{t // 60:02d}:{t % 60:02d}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("root")
    ap.add_argument("index", type=int)
    ap.add_argument("--cols", type=int, default=3)
    ap.add_argument("--rows", type=int, default=3)
    ap.add_argument("--cell", type=int, default=660)
    args = ap.parse_args()

    lec_dir = Path(args.root) / f"lecture{args.index:02d}"
    manifest = json.loads((lec_dir / "manifest.json").read_text())
    slides = [s for s in manifest["slides"] if s["kind"] == "slide"]

    cw = args.cell
    ch = int(cw * 9 / 16)
    band = 30
    font = load_font(20)
    per = args.cols * args.rows
    out_dir = lec_dir / "montages"
    out_dir.mkdir(exist_ok=True)

    sheets = []
    for start in range(0, len(slides), per):
        group = slides[start:start + per]
        sheet_no = start // per + 1
        W = args.cols * cw
        H = args.rows * (ch + band)
        sheet = Image.new("RGB", (W, H), "white")
        draw = ImageDraw.Draw(sheet)
        for k, s in enumerate(group):
            r, c = divmod(k, args.cols)
            x, y = c * cw, r * (ch + band)
            img = Image.open(lec_dir / s["file"]).convert("RGB")
            img.thumbnail((cw, ch))
            ox = x + (cw - img.width) // 2
            oy = y + band + (ch - img.height) // 2
            sheet.paste(img, (ox, oy))
            label = f"slide {s['n']:03d}   [{fmt_ts(s['t_start'])}]   (pg. see corner)"
            draw.rectangle([x, y, x + cw, y + band], fill="#7a1f2b")
            draw.text((x + 8, y + 5), label, fill="white", font=font)
            draw.rectangle([x, y, x + cw - 1, y + band + ch - 1], outline="#cccccc")
        path = out_dir / f"sheet_{sheet_no:02d}.jpg"
        sheet.save(path, quality=88)
        sheets.append((path, len(group)))

    for path, n in sheets:
        print(f"{path}  ({n} slides)")


if __name__ == "__main__":
    main()

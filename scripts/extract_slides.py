#!/usr/bin/env python3
"""Reconstruct a lecture's slide deck from its screen-capture recording.

The ETH Robot Learning recordings are full-screen 1080p slide captures. This
script recovers the deck without the (unavailable) PDF password:

  1. Sample small grayscale frames at `fps` via ffmpeg.
  2. Find *stable dwell periods* — runs of near-identical frames. A slide the
     lecturer talks over is a long stable run; transitions/crossfades are
     unstable and fall out naturally.
  3. Collapse build-up animations: if slide B preserves almost all of slide A's
     dark (content) pixels and adds more, B is a later build step of the same
     logical slide, so A is dropped but its reveal timestamp is kept.
  4. Flag revisits: a later slide whose content matches an earlier one is marked
     dup_of that slide rather than emitted as new.
  5. Pull the full-resolution 1080p frame for each kept slide via a single ffmpeg
     seek, and write a manifest (json + md) with timestamps.

Output:
  slides_png/lecture{NN}/slide_{k:03d}.jpg    full-res kept slides, in order
  slides_png/lecture{NN}/manifest.json        machine-readable
  slides_png/lecture{NN}/manifest.md          human-readable slide->timestamp map

The guest recordings differ from the main lectures in one way that breaks step 2:
they are Zoom screen-shares with a *live speaker webcam* composited into the
corner. Those pixels change every frame, so no run is ever stable and the
extractor returns almost nothing. `--ignore` blanks one or more rectangles
before any comparison is made, which restores stable-run detection. The saved
full-resolution frame is always the untouched original, so nothing is lost from
the image itself — the mask only governs *when* a frame is judged stable.

Usage: extract_slides.py <video> <lecture_index> <out_root> [--fps F]
       [--dwell S] [--change T] [--preserve P] [--dark D]
       [--ignore x0,y0,x1,y1]...   fractional 0-1 rects, repeatable
       [--prefix NAME]             output dir name instead of lecture{NN}
"""

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image


def sample_frames(video, fps, workdir):
    """Extract downscaled grayscale frames; return (timestamps, stack)."""
    pattern = str(workdir / "f_%06d.jpg")
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", str(video),
         "-vf", f"fps={fps},scale=384:216,format=gray", "-q:v", "4", pattern],
        check=True,
    )
    files = sorted(workdir.glob("f_*.jpg"))
    if not files:
        raise SystemExit("no frames extracted")
    stack = np.stack([np.asarray(Image.open(f), dtype=np.float32) for f in files])
    times = np.array([(int(f.stem[2:]) - 1) / fps for f in files])
    return times, stack


def parse_rect(spec):
    """'x0,y0,x1,y1' as fractions of width/height -> tuple of four floats."""
    try:
        x0, y0, x1, y1 = (float(v) for v in spec.split(","))
    except ValueError:
        raise SystemExit(f"--ignore expects x0,y0,x1,y1 fractions, got {spec!r}")
    if not (0 <= x0 < x1 <= 1 and 0 <= y0 < y1 <= 1):
        raise SystemExit(f"--ignore rect out of range or inverted: {spec!r}")
    return x0, y0, x1, y1


def blank_regions(stack, rects, fill=255.0):
    """Overwrite ignored rectangles with a constant so they never register as
    change and never count as content. Operates on the downscaled stack only."""
    if not rects:
        return stack
    # frames are (N, H, W) when PIL hands back mode 'L' and (N, H, W, C) when the
    # JPEG round-trips as RGB; only the two spatial axes matter here
    h, w = stack.shape[1], stack.shape[2]
    out = stack.copy()
    for x0, y0, x1, y1 in rects:
        c0, c1 = int(round(x0 * w)), int(round(x1 * w))
        r0, r1 = int(round(y0 * h)), int(round(y1 * h))
        out[:, r0:r1, c0:c1] = fill
    return out


def stable_runs(stack, times, change, min_dwell, fps):
    """Group frames into stable dwell periods. Return list of dicts."""
    n = len(stack)
    runs, i = [], 0
    min_len = max(1, int(round(min_dwell * fps)))
    while i < n:
        anchor = stack[i]
        j = i + 1
        while j < n and np.mean((stack[j] - anchor) ** 2) < change:
            j += 1
        # a run is frames [i, j); representative = middle frame
        if (j - i) >= min_len:
            mid = (i + j) // 2
            runs.append({"t_start": float(times[i]),
                         "t_end": float(times[j - 1]),
                         "rep_index": mid,
                         "frame": stack[mid]})
        i = j
    return runs


def dark_mask(frame, dark):
    return frame < dark


def is_build_of(prev, cur, preserve, dark, min_added=12):
    """True if `cur` is a later build step of `prev` (superset of content)."""
    a, b = dark_mask(prev, dark), dark_mask(cur, dark)
    a_sum = int(a.sum())
    if a_sum < 20:                      # prev nearly blank -> treat cur as new
        return False
    preserved = int((a & b).sum()) / a_sum
    added = int((b & ~a).sum())
    return preserved >= preserve and added >= min_added


def similar(prev, cur, change):
    return np.mean((prev - cur) ** 2) < change


def collapse(runs, preserve, dark, change):
    """Merge build chains; flag revisits. Return kept slides with metadata."""
    kept = []
    for run in runs:
        merged = False
        if kept:
            last = kept[-1]
            if is_build_of(last["frame"], run["frame"], preserve, dark):
                # same logical slide, further built: replace rep, keep reveal ts
                run["build_ts"] = last["build_ts"] + [run["t_start"]]
                run["first_seen"] = last["first_seen"]
                run["dup_of"] = last.get("dup_of")   # inherit chain's dup status
                kept[-1] = run
                merged = True
        if merged:
            continue
        run.setdefault("build_ts", [run["t_start"]])
        run.setdefault("first_seen", run["t_start"])
        # revisit detection against all earlier kept slides
        dup_of = None
        for k, prior in enumerate(kept):
            if similar(prior["frame"], run["frame"], change):
                dup_of = k
                break
        run["dup_of"] = dup_of
        kept.append(run)
    return kept


def grab_fullres(video, t, out_path):
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t:.2f}", "-i", str(video),
         "-frames:v", "1", "-q:v", "2", str(out_path)],
        check=True,
    )


def fmt_ts(t):
    t = int(round(t))
    return f"{t // 60:02d}:{t % 60:02d}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("index", type=int)
    ap.add_argument("out_root")
    ap.add_argument("--fps", type=float, default=1.0)
    ap.add_argument("--dwell", type=float, default=2.5, help="min slide dwell (s)")
    ap.add_argument("--change", type=float, default=18.0, help="MSE change thresh")
    ap.add_argument("--preserve", type=float, default=0.85, help="build preserve ratio")
    ap.add_argument("--dark", type=float, default=110.0, help="dark-pixel gray cutoff")
    ap.add_argument("--emit-dups", action="store_true", help="also save revisit frames")
    ap.add_argument("--ignore", action="append", default=[], metavar="x0,y0,x1,y1",
                    help="fractional rect excluded from change detection; repeatable")
    ap.add_argument("--prefix", default=None,
                    help="output directory name (default: lecture{NN})")
    args = ap.parse_args()

    rects = [parse_rect(s) for s in args.ignore]
    name = args.prefix if args.prefix else f"lecture{args.index:02d}"
    out_dir = Path(args.out_root) / name
    out_dir.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        times, stack = sample_frames(args.video, args.fps, Path(tmp))
        stack = blank_regions(stack, rects)
        runs = stable_runs(stack, times, args.change, args.dwell, args.fps)
        kept = collapse(runs, args.preserve, args.dark, args.change)

    slides, slide_no = [], 0
    for entry in kept:
        is_dup = entry["dup_of"] is not None
        if is_dup and not args.emit_dups:
            slides.append({"kind": "revisit", "dup_of": entry["dup_of"] + 1,
                           "t": entry["t_start"], "file": None,
                           "build_ts": entry["build_ts"]})
            continue
        slide_no += 1
        fname = f"slide_{slide_no:03d}.jpg"
        grab_fullres(args.video, entry["t_start"] + 0.4, out_dir / fname)
        slides.append({"kind": "slide", "n": slide_no,
                       "t_start": entry["t_start"], "t_end": entry["t_end"],
                       "file": fname, "dup_of": None,
                       "build_ts": entry["build_ts"]})

    (out_dir / "manifest.json").write_text(json.dumps(
        {"lecture": args.index, "params": vars(args), "slides": slides}, indent=2))

    lines = [f"# {name} — reconstructed slide manifest",
             f"# {slide_no} unique slides from {len(kept)} stable states "
             f"(fps={args.fps}, dwell={args.dwell}s)", ""]
    for s in slides:
        if s["kind"] == "revisit":
            lines.append(f"[{fmt_ts(s['t'])}] (revisit of slide {s['dup_of']})")
        else:
            builds = ""
            if len(s["build_ts"]) > 1:
                builds = "  builds@ " + ", ".join(fmt_ts(b) for b in s["build_ts"])
            lines.append(f"slide {s['n']:>3}  [{fmt_ts(s['t_start'])}"
                         f"–{fmt_ts(s['t_end'])}]  {s['file']}{builds}")
    (out_dir / "manifest.md").write_text("\n".join(lines) + "\n")

    print(f"L{args.index:02d}: {slide_no} slides, "
          f"{sum(1 for s in slides if s['kind']=='revisit')} revisits, "
          f"{len(kept)} stable states -> {out_dir}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Clean YouTube auto-caption VTT files into readable, citable plain text.

YouTube auto-captions use a rolling two-line window: each spoken line appears
first as the "incoming" line of one cue (with per-word <00:00:00.000><c> timing
tags) and then again as the "settled" top line of the following cues. Raw VTT is
therefore roughly 2x duplicated.

This script:
  * strips the WEBVTT header, cue-timing lines and all inline tags
  * de-duplicates the rolling window (a line is dropped if it repeats one of the
    last few emitted lines)
  * keeps a [MM:SS] marker every ~60 s so the book can cite locations
  * writes NN_slug.txt

Usage: clean_vtt.py <vtt_dir> <out_dir>
"""

import html
import re
import sys
import textwrap
from collections import deque
from pathlib import Path

TAG_RE = re.compile(r"<[^>]*>")
CUE_RE = re.compile(
    r"^(\d\d):(\d\d):(\d\d)\.(\d\d\d)\s+-->\s+(\d\d):(\d\d):(\d\d)\.(\d\d\d)"
)
WS_RE = re.compile(r"\s+")

MARKER_INTERVAL = 60.0  # seconds
DEDUP_HISTORY = 3       # compare against this many recently emitted lines

# playlist index -> (output slug, human title, youtube id)
LECTURES = {
    1:  ("introduction",         "Introduction to Robot Learning",              "X0k14u6pSxw"),
    2:  ("control_mdp",          "Robot Control & Markov Decision Processes",   "5-Bb84eTTqQ"),
    3:  ("imitation",            "Imitation Learning",                          "Ef4R5s1LqoQ"),
    4:  ("rl_I",                 "Reinforcement Learning I",                    "90raNpc11tQ"),
    5:  ("rl_II",                "Reinforcement Learning II",                   "AdTGz8YnnlE"),
    6:  ("generative",           "Generative Models",                           "qd6Ldsuu46I"),
    7:  ("sequence_modeling",    "Sequence Modeling & Transformers",            "imSTfMJjp7M"),
    8:  ("world_models",         "World Models",                                "cTTmUZlOF2s"),
    9:  ("generalist_policies",  "Generalist Robot Policies",                   "dtofzDY9zuo"),
    10: ("reasoning",            "Embodied Reasoning and Test-time Scaling",    "CxhrjQuGEuE"),
    11: ("frontiers",            "Frontier & Open Problems",                    "eL4lcy1KNzE"),
}


def parse_cues(path):
    """Return [(start_seconds, [raw_text_lines])] in file order."""
    cues = []
    current = None
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        match = CUE_RE.match(line)
        if match:
            h, m, s, ms = (int(match.group(i)) for i in (1, 2, 3, 4))
            current = (h * 3600 + m * 60 + s + ms / 1000.0, [])
            cues.append(current)
        elif current is not None:
            if line.strip() == "":
                current = None  # blank line closes the cue block
            else:
                current[1].append(line)
    return cues


def dedupe(cues):
    """Collapse the rolling window into an ordered list of (start, line)."""
    out = []
    recent = deque(maxlen=DEDUP_HISTORY)
    for start, raw_lines in cues:
        for raw in raw_lines:
            text = WS_RE.sub(" ", html.unescape(TAG_RE.sub("", raw))).strip()
            if not text or text in recent:
                continue
            out.append((start, text))
            recent.append(text)
    return out


def render(lines, header):
    """Group lines into ~60 s blocks prefixed with [MM:SS]."""
    blocks = []
    buffer, block_start, next_marker = [], 0.0, 0.0
    for start, text in lines:
        if start >= next_marker:
            if buffer:
                blocks.append((block_start, " ".join(buffer)))
                buffer = []
            block_start = start
            while next_marker <= start:
                next_marker += MARKER_INTERVAL
        buffer.append(text)
    if buffer:
        blocks.append((block_start, " ".join(buffer)))

    chunks = [header]
    for start, text in blocks:
        stamp = f"[{int(start) // 60:02d}:{int(start) % 60:02d}]"
        wrapped = textwrap.fill(
            text, width=96, initial_indent=stamp + " ", subsequent_indent=""
        )
        chunks.append(wrapped)
    return "\n\n".join(chunks) + "\n"


def main(vtt_dir, out_dir):
    vtt_dir, out_dir = Path(vtt_dir), Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    results = []
    for path in sorted(vtt_dir.glob("*.vtt")):
        index = int(path.name[:2])
        slug, title, video_id = LECTURES[index]

        cues = parse_cues(path)
        lines = dedupe(cues)
        raw_words = sum(
            len(WS_RE.sub(" ", TAG_RE.sub("", ln)).split())
            for _, block in cues
            for ln in block
        )
        words = sum(len(text.split()) for _, text in lines)
        duration = max((s for s, _ in cues), default=0.0)

        header = (
            f"# Lecture {index}: {title}\n"
            f"# ETH Zurich 263-5911-00L Robot Learning, Spring 2026\n"
            f"# Source: https://www.youtube.com/watch?v={video_id}\n"
            f"# Transcript: YouTube auto-generated captions (no human subtitles exist).\n"
            f"# Technical terms are unreliable here - reconcile against the slides."
        )
        out_path = out_dir / f"{index:02d}_{slug}.txt"
        out_path.write_text(render(lines, header), encoding="utf-8")

        results.append((index, slug, duration, raw_words, words, out_path))

    print(f"{'#':>3}  {'lecture':<22} {'mins':>5} {'raw':>7} {'clean':>7} {'ratio':>6} {'wpm':>5}")
    print("-" * 66)
    total_clean = 0
    for index, slug, duration, raw_words, words, _ in results:
        mins = duration / 60.0
        ratio = raw_words / words if words else 0.0
        wpm = words / mins if mins else 0.0
        total_clean += words
        print(f"{index:>3}  {slug:<22} {mins:>5.1f} {raw_words:>7,} {words:>7,} "
              f"{ratio:>6.2f} {wpm:>5.0f}")
    print("-" * 66)
    print(f"{'':>3}  {'TOTAL':<22} {'':>5} {'':>7} {total_clean:>7,}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

#!/usr/bin/env python3
"""Clean the guest-lecture auto-caption VTTs, reusing clean_vtt.py's machinery.

Same rolling-window de-duplication and [MM:SS] markers as the main lectures, so
the guest transcripts are citable in exactly the same way. Speaking rate is
printed for the same sanity check: 135-156 wpm on the main lectures, and ~400 wpm
would mean de-duplication silently failed.

Usage: clean_vtt_guests.py <vtt_dir> <out_dir>
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from clean_vtt import WS_RE, TAG_RE, dedupe, parse_cues, render  # noqa: E402

# guest index -> (slug, speaker, affiliation, talk title, youtube id)
GUESTS = {
    1:  ("gupta",      "Abhishek Gupta",   "University of Washington",
         "Simulation for Robotic Manipulation, without the Pain",   "aG8NPTPhwkE"),
    2:  ("xu",         "Danfei Xu",        "Georgia Tech",
         "Human Data as a Foundation for Robot Learning",           "qvTP6T5oq1w"),
    3:  ("kumar",      "Aviral Kumar",     "CMU & Google DeepMind",
         "How to Replicate the LLM Recipe in Robot Learning",       "fHHLmTu9sFk"),
    4:  ("wagenmaker", "Andrew Wagenmaker", "UC Berkeley",
         "Robots That Learn From Experience",                       "CPmTpXA5azw"),
    5:  ("chi",        "Cheng Chi",        "Sunday Robotics",
         "Robotics Beyond Algorithms",                              "tvFvIEOBKfM"),
    6:  ("xiao",       "Ted Xiao",         "Prometheus",
         "Three Eras of Robot Learning",                            "VS7Ulaugevg"),
    7:  ("reed",       "Scott Reed",       "NVIDIA GEAR",
         "What is the right Backbone for Embodied Agents?",         "fqkp_wkov6M"),
    8:  ("vuong",      "Quan Vuong",       "Physical Intelligence",
         "π0.7, A Generalist Model with Emergent Capabilities", "pzolgvyWEFY"),
    9:  ("sharma",     "Archit Sharma",    "Google DeepMind",
         "Scaling Test-Time Compute at the Frontier",               "oBEkY6NeE_o"),
    10: ("beyer",      "Lucas Beyer",      "Meta Superintelligence Labs",
         "Vision in the Age of LLMs",                               "0XB7fNS_ONg"),
}


def main(vtt_dir, out_dir):
    vtt_dir, out_dir = Path(vtt_dir), Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    results = []
    for path in sorted(vtt_dir.glob("g*.vtt")):
        index = int(path.name[1:3])
        slug, speaker, affiliation, title, video_id = GUESTS[index]

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
            f"# Guest lecture {index}: {speaker} ({affiliation})\n"
            f"# \"{title}\"\n"
            f"# ETH Zurich 263-5911-00L Robot Learning, Spring 2026\n"
            f"# Source: https://www.youtube.com/watch?v={video_id}\n"
            f"# Transcript: YouTube auto-generated captions (no human subtitles exist).\n"
            f"# Technical terms are unreliable here - reconcile against the slides."
        )
        out_path = out_dir / f"g{index:02d}_{slug}.txt"
        out_path.write_text(render(lines, header), encoding="utf-8")

        results.append((index, slug, duration, raw_words, words))

    print(f"{'#':>3}  {'guest':<12} {'mins':>5} {'raw':>7} {'clean':>7} {'ratio':>6} {'wpm':>5}")
    print("-" * 56)
    total = 0
    for index, slug, duration, raw_words, words in results:
        mins = duration / 60.0
        ratio = raw_words / words if words else 0.0
        wpm = words / mins if mins else 0.0
        total += words
        print(f"{index:>3}  {slug:<12} {mins:>5.1f} {raw_words:>7,} {words:>7,} "
              f"{ratio:>6.2f} {wpm:>5.0f}")
    print("-" * 56)
    print(f"{'':>3}  {'TOTAL':<12} {'':>5} {'':>7} {total:>7,}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

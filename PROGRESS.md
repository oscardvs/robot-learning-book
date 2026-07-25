# PROGRESS — Robot Learning textbook

Unofficial textbook compiled from ETH Zürich **263-5911-00L, *Robot Learning: From
Fundamentals to Foundation Models*** (Spring 2026), lectured by **Oier Mees**;
course mentor **Marc Pollefeys**.

- Course page: <https://cvg.ethz.ch/lectures/Robot-Learning/>
- Main playlist: <https://www.youtube.com/playlist?list=PLPU18BnWYUZJx3_d901-GD6BGpeWwE2vx>
- Guest playlist: <https://www.youtube.com/playlist?list=PLPU18BnWYUZIpmc2GuFlSXVGJxXZVeZ2B>
- Course GitHub: `mees-robot-learning-course/ethz-course-2026`

**Current status: Phases 3 and 4 COMPLETE — all 11 per-lecture notes written and
`notes/notation.md` settled. Next: Phase 5, chapters 2–11 in the approved Ch.1 voice.**

### The slide-password problem and how it was solved
The 11 slide PDFs are AES-256 (`R=6`) with a *user* password that the user does
not have. The password is shown on-screen in Lecture 2 (~00:36, "here is the login
details") but the course **redacted the login/pwd values before uploading to
YouTube** — the fields are blank in the public video, so it is not recoverable, and
recovering deliberately-hidden credentials is out of scope anyway. Wayback has no
archived PDF. **No cracking attempted.**

**Chosen fix (user-approved): reconstruct each deck from the 1080p recordings.**
The recordings are full-screen slide captures. `scripts/extract_slides.py` recovers
the decks; verified pixel-perfect and legible, including animated/interactive demo
slides captured at their final built state. This *satisfies hard rule #4* — slide
images are the ground truth for notation; I read equations from the images, not the
OCR. In parallel the user may email ETH CVG for the password; if it arrives, swap in
the clean PDFs (`qpdf --decrypt`) and keep the frames as figures.

---

## Phase checklist

- [x] **Phase 0 — Setup.** Dirs, git, tooling. Build chain smoke-tested end to end.
- [x] **Phase 1 — Transcripts.** 11/11 downloaded, cleaned, verified.
- [x] **Phase 2 — Slides.** Reconstructed from recordings (password unavailable —
      see below). **484 slides** across 11 lectures, all extracted + OCR'd + montaged.
- [x] **Phase 3 — Per-lecture notes.** All 11 done.
- [x] **Phase 4 — Notation pass.** `notes/notation.md`. Resolved the actor/critic
      θ↔φ clash (θ = deployed model, φ = critic/encoder; Ch.4's DDPG flips) and the
      diffusion step index (k = denoising step, λ = flow time), plus ~20 further
      collisions found across the notes. §7 is the Phase-9 slide-deviation checklist.
- [~] **Phase 5 — Chapters.** Ch.1 drafted, voice approved 2026-07-25. Chs 2–11 to
      write from the notes, in that voice, following `notes/notation.md`.
- [ ] **Phase 6 — Front/back matter**
- [ ] **Phase 7 — Guest lectures** (optional — ask before starting)
- [ ] **Phase 8 — PDF build**
- [ ] **Phase 9 — Verification**

## Per-lecture progress

| # | Lecture | Transcript | Slides | Notes | Chapter |
|---|---------|-----------|--------|-------|---------|
| 1 | Introduction to Robot Learning | ✅ 9,480 w | ✅ 44 | ✅ | ✅ 12 pp (voice ckpt) |
| 2 | Robot Control & MDPs | ✅ 7,085 w | ✅ 46 | ✅ | ✅ 26 pp |
| 3 | Imitation Learning | ✅ 7,842 w | ✅ 49 | ✅ | ✅ 22 pp |
| 4 | Reinforcement Learning I | ✅ 7,651 w | ✅ 48 | ✅ | ☐ |
| 5 | Reinforcement Learning II | ✅ 7,482 w | ✅ 33 | ✅ | ☐ |
| 6 | Generative Models | ✅ 7,437 w | ✅ 37 | ✅ | ☐ |
| 7 | Sequence Modeling & Transformers | ✅ 8,104 w | ✅ 40 | ✅ | ☐ |
| 8 | World Models | ✅ 9,791 w | ✅ 45 | ✅ | ☐ |
| 9 | Generalist Robot Policies | ✅ 9,107 w | ✅ 55 | ✅ | ☐ |
| 10 | Embodied Reasoning & Test-time Scaling | ✅ 7,491 w | ✅ 44 | ✅ | ☐ |
| 11 | Frontier & Open Problems | ✅ 9,700 w | ✅ 43 | ✅ | ☐ |

Total cleaned transcript: **91,170 words** across 10 h 25 min of recording.

---

## Phase 1 notes

Only **automatic** captions exist — no human-written subtitles for any of the 11
videos (`yt-dlp --list-subs` shows an "automatic captions" section only). The
`en` and `en-orig` tracks were byte-identical; the `en` duplicates were deleted.

`scripts/clean_vtt.py` strips the WEBVTT header, cue timings and inline
`<c>`/`<00:00:00.000>` tags, collapses the rolling window (a line is dropped if it
matches one of the last 3 emitted lines), unescapes HTML entities, and writes a
`[MM:SS]` marker every ~60 s.

De-duplication verified two ways: the raw-to-clean ratio is 2.96–2.98× on every
lecture (uniform, as expected from a 3-way rolling repeat), and the resulting
speaking rate is 135–156 wpm, which is a natural lecture pace. A failed de-dup
would show ~400 wpm.

**Caption reliability is poor for technical terms**, as expected. Confirmed
manglings so far: "Oier Mees" → "Oyer Mes"/"Oyer"; "Freiburg" → "Framework".
Slides are ground truth for all notation and terminology (hard rule #4).

## Phase 2 notes — BLOCKED

All 11 decks downloaded from `https://cvg.ethz.ch/lectures/Robot-Learning/lectures/`
(HTTP 200, 0.8–5.2 MB each, stored in `slides/`). Every one reports:

```
$ qpdf --show-encryption slides/lecture4_rl_I.pdf
Incorrect password supplied
R = 6
P = -1340
```

`R = 6` is AES-256. The empty string is not the user password, so the files
cannot be opened, and `pdftotext` fails with "Incorrect password". Per the task's
hard rules, no cracking was attempted — the password was requested from the user.

Everything downstream (Phases 3–9) depends on this.

---

## Phase 5 notes — chapter build gotchas

`algorithm2e` boxes: use **`\KwIn` / `\KwOut`**, not the preamble's
`\SetKwInOut`-defined `\Input` / `\Output`. The latter aligns its colon in a fixed-width
box that wraps in this 7in geometry, leaving a stray `:` on its own line. `\KwIn`/`\KwOut`
print "Input:" / "Output:" inline and render correctly.

Cross-chapter `@eq:` / `@fig:` references only resolve when the chapters are built
together — a single-chapter build reports "undefined references", which is expected and
not a defect. Verify page counts with two or more chapters in the same run.

## Phase 0 notes — toolchain

No passwordless `sudo`, so `apt install` was unavailable. Worked around entirely
in userspace:

| Need | Source | Status |
|---|---|---|
| `pdftotext`, `pdftoppm` | system poppler | already present |
| `yt-dlp`, `pypdf` | pip | ✅ |
| `qpdf`, `pandoc` 3.10 | mamba / conda-forge | ✅ |
| XeLaTeX (TeX Live 2026) | TinyTeX → `~/.TinyTeX` | ✅ |
| `algorithm2e`, `titlesec`, `sidenotes`, Libertinus, TeX Gyre | `tlmgr` | ✅ |

`tlmgr` fonts are not on the system font path by default, so
`~/.config/fontconfig/fonts.conf` was added to expose `~/.TinyTeX/.../fonts` and
`fc-cache -f` run. Without this, `fontspec` fails with "The font *Libertinus
Serif* cannot be found".

Add to PATH when building: `export PATH="$HOME/.TinyTeX/bin/x86_64-linux:$PATH"`.

Smoke test (`pandoc → xelatex`, book class, Libertinus Serif + Libertinus Math,
`algorithm2e` ruled/vlined/numbered box, display math) builds and renders
correctly. Phase 8 is de-risked.

## Phase 6 groundwork (done early, not blocked by slides)

`notes/reading_list.md` — all **30** assigned papers (3 × weeks 2–11) and the
guest roster, transcribed from the course page. Note the brief estimated ~33.

## Layout

```
transcripts/  NN_slug.txt (cleaned) + NN_*.en-orig.vtt (raw)
slides/       lectureN_*.pdf (encrypted) -> lectureN.txt once unlocked
slides_png/   lectureN/page-NN.jpg rasterised slides
notes/        lectureNN.md, notation.md, course_page.txt
chapters/     NN-slug.md
build/        robot-learning.pdf, course_page.html
scripts/      clean_vtt.py
```

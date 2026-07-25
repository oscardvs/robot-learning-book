# PROGRESS — Robot Learning textbook

Unofficial textbook compiled from ETH Zürich **263-5911-00L, *Robot Learning: From
Fundamentals to Foundation Models*** (Spring 2026), lectured by **Oier Mees**;
course mentor **Marc Pollefeys**.

- Course page: <https://cvg.ethz.ch/lectures/Robot-Learning/>
- Main playlist: <https://www.youtube.com/playlist?list=PLPU18BnWYUZJx3_d901-GD6BGpeWwE2vx>
- Guest playlist: <https://www.youtube.com/playlist?list=PLPU18BnWYUZIpmc2GuFlSXVGJxXZVeZ2B>
- Course GitHub: `mees-robot-learning-course/ethz-course-2026`

**Current status: Phase 2 — slides reconstructed from the recordings (no password).
Phase 3 (per-lecture notes) starting.**

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
- [ ] **Phase 2 — Slides.** ⛔ All 11 PDFs are AES-256 encrypted with a *user*
      password. Downloaded but unreadable. **Asked the user for the password.**
- [~] **Phase 3 — Per-lecture notes.** L1 done (`notes/lecture01.md`). L2–11 pending.
- [ ] **Phase 4 — Notation pass** (needs all notes; L1 has almost none)
- [~] **Phase 5 — Chapters.** Drafting **Ch.1 early** from L1 notes to get the voice
      approved before investing in the rest (checkpoint). Notation provisional until Ph4.
- [ ] **Phase 6 — Front/back matter**
- [ ] **Phase 7 — Guest lectures** (optional — ask before starting)
- [ ] **Phase 8 — PDF build**
- [ ] **Phase 9 — Verification**

## Per-lecture progress

| # | Lecture | Transcript | Slides | Notes | Chapter |
|---|---------|-----------|--------|-------|---------|
| 1 | Introduction to Robot Learning | ✅ 9,480 w | ✅ 44 (rebuilt) | ✅ | draft |
| 2 | Robot Control & MDPs | ✅ 7,085 w | 🔒 locked | ☐ | ☐ |
| 3 | Imitation Learning | ✅ 7,842 w | 🔒 locked | ☐ | ☐ |
| 4 | Reinforcement Learning I | ✅ 7,651 w | 🔒 locked | ☐ | ☐ |
| 5 | Reinforcement Learning II | ✅ 7,482 w | 🔒 locked | ☐ | ☐ |
| 6 | Generative Models | ✅ 7,437 w | 🔒 locked | ☐ | ☐ |
| 7 | Sequence Modeling & Transformers | ✅ 8,104 w | 🔒 locked | ☐ | ☐ |
| 8 | World Models | ✅ 9,791 w | 🔒 locked | ☐ | ☐ |
| 9 | Generalist Robot Policies | ✅ 9,107 w | 🔒 locked | ☐ | ☐ |
| 10 | Embodied Reasoning & Test-time Scaling | ✅ 7,491 w | 🔒 locked | ☐ | ☐ |
| 11 | Frontier & Open Problems | ✅ 9,700 w | 🔒 locked | ☐ | ☐ |

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

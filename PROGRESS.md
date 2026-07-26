# PROGRESS — Robot Learning textbook

Unofficial textbook compiled from ETH Zürich **263-5911-00L, *Robot Learning: From
Fundamentals to Foundation Models*** (Spring 2026), lectured by **Oier Mees**;
course mentor **Marc Pollefeys**.

- Course page: <https://cvg.ethz.ch/lectures/Robot-Learning/>
- Main playlist: <https://www.youtube.com/playlist?list=PLPU18BnWYUZJx3_d901-GD6BGpeWwE2vx>
- Guest playlist: <https://www.youtube.com/playlist?list=PLPU18BnWYUZIpmc2GuFlSXVGJxXZVeZ2B>
- Course GitHub: `mees-robot-learning-course/ethz-course-2026`

**Current status: ALL PHASES COMPLETE, including Phase 7. `build/robot-learning.pdf` — 324 pages.**
Phase 7 added two chapters from the guest track (Chs 12 and 13) and pushed the book past the
brief's 300-page target on real course material, not padding.

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
- [x] **Phase 5 — Chapters.** All 11 written. Full book builds clean: **224 pp**,
      zero overfull boxes, banned-word grep clean, all cross-references resolved.
- [x] **Phase 6 — Front/back matter.** `chapters/00-preface.md` (what the book is, who
      it is for, and a full disclosure of how the sources were obtained), plus unnumbered
      `14-notation.md`, `15-glossary.md` (158 terms), `16-bibliography.md` (every work
      named, by chapter, with an *Unresolved* section) and `17-index.md` (198 entries),
      generated from the rendered PDF by `scripts/make_index.py`. **These four were
      renumbered from 12–15 when Phase 7 took chapter numbers 12 and 13** — file order is
      the glob order in `build.sh`, and `make_index.py` hardcodes `chapters/17-index.md`.
- [x] **Phase 7 — Guest lectures.** 10 of 11 talks recovered and written up as
      `chapters/12-guest-lectures-i.md` (weeks 2–6) and `13-guest-lectures-ii.md` (weeks 7–11).
      **Dieter Fox's week-12 talk is unrecoverable** — the playlist entry is a *private* video and
      the course page lists no recording, so it is absent from the book by design, and recorded as
      such in the bibliography's *Unresolved* section. See the Phase 7 notes below.
- [x] **Phase 8 — PDF build.** `build/robot-learning.pdf` — **272 pages**, zero overfull
      boxes, no LaTeX warnings, all cross-references resolved.
- [x] **Phase 9 — Verification.** Results in the report below.

## Per-lecture progress

| # | Lecture | Transcript | Slides | Notes | Chapter |
|---|---------|-----------|--------|-------|---------|
| 1 | Introduction to Robot Learning | ✅ 9,480 w | ✅ 44 | ✅ | ✅ 12 pp (voice ckpt) |
| 2 | Robot Control & MDPs | ✅ 7,085 w | ✅ 46 | ✅ | ✅ 24 pp |
| 3 | Imitation Learning | ✅ 7,842 w | ✅ 49 | ✅ | ✅ 22 pp |
| 4 | Reinforcement Learning I | ✅ 7,651 w | ✅ 48 | ✅ | ✅ 24 pp |
| 5 | Reinforcement Learning II | ✅ 7,482 w | ✅ 33 | ✅ | ✅ 21 pp |
| 6 | Generative Models | ✅ 7,437 w | ✅ 37 | ✅ | ✅ 20 pp |
| 7 | Sequence Modeling & Transformers | ✅ 8,104 w | ✅ 40 | ✅ | ✅ 19 pp |
| 8 | World Models | ✅ 9,791 w | ✅ 45 | ✅ | ✅ 19 pp |
| 9 | Generalist Robot Policies | ✅ 9,107 w | ✅ 55 | ✅ | ✅ 23 pp |
| 10 | Embodied Reasoning & Test-time Scaling | ✅ 7,491 w | ✅ 44 | ✅ | ✅ 21 pp |
| 11 | Frontier & Open Problems | ✅ 9,700 w | ✅ 43 | ✅ | ✅ 24 pp |

### Guest lectures (Phase 7)

| Wk | Speaker | Transcript | Slides | In chapter |
|---|---|---|---|---|
| 2 | Abhishek Gupta (UW) | ✅ 6,192 w | ✅ 43 | Ch.12 |
| 3 | Danfei Xu (Georgia Tech) | ✅ 6,134 w | ✅ 68 | Ch.12 |
| 4 | Aviral Kumar (CMU/GDM) | ✅ 7,519 w | ✅ 15 | Ch.12 |
| 5 | Andrew Wagenmaker (Berkeley) | ✅ 6,957 w | ✅ 11 | Ch.12 |
| 6 | Cheng Chi (Sunday Robotics) | ✅ 6,563 w | ✅ 28 | Ch.12 |
| 7 | Ted Xiao (Prometheus) | ✅ 7,112 w | ✅ 32 | Ch.13 |
| 8 | Scott Reed (NVIDIA GEAR) | ✅ 5,768 w | ✅ 12 | Ch.13 |
| 9 | Quan Vuong (Physical Intelligence) | ✅ 5,667 w | ✅ 31 | Ch.13 |
| 10 | Archit Sharma (Google DeepMind) | ✅ 5,075 w | ✅ 14 | Ch.13 |
| 11 | Lucas Beyer (Meta) | ✅ 11,874 w | ✅ 54 | Ch.13 |
| 12 | **Dieter Fox (UW / NVIDIA)** | ❌ private video | ❌ | **absent — see bibliography** |

Guest total: **68,861 words, 308 slides.** De-dup ratio 2.92–2.99× (main lectures: 2.96–2.98×);
speaking rate 153–221 wpm, higher than the main lectures' 135–156 but natural for a 30-minute
remote talk, and far from the ~400 wpm that would signal a de-duplication failure.

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

## Phase 9 — verification report (re-run 2026-07-26, after Phase 7)

Run against `build/robot-learning.pdf`, **324 pages**.

| Check | Result |
|---|---|
| Pages | **324** (was 274; +50 from Chs 12–13) |
| Overfull / underfull boxes | **0 / 0** |
| Missing font glyphs | **0** |
| Unresolved cross-references | **0** |
| Banned-word grep, source *and* rendered text | **clean** |
| Labeled equations with the full four-part treatment | **95 / 95** |
| Chapters with both closing sections | **13 / 13** |
| `[UNCLEAR]` markers preserved into the PDF | **9** (6 original + 3 from the guest track) |
| Index entries | **198** (was 160); 68 guest-chapter term hits |

**Fixes made during this pass** (the audit found real defects, not just confirmations):

1. **Two banned-phrase escapes.** The previous grep only tested the contracted "it's worth noting";
   the spelled-out "it **is** worth noting that" survived in Ch.7 and Ch.10. Both removed, plus a
   third instance in Ch.5 ("the setup is worth noting for…").
2. **Seven labeled equations were missing part of the four-part treatment** — five of them in Ch.4,
   which was the real drift point, *not* Chs 10–11 as suspected. All seven closed; the book is now
   95/95.
3. **The notation-deviation footnoting was overstated.** PROGRESS.md claimed eight notation-change
   footnotes; only three existed. Added the two that actually mislead a reader holding the deck:
   Ch.4's **DDPG actor/critic flip** (the one place a slide's letters are *swapped* rather than
   renamed) and Ch.6's **$i,T \to k,K$ re-indexing** across seven equations.
4. **An undocumented silent re-lettering**: the attention scaling is $\sqrt{d_k}$ on Lecture 7's
   slide and $\sqrt{d}$ in the book. Added to the appendix deviation table.
5. **Slide-number error caught before it shipped**: the DDPG flip is on printed slides **39–40**,
   not the 41–42 that `notes/notation.md` §7 records (those are file indices).

**Equation verification against magnified slide images** — L6 slides 19, 20, 22, 25, 33; L4 39, 40;
L7 7, 18, 22. All character-identical to the book modulo documented renames. Confirmed exactly: the
DDPM forward process, the diffusion ELBO and $\mathcal{L}_{\text{simple}}$, DDIM sampling, the three
flow-matching equations, the DDPG policy gradient and exploration noise, scaled dot-product
attention, the Chinchilla/GPT-3 arithmetic, and the CLIP loss.

### Original Phase 9 report (274-page build)

| Check | Result |
|---|---|
| Banned-word grep over all 16 chapter files | **clean** — zero hits |
| Section opening by restating its own title | **zero** (checked programmatically) |
| Overfull hboxes / vboxes | **0 / 0** |
| Unresolved cross-references | **none** — no `??` in the rendered text |
| Missing font glyphs | **0** |
| `[UNCLEAR]` markers preserved into the PDF | **6 of 6** (1 explaining the convention in the preface, 5 content gaps) |
| Notation consistency | pre-notation-pass forms (`\mu_\phi` actor, `Q(\cdot;\theta)`, `\theta^-`, `A_t^k`, `O_t`, `r_t(\theta')`) appear **only** in the notation appendix's deviation table and in the two editor's notes that quote the lectures' own convention |
| Equation spot-check against slide-verified notes | 13 of 13 sampled equations present in the verified form |
| Numeric-claim traceability | every distinctive figure traced to a slide-verified note; no invented numbers found |

**Manuscript:** 81,000 words, 99 figures, 94 numbered equations, 8 `algorithm2e` boxes,
23 marked editor's notes.

**Unresolved gaps** (all visible in the PDF, all from slides that could not be recovered
because a video was playing):

1. Lecture 9, 30:55–33:49 — the TRI multi-task-pretraining study. Reported in Ch.9 from the
   transcript; title and authors not established, so no citation is given.
2. Lecture 11, 02:29–05:03 — the "robotics is solved" announcements and the three-step
   rockstar-demo recipe. Transcript only.
3. Lecture 11, 39:31–41:01 — memory at scale, spoken over a duplicate slide.
4. Lecture 11, 41:01–41:50 — two navigation systems, named only approximately in the
   captions; deliberately left uncited in Ch.11 and listed under *Unresolved* in the
   bibliography.
5. Lecture 11, 56:54–59:25 — the second half of the PhD backstory. Transcript only.

**Where editor's-note background was added** — 23 boxes, of which the substantive ones are:
the Bellman contraction sketch (Ch.4); Moravec's wording and the Shakey/SRI attribution
(Ch.1); the forest-trail paper the lecturer could not recall (Ch.3); the Hwangbo quadruped
attribution (Ch.5); DQN's 2013-vs-2015 dates (Ch.4); the AlphaGo 120-Elo arithmetic against
the slide's 100,000x (Ch.10); the spoken −33.7% against the slide's −37.2% (Ch.10); the
Octo attention-mask caption garble (Ch.9); and eight notation-change footnotes.

**Known shortfall.** The brief asked for 300+ pages and 25–40 pages per chapter; the book is
274 pages with chapters of 19–24. The chapters cover everything in the `notes/` files and
hard rule #1 forbids padding — 10 h 25 min of lecture is less material than a 400-page
textbook. Front and back matter are already 48 pages of the total.

## Phase 7 notes — the guest lectures

Working notes are in `notes/guest_lectures.md`, including a per-talk **caption-mangling
checklist**. Read that before editing Chs 12–13.

**Sourcing.** 10 of 11 talks are on the guest playlist; the 11th (`xvHdw0Cm_RY`, Dieter Fox) is a
private video. **No slides exist anywhere** — checked the course page, all ten video descriptions
(they link only the course site), and the course GitHub, which holds the four homework assignments
and zero PDFs. Decks were therefore reconstructed from the recordings.

| Asset | State |
|---|---|
| `transcripts/guests/gNN_slug.txt` | 10 cleaned transcripts, **68,861 words** |
| `slides_png/guestNN_slug/` | **308 reconstructed slides** + manifests |
| `notes/guest_lectures.md` | per-talk notes + mangling checklist |
| `scripts/fetch_guests.sh` | captions then 1080p video, resumable |
| `scripts/clean_vtt_guests.py` | imports `clean_vtt.py`; guest roster table |
| `scripts/extract_guest_slides.sh` | wraps `extract_slides.py` with the mask |

**The guest recordings are Zoom screen-shares, not clean slide captures.** A live speaker webcam
sits over the top-right corner and some talks add a participant column down the right edge. Those
pixels change every frame, so whole-frame change detection finds almost no stable runs.
`extract_slides.py` gained **`--ignore x0,y0,x1,y1`** (fractional, repeatable) to blank regions
*before comparison only* — the saved frame is the untouched original — plus `--prefix` for the
output directory name. Guests use `--ignore 0.85,0.0,1.0,1.0`. Consequence: a slide title running
to the right edge can be physically occluded, so mark `[UNCLEAR]` rather than guessing.

**Extraction yield varies a lot and low counts are not a bug.** Gupta 43, Xu 68, Kumar 15,
Wagenmaker 11, Chi 28, Xiao 32, Reed 12, Vuong 31, Sharma 14, Beyer 54. The low ones are talks
that play full-screen video for long stretches (Vuong's first 15 minutes) or that build slides
incrementally so the collapser merges many builds into one final state (Kumar's slide 7 absorbs 24
builds). The kept frame is always the *final* built state, which is what you want for reading.

**Slide-file index ≠ printed slide number, and the offset is not constant.** Verified: Lecture 6
file 31 prints as 33; Lecture 4 files 41–42 print as **39–40**; Xu guest file 25 prints as 33. The
offsets go in *both* directions, because build-collapsing removes frames while unnumbered title
slides add them. `notes/notation.md` §7 uses **file indices**. Only three places in the published
book cite a slide number — the two notation editor's notes added in Ch.4 and Ch.6, and Ch.12's
mention of Gupta's deck — and each was checked against the printed number on the image.

**Auto-captions are markedly worse here than on the main lectures.** π0.7 alone appears as
"PILE-7", "Pilot 7", "PyTorch 7" and "Pyro 7"; world action models become "whens"; EgoMimic becomes
"Google makes"; Kumar's **RaC** becomes "rack". Every name and number in Chs 12–13 was checked
against a slide image; the full list is in `notes/guest_lectures.md`.

## Phase 5 notes — chapter build gotchas

`algorithm2e` boxes: use **`\KwIn` / `\KwOut`**, not the preamble's
`\SetKwInOut`-defined `\Input` / `\Output`. The latter aligns its colon in a fixed-width
box that wraps in this 7in geometry, leaving a stray `:` on its own line. `\KwIn`/`\KwOut`
print "Input:" / "Output:" inline and render correctly.

**pandoc-crossref injects chapter numbers into chapter titles** when
`numberSections: true`, which duplicated LaTeX's own `CHAPTER N` label and went off by one
as soon as an unnumbered preface was added. Fixed by `numberSections: false` in
`build/crossref.yaml`; figure and equation numbering stays per-chapter via `chapters: true`.

**Unnumbered chapters need three things**, not one: `{.unnumbered}` on the H1 *and* on every
subheading (otherwise they render as 0.1, 0.2 …), plus a raw `\markboth{...}{...}` line,
because `\chapter*` does not update the running head and the previous chapter's title
otherwise persists across the whole appendix.

**The index reports printed folios, not physical page indices** — there is a 6-page offset
from the front matter. `scripts/make_index.py` derives it from the running heads rather than
hard-coding it, and matches acronyms case-sensitively so that SIMPLER, FAST and CLIP do not
match the ordinary English words.

**Glyph support.** Libertinus Serif *and* Libertinus Math lack ✓ ✗ ✅ ❌ (U+2713/2717/2705/274C)
and `$\checkmark$` maps to a missing glyph too. Comparison tables use **+** / **--** instead.
Emoji in a table will silently render as nothing — grep for them before believing a build.

**Cross-reference labels are global**, not per chapter: `fig:venn` in Ch.1 and Ch.11 aborted
the build with "Duplicate label". Check with
`grep -oh '#\(fig\|eq\|tbl\):[a-z-]*' chapters/*.md | sort | uniq -d`.

**Chapter length.** Chapters are landing at **22–26 pages**, below the brief's 25–40
target. This is deliberate: each chapter already covers everything in its `notes/` file,
and hard rule #1 forbids inventing content to reach a page count. The source lectures are
45–70 min (7–10k transcript words), which is simply less material than a 35-page textbook
chapter. Where extra length was genuinely available it was added as marked
`> **Editor's note.**` background (rule #2) or as step-by-step derivation, not padding.

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

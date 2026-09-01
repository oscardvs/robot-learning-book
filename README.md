# Robot Learning, an unofficial textbook

An unofficial textbook compiled from the public recordings of 263-5911-00L, *Robot Learning: From Fundamentals to Foundation Models*, taught at ETH Zürich in spring 2026 by Oier Mees, with Marc Pollefeys as course mentor. I put it together as a student following the course. It is not endorsed by, affiliated with, or reviewed by the lecturer, the course, or ETH Zürich. The lectures and the slide content are theirs; the prose, the mistakes and the editorial choices are mine.

Read it online at <https://robot-learning-book.vercel.app>, or build the PDF as described below.

## What it contains

Each of the eleven main lectures became one chapter, in the order they were given. Two further chapters cover ten of the eleven guest talks, and the back matter holds the notation table, a glossary, a bibliography and an index.

- Preface
- 1. Introduction: Why Robots Are Hard
- 2. Robot Control and Markov Decision Processes
- 3. Imitation Learning
- 4. Reinforcement Learning I: Value Functions
- 5. Reinforcement Learning II: Policy Gradients
- 6. Generative Models
- 7. Sequence Modeling and Transformers
- 8. World Models
- 9. Generalist Robot Policies
- 10. Embodied Reasoning and Test-time Scaling
- 11. Frontier and Open Problems
- 12. Guest Lectures I: Where the Data Comes From
- 13. Guest Lectures II: Backbones, Scale, and the Frontier
- Notation, Glossary, Bibliography, Index

The sources are the YouTube recordings and their automatic captions. The course's slide decks are password-protected, so the slides were reconstructed from the 1080p recordings by frame differencing (484 slides across the main lectures, plus the guest decks) and every equation was transcribed from the slide images. The preface explains this in full, including the few places where a slide could not be recovered. Where a caption and a slide disagreed, the slide won. Everything outside a marked editor's note is course material.

## Layout

```
chapters/      the book source, one pandoc-markdown file per chapter
notes/         per-lecture working notes, the notation pass, the reading list
transcripts/   cleaned caption text per lecture, plus the raw VTT files
slides/        OCR text layer per lecture, and the course's original (encrypted) PDF decks
slides_png/    reconstructed slide images per lecture and guest talk, with manifests
scripts/       fetch recordings, clean captions, extract and OCR slides, build the PDF and the index
build/         XeLaTeX preamble and pandoc-crossref config; the PDF output is gitignored
web/           the website: Next.js and Fumadocs, with MDX copies of the chapters and small interactive demos
PROGRESS.md    the working log: what was done, how, and what was verified
```

## Building the PDF

`scripts/build.sh` runs pandoc with pandoc-crossref and XeLaTeX. It needs those tools plus the Libertinus Serif, Sans and Math fonts and Latin Modern Mono.

```
scripts/build.sh                       # all chapters -> build/robot-learning.pdf
scripts/build.sh out.pdf chapters/03-imitation-learning.md   # a subset
```

`scripts/make_index.py` generates `chapters/17-index.md` from a rendered PDF; run it against a build without the index, then rebuild.

## Running the website

```
cd web
npm install
npm run dev      # local preview
npm run build    # production build
npm run sync     # copy the chapters, slides and status from the book sources into web/
```

The synced content under `web/content/docs/book`, `web/src/data` and `web/public/slides` is committed on purpose so that Vercel can build from `web/` alone. After editing a chapter, run `npm run sync` and commit the result.

## Status

July 2026: all eleven main lectures and ten guest talks are written up, the PDF builds at 334 pages, and the site is live. The week-12 guest talk (Dieter Fox) is absent because its recording is private.

## Errors and corrections

Any errors are mine, not the course's. If a passage seems wrong, the recordings are the authority; every chapter links to them. Corrections are welcome as issues or pull requests.

## Credits

Course and slide content: Oier Mees and the ETH Zürich Robot Learning course. The PDF is built with pandoc, pandoc-crossref and XeLaTeX; the site with Next.js, Fumadocs, KaTeX and Mermaid. There is no license file in this repository.

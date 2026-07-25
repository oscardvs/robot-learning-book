# web — the Robot Learning site

The reading site for the book in this repo. Next.js + Fumadocs, deployed on Vercel.

Nothing here writes to `chapters/`, `slides_png/`, `notes/` or `transcripts/`. Those
are the book; this directory only reads them.

## Adding a chapter to the site

Write the chapter as usual in `../chapters/NN-slug.md`, then:

```bash
npm run sync     # read the book, regenerate the site's content
npm run build    # check it
git add -A && git commit -m "site: chapter NN"
```

`npm run sync` is the only step. It picks up any `NN-slug.md` in `../chapters/`, works
out the chapter number from the filename, and writes everything the site needs.
Nothing has to be registered anywhere.

## What sync does

| Reads | Writes |
|---|---|
| `../chapters/*.md` | `content/docs/book/*.mdx` + `meta.json` |
| `../slides_png/*/manifest.json` | `src/data/slides.json` |
| `../slides_png/*/slide_*.jpg` | `public/slides/…` (re-encoded, plus thumbnails) |
| `../notes/reading_list.md` | `content/docs/appendix/reading-list.mdx` |
| `../transcripts/*.txt` | `src/data/status.json` (word counts, progress) |

Its output is **committed**, which is what lets Vercel build from `web/` alone without
needing the book sources. `npm run build` runs sync first but skips it harmlessly if
the book is not there.

`npm run sync -- --fast` skips image processing, which is most of the time.

## The pandoc translation

The book targets a pandoc → LaTeX build, so the chapters use four constructs MDX does
not understand. `scripts/lib/pandoc-to-mdx.mjs` converts them:

| In the book | On the site |
|---|---|
| `$x$`, `$$x$$ {#eq:id}` | KaTeX rendered at build time; display equations are numbered `1.1` and become link targets |
| `![cap](p){#fig:id width=70%}` | a figure plate, numbered, captioned, **linked to the second of the recording where that slide was up** |
| `@fig:id`, `@eq:id` | "Figure 1.2" / "Equation (1.1)", linked |
| `> **Editor's note.** …` | the amber editor's-note aside |

LaTeX never reaches the Markdown parser — it is lifted out of the source first and put
back as a component afterwards, so braces in maths cannot be mistaken for JSX.

## Writing directly for the site

Chapters can use these components inline; sync passes them through untouched:

```mdx
<ValueIteration caption="Value iteration on a 10×7 grid." />
<PolicyModes />
<Mermaid chart={`graph LR; obs-->policy-->action`} />
```

## Numbers on the site are measured

The chapter count, slide count, transcript word count and per-lecture status all come
from `status.json`, which sync computes from the repo. Lectures without a chapter say
so. Do not hand-edit those numbers — write the chapter and re-run sync.

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
```

Node 22 or newer.

## Attribution

The course is [263-5911-00L *Robot Learning: From Fundamentals to Foundation
Models*](https://cvg.ethz.ch/lectures/Robot-Learning/), ETH Zürich, taught by Oier
Mees with Marc Pollefeys as course mentor. Slide images are frames from the public
recordings. The site states on the front page, in the footer and in the preface that it
is an unofficial companion and not endorsed by the course.

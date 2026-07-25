#!/usr/bin/env node
// Pulls the book out of the repo and into the site.
//
// The book lives one level up, in `chapters/`, `slides_png/` and `notes/`, and is
// still being written. Nothing here writes back to those directories: this script
// only reads them and produces the site's `content/`, `public/slides/` and
// `src/data/`. Re-run it whenever a chapter lands.
//
//   npm run sync            build everything
//   npm run sync -- --fast  skip image processing (they rarely change)
//
// With `--optional` a missing book is not an error, so `next build` still works in
// an environment that only has the `web/` directory.

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

import { COURSE, LECTURES, lectureByNumber, timecode, watchUrl } from './lib/course.mjs';
import { pandocToMdx } from './lib/pandoc-to-mdx.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(HERE, '..');
const REPO = path.resolve(WEB, '..');

const SRC = {
  chapters: path.join(REPO, 'chapters'),
  slides: path.join(REPO, 'slides_png'),
  notes: path.join(REPO, 'notes'),
  transcripts: path.join(REPO, 'transcripts'),
  progress: path.join(REPO, 'PROGRESS.md'),
};

const OUT = {
  book: path.join(WEB, 'content/docs/book'),
  appendix: path.join(WEB, 'content/docs/appendix'),
  slides: path.join(WEB, 'public/slides'),
  data: path.join(WEB, 'src/data'),
};

const FLAGS = new Set(process.argv.slice(2));
const FAST = FLAGS.has('--fast');
const OPTIONAL = FLAGS.has('--optional');

// Slide frames are re-encoded rather than shipped at capture resolution: the archive
// is ~500 stills and the originals are 1080p.
const FULL = { width: 1440, quality: 76 };
const THUMB = { width: 360, quality: 66 };

/* --------------------------------------------------------------------- utilities */

const log = (...args) => console.log('[sync]', ...args);

async function readDirSafe(dir) {
  try {
    return (await fs.readdir(dir)).sort();
  } catch {
    return [];
  }
}

async function writeFile(file, contents) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, contents);
}

const escapeYaml = (s) => `'${String(s).replace(/'/g, "''")}'`;

/* ------------------------------------------------------------------ slide index */

/** Read every `slides_png/lectureNN/manifest.json` into one index. */
async function readSlideIndex() {
  const index = new Map();

  for (const lecture of LECTURES) {
    const dir = path.join(SRC.slides, `lecture${String(lecture.n).padStart(2, '0')}`);
    const manifestPath = path.join(dir, 'manifest.json');
    if (!existsSync(manifestPath)) continue;

    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    const slides = (manifest.slides ?? [])
      .filter((s) => s.file && !s.dup_of)
      .map((s) => ({
        n: s.n,
        file: s.file,
        start: s.t_start ?? 0,
        end: s.t_end ?? s.t_start ?? 0,
        timecode: timecode(s.t_start ?? 0),
        watch: watchUrl(lecture.video, s.t_start ?? 0),
      }));

    index.set(lecture.n, { ...lecture, dir, slides });
  }

  return index;
}

/* ------------------------------------------------------------- image processing */

const imageJobs = new Map();

/** Queue a slide frame for re-encoding, and report where it will land. */
function planImage(lectureDir, lectureKey, file) {
  const source = path.join(lectureDir, file);
  const full = path.join(OUT.slides, lectureKey, file);
  const thumb = path.join(OUT.slides, lectureKey, 'thumb', file);
  if (!imageJobs.has(source)) imageJobs.set(source, { source, full, thumb });
  return {
    src: `/slides/${lectureKey}/${file}`,
    thumb: `/slides/${lectureKey}/thumb/${file}`,
  };
}

async function runImageJobs() {
  const jobs = [...imageJobs.values()];
  if (FAST) {
    log(`skipping ${jobs.length} images (--fast)`);
    return;
  }

  let done = 0;
  let written = 0;
  const queue = jobs.slice();
  const workers = Array.from({ length: 6 }, async () => {
    for (let job = queue.pop(); job; job = queue.pop()) {
      const stale = await isStale(job.source, job.full);
      if (stale) {
        await fs.mkdir(path.dirname(job.full), { recursive: true });
        await fs.mkdir(path.dirname(job.thumb), { recursive: true });
        const input = sharp(job.source);
        await input
          .clone()
          .resize({ width: FULL.width, withoutEnlargement: true })
          .jpeg({ quality: FULL.quality, mozjpeg: true })
          .toFile(job.full);
        await input
          .clone()
          .resize({ width: THUMB.width, withoutEnlargement: true })
          .jpeg({ quality: THUMB.quality, mozjpeg: true })
          .toFile(job.thumb);
        written += 1;
      }
      done += 1;
      if (done % 100 === 0) log(`images ${done}/${jobs.length}`);
    }
  });

  await Promise.all(workers);
  log(`images: ${jobs.length} total, ${written} re-encoded`);
}

async function isStale(source, target) {
  try {
    const [a, b] = await Promise.all([fs.stat(source), fs.stat(target)]);
    return a.mtimeMs > b.mtimeMs;
  } catch {
    return true;
  }
}

/* ------------------------------------------------------------------- chapters */

/**
 * Turn `chapters/NN-slug.md` into `content/docs/book/NN-slug.mdx`.
 * Figures resolve to processed slide frames and carry a link to the moment in the
 * recording where that slide was on screen.
 */
async function buildChapters(slideIndex) {
  const files = (await readDirSafe(SRC.chapters)).filter((f) => /^\d+-.*\.md$/.test(f));
  const written = [];

  for (const file of files) {
    const number = Number(file.slice(0, file.indexOf('-')));
    const slug = file.replace(/^\d+-/, '').replace(/\.md$/, '');
    const raw = await fs.readFile(path.join(SRC.chapters, file), 'utf8');
    const lecture = lectureByNumber(number);

    const { title, body } = pandocToMdx(raw, {
      chapter: number,
      resolveImage: (url) => resolveFigure(url, slideIndex),
    });

    const heading = title ?? lecture?.title ?? `Chapter ${number}`;
    const description = firstSentence(raw);
    // 00 is the preface and 12+ is back matter; only 1–11 pair with a lecture.
    const kind = lecture ? 'chapter' : number === 0 ? 'front' : 'back';

    const frontmatter = [
      '---',
      `title: ${escapeYaml(heading)}`,
      `description: ${escapeYaml(description)}`,
      `chapter: ${number}`,
      `kind: ${kind}`,
      ...(lecture ? [`lecture: ${number}`, `video: ${escapeYaml(lecture.video)}`] : []),
      '---',
      '',
    ].join('\n');

    const target = path.join(OUT.book, `${String(number).padStart(2, '0')}-${slug}.mdx`);
    await writeFile(target, frontmatter + body);
    written.push({ number, slug, kind, title: heading, description, file: path.basename(target) });
    log(`${kind.padEnd(7)} ${String(number).padStart(2, '0')}  ${heading}`);
  }

  return written;
}

/** Map `../slides_png/lecture01/slide_026.jpg` onto a processed asset + video link. */
function resolveFigure(url, slideIndex) {
  const match = url.match(/slides_png\/(lecture(\d+))\/(slide_(\d+)\.jpg)/);
  if (!match) return { src: url };

  const [, lectureKey, lectureDigits, file, slideDigits] = match;
  const lectureNumber = Number(lectureDigits);
  const entry = slideIndex.get(lectureNumber);
  if (!entry) return { src: url };

  const { src } = planImage(entry.dir, lectureKey, file);
  const slide = entry.slides.find((s) => s.n === Number(slideDigits));

  return {
    src,
    lecture: lectureNumber,
    videoUrl: slide?.watch,
    timecode: slide?.timecode,
  };
}

function firstSentence(markdown) {
  const body = markdown
    .split('\n')
    .filter((l) => !/^\s*[#>!]/.test(l) && l.trim())
    .join(' ');
  const sentence = body.match(/^(.{40,240}?[.!?])\s/);
  const text = (sentence ? sentence[1] : body.slice(0, 200)).replace(/[*_`]/g, '').trim();
  return text;
}

/* -------------------------------------------------------------------- appendix */

/** The reading list is plain Markdown already; it only needs frontmatter. */
async function buildReadingList() {
  const file = path.join(SRC.notes, 'reading_list.md');
  if (!existsSync(file)) return false;

  const raw = await fs.readFile(file, 'utf8');
  const { body } = pandocToMdx(raw, { chapter: 0, resolveImage: (url) => ({ src: url }) });

  await writeFile(
    path.join(OUT.appendix, 'reading-list.mdx'),
    [
      '---',
      "title: 'Reading list'",
      "description: 'The 30 papers assigned across the course, week by week, with the guest speaker for each session.'",
      '---',
      '',
      body,
    ].join('\n'),
  );
  return true;
}

/* ---------------------------------------------------------------------- status */

/** Everything the site says about its own state is measured, not typed by hand. */
async function buildStatus(slideIndex, chapters) {
  const transcripts = await readDirSafe(SRC.transcripts);
  let words = 0;
  for (const file of transcripts.filter((f) => f.endsWith('.txt'))) {
    const text = await fs.readFile(path.join(SRC.transcripts, file), 'utf8');
    words += text.split(/\s+/).filter(Boolean).length;
  }

  const lectures = LECTURES.map((lecture) => {
    const chapter = chapters.find((c) => c.number === lecture.n && c.kind === 'chapter');
    const slides = slideIndex.get(lecture.n)?.slides ?? [];
    const transcript = transcripts.some((f) => f.startsWith(String(lecture.n).padStart(2, '0')) && f.endsWith('.txt'));
    return {
      ...lecture,
      slideCount: slides.length,
      duration: slides.length ? slides[slides.length - 1].end : 0,
      hasTranscript: transcript,
      chapter: chapter ? { slug: chapter.slug, title: chapter.title, description: chapter.description } : null,
    };
  });

  return {
    course: COURSE,
    generatedAt: new Date().toISOString().slice(0, 10),
    transcriptWords: words,
    slideCount: lectures.reduce((sum, l) => sum + l.slideCount, 0),
    // Only the eleven lecture chapters count towards progress; the preface and the
    // back matter are not lectures and would push this past the total.
    chaptersWritten: lectures.filter((l) => l.chapter).length,
    lectureCount: LECTURES.length,
    frontMatter: chapters.filter((c) => c.kind !== 'chapter').length,
    lectures,
  };
}

/* ------------------------------------------------------------------ slide pages */

async function buildSlideData(slideIndex) {
  const lectures = [];

  for (const lecture of LECTURES) {
    const entry = slideIndex.get(lecture.n);
    if (!entry) continue;
    const key = `lecture${String(lecture.n).padStart(2, '0')}`;

    lectures.push({
      n: lecture.n,
      slug: lecture.slug,
      title: lecture.title,
      video: lecture.video,
      slides: entry.slides.map((slide) => {
        const { src, thumb } = planImage(entry.dir, key, slide.file);
        return { n: slide.n, src, thumb, start: slide.start, timecode: slide.timecode, watch: slide.watch };
      }),
    });
  }

  return { lectures };
}

/* ------------------------------------------------------------------------- main */

async function main() {
  if (!existsSync(SRC.chapters)) {
    if (OPTIONAL) {
      log('book sources not found next to web/ — keeping the content already checked in');
      return;
    }
    throw new Error(`expected the book at ${SRC.chapters}`);
  }

  const slideIndex = await readSlideIndex();
  log(`found ${slideIndex.size} reconstructed decks`);

  const chapters = await buildChapters(slideIndex);
  const slideData = await buildSlideData(slideIndex);
  const status = await buildStatus(slideIndex, chapters);

  await writeFile(
    path.join(OUT.book, 'meta.json'),
    JSON.stringify(
      {
        title: 'The book',
        pages: chapters
          .sort((a, b) => a.number - b.number)
          .map((c) => c.file.replace(/\.mdx$/, '')),
      },
      null,
      2,
    ) + '\n',
  );

  const hasReadingList = await buildReadingList();
  if (hasReadingList) {
    await writeFile(
      path.join(OUT.appendix, 'meta.json'),
      JSON.stringify({ title: 'Appendix', pages: ['reading-list'] }, null, 2) + '\n',
    );
  }

  await writeFile(path.join(OUT.data, 'slides.json'), JSON.stringify(slideData) + '\n');
  await writeFile(path.join(OUT.data, 'status.json'), JSON.stringify(status, null, 2) + '\n');

  await runImageJobs();

  log(
    `done — ${status.chaptersWritten}/${status.lectureCount} chapters ` +
      `(+${status.frontMatter} front/back matter), ${status.slideCount} slides, ` +
      `${status.transcriptWords.toLocaleString('en-US')} transcript words`,
  );
}

main().catch((error) => {
  console.error('[sync] failed:', error);
  process.exit(1);
});

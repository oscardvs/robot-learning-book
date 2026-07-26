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

import {
  COURSE,
  GUESTS,
  LECTURES,
  MISSING_GUEST,
  guestKey,
  lectureByNumber,
  lectureKey,
  timecode,
  watchUrl,
} from './lib/course.mjs';
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

/**
 * Read every `slides_png/<key>/manifest.json` into one index, keyed by deck key —
 * `lecture04` for the main lectures, `guest02_xu` for the guest talks. Both tracks are
 * reconstructed the same way and carry the same per-slide timestamps, so they differ
 * only in what they link back to.
 */
async function readDecks() {
  const decks = new Map();

  const add = async (key, meta) => {
    const dir = path.join(SRC.slides, key);
    const manifestPath = path.join(dir, 'manifest.json');
    if (!existsSync(manifestPath)) return;

    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    const slides = (manifest.slides ?? [])
      .filter((s) => s.file && !s.dup_of)
      .map((s) => ({
        n: s.n,
        file: s.file,
        start: s.t_start ?? 0,
        end: s.t_end ?? s.t_start ?? 0,
        timecode: timecode(s.t_start ?? 0),
        watch: watchUrl(meta.video, s.t_start ?? 0),
      }));

    decks.set(key, { ...meta, key, dir, slides });
  };

  for (const lecture of LECTURES) await add(lectureKey(lecture.n), { kind: 'lecture', ...lecture });
  for (const guest of GUESTS) await add(guestKey(guest), { kind: 'guest', ...guest });

  return decks;
}

const decksOfKind = (decks, kind) => [...decks.values()].filter((d) => d.kind === kind);

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
async function buildChapters(decks) {
  const files = (await readDirSafe(SRC.chapters)).filter((f) => /^\d+-.*\.md$/.test(f));
  const written = [];

  for (const file of files) {
    const number = Number(file.slice(0, file.indexOf('-')));
    const slug = file.replace(/^\d+-/, '').replace(/\.md$/, '');
    const raw = await fs.readFile(path.join(SRC.chapters, file), 'utf8');
    const lecture = lectureByNumber(number);

    const { title, body } = pandocToMdx(raw, {
      chapter: number,
      resolveImage: (url) => resolveFigure(url, decks),
    });

    const heading = title ?? lecture?.title ?? `Chapter ${number}`;
    const description = firstSentence(raw);
    // 00 is the preface and 14+ is back matter. Chapters 1–11 each pair with one main
    // lecture; 12–13 are the guest-lecture chapters, which are numbered chapters too but
    // draw on ten separate talks, so they have no single recording to link.
    const kind = lecture || slug.startsWith('guest-lectures')
      ? 'chapter'
      : number === 0
        ? 'front'
        : 'back';

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

/**
 * Map `../slides_png/lecture01/slide_026.jpg` — or `../slides_png/guest02_xu/slide_025.jpg` —
 * onto a processed asset and a deep link into the recording. A guest figure is labelled with
 * the speaker's surname rather than a lecture number, because the guest chapters draw on ten
 * separate talks and "L12" would name a lecture that does not exist.
 */
function resolveFigure(url, decks) {
  const match = url.match(/slides_png\/((?:lecture|guest)[A-Za-z0-9_]+)\/(slide_(\d+)\.jpg)/);
  if (!match) return { src: url };

  const [, deckKey, file, slideDigits] = match;
  const deck = decks.get(deckKey);
  if (!deck) return { src: url };

  const { src } = planImage(deck.dir, deckKey, file);
  const slide = deck.slides.find((s) => s.n === Number(slideDigits));

  return {
    src,
    ...(deck.kind === 'lecture'
      ? { lecture: deck.n }
      : { source: deck.speaker.split(' ').pop() }),
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

/** Count words in every `*.txt` directly inside a directory. */
async function transcriptWordsIn(dir) {
  const files = (await readDirSafe(dir)).filter((f) => f.endsWith('.txt'));
  let words = 0;
  for (const file of files) {
    const text = await fs.readFile(path.join(dir, file), 'utf8');
    words += text.split(/\s+/).filter(Boolean).length;
  }
  return { files, words };
}

/** Everything the site says about its own state is measured, not typed by hand. */
async function buildStatus(decks, chapters) {
  const main = await transcriptWordsIn(SRC.transcripts);
  const guestTranscripts = await transcriptWordsIn(path.join(SRC.transcripts, 'guests'));

  const lectures = LECTURES.map((lecture) => {
    const chapter = chapters.find((c) => c.number === lecture.n && c.kind === 'chapter');
    const slides = decks.get(lectureKey(lecture.n))?.slides ?? [];
    const transcript = main.files.some((f) => f.startsWith(String(lecture.n).padStart(2, '0')));
    return {
      ...lecture,
      slideCount: slides.length,
      duration: slides.length ? slides[slides.length - 1].end : 0,
      hasTranscript: transcript,
      chapter: chapter ? { slug: chapter.slug, title: chapter.title, description: chapter.description } : null,
    };
  });

  const guests = GUESTS.map((guest) => {
    const slides = decks.get(guestKey(guest))?.slides ?? [];
    return {
      ...guest,
      key: guestKey(guest),
      slideCount: slides.length,
      duration: slides.length ? slides[slides.length - 1].end : 0,
      hasTranscript: guestTranscripts.files.some((f) => f.startsWith(`g${String(guest.n).padStart(2, '0')}`)),
    };
  });

  const slideCount = lectures.reduce((sum, l) => sum + l.slideCount, 0);
  const guestSlideCount = guests.reduce((sum, g) => sum + g.slideCount, 0);

  const guestChapters = chapters.filter((c) => c.slug.startsWith('guest-lectures'));

  return {
    course: COURSE,
    generatedAt: new Date().toISOString().slice(0, 10),
    transcriptWords: main.words,
    slideCount,
    // Only the eleven lecture chapters count towards progress; the preface and the
    // back matter are not lectures and would push this past the total.
    chaptersWritten: lectures.filter((l) => l.chapter).length,
    lectureCount: LECTURES.length,
    frontMatter: chapters.filter((c) => c.kind !== 'chapter').length,
    // The guest track is a second set of recordings with its own decks, written up as
    // the two guest chapters. Kept separate from the lecture figures above so neither
    // number quietly absorbs the other, with the totals stated explicitly.
    guestTalks: guests.filter((g) => g.hasTranscript).length,
    guestTalksHeld: GUESTS.length + 1,
    guestChapters: guestChapters.length,
    guestSlideCount,
    guestTranscriptWords: guestTranscripts.words,
    totalSlideCount: slideCount + guestSlideCount,
    totalTranscriptWords: main.words + guestTranscripts.words,
    missingGuest: MISSING_GUEST,
    lectures,
    guests,
  };
}

/* ------------------------------------------------------------------ slide pages */

async function buildSlideData(decks) {
  const plate = (deck) =>
    deck.slides.map((slide) => {
      const { src, thumb } = planImage(deck.dir, deck.key, slide.file);
      return { n: slide.n, src, thumb, start: slide.start, timecode: slide.timecode, watch: slide.watch };
    });

  const lectures = decksOfKind(decks, 'lecture').map((deck) => ({
    key: deck.key,
    n: deck.n,
    slug: deck.slug,
    title: deck.title,
    video: deck.video,
    slides: plate(deck),
  }));

  const guests = decksOfKind(decks, 'guest').map((deck) => ({
    key: deck.key,
    n: deck.n,
    week: deck.week,
    slug: deck.slug,
    speaker: deck.speaker,
    affiliation: deck.affiliation,
    title: deck.title,
    video: deck.video,
    chapter: deck.chapter,
    slides: plate(deck),
  }));

  return { lectures, guests };
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

  const decks = await readDecks();
  log(
    `found ${decks.size} reconstructed decks ` +
      `(${decksOfKind(decks, 'lecture').length} lectures, ${decksOfKind(decks, 'guest').length} guest talks)`,
  );

  const chapters = await buildChapters(decks);
  const slideData = await buildSlideData(decks);
  const status = await buildStatus(decks, chapters);

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
    `done — ${status.chaptersWritten}/${status.lectureCount} lecture chapters ` +
      `+ ${status.guestChapters} guest chapters (+${status.frontMatter} front/back matter), ` +
      `${status.totalSlideCount} slides (${status.slideCount} lecture + ${status.guestSlideCount} guest), ` +
      `${status.totalTranscriptWords.toLocaleString('en-US')} transcript words`,
  );
}

main().catch((error) => {
  console.error('[sync] failed:', error);
  process.exit(1);
});

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon, ExternalLinkIcon } from 'lucide-react';

import slides from '@/data/slides.json';
import status from '@/data/status.json';
import { Deck } from './deck';

/**
 * One deck, from either track. The route key is the directory the frames were recovered
 * into — `lecture04`, `guest02_xu` — so a URL survives any renumbering of the chapters.
 */
type DeckView = {
  key: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  video: string;
  slides: (typeof slides.lectures)[number]['slides'];
  chapterHref?: string;
  chapterLabel: string;
};

function view(param: string): DeckView | undefined {
  const lecture = slides.lectures.find((l) => l.key === param);
  if (lecture) {
    const chapter = status.lectures.find((l) => l.n === lecture.n)?.chapter;
    return {
      key: lecture.key,
      eyebrow: `Lecture ${String(lecture.n).padStart(2, '0')}`,
      title: lecture.title,
      video: lecture.video,
      slides: lecture.slides,
      chapterHref: chapter
        ? `/docs/book/${String(lecture.n).padStart(2, '0')}-${chapter.slug}`
        : undefined,
      chapterLabel: 'read the chapter',
    };
  }

  const guest = slides.guests.find((g) => g.key === param);
  if (!guest) return undefined;

  // Both guest chapters are written from five talks each, so the link goes to the chapter
  // that covers this speaker rather than to a section of their own.
  const chapter = status.guests.find((g) => g.key === param)?.chapter;
  const file = chapter === 12 ? '12-guest-lectures-i' : '13-guest-lectures-ii';
  return {
    key: guest.key,
    eyebrow: `Guest talk · week ${guest.week}`,
    title: guest.speaker,
    subtitle: `${guest.title} — ${guest.affiliation}`,
    video: guest.video,
    slides: guest.slides,
    chapterHref: `/docs/book/${file}`,
    chapterLabel: `read chapter ${chapter}`,
  };
}

export function generateStaticParams() {
  return [...slides.lectures, ...slides.guests].map((d) => ({ lecture: d.key }));
}

export async function generateMetadata(props: PageProps<'/slides/[lecture]'>): Promise<Metadata> {
  const { lecture: param } = await props.params;
  const deck = view(param);
  if (!deck) return {};
  return {
    title: `${deck.eyebrow}: ${deck.title} — slides`,
    description: `All ${deck.slides.length} slides, each linked to the moment it appears in the recording.`,
  };
}

export default async function DeckPage(props: PageProps<'/slides/[lecture]'>) {
  const { lecture: param } = await props.params;
  const deck = view(param);
  if (!deck) notFound();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Link
        href="/slides"
        className="u-label inline-flex items-center gap-1.5 text-ink-dim transition-colors hover:text-ink"
      >
        <ArrowLeftIcon className="size-3" />
        all decks
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div>
          <p className="u-label mb-3">{deck.eyebrow}</p>
          <h1 className="u-display max-w-[22ch] text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold leading-tight text-ink">
            {deck.title}
          </h1>
          {deck.subtitle ? (
            <p className="mt-3 max-w-[52ch] font-body text-[0.9375rem] leading-relaxed text-ink-dim">
              {deck.subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {deck.chapterHref ? (
            <Link
              href={deck.chapterHref}
              className="u-label inline-flex items-center gap-2 border border-policy/50 bg-policy-soft px-3 py-2.5 text-policy transition-colors hover:border-policy"
            >
              {deck.chapterLabel}
            </Link>
          ) : null}
          <a
            href={`https://www.youtube.com/watch?v=${deck.video}`}
            target="_blank"
            rel="noreferrer"
            className="u-label inline-flex items-center gap-2 border border-line px-3 py-2.5 text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
          >
            full recording
            <ExternalLinkIcon className="size-3" />
          </a>
        </div>
      </div>

      <p className="mt-6 max-w-[62ch] font-body text-[0.9375rem] leading-relaxed text-ink-dim">
        {deck.slides.length} slides, in the order they were shown. The timecode on each one
        is when it went up; open a slide and click it to hear that part of the recording.
      </p>

      <div className="mt-8">
        <Deck slides={deck.slides} />
      </div>
    </main>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon, ExternalLinkIcon } from 'lucide-react';

import slides from '@/data/slides.json';
import status from '@/data/status.json';
import { Deck } from './deck';

const key = (n: number) => `lecture${String(n).padStart(2, '0')}`;
const find = (param: string) => slides.lectures.find((l) => key(l.n) === param);

export function generateStaticParams() {
  return slides.lectures.map((l) => ({ lecture: key(l.n) }));
}

export async function generateMetadata(props: PageProps<'/slides/[lecture]'>): Promise<Metadata> {
  const { lecture: param } = await props.params;
  const lecture = find(param);
  if (!lecture) return {};
  return {
    title: `Lecture ${lecture.n}: ${lecture.title} — slides`,
    description: `All ${lecture.slides.length} slides from lecture ${lecture.n}, each linked to the moment it appears in the recording.`,
  };
}

export default async function LectureSlides(props: PageProps<'/slides/[lecture]'>) {
  const { lecture: param } = await props.params;
  const lecture = find(param);
  if (!lecture) notFound();

  const chapter = status.lectures.find((l) => l.n === lecture.n)?.chapter;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Link
        href="/slides"
        className="u-label inline-flex items-center gap-1.5 text-ink-dim transition-colors hover:text-ink"
      >
        <ArrowLeftIcon className="size-3" />
        all lectures
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div>
          <p className="u-label mb-3">Lecture {String(lecture.n).padStart(2, '0')}</p>
          <h1 className="u-display max-w-[22ch] text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold leading-tight text-ink">
            {lecture.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {chapter ? (
            <Link
              href={`/docs/book/${String(lecture.n).padStart(2, '0')}-${chapter.slug}`}
              className="u-label inline-flex items-center gap-2 border border-policy/50 bg-policy-soft px-3 py-2.5 text-policy transition-colors hover:border-policy"
            >
              read the chapter
            </Link>
          ) : null}
          <a
            href={`https://www.youtube.com/watch?v=${lecture.video}`}
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
        {lecture.slides.length} slides, in the order they were shown. The timecode on each
        one is when it went up; open a slide and click it to hear that part of the lecture.
      </p>

      <div className="mt-8">
        <Deck slides={lecture.slides} />
      </div>
    </main>
  );
}

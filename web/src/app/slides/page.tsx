import type { Metadata } from 'next';
import Link from 'next/link';
import slides from '@/data/slides.json';
import status from '@/data/status.json';

export const metadata: Metadata = {
  title: 'Slide archive',
  description:
    'Every slide from the eleven lectures, recovered frame by frame from the recordings, each one linked to the moment it was on screen.',
};

export default function SlidesIndex() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <p className="u-label mb-5">Slide archive</p>
      <h1 className="u-display max-w-[20ch] text-[clamp(1.875rem,4vw,2.75rem)] font-semibold leading-tight text-ink">
        {status.slideCount} slides, recovered from the recordings
      </h1>
      <p className="mt-5 max-w-[60ch] font-body text-[1rem] leading-relaxed text-ink-dim">
        The published decks are locked, so the slides were rebuilt from the 1080p videos:
        one frame per stable slide, in order, with the timestamp it appeared. Click any
        slide to jump to that second in the lecture and hear it explained.
      </p>

      <ol className="mt-12 grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {slides.lectures.map((lecture) => (
          <li key={lecture.n} className="bg-surface">
            <Link
              href={`/slides/lecture${String(lecture.n).padStart(2, '0')}`}
              className="group block h-full transition-colors hover:bg-raise"
            >
              <div className="border-b border-line-soft bg-ground/50 p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lecture.slides[0]?.thumb}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="aspect-video w-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-2 p-4">
                <div className="flex items-baseline gap-2.5">
                  <span className="u-readout text-xs text-policy">
                    {String(lecture.n).padStart(2, '0')}
                  </span>
                  <h2 className="u-display text-[0.9375rem] font-semibold leading-snug text-ink">
                    {lecture.title}
                  </h2>
                </div>
                <span className="u-label">{lecture.slides.length} slides</span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}

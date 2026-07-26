import type { Metadata } from 'next';
import Link from 'next/link';
import slides from '@/data/slides.json';
import status from '@/data/status.json';

export const metadata: Metadata = {
  title: 'Slide archive',
  description:
    'Every slide from the eleven lectures and the ten guest talks, recovered frame by frame from the recordings, each one linked to the moment it was on screen.',
};

export default function SlidesIndex() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <p className="u-label mb-5">Slide archive</p>
      <h1 className="u-display max-w-[20ch] text-[clamp(1.875rem,4vw,2.75rem)] font-semibold leading-tight text-ink">
        {status.totalSlideCount} slides, recovered from the recordings
      </h1>
      <p className="mt-5 max-w-[60ch] font-body text-[1rem] leading-relaxed text-ink-dim">
        The published decks are locked, so the slides were rebuilt from the 1080p videos:
        one frame per stable slide, in order, with the timestamp it appeared. Click any
        slide to jump to that second in the recording and hear it explained.
      </p>

      <Section
        label="The lectures"
        heading="Eleven main lectures"
        note={`${status.slideCount} slides`}
      >
        {slides.lectures.map((lecture) => (
          <Card
            key={lecture.key}
            href={`/slides/${lecture.key}`}
            thumb={lecture.slides[0]?.thumb}
            index={String(lecture.n).padStart(2, '0')}
            title={lecture.title}
            meta={`${lecture.slides.length} slides`}
          />
        ))}
      </Section>

      <Section
        label="The guest track"
        heading="Ten talks by the people who built it"
        note={`${status.guestSlideCount} slides`}
        blurb="On selected weeks the course closed with a shorter talk from a researcher behind the work under discussion. These decks are screen-shares, so a speaker's webcam sits over the corner of some frames — the recovered image is the untouched original."
      >
        {slides.guests.map((guest) => (
          <Card
            key={guest.key}
            href={`/slides/${guest.key}`}
            thumb={guest.slides[0]?.thumb}
            index={`W${guest.week}`}
            title={guest.speaker}
            subtitle={guest.title}
            meta={`${guest.slides.length} slides · ${guest.affiliation}`}
          />
        ))}
      </Section>

      <p className="mt-8 max-w-[62ch] border-l-2 border-line pl-4 font-body text-[0.875rem] leading-relaxed text-ink-faint">
        The course held {status.guestTalksHeld} guest sessions. Week{' '}
        {status.missingGuest.week}, {status.missingGuest.speaker} (
        {status.missingGuest.affiliation}), is not here: {status.missingGuest.reason}. It is
        absent from the book for the same reason, rather than reconstructed from published
        work and presented as the talk.
      </p>
    </main>
  );
}

function Section({
  label,
  heading,
  note,
  blurb,
  children,
}: {
  label: string;
  heading: string;
  note: string;
  blurb?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="u-label mb-2">{label}</p>
          <h2 className="u-display text-[1.25rem] font-semibold text-ink">{heading}</h2>
        </div>
        <span className="u-readout text-xs text-ink-faint">{note}</span>
      </div>

      {blurb ? (
        <p className="mb-6 max-w-[62ch] font-body text-[0.875rem] leading-relaxed text-ink-dim">
          {blurb}
        </p>
      ) : null}

      <ol className="grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {children}
      </ol>
    </section>
  );
}

function Card({
  href,
  thumb,
  index,
  title,
  subtitle,
  meta,
}: {
  href: string;
  thumb?: string;
  index: string;
  title: string;
  subtitle?: string;
  meta: string;
}) {
  return (
    <li className="bg-surface">
      <Link href={href} className="group block h-full transition-colors hover:bg-raise">
        <div className="border-b border-line-soft bg-ground/50 p-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt=""
            loading="lazy"
            decoding="async"
            className="aspect-video w-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-baseline gap-2.5">
            <span className="u-readout text-xs text-policy">{index}</span>
            <h3 className="u-display text-[0.9375rem] font-semibold leading-snug text-ink">
              {title}
            </h3>
          </div>
          {subtitle ? (
            <p className="font-body text-[0.8125rem] leading-snug text-ink-dim">{subtitle}</p>
          ) : null}
          <span className="u-label">{meta}</span>
        </div>
      </Link>
    </li>
  );
}

import Link from 'next/link';
import status from '@/data/status.json';

// The eleven lectures, each showing exactly what exists for it so far. Order is the
// course order, and the numbering is the course's own — it is a syllabus, not a list.

function minutes(seconds: number) {
  return `${Math.round(seconds / 60)} min`;
}

export function CourseMap() {
  return (
    <ol className="grid gap-px border border-line bg-line md:grid-cols-2">
      {status.lectures.map((lecture) => {
        const written = Boolean(lecture.chapter);
        const href = written
          ? `/docs/book/${String(lecture.n).padStart(2, '0')}-${lecture.chapter!.slug}`
          : `/slides/lecture${String(lecture.n).padStart(2, '0')}`;

        return (
          <li key={lecture.n} className="bg-surface">
            <Link
              href={href}
              className="group flex h-full flex-col gap-3 p-5 transition-colors hover:bg-raise"
            >
              <div className="flex items-baseline gap-3">
                <span
                  className={`u-readout text-xs ${written ? 'text-policy' : 'text-ink-faint'}`}
                >
                  {String(lecture.n).padStart(2, '0')}
                </span>
                <h3 className="u-display flex-1 text-[0.975rem] font-semibold leading-snug text-ink">
                  {written ? lecture.chapter!.title : lecture.title}
                </h3>
              </div>

              {written ? (
                <p className="font-body text-[0.8125rem] leading-relaxed text-ink-dim">
                  {lecture.chapter!.description}
                </p>
              ) : (
                <p className="font-body text-[0.8125rem] leading-relaxed text-ink-faint">
                  Slides and transcript are in. The chapter is not written yet.
                </p>
              )}

              <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
                <Tag on={written}>chapter</Tag>
                <Tag on>{lecture.slideCount} slides</Tag>
                <Tag on={lecture.hasTranscript}>transcript</Tag>
                <span className="u-readout ml-auto text-[0.625rem] text-ink-faint">
                  {minutes(lecture.duration)}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The guest track, which does not fit the lecture grid: ten talks across eleven weeks,
 * written up as two chapters rather than one chapter each.
 */
export function GuestTrack() {
  return (
    <div className="border border-line bg-surface">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line px-5 py-4">
        <h3 className="u-display text-[0.975rem] font-semibold text-ink">
          The guest track — chapters 12 and 13
        </h3>
        <span className="u-readout text-[0.625rem] text-ink-faint">
          {status.guestTalks} of {status.guestTalksHeld} talks recovered
        </span>
      </div>

      <ol className="grid gap-px bg-line md:grid-cols-2">
        {status.guests.map((guest) => (
          <li key={guest.key} className="bg-surface">
            <Link
              href={`/slides/${guest.key}`}
              className="flex h-full items-baseline gap-3 p-4 transition-colors hover:bg-raise"
            >
              <span className="u-readout text-xs text-policy">W{guest.week}</span>
              <span className="flex-1">
                <span className="u-display block text-[0.875rem] font-semibold leading-snug text-ink">
                  {guest.speaker}
                </span>
                <span className="mt-1 block font-body text-[0.8125rem] leading-snug text-ink-dim">
                  {guest.title}
                </span>
              </span>
              <span className="u-readout text-[0.625rem] text-ink-faint">
                {guest.slideCount}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <p className="border-t border-line px-5 py-4 font-body text-[0.8125rem] leading-relaxed text-ink-faint">
        Week {status.missingGuest.week}, {status.missingGuest.speaker}, is missing:{' '}
        {status.missingGuest.reason}. The book says so rather than filling the gap.
      </p>
    </div>
  );
}

function Tag({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <span className={`u-label flex items-center gap-1.5 ${on ? 'text-ink-dim' : 'text-ink-faint/60'}`}>
      <span
        aria-hidden
        className={`inline-block size-1.5 rounded-full ${on ? 'bg-policy' : 'bg-line'}`}
      />
      {children}
    </span>
  );
}

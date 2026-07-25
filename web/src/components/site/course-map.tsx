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

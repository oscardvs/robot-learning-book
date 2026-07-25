import Link from 'next/link';
import status from '@/data/status.json';

const { course } = status;

// Provenance, stated plainly. This is a student's study companion built from the
// public recordings; it is not the course, and it is not endorsed by it.
export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="u-label mb-3">Provenance</p>
          <p className="max-w-[52ch] font-body text-[0.875rem] leading-relaxed text-ink-dim">
            An unofficial study companion to{' '}
            <a
              href={course.homepage}
              target="_blank"
              rel="noreferrer"
              className="text-policy hover:underline"
            >
              {course.code} {course.title}
            </a>
            , {course.institution}, {course.term}, lectured by {course.lecturer} with{' '}
            {course.mentor} as course mentor. The lectures and slide content are theirs.
            Slide images here are frames from the public recordings; the prose is written
            from the transcripts and is not the lecturers&rsquo; words. Not affiliated with
            or endorsed by {course.institution}.
          </p>
        </div>

        <nav aria-label="Site">
          <p className="u-label mb-3">Read</p>
          <ul className="space-y-2 text-[0.875rem] text-ink-dim">
            <li><Link href="/docs" className="hover:text-ink">The book</Link></li>
            <li><Link href="/slides" className="hover:text-ink">Slide archive</Link></li>
            <li><Link href="/demos" className="hover:text-ink">Live demos</Link></li>
            <li><Link href="/docs/appendix/reading-list" className="hover:text-ink">Reading list</Link></li>
          </ul>
        </nav>

        <nav aria-label="Source">
          <p className="u-label mb-3">Source</p>
          <ul className="space-y-2 text-[0.875rem] text-ink-dim">
            <li>
              <a href={course.homepage} target="_blank" rel="noreferrer" className="hover:text-ink">
                Official course page
              </a>
            </li>
            <li>
              <a href={course.playlist} target="_blank" rel="noreferrer" className="hover:text-ink">
                Lecture recordings
              </a>
            </li>
          </ul>
          <p className="u-readout mt-6 text-[0.625rem] text-ink-faint">
            synced {status.generatedAt}
          </p>
        </nav>
      </div>
    </footer>
  );
}

import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

import { ValueIteration } from '@/components/demos/value-iteration';
import { CourseMap } from '@/components/site/course-map';
import { TelemetryRail } from '@/components/site/telemetry';
import status from '@/data/status.json';

const fmt = new Intl.NumberFormat('en-US');

export default function HomePage() {
  const firstChapter = status.lectures.find((l) => l.chapter);

  return (
    <main>
      {/* ---------------------------------------------------------------- hero */}
      <section className="u-grid-field border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:py-24">
          <div>
            <p className="u-label mb-6">
              {status.course.institution} · {status.course.code} · {status.course.term}
            </p>

            <h1 className="u-display max-w-[16ch] text-[clamp(2.25rem,5.2vw,3.75rem)] font-semibold leading-[1.02] tracking-tight text-ink">
              Teaching machines to move.
            </h1>

            <p className="mt-6 max-w-[46ch] font-body text-[1.0625rem] leading-relaxed text-ink-dim">
              A robot can beat you at chess and cannot pick up your mug. This is the
              course that explains why, and what the field is doing about it — rebuilt
              here as a book you can read straight through, with the slides, the
              recordings, and the algorithms running live on the page.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href={firstChapter ? `/docs/book/01-${firstChapter.chapter!.slug}` : '/docs'}
                className="u-label inline-flex items-center gap-2 border border-policy/50 bg-policy-soft px-4 py-3 text-policy transition-colors hover:border-policy"
              >
                Start reading
                <ArrowRightIcon className="size-3.5" />
              </Link>
              <Link
                href="/slides"
                className="u-label inline-flex items-center gap-2 border border-line px-4 py-3 text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
              >
                Browse {fmt.format(status.slideCount)} slides
              </Link>
            </div>

            <TelemetryRail className="mt-10" />
          </div>

          {/* The oldest algorithm in the field, solving a maze while you read. */}
          <div>
            <ValueIteration variant="ambient" />
            <p className="mt-3 max-w-[46ch] font-body text-[0.8125rem] leading-relaxed text-ink-dim">
              This is value iteration, from Chapter 2. The robot starts knowing nothing but
              where the goal is. Each sweep pushes that knowledge one step further out,
              until every square knows which way to go. Colour is how good a square is; the
              arrows are the plan that falls out of it.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- what this is */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="u-label mb-4">What this is</p>
            <h2 className="u-display max-w-[18ch] text-[1.75rem] font-semibold leading-tight text-ink">
              Eleven lectures, turned into something you can study from.
            </h2>
          </div>

          <div className="space-y-5 font-body text-[1rem] leading-relaxed text-ink-dim">
            <p>
              The course recordings are public and excellent. They are also ten and a half
              hours long, and a video is a bad place to look something up. This site is the
              same material as a written book: {fmt.format(status.transcriptWords)} words of
              transcript read against {fmt.format(status.slideCount)} slides, rewritten as
              prose that explains rather than summarises.
            </p>
            <p>
              Where the lecture showed an algorithm running, the page runs it. Where it put
              up an equation, the equation is here with every symbol named. Where the
              lecturer misspoke a date or an institution, an editor&rsquo;s note says so
              rather than quietly repeating it.
            </p>
            <p className="text-ink-faint">
              It is being written one chapter at a time, and the numbers above are the real
              state of it. Chapters that are not finished say so.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- the map */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="u-label mb-3">The course</p>
            <h2 className="u-display text-[1.5rem] font-semibold text-ink">
              Fundamentals first, then scale
            </h2>
          </div>
          <p className="max-w-[42ch] font-body text-[0.875rem] leading-relaxed text-ink-dim">
            Chapters 1–5 are the fundamentals: control, imitation, reinforcement learning.
            6–11 are what happens when you bring modern generative models to them.
          </p>
        </div>

        <CourseMap />
      </section>

      {/* ----------------------------------------------------------- the legend */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="border border-line bg-surface p-8">
          <p className="u-label mb-5">How to read the colours</p>
          <div className="grid gap-8 md:grid-cols-3">
            <Legend swatch="bg-demo" name="Demonstration">
              Anything that came from a person: expert data, teleoperation, imitation.
              Editor&rsquo;s notes are in this colour too — they are the human in the loop.
            </Legend>
            <Legend swatch="bg-policy" name="Policy">
              The machine&rsquo;s own estimate: what it has learned, what it predicts, what
              it plans to do next.
            </Legend>
            <Legend swatch="bg-reward" name="Reward">
              Value and reward — the signal being maximised, and the failures that come from
              getting it wrong.
            </Legend>
          </div>
          <p className="mt-7 max-w-[70ch] font-body text-[0.875rem] leading-relaxed text-ink-faint">
            These three meanings hold everywhere on the site, in the figures and in the
            demos. If something is coloured, it is saying one of these three things.
          </p>
        </div>
      </section>
    </main>
  );
}

function Legend({
  swatch,
  name,
  children,
}: {
  swatch: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2.5">
        <span aria-hidden className={`inline-block h-3 w-8 ${swatch}`} />
        <span className="u-display text-[0.9375rem] font-semibold text-ink">{name}</span>
      </div>
      <p className="font-body text-[0.875rem] leading-relaxed text-ink-dim">{children}</p>
    </div>
  );
}

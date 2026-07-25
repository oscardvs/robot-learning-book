import type { ReactNode } from 'react';
import { PlayIcon } from 'lucide-react';

interface FigureProps {
  id?: string;
  number?: string;
  src: string;
  scale?: string;
  /** Deep link into the recording at the moment this slide was on screen. */
  videoUrl?: string;
  timecode?: string;
  lecture?: string;
  children?: ReactNode;
}

/**
 * A figure plate. Book figures are frames lifted out of the lecture recording, so
 * each one keeps a link back to the second it came from — the caption tells you what
 * to look at, the timecode lets you go watch it being explained.
 */
export function Figure({ id, number, src, scale, videoUrl, timecode, lecture, children }: FigureProps) {
  return (
    <figure id={id} className="my-9 scroll-mt-24">
      <div
        className="u-ticks relative mx-auto border border-line bg-surface p-1.5"
        style={{ maxWidth: scale ?? '100%' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="block w-full rounded-[1px]"
        />
      </div>

      <figcaption className="mx-auto mt-3 flex max-w-[62ch] flex-col gap-2 text-[0.8125rem] leading-relaxed text-ink-dim">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {number ? (
            <span className="u-label border border-policy/35 px-1.5 py-1 text-policy">
              Fig {number}
            </span>
          ) : null}
          {videoUrl ? (
            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
              className="u-readout inline-flex items-center gap-1.5 text-[0.6875rem] text-ink-faint transition-colors hover:text-policy"
            >
              <PlayIcon className="size-3" aria-hidden />
              {lecture ? `L${lecture} · ` : ''}
              {timecode}
              <span className="sr-only">— watch this slide in the recording</span>
            </a>
          ) : null}
        </div>
        {children ? <div className="font-body">{children}</div> : null}
      </figcaption>
    </figure>
  );
}

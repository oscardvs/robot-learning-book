import type { ReactNode } from 'react';
import { MaximizeIcon, PlayIcon } from 'lucide-react';

interface FigureProps {
  id?: string;
  number?: string;
  src: string;
  scale?: string;
  /** Deep link into the recording at the moment this slide was on screen. */
  videoUrl?: string;
  timecode?: string;
  lecture?: string;
  /** Named source for a frame that is not from a numbered lecture — a guest speaker. */
  source?: string;
  children?: ReactNode;
}

/**
 * A figure plate. Book figures are frames lifted out of the lecture recording, so
 * each one keeps a link back to the second it came from — the caption tells you what
 * to look at, the timecode lets you go watch it being explained.
 */
export function Figure({ id, number, src, scale, videoUrl, timecode, lecture, source, children }: FigureProps) {
  return (
    // The plate and its caption share one column so the label lines up with the
    // image's left edge rather than floating in the middle of the text measure.
    <figure id={id} className="mx-auto my-9 scroll-mt-24" style={{ maxWidth: scale ?? '100%' }}>
      {/*
        The plate is a button rather than a plain image: these are 1080p frames printed at
        about half size, so the small print on a slide is present but unreadable until it
        is opened. `FigureZoom` on the page listens for the click — see the note there for
        why the handler does not live here.
      */}
      <button
        type="button"
        data-zoom
        data-zoom-src={src}
        data-zoom-label={number ? `Fig ${number}` : 'Figure'}
        data-zoom-watch-href={videoUrl}
        data-zoom-watch-text={videoUrl ? `watch at ${timecode}` : undefined}
        aria-label={number ? `Enlarge figure ${number}` : 'Enlarge figure'}
        className="u-ticks group relative block w-full cursor-zoom-in border border-line bg-surface p-1.5 transition-colors hover:border-ink-faint"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="block w-full rounded-[1px]"
        />
        <span
          aria-hidden
          className="u-label pointer-events-none absolute bottom-3 right-3 flex items-center gap-1 border border-line bg-ground/85 px-1.5 py-1 text-[0.5625rem] text-ink-dim opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <MaximizeIcon className="size-2.5" />
          enlarge
        </span>
      </button>

      <figcaption className="mt-3 flex max-w-[62ch] flex-col gap-2 text-[0.8125rem] leading-relaxed text-ink-dim">
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
              {source ? `${source} · ` : ''}
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

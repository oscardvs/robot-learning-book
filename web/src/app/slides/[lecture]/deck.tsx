'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, XIcon } from 'lucide-react';

export interface Slide {
  n: number;
  src: string;
  thumb: string;
  timecode: string;
  watch: string;
}

/**
 * The deck, as a contact sheet. Opening a slide gives you the full frame and the
 * link back to the recording; arrow keys walk the deck.
 */
export function Deck({ slides }: { slides: Slide[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const move = useCallback(
    (delta: number) =>
      setOpen((current) =>
        current === null ? null : Math.min(slides.length - 1, Math.max(0, current + delta)),
      ),
    [slides.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null);
      if (event.key === 'ArrowRight') move(1);
      if (event.key === 'ArrowLeft') move(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, move]);

  const active = open === null ? null : slides[open];

  return (
    <>
      <ol className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-4">
        {slides.map((slide, i) => (
          <li key={slide.n} className="bg-surface">
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block w-full text-left transition-colors hover:bg-raise"
            >
              <div className="p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.thumb}
                  alt={`Slide ${slide.n}`}
                  loading="lazy"
                  decoding="async"
                  className="aspect-video w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between px-2.5 pb-2.5">
                <span className="u-readout text-[0.6875rem] text-ink-faint">
                  {String(slide.n).padStart(3, '0')}
                </span>
                <span className="u-readout text-[0.6875rem] text-ink-faint group-hover:text-policy">
                  {slide.timecode}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ol>

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Slide ${active.n}`}
          className="fixed inset-0 z-50 flex flex-col bg-ground/95 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <div className="flex items-center gap-4 border-b border-line px-4 py-3">
            <span className="u-readout text-sm text-ink">
              {String(active.n).padStart(3, '0')} / {slides.length}
            </span>
            <a
              href={active.watch}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="u-label inline-flex items-center gap-1.5 border border-policy/50 px-2.5 py-2 text-policy transition-colors hover:bg-policy-soft"
            >
              <PlayIcon className="size-3" />
              watch at {active.timecode}
            </a>
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="u-label ml-auto inline-flex items-center gap-1.5 border border-line px-2.5 py-2 text-ink-dim hover:text-ink"
            >
              <XIcon className="size-3" />
              close
            </button>
          </div>

          <div className="flex flex-1 items-center gap-2 overflow-hidden p-3 sm:p-6">
            <Arrow
              direction="left"
              disabled={open === 0}
              onClick={(e) => {
                e.stopPropagation();
                move(-1);
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.src}
              alt={`Slide ${active.n}`}
              onClick={(e) => e.stopPropagation()}
              className="mx-auto max-h-full min-h-0 w-auto max-w-full border border-line object-contain"
            />
            <Arrow
              direction="right"
              disabled={open === slides.length - 1}
              onClick={(e) => {
                e.stopPropagation();
                move(1);
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

function Arrow({
  direction,
  disabled,
  onClick,
}: {
  direction: 'left' | 'right';
  disabled: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const Icon = direction === 'left' ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'left' ? 'Previous slide' : 'Next slide'}
      className="shrink-0 border border-line p-2 text-ink-dim transition-colors hover:text-ink disabled:opacity-25"
    >
      <Icon className="size-5" />
    </button>
  );
}

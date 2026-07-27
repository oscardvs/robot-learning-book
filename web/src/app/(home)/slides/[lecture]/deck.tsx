'use client';

import { useMemo, useState } from 'react';

import { ImageViewer, type ViewerItem } from '@/components/book/lightbox';

export interface Slide {
  n: number;
  src: string;
  thumb: string;
  timecode: string;
  watch: string;
}

/**
 * The deck, as a contact sheet. Opening a slide gives you the full frame in the same
 * viewer the chapters use — magnifiable, because these are lecture captures and the
 * interesting detail is usually the small print.
 */
export function Deck({ slides }: { slides: Slide[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const items = useMemo<ViewerItem[]>(
    () =>
      slides.map((slide) => ({
        src: slide.src,
        label: `Slide ${String(slide.n).padStart(3, '0')}`,
        watch: { href: slide.watch, text: `watch at ${slide.timecode}` },
      })),
    [slides],
  );

  return (
    <>
      <ol className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-4">
        {slides.map((slide, i) => (
          <li key={slide.n} className="bg-surface">
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block w-full cursor-zoom-in text-left transition-colors hover:bg-raise"
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

      {open === null ? null : (
        <ImageViewer
          items={items}
          index={open}
          onIndex={(next) => setOpen(Math.min(items.length - 1, Math.max(0, next)))}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}

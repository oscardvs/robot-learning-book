'use client';

import { useEffect, useState } from 'react';

import { ImageViewer, type ViewerItem } from './lightbox';

/**
 * Makes every figure on a chapter page open in the viewer, and lets the arrow keys walk
 * from one to the next.
 *
 * The figures themselves stay server-rendered: `Figure` marks its plate with `data-zoom`
 * and this listens for clicks on any of them. That keeps the chapter's markup free of
 * per-figure client components, and it means the reading order is simply the order the
 * plates appear in the document — read off the DOM at the moment one is opened, so it is
 * right whatever the page did on its way to being rendered.
 */
export function FigureZoom() {
  const [items, setItems] = useState<ViewerItem[]>([]);
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const plate = target?.closest?.('[data-zoom]');
      if (!plate) return;
      event.preventDefault();

      const plates = [...document.querySelectorAll<HTMLElement>('[data-zoom]')];
      setItems(plates.map(read));
      setIndex(plates.indexOf(plate as HTMLElement));
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  if (index === null) return null;

  return (
    <ImageViewer
      items={items}
      index={index}
      onIndex={setIndex}
      onClose={() => setIndex(null)}
    />
  );
}

function read(plate: HTMLElement): ViewerItem {
  const watchHref = plate.dataset.zoomWatchHref;
  return {
    src: plate.dataset.zoomSrc ?? '',
    label: plate.dataset.zoomLabel || 'Figure',
    watch: watchHref ? { href: watchHref, text: plate.dataset.zoomWatchText ?? 'watch' } : undefined,
    // The caption is already written out beneath the plate; reusing its text keeps the
    // two from drifting apart, and maths in it has been rendered to readable characters
    // by KaTeX by the time this runs.
    caption: plate.closest('figure')?.querySelector('figcaption .font-body')?.textContent ?? undefined,
  };
}

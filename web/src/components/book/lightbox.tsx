'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MinusIcon,
  PlayIcon,
  PlusIcon,
  RotateCcwIcon,
  XIcon,
} from 'lucide-react';

/**
 * The slide viewer. Every image in the book is a 1080p frame lifted out of a lecture
 * recording, printed on the page at about half that. The detail is there — the axis
 * labels, the numbers on a plot, the small print under a diagram — it is just too
 * small to read in the column. This opens the frame at its own size and lets you
 * magnify it further.
 */

const MIN_SCALE = 1;
// The frames are 1440px wide, so 6x is already well past the detail actually in the file.
const MAX_SCALE = 6;
const STEP = 1.6;

export interface ViewerItem {
  src: string;
  /** Shown top-left: "Fig 4.2", "Slide 007". */
  label: string;
  /** Deep link back into the recording, where there is one. */
  watch?: { href: string; text: string };
  caption?: ReactNode;
}

interface View {
  scale: number;
  x: number;
  y: number;
}

const RESET: View = { scale: 1, x: 0, y: 0 };
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function ImageViewer({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: ViewerItem[];
  index: number;
  onIndex: (next: number) => void;
  onClose: () => void;
}) {
  const [view, setView] = useState<View>(RESET);
  // True only while a finger or the mouse button is down. It drives the cursor and
  // suspends the transition, and it is state rather than a ref because both of those
  // are read while rendering.
  const [interacting, setInteracting] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const pinch = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null);

  const active = items[index];
  const zoomed = view.scale > 1.001;

  // A new frame starts at its natural size rather than inheriting the last one's zoom.
  // Adjusting during render rather than in an effect means the fresh frame never paints
  // once at the old magnification first.
  const [shownIndex, setShownIndex] = useState(index);
  if (shownIndex !== index) {
    setShownIndex(index);
    setView(RESET);
  }

  /** Keep the image overlapping the stage: pan is bounded by how far it overflows. */
  const bound = useCallback((next: View): View => {
    const stage = stageRef.current;
    const img = imgRef.current;
    if (!stage || !img) return next;
    const limitX = Math.max(0, (img.offsetWidth * next.scale - stage.clientWidth) / 2);
    const limitY = Math.max(0, (img.offsetHeight * next.scale - stage.clientHeight) / 2);
    return { ...next, x: clamp(next.x, -limitX, limitX), y: clamp(next.y, -limitY, limitY) };
  }, []);

  /**
   * Zoom about a fixed point, so whatever is under the cursor stays under the cursor.
   * `px, py` are measured from the centre of the stage; the content point beneath them
   * is `(p - offset) / scale`, and holding that constant gives the new offset.
   */
  const zoomAbout = useCallback(
    (nextScale: number, px = 0, py = 0) =>
      setView((v) => {
        const scale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
        if (scale === MIN_SCALE) return RESET;
        const ratio = scale / v.scale;
        return bound({ scale, x: px - ratio * (px - v.x), y: py - ratio * (py - v.y) });
      }),
    [bound],
  );

  /** Pointer position relative to the centre of the stage. */
  const fromCentre = (clientX: number, clientY: number) => {
    const box = stageRef.current?.getBoundingClientRect();
    if (!box) return { px: 0, py: 0 };
    return { px: clientX - (box.left + box.width / 2), py: clientY - (box.top + box.height / 2) };
  };

  // Wheel zoom has to be a native non-passive listener: React's onWheel is passive, so it
  // cannot stop the page behind the overlay from scrolling.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const { px, py } = fromCentre(event.clientX, event.clientY);
      setView((v) => {
        const scale = clamp(v.scale * Math.exp(-event.deltaY / 320), MIN_SCALE, MAX_SCALE);
        if (scale === MIN_SCALE) return RESET;
        const ratio = scale / v.scale;
        return bound({ scale, x: px - ratio * (px - v.x), y: py - ratio * (py - v.y) });
      });
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [bound]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          return onClose();
        case 'ArrowRight':
          return onIndex(Math.min(items.length - 1, index + 1));
        case 'ArrowLeft':
          return onIndex(Math.max(0, index - 1));
        case '+':
        case '=':
          return zoomAbout(view.scale * STEP);
        case '-':
        case '_':
          return zoomAbout(view.scale / STEP);
        case '0':
          return setView(RESET);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, items.length, onClose, onIndex, zoomAbout, view.scale]);

  // The page behind must not scroll while the overlay is up.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pinch.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch.current.size === 2) {
      const [a, b] = [...pinch.current.values()];
      pinchStart.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale: view.scale };
      drag.current = null;
      setInteracting(true);
      return;
    }
    if (!zoomed) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, x: event.clientX - view.x, y: event.clientY - view.y };
    setInteracting(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pinch.current.has(event.pointerId)) {
      pinch.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }

    if (pinch.current.size === 2 && pinchStart.current) {
      const [a, b] = [...pinch.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const { px, py } = fromCentre((a.x + b.x) / 2, (a.y + b.y) / 2);
      zoomAbout((pinchStart.current.scale * distance) / pinchStart.current.distance, px, py);
      return;
    }

    const held = drag.current;
    if (!held || held.id !== event.pointerId) return;
    setView((v) => bound({ ...v, x: event.clientX - held.x, y: event.clientY - held.y }));
  };

  const endPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    pinch.current.delete(event.pointerId);
    if (pinch.current.size < 2) pinchStart.current = null;
    if (drag.current?.id === event.pointerId) drag.current = null;
    if (!drag.current && !pinchStart.current) setInteracting(false);
  };

  if (!active) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={active.label}
      className="fixed inset-0 z-50 flex flex-col bg-ground/95 backdrop-blur-sm"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-3 py-2.5 sm:px-4">
        <span className="u-readout text-sm text-ink">
          {active.label}
          {items.length > 1 ? (
            <span className="text-ink-faint"> · {index + 1}/{items.length}</span>
          ) : null}
        </span>

        {active.watch ? (
          <a
            href={active.watch.href}
            target="_blank"
            rel="noreferrer"
            className="u-label inline-flex items-center gap-1.5 border border-policy/50 px-2.5 py-2 text-policy transition-colors hover:bg-policy-soft"
          >
            <PlayIcon className="size-3" aria-hidden />
            {active.watch.text}
          </a>
        ) : null}

        <div className="ml-auto flex items-center gap-1">
          <Control label="Zoom out" onClick={() => zoomAbout(view.scale / STEP)} disabled={!zoomed}>
            <MinusIcon className="size-3.5" aria-hidden />
          </Control>
          <span className="u-readout w-14 text-center text-[0.6875rem] text-ink-faint tabular-nums">
            {Math.round(view.scale * 100)}%
          </span>
          <Control
            label="Zoom in"
            onClick={() => zoomAbout(view.scale * STEP)}
            disabled={view.scale >= MAX_SCALE}
          >
            <PlusIcon className="size-3.5" aria-hidden />
          </Control>
          <Control label="Reset zoom" onClick={() => setView(RESET)} disabled={!zoomed}>
            <RotateCcwIcon className="size-3.5" aria-hidden />
          </Control>
          <Control label="Close" onClick={onClose}>
            <XIcon className="size-3.5" aria-hidden />
          </Control>
        </div>
      </div>

      {/* The arrows float over the stage rather than sitting beside it: on a phone a
          column of controls either side costs more of the frame than it is worth. */}
      <div className="relative flex flex-1 items-center overflow-hidden p-2 sm:p-4">
        <Arrow
          direction="left"
          disabled={index === 0}
          onClick={() => onIndex(index - 1)}
          hidden={items.length < 2}
        />

        <div
          ref={stageRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onDoubleClick={(event) => {
            const { px, py } = fromCentre(event.clientX, event.clientY);
            zoomAbout(zoomed ? MIN_SCALE : 2.5, px, py);
          }}
          // Clicking the backdrop closes; clicking the image does not.
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
          className="relative flex h-full min-w-0 flex-1 touch-none select-none items-center justify-center overflow-hidden"
          style={{ cursor: zoomed ? (interacting ? 'grabbing' : 'grab') : 'zoom-in' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={active.src}
            alt={active.label}
            draggable={false}
            className="max-h-full max-w-full border border-line object-contain"
            style={{
              transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
              transition: interacting ? 'none' : 'transform 140ms ease-out',
              // Past about 3x the browser's smoothing has nothing left to work with and
              // turns text to mush. These are screen captures of text, so beyond that
              // point the hard pixel edges are the more legible of the two bad options.
              imageRendering: view.scale > 3 ? 'pixelated' : 'auto',
            }}
          />
        </div>

        <Arrow
          direction="right"
          disabled={index === items.length - 1}
          onClick={() => onIndex(index + 1)}
          hidden={items.length < 2}
        />
      </div>

      {active.caption ? (
        <div className="max-h-[22vh] overflow-y-auto border-t border-line px-4 py-3">
          <p className="mx-auto max-w-[70ch] font-body text-[0.8125rem] leading-relaxed text-ink-dim">
            {active.caption}
          </p>
        </div>
      ) : null}

      <p className="u-readout border-t border-line px-4 py-2 text-center text-[0.625rem] text-ink-faint">
        scroll or pinch to zoom · drag to pan · double-click to toggle
        {items.length > 1 ? ' · ← → to step' : ''} · esc to close
      </p>
    </div>
  );
}

function Control({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="border border-line p-2 text-ink-dim transition-colors hover:text-ink disabled:opacity-25"
    >
      {children}
    </button>
  );
}

function Arrow({
  direction,
  disabled,
  onClick,
  hidden,
}: {
  direction: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
  hidden?: boolean;
}) {
  if (hidden) return null;
  const Icon = direction === 'left' ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'left' ? 'Previous' : 'Next'}
      className={`absolute top-1/2 z-10 -translate-y-1/2 border border-line bg-ground/70 p-1.5 text-ink-dim backdrop-blur-sm transition-colors hover:text-ink disabled:opacity-25 sm:p-2 ${
        direction === 'left' ? 'left-2 sm:left-4' : 'right-2 sm:right-4'
      }`}
    >
      <Icon className="size-4 sm:size-5" />
    </button>
  );
}

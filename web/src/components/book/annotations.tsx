import type { ReactNode } from 'react';
import Link from 'next/link';

const KIND_LABEL: Record<string, string> = {
  fig: 'Figure',
  eq: 'Equation',
  tbl: 'Table',
  sec: 'Section',
  lst: 'Listing',
};

/** A resolved cross-reference: "Figure 1.2", linked to the plate itself. */
export function XRef({ kind, anchor, number }: { kind: string; anchor: string; number: string }) {
  const label = KIND_LABEL[kind] ?? 'Item';
  const text = kind === 'eq' ? `${label} (${number})` : `${label} ${number}`;

  return (
    <Link
      href={`#${anchor}`}
      className="u-readout text-[0.94em] text-policy no-underline decoration-policy/40 underline-offset-4 hover:underline"
    >
      {text}
    </Link>
  );
}

/**
 * The book's editorial voice, kept visibly separate from the lecture's. These notes
 * are where the author corrects a date, flags a mis-attribution, or supplies context
 * the lecture skipped — so they must never read as if the lecturer said them.
 */
export function EditorNote({ children }: { children?: ReactNode }) {
  return (
    <aside className="my-7 border-l-2 border-demo/60 bg-demo-soft/40 py-4 pl-5 pr-4">
      <p className="u-label mb-2 text-demo">Editor’s note</p>
      <div className="space-y-2 font-body text-[0.9375rem] leading-relaxed text-ink-dim [&_a]:text-demo">
        {children}
      </div>
    </aside>
  );
}

/** A quotation or a definition lifted from the course, set apart from the prose. */
export function Aside({ children }: { children?: ReactNode }) {
  return (
    <blockquote className="my-7 border-l-2 border-policy/50 bg-policy-soft/30 py-4 pl-5 pr-4 font-body text-[1.03rem] not-italic leading-relaxed text-ink [&_p]:my-1.5">
      {children}
    </blockquote>
  );
}

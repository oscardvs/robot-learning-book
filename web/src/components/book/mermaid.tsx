'use client';

import { useEffect, useId, useRef, useState } from 'react';

// Diagrams render in the browser: mermaid is large, so it is loaded only on pages
// that actually contain one.

export function Mermaid({ chart, caption }: { chart: string; caption?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;

    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        const dark = document.documentElement.classList.contains('dark');
        const read = (name: string, fallback: string) =>
          getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          fontFamily: 'var(--font-display), sans-serif',
          theme: 'base',
          themeVariables: {
            background: read('--surface', dark ? '#0b1120' : '#ffffff'),
            primaryColor: read('--raise', dark ? '#121a2c' : '#eaeef7'),
            primaryTextColor: read('--ink', dark ? '#e9eef9' : '#0c1322'),
            primaryBorderColor: read('--policy', '#5fdcff'),
            lineColor: read('--ink-faint', '#5d6a84'),
            secondaryColor: read('--raise', '#121a2c'),
            tertiaryColor: read('--surface', '#0b1120'),
            fontSize: '14px',
          },
        });

        const { svg: out } = await mermaid.render(`m${id}`, chart);
        if (live) setSvg(out);
      } catch {
        if (live) setFailed(true);
      }
    })();

    return () => {
      live = false;
    };
  }, [chart, id]);

  if (failed) {
    return (
      <pre className="my-7 overflow-x-auto border border-line bg-surface p-4 text-xs text-ink-dim">
        {chart}
      </pre>
    );
  }

  return (
    <figure className="my-9">
      <div
        ref={host}
        className="flex justify-center overflow-x-auto border border-line bg-surface p-5 [&_svg]:max-w-full"
        // mermaid is configured with securityLevel 'strict', which strips script and
        // event handlers from the diagram it produces.
        dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
      >
        {svg ? undefined : <span className="u-label py-8">drawing…</span>}
      </div>
      {caption ? (
        <figcaption className="mt-3 max-w-[62ch] font-body text-[0.8125rem] leading-relaxed text-ink-dim">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

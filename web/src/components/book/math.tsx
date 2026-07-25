import katex from 'katex';

// Maths is rendered at build time and shipped as markup. Nothing about an equation
// changes at runtime, so none of KaTeX needs to reach the browser.

function render(tex: string, displayMode: boolean) {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      strict: false,
      output: 'html',
      trust: false,
    });
  } catch {
    return null;
  }
}

export function InlineMath({ tex, display }: { tex: string; display?: string }) {
  const html = render(tex, false);
  if (!html) return <code>{tex}</code>;
  return (
    <span
      className={display ? 'inline-block px-1' : undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * A numbered display equation. The number sits in the right margin the way it does
 * in the printed book, and doubles as the anchor a cross-reference jumps to.
 */
export function BlockMath({ tex, id, number }: { tex: string; id?: string; number?: string }) {
  const html = render(tex, true);

  return (
    <div
      id={id}
      className="relative my-7 scroll-mt-24 rounded-sm border border-line-soft bg-surface/60 py-5 pl-6 pr-16"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-px bg-policy/40"
      />
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="overflow-x-auto text-sm">{tex}</pre>
      )}
      {number ? (
        <span className="u-readout absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-faint">
          ({number})
        </span>
      ) : null}
    </div>
  );
}

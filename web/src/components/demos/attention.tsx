'use client';

import { useMemo, useState } from 'react';

// One attention head, computed in the page. The vectors are fixed rather than learned —
// what is being shown is what the mask and the scaling do to a distribution, and both do
// it regardless of where the vectors came from. Every distinct word gets one embedding,
// so the two occurrences of "the" really are identical keys.

const TOKENS = ['the', 'robot', 'picked', 'up', 'the', 'red', 'mug'];
const MAX_DIM = 64;

/** Deterministic, so the server and the browser render the same numbers. */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function embeddings() {
  const vocabulary = [...new Set(TOKENS)];
  const table = new Map<string, { q: number[]; k: number[] }>();

  vocabulary.forEach((word, i) => {
    const random = lcg(9001 + i * 7919);
    const q: number[] = [];
    const k: number[] = [];
    for (let d = 0; d < MAX_DIM; d++) {
      q.push(random() * 2 - 1);
      k.push(random() * 2 - 1);
    }
    table.set(word, { q, k });
  });

  return table;
}

function softmax(row: number[]): number[] {
  const max = Math.max(...row.filter(Number.isFinite));
  if (!Number.isFinite(max)) return row.map(() => 0);
  const exp = row.map((v) => (Number.isFinite(v) ? Math.exp(v - max) : 0));
  const total = exp.reduce((sum, v) => sum + v, 0);
  return exp.map((v) => (total > 0 ? v / total : 0));
}

export interface AttentionProps {
  caption?: string;
}

export function Attention({ caption }: AttentionProps) {
  const [causal, setCausal] = useState(true);
  const [scaled, setScaled] = useState(true);
  const [dim, setDim] = useState(32);
  const [query, setQuery] = useState(6);

  const table = useMemo(embeddings, []);

  const weights = useMemo(() => {
    const scale = scaled ? Math.sqrt(dim) : 1;

    return TOKENS.map((_, i) => {
      const q = table.get(TOKENS[i])!.q;
      const row = TOKENS.map((_, j) => {
        if (causal && j > i) return Number.NEGATIVE_INFINITY;
        const k = table.get(TOKENS[j])!.k;
        let dot = 0;
        for (let d = 0; d < dim; d++) dot += q[d] * k[d];
        return dot / scale;
      });
      return softmax(row);
    });
  }, [causal, scaled, dim, table]);

  const peak = Math.max(...weights[query]);

  return (
    <figure className="my-9">
      <div className="border border-line bg-surface">
        <div className="overflow-x-auto p-4">
          <table className="min-w-[26rem] border-collapse">
            <thead>
              <tr>
                <th className="w-20" />
                {TOKENS.map((token, j) => (
                  <th
                    key={j}
                    className="u-label px-1 pb-2 text-center font-normal text-ink-faint"
                  >
                    {token}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weights.map((row, i) => (
                <tr
                  key={i}
                  onMouseEnter={() => setQuery(i)}
                  className={i === query ? 'bg-raise' : undefined}
                >
                  <th className="u-label whitespace-nowrap py-0.5 pr-3 text-right font-normal text-ink-dim">
                    {TOKENS[i]}
                  </th>
                  {row.map((w, j) => {
                    const masked = causal && j > i;
                    return (
                      <td key={j} className="p-0.5">
                        <div
                          title={masked ? 'masked' : w.toFixed(3)}
                          className={`flex h-8 items-center justify-center text-[0.5625rem] ${
                            masked ? 'bg-line-soft' : ''
                          }`}
                          style={
                            masked
                              ? undefined
                              : {
                                  backgroundColor: `color-mix(in srgb, var(--policy) ${Math.round(
                                    w * 100,
                                  )}%, var(--ground))`,
                                }
                          }
                        >
                          <span className={w > 0.55 ? 'text-surface' : 'text-ink-faint'}>
                            {masked ? '' : w >= 0.1 ? w.toFixed(2).slice(1) : ''}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line p-4">
          <Toggle on={causal} onClick={() => setCausal((v) => !v)}>
            causal mask
          </Toggle>
          <Toggle on={scaled} onClick={() => setScaled((v) => !v)}>
            divide by √d
          </Toggle>

          <label className="flex items-center gap-2.5">
            <span className="u-label">d</span>
            <input
              type="range"
              min={4}
              max={MAX_DIM}
              step={4}
              value={dim}
              onChange={(event) => setDim(Number(event.target.value))}
              className="h-1 w-24 accent-[var(--policy)]"
            />
            <span className="u-readout text-[0.6875rem] text-ink-dim">{dim}</span>
          </label>

          <span className="u-readout ml-auto text-[0.6875rem] text-ink-dim">
            peak weight {peak.toFixed(2)}
          </span>
        </div>
      </div>

      <figcaption className="mt-3 max-w-[62ch] font-body text-[0.8125rem] leading-relaxed text-ink-dim">
        {caption ?? (
          <>
            One head attending over seven tokens; each row is one query&rsquo;s distribution
            over the keys, and every row sums to one. Turn off the{' '}
            <strong className="font-semibold text-ink">causal mask</strong> and every position
            can see the future, which is exactly what makes the encoder bidirectional and the
            decoder untrainable in one pass. Turn off{' '}
            <strong className="font-semibold text-ink">√d</strong> and raise d: the dot
            products grow with dimension, the softmax saturates onto a single key, and the
            gradient through the other terms goes to nothing. That is the whole reason the
            scaling is there.
          </>
        )}
      </figcaption>
    </figure>
  );
}

function Toggle({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`u-label inline-flex items-center gap-2 border px-2.5 py-2 transition-colors ${
        on
          ? 'border-policy/50 bg-policy-soft text-policy'
          : 'border-line text-ink-faint hover:border-ink-faint hover:text-ink'
      }`}
    >
      <span
        aria-hidden
        className={`inline-block size-1.5 rounded-full ${on ? 'bg-policy' : 'bg-line'}`}
      />
      {children}
    </button>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PauseIcon, PlayIcon, RotateCcwIcon, StepForwardIcon } from 'lucide-react';

import {
  COLS,
  DEFAULT_HYPER,
  GOAL,
  type Hyper,
  type Learner,
  ROWS,
  START,
  greedyPath,
  isCliff,
  makeLearner,
  recentReturn,
  runEpisode,
} from './cliff';

interface Snapshot {
  episodes: number;
  qPath: number[];
  sarsaPath: number[];
  qReturn: number | null;
  sarsaReturn: number | null;
}

const EMPTY: Snapshot = {
  episodes: 0,
  qPath: [START],
  sarsaPath: [START],
  qReturn: null,
  sarsaReturn: null,
};

export interface CliffWalkProps {
  caption?: string;
}

/**
 * Both rules learn on the same cliff at the same time, from their own experience. The
 * point is not which one wins — it is that they converge on different routes, and that
 * the difference is one term in the update.
 */
export function CliffWalk({ caption }: CliffWalkProps) {
  const [hyper, setHyper] = useState<Hyper>(DEFAULT_HYPER);
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY);
  const [running, setRunning] = useState(false);

  const learners = useRef<{ q: Learner; sarsa: Learner }>({
    q: makeLearner('q-learning'),
    sarsa: makeLearner('sarsa'),
  });
  const hyperRef = useRef(hyper);
  hyperRef.current = hyper;

  const read = useCallback((): Snapshot => {
    const { q, sarsa } = learners.current;
    return {
      episodes: q.episodes,
      qPath: greedyPath(q.q),
      sarsaPath: greedyPath(sarsa.q),
      qReturn: recentReturn(q),
      sarsaReturn: recentReturn(sarsa),
    };
  }, []);

  const advance = useCallback(
    (count: number) => {
      const { q, sarsa } = learners.current;
      for (let i = 0; i < count; i++) {
        runEpisode(q, hyperRef.current);
        runEpisode(sarsa, hyperRef.current);
      }
      setSnapshot(read());
    },
    [read],
  );

  const reset = useCallback(() => {
    learners.current = { q: makeLearner('q-learning'), sarsa: makeLearner('sarsa') };
    setRunning(false);
    setSnapshot(EMPTY);
  }, []);

  // Ten episodes a tick: enough that the two routes separate while you watch, slow
  // enough that you can see it happen.
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => advance(10), 120);
    return () => clearInterval(timer);
  }, [running, advance]);

  const onQ = new Set(snapshot.qPath);
  const onSarsa = new Set(snapshot.sarsaPath);

  return (
    <figure className="my-9">
      <div className="border border-line bg-surface">
        {/* ------------------------------------------------------------- the grid */}
        <div className="overflow-x-auto p-4">
          <div
            className="grid min-w-[30rem] gap-px bg-line"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: ROWS * COLS }, (_, s) => {
              const cliff = isCliff(s);
              const both = onQ.has(s) && onSarsa.has(s);
              const label =
                s === START ? 'S' : s === GOAL ? 'G' : cliff ? '' : both ? '◆' : onQ.has(s) ? '●' : onSarsa.has(s) ? '●' : '';

              return (
                <div
                  key={s}
                  className={[
                    'flex aspect-square items-center justify-center text-[0.6875rem] font-semibold',
                    cliff ? 'bg-reward-soft text-reward' : 'bg-surface',
                    both
                      ? 'text-ink'
                      : onQ.has(s)
                        ? 'text-policy'
                        : onSarsa.has(s)
                          ? 'text-demo'
                          : 'text-ink-faint',
                  ].join(' ')}
                  style={
                    both
                      ? { boxShadow: 'inset 0 0 0 2px var(--ink)' }
                      : onQ.has(s)
                        ? { boxShadow: 'inset 0 0 0 2px var(--policy)' }
                        : onSarsa.has(s)
                          ? { boxShadow: 'inset 0 0 0 2px var(--demo)' }
                          : undefined
                  }
                >
                  {cliff ? <span className="u-readout text-[0.5rem]">cliff</span> : label}
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------------------------------------------------------- the readout */}
        <div className="grid gap-px border-t border-line bg-line sm:grid-cols-3">
          <Readout label="episodes" value={String(snapshot.episodes)} />
          <Readout
            label="Q-learning return, exploring"
            value={snapshot.qReturn === null ? '—' : snapshot.qReturn.toFixed(0)}
            tone="text-policy"
          />
          <Readout
            label="SARSA return, exploring"
            value={snapshot.sarsaReturn === null ? '—' : snapshot.sarsaReturn.toFixed(0)}
            tone="text-demo"
          />
        </div>

        {/* ---------------------------------------------------------- the controls */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-4 border-t border-line p-4">
          <div className="flex items-center gap-2">
            <Button onClick={() => setRunning((on) => !on)}>
              {running ? <PauseIcon className="size-3.5" /> : <PlayIcon className="size-3.5" />}
              {running ? 'pause' : 'learn'}
            </Button>
            <Button onClick={() => advance(10)}>
              <StepForwardIcon className="size-3.5" />
              +10
            </Button>
            <Button onClick={reset}>
              <RotateCcwIcon className="size-3.5" />
              reset
            </Button>
          </div>

          <Slider
            label="ε"
            value={hyper.epsilon}
            min={0}
            max={0.5}
            step={0.01}
            onChange={(epsilon) => setHyper((h) => ({ ...h, epsilon }))}
          />
          <Slider
            label="α"
            value={hyper.alpha}
            min={0.05}
            max={1}
            step={0.05}
            onChange={(alpha) => setHyper((h) => ({ ...h, alpha }))}
          />
        </div>
      </div>

      <figcaption className="mt-3 max-w-[62ch] font-body text-[0.8125rem] leading-relaxed text-ink-dim">
        {caption ?? (
          <>
            Two learners, one cliff, the same experience budget.{' '}
            <span className="font-semibold text-policy">Q-learning</span> bootstraps from the
            best action available next, so it learns the optimal route — along the edge.{' '}
            <span className="font-semibold text-demo">SARSA</span> bootstraps from the action
            its own exploring policy will actually take, so the squares beside the drop inherit
            the cost of occasionally slipping in, and it walks around. Push ε up and SARSA
            retreats further; take ε to zero and the two rules agree.
            <br />
            <br />
            The returns are what each agent collected <em>while still exploring</em>, which is
            why SARSA usually scores higher despite walking the longer route: Q-learning keeps
            stepping off the edge it has learned to walk beside. Its greedy path is still the
            shorter one. Which number you care about is the question the two rules are really
            asking.
          </>
        )}
      </figcaption>
    </figure>
  );
}

function Readout({ label, value, tone = 'text-ink' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="bg-surface px-4 py-3">
      <dt className="u-label">{label}</dt>
      <dd className={`u-readout mt-1 text-sm ${tone}`}>{value}</dd>
    </div>
  );
}

function Button({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="u-label inline-flex items-center gap-1.5 border border-line px-2.5 py-2 text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
    >
      {children}
    </button>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center gap-2.5">
      <span className="u-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1 w-24 accent-[var(--policy)]"
      />
      <span className="u-readout text-[0.6875rem] text-ink-dim">{value.toFixed(2)}</span>
    </label>
  );
}

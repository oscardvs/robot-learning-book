'use client';

import { useEffect, useMemo, useState } from 'react';
import { RefreshCwIcon } from 'lucide-react';

// Why a policy outputs a distribution rather than a single action.
//
// The expert goes round the obstacle either way. Both are right. Fit one number to
// that and you get the average of the two, which is the one route that fails.

const W = 520;
const H = 300;
const START: Point = { x: 56, y: 150 };
const GOAL: Point = { x: 464, y: 150 };
const OBSTACLE = { x: 260, y: 150, r: 46 };

interface Point {
  x: number;
  y: number;
}

/** Deterministic jitter, so the server and the browser agree on first paint. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// The two modes clear the obstacle with room to spare: every demonstration is a run
// that worked. Only their average fails, which is the whole point.
const DEMOS = (() => {
  const rand = seeded(7);
  const out: Array<{ ctrl: Point; up: boolean }> = [];
  for (let i = 0; i < 5; i++) {
    out.push({ ctrl: { x: 250 + (rand() - 0.5) * 56, y: 16 + (rand() - 0.5) * 24 }, up: true });
    out.push({ ctrl: { x: 250 + (rand() - 0.5) * 56, y: 284 + (rand() - 0.5) * 24 }, up: false });
  }
  return out;
})();

/** What least squares lands on: the mean of every demonstration. */
const MEAN_CTRL: Point = {
  x: DEMOS.reduce((sum, d) => sum + d.ctrl.x, 0) / DEMOS.length,
  y: DEMOS.reduce((sum, d) => sum + d.ctrl.y, 0) / DEMOS.length,
};

const path = (ctrl: Point) => `M ${START.x} ${START.y} Q ${ctrl.x} ${ctrl.y} ${GOAL.x} ${GOAL.y}`;

function bezier(ctrl: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * START.x + 2 * u * t * ctrl.x + t * t * GOAL.x,
    y: u * u * START.y + 2 * u * t * ctrl.y + t * t * GOAL.y,
  };
}

/** The heading the robot commits to as it leaves the start. */
function heading(ctrl: Point) {
  const a = bezier(ctrl, 0);
  const b = bezier(ctrl, 0.06);
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

type Mode = 'average' | 'distribution';

export function PolicyModes({ caption }: { caption?: string }) {
  const [mode, setMode] = useState<Mode>('average');
  const [pick, setPick] = useState(0);
  const [t, setT] = useState(0);

  const ctrl = mode === 'average' ? MEAN_CTRL : DEMOS[pick].ctrl;

  // Run the rollout, and stop it dead the moment it touches the obstacle.
  useEffect(() => {
    setT(0);
    let frame = 0;
    let raf = 0;
    const tick = () => {
      frame += 1;
      const next = Math.min(1, frame / 90);
      const p = bezier(ctrl, next);
      const hit = Math.hypot(p.x - OBSTACLE.x, p.y - OBSTACLE.y) < OBSTACLE.r;
      setT(next);
      if (!hit && next < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ctrl]);

  const head = bezier(ctrl, t);
  const collided = Math.hypot(head.x - OBSTACLE.x, head.y - OBSTACLE.y) < OBSTACLE.r;
  const arrived = t >= 1 && !collided;

  const BINS = 15;
  const SPAN = 120; // degrees, centred on straight ahead
  const toFraction = (angle: number) => (angle + SPAN / 2) / SPAN;

  const histogram = useMemo(() => {
    const bins = new Array(BINS).fill(0);
    for (const demo of DEMOS) {
      const bin = Math.floor(toFraction(heading(demo.ctrl)) * BINS);
      bins[Math.min(BINS - 1, Math.max(0, bin))] += 1;
    }
    return bins;
  }, []);

  const peak = Math.max(...histogram, 1);
  const meanPercent = toFraction(heading(MEAN_CTRL)) * 100;

  return (
    <figure className="my-9 w-full">
      <div className="border border-line bg-surface">
        <div className="flex flex-wrap items-center gap-2 border-b border-line-soft px-3 py-2.5">
          <Choice active={mode === 'average'} onClick={() => setMode('average')}>
            Predict one action
          </Choice>
          <Choice active={mode === 'distribution'} onClick={() => setMode('distribution')}>
            Predict a distribution
          </Choice>
          {mode === 'distribution' ? (
            <button
              type="button"
              onClick={() => setPick((p) => (p + 1) % DEMOS.length)}
              className="u-label inline-flex items-center gap-1.5 border border-line px-2.5 py-2 text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
            >
              <RefreshCwIcon className="size-3.5" />
              Sample again
            </button>
          ) : null}
          <span
            className={`u-label ml-auto ${collided ? 'text-reward' : arrived ? 'text-policy' : 'text-ink-faint'}`}
            aria-live="polite"
          >
            {collided ? 'collision' : arrived ? 'reached the goal' : 'executing'}
          </span>
        </div>

        <div className="grid gap-px bg-line-soft md:grid-cols-[1.6fr_1fr]">
          <div className="bg-surface p-3">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Robot routes around an obstacle">
              {/* the demonstrations */}
              {DEMOS.map((demo, i) => (
                <path
                  key={i}
                  d={path(demo.ctrl)}
                  fill="none"
                  stroke="var(--demo)"
                  strokeWidth={1.25}
                  opacity={0.34}
                />
              ))}

              <defs>
                <pattern id="pm-hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="7" stroke="var(--ink-faint)" strokeWidth="2" opacity="0.5" />
                </pattern>
              </defs>
              <circle
                cx={OBSTACLE.x}
                cy={OBSTACLE.y}
                r={OBSTACLE.r}
                fill="url(#pm-hatch)"
                stroke="var(--ink-faint)"
                strokeWidth={1.5}
              />

              {/* the policy's own route */}
              <path
                d={path(ctrl)}
                fill="none"
                stroke={collided ? 'var(--reward)' : 'var(--policy)'}
                strokeWidth={2.5}
                strokeDasharray="4 4"
                opacity={0.8}
              />

              <circle cx={START.x} cy={START.y} r={6} fill="var(--ink-faint)" />
              <circle cx={GOAL.x} cy={GOAL.y} r={9} fill="none" stroke="var(--policy)" strokeWidth={2} />
              <circle
                cx={head.x}
                cy={head.y}
                r={8}
                fill={collided ? 'var(--reward)' : 'var(--policy)'}
              />

              <text x={START.x - 6} y={START.y + 26} className="u-label" fill="var(--ink-faint)" fontSize={10}>
                START
              </text>
              <text x={GOAL.x - 18} y={GOAL.y + 28} className="u-label" fill="var(--ink-faint)" fontSize={10}>
                GOAL
              </text>
            </svg>
          </div>

          {/* the action distribution at the moment of decision */}
          <div className="flex flex-col justify-between bg-surface p-4">
            <p className="u-label mb-3">Expert heading, leaving the start</p>
            <div className="relative flex h-32 items-end gap-[2px] border-b border-line">
              {histogram.map((count, i) => (
                <div
                  key={i}
                  className="flex-1 bg-demo/70"
                  style={{ height: `${(count / peak) * 100}%` }}
                />
              ))}
              {/* Where least squares lands: between the modes, on nothing. */}
              <span
                aria-hidden
                className="absolute inset-y-0 w-px bg-reward"
                style={{ left: `${meanPercent}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between">
              <span className="u-readout text-[0.625rem] text-ink-faint">−60°</span>
              <span className="u-readout text-[0.625rem] text-reward">mean</span>
              <span className="u-readout text-[0.625rem] text-ink-faint">+60°</span>
            </div>
            <p className="mt-4 font-body text-[0.8125rem] leading-relaxed text-ink-dim">
              Two peaks: go over, or go under. The average of the two headings is straight
              ahead — the one direction no expert ever took.
            </p>
          </div>
        </div>
      </div>

      {caption ? (
        <figcaption className="mt-3 max-w-[62ch] font-body text-[0.8125rem] leading-relaxed text-ink-dim">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`u-label border px-2.5 py-2 transition-colors ${
        active
          ? 'border-policy/50 bg-policy-soft text-policy'
          : 'border-line text-ink-dim hover:border-ink-faint hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

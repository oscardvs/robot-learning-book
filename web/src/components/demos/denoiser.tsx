'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PlayIcon, RotateCcwIcon, StepForwardIcon } from 'lucide-react';

import {
  MODES,
  type Particle,
  type Schedule,
  denoiseStep,
  makeSchedule,
  seedParticles,
} from './diffusion';

const COUNT = 110;
const VIEW = 260;
const SPAN = 3.1; // world units from centre to edge

const project = (v: number) => VIEW / 2 + (v / SPAN) * (VIEW / 2);

export interface DenoiserProps {
  caption?: string;
}

/**
 * Noise in, actions out. The particles start as a standard Gaussian — the thing the
 * sampler is always handed — and are pushed step by step onto the three modes.
 */
export function Denoiser({ caption }: DenoiserProps) {
  const [steps, setSteps] = useState(40);
  const schedule: Schedule = useMemo(() => makeSchedule(steps), [steps]);

  const [particles, setParticles] = useState<Particle[]>(() => seedParticles(COUNT));
  const [k, setK] = useState(steps - 1);
  const [running, setRunning] = useState(false);

  const scheduleRef = useRef(schedule);
  scheduleRef.current = schedule;

  const reset = useCallback((nextSteps?: number) => {
    const K = nextSteps ?? scheduleRef.current.K;
    setParticles(seedParticles(COUNT));
    setK(K - 1);
  }, []);

  const advance = useCallback(() => {
    setK((current) => {
      if (current < 0) return current;
      setParticles((ps) => denoiseStep(ps, scheduleRef.current, current));
      return current - 1;
    });
  }, []);

  // Run the chain down to k = 0, then hold so the result can be read, then start over.
  useEffect(() => {
    if (!running) return;
    if (k < 0) {
      const timer = setTimeout(() => reset(), 1400);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(advance, 70);
    return () => clearTimeout(timer);
  }, [running, k, advance, reset]);

  const done = k < 0;
  const progress = done ? 1 : 1 - (k + 1) / schedule.K;

  return (
    <figure className="my-9">
      <div className="border border-line bg-surface">
        <div className="flex flex-wrap items-start gap-6 p-4">
          <svg
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            className="h-[260px] w-[260px] shrink-0 bg-ground"
            role="img"
            aria-label="Samples moving from Gaussian noise onto three action modes"
          >
            {/* the three actions that are actually correct */}
            {MODES.map((mode, i) => (
              <circle
                key={i}
                cx={project(mode.x)}
                cy={project(-mode.y)}
                r={16}
                className="fill-none stroke-line"
                strokeDasharray="3 3"
              />
            ))}

            {particles.map((p, i) => (
              <g key={i}>
                <line
                  x1={project(p.px)}
                  y1={project(-p.py)}
                  x2={project(p.x)}
                  y2={project(-p.y)}
                  className="stroke-policy/35"
                  strokeWidth={1}
                />
                <circle
                  cx={project(p.x)}
                  cy={project(-p.y)}
                  r={done ? 2.6 : 2}
                  className={done ? 'fill-policy' : 'fill-policy/70'}
                />
              </g>
            ))}
          </svg>

          <div className="min-w-[14rem] flex-1">
            <p className="u-label">denoising step</p>
            <p className="u-readout mt-1 text-lg text-ink">
              {done ? 0 : k + 1} <span className="text-ink-faint">/ {schedule.K}</span>
            </p>

            <div className="mt-3 h-1 w-full bg-line">
              <div
                className="h-full bg-policy transition-[width] duration-100"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>

            <p className="mt-4 font-body text-[0.8125rem] leading-relaxed text-ink-dim">
              {done
                ? 'Every sample has landed on one of the three modes, and which one it picked was decided by the noise it started from — not by an average of the three.'
                : 'Each particle is being pushed along the score: the direction in which the corrupted distribution rises most steeply at this noise level.'}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Button onClick={() => setRunning((on) => !on)}>
                <PlayIcon className="size-3.5" />
                {running ? 'pause' : 'sample'}
              </Button>
              <Button
                onClick={() => {
                  setRunning(false);
                  advance();
                }}
              >
                <StepForwardIcon className="size-3.5" />
                step
              </Button>
              <Button
                onClick={() => {
                  setRunning(false);
                  reset();
                }}
              >
                <RotateCcwIcon className="size-3.5" />
                reset
              </Button>
            </div>

            <label className="mt-5 flex items-center gap-2.5">
              <span className="u-label">steps K</span>
              <input
                type="range"
                min={5}
                max={80}
                step={5}
                value={steps}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setSteps(next);
                  reset(next);
                }}
                className="h-1 w-28 accent-[var(--policy)]"
              />
              <span className="u-readout text-[0.6875rem] text-ink-dim">{steps}</span>
            </label>
          </div>
        </div>
      </div>

      <figcaption className="mt-3 max-w-[62ch] font-body text-[0.8125rem] leading-relaxed text-ink-dim">
        {caption ?? (
          <>
            The dashed rings are three equally good actions. The sampler starts from pure
            Gaussian noise and takes K reverse steps, each one subtracting the noise it
            predicts is present. Nothing lands between the rings, which is the property that
            matters for a policy: averaging three good actions usually gives a bad one. Drop K
            towards five and the chain runs out of steps before it has resolved — the samples
            smear, which is the cost that flow matching and consistency models are trying to
            buy back.
          </>
        )}
      </figcaption>
    </figure>
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

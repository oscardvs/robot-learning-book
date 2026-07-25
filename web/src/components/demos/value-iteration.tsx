'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { PauseIcon, PlayIcon, RotateCcwIcon, StepForwardIcon, FootprintsIcon } from 'lucide-react';
import {
  ACTION_GLYPH,
  DEFAULT_PARAMS,
  type Grid,
  type MdpParams,
  initialValues,
  isTerminal,
  normaliseValues,
  parseMap,
  step as sampleStep,
  sweep,
  valueColor,
} from './mdp';

const DEFAULT_MAP = [
  '..........',
  '.####.###.',
  '.....#....',
  '.###.#.##.',
  '.#...P.#..',
  '.#.####.#.',
  '.........G',
];

const START = 0; // top-left

interface State {
  grid: Grid;
  values: Float64Array;
  policy: Int8Array;
  sweeps: number;
  residual: number;
  agent: number | null;
  agentSteps: number;
}

type Action =
  | { type: 'sweep'; params: MdpParams }
  | { type: 'reset'; params: MdpParams }
  | { type: 'toggleCell'; index: number; params: MdpParams }
  | { type: 'placeAgent' }
  | { type: 'moveAgent'; params: MdpParams }
  | { type: 'clearAgent' };

function makeState(grid: Grid, params: MdpParams): State {
  return {
    grid,
    values: initialValues(grid, params),
    policy: new Int8Array(grid.cells.length).fill(-1),
    sweeps: 0,
    residual: Infinity,
    agent: null,
    agentSteps: 0,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'sweep': {
      const { values, policy, residual } = sweep(state.grid, state.values, action.params);
      return { ...state, values, policy, residual, sweeps: state.sweeps + 1 };
    }

    case 'reset':
      return makeState(state.grid, action.params);

    case 'toggleCell': {
      const cells = [...state.grid.cells];
      cells[action.index] = cells[action.index] === 'wall' ? 'free' : 'wall';
      const grid = { ...state.grid, cells };
      return makeState(grid, action.params);
    }

    case 'placeAgent':
      return { ...state, agent: START, agentSteps: 0 };

    case 'moveAgent': {
      if (state.agent === null) return state;
      const kind = state.grid.cells[state.agent];
      if (isTerminal(kind) || state.agentSteps > 80) return { ...state, agent: null };
      const chosen = state.policy[state.agent];
      if (chosen < 0) return { ...state, agent: null };
      const next = sampleStep(state.grid, state.agent, chosen as 0 | 1 | 2 | 3, action.params.noise);
      return { ...state, agent: next, agentSteps: state.agentSteps + 1 };
    }

    case 'clearAgent':
      return { ...state, agent: null };

    default:
      return state;
  }
}

export interface ValueIterationProps {
  /** `ambient` drops the controls and loops on its own — used on the front page. */
  variant?: 'full' | 'ambient';
  caption?: string;
}

export function ValueIteration({ variant = 'full', caption }: ValueIterationProps) {
  const grid = useMemo(() => parseMap(DEFAULT_MAP), []);
  const [params, setParams] = useState<MdpParams>(DEFAULT_PARAMS);
  const [state, dispatch] = useReducer(reducer, grid, (g) => makeState(g, DEFAULT_PARAMS));
  const [running, setRunning] = useState(variant === 'ambient');
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const converged = state.residual < 1e-4 && state.sweeps > 0;

  // The sweep loop. In ambient mode it keeps going: solve, walk the policy once,
  // wipe the values, solve again — so the front page is always mid-computation.
  useEffect(() => {
    if (!running) return;
    const period = variant === 'ambient' ? 260 : 180;
    const timer = setInterval(() => {
      dispatch({ type: 'sweep', params: paramsRef.current });
    }, period);
    return () => clearInterval(timer);
  }, [running, variant]);

  useEffect(() => {
    if (!converged) return;
    if (variant === 'ambient') {
      const timer = setTimeout(() => dispatch({ type: 'reset', params: paramsRef.current }), 2600);
      return () => clearTimeout(timer);
    }
    setRunning(false);
  }, [converged, variant]);

  // Walking the agent is a separate, slower clock so you can follow it.
  useEffect(() => {
    if (state.agent === null) return;
    const timer = setTimeout(() => dispatch({ type: 'moveAgent', params: paramsRef.current }), 260);
    return () => clearTimeout(timer);
  }, [state.agent, state.agentSteps]);

  const onParam = useCallback(
    (key: keyof MdpParams) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = { ...paramsRef.current, [key]: Number(event.target.value) };
      setParams(next);
      dispatch({ type: 'reset', params: next });
      setRunning(false);
    },
    [],
  );

  const scale = normaliseValues(state.grid, state.values);
  const ambient = variant === 'ambient';

  return (
    <figure className={ambient ? 'w-full' : 'my-9 w-full'}>
      <div className="overflow-hidden border border-line bg-surface">
        {/* readout strip */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line-soft px-4 py-2.5">
          <Readout label="sweeps" value={String(state.sweeps).padStart(2, '0')} />
          <Readout
            label="max change"
            value={Number.isFinite(state.residual) ? state.residual.toFixed(4) : '—'}
            tone={converged ? 'policy' : undefined}
          />
          <Readout label="γ" value={params.gamma.toFixed(2)} />
          <Readout label="slip" value={`${Math.round(params.noise * 100)}%`} />
          <span
            className={`u-label ml-auto ${converged ? 'text-policy' : 'text-ink-faint'}`}
            aria-live="polite"
          >
            {converged ? 'policy stable' : state.sweeps === 0 ? 'no estimate yet' : 'estimating'}
          </span>
        </div>

        <div
          className="grid gap-px bg-line-soft p-px"
          style={{ gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))` }}
          role="img"
          aria-label={`Grid world, ${state.sweeps} value-iteration sweeps completed`}
        >
          {state.grid.cells.map((kind, s) => {
            const isAgent = state.agent === s;
            const arrow = state.policy[s];
            const showArrow = !ambient || state.sweeps > 2;

            if (kind === 'wall') {
              return (
                <Cell
                  key={s}
                  ambient={ambient}
                  onClick={ambient ? undefined : () => dispatch({ type: 'toggleCell', index: s, params })}
                  className="bg-raise"
                />
              );
            }

            return (
              <Cell
                key={s}
                ambient={ambient}
                onClick={
                  ambient || isTerminal(kind)
                    ? undefined
                    : () => dispatch({ type: 'toggleCell', index: s, params })
                }
                style={{ backgroundColor: valueColor(scale(state.values[s])) }}
              >
                {isAgent ? (
                  <span className="absolute inset-1.5 rounded-full bg-ink shadow-[0_0_0_2px_var(--ground)]" />
                ) : kind === 'goal' ? (
                  <span className="u-readout text-[0.6rem] font-bold text-[#0b1120]">GOAL</span>
                ) : kind === 'pit' ? (
                  <span className="u-readout text-[0.6rem] font-bold text-[#0b1120]">PIT</span>
                ) : showArrow && arrow >= 0 ? (
                  <span
                    className="text-[0.95rem] leading-none text-[#050a14]/70"
                    style={{ opacity: 0.35 + 0.65 * scale(state.values[s]) }}
                  >
                    {ACTION_GLYPH[arrow]}
                  </span>
                ) : null}
              </Cell>
            );
          })}
        </div>

        {!ambient ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-line-soft px-3 py-3">
            <Button onClick={() => setRunning((r) => !r)} primary>
              {running ? <PauseIcon className="size-3.5" /> : <PlayIcon className="size-3.5" />}
              {running ? 'Pause' : converged ? 'Solved' : 'Run'}
            </Button>
            <Button
              onClick={() => {
                setRunning(false);
                dispatch({ type: 'sweep', params });
              }}
            >
              <StepForwardIcon className="size-3.5" />
              One sweep
            </Button>
            <Button onClick={() => dispatch({ type: 'placeAgent' })} disabled={state.sweeps === 0}>
              <FootprintsIcon className="size-3.5" />
              Follow the policy
            </Button>
            <Button
              onClick={() => {
                setRunning(false);
                dispatch({ type: 'reset', params });
              }}
            >
              <RotateCcwIcon className="size-3.5" />
              Reset
            </Button>

            <div className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-2">
              <Slider
                label="discount γ"
                min={0.5}
                max={0.99}
                stepSize={0.01}
                value={params.gamma}
                onChange={onParam('gamma')}
              />
              <Slider
                label="slip"
                min={0}
                max={0.6}
                stepSize={0.05}
                value={params.noise}
                onChange={onParam('noise')}
              />
              <Slider
                label="step cost"
                min={-0.3}
                max={0}
                stepSize={0.01}
                value={params.stepCost}
                onChange={onParam('stepCost')}
              />
            </div>
          </div>
        ) : null}
      </div>

      {caption ? (
        <figcaption className="mt-3 max-w-[62ch] font-body text-[0.8125rem] leading-relaxed text-ink-dim">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/* --------------------------------------------------------------------- pieces */

function Cell({
  children,
  className = '',
  style,
  onClick,
  ambient,
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  ambient: boolean;
}) {
  const shared = `relative flex items-center justify-center ${ambient ? 'aspect-[4/3]' : 'aspect-square'} ${className}`;
  if (!onClick) return <div className={shared} style={style}>{children}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${shared} transition-[filter] hover:brightness-125`}
      aria-label="Toggle wall"
      style={style}
    >
      {children}
    </button>
  );
}

function Readout({ label, value, tone }: { label: string; value: string; tone?: 'policy' }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="u-label">{label}</span>
      <span className={`u-readout text-sm ${tone === 'policy' ? 'text-policy' : 'text-ink'}`}>{value}</span>
    </span>
  );
}

function Button({
  children,
  onClick,
  disabled,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`u-label inline-flex items-center gap-1.5 border px-2.5 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        primary
          ? 'border-policy/50 bg-policy-soft text-policy hover:border-policy'
          : 'border-line text-ink-dim hover:border-ink-faint hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

function Slider({
  label,
  min,
  max,
  stepSize,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  stepSize: number;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="u-label whitespace-nowrap">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={stepSize}
        value={value}
        onChange={onChange}
        className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-line accent-[var(--policy)]"
      />
      <span className="u-readout w-9 text-right text-[0.6875rem] text-ink-dim">{value.toFixed(2)}</span>
    </label>
  );
}

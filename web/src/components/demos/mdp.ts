// A small grid MDP and the value-iteration sweep that solves it.
//
// Kept free of React so the algorithm reads the way it does in the lecture: a
// Bellman backup applied to every state, repeated until nothing moves.

export type CellKind = 'free' | 'wall' | 'goal' | 'pit';
export type Action = 0 | 1 | 2 | 3;

export const ACTIONS: Action[] = [0, 1, 2, 3];
export const ACTION_DELTA: Array<[number, number]> = [
  [-1, 0], // up
  [0, 1], // right
  [1, 0], // down
  [0, -1], // left
];
export const ACTION_GLYPH = ['↑', '→', '↓', '←'];

export interface Grid {
  rows: number;
  cols: number;
  cells: CellKind[];
}

export interface MdpParams {
  /** How much a reward one step later is worth. */
  gamma: number;
  /** Probability the robot slips sideways instead of going where it meant to. */
  noise: number;
  /** What every ordinary step costs, which is what makes short routes better. */
  stepCost: number;
  goalReward: number;
  pitReward: number;
}

export const DEFAULT_PARAMS: MdpParams = {
  gamma: 0.92,
  noise: 0.2,
  stepCost: -0.04,
  goalReward: 1,
  pitReward: -1,
};

export function parseMap(rowsText: string[]): Grid {
  const rows = rowsText.length;
  const cols = rowsText[0].length;
  const cells: CellKind[] = [];
  for (const line of rowsText) {
    for (const ch of line) {
      cells.push(ch === '#' ? 'wall' : ch === 'G' ? 'goal' : ch === 'P' ? 'pit' : 'free');
    }
  }
  return { rows, cols, cells };
}

export const idx = (grid: Grid, r: number, c: number) => r * grid.cols + c;
export const isTerminal = (kind: CellKind) => kind === 'goal' || kind === 'pit';

/** Where the robot ends up if it tries to move and the world lets it. */
function move(grid: Grid, s: number, action: Action): number {
  const r = Math.floor(s / grid.cols);
  const c = s % grid.cols;
  const [dr, dc] = ACTION_DELTA[action];
  const nr = r + dr;
  const nc = c + dc;
  if (nr < 0 || nr >= grid.rows || nc < 0 || nc >= grid.cols) return s;
  const next = idx(grid, nr, nc);
  return grid.cells[next] === 'wall' ? s : next;
}

/**
 * The outcomes of one action. With probability `1 - noise` the robot goes where it
 * meant to; the rest of the mass is split between the two sideways slips. Bumping a
 * wall leaves it where it was.
 */
export function transitions(grid: Grid, s: number, action: Action, noise: number) {
  const straight = 1 - noise;
  const sideways = noise / 2;
  const left = ((action + 3) % 4) as Action;
  const right = ((action + 1) % 4) as Action;
  return [
    { next: move(grid, s, action), p: straight },
    { next: move(grid, s, left), p: sideways },
    { next: move(grid, s, right), p: sideways },
  ];
}

export function rewardFor(kind: CellKind, params: MdpParams): number {
  if (kind === 'goal') return params.goalReward;
  if (kind === 'pit') return params.pitReward;
  return params.stepCost;
}

export function initialValues(grid: Grid, params: MdpParams): Float64Array {
  const v = new Float64Array(grid.cells.length);
  grid.cells.forEach((kind, s) => {
    if (kind === 'goal') v[s] = params.goalReward;
    else if (kind === 'pit') v[s] = params.pitReward;
  });
  return v;
}

export interface SweepResult {
  values: Float64Array;
  policy: Int8Array;
  /** The largest change any state saw. Once this is ~0, the values have converged. */
  residual: number;
}

/** One full Bellman backup over every state. */
export function sweep(grid: Grid, values: Float64Array, params: MdpParams): SweepResult {
  const next = new Float64Array(values.length);
  const policy = new Int8Array(values.length).fill(-1);
  let residual = 0;

  for (let s = 0; s < grid.cells.length; s++) {
    const kind = grid.cells[s];

    if (kind === 'wall') {
      next[s] = 0;
      continue;
    }
    if (isTerminal(kind)) {
      next[s] = rewardFor(kind, params);
      continue;
    }

    let best = -Infinity;
    let bestAction: Action = 0;
    for (const action of ACTIONS) {
      let q = 0;
      for (const { next: sPrime, p } of transitions(grid, s, action, params.noise)) {
        q += p * (rewardFor(grid.cells[s], params) + params.gamma * values[sPrime]);
      }
      if (q > best) {
        best = q;
        bestAction = action;
      }
    }

    next[s] = best;
    policy[s] = bestAction;
    residual = Math.max(residual, Math.abs(best - values[s]));
  }

  return { values: next, policy, residual };
}

/** Sample where the robot actually lands, slips included. */
export function step(grid: Grid, s: number, action: Action, noise: number, random = Math.random) {
  const outcomes = transitions(grid, s, action, noise);
  let roll = random();
  for (const outcome of outcomes) {
    roll -= outcome.p;
    if (roll <= 0) return outcome.next;
  }
  return outcomes[outcomes.length - 1].next;
}

/* ------------------------------------------------------------------ colour ramp */

const STOPS: Array<[number, [number, number, number]]> = [
  [0, [14, 25, 48]],
  [0.5, [95, 220, 255]],
  [1, [255, 112, 147]],
];

/** Cold where the robot expects little, hot where it expects the goal. */
export function valueColor(t: number): string {
  const x = Math.min(1, Math.max(0, t));
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [t0, c0] = STOPS[i];
    const [t1, c1] = STOPS[i + 1];
    if (x <= t1) {
      const k = (x - t0) / (t1 - t0);
      const mix = c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
      return `rgb(${mix[0]} ${mix[1]} ${mix[2]})`;
    }
  }
  const last = STOPS[STOPS.length - 1][1];
  return `rgb(${last[0]} ${last[1]} ${last[2]})`;
}

export function normaliseValues(grid: Grid, values: Float64Array) {
  let min = Infinity;
  let max = -Infinity;
  for (let s = 0; s < values.length; s++) {
    if (grid.cells[s] === 'wall') continue;
    min = Math.min(min, values[s]);
    max = Math.max(max, values[s]);
  }
  if (!Number.isFinite(min) || max - min < 1e-9) return () => 0.5;
  return (v: number) => (v - min) / (max - min);
}

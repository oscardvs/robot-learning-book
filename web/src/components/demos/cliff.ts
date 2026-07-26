// Cliff walking, and the two temporal-difference rules that disagree about it.
//
// The environment is the one from the lecture: a corridor with a drop along the bottom
// edge. Q-learning bootstraps from the best next action and learns the optimal route,
// which runs along the edge. SARSA bootstraps from the action its own exploring policy
// actually takes, so the states beside the drop inherit the cost of occasionally
// slipping in, and it learns to walk around.
//
// Kept free of React: the two updates differ by one term, and that term should be
// readable on its own.

export const ROWS = 4;
export const COLS = 12;
export const START = (ROWS - 1) * COLS; // bottom-left
export const GOAL = ROWS * COLS - 1; // bottom-right

export const ACTION_DELTA: Array<[number, number]> = [
  [-1, 0], // up
  [0, 1], // right
  [1, 0], // down
  [0, -1], // left
];
export const ACTION_GLYPH = ['↑', '→', '↓', '←'];
const NUM_ACTIONS = 4;

/** The drop: the bottom row between the start and the goal. */
export const isCliff = (s: number) => s > START && s < GOAL;

export interface Hyper {
  /** Step size for the temporal-difference update. */
  alpha: number;
  /** How much a reward one step later is worth. */
  gamma: number;
  /** How often the behaviour policy ignores its own advice and explores. */
  epsilon: number;
}

export const DEFAULT_HYPER: Hyper = { alpha: 0.5, gamma: 1, epsilon: 0.1 };

export type Rule = 'q-learning' | 'sarsa';

export interface Learner {
  rule: Rule;
  /** Q[s * NUM_ACTIONS + a]. */
  q: Float64Array;
  episodes: number;
  /** Undiscounted return of each finished episode, most recent last. */
  returns: number[];
}

export function makeLearner(rule: Rule): Learner {
  return { rule, q: new Float64Array(ROWS * COLS * NUM_ACTIONS), episodes: 0, returns: [] };
}

export function bestAction(q: Float64Array, s: number): number {
  let best = 0;
  let bestValue = -Infinity;
  for (let a = 0; a < NUM_ACTIONS; a++) {
    const value = q[s * NUM_ACTIONS + a];
    if (value > bestValue) {
      bestValue = value;
      best = a;
    }
  }
  return best;
}

function epsilonGreedy(q: Float64Array, s: number, epsilon: number, random: () => number): number {
  if (random() < epsilon) return Math.floor(random() * NUM_ACTIONS) % NUM_ACTIONS;
  return bestAction(q, s);
}

/** One step of the world. Walking into the drop costs 100 and puts you back at the start. */
function transition(s: number, a: number) {
  const r = Math.floor(s / COLS);
  const c = s % COLS;
  const [dr, dc] = ACTION_DELTA[a];
  const nr = Math.min(ROWS - 1, Math.max(0, r + dr));
  const nc = Math.min(COLS - 1, Math.max(0, c + dc));
  const next = nr * COLS + nc;

  if (isCliff(next)) return { next: START, reward: -100, done: false, fell: true };
  return { next, reward: -1, done: next === GOAL, fell: false };
}

export interface EpisodeTrace {
  /** Every state visited, in order — what the agent actually did while learning. */
  path: number[];
  falls: number;
  total: number;
}

/**
 * Run one episode and learn from it. The only difference between the two rules is the
 * value used to bootstrap: the best action available at the next state, or the action
 * the behaviour policy is actually going to take there.
 */
export function runEpisode(learner: Learner, hyper: Hyper, random = Math.random): EpisodeTrace {
  const { q, rule } = learner;
  const { alpha, gamma, epsilon } = hyper;

  let s = START;
  let a = epsilonGreedy(q, s, epsilon, random);
  const path = [s];
  let falls = 0;
  let total = 0;

  for (let t = 0; t < 1000; t++) {
    const { next, reward, done, fell } = transition(s, a);
    total += reward;
    if (fell) falls += 1;

    // The action the behaviour policy will take at `next` — needed by SARSA for its
    // update, and needed by both to carry on acting.
    const nextAction = epsilonGreedy(q, next, epsilon, random);

    const bootstrap = done
      ? 0
      : rule === 'q-learning'
        ? q[next * NUM_ACTIONS + bestAction(q, next)]
        : q[next * NUM_ACTIONS + nextAction];

    const i = s * NUM_ACTIONS + a;
    q[i] += alpha * (reward + gamma * bootstrap - q[i]);

    s = next;
    a = nextAction;
    path.push(s);
    if (done) break;
  }

  learner.episodes += 1;
  learner.returns.push(total);
  if (learner.returns.length > 400) learner.returns.shift();
  return { path, falls, total };
}

/**
 * The route the learner would take if it stopped exploring — this is what is being
 * compared, not the noisy path it walks while learning.
 */
export function greedyPath(q: Float64Array): number[] {
  const path = [START];
  const seen = new Set<number>([START]);
  let s = START;

  for (let t = 0; t < ROWS * COLS; t++) {
    if (s === GOAL) break;
    const a = bestAction(q, s);
    const r = Math.floor(s / COLS);
    const c = s % COLS;
    const [dr, dc] = ACTION_DELTA[a];
    const next = Math.min(ROWS - 1, Math.max(0, r + dr)) * COLS + Math.min(COLS - 1, Math.max(0, c + dc));
    if (next === s || seen.has(next)) break; // stuck, or going in circles
    if (isCliff(next)) {
      path.push(next);
      break;
    }
    seen.add(next);
    path.push(next);
    s = next;
  }

  return path;
}

/** Mean of the last `window` episode returns — the curve people actually plot. */
export function recentReturn(learner: Learner, window = 25): number | null {
  if (!learner.returns.length) return null;
  const slice = learner.returns.slice(-window);
  return slice.reduce((sum, x) => sum + x, 0) / slice.length;
}

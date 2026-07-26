// The reverse diffusion process, run on a distribution whose score we know exactly.
//
// A learned denoiser is an approximation to one specific thing: the score of the data
// distribution after it has been corrupted to noise level k. Here the data is a mixture
// of three Gaussians, so that score can be written down in closed form — which means the
// demo shows the *sampler* doing its job, with the network's error taken out of the
// picture. Everything else is the DDPM update exactly as Chapter 6 states it.

export interface Mode {
  x: number;
  y: number;
  weight: number;
}

/** Three plausible actions, which is the situation a unimodal policy cannot represent. */
export const MODES: Mode[] = [
  { x: -1.45, y: -0.75, weight: 0.34 },
  { x: 0.05, y: 1.3, weight: 0.33 },
  { x: 1.5, y: -0.6, weight: 0.33 },
];

const MODE_VAR = 0.032;

export interface Schedule {
  /** Number of denoising steps. */
  K: number;
  beta: Float64Array;
  alpha: Float64Array;
  alphaBar: Float64Array;
}

/** The linear β schedule of the original DDPM, stretched over K steps. */
export function makeSchedule(K: number): Schedule {
  const beta = new Float64Array(K);
  const alpha = new Float64Array(K);
  const alphaBar = new Float64Array(K);
  let running = 1;

  for (let k = 0; k < K; k++) {
    const t = K === 1 ? 0 : k / (K - 1);
    beta[k] = 1e-4 + t * (0.06 - 1e-4);
    alpha[k] = 1 - beta[k];
    running *= alpha[k];
    alphaBar[k] = running;
  }

  return { K, beta, alpha, alphaBar };
}

/** Box–Muller, because the sampler needs fresh Gaussian noise at every step. */
export function gaussian(random = Math.random): number {
  let u = 0;
  while (u === 0) u = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
}

/**
 * The exact noise prediction for the corrupted mixture at level k.
 *
 * The mixture stays a mixture under Gaussian corruption: each mode's mean shrinks by
 * sqrt(abar) and its variance grows by (1 - abar). So the score is a
 * responsibility-weighted pull toward the shrunken modes, and ε is that score scaled by
 * -sqrt(1 - abar), which is the identity the training objective is built on.
 */
export function epsilon(x: number, y: number, alphaBar: number): [number, number] {
  const shrink = Math.sqrt(alphaBar);
  const variance = alphaBar * MODE_VAR + (1 - alphaBar);

  let total = 0;
  const weights: number[] = [];

  for (const mode of MODES) {
    const dx = x - shrink * mode.x;
    const dy = y - shrink * mode.y;
    // Unnormalised responsibility; the shared 1/(2πv) factor cancels in the ratio.
    const w = mode.weight * Math.exp(-(dx * dx + dy * dy) / (2 * variance));
    weights.push(w);
    total += w;
  }

  let scoreX = 0;
  let scoreY = 0;

  if (total <= 1e-300) {
    // Numerically underflowed: every mode is astronomically far away, so fall back to
    // the nearest one rather than dividing by zero.
    let nearest = MODES[0];
    let best = Infinity;
    for (const mode of MODES) {
      const d = (x - shrink * mode.x) ** 2 + (y - shrink * mode.y) ** 2;
      if (d < best) {
        best = d;
        nearest = mode;
      }
    }
    scoreX = (shrink * nearest.x - x) / variance;
    scoreY = (shrink * nearest.y - y) / variance;
  } else {
    MODES.forEach((mode, i) => {
      const r = weights[i] / total;
      scoreX += r * (shrink * mode.x - x) / variance;
      scoreY += r * (shrink * mode.y - y) / variance;
    });
  }

  const scale = -Math.sqrt(Math.max(0, 1 - alphaBar));
  return [scale * scoreX, scale * scoreY];
}

export interface Particle {
  x: number;
  y: number;
  /** Where it was one step ago, so the render can draw the move it just made. */
  px: number;
  py: number;
}

export function seedParticles(count: number, random = Math.random): Particle[] {
  return Array.from({ length: count }, () => {
    const x = gaussian(random);
    const y = gaussian(random);
    return { x, y, px: x, py: y };
  });
}

/**
 * One reverse step, from noise level k to k-1: subtract the predicted noise, rescale,
 * and add a little back unless this is the last step.
 */
export function denoiseStep(
  particles: Particle[],
  schedule: Schedule,
  k: number,
  random = Math.random,
): Particle[] {
  const { alpha, alphaBar, beta } = schedule;
  const coefficient = (1 - alpha[k]) / Math.sqrt(Math.max(1e-12, 1 - alphaBar[k]));
  const invSqrtAlpha = 1 / Math.sqrt(alpha[k]);
  const sigma = k > 0 ? Math.sqrt(beta[k]) : 0;

  return particles.map((p) => {
    const [ex, ey] = epsilon(p.x, p.y, alphaBar[k]);
    const x = invSqrtAlpha * (p.x - coefficient * ex) + sigma * gaussian(random);
    const y = invSqrtAlpha * (p.y - coefficient * ey) + sigma * gaussian(random);
    return { x, y, px: p.x, py: p.y };
  });
}

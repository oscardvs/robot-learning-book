# Lecture 5 — Reinforcement Learning II: Policy Gradients (raw notes)

- Video: <https://www.youtube.com/watch?v=AdTGz8YnnlE> (52.3 min)
- Transcript: `transcripts/05_rl_II.txt` (7,482 w) · Slides: `slides_png/lecture05/`
  (33 frames) · OCR `slides/lecture05.txt`
- Speaker: Oier Mees. Assigned (wk5): **Levine et al. 2015** (End-to-End Visuomotor
  Policies); Ma et al. 2023 (Eureka); Rosete-Beas et al. 2022 (Latent Plans, offline).
  Guest: **Andrew Wagenmaker** (UC Berkeley) — *the 11th guest, omitted by the brief*.

One continuous derivation: REINFORCE → variance reduction (causality, baseline,
advantage) → off-policy via importance sampling → constraints (entropy, TRPO, PPO) →
actor-critic → SAC. Maps to Ch.5. Equations verified against slides 9–16 and 28–31.

Framing (slide 3): Lecture 4 was **value-based** (learn what actions are worth, argmax to
get a policy — hard to scale to continuous). **Policy gradients** optimize the policy
*directly*: parameterize $\pi_\theta$ and push its weights toward high-reward behavior.

Start from the same objective and trajectory distribution:
$$J(\theta) = \mathbb{E}_{\tau\sim p_\theta(\tau)}\Big[\sum_{t\ge0}R(s_t,a_t)\Big], \qquad p_\theta(\tau) = p(s_0)\prod_{t\ge0}\pi_\theta(a_t\mid s_t)\,P(s_{t+1}\mid s_t,a_t)$$

## Estimating $J$: Monte Carlo, on-policy (slide 6)
Can't compute the expectation analytically (unknown world distribution). **Monte Carlo**:
roll out $\pi_\theta$ $N$ times, average returns: $J(\theta)\approx\frac1N\sum_i\sum_t
r_{i,t}$. Assumes all data comes from the *current* policy → **on-policy**.

## The policy gradient theorem (slides 7–9)
Can't differentiate through the world (unknown dynamics). Write the objective as an
integral, push the gradient inside (linearity):
$$\nabla_\theta J(\theta) = \nabla_\theta\!\int p_\theta(\tau)R(\tau)\,d\tau = \int \nabla_\theta p_\theta(\tau)\,R(\tau)\,d\tau$$
This is a gradient of a density, not an expectation — can't sample it. **Log-derivative
trick**: $\nabla\log x = \frac1x\nabla x$, so $\nabla_\theta p_\theta(\tau) =
p_\theta(\tau)\nabla_\theta\log p_\theta(\tau)$ ("multiply by one"). Substitute:
$$\boxed{\nabla_\theta J(\theta) = \mathbb{E}_{\tau\sim p_\theta(\tau)}\big[\nabla_\theta\log p_\theta(\tau)\,R(\tau)\big]}$$
Now it's an expectation — samplable. Sampling is still non-differentiable, but $\theta$ is
*inside* the expectation, so we can differentiate w.r.t. $\theta$ (same smoothness point as
Lecture 4). Expand $\log p_\theta(\tau) = \log p(s_0) + \sum_t\log\pi_\theta(a_t\mid s_t) +
\sum_t\log P(s_{t+1}\mid s_t,a_t)$; the $s_0$ and transition terms don't depend on $\theta$,
so they vanish:
$$\nabla_\theta J(\theta) = \mathbb{E}_{\tau\sim p_\theta(\tau)}\Big[\Big(\sum_{t=0}^{T-1}\nabla_\theta\log\pi_\theta(a_t\mid s_t)\Big)\Big(\sum_{t=0}^{T-1}R(s_t,a_t)\Big)\Big]$$
The dynamics cancel — good, we don't have them.

## REINFORCE (slide 10, Williams 1992)
1. Initialize $\pi_\theta$.
2. While not converged: collect rollouts $\{\tau^i\}$; estimate
   $\nabla_\theta J(\theta)\approx \frac1N\sum_{i}[(\sum_t\nabla_\theta\log\pi_\theta(a_{i,t}\mid s_{i,t}))(\sum_t R(s_{i,t},a_{i,t}))]$;
   update $\theta\leftarrow\theta+\alpha\nabla_\theta J(\theta)$.

**Intuition** (slide 11): it's the **BC gradient weighted by return**. BC gradient
$\nabla_\theta J_{BC}=\frac1N\sum_i\sum_t\nabla_\theta\log\pi_\theta(a_{i,t}\mid s_{i,t})$
treats every demonstrated action equally; REINFORCE weights each trajectory by its total
return → upweight good trajectories, downweight bad ones.

## Variance reduction
**(1) Causality → reward-to-go** (slide 12). An overshoot at the end penalizes *all*
actions, including the good early ones. But an action at $t'$ can't affect a reward at
$t<t'$. Replace the total return with the **reward-to-go** (future rewards only):
$$\nabla_\theta J(\theta) = \mathbb{E}_{\tau\sim p_\theta(\tau)}\Big[\sum_{t=0}^{T-1}\nabla_\theta\log\pi_\theta(a_t\mid s_t)\sum_{t'=t}^{T-1}R(s_{t'},a_{t'})\Big]$$
Same expected gradient, lower variance.

**(2) Baseline** (slide 14). Two trajectories with returns 99 and 101: the informative
signal is 2, but REINFORCE scales gradients by 99 and 101 — only ~2% is signal. Subtract a
**baseline** $b$ (often the mean return $b=\frac1N\sum_i R(\tau_i)$):
$$\nabla_\theta J(\theta) = \mathbb{E}\Big[\sum_t\nabla_\theta\log\pi_\theta(a_t\mid s_t)\big(\textstyle\sum_{t'=t}^{T-1}R(s_{t'},a_{t'}) - b\big)\Big]$$
Now 99→−1 and 101→+1: below-average behavior gets a negative gradient. **Unbiased** —
$\mathbb{E}[\nabla_\theta\log p_\theta(\tau)\,b] = b\nabla_\theta\!\int p_\theta(\tau)d\tau
= b\nabla_\theta 1 = 0$.

**(3) Advantage function** (slides 15–16). The reward-to-go is a one-sample Monte Carlo
estimate of the **Q-function** $Q^\pi(s_t,a_t)=\mathbb{E}_\pi[\sum_{t'=t}R(s_{t'},a_{t'})\mid
s_t,a_t]$. The ideal baseline is the **value** $V^\pi(s)=\mathbb{E}_{a\sim\pi(\cdot\mid s)}
[Q^\pi(s,a)]$. Their difference is the **advantage**:
$$A^\pi(s,a) = Q^\pi(s,a) - V^\pi(s), \qquad \nabla_\theta J(\theta) = \mathbb{E}_{\tau\sim p_\theta(\tau)}\Big[\sum_{t=0}^{T-1}\nabla_\theta\log\pi_\theta(a_t\mid s_t)\,A^\pi(s_t,a_t)\Big]$$
"How much better is action $a$ than average in state $s$?" Positive → raise probability,
negative → lower it. Accounts for each state's difficulty.

## Going off-policy: importance sampling (slides 17–22)
The on-policy wall (slide 17): the gradient assumes samples from the *current* policy, so
you must throw away data after each gradient step — impractical for real robots (expensive,
breakable). **Importance sampling** estimates an expectation under target $p$ using samples
from proposal $q$:
$$\mathbb{E}_{x\sim p}[f(x)] = \mathbb{E}_{x\sim q}\Big[\tfrac{p(x)}{q(x)}f(x)\Big]$$
$q$ must have **non-zero support** where $p>0$ (else the ratio blows up / bias); works best
when $p,q$ are close. Applied to trajectories, the initial-state and transition terms
cancel (same MDP), leaving a product of policy ratios — but that product is **exponential
in $T$** (many sub-1 factors → variance explodes). Fix (slide 21): take expectations over
**timesteps**, decompose the joint into an **action ratio** (computable) and a **state
ratio** (needs global dynamics — unknown), and **approximate the state ratio by 1** (valid
when policies stay close — what TRPO/PPO enforce):
$$\nabla_{\theta'}J(\theta') \approx \frac1N\sum_{i}\sum_{t}\frac{\pi_{\theta'}(a_{i,t}\mid s_{i,t})}{\pi_\theta(a_{i,t}\mid s_{i,t})}\,\nabla_{\theta'}\log\pi_{\theta'}(a_{i,t}\mid s_{i,t})\Big(\sum_{t'\ge t}r(s_{i,t'},a_{i,t'})-b\Big)$$
Now you can **collect once, take multiple gradient steps** (slide 22).

## Keeping policies close (slides 23–26)
**Entropy regularization** (slide 23): to avoid zero support, add an entropy bonus so the
policy doesn't collapse to determinism:
$$L(\theta') = L_{PG}(\theta') + \beta\,H(\pi_{\theta'}(\cdot\mid s))$$
$\beta$ = temperature. Discrete (Shannon) $H=-\sum_a\pi(a\mid s)\log\pi(a\mid s)$;
continuous (differential, Gaussian) $H=\frac{d}{2}(1+\log 2\pi)+\sum_j\log\sigma_j$, $d$ =
action dim.

**TRPO** (slide 25, Schulman, Levine et al. 2015): maximize the surrogate subject to a KL
constraint:
$$\max_{\theta'}\ \mathbb{E}_{s,a\sim\pi_\theta}\Big[\tfrac{\pi_{\theta'}(a\mid s)}{\pi_\theta(a\mid s)}A^{\pi_\theta}(s,a)\Big] \quad\text{s.t.}\quad \mathbb{E}_{s\sim\pi_\theta}\big[D_{KL}(\pi_\theta(\cdot\mid s)\,\|\,\pi_{\theta'}(\cdot\mid s))\big]\le\epsilon$$
Gives a **monotonic-improvement guarantee** but needs the **Fisher information matrix**
(2nd derivatives) — $O(N^2)$ memory, $O(N^3)$ compute; conjugate-gradient/K-FAC
approximations still ~20× a normal step. Not popular now. (Cool result: TRPO trained ETH
quadruped locomotion sim-to-real, zero-shot over rough terrain.)

**PPO** (slide 26, Schulman et al. 2017): clip the ratio instead of the KL constraint.
With ratio $r_t(\theta')=\frac{\pi_{\theta'}(a\mid s)}{\pi_\theta(a\mid s)}$:
$$L^{CLIP}(\theta') = \mathbb{E}_{s,a\sim\pi_\theta}\Big[\min\big(r_t\,A^{\pi_\theta}(s,a),\ \mathrm{clip}(r_t,1-\epsilon,1+\epsilon)\,A^{\pi_\theta}(s,a)\big)\Big]$$
First-order, $O(N)$, works with Adam; the **backbone of LLM RLHF and GRPO**. Trade-off: no
monotonic guarantee, still near-on-policy (many samples). **OpenAI 2019** used PPO
sim-to-real (domain randomization) to solve a Rubik's cube on a **24-DoF Shadow hand**
(with a separate perception net feeding cube pose to PPO).

## Actor-critic (slides 28–29)
**Full PPO objective** — three terms:
$$L^{PPO}(\theta') = \mathbb{E}_{s,a\sim\pi_\theta}\big[\underbrace{L^{CLIP}(\theta')}_{\text{actor}} - \underbrace{c_1\big(V_{\theta'}(s)-V^{targ}\big)^2}_{\text{critic (value loss)}} + \underbrace{c_2\,H(\pi_{\theta'})(s)}_{\text{entropy}}\big]$$
This is **actor-critic**: the **actor** (policy gradient) chooses continuous actions; the
**critic** (value learning) supplies a low-variance advantage baseline. The critic learns
via **TD updates** (bootstraps every step instead of waiting for the full return → more
sample-efficient, at a small bootstrapping bias). Robotics trick: train the critic with
**privileged information** (it's discarded at test time) to lower variance.

## Soft actor-critic (slides 30–31)
**SAC** — fully off-policy actor-critic; critic trained on a **replay buffer** (like DQN),
most sample-efficient. Actor maximizes reward *plus* entropy (explore + exploit):
$$L^{Actor}(\theta') = \mathbb{E}_{s\sim D_{replay},\,a\sim\pi_{\theta'}}\big[\alpha H(\pi_{\theta'})(s) - Q_\phi(s,a)\big]$$
Critic = squared TD error with an entropy-augmented target and target network $\bar\phi$:
$$L^{Critic}(\phi) = \mathbb{E}_{\tau\sim D_{replay}}\Big[\big(Q_\phi(s,a) - \big(r + \gamma(Q_{\bar\phi}(s',a') + \alpha H(\pi_{\theta'})(s'))\big)\big)^2\Big]$$
The actor pulls states from the buffer but asks the *current* policy what it would do (the
critic acts as a learned simulator for unseen state-action pairs). **Reparameterization
trick** (slide 31) makes the sampling differentiable:
$$a = f_{\theta'}(s,\epsilon) = \mu_{\theta'}(s) + \sigma_{\theta'}(s)\odot\epsilon, \qquad \epsilon\sim\mathcal{N}(0,1)$$
(same trick as VAEs). Real-robot SAC: Lego stacking, quadruped manipulation, dexterous
hands.

## Conclusion (slide 32)
REINFORCE → causality + baseline → advantage → importance sampling (multi-step) → entropy
(support) → TRPO (KL bound) → PPO (clip) → SAC (fully off-policy, most sample-efficient,
still popular for real robotics).

## Definitions for glossary
Policy gradient; Monte Carlo estimate; on-policy vs off-policy; log-derivative trick;
policy gradient theorem; REINFORCE / vanilla policy gradient; reward-to-go; baseline;
advantage function $A=Q-V$; importance sampling; importance weight / support; entropy
regularization (Shannon / differential); temperature; KL divergence; trust region; TRPO;
Fisher information matrix; PPO / clipped surrogate; actor-critic; value (critic) loss;
bootstrapping bias; privileged critic; soft actor-critic; reparameterization trick.

## Papers named
- **Williams 1992** — REINFORCE ("Simple statistical gradient-following algorithms…").
- **Schulman, Levine et al. 2015** — TRPO.
- **Schulman et al. 2017** — PPO.
- OpenAI 2019 — *Solving Rubik's Cube with a Robot Hand* (PPO, 24-DoF Shadow hand).
- ETH quadruped locomotion via TRPO [39:xx] — [UNCLEAR: not named on slide; likely
  Hwangbo et al. 2019 "Learning agile and dynamic motor skills" — **Editor's note**].
- SAC real-robot demos "from the original papers" (Haarnoja et al.) — not individually
  cited on the slide.

## Figures worth reproducing
- `slide_008.jpg` — policy gradient theorem (log-derivative trick).
- `slide_012.jpg` — causality / reward-to-go (overshoot cartoon).
- `slide_013.jpg` — high-variance 99-vs-101 signal-to-noise.
- `slide_016.jpg` — advantage function.
- `slide_018.jpg` — importance-sampling two-Gaussians picture.
- `slide_026.jpg` — PPO clip.
- `slide_028.jpg` — full PPO objective (actor/critic/entropy labeled).
- `slide_030.jpg` — SAC actor & critic losses.

## Student Q&A
Mostly rhetorical prompts answered on-slide; a student confirms the smoothness/
differentiability point during the PG derivation [10:xx]. Good spot to reuse the "we can't
differentiate the sampling, but we can differentiate w.r.t. θ" dialogue.

## [UNCLEAR] / caveats
- Params: policy uses $\theta$ (old) and $\theta'$ (new) for importance sampling; critic
  uses $\phi$ / target $\bar\phi$. Keep this split consistent in Ch.5 (and reconcile with
  Ch.4's DDPG actor $\phi$ / critic $\theta$ — **notation pass will fix the clash**).
- TRPO complexity stated as $O(N^2)$ memory / $O(N^3)$ compute for the FIM; slide says
  conjugate-gradient reduces to ~$O(n)$ but ~20× a normal step.

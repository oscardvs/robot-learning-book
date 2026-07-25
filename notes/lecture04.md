# Lecture 4 — Reinforcement Learning I (raw notes)

- Video: <https://www.youtube.com/watch?v=90raNpc11tQ> (52.5 min)
- Transcript: `transcripts/04_rl_I.txt` (7,651 w) · Slides: `slides_png/lecture04/`
  (48 frames) · OCR `slides/lecture04.txt`
- Speaker: Oier Mees. Assigned (wk4): Salimans et al. 2017 (Evolution Strategies);
  **Zeng et al. 2018** (Pushing+Grasping); Luo et al. 2024 (Human-in-the-Loop RL).
  Guest: **Aviral Kumar** (CMU & Google DeepMind).

The spine of the book. Arc: why RL beats the imitation ceiling → value functions &
Bellman → exact methods (value/policy iteration) → model-free tabular (Q-learning,
SARSA) → deep RL discrete (DQN) → continuous actions (discretization, CEM, DDPG). Maps
to Ch.4. Equations verified against slides 5–9 and 37–42.

Motivation [00:01]: imitation is capped by the expert — "we can't get better than the
expert." RL breaks that ceiling by trial and error. Builds directly on the Lecture-2 MDP
$M=\langle\mathcal{S},\mathcal{A},\mathcal{P},\mathcal{R}\rangle$ and objective
$J(\pi)=\mathbb{E}_{\tau\sim p_\pi(\tau)}[\sum_{t\ge0}\gamma^t r_t]$, $\pi^*=\arg\max_\pi J(\pi)$.

---

## Non-differentiable rewards → smooth expectations (slides 5–6)
Toy: mountain road, +1 for staying on, −1 for falling off the cliff. The reward is a
**Heaviside step** — non-smooth, non-differentiable, gradient zero everywhere except an
undefined jump. Yet RL learns it, because **RL maximizes expectations**. Model falling as
a Bernoulli event: the *expected* reward is smooth in the policy parameters even when the
raw reward is discontinuous. Visually, the expected value is a **convolution of the reward
with the policy's density** — marginalizing over a stochastic policy turns a non-smooth
reward into a smooth objective, so gradient descent applies. This is the deep reason RL
optimizes distributions, not raw actions.

## Value functions & bootstrapping (slides 5–8)
Problem: $J(\pi)$ requires unrolling a whole trajectory before you know how good you are —
you'd have to let the car fall off the cliff to learn it's bad ("Don't wait for the
cliff"). Fix via the **Markov property**: factor the future without depending on the past.

**Value function** $V^\pi(s)$ — like $J$ but conditioned on a state: how good the policy
is *from this state onward*. Relation: $J(\pi)=\mathbb{E}_{s_0\sim p(s_0)}[V^\pi(s_0)]$.

**Bootstrapping** (slide 7): split any infinite reward sum into "now" + "discounted
future":
$$\sum_{t\ge 0}\gamma^t R(s_t,a_t) = R(s_0,a_0) + \gamma\underbrace{\sum_{t\ge 1}\gamma^{t-1}R(s_t,a_t)}_{=\,V}$$
giving the **Bellman expectation equation**:
$$V^\pi(s) = \mathbb{E}_{a\sim\pi(\cdot\mid s),\ s'\sim P(\cdot\mid s,a)}\big[r(s,a) + \gamma V^\pi(s')\big]$$
*value now = immediate reward + discounted value of the next state.* Turns an infinite-
horizon problem into a **one-step recursion** — no full rollouts. Only need a one-step
look-ahead and the current estimate of $V$ for the rest.

## Optimality (slide 8)
**Optimal value** $V^*(s) = \max_\pi V^\pi(s)$ — the ceiling any policy could reach from
$s$. **Optimal policy** reaches the ceiling from *every* start:
$$\pi^* = \arg\max_\pi J(\pi) = \arg\max_\pi \mathbb{E}_{s_0\sim p(s_0)}[V^\pi(s_0)], \qquad \pi^*(s) = \arg\max_a \mathbb{E}_{s'\sim P(\cdot\mid s,a)}\big[r(s,a) + \gamma V^*(s')\big]$$
Once you have $V^*$, acting optimally is a **greedy one-step look-ahead** — the infinite-
horizon plan is compressed into local decisions.

## Value iteration (slides 9–12)
Compute $V^*$ by repeatedly applying the Bellman optimality update:
1. Initialize $V_0(s_t) = 0\ \forall s_t\in\mathcal{S}$.
2. For $k=0,1,2,\dots$ until $\max_{s_t}|V_{k+1}(s_t)-V_k(s_t)|<\epsilon$:
   $$V_{k+1}(s_t)\leftarrow \max_a\big[r(s_t,a) + \gamma\,\mathbb{E}_{s_{t+1}\sim P(\cdot\mid s,a)}V_k(s_{t+1})\big]$$
3. Extract $\pi^*(s_t)=\arg\max_a[r(s_t,a)+\gamma\mathbb{E}_{s_{t+1}\sim P}V^*(s_{t+1})]$.

Converges by **Bellman contraction** (the operator brings any two value functions closer).
Gridworld demo (Mees: "I let Claude program it"): green goal +1, red danger −1, gray
walls, stochastic agent (80% intended, 10%/10% drift). Values **back-propagate** from the
goal one step at a time — "dynamic programming in its purest form." Limits: **assumes a
dynamics model**; sweeps all states $O(|\mathcal{S}|^2|\mathcal{A}|)$; state space must be
**discrete & small** (tabular).

## Policy evaluation & iteration (slides 13–16)
**Policy evaluation** — "how good is a policy I already have?" Replace the $\max$ with an
expectation under $\pi$:
$$V_{k+1}(s_t)\leftarrow \mathbb{E}_{a\sim\pi(\cdot\mid s_t)}\big[r(s_t,a)+\gamma\mathbb{E}_{s_{t+1}\sim P}V_k(s_{t+1})\big]$$
Cheaper, $O(|\mathcal{S}|^2)$ (no max over actions), but still needs a model. **Policy
iteration** alternates:
- Policy evaluation: $V_{j+1}(s_t)\leftarrow\mathbb{E}_{a\sim\pi_j(\cdot\mid s_t)}[\dots]$ (loop to convergence).
- Policy improvement: $\pi_{j+1}(s_t)=\arg\max_a[r(s_t,a)+\gamma\mathbb{E}_{s_{t+1}\sim P}V^{\pi_j}(s_{t+1})]$.

Guaranteed to converge (finite deterministic-policy space, each step strictly improves).
Return curve strictly increases.

## Q-values: absorb the model (slides 17–19)
**Limitation of $V$ for robotics** (slide 17): acting with $V$ needs the dynamics model
*at test time* for every state-action pair — slow for high-frequency / 7-DoF continuous
robots, and the world is hard to model. Fix: the **Q-function** bakes the transition
expectation in during training.
$$V^*(s_t)=\max_a\big[r(s_t,a)+\gamma\mathbb{E}_{s_{t+1}\sim P}V^*(s_{t+1})\big]$$
$$Q^*(s_t,a)=r(s_t,a)+\mathbb{E}_{s_{t+1}\sim P(\cdot\mid s_t,a)}\big[\gamma\max_{a_{t+1}}Q^*(s_{t+1},a_{t+1})\big], \qquad V^*(s_t)=\max_a Q^*(s_t,a)$$
$Q^*(s,a)$ = best return if you commit to $a$ now, act optimally after. **Test time needs
no model** — just $\pi^*(s_t)=\arg\max_a Q^*(s_t,a)$, a lookup/argmax. Trade-off: higher-
dimensional (conditions on action too), a bit harder to learn; worth it for model-free
robotics. (Still needs the model during *training*.)

## Q-learning: model-free (slides 20–23)
Remove the model from training too: **replace the expectation with a single sampled
experience.**
1. Execute $a_t$, observe $(s_t,a_t,r_t,s_{t+1})$.
2. TD target $= r(s_t,a_t) + \gamma\max_a Q(s_{t+1},a)$ (or just $r(s_t,a_t)$ if terminal).
3. $Q(s_t,a_t)\leftarrow (1-\alpha)\underbrace{Q(s_t,a_t)}_{\text{old}} + \alpha\underbrace{[\text{TD target}]}_{\text{new experience}}$ ($\alpha$ = learning rate).

Treat the world as its own simulator. Slower than model-based (must explore), shown on the
gridworld.

**Off-policy vs on-policy** (slides 22–23). Does it matter *which* policy collected the
transition? **No** — the $\max$ in the TD target evaluates the optimal next action
regardless of behavior. So **Q-learning is off-policy**: learns from any data (random,
old policy, human demos) → enables the **experience-replay buffer**.
$$\text{Q-learning (off-policy): } r(s_t,a_t)+\gamma\max_a Q(s_{t+1},a) \quad\text{— "best I could do next"}$$
$$\text{SARSA (on-policy): } r(s_t,a_t)+\gamma\,Q(s_{t+1},a_{t+1}) \quad\text{— "what I'll actually do next"}$$
SARSA learns the value of the policy it actually runs (exploration and all). **Cliff-
walking**: Q-learning takes the risky optimal path along the edge; SARSA learns the
**safer** path away from the ledge (a nervous driver's mistakes get penalized).

**Taxonomy so far** (slide 25): *exact methods* (value/policy/Q-value iteration — need a
model, tabular, small) → *value-based model-free* (Q-learning off-policy, SARSA on-policy —
learn from interaction, still tabular & small).

## Deep RL, discrete: DQN (slides 26–32)
**Curse of dimensionality**: an Atari frame stack is $256^{84\times84\times4}$ states —
un-tabulatable. **DQN** (Mnih et al., 2013): replace the Q-table with a **deep CNN**; input
a stack of raw pixels, output a vector of Q-values (one per discrete action), train with
the Q-learning update. First single algorithm+architecture+hyperparameters to learn **49
Atari games** from raw pixels. (Mees aside: DQN's authors incl. Martin Riedmiller, his
Freiburg professor, who'd just left for a "small startup called DeepMind.")

Two key innovations:
- **Experience replay** (slide 29): store transitions in $D_{\text{replay}}$, sample random
  minibatches → breaks temporal correlations (approx. i.i.d. for the optimizer), and each
  transition is reused many times (sample-efficient).
- **Delayed target network** (slide 30): the target and prediction both move every step →
  instability/divergence. Keep a frozen copy $\theta^-$ for the target:
  $$L(\theta) = \mathbb{E}_{(s_t,a_t,r_t,s_{t+1})\sim D_{\text{replay}}}\Big[\big(r(s_t,a_t) + \gamma\max_a Q(s_{t+1},a;\theta^-) - Q(s_t,a_t;\theta)\big)^2\Big]$$
  $\theta^-$ updated slowly (averaging) or periodically ($\theta^-\leftarrow\theta$ every N
  steps) → stable supervised regression.

**Overestimation bias** (slide 32): $\max$ of noisy estimates $\ge$ max of true values —
noise is amplified, not averaged. **Double DQN** (Van Hasselt et al., 2015): decouple
selection from evaluation using the two existing networks:
$$y_j = r(s_t,a_t) + \gamma\, Q\big(s_{t+1},\ \underbrace{\arg\max_a Q(s_{t+1},a;\theta)}_{\text{online selects}};\ \theta^-\big) \quad(\text{target evaluates})$$

## Continuous actions (slides 33–46)
Robots have continuous actions $a=[\tau_1,\dots,\tau_7]\in\mathbb{R}^7$; can't $\arg\max$
over an infinite set. Three routes:

**(1) Discretization** — grid the action space, apply DQN. Simple, but **exponential** in
DoF. Smart special case: **spatial discretization** (slides 34–35; Zeng, Song et al.,
2018, *Learning Synergies between Pushing and Grasping*): map actions onto the 2-D
top-down image, use a **fully-convolutional net** on an RGB-D heightmap → a **dense Q-map**
(one Q per pixel × 16 rotations); argmax over the map. The robot **discovers pushing
before grasping** (singulate clutter, then grasp) purely from reward — never programmed;
emerges from the Bellman backup assigning low Q to cluttered configs.

**(2) Sampling** — **Monte Carlo**: sample $a^{(i)}\sim\text{Uniform}(\mathcal{A})$,
evaluate $Q$, return best. Works because $Q_\theta(s,a)$ is smooth in $a$; needs $N$ forward
passes, no argmax guarantee. **Cross-Entropy Method (CEM)** — sample smarter:
1. Sample $N$ actions $a^{(i)}\sim\mathcal{N}(\mu_k,\sigma_k)$.
2. Keep top $M$ elites $E_{\text{set}}=\{a\mid Q(s,a)\in\text{top }M\}$.
3. Refit $\mu_{k+1}=\text{mean}(E_{\text{set}})$, $\sigma_{k+1}=\text{std}(E_{\text{set}})$; repeat; return $a^*=\mu_K$.

Black-box, no gradients; **unimodal** (finds one peak); pays $N\times K$ forward passes
*every control step*. **QT-Opt** (Kalashnikov et al., 2018): first Q-learning+CEM at real-
robot scale — **96% grasp success on unseen objects**, off-policy replay buffer of **580k
real grasps** across a robot farm (~7 arms).

**(3) Learn the argmax — DDPG** (slides 41–46; Lillicrap et al., 2015): learn a network
that outputs the maximizing action, so test time is one forward pass.
$$\mu_\phi(s_t) \approx \arg\max_a Q(s_t,a;\theta) \quad [\text{1 forward pass}]$$
Two networks: **critic** $Q(s,a;\theta)$ (as in DQN, TD loss) and **actor** $\mu_\phi(s)$
(new, trained to output high-$Q$ actions). Actor update via the chain rule (policy-gradient
territory, Ch.5):
$$\nabla_\phi J(\phi) \approx \mathbb{E}_s\Big[\nabla_a Q(s,a;\theta)\big|_{a=\mu_\phi(s)} \cdot \nabla_\phi \mu_\phi(s)\Big]$$
Ask the critic which direction raises $Q$, move the actor there. **Exploration**: a
deterministic actor never explores and $\epsilon$-greedy would thrash the robot, so add
Gaussian noise: $a_t=\mu_\phi(s_t)+\epsilon,\ \epsilon\sim\mathcal{N}(0,\sigma)$. DDPG is
**notoriously brittle** — hyperparameter-sensitive, often fails to converge; $\sigma$ hand-
tuned (too small → no exploration, too large → unstable). Real-robot manipulation: Gu et
al., 2016 (async off-policy).

## Final taxonomy (slide 47)
| | Exact (VI/PI/Q-VI) | Q-Learning / SARSA | DQN / Double DQN | DDPG / QT-Opt |
|---|---|---|---|---|
| Dynamics model | needs (train+test) | model-free | model-free | model-free |
| State space | discrete, small | discrete, small | high-dim images | high-dim images |
| Action space | discrete | discrete | discrete | **continuous** |
| Policy | tabular | tabular | neural net | actor+critic NNs |
| Off-policy | — | Q-learn ✓ / SARSA ✗ | ✓ (replay) | ✓ (replay) |
| Convergence | ✓ guaranteed | ✓ tabular+explore | ✗ | ✗ brittle |
| Key idea | Bellman contraction | TD from experience | replay + target net | actor learns argmax |

## Definitions for glossary
Value function $V^\pi$; Bellman expectation/optimality equation; bootstrapping; optimal
value/policy; value iteration; Bellman contraction; policy evaluation; policy iteration;
Q-function; Q-value iteration; Q-learning; TD target; learning rate; off-policy vs
on-policy; SARSA; experience replay; target network; overestimation bias; Double DQN;
discretization; spatial discretization / dense Q-map; Monte Carlo sampling; cross-entropy
method (CEM); actor / critic; DDPG; deterministic policy gradient; Gaussian exploration
noise.

## Papers named (with timestamps)
- Mnih et al., 2013/2015 — *Playing Atari with Deep RL* (DQN) [33:13].
- Van Hasselt et al., 2015 — *Deep RL with Double Q-learning* [38:xx].
- **Zeng, Song et al., 2018 — Pushing + Grasping** (assigned) [41:12].
- Kalashnikov et al., 2018 — *QT-Opt* [46:13].
- Lillicrap et al., 2015 — *Continuous control with deep RL* (DDPG) [47:xx].
- Gu et al., 2016 — async off-policy DDPG for robotic manipulation [49:54].

## Figures worth reproducing
- `slide_007.jpg` — bootstrapping / Bellman expectation.
- `slide_008.jpg` — optimal value & policy.
- `slide_009.jpg` — value iteration algorithm box (→ algorithm2e in Ch.4).
- `slide_023.jpg` — Q-learning vs SARSA targets (off/on-policy).
- `slide_030.jpg` — delayed target network loss.
- `slide_032.jpg` — overestimation / Double DQN reroute.
- `slide_034.jpg` — spatial discretization dense Q-map (Zeng 2018).
- `slide_041.jpg`/`slide_042.jpg` — DDPG actor–critic + actor gradient.
- `slide_047.jpg` — the RL taxonomy table.

## Student Q&A
- [28:xx] Mees asks whether it matters which policy collects Q-learning data; a student
  answers correctly "No, because we act w.r.t. the optimal policy — the max operator" →
  the definition of off-policy. Good in-chapter dialogue.

## [UNCLEAR] / caveats
- Slides say DQN "launched Deep RL in 2013" and cite the 2013 arXiv; the 49-game Nature
  result is 2015. Both dates are correct for different versions — note in text.
- Actor uses params $\phi$, critic $\theta$ (slides 41–42). Keep this split in Ch.4.

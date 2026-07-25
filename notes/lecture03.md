# Lecture 3 — Imitation Learning (raw notes)

- Video: <https://www.youtube.com/watch?v=Ef4R5s1LqoQ> (50.5 min)
- Transcript: `transcripts/03_imitation.txt` (7,842 w) · Slides: `slides_png/lecture03/`
  (49 frames) · OCR `slides/lecture03.txt`
- Speaker: Oier Mees. Assigned (wk3): **de Haan et al. 2019** (Causal Confusion in IL);
  Pari et al. 2021 (representation learning for visual imitation); Zeng et al. 2020
  (Transporter Networks). Guest: **Danfei Xu** (Georgia Tech).

Arc: behavior cloning → why it fails (distribution shift, non-Markovian, multimodal) →
fixes (DAgger/interventions, history+causal-confusion caveat, the multimodality toolkit)
→ case study on play data. Maps to Ch.3. Heavy on setup for Chs 6–7 (diffusion, sequence
models).

---

## Behavior cloning (slides 4–5)
**Imitation learning setup** (slide 4): given expert **demonstrations** $\mathcal{D} =
\{(s_1, a_1, \dots, s_t)\}$ — trajectories of states + actions from a human driving or
teleoperating, *assumed optimal*. Goal: learn $\pi_\theta$ that imitates the expert.

**Behavior cloning (BC)** (slide 5) — the simplest algorithm. For a deterministic policy,
treat it as regression to the expert's actions:
$$\min_\theta \frac{1}{|\mathcal{D}|}\sum_{(s,a)\in\mathcal{D}} \|a - \hat a\|^2, \qquad \hat a = \pi_\theta(s)$$
Sample a batch, forward pass, MSE loss, backprop, SGD; deploy $\pi_\theta$ on the robot.
Same as supervised learning — but the assumptions differ.

## Why BC fails #1 — distribution shift / compounding error (slides 7–8)
Supervised learning assumes inputs are **i.i.d. and independent of predicted labels**:
predicting image A doesn't change image B. BC breaks this. A tiny action error moves the
robot to a state slightly off the expert's; that state wasn't in training, so the next
prediction is likely wrong too; errors **compound** and drift away. Formally the visited-
state distributions differ: $p_{\text{expert}} \neq p_\pi(s)$ (states visited by expert ≠
states visited by policy). Real causes: illumination, day→night, weather.

## But it *can* work — with a data trick (slides 9–17)
**NVIDIA end-to-end driving** (Bojarski et al., 2016): a deep net maps raw pixels from a
single front camera → steering. Worked after collecting more data. **Why?** The recovery
trick: use **3 cameras**. Augment the dataset with side cameras and *virtual* corrective
labels (slide 12):
$$\mathcal{D}_{\text{aug}} = \{(o_{\text{center}}, a),\ (o_{\text{left}}, a+\delta),\ (o_{\text{right}}, a-\delta)\}$$
Left-facing camera → labeled "steer right", right-facing → "steer left". Teaches recovery
without a human ever crashing. **Same trick for quadcopters** flying Swiss forest trails
(3 GoPros on a walker's head → fly-left/straight/right labels) — data is hard to collect
because humans don't fly.

## How bad is BC? The quadratic bound (slides 18–19)
Time horizon $T$; $\epsilon$ = probability $\pi_\theta$ errs at any step. Cost
$$c(s,a) = \begin{cases}0 & a = \pi^*(s)\\ 1 & \text{otherwise}\end{cases}, \qquad P\big(a \neq \pi^*(s)\mid s\big) \le \epsilon,\ \forall s \in \mathcal{D}_{\text{train}}$$
Expected total cost:
$$\mathbb{E}\Big[\sum_t c(s_t, a_t)\Big] \le \epsilon T + (1-\epsilon)\big(\epsilon(T-1) + \cdots\big) \approx O(\epsilon T^2)$$
Supervised error would be $O(\epsilon T)$ (linear). BC is **quadratic** — one early mistake
costs for all remaining steps. **Tightrope-walker** analogy: off the rope, no demo shows
how to get back; error on unseen states is unbounded. Reference: **Ross et al., 2011**, "A
Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning."

## Fix #1 — make the distributions match (slides 20–24)
**DAgger (Dataset Aggregation)** — close the gap by online rollouts:
1. Roll out $\pi_\theta$, collect visited states $(s'_1, \hat a_1, \dots, s'_t)$.
2. Query expert for the optimal action at each visited state $a^* \sim \pi_{\text{expert}}(\cdot\mid s')$.
3. Aggregate: $\mathcal{D} \leftarrow \mathcal{D} \cup \{(s', a^*)\}$ (keep old data).
4. Update $\theta \leftarrow \arg\min_\theta L(\pi_\theta, \mathcal{D})$. Repeat.

Converges to $p_\pi(s) = p_{\text{expert}}$ → **$O(\epsilon T)$** (linear), killing the
quadratic blow-up. Costs: hindsight expert labeling is expensive/slow; human–robot action
spaces may differ. Paradox: **BC works better if the data has more mistakes and
recoveries.**

**Human-Gated DAgger / online intervention** (slide 21): let the robot run under human
supervision; the human takes over *only when it errs* and gives a partial demo $(s'_t,
a^*_t, \dots, s'_T)$; aggregate those. Driving-instructor analogy (grabs the wheel only
near a crash). New challenge: **how do you detect when intervention is needed?**

**Automating intervention via uncertainty** (slides 22–24) — Mees PhD case study:
detect **ambiguous language** ("fetch the round yellow thing" with several yellow
objects) and ask the human back. Method (slide 23): train a referential-expression
**comprehension** model with a **max-margin ranking loss** so correct (object, sentence)
pairs score above wrong ones by margin $m_1$:
$$\mathcal{L}_{\text{rank}} = \sum_i \big[\lambda_1 \max(0,\ m_1 + S(o_i\mid r_j) - S(o_i\mid r_i)) + \lambda_2 \max(0,\ m_1 + S(o_k\mid r_i) - S(o_i\mid r_i))\big]$$
plus a **generation** model $\mathcal{L}_{\text{gen}} = -\sum_i \log P(r_i\mid v_i)$ and a
max-margin term $\mathcal{L}_{\text{mmi}}$. At test time, if several objects fall within
margin $m$, generate a description per candidate and ask ("Do you mean the middle
banana?"). Paper: **Mees & Burgard, ISER 2020** (Composing Pick-and-Place Tasks by
Grounding Language).

## Why BC fails #2 — non-Markovian behavior (slides 25–27)
Lecture 2 said the policy conditions only on the current state, $\pi_\theta(a_t\mid o_t)$.
But humans act on **history, emotion, intent, privileged information**: a driver tracks a
cyclist over 5 s; a teleoperator sees more than the robot camera (occlusions). So the same
observation can map to two different expert actions — BC can't explain why.

**Fix: add history** (slide 26) — encode the last $n$ frames with a seq2seq model
(LSTM/RNN/transformer): $\pi_\theta(a_t\mid o_1, \dots, o_t)$. But **adding history doesn't
always help** — it can hurt, via **causal confusion** (slide 27, de Haan et al. 2019): a
high-capacity model over full history infers **spurious correlations**. Example: every
drawer-open demo shows a 10 N gripper-force spike → model learns "10 N spike → pull",
ignoring the visual state. At test the gripper slips and reads 2 N → pull never triggers.
Needs heavy regularization to attend to the right (visual) causes.

## Why BC fails #3 — multimodal behavior (slides 28–34) — the big one
Even with perfect data, there are **many (infinite) valid ways** to do a task: close a
drawer with a 7-DoF arm via side grasp, top-down, elbow push… (redundancy + expert
inconsistency across trials). **A deterministic MSE policy averages the modes.** Snowboard
analogy: expert goes left of the tree in some demos, right in others; the MSE average is
**straight into the tree**. Need a policy that represents **multiple modes**. Four tools:

**(a) Mixture of Gaussians** (slide 30): more expressive than one Gaussian; predict means,
covariances, weights.
$$\pi(a\mid o) = \sum_i w_i\, \mathcal{N}(\mu_i, \Sigma_i)$$
Downside: must **predefine the number of modes** — fine for 10, painful for a humanoid
that might need thousands.

**(b) Autoregressive discretization** (slides 31–32): bin the action space → classify.
Discretization represents multimodal distributions well but scales **exponentially** with
dimension. Fix: **per-dimension** discretization with a sequence model (autoregressive
transformer), linear in dimensions, via the chain rule:
$$p(a_t\mid s_t) = p(a_{t,0}, a_{t,1}, a_{t,2}\mid s_t) = p(a_{t,2}\mid s_t, a_{t,0}, a_{t,1})\,p(a_{t,1}\mid s_t, a_{t,0})\,p(a_{t,0}\mid s_t)$$
Predict each action dimension in sequence. **This is how the first VLAs worked** (forces
an LLM/VLM backbone — costlier).

**(c) Diffusion** (slide 33): models complex distributions over continuous variables;
replace images with robot **actions** (full treatment in Week 6 / Ch.6).
$$\text{Forward: } x_{i+1} = x_i + \text{noise} \qquad \text{Backward: learn } f(x_i) = x_{i-1}$$
In practice predict the **noise**: $f(x_i) = \text{noise}$, then $x_{i-1} = x_i - f(x_i)$.
Iteratively denoise from static noise → clean sample. (Both (b) and (c) are iterative — one
over action dimensions, one over denoising steps.)

**(d) Latent-variable models** (slide 34): output is still Gaussian but takes an extra
latent input $z$ sampled from a prior — a "seed" that selects the mode. Can represent
"any" distribution. Popular: **conditional VAEs**.
$$\pi(a\mid o, z) = f_\theta(o, z), \qquad z \sim \mathcal{N}(0, I)$$
Must *train* the latent to correspond to a mode (can't feed random numbers and expect a
target behavior). **Latent intent vs task specification**: task conditioning is a
supervised signal for *which* behavior (goal); the latent is the *style/mode* within that
goal — even a fixed task has infinite executions.

## Scaling to any task: goal-conditioning (slides 35–38)
Progression of conditioning:
$$\underbrace{\pi_\theta(a_t\mid s_t)}_{\text{single task (Pomerleau 1991)}} \ \to\ \underbrace{\pi_\theta(a_t\mid s_t, \text{task id})}_{\text{task-conditioned (Rahmatizadeh 2018)}} \ \to\ \underbrace{\pi_\theta(a_t\mid s_t, s_g)}_{\text{goal-conditioned (Lynch 2019)}}$$
Motivation: **task success is ill-defined** (a sliding door moved 50% — success? where's
the threshold?); tasks are **continuous, not discrete**, made of subtasks. So aim for
**goal-reaching**: reach *any* goal state $s_g$ from *any* initial state. Because tasks are
continuous, so are the goal states.

## Case study — Learning from Play (slides 39–47)
**Play data**: unstructured teleoperation with no upfront task; scalable, **reset-free**,
richly multimodal (operator satisfies curiosity — like a child playing).

Method (slides 43–44): sample a random window of play; encode the **last frame** as the
goal (goal relabeling); a **sequence-to-sequence conditional VAE** with three parts:
- **Posterior / Plan Recognition** $q_\phi(z\mid\tau)$ — sees the whole sampled window,
  recognizes the exact behavior executed.
- **Prior / Plan Proposal** $p_\theta(z\mid c)$ — sees only initial + goal state,
  outputs a distribution over behaviors connecting them.
- **Action decoder** $p_\theta(\tau\mid z, c)$ — conditioned on the latent plan.

Minimize KL between posterior and prior so the prior puts mass on behaviors actually
executed. At test, **discard the posterior**, sample plans from the prior. Conditioning
the decoder on the latent plan **frees its capacity to model unimodal behavior**.
Language goals interchange with visual goals via embeddings (learn control mostly self-
supervised from unlabeled visual play, reducing language annotation).

**The math** (slides 45–46): maximize marginal likelihood of expert data, but $z$
continuous ⇒ marginalization intractable. Optimize the **variational lower bound (ELBO)**:
$$\log p_\theta(\tau) \ge \underbrace{-\,\mathrm{KL}\big(q_\phi(z\mid\tau)\,\|\,p_\theta(z)\big)}_{\text{regularization: is }z\text{ near the prior?}} + \underbrace{\mathbb{E}_{q_\phi(z\mid\tau)}\big[\log p_\theta(\tau\mid z)\big]}_{\text{reconstruction: does }z\text{ explain }\tau?}$$
With goal/context $c = (s_c, s_g)$:
$$\log p_\theta(\tau\mid c) \ge -\,\mathrm{KL}\big(q_\phi(z\mid\tau, c)\,\|\,p_\theta(z\mid c)\big) + \mathbb{E}_{q_\phi(z\mid\tau, c)}\big[\log p_\theta(\tau\mid z, c)\big]$$
which maps exactly onto posterior / prior / decoder.

## Conclusion (slide 48) — the failure-mode → fix map
- **Distribution shift** → DAgger, Human-Gated DAgger, detect-when-to-intervene.
- **Non-Markovian behavior** → privileged observation, history (beware causal confusion).
- **Multimodal behavior** → MoG, autoregressive discretization, diffusion, latent-variable
  models.

## Definitions for glossary
Imitation learning; demonstrations; expert; behavior cloning; distribution/covariate
shift; compounding error; DAgger; human-gated DAgger / online intervention; referential
expression; max-margin ranking loss; non-Markovian behavior; causal confusion; multimodal
behavior; mode averaging; mixture of Gaussians; (autoregressive) discretization; diffusion
(forward/backward, noise prediction); latent-variable model; conditional VAE; ELBO /
variational lower bound; KL divergence; task conditioning vs latent intent; goal-
conditioning / goal-reaching; play data; goal relabeling; latent plan.

## Systems / datasets / papers named (with timestamps)
- Bojarski et al., 2016 — NVIDIA *End to End Learning for Self-Driving Cars* [09:00].
- Swiss-forest quadcopter trail-following (3-camera trick) [13:00] — [UNCLEAR: Mees says
  he forgot the paper name/year on the slide; this is Giusti/Loquercio et al., ~2016,
  IEEE RA-L "A Machine Learning Approach to Visual Perception of Forest Trails" —
  **Editor's note**, not stated in lecture].
- Ross et al., 2011 — DAgger / No-Regret bound [17:xx].
- Mees & Burgard, ISER 2020 — Composing Pick-and-Place by Grounding Language [22:29].
- **de Haan et al., 2019 — Causal Confusion in IL** (assigned) [31:33].
- Pomerleau 1991 (ALVINN, single-task BC); Rahmatizadeh 2018 (task-conditioned);
  **Lynch 2019** (Learning Latent Plans from Play, goal-conditioned).
- Mees PhD (slide 47): CALVIN (Mees et al., RA-L 2022); HULC/*Grounding Language…* (Mees
  et al., RA-L 2022, Best Paper); *Affordances over Unstructured Data* (Mees, ICRA 2023,
  Best-Paper finalist); Borja*/Mees*, ICRA 2022; **Rosete*/Mees*, CoRL 2022** (*Latent
  Plans for Task-Agnostic Offline RL* — assigned in wk5).

## Student Q&A
Questions were deferred to the paper discussion; the in-lecture check-ins ("is that
clear?", the sliding-door success poll [41:33]) are rhetorical/illustrative.

## Figures worth reproducing
- `slide_005.jpg` — BC as regression (the loss).
- `slide_007.jpg` — supervised i.i.d. vs BC drift ($p_{\text{expert}}\neq p_\pi$).
- `slide_012.jpg` — 3-camera data-augmentation trick.
- `slide_019.jpg` — quadratic-bound derivation + tightrope.
- `slide_029.jpg` — snowboard mode-averaging (drive into the tree).
- `slide_030.jpg` / `slide_033.jpg` / `slide_034.jpg` — MoG / diffusion / CVAE.
- `slide_043.jpg`/`slide_044.jpg` — play-data posterior/prior/decoder architecture.
- `slide_045.jpg` — the ELBO with labeled reg/recon terms.

## [UNCLEAR] / caveats
- Forest-trail paper name not on the slide (Mees says so) — mark as such.
- The ranking-loss slide is dense; transcription above matches the visible LaTeX
  ($m_1$, $S(o\mid r)$ scores). If reproduced in the book, credit Mees & Burgard 2020.

# Notation — one symbol set for the whole book

**Status: Phase 4 complete (2026-07-25).** Built by reading all eleven `notes/lectureNN.md`
files. This file is *normative*: chapters follow it, not the slides, wherever the two differ.
Every deviation from a lecture slide is listed in **§7** so the Phase-9 pass can check that each
one was made deliberately and is footnoted in the text.

Two guiding rules:

1. **The slides are ground truth for content; this file is ground truth for symbols.** Where a
   slide's symbol is changed, the chapter reproduces the lecture's form **once**, in a footnote
   or an editor's note, so a reader holding the deck can follow along. Never silently re-letter
   an equation the reader might check against the video.
2. **A symbol means one thing per chapter, and where possible one thing per book.** Genuine
   overloads that survive are listed in **§6** and must be stated in the text at first use — the
   brief asks for this explicitly.

---

## 1. The two clashes flagged during Phase 3

### 1.1 Actor/critic: `θ ↔ φ` between Ch.4 and Ch.5

The lectures disagree with themselves:

| Source | Actor / policy | Critic / value |
|---|---|---|
| L4, DQN (slides 26–32) | — (implicit $\arg\max_a Q$) | $Q(s,a;\theta)$, target $\theta^-$ |
| L4, DDPG (slides 41–42) | $\mu_\phi(s)$ | $Q(s,a;\theta)$ |
| L5, policy gradients (slides 7–26) | $\pi_\theta$ (old), $\pi_{\theta'}$ (new) | — |
| L5, PPO / SAC (slides 28–31) | $\pi_{\theta'}$ | $V_{\theta'}$, then $Q_\phi$, target $\bar\phi$ |
| L3 / L6, VAE | decoder $p_\theta$ | encoder $q_\phi$ |
| L9, Octo · L10, GRPO | $\pi_\theta$ | — |

**Resolution — $\theta$ is the primary model, $\phi$ is the auxiliary model.**

> **$\theta$** parameterizes the thing that *produces the output we deploy*: the policy, the
> actor, the decoder, the noise predictor, the velocity field.
> **$\phi$** parameterizes the thing that *scores or infers*: the critic ($Q$, $V$), the
> encoder / inference network ($q_\phi$).

This is what L5, L3, L6, L9 and L10 already do. **Only L4's DDPG is backwards**, so Ch.4 flips
it — one chapter changes instead of five. It also gives the split a reason a reader can
remember, rather than a convention to memorize: *deployed model = $\theta$; helper = $\phi$.*

Consequences for Ch.4 and Ch.5:

| Object | Book notation | Lecture wrote |
|---|---|---|
| DQN action-value network | $Q_\phi(s,a)$ | $Q(s,a;\theta)$ |
| DQN / SAC target network | $Q_{\bar\phi}(s,a)$ | $\theta^-$ (Ch.4) / $\bar\phi$ (Ch.5) |
| DDPG deterministic actor | $\mu_\theta(s)$ | $\mu_\phi(s)$ |
| DDPG critic | $Q_\phi(s,a)$ | $Q(s,a;\theta)$ |
| Double-DQN target | $Q_{\bar\phi}\!\big(s',\arg\max_{a'}Q_\phi(s',a')\big)$ | online $\theta$ selects, target $\theta^-$ evaluates |
| Policy being optimized | $\pi_\theta$ | $\pi_{\theta'}$ (L5) |
| Policy that collected the data | $\pi_{\theta_{\text{old}}}$ | $\pi_\theta$ (L5), $\pi_{\text{old}}$ (L10) |
| Frozen pre-trained reference (GRPO) | $\pi_{\text{ref}}$ | $\pi_{\text{ref}}$ ✓ |

The overbar always means **a frozen or slowly-updated copy** of the network under it:
$\bar\phi$, $\bar\theta$. DQN's $\theta^-$ is mentioned once in Ch.4 as the paper's notation.
$\pi_{\theta_{\text{old}}}$ and $\pi_{\text{ref}}$ are **different objects** and Ch.10 says so:
$\theta_{\text{old}}$ is the previous iterate that produced the current batch; $\pi_{\text{ref}}$
is the pre-RL model the KL term anchors to.

### 1.2 The diffusion step index

The lectures use four different symbols for "how far along the generative process we are":

| Source | Symbol | Range | Which end is data? |
|---|---|---|---|
| L3, slide 33 | $i$ | $x_{i+1} = x_i + \text{noise}$ | low $i$ |
| L6, slides 19–25 (DDPM/DDIM) | $i$, total $T$ | $\beta_i,\alpha_i,\bar\alpha_i,\epsilon_\theta(x_i,i)$ | $x_0$ |
| L6, slides 28–30 (Diffusion Policy) | $k$, total $K$ | $A_t^k$, $\epsilon^k$ | $A_t^0$ |
| L6, slides 31–35 (flow matching) | $t \in [0,1]$ | $x_t = (1-t)\epsilon + t\,x_0$ | $t=1$ |

Both $i$ and $t$ are already spoken for — $t$ is **environment time** in every other chapter,
and $i$ is a generic enumeration index (samples, batch elements, rollouts).

**Resolution — $k$ is the discrete denoising step, $\lambda$ is continuous flow time.**

> **$k \in \{0, 1, \dots, K\}$** indexes the discrete diffusion/denoising process.
> **$k = 0$ is the clean sample, $k = K$ is pure noise.** $K$ is the number of steps.
> **$\lambda \in [0,1]$** is continuous flow time in flow matching, with the lectures'
> orientation kept: **$\lambda = 0$ is noise, $\lambda = 1$ is data.**

Why $k$: the decisive case is Diffusion Policy, the only place where the environment index and
the denoising index appear in the same expression — $\mathbf{a}^k_{t:t+H}$, the action chunk
starting at environment time $t$ at denoising step $k$. Using $k$ makes that expression read
correctly and matches the robotics-facing paper's own notation. Ch.6's DDPM/DDIM equations are
therefore re-indexed from $i$ to $k$ ($\beta_k$, $\alpha_k = 1-\beta_k$,
$\bar\alpha_k = \prod_{j=1}^{k}\alpha_j$, $\epsilon_\theta(x_k, k)$, total $K$), and Ch.3's
one-line diffusion preview uses $k$ so it agrees with Ch.6.

> **Direction warning — must be stated in Ch.6's text.** $k$ counts **up into noise**;
> $\lambda$ counts **up into data**. They run opposite ways. This is not tidy, but it is what
> the two literatures do, and re-orienting flow matching would break π₀'s shifted-Beta sampling
> of flow time (L6 slide 35) and every flow-matching equation a reader would look up. Ch.6
> states the clash in one sentence at the start of §flow-matching and gives the bridge
> $\lambda \leftrightarrow 1 - k/K$.

$\lambda$ does one more job — see §6.1.

Related fixes in the same family:

| Object | Book notation | Lecture wrote |
|---|---|---|
| DDIM step subset | $\mathcal{K} = \{k_1,\dots,k_M\}$, $M \ll K$ | $\tau = \{t_1,\dots,t_K\}$ (τ is a trajectory) |
| Fresh noise in the DDPM sampler | $\epsilon' \sim \mathcal{N}(0,I)$ | $z$ ($z$ is a latent) |
| Action chunk | $\mathbf{a}_{t:t+H}$ | $A_t$ (L6), $a_{t:t+k}$ (L7 — $k$ is now the denoising step) |
| Observation fed to the denoiser | $o_t$ | $O_t$ |

---

## 2. Core symbols — the MDP and control (Chs 2–5, and everywhere after)

| Symbol | Meaning | First defined |
|---|---|---|
| $s$, $s_t \in \mathcal{S}$ | state (ground truth), state space | Ch.2 |
| $o$, $o_t$ | observation (lossy function of the state) | Ch.2 |
| $s_g$ | goal state (a goal image or a language instruction) | Ch.3 |
| $a$, $a_t \in \mathcal{A}$ | action, action space | Ch.2 |
| $\mathbf{a}_{t:t+H}$ | action chunk of length $H$ | Ch.7 |
| $r(s,a)$ | reward function; $r_t$ the realized reward at step $t$ | Ch.2 |
| $R(\tau)$ | total return of a trajectory | Ch.5 |
| $G$, $G_t$ | return; return from step $t$ onward | Ch.2 |
| $\gamma \in [0,1)$ | discount factor — **reserved, never anything else** | Ch.2 |
| $\mathcal{P}$ | transition kernel as an MDP component | Ch.2 |
| $P(s'\mid s,a)$ | transition probability | Ch.2 |
| $\rho_0(s_0)$ | initial-state distribution | Ch.2 |
| $M = \langle\mathcal{S},\mathcal{A},\mathcal{P},\mathcal{R}\rangle$ | the MDP | Ch.2 |
| $\tau = (s_0,a_0,s_1,\dots,s_T)$ | trajectory — **reserved** | Ch.2 |
| $T$ | task / episode horizon (number of steps) | Ch.2 |
| $H$ | action-chunk length | Ch.7 |
| $\pi$, $\pi_\theta(a\mid s)$ | policy | Ch.2 |
| $\pi^*$ | optimal policy | Ch.2 |
| $J(\theta)$ | expected return objective, $J(\theta)=\mathbb{E}_{\tau\sim p_\theta(\tau)}[\sum_t\gamma^t r_t]$ | Ch.2 |
| $V^\pi(s)$, $V^*(s)$ | state-value function; optimal value | Ch.4 |
| $Q^\pi(s,a)$, $Q^*(s,a)$ | action-value function; optimal Q | Ch.4 |
| $A^\pi(s,a) = Q^\pi - V^\pi$ | advantage | Ch.5 |
| $\hat A_i$ | estimated (group-relative) advantage of sample $i$ | Ch.10 |
| $\mu_\theta(s)$ | deterministic actor (DDPG) | Ch.4 |
| $\mathcal{D}$ | dataset of demonstrations | Ch.3 |
| $\mathcal{B}$ | experience-replay buffer | Ch.4 |
| $\eta$ | learning rate / step size | Ch.2 |
| $\alpha$ | entropy temperature (SAC, entropy-regularized PG) | Ch.5 |
| $H(\pi)$ | entropy of a policy | Ch.5 |
| $\rho_t(\theta) = \dfrac{\pi_\theta(a_t\mid s_t)}{\pi_{\theta_{\text{old}}}(a_t\mid s_t)}$ | importance / probability ratio | Ch.5 |
| $\epsilon_{\text{clip}}$ | PPO / GRPO clip range ($\approx 0.2$) | Ch.5 |
| $\delta_{\text{KL}}$ | TRPO trust-region bound | Ch.5 |
| $\delta$ | convergence threshold (value iteration) | Ch.4 |
| $b$ | policy-gradient baseline | Ch.5 |
| $N$ | number of samples / rollouts / group size | Chs 4, 5, 10 |
| $D_{\mathrm{KL}}(p\,\|\,q)$ | KL divergence — always this form, never $\mathrm{KL}$ alone | Ch.3 |

### Rigid-body and control notation (Ch.2)

| Symbol | Meaning |
|---|---|
| $q \in \mathbb{R}^n$ | joint configuration; components $q_1,\dots,q_n$ |
| $\mathbf{T}^{A}_{B}$ | homogeneous transform of frame $B$ in frame $A$ (bold, always with frames) |
| $SE(2)$, $SE(3)$, $SO(n)$ | the groups; $\mathbb{T}^2$ for the torus |
| $x \in SE(3)$ | end-effector pose; $\mathcal{C}$ the configuration space, $X$ the task space |
| $\mathbf{J}(q) = \partial f/\partial q$ | the kinematic Jacobian (bold) |
| $e(t)$ | tracking error; $u(t)$ the control signal |
| $K_p, K_i, K_d$ | PID gains |
| $f_c$ | control frequency in Hz |
| $\lambda \in [0,1]$ | normalized progress along a path (LERP, quintic time scaling) |
| $\Delta t = 1/f_c$ | control period |

**Two renames here matter.** Ch.2's optimization-based IK is written in $q$, not $\theta$
($L(q) = \tfrac12\|f(q)-x_{\text{target}}\|^2$, $q \leftarrow q - \eta\,\mathbf{J}(q)^\top e$),
because $\theta$ is reserved for network parameters and because $J(\theta)$ would otherwise mean
both *the Jacobian* and *the RL objective* — the single worst collision in the source material.
The Jacobian is bold $\mathbf{J}$, the objective is italic $J$, and their arguments differ ($q$
vs $\theta$), so all three cues disagree.

---

## 3. Generative models (Ch.6, used again in Chs 8–9)

| Symbol | Meaning |
|---|---|
| $x$, $x_0$ | a data sample; $x_0$ the clean sample in a diffusion process |
| $p_{\text{data}}(x)$ | the data distribution; $p_\theta(x)$ the model |
| $z$ | latent variable — **reserved for latents** |
| $q_\phi(z\mid x)$ | encoder / posterior / inference network |
| $p_\theta(x\mid z)$ | decoder |
| $p(z) = \mathcal{N}(0,I)$ | prior |
| $\epsilon \sim \mathcal{N}(0,I)$ | standard-normal noise (reparameterization, diffusion target) |
| $\epsilon_\theta(x_k,k,c)$ | the noise predictor |
| $\epsilon' $ | fresh noise re-injected by the DDPM sampler |
| $k \in \{0,\dots,K\}$ | denoising step ($k=0$ data, $k=K$ noise) |
| $\beta_k$ | noise schedule; $\alpha_k = 1-\beta_k$; $\bar\alpha_k = \prod_{j\le k}\alpha_j$ |
| $\mathcal{K}$ | the DDIM step subset |
| $\sigma_k$ | sampler noise scale |
| $c$ | conditioning input — **reserved for conditioning** |
| $\emptyset$ | the null condition (classifier-free guidance) |
| $w_{\text{cfg}}$ | guidance scale |
| $\lambda \in [0,1]$ | flow time ($\lambda=0$ noise, $\lambda=1$ data) |
| $v_\theta(x_\lambda,\lambda)$ | velocity field |
| $C = \{e_1,\dots,e_K\}$ | VQ-VAE codebook; $z_e$ encoder output, $z_q$ quantized |
| $\mathrm{sg}[\cdot]$ | stop-gradient |
| $\mathcal{L}$ | a loss; superscripts name it ($\mathcal{L}^{\text{CLIP}}$, $\mathcal{L}_{\text{simple}}$) |

$\pi_0$ and $\pi_{0.5}$ are **model names** (Physical Intelligence), not policies indexed by a
parameter. Ch.6 says so at first use, and the book writes them upright — $\pi_0$, $\pi_{0.5}$,
$\pi_0\text{-FAST}$ — never inside a policy expression like $\pi_0(a\mid s)$.

---

## 4. Sequence models (Ch.7, used again in Chs 8–10)

| Symbol | Meaning |
|---|---|
| $x_{1:t}$ | a token sequence; $p_\theta(x_t\mid x_{1:t-1})$ its factorization |
| $h_t$ | recurrent / deterministic hidden state (RNN, and RSSM in Ch.8) |
| $Q, K, V$ | attention query, key and value **matrices** (Ch.7 only — see §6.2) |
| $d$ | attention head dimension; $\sqrt{d}$ the scaling |
| $a_{ij}$ | attention weight from position $i$ to $j$ |
| $\mathrm{PE}(i)$ | absolute positional encoding; $b(i-j)$ a relative bias |
| $\tau_c$ | contrastive temperature (CLIP) — subscripted so it is never the trajectory $\tau$ |
| $s_{ij}$ | cosine similarity of pair $(i,j)$ in a contrastive loss |
| $w_i = \exp(-m\,i)$ | temporal-ensemble weights, decay rate $m$ |
| $\mathcal{T}_T$, $\mathcal{T}_o$ | Octo's task-token and observation-token groups (Ch.9) |
| $z_t$ | latent state (Ch.8's RSSM stochastic state, latent-action codes) |

---

## 5. Per-chapter symbol budget

A quick check that no chapter carries an unresolved collision. "⚠" marks an overload that the
chapter must declare in prose at first use.

| Ch. | Reserved and busy | Notes |
|---|---|---|
| 1 | $\mathcal{D}=\{(x_i,y_i)\}$, $\pi(a\mid s)$ | almost no math; keep it that way |
| 2 | $q$, $\mathbf{T}$, $\mathbf{J}$, $u$, $e$, $\lambda$ ⚠, $s$ | $\lambda$ = path progress in Act 1, $s$ = state in Act 2; they never co-occur but the chapter says so |
| 3 | $\mathcal{D}$, $\epsilon$ ⚠, $z$, $c$, $\ell(s,a)$ | $\epsilon$ = per-step error probability **in Ch.3 only** |
| 4 | $\phi$, $\bar\phi$, $\theta$, $\eta$, $\delta$, $\mathcal{B}$ | actor/critic flipped vs the slides — footnote it |
| 5 | $\theta$, $\theta_{\text{old}}$, $\phi$, $\bar\phi$, $\rho_t$, $\alpha$, $\epsilon_{\text{clip}}$, $\delta_{\text{KL}}$ | $\rho_t$ replaces the slides' $r_t$, which collided with reward |
| 6 | $k$, $K$, $\lambda$, $\beta_k$, $\alpha_k$, $\bar\alpha_k$, $c$, $z$, $\epsilon$ | $\alpha_k$ is always subscripted, so it never reads as the entropy temperature |
| 7 | $Q,K,V$ ⚠, $\tau_c$, $H$, $h_t$, $d$ | $Q,K,V$ are matrices here and only here |
| 8 | $h_t$, $z_t$, $o_t$, $a_t$, $p(z_{t+1}\mid z_t,a_t,h_t)$ | prior $p$ vs posterior $q$ follows §3's $\theta$/$\phi$ split |
| 9 | $\pi_\theta(a_t\mid s_t,s_g)$, $\mathcal{T}_\bullet$, $H$, $f_c$ | control frequencies are everywhere → $f_c$ earns its subscript |
| 10 | $\hat A_i$, $\rho_i$, $\epsilon_{\text{clip}}$, $\beta$ ⚠, $N$, $\pi_{\text{ref}}$ | $\beta$ = KL penalty weight in the GRPO objective, **not** a noise schedule; declare |
| 11 | almost none | prose chapter; resist inventing symbols |

---

## 6. Deliberate overloads — say these out loud in the text

### 6.1 $\lambda$ — normalized progress, twice
Ch.2's quintic time scaling and Ch.6's flow matching both use $\lambda \in [0,1]$ for
"normalized progress from one end of something to the other". They never appear in the same
chapter, the meaning is structurally the same, and the alternative was minting a fifth Greek
letter. Both chapters state which end is which.

### 6.2 $Q$, $K$, $V$ — Ch.7 versus Chs 4–5
$Q(s,a)$ is the action-value function; $Q$, $K$, $V$ in Ch.7 are the attention matrices; $V^\pi(s)$
is the state-value function. Three cues separate them: attention's are **unsubscripted capitals
in matrix products** ($QK^\top$), the value functions **always carry arguments or a parameter
subscript** ($Q_\phi(s,a)$, $V^\pi(s)$), and they live in different chapters. Ch.7 says this in
one sentence where attention is introduced. Renaming attention's $Q,K,V$ was rejected: every
reader and every paper uses them.

### 6.3 $\beta$ — noise schedule and KL weight
$\beta_k$ is the diffusion noise schedule (Ch.6, always subscripted by $k$); $\beta$ is the KL
penalty weight in the GRPO objective (Ch.10, always bare and multiplying a KL term). Ch.10
declares it. The entropy temperature is $\alpha$ everywhere, so the third $\beta$ from L5's
slide 23 is gone.

### 6.4 $\epsilon$
$\epsilon$ is standard-normal noise in Chs 5, 6, 8 and 9. Two chapter-local exceptions, both
declared: Ch.3's per-step error probability in the $O(\epsilon T^2)$ bound (kept because the
IL literature is unanimous, and no Gaussian noise appears in Ch.3), and Ch.4's "$\epsilon$-greedy",
which is a named algorithm rather than a variable. The PPO clip range and TRPO bound were
subscripted precisely so they do not join this list.

### 6.5 $c$ and $c_i$
$c$ is a conditioning input (Chs 3, 6, 9). Ch.2's Kutzbach formula uses $c_i$ for the constraints
imposed by joint $i$, and Ch.5's full PPO objective uses $c_1, c_2$ as loss coefficients — both
subscripted, both chapter-local, both declared. Ch.3's 0/1 imitation cost is $\ell(s,a)$, not
$c(s,a)$, to keep clear of all three.

### 6.6 $\mu$, $\sigma$
Always "a mean" and "a standard deviation": the Gaussian policy's $\mu_\theta,\sigma_\theta$, the
VAE's $\mu_\phi(x),\sigma_\phi(x)$, CEM's $\mu_k,\sigma_k$, GRPO's group statistics
$\mu_{\mathbf r},\sigma_{\mathbf r}$, DDPG's deterministic actor $\mu_\theta$. No fix needed; the
reading is uniform.

---

## 7. Where the book departs from the slides — the Phase-9 checklist

Each row is a place where a chapter deliberately re-letters a slide. Phase 9 must confirm (a) the
equation is otherwise character-identical to the slide image, and (b) the chapter footnotes the
lecture's own symbol.

| Ch. | Slide | Book writes | Slide writes | Why |
|---|---|---|---|---|
| 2 | 21 (IK) | $L(q)$, $q \leftarrow q - \eta\,\mathbf{J}(q)^\top e$ | $L(\theta)$, $\theta_{\text{new}} = \theta_{\text{old}} - \alpha J(\theta)^\top e$ | $\theta$ = network params; $J$ = objective |
| 2 | 16–17 | $q_1,\dots,q_7$ | $\theta_1,\dots,\theta_7$ | same |
| 2 | 23, 25 | $\lambda_i = i/N$, $f(\lambda)=10\lambda^3-15\lambda^4+6\lambda^5$ | $s_i = i/N$ | $s$ = state |
| 2 | 27 | $\int_0^t e(t')\,dt'$ | $\int_0^t e(\tau)\,d\tau$ | $\tau$ = trajectory |
| 2 | 44 | horizon $T$ | finite horizon $H$ | $H$ = chunk length |
| 3 | 19 | $\ell(s,a)$ for the 0/1 cost | $c(s,a)$ | $c$ = conditioning |
| 3 | 33 | step index $k$ | $i$ | agree with Ch.6 |
| 4 | 30, 32 | $Q_\phi$, target $Q_{\bar\phi}$ | $Q(\cdot;\theta)$, $\theta^-$ | §1.1 |
| 4 | 41–42 | actor $\mu_\theta$, critic $Q_\phi$ | actor $\mu_\phi$, critic $Q_\theta$ | §1.1 — **the flip** |
| 4 | 9 | threshold $\delta$ | $\epsilon$ | frees $\epsilon$ |
| 4 | 21 | learning rate $\eta$ | $\alpha$ | $\alpha$ = entropy temperature |
| 5 | 17–22 | $\pi_\theta$ (current), $\pi_{\theta_{\text{old}}}$ (data) | $\pi_{\theta'}$ (new), $\pi_\theta$ (old) | optimized params are always plain $\theta$ |
| 5 | 23 | entropy weight $\alpha$ | $\beta$ | one temperature symbol |
| 5 | 25 | $\delta_{\text{KL}}$ | $\epsilon$ | frees $\epsilon$ |
| 5 | 26 | $\rho_t(\theta)$, $\epsilon_{\text{clip}}$ | $r_t(\theta')$, $\epsilon$ | $r_t$ = reward |
| 6 | 19–25 | $k$, $K$, $\beta_k$, $\alpha_k$, $\bar\alpha_k$ | $i$, $T$, $\beta_i$, $\alpha_i$, $\bar\alpha_i$ | §1.2 |
| 6 | 24 | fresh noise $\epsilon'$ | $z$ | $z$ = latent |
| 6 | 25 | $\mathcal{K}=\{k_1,\dots,k_M\}$ | $\tau=\{t_1,\dots,t_K\}$ | $\tau$ = trajectory |
| 6 | 28–30 | $\mathbf{a}^k_{t:t+H}$, $o_t$ | $A_t^k$, $O_t$ | chunk notation |
| 6 | 31–35 | $\lambda$, $v_\theta(x_\lambda,\lambda)$ | $t$, $v_\theta(x_t,t)$ | $t$ = environment time |
| 7 | 26 | $\tau_c$ | $\tau$ | $\tau$ = trajectory |
| 7 | 34 | chunk length $H$, $\mathbf{a}_{t:t+H}$ | $k$, $a_{t:t+k}$ | $k$ = denoising step |
| 9 | 17 | $\pi_\theta(a_t\mid s_t,s_g)$ ✓ | same | no change — the anchor for goal-conditioned BC |
| 10 | 35 | group size $N$, $\hat A_i$, $\rho_i$, $\epsilon_{\text{clip}}$, $\beta$ | $G$, $\hat A_i$ ✓, $\rho_i$ ✓, $\varepsilon$, $\beta$ ✓ | $G$ = return |

Rows marked ✓ are places where the slide already agrees with the book — listed so Phase 9 does
not "fix" them.

---

## 8. Typography and formatting rules

- **Vectors and matrices bold** where the distinction carries weight: $\mathbf{T}$, $\mathbf{J}$,
  $\mathbf{a}_{t:t+H}$, $\mathbf{r}$ (the vector of group rewards in Ch.10). Scalars italic.
  States and actions stay light ($s_t$, $a_t$) because the lectures never bold them and doing so
  book-wide would add noise to hundreds of expressions.
- **Sets and spaces calligraphic**: $\mathcal{S}$, $\mathcal{A}$, $\mathcal{D}$, $\mathcal{B}$,
  $\mathcal{C}$, $\mathcal{K}$, $\mathcal{T}$, $\mathcal{L}$. Number sets blackboard:
  $\mathbb{R}$, $\mathbb{T}^2$, $\mathbb{E}^2$.
- **Operators upright**: $\mathrm{softmax}$, $\mathrm{clip}$, $\mathrm{sg}$, $\mathrm{enc}$,
  $\mathrm{dec}$, $\mathrm{KL}$ inside $D_{\mathrm{KL}}$, $\arg\max$, $\mathbb{E}$.
- **Estimates carry hats**: $\hat a$, $\hat A_i$, $\hat x_0$, $\hat\epsilon$. **Targets and
  frozen copies carry overbars**: $\bar\phi$, $\bar\alpha_k$, $\bar\epsilon$. Never both.
- **Time subscript, process superscript**: $\mathbf{a}^k_{t:t+H}$ reads "chunk from $t$, denoising
  step $k$". Keep this order everywhere the two indices meet.
- **Conditioning bar** is $\mid$ with thin spacing ($a \mid s$), never a plain `|`.
- **Model names upright, policies italic**: $\pi_0$ (model) vs $\pi_\theta$ (policy);
  RT-2-X, π₀-FAST, Octo, CrossFormer in text face.
- **Numbers**: thin space as thousands separator in text (1 700 hours) but plain in tables;
  percentages as printed on the slide; approximate chart reads always prefixed "≈" and flagged as
  read from a figure, never given false precision.

---

## 9. Symbols the book deliberately does **not** use

- $x/u/c$ for state/action/cost (Pontryagin's optimal-control convention). Ch.2 mentions it once,
  with $r(s,a) = -c(x,u)$, then the book stays on Bellman's $s/a/r$ — as the course does.
- $\theta^-$ for target networks (Ch.4 footnotes it as DQN's own notation).
- $A_t$ for an action chunk, $O_t$ for an observation, $G$ for a group size, $r_t(\theta)$ for a
  ratio, bare $\tau$ for a temperature or a step subset. Each collided with something reserved.
- Bold state/action vectors, per above.
- New symbols in Ch.11: it is a prose chapter and adding notation there would be inventing
  content the lecture does not have.

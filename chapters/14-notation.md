# Notation {.unnumbered}

\markboth{Notation}{Notation}

The lectures this book is compiled from are not internally consistent about symbols. That is normal in a lecture series, where each session stands alone, and unworkable in a book, where Chapter 5's critic has to be the same object as Chapter 4's. This appendix records the convention used throughout, the places where a symbol is deliberately reused, and — for readers checking the book against the recordings — every point at which the book writes a different symbol from the one on screen.

Two rules govern everything below. **The slides are the authority on content; this table is the authority on symbols.** And **a symbol means one thing per chapter**, with the handful of surviving exceptions listed in §Deliberate reuse.

## The two collisions worth knowing about {.unnumbered}

### Actor and critic {.unnumbered}

The lectures use $\theta$ and $\phi$ in opposite senses in different places: the deep Q-network's parameters are $\theta$, DDPG's actor is $\phi$ and its critic $\theta$, the policy-gradient lecture's policy is $\theta$ and its critic $\phi$, and the generative-model lecture's decoder is $\theta$ and its encoder $\phi$.

This book resolves it in the direction that four of those five already agree with:

> **$\theta$** parameterizes the model that produces what gets deployed — the policy, the actor, the decoder, the noise predictor, the velocity field.
> **$\phi$** parameterizes the model that scores or infers — the critic ($Q_\phi$, $V_\phi$), the encoder or inference network ($q_\phi$).

An **overbar** always marks a frozen or slowly-updated copy: $\bar\phi$ is a target critic, $\bar\alpha_k$ a cumulative product held fixed by the schedule. Only Chapter 4's DDPG had to be flipped to comply, and the split has a reading that is easier to remember than a rule: *deployed model $\theta$, helper $\phi$.*

### The diffusion step index {.unnumbered}

The lectures index the denoising process with $i$, with $k$, and with $t$ in different places, and use $t$ for continuous flow time. But $t$ is the environment timestep everywhere else in the book, and $i$ is a generic enumeration index.

> **$k \in \{0,1,\dots,K\}$** is the discrete denoising step. **$k=0$ is the clean sample and $k=K$ is pure noise.**
> **$\lambda \in [0,1]$** is continuous flow time, with the flow-matching literature's orientation kept: **$\lambda = 0$ is noise and $\lambda = 1$ is data.**

The choice of $k$ was decided by the one expression in which both indices appear, the action chunk $\mathbf{a}^k_{t:t+H}$ — environment time as a subscript range, denoising step as a superscript.

> **Direction warning.** $k$ counts **up into noise**; $\lambda$ counts **up into data**. They run opposite ways. Both orientations are kept because both are what their literatures use and re-orienting either would break every equation a reader might look up. The bridge is $\lambda \leftrightarrow 1 - k/K$.

## Core symbols {.unnumbered}

### Decision problems, from Chapter 2 onward {.unnumbered}

| Symbol | Meaning |
|---|---|
| $s$, $s_t \in \mathcal{S}$ | state; state space |
| $o$, $o_t$ | observation — a lossy function of the state |
| $s_g$ | goal state, supplied as a goal image or a language instruction |
| $a$, $a_t \in \mathcal{A}$ | action; action space |
| $\mathbf{a}_{t:t+H}$ | action chunk of length $H$ beginning at time $t$ |
| $r(s,a)$, $r_t$ | reward function; the realized reward at step $t$ |
| $R(\tau)$ | total return of a trajectory |
| $G$, $G_t$ | return; return from step $t$ onward |
| $\gamma \in [0,1)$ | discount factor — reserved, never anything else |
| $\mathcal{P}$, $P(s'\mid s,a)$ | transition kernel; transition probability |
| $\rho_0(s_0)$ | initial-state distribution |
| $M = \langle\mathcal{S},\mathcal{A},\mathcal{P},\mathcal{R}\rangle$ | a Markov decision process |
| $\tau$ | trajectory — reserved |
| $T$ | task or episode horizon, in steps |
| $H$ | action-chunk length |
| $\pi$, $\pi_\theta(a\mid s)$, $\pi^*$ | policy; parameterized policy; optimal policy |
| $J(\theta)$ | expected-return objective |
| $V^\pi(s)$, $V^*(s)$ | state-value function; optimal value |
| $Q^\pi(s,a)$, $Q^*(s,a)$ | action-value function; optimal action-value |
| $A^\pi(s,a)$ | advantage, $Q^\pi - V^\pi$ |
| $\hat A_i$ | estimated, group-relative advantage of sample $i$ |
| $\mu_\theta(s)$ | deterministic actor |
| $\mathcal{D}$ | dataset of demonstrations |
| $\mathcal{B}$ | experience-replay buffer |
| $\eta$ | learning rate or step size |
| $\alpha$ | entropy temperature |
| $H(\pi)$ | entropy of a policy |
| $\rho_t(\theta)$ | probability ratio, $\pi_\theta(a_t\mid s_t)/\pi_{\theta_{\text{old}}}(a_t\mid s_t)$ |
| $\epsilon_{\text{clip}}$ | clip range for PPO and GRPO, typically 0.2 |
| $\delta_{\mathrm{KL}}$ | trust-region bound for TRPO |
| $\delta$ | convergence threshold for value iteration |
| $b$ | policy-gradient baseline |
| $N$ | number of samples, rollouts, or group members |
| $D_{\mathrm{KL}}(p\,\|\,q)$ | Kullback–Leibler divergence |

### Rigid bodies and control, Chapter 2 {.unnumbered}

| Symbol | Meaning |
|---|---|
| $q \in \mathbb{R}^n$ | joint configuration, components $q_1,\dots,q_n$ |
| $\mathbf{T}^{A}_{B}$ | homogeneous transform of frame $B$ expressed in frame $A$ |
| $SE(2)$, $SE(3)$, $SO(n)$, $\mathbb{T}^2$ | the planar and spatial Euclidean groups, the rotation group, the torus |
| $x \in SE(3)$ | end-effector pose |
| $\mathcal{C}$, $X$ | configuration space; task space |
| $\mathbf{J}(q)$ | kinematic Jacobian, $\partial f/\partial q$ |
| $e(t)$, $u(t)$ | tracking error; control signal |
| $K_p, K_i, K_d$ | PID gains |
| $f_c$, $\Delta t = 1/f_c$ | control frequency in hertz; control period |
| $\lambda \in [0,1]$ | normalized progress along a path |

### Generative models, Chapter 6 onward {.unnumbered}

| Symbol | Meaning |
|---|---|
| $x$, $x_0$ | a data sample; the clean sample in a diffusion process |
| $p_{\text{data}}(x)$, $p_\theta(x)$ | the data distribution; the model |
| $z$ | latent variable — reserved |
| $q_\phi(z\mid x)$, $p_\theta(x\mid z)$ | encoder or posterior; decoder |
| $p(z) = \mathcal{N}(0,\mathbf{I})$ | prior |
| $\epsilon \sim \mathcal{N}(0,\mathbf{I})$ | standard-normal noise |
| $\epsilon_\theta(x_k,k,c)$ | noise predictor |
| $\epsilon'$ | fresh noise re-injected by a sampler |
| $k \in \{0,\dots,K\}$ | denoising step; $K$ the number of steps |
| $\beta_k$, $\alpha_k = 1-\beta_k$, $\bar\alpha_k = \prod_{j\le k}\alpha_j$ | noise schedule and its cumulative products |
| $\mathcal{K}$ | the DDIM subset of steps |
| $\sigma_k$ | sampler noise scale |
| $c$, $\emptyset$ | conditioning input; the null condition |
| $w_{\text{cfg}}$ | classifier-free guidance scale |
| $\lambda \in [0,1]$, $v_\theta(x_\lambda,\lambda)$ | flow time; velocity field |
| $C = \{e_1,\dots,e_K\}$, $z_e$, $z_q$ | codebook; encoder output; quantized latent |
| $\mathrm{sg}[\cdot]$ | stop-gradient — identity forward, zero backward |
| $\mathcal{L}$ | a loss; superscripts name it |

### Sequence models, Chapter 7 onward {.unnumbered}

| Symbol | Meaning |
|---|---|
| $x_{1:t}$ | a token sequence |
| $h_t$ | recurrent or deterministic hidden state |
| $Q, K, V$ | attention query, key and value matrices — Chapter 7 only |
| $d$, $a_{ij}$ | attention head dimension; attention weight from position $i$ to $j$ |
| $\mathrm{PE}(i)$, $b(i-j)$ | absolute positional encoding; relative positional bias |
| $\tau_c$ | contrastive temperature |
| $s_{ij}$ | cosine similarity of pair $(i,j)$ |
| $w_i = \exp(-m i)$ | temporal-ensemble weight, decay rate $m$ |
| $\mathcal{T}_T$, $\mathcal{T}_o$ | task-token and observation-token groups |
| $z_t$ | latent state — a world model's stochastic state, a latent action code |

## Deliberate reuse {.unnumbered}

Five symbols carry more than one meaning. Each is disambiguated by context and by a note in the text at first use.

**$\lambda$** is normalized progress along a path (Chapter 2) and continuous flow time (Chapter 6). They never appear in the same chapter and mean structurally the same thing: fractional progress from one end of something to the other. Each chapter states which end is which.

**$Q$, $K$, $V$** are attention matrices in Chapter 7 and value functions elsewhere. Three cues separate them: attention's appear as unsubscripted capitals inside matrix products such as $QK^\top$; the value functions always carry arguments or a parameter subscript, as in $Q_\phi(s,a)$ or $V^\pi(s)$; and they live in different chapters. Renaming attention's was rejected because every paper and every reader uses them.

**$\beta$** is the diffusion noise schedule, always subscripted as $\beta_k$, and the KL penalty weight in the GRPO objective, always bare and multiplying a divergence.

**$\epsilon$** is standard-normal noise almost everywhere. Two chapter-local exceptions: Chapter 3's per-step error probability in the $O(\epsilon T^2)$ bound, kept because the imitation-learning literature is unanimous and no Gaussian noise appears in that chapter; and "$\epsilon$-greedy" in Chapter 4, which is the name of an algorithm. The PPO clip range and TRPO bound were given subscripts specifically so they would not join this list.

**$c$** is a conditioning input. Chapter 2's Kutzbach formula uses $c_i$ for the constraints a joint imposes and Chapter 5's full PPO objective uses $c_1, c_2$ as loss coefficients; both are subscripted and chapter-local. Chapter 3's zero-one imitation cost is written $\ell(s,a)$ to stay clear of all three.

$\mu$ and $\sigma$ always mean a mean and a standard deviation, of whatever object the subscript indicates, and need no disambiguation.

Finally: **$\pi_0$ and $\pi_{0.5}$ are the names of models**, not policies indexed by a parameter value. They appear upright and never inside a policy expression.

## Where this book differs from the slides {.unnumbered}

Readers following along with the recordings should expect the following substitutions. In each case the equation is otherwise as it appears on the slide, and the change is footnoted in the text at the point of use.

| Chapter | Book writes | Slide writes | Reason |
|---|---|---|---|
| 2 | $L(q)$, $q \leftarrow q - \eta\,\mathbf{J}(q)^\top e$ | $L(\theta)$, $\theta_{\text{new}} = \theta_{\text{old}} - \alpha J(\theta)^\top e$ | $\theta$ is reserved for model parameters; $J$ for the objective |
| 2 | $q_1,\dots,q_7$ | $\theta_1,\dots,\theta_7$ | same |
| 2 | $\lambda_i = i/N$ | $s_i = i/N$ | $s$ is the state |
| 2 | $\int_0^t e(t')\,\mathrm{d}t'$ | $\int_0^t e(\tau)\,\mathrm{d}\tau$ | $\tau$ is a trajectory |
| 2 | horizon $T$ | finite horizon $H$ | $H$ is the chunk length |
| 3 | $\ell(s,a)$ | $c(s,a)$ | $c$ is a conditioning input |
| 3 | denoising step $k$ | $i$ | agreement with Chapter 6 |
| 4 | $Q_\phi$, target $Q_{\bar\phi}$ | $Q(\cdot\,;\theta)$, $\theta^-$ | the actor/critic convention |
| 4 | actor $\mu_\theta$, critic $Q_\phi$ | actor $\mu_\phi$, critic $Q_\theta$ | **the flip** |
| 4 | threshold $\delta$ | $\epsilon$ | frees $\epsilon$ for noise |
| 4 | learning rate $\eta$ | $\alpha$ | $\alpha$ is the entropy temperature |
| 5 | $\pi_\theta$ current, $\pi_{\theta_{\text{old}}}$ behind | $\pi_{\theta'}$ new, $\pi_\theta$ old | optimized parameters are always plain $\theta$ |
| 5 | entropy weight $\alpha$ | $\beta$ | one temperature symbol |
| 5 | $\delta_{\mathrm{KL}}$ | $\epsilon$ | frees $\epsilon$ |
| 5 | $\rho_t(\theta)$, $\epsilon_{\text{clip}}$ | $r_t(\theta')$, $\epsilon$ | $r_t$ is a reward |
| 6 | $k$, $K$, $\beta_k$, $\alpha_k$, $\bar\alpha_k$ | $i$, $T$, $\beta_i$, $\alpha_i$, $\bar\alpha_i$ | the step-index convention |
| 6 | fresh sampler noise $\epsilon'$ | $z$ | $z$ is a latent |
| 6 | $\mathcal{K}=\{k_1,\dots,k_M\}$ | $\tau=\{t_1,\dots,t_K\}$ | $\tau$ is a trajectory |
| 6 | $\mathbf{a}^k_{t:t+H}$, $o_t$ | $A^k_t$, $O_t$ | $A$ is the advantage |
| 6 | $\lambda$, $v_\theta(x_\lambda,\lambda)$ | $t$, $v_\theta(x_t,t)$ | $t$ is environment time |
| 7 | $\tau_c$ | $\tau$ | $\tau$ is a trajectory |
| 7 | chunk length $H$ | $k$ | $k$ is the denoising step |
| 10 | group size $N$ | $G$ | $G$ is the return |

Two conventions the lectures use and this book does not: **$x/u/c$** for state, action and cost, the optimal-control convention, which Chapter 2 mentions once and then leaves; and **$\theta^-$** for a target network, which Chapter 4 footnotes as the deep Q-network paper's own notation.

## Typographic conventions {.unnumbered}

Vectors and matrices are bold where the distinction carries weight — $\mathbf{T}$, $\mathbf{J}$, $\mathbf{a}_{t:t+H}$, $\mathbf{r}$ — and states and actions are left light, because the lectures never bold them and doing so book-wide would add noise to hundreds of expressions. Sets and spaces are calligraphic, $\mathcal{S}$, $\mathcal{A}$, $\mathcal{D}$, $\mathcal{B}$, $\mathcal{K}$; number sets are blackboard, $\mathbb{R}$, $\mathbb{T}^2$. Operators are upright: $\mathrm{softmax}$, $\mathrm{clip}$, $\mathrm{sg}$, $\arg\max$, $\mathbb{E}$.

Estimates carry hats — $\hat a$, $\hat A_i$, $\hat x_0$ — and frozen or slowly-moving copies carry overbars — $\bar\phi$, $\bar\alpha_k$. Never both. Where an environment index and a process index meet, time is the subscript and the process is the superscript, as in $\mathbf{a}^k_{t:t+H}$.

Numbers read off a chart rather than printed on it are always prefixed with $\approx$ and identified as such, so that no figure in this book implies more precision than its source has.

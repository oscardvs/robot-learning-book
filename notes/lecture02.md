# Lecture 2 — Robot Control & Markov Decision Processes (raw notes)

- Video: <https://www.youtube.com/watch?v=5-Bb84eTTqQ> (46 min)
- Transcript: `transcripts/02_control_mdp.txt` (7,085 w) · Slides: `slides_png/lecture02/`
  (46 frames) · OCR `slides/lecture02.txt`
- Speaker: Oier Mees. Assigned papers (wk2): Mania et al. 2018 (ARS); Irpan 2018
  (Deep RL Doesn't Work Yet); Pathak et al. 2017 (Curiosity). Guest: Abhishek Gupta.

Two-act lecture. **Act 1 (slides 3–28): classical robot control** — geometry,
kinematics, trajectory generation, PID. **Act 2 (slides 30–45): the MDP** — the
formal language for decision-making that the whole course rests on. Maps to Ch.2.

Sources cited on slides: **Modern Robotics, K. Lynch (2017)** [= Lynch & Park, our
design target] for joints/C-space; Latombe 1991 (motion planning); LaValle 2006
(Planning Algorithms); ABB IRB-120 (workspace).

---

## ACT 1 — Robot control

### Rigid-body motion, SE(2)/SE(3) (slides 3–4)
Motivation [01:00]: robots span quadrupeds, dexterous hands (Rubik's cube), drones —
wildly different morphologies, but all share one job: **turn a high-level goal into
motor torques for that specific body.** A foundation model for robotics needs the
*common language* for all of them.

Assume each body is **rigid** (distance between any two points constant — no squish/
stretch), so you track **one frame** instead of many points. Planar motion → **SE(2)**
(the special Euclidean group in 2D, x, y, θ). Spatial motion → **SE(3)** (x,y,z + roll,
pitch, yaw).

Homogeneous transformation matrices (slide 4):
$$T_{SE(2)} = \begin{bmatrix} \cos\theta & -\sin\theta & x \\ \sin\theta & \cos\theta & y \\ 0 & 0 & 1 \end{bmatrix}, \qquad T_{SE(3)} = \begin{bmatrix} r_{11} & r_{12} & r_{13} & x \\ r_{21} & r_{22} & r_{23} & y \\ r_{31} & r_{32} & r_{33} & z \\ 0 & 0 & 0 & 1 \end{bmatrix}$$
Valid rotation matrices live in the **special orthogonal group**:
$$SO(n) = \{ R \in \mathbb{R}^{n\times n} \mid R^\top R = I,\ \det(R) = 1 \}$$
Spoken sanity check [05:00]: $R^\top = R^{-1}$ (orthogonal) and $\det = 1$ guarantee the
body rotates without stretching — stays a true rigid body. SE(2) = 3 DoF, SE(3) = 6 DoF.

### Chaining transforms (slide 5)
Real robots have a **hierarchy of frames**. Self-driving example: base frame at center
of gravity (where control commands go), lidar/camera on the roof in its own frame. A
pedestrian detected in the sensor frame must be mapped to the base frame:
$$T^{\text{Base}}_{\text{Ped}} = T^{\text{Base}}_{\text{Sensor}} \times T^{\text{Sensor}}_{\text{Ped}}$$
Chain the matrices. The sensor→base transform comes from **sensor calibration** (not
covered) [07:02].

### Articulated bodies (slides 6–9)
Real robots = **articulated rigid bodies** = a chain of coordinate frames. Three parts:
**Link** (one rigid body), **Joint** (connects links), **End-effector** (device on a
link — gripper). Example: LOLA humanoid @ TUM. Chain/multiply frames to find e.g. where
the hand is relative to the torso. Examples: Franka Emika (7-DoF arm), SO-101 (the group-
project robot; simpler but mathematically identical).

**End-effectors** (slide 8), from clean to complex action space:
- **Suction gripper** — binary action (vacuum on/off), cleanest for learning; industrial
  pick-and-place.
- **Parallel gripper** — 1-DoF (width); Franka/SO-101 use this; the one you'll use.
- **Dexterous hand** — 20+ DoF; huge action space.

**Joints** (slide 9, source Lynch 2017): a joint constrains the relative motion of the
two bodies it connects. The one that matters: **revolute (R)** — rotation about one axis
(like an elbow).

### Degrees of freedom + Kutzbach (slide 10)
**DoF** = number of independent parameters needed to fully specify the robot's
configuration/state at any time. Joint DoF & constraints (planar / spatial):

| Joint | dof f | c (planar) | c (spatial) |
|---|---|---|---|
| Revolute (R) | 1 | 2 | 5 |
| Prismatic (P) | 1 | 2 | 5 |
| Helical (H) | 1 | N/A | 5 |
| Cylindrical (C) | 2 | N/A | 4 |
| Universal (U) | 2 | N/A | 4 |
| Spherical (S) | 3 | N/A | 3 |

**Chebychev–Grübler–Kutzbach formula:**
$$\text{dof} = \underbrace{m(N-1)}_{\text{rigid-body freedoms}} - \underbrace{\sum_{i=1}^{J} c_i}_{\text{joint constraints}}$$
$m$ = freedoms of one rigid body (3 planar, 6 spatial), $N$ = number of links (incl. the
ground link), $J$ = number of joints, $c_i$ = constraints imposed by joint $i$.

### Configuration space, workspace, task space (slides 11–17)
- **Configuration space (C-space)** [12:37]: set of all configurations the robot can
  take. Its *topology* depends on the joints. Point on a plane → $\mathbb{E}^2$; **2R arm
  → torus $T^2 = S^1\times S^1$**; etc. (table from Lynch). Why it matters for learning
  [13:40]: a neural-net policy must respect the topology. On a torus, distance isn't a
  straight line — from 356° to 1° the shortest path is **+2°**, not −350°.
- **Workspace** [13:56]: all points the end-effector can physically reach (e.g. ABB
  IRB-120 reach envelope).
- **Obstacles** (slides 13–14): a workspace obstacle maps to a *forbidden region* in
  C-space. 1990s motion planning explicitly built C-space + searched free space — but
  this is **intractable in high dimensions**. Modern robot learning instead learns a
  policy that *implicitly* feels where obstacles are — the core shift from hardcoded
  geometry to learned representations [15:43].
- **Task space** [16:44]: the manifold where the objective naturally lives, *independent
  of embodiment*. Whiteboard-cleaning task space = the board surface $\mathbb{R}^2$,
  whether a humanoid, arm, or drone does it. **If task-space dim < robot DoF →
  redundancy.**

**Question Time (slides 16–17)** — Franka: C-space = 7-D manifold $(\theta_1..\theta_7)$;
workspace = reachable $(x,y,z)$; task space = 6-D end-effector pose $SE(3)$. Redundancy
(7 > 6) → **null-space motion** [18:44]: holding a mug fixed, the elbow can still move
many ways — lets you plan around obstacles.

### Forward vs inverse kinematics (slides 18–21)
- **Forward kinematics** [19:20]: given joints, where is the end-effector?
  $$x = f(q),\quad q \in \mathbb{R}^n,\ x \in SE(3), \qquad f:\mathcal{C}\to X$$
  **Deterministic, but not bijective** (many configs → same pose).
- **Inverse kinematics** [20:12]: given a target pose, what joints get there?
  $$q = f^{-1}(x),\qquad f^{-1}: X \to \mathcal{P}(\mathcal{C})$$
  (maps to a *set* of configs). Often **non-unique or has no analytical solution**. This
  is the problem the course cares about: a policy predicts a target pose; IK finds the
  joint angles $q$.
- **Optimization-based IK** (slide 21) with error $e = f(\theta) - x_{\text{target}}$:
  $$L(\theta) = \tfrac{1}{2}\|f(\theta) - x_{\text{target}}\|^2 \quad\text{(squared L2)}$$
  $$\theta_{\text{new}} = \theta_{\text{old}} - \alpha\nabla_\theta L(\theta), \qquad \nabla_\theta L(\theta) = \Big(\tfrac{\partial f}{\partial\theta}\Big)^\top e$$
  $$\text{Jacobian method:}\quad \theta_{\text{new}} = \theta_{\text{old}} - \alpha\, J(\theta)^\top\big(f(\theta) - x_{\text{target}}\big)$$
  The Jacobian $J = \partial f/\partial\theta$ says how a tiny change in each joint moves
  the end-effector; nudge joints until the target is reached [22:00].

### Trajectory generation (slides 22–26)
IK gives target joints, but the robot can't teleport — interpolate. Example: move SO-101
1 cm in +Y.
- **LERP (linear interpolation)** (slide 23): inputs $q_{\text{start}}, q_{\text{target}}
  \in \mathbb{R}^6$, time $T$, control frequency $f$. Waypoints $N = \lceil T\cdot f\rceil$;
  normalized progress $s_i = i/N \in [0,1]$;
  $$q(s_i) = q_{\text{start}} + s_i\,(q_{\text{target}} - q_{\text{start}})$$
- **Issue with LERP** (slide 24): instant max speed (motors can't do that), **high jerk /
  Dirac-delta accelerations** — stress, vibration. Velocity jumps 0→max→0 in one step.
- **Quintic splines** (slide 25): each joint's trajectory is a 5th-order polynomial
  $$q(t) = a_0 + a_1 t + a_2 t^2 + a_3 t^3 + a_4 t^4 + a_5 t^5$$
  with **6 boundary conditions**: start & end at zero velocity and zero acceleration,
  keeping position. Equivalently $q(s_i) = q_{\text{start}} + (q_{\text{target}} -
  q_{\text{start}})\,f(s_i)$ with **quintic time scaling**
  $$f(s_i) = 10 s_i^3 - 15 s_i^4 + 6 s_i^5$$
  Smooth start/stop, no Dirac spikes. Standard for industry arms (Frankas).

### PID control (slides 27–28)
Even perfect waypoints aren't followed exactly — friction, gravity, air resistance. A
**PID controller** corrects. Tracking error $e(t) = q_{\text{desired}}(t) -
q_{\text{measured}}(t)$.
$$\text{Continuous:}\quad u(t) = K_p\,e(t) + K_i\!\int_0^t e(\tau)\,d\tau + K_d\,\frac{de(t)}{dt}$$
$$\text{Discrete:}\quad u_k = K_p e_k + K_i\sum_{j=0}^{k}(e_j\cdot\Delta t) + K_d\frac{e_k - e_{k-1}}{\Delta t},\quad \Delta t = 1/f$$
Intuition (slide 28, memorable): **P = "spring"** (bigger error → harder pull), **I =
"anti-gravity"** (compensates steady offsets like gravity), **D = "damper"** (stops
overshoot). If control frequency is too low the damper can't react fast enough.

### "Are we done?" (slide 29) — No.
Following a line isn't enough; the robot must *decide which action* to take for a complex,
long-horizon goal in an unpredictable/noisy/unmapped world. That's the ML part.

---

## ACT 2 — Markov Decision Processes

### From control to decision-making (slides 30–33)
Running example [29:00]: **sushi cutting** with a bimanual **ALOHA** robot (14 DoF, high
frequency) — grasp knife, reposition, precise cut. Paper: *The Ingredients for Robotic
Diffusion Transformers*, **Dasari, Mees et al., ICRA 2024**. The low-level PID follows
whatever the policy predicts; we now learn the policy.

A **policy** maps observation→action like a classifier maps image→label. Classifier
$f(y\mid x)$; policy $\pi_\theta(a\mid o)$ (slide 32). $\pi$ = policy, subscript $\theta$
= network weights. Temporal context: at time $t$, observe $o_t$, act $a_t$; integer steps
$t = 0,1,2,\dots$ (could be continuous ms in reality).

**The difference from classification** [32:00]: mislabeling a cat as a dog doesn't change
the cat; choosing a wrong action **changes the world** — turn into a ditch and the next
observation is completely different.

Policies are in general **stochastic** (a distribution over actions); **deterministic**
policies are the special case assigning probability 1 to one action [33:02].

### State vs observation (slides 33–35)
Distinguish **state** $s_t$ (ground truth — exact position, velocity, orientation) from
**observation** $o_t$ (what a sensor sees — a lossy mapping of state). Key point: *no
matter the weather or visibility, the state does not change* — a clear day and a snowy
night give different observations of the same state. Robotics usually works with
observations = **partial** information → policy fully observable $\pi_\theta(a_t\mid s_t)$
vs partially observable $\pi_\theta(a_t\mid o_t)$ (slide 33).

### Markov property (slide 36)
**If you know $s_2$, then $s_1$ is not needed to determine $s_3$.** The state already
holds all information about the world, so the past adds nothing. Transition (dynamics)
function $p(s_{t+1}\mid s_t, a_t)$. State→observation is a lossy mapping. (Even knowing
the state, the future can be hard to predict due to stochasticity.)

### Notation history (slide 37)
This course uses **$s$/$a$/$r$** (states/actions/reward), from **Bellman's** dynamic
programming (1950s–60s). Optimal-control theory (Pontryagin) uses **$x$/$u$/$c$** (state/
action/cost) with $r(s,a) = -c(x,u)$ — same thing, inverse sign. (The PID section used
$u$ for the control action, the optimal-control convention.)

### The MDP (slide 38)
$$M = \langle \mathcal{S}, \mathcal{A}, \mathcal{P}, \mathcal{R} \rangle$$
- $\mathcal{S}$ **state space**, $s_t \in \mathcal{S}$
- $\mathcal{A}$ **action space**, $a_t \in \mathcal{A}$
- $\mathcal{P}$ **transition probability**, $s_{t+1} \sim \mathcal{P}(\cdot\mid s_t, a_t)$
- $\mathcal{R}$ **reward function**, $r:\mathcal{S}\times\mathcal{A}\to\mathbb{R}$, $r_t = R(s_t, a_t, s_{t+1})$

Why the MDP matters [36:xx]: one unified framework lets us treat a 27-DoF humanoid
exactly like a chess-playing agent — same learning algorithms.

### The four components in detail (slides 39–42)
- **State space** (slide 39): **discrete** (chess — no halfway between squares) vs
  **continuous** (robot joint angles, real numbers). Continuous ⇒ can't tabulate every
  state's value ⇒ need **function approximators / neural nets** [38:01].
- **Action space** (slide 40): **discrete** (keyboard control) vs **continuous** (VR
  teleop, smoother).
- **Transition model** (slide 41): **deterministic** $s_{t+1} = f(s_t, a_t)$ (turn wheel
  5° → predictable arc) vs **stochastic** $s_{t+1} \sim \mathcal{P}(\cdot\mid s_t, a_t)$
  (ice, worn tires, sensor noise, motor overshoot). Robotics uses stochastic.
- **Reward function** (slide 42): **sparse** (1 if grasped, 0 otherwise — only at
  episode end / on condition) vs **dense** (e.g. Euclidean distance from end-effector to
  target — accelerates learning greatly). Paper + PhD video: *Affordance Learning from
  Play for Sample-Efficient Policy Learning*, **Borja, Mees et al., ICRA 2022** — sparse
  reward fails, dense reward learns pick-and-place. (Sparse might work eventually with
  much longer training.)

### Trajectories and horizon (slides 43–44)
A **trajectory** $\tau = (s_0, a_0, s_1, a_1, \dots, s_T)$. Its probability under policy
$\pi$:
$$p_\pi(\tau) = \underbrace{\rho(s_0)}_{\text{initial state}} \prod_{t=0}^{T-1} \underbrace{\pi(a_t\mid s_t)}_{\text{policy}}\, \underbrace{P(s_{t+1}\mid s_t, a_t)}_{\text{transition}}$$
"How likely is this sequence under $\pi$": start distribution × (policy × physics) at
every step [42:01].

**Horizon** (slide 44): **finite-horizon** — strict step limit $H$ (5 s to grab a moving
object; the robot may get "desperate" near the deadline and gamble). **Infinite-horizon**
— continues forever ($T=\infty$) or until a terminal state (navigation, long-term tasks).
Infinite sums of reward can't be compared, so use a **discount factor** $\gamma \in [0,1)$:
near rewards weigh more than distant ones.

### The learning objective (slide 45) — the payoff of the whole lecture
Accumulated reward (return):
$$G = \sum_{t=0}^{T-1} r_t \qquad\text{or}\qquad G = \sum_{t\ge 0} \gamma^t r_t$$
Because the world is stochastic, we optimize the **expected return**:
$$J(\pi) = \mathbb{E}_{\tau\sim p_\pi(\tau)}\!\Big[\sum_{t=0}^{T-1} r_t\Big] \quad\text{or}\quad J(\pi) = \mathbb{E}_{\tau\sim p_\pi(\tau)}\!\Big[\sum_{t\ge 0}\gamma^t r_t\Big]$$
(average return over all trajectories the policy could produce.) **Optimal policy:**
$$\pi^* = \arg\max_\pi J(\pi)$$
This objective is what imitation and reinforcement learning both try to reach — sets up
Chs 3–5. [This is the same $J(\pi)$ that opens Lecture 4 slide 7.]

---

## Definitions for glossary
Rigid body; SE(2)/SE(3); SO(n); homogeneous transform; link/joint/end-effector; revolute
joint; degrees of freedom; Kutzbach formula; configuration space (+ topology/torus);
workspace; task space; redundancy / null-space motion; forward/inverse kinematics;
Jacobian; LERP; quintic spline; PID (P/I/D); policy (stochastic/deterministic); state vs
observation; Markov property; MDP tuple; transition/dynamics function; sparse vs dense
reward; trajectory; horizon (finite/infinite); discount factor $\gamma$; return; expected
return $J(\pi)$; optimal policy.

## Systems / datasets / papers named
- Robots: LOLA humanoid (TUM), Franka Emika 7-DoF, SO-101, bimanual ALOHA (14 DoF),
  ABB IRB-120, quadrupeds/drones/dexterous hands (intro montage).
- Books (sources): **Modern Robotics, Lynch & Park 2017**; Latombe 1991; LaValle 2006.
- Papers: Dasari, Mees et al., *Ingredients for Robotic Diffusion Transformers*, ICRA
  2024 (sushi/ALOHA); Borja, Mees et al., *Affordance Learning from Play*, ICRA 2022
  (sparse vs dense reward).
- People: Richard Bellman (DP, s/a/r), Lev Pontryagin (optimal control, x/u/c).

## Student Q&A
Q&A deferred to end/paper discussion; the in-lecture "Question Time" (slides 16–17) is the
Franka C-space/workspace/task-space exercise, answered on the slide.

## Figures worth reproducing
- `slide_004.jpg` — SE(2)/SE(3) transforms + SO(n) (notation anchor).
- `slide_010.jpg` — DoF table + Kutzbach formula.
- `slide_011.jpg` — C-space topology table (torus etc., from Lynch).
- `slide_024.jpg` / `slide_026.jpg` — LERP vs quintic velocity/accel profiles (great
  side-by-side for "why this shape").
- `slide_028.jpg` — PID spring/anti-gravity/damper cartoon.
- `slide_038.jpg` — MDP agent–environment loop + tuple.
- `slide_043.jpg` — trajectory probability factorization.
- `slide_045.jpg` — the learning objective (return → expected return → optimal policy).

## [UNCLEAR] / caveats
- None major; equations were legible in the reconstructed frames. Slide 2 shows the
  (redacted) course login/pwd — do not reproduce.
- Kutzbach: slide writes $m(N-1) - \sum c_i$; $m$=3 planar / 6 spatial. Standard form.

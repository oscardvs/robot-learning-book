# Guest lectures — raw notes (Phase 7)

**Status: transcripts read for all 10 available talks (2026-07-26).** Slide reconstruction
running into `slides_png/guestNN_<slug>/`. This file is the working note; the chapters are
`chapters/12-guest-lectures-i.md` and `chapters/13-guest-lectures-ii.md`.

## Sourcing outcome

| # | Week | Speaker | Talk | Transcript | Slides |
|---|---|---|---|---|---|
| 1 | 2 | Abhishek Gupta (U. Washington) | Simulation for Robotic Manipulation, without the Pain | 6,192 w | reconstructed |
| 2 | 3 | Danfei Xu (Georgia Tech & NVIDIA) | Human Data as a Foundation for Robot Learning | 6,134 w | reconstructed |
| 3 | 4 | Aviral Kumar (CMU & Google DeepMind) | How to Replicate the LLM Recipe in Robot Learning | 7,519 w | reconstructed |
| 4 | 5 | Andrew Wagenmaker (UC Berkeley) | Robots That Learn From Experience | 6,957 w | reconstructed |
| 5 | 6 | Cheng Chi (Sunday Robotics) | Robotics Beyond Algorithms | 6,563 w | reconstructed |
| 6 | 7 | Ted Xiao (Project Prometheus) | Three Eras of Robot Learning | 7,112 w | reconstructed |
| 7 | 8 | Scott Reed (NVIDIA GEAR) | What is the right Backbone for Embodied Agents? | 5,768 w | reconstructed |
| 8 | 9 | Quan Vuong (Physical Intelligence) | π0.7, A Generalist Model with Emergent Capabilities | 5,667 w | reconstructed |
| 9 | 10 | Archit Sharma (Google DeepMind) | Scaling Test-Time Compute at the Frontier | 5,075 w | reconstructed |
| 10 | 11 | Lucas Beyer (Meta Superintelligence Labs) | Vision in the Age of LLMs | 11,874 w | reconstructed |
| — | 12 | **Dieter Fox (UW / NVIDIA)** | — | **NONE** | **NONE** |

**Total: 68,861 cleaned words across 10 talks.** De-dup ratio 2.92–2.99× (matches the main
lectures' 2.96–2.98×); speaking rate 153–221 wpm, above the main lectures' 135–156 but a natural
pace for a 30-minute conference-style talk, and nowhere near the ~400 wpm that would indicate a
de-duplication failure.

**Dieter Fox cannot be sourced.** Playlist entry 11 (`xvHdw0Cm_RY`) is a *private* video;
`yt-dlp` reports "1 unavailable video is hidden" and the course page lists no recording for
week 12. Per hard rule #3 this is reported, not papered over, and no week-12 section is written.

**No guest slides are published anywhere.** Checked: the course page (lists guests, links no
decks), each video description (links only the course website), and the course GitHub
`mees-robot-learning-course/ethz-course-2026` (homework only — `hw1_pytorch_tutorial`,
`hw2_robot_control_mdps`, `hw3_imitation_learning`, `hw4_reinforcement_learning`; zero PDFs).
Decks are therefore reconstructed from the recordings with `scripts/extract_slides.py`.

**Extraction caveat specific to the guest talks.** These are Zoom screen-shares, not clean
full-screen captures: a live speaker webcam sits over the top-right corner, and some talks add a
column of participant thumbnails down the right edge. Those pixels change every frame, so
`--ignore 0.85,0.0,1.0,1.0` excludes the right-hand 15% from change detection (the saved frame is
the untouched original). Consequence for the book: **a slide title running to the right edge can
be partly occluded by the speaker tile** — where that happens and the words cannot be recovered,
mark `[UNCLEAR]` rather than guessing.

---

## Caption-mangling checklist — verify each against the slide image before it enters the book

The auto-captions are worse on these talks than on the main lectures, because most speakers are
remote and several are non-native or fast. Confirmed manglings, by talk:

- **g01 Gupta** — "weird lab" is *correct* (Washington Embodied Intelligence and Robotics
  Development); "UMi" → UMI; "grounded SAM" ✓; "COLMAP" ✓.
- **g02 Xu** — "Ego Mimics"/"Eagle mimic"/"Google makes" → **EgoMimic**; "Eagle Bridge" →
  **EgoBridge**; "Project Aura"/"product Aria" → **Project Aria**; "Dan Fei"/"Dunfei" → Danfei;
  "Disney embedding map" → almost certainly a **t-SNE** embedding plot — VERIFY; "two six-arm" →
  unclear, likely a 6-DoF arm pair — VERIFY; "six space manipulation" → likely "fixed-base
  manipulation" — VERIFY; "Emma" → **EMMA**; "EgoVerse" ✓ (~1,300 h, growing).
- **g03 Kumar** — "Avil" → Aviral; "Sergey Levvin" → Sergey Levine; "edgy dagger"/"edg dagger" →
  **HG-DAgger**; "gshian" → Gaussian; "open VA"/"BLA"/"PLA" → OpenVLA / VLA; "bmanual" →
  bimanual; "coot" → chain of thought; "rack" → the method's name, VERIFY spelling on slide;
  "Aloha Unleashed" ✓ (89 h); "bite dance" → ByteDance (4B VLA).
- **g04 Wagenmaker** — "DS RL" → **DSRL** (diffusion steering RL); "Pi 0.6 star" → π0.6-star;
  "Tiffany" is an audience name; method boosts <50% → 90–100% in 30–90 min online.
- **g05 Chi** — "Chong" → Cheng; "UV"/"uv sync" → the `uv` Python tool (confirmed on a probe
  frame); "Peter Ross Hendrick" → almost certainly **Russ Tedrake's Underactuated Robotics** —
  VERIFY; "Curran's lab" → **Shuran Song's** lab — VERIFY; the advisor who moved Columbia →
  Stanford taking Chi along is **Shuran Song**, but the captions garble this into "Peter Allen …
  her", so DO NOT name the advisor unless the slide does — the slide's self-intro page should
  settle it; "Dimitri Berenson" → Dmitry Berenson ✓ (Michigan); "memory developer" → the term
  Sunday uses for its data collectors, VERIFY (sounds like "member developer"); "FATP" ✓ (final
  assembly, test and pack).
- **g06 Xiao** — "Poly X"/"Polly" → **PaLI-X**; "Vision Net" → EfficientNet (RT-1's encoder) —
  VERIFY; "film cross-attention" → **FiLM**; "Open Cross Modal Agent" → **Open X-Embodiment**;
  "Unitronics" → **Unitree**; "Biomech Franka" → bimanual Franka; "bodyment" → embodiment;
  "Brace dataset" → **BridgeData**; "Dana Banana" → Nano Banana; "VIO" → **Veo**; "ejected
  coding" → agentic coding; "R farms" → arm farms; "pie 0.6" → π0.6; "Anuka" → an NVIDIA
  researcher, name not recoverable — do not guess; "Dreamer 0" → VERIFY, see g07.
- **g07 Reed** — "when"/"whens" → **WAM / world action models** (systematic); "group models" →
  **GR00T**; "root animal 5" → GR00T N1.5 — VERIFY; "Dream Zero" → VERIFY exact name (both Reed
  and Xiao name it; likely one word); "Jeppa" → **JEPA**; "five is tracking the wrist" → **Vive**
  trackers; "Manus glove" ✓; "Ego4D" ✓ (20 K h in-the-wild, 50 h sensorized); "Yuka" → Yuke Zhu
  — VERIFY; "TRI large behavior model" ✓ (**LBM**).
- **g08 Vuong** — "PILE-7"/"Pilot 7"/"PIO 7"/"PyTorch 7"/"Pyro 7"/"prior 07" → **π0.7**
  (systematic — the single worst mangling in the set); "RL token" → a prior PI work on speed,
  VERIFY name; "the FRIA sweet potato and the FRIA" → **air fry / air fryer**; "Yumi" → **UMI**;
  "biome URF" → bimanual UR5; "Henry Christensen" → Henrik Christensen; "Howie Su" → Hao Su;
  "fi.website" → the Physical Intelligence site; "emotional capability" → **emergent
  capability**; "word model" → world model.
- **g09 Sharma** — "Arkid"/"Arkit" → Archit; "competition"/"computer"/"computing" → **compute**
  (systematic); "influence time"/"infant computer" → inference compute; "Amy 2025" → **AIME
  2025**; "Code Bench" → LiveCodeBench — VERIFY; "GRPL" → **GRPO**; "paralyzed COT" → parallel
  chain of thought; "agenda coding" → agentic coding; "Cloud Code" → Claude Code; "Gemini
  DeepMind" (in the Codeforces claim) → **Gemini Deep Think**; "Alethia" → VERIFY, a named
  research agent.
- **g10 Beyer** — "Lucas Byer" → Beyer; "Aken" → **Aachen**; "Russ"/"Ross" → **ROS**;
  "cy cichlid"/"cigip"/"siglet" → **SigLIP**; "polygeemma"/"polymer"/"polyma"/"balma" →
  **PaliGemma**; "imageet"/"hmageet" → ImageNet; "imagine a top five" → ImageNet top-5; "reset" →
  ResNet; "bit kind of transfer" → **BiT (Big Transfer)**; "Lion" → **LAION**; "can tower" → CN
  Tower; "Mil tower in Thran" → **Milad Tower, Tehran**; "MS Koko"/"cocoa" → MS COCO; "VQVE" →
  **VQ-VAE**; "like24" → 1024 bins; "array tuning"/"arune" → RL tuning; "France" → **François
  Chollet** (fluid intelligence); "JA"/"joint in relative architecture" → **JEPA**; "the main" →
  LeCun; "discussion" (in the deployment passage) → **distillation**; "broker" → blocker; "20
  territory tutorials" → "20 crappy tutorials"; "dog ball" → an early GAN sample, VERIFY;
  "negro startup" → an unrecoverable garble of a company name in an aside — **do not reproduce**.

---

## g01 — Abhishek Gupta, "Simulation for Robotic Manipulation, without the Pain" (week 2)

Framing: the group's goal is robots in messy unstructured environments; sense–plan–act needs
per-domain cost/model/primitive engineering. Robotics 1.0 (sense–plan–act) → robotics 2.0
(end-to-end learning). Running joke and organizing device: "I'm a lazy potato", i.e. every
section removes a category of human effort.

Data argument: vision/language grew MNIST → ImageNet → LAION, Twitter-sentiment → Common Crawl,
and crucially that growth was **passive** — nobody typed the internet in on purpose. Robotics has
no passive stream because too few robots are deployed. Teleoperation (UMI, VR rigs) is better
than before but still active, and covering K environments costs money, time and travel.
Hence **off-domain data**: relevant but not literally on a robot — generative models, large-scale
video, and (today's topic) simulation. Blunt caveat he states up front: **"off-domain data is
wrong data"** — never as good as expert on-robot data, but still useful.

Why simulation: cheaper *in principle* (compute not man-hours), privileged information, easy
resets, easy rewards, faster than real time, massively parallel — and he credits ETH for much of
the legged/humanoid progress that came from it. But the hidden cost is the pipeline: an artist or
PhD student builds a scene in Blender for many hours; then getting behaviour in it takes many
more hours; then the sim doesn't match reality so you system-identify it. Three sections, each
deleting one of those costs.

**1. Real-to-sim: generating environments.** Walk a kitchen with a short video, get out not a
static mesh but a **fully interactive, articulated scene** — movable microwave, cabinets,
dishwasher. Method: Gaussian splatting for geometry+appearance from multi-view images/video, then
foundation models (**Grounded SAM**, and GPT-4 at the time) to segment parts, decide what they
are (cabinet/drawer/dishwasher/fridge) and articulate them with hinges and joints, iterating.
Only the camera images from an iPhone are used — not its depth or lidar; **COLMAP** recovers
camera poses. Result: same procedure across many kitchens; days of effort → minutes.

**Evaluation is the payoff he stresses.** Real-robot evaluation needs a human running trials over
and over. With photorealistic reconstructions you can evaluate *policies trained in the real
world* inside simulation. They rebuilt scenes at UW and Princeton and ran Physical Intelligence
policies (trained on real data only) in them. Metrics: **Pearson correlation** (want high) and
**MMRV / rank violation** (want low); sim-real agreement was good but not perfect. The point is
ordering — "things that are better in simulation would also be better in the real world". Not
zero-shot: you must mix a little simulation data into training so the model adapts to sim; less
realistic scenes worked much worse.

**2. RL without reward design: resets as the privilege.** Behaviour generation normally needs
either VR/glove teleoperation or a hand-tuned reward with many weighted terms. Students Tyler and
Patrick asked whether simulation's *privileges* can replace that — resets, privileged state,
cheap samples — and focused on **resets**: you cannot teleport the real world, you can teleport
the simulator. Exploration is a needle-in-a-haystack search from a fixed start; instead reset
*near the goal*, then one step back, then two, and so on. Reset states include partial
assemblies and partial grasps, generated programmatically. Result: contact-rich behaviour from
**sparse rewards only, no demonstrations, no reward shaping** — non-prehensile adjustment,
wiggling, flipping, furniture assembly, using the table edge as a fixture. **The same code for
every task; the only per-task input is the CAD model.** Broad resets also give broad success
regions (place the table anywhere and it assembles). For assembly specifically the reset
distribution comes from **assembly-through-disassembly**: start from the complete assembly the
user provides and add noise backwards. He flags generalizing that beyond assembly as open.

**3. Sim-to-real without system identification.** Simulation is wrong — physics slightly off,
visuals slightly off — but it is *right about global structure* (pick up the leg, insert, rotate)
and wrong about local contact and forces. So: **pre-train a world model in simulation, freeze the
long-horizon part, adapt only the short-horizon prediction from real data, autonomously.**
Transferred policies get the details wrong and fail to insert; ~15 minutes of autonomous real
data fixes them into full furniture assembly, and the same works on other tasks and quadrupeds.

Q&A worth keeping: (a) defining "closeness" for resets beyond assembly is open; (b) they tried
estimating physical properties (friction, softness, damping) by poking, and found it **less
effective than just randomizing over a reasonable parameter range** and training an adaptive
policy — at least for their non-dynamic tasks.

Ties to: Ch.4/5 (RL, exploration, reward design), Ch.8 (world models), Ch.9 (evaluation, SIMPLER).

## g02 — Danfei Xu, "Human Data as a Foundation for Robot Learning" (week 3)

Positions itself explicitly as "an alternative view" of the imitation-learning lecture.
Hypothesis under test: **robot capability can be scaled with human experience data**, because
LLMs/VLMs succeed on naturally-occurring data while robotics still runs on teleoperation.

**The triangle of robot learning:** data source, learning algorithms/models, physical system.
You cannot change one in isolation; progress comes from co-designing all three. He uses it as a
recurring scorecard through the talk.

The bottleneck argument: teleoperation couples all three corners. Data exists only when a human
acts *through a specific robot*; the algorithm learns from that robot's data; the policy works
only on that hardware. More data needs more robots; a new embodiment needs full recollection.
Humans have enormous sensorimotor knowledge and we capture it only in the rare moments we
deliberately drive a robot — the rest is thrown away.

**EgoMimic** — capture embodied human data egocentrically with **Project Aria** glasses, anywhere,
with no robot in the loop, and treat the human as just another embodiment ("human as a different
kind of robot") so the data can sit alongside robot data. Two gaps had to close:
- *Embodiment/viewpoint.* In 2023 there were few human-like robots, so they built lean human-like
  arms — and mounted **the same Aria glasses on the robot**, so camera hardware and viewpoint
  match and the inter-embodiment gap shrinks.
- *Moving reference frame.* A robot's actions are naturally expressed in a fixed frame; a human's
  head moves constantly, so hand positions are tracked relative to a moving frame. Aria's SLAM
  gives head pose, so trajectories are transformed into a stable world/base frame.
Then an ordinary behaviour-cloning system on the combined data. Tasks: bagging groceries (a
closed-loop policy that corrects its own mistakes), folding clothes, pour-over coffee ("a very
hard task, succeeds once in a while" — his words, worth keeping for honesty).
**Scaling result:** x-axis hours collected, y-axis performance. Robot-only data gives a mild
slope; adding human data on top of a base of robot data gives a pronounced jump. Humans also
demonstrate **up to 10× faster** than teleoperation.

**What was missing:** EgoMimic still needs the task to appear in the *robot* data too — paired,
co-distributed. The dream is **zero-shot transfer**: the robot does something present only in
human data. Ideal picture: a domain-invariant latent space where human and robot data for the
same task map together. In practice their student Ryan found the two form **separate clusters**.

**EgoBridge** — pull the distributions together with **optimal transport**, a differentiable
distribution-matching objective, applied jointly to observation-action distributions, with a cost
function based on matching action-trajectory shape (language or other weak supervision would also
work). It is one extra loss on top of the EgoMimic pipeline — plug and play. Alignment improves
visibly, nearest neighbours across domains show matching behaviour, and there are early signs of
the target capability: a drawer task where human data covers all quadrants and robot data covers
only one, and the policy solves the region no robot data covers.

**EMMA** — the same idea for mobile manipulation, where teleoperated mobile demonstration is both
hard and unintuitive, but Aria data already contains hands, actions, SLAM map and body position.
Full-stack redesign of robot and algorithm to close the larger human-robot gap. Result: end-to-end
mobile manipulation, including long-range grocery *shopping* rather than just bagging; at equal
collection time, fixed-base teleop plus mobile human data beats mobile teleop by a wide margin,
with a clean scaling curve in human data.

**Three open directions he names:** hardware systems, data/algorithms, and the research community.
- First-person video is *not* sensorimotor experience and *not* decision-making context. Tactile
  and force are nowhere near captured. And context is more than the instantaneous observation —
  the chef turns to the other counter because of what he prepared minutes ago and years of
  training.
- Make robots more human-like: with NVIDIA they built a more human-like upper body with 22-DoF
  hands, doing tasks the earlier system could not.
- **Flipping the pyramid.** The usual data pyramid puts scalable-but-poor data at the base and
  scarce high-quality data on top. He argues the reverse can hold: **a stronger robot foundation
  model makes human data more useful.** With Physical Intelligence they saw that a better-
  pretrained robot foundation model gives a *bigger* jump when fine-tuned with human data, and
  that human data aligns better with in-distribution robot data under a better VLA.
- **EgoVerse** — shared infrastructure across institutions and companies: ~**1,300 hours** of human
  data and growing, a browsable web portal, and the same pipeline cross-validated on three
  different robots at three universities with a similar performance jump.

Q&A: human data quality vs teleop is "a very fundamental question" — today they align speeds and
ask demonstrators to hold their heads still, i.e. make human data more robot-like; long term he
wants robots that generate more human-like behaviour instead. **They do not estimate forces from
video** ("We don't. Right now, we don't."), and he argues force is a whole-object transmission
problem, not a fingertip reading; event cameras are no help because contact is occluded by
definition. Continual learning is a natural fit for human data (adapt to a new home by watching
its occupants).

Ties to: Ch.3 (imitation, data), Ch.9 (cross-embodiment), Ch.11 (data flywheel).

## g03 — Aviral Kumar, "How to Replicate the LLM Recipe in Robot Learning" (week 4)

Thesis: the LLM recipe is **pre-train → mid-train → post-train**, and robotics has instantiated
only a caricature of it.
- LLM pre-training learns to generate arbitrary internet text and does *not* represent an optimal
  policy. Robot "pre-training" trains a VLA on expert demonstrations to solve many tasks
  *optimally* — which in LLM terms is instruction fine-tuning, i.e. part of *post*-training. He
  says plainly that in his opinion **robot pre-training is currently not done correctly**, and
  that his lab has unpublished work on it (rough idea: a VLA should model multiple modes of
  behaviour, not the narrow expert slice).
- LLM **mid-training** imbues behaviours useful for later autonomous improvement — long chains of
  thought that never appear on the internet, teaching the model to search across candidate
  solutions. **Robotics has no analogue.**
- LLM post-training is RL from autonomous rollouts. Robot post-training is fine-tuning on more
  human demonstrations.

**Mid-training for robots = recovery and correction data.** Expert teleoperation shows only the
optimal solution, which is suboptimal for generalization. Their protocol: train a base policy on
expert demos, deploy it, and collect **human interventions structured as recovery-then-correction**
— when the policy takes the hanger toward the front of the t-shirt, the human backs the arm away
to a previously-good state and then shows the correct move. This is the robot analogue of an LLM
backtracking and self-correcting.

**Why it works — the volume argument, stated twice (talk and Q&A).** Recovery is *strictly easier*
than correction: from an out-of-distribution state, the set of good states you can retreat *to* is
large, while the set of states from which you can still complete the task is narrow. Imitating a
correction requires hitting that narrow set; imitating a recovery does not. The schematic is a
funnel: initial states occupy a wide disk, and the good-state volume narrows as the task
progresses through subtasks (grab hanger, insert one collar side, insert the other).
He also gives a simple model he calls **"the $P$-to-the-$K$ model"**: if a subtask succeeds with
probability $P$ and the robot can recover on the $1-P$ failures, it gets to try again, which
reduces compounding error over a rollout — VERIFY the exact form on the slide.

**Test-time scaling for robots.** Because the policy retries, you get a robot analogue of
thinking longer — but in low-level action space, not token space. Their plot mirrors the OpenAI
o1 blog post's: x-axis = number of recoveries the policy performs within a rollout, y-axis =
success rate, with a linear fit.
Numbers: their method (a modest flow-matching transformer policy) reached a success rate
comparable to **Aloha Unleashed's** shirt-hanging result from **5 hours** of collection against
Aloha Unleashed's **89 hours** of pure expert data — about an order of magnitude more efficient —
and beat a **ByteDance 4B-parameter VLA** that used more data. Data- and parameter-efficiency, as
with reasoning LLMs.
Qualitatively, in a three-way video comparison their policy retries and persists until it
succeeds, an **HG-DAgger** policy makes some corrective attempts but does not generalize, and the
plain BC policy gets stuck. He is explicit that the difference from HG-DAgger is that HG-DAgger
intervenes by solving the task *from where the policy is*, with no backtracking.

**Post-training: Policy-Agnostic RL (PA-RL).** Problem: RL machinery is stable mainly for
small Gaussian policies. You cannot easily take $\nabla_\theta$ of a diffusion policy's output
(backprop through the denoising chain), a flow policy's, or a transformer's (the action is
sampled, so there is no differentiable path — you fall back on REINFORCE, a hard objective).
Their fix decomposes policy improvement into two steps: **(1) optimize the action particles
themselves** against the Q-function — globally by sampling $K$ actions and keeping the $M$ with
highest Q, then locally by gradient ascent on the action with respect to $Q(s,a)$ — and
**(2) distill the optimized actions back into the policy with an ordinary maximum-likelihood
loss**, which every generative model already supports. All the RL happens on actions, not on the
policy, so the method is agnostic to policy class, and the *same* hyperparameters worked across
classes.
Result: **fine-tuned OpenVLA autonomously on a real WidowX in 40 minutes**, with no
demonstrations — to his knowledge the first such result for a state-of-the-art VLA at the time —
plus diffusion-policy results with the same settings. He notes the work is a year old, robots and
VLAs are better now, and the number could probably be ~10 minutes today.

Ties to: Ch.4/5 (RL, off-policy fine-tuning), Ch.3 (DAgger and compounding error), Ch.10
(test-time scaling).

## g04 — Andrew Wagenmaker, "Robots That Learn From Experience" (week 5)

Motivating image: learning to iron a shirt. You watch a video, then you *try*, and you were not
good on the first attempt. Each prior-data source is individually insufficient — simulators
struggle with a shirt's dynamics; internet video is ungrounded (seeing a human iron tells you no
motor commands); human demonstrations are expensive and still leave distribution shift.

**The fundamental obstacle is exploration.** To learn from experience you must collect experience
that *distinguishes* the correct behaviour. Conventional RL exploration — from any state, take
any action — will not find "pick up the spray bottle" in a million tries on a real robot. Humans
explore in a structured way: from this state, one of about three sensible things.

**DSRL — explore in noise space, not action space.** A diffusion or flow BC policy is a mapping
from Gaussian noise to demonstrator-like actions. So a BC policy trained on reasonable human data
already emits, for different noise draws, a *small set of sensible* actions (to the spray bottle,
the iron, the shirt). Therefore: **move the exploration distribution from action space to noise
space.** Learn a **noise policy** and a **noise critic** on top of the frozen BC policy; train the
value function normally, train the noise policy to maximize it; at each step sample noise, push it
through the BC policy, execute, record.
Two consequences he emphasizes: (a) exploration is structured and human-like *from the very first
episode*, because every sample is a plausible demonstrator action; (b) it **sidesteps the standard
obstacle to running RL on diffusion policies** — you cannot easily backprop through the denoising
chain or write down likelihoods — because the BC policy is never differentiated.
Results: on a mushroom-on-cloth task the BC policy succeeded <50% of the time and locked onto the
correct behaviour after **25 episodes** of online interaction; across diffusion policies and VLAs,
<50% → 90–100% in **30–90 minutes** of online training. Contrast video: action-space exploration
flails in free space and collects nothing useful. Independent replication: **ByteDance** applied
it to a bimanual high-precision task where demonstrations alone plateaued <50% and reached ~100%.

**Second half — is BC even the right pre-training for RL?** If the demonstrator never showed the
spray bottle, BC simply will not express that behaviour, and you are stuck; he says this can be
shown formally. Adding ε-greedy-style noise to the BC policy creates a **fundamental trade-off**:
explore more and you express more behaviours but degrade performance (over-exploring where the
demonstrations already tell you what to do); explore less and you keep performance but add no
expressivity. The fix is Bayesian: **estimate uncertainty about the demonstrator's behaviour and
scale exploration in proportion to it** — lock in where the demonstrator is predictable, stay
expressive where they are not. Result: a pre-trained policy with the *same* initial performance as
BC (both mostly fail at corn-into-palm), but after online RL, BC stalls below 50% while theirs
reaches ~75%.

Q&A: he had not compared against **π0.6-star** (advantage-conditioned) — both his papers predate
it; a VLM critic is overkill for single-task but sensible for multi-task language-conditioned
settings; DSRL's steerability via initial noise is a real precondition and state-based steering is
untried.

Ties to: Ch.5 (policy gradients, online RL), Ch.6 (diffusion/flow policies), Ch.3 (BC limits).

## g05 — Cheng Chi, "Robotics Beyond Algorithms" (week 6)

The one talk with almost no algorithms in it, and deliberately so: what he wishes he had been
taught before co-founding a company. He is co-founder and CTO of **Sunday Robotics**; during his
PhD he did **Diffusion Policy** and **UMI (Universal Manipulation Interface)**, and says UMI was
"much more a hardware project than a software project" — the code base is the same as Diffusion
Policy — and that his post-PhD life has been far more about scaling UMI than scaling Diffusion
Policy.

Framing: a modern robot system is policy + a layer of classical robotics software (PID up to
SLAM) — "even though people keep saying end-to-end, there was never actually end-to-end". Those
two layers are what CS departments teach, because they are fun, interesting and easy to set
homework around: clone a repo, run a script. **Hardware and data are at least as decisive and are
taught nowhere.**

**Hardware, via the example of building a camera.** Software analogy throughout: you search for a
repo; in hardware you find open-source hardware or buy something on Amazon and take it apart. A
camera decomposes into lens, sensor, ISP, PCB, cable. `requirements.txt` ↔ **BOM (bill of
materials)** — parts, quantities, links, costs; he shows the Diffusion Policy project's BOM.
`pip install` ↔ **procurement**, which is much harder because parts come from different vendors
and go out of stock.
**Retail is a caching layer.** UMI worked smoothly because its whole BOM was on Amazon — an
"illusion of low latency" created by physical and virtual shelves near the customer. Change a
component or order a large quantity and you exhaust the cache and must reach your supplier's
suppliers. Lens suppliers buy glass and housings; PCB suppliers buy sensors and ISPs; everyone is
buying and assembling. He prefers **"supply tree"** to supply chain, and notes timeline complexity
blows up: if everyone operates Amazon-style, a complex product takes many months. Hence
**supply-chain management as a full-time job** — telling your suppliers' suppliers what is coming
so they ramp in sync. His analogy: `uv` resolving the whole dependency tree, not just the first
layer. Why it matters: supply chain **dictates the buy-versus-build decision**, and a common
mistake he sees in researchers moving to hardware is trying to build everything themselves.

**Manufacturing the skill-capture glove** (derived from UMI; the photo is the 1,000th glove, painted
gold). Assembly by hand needs an **SOP (standard operating procedure)**, many pages, split across
workstations. The recurring problem is **consistency across units**. So: give every unit an
identity (printed QR-coded serial number) and track its components in a database; then
**calibration and QA together in software** — plug the glove in, run through the motions, record
per-joint min/max, calibrate the sensors, and use the same pass to detect faults (a finger that
moves with no reading, or a range far off other gloves) and reject or return the unit. Then pack
and ship. The whole step is **FATP** (final assembly, test and pack) — what Foxconn does for Apple,
and what people actually mean by "a factory".
**The lesson he draws is about software.** Their founding software engineer built a system that
tracks every component, who built each glove, when, how it was calibrated — and carries that
metadata **all the way to the training data loader**, so a researcher who suspects a batch of
gloves can exclude it with a config change. He got there because he ate dinner and went to the gym
with the people assembling gloves and saw the bottleneck was scattered information. General
statement: **"many times there exists a software solution for a hardware problem and vice versa,
and the solution and the problem may not live in the same domain."**

**Data collection is an operation, and operations are about people.** Three generations of owner:
co-founder Tony recruited the first ~20 collectors by knocking on doors and posting on Craigslist;
Camilla, previously a campaign manager for a Honolulu mayoral race, became head of operations and
scaled 20 → 200 with formalized recruiting, qualification and shipping, still knowing everyone
personally — about the limit for one person; Perry, who began as a data labeler on Tesla Autopilot
and grew to lead Tesla's labeling operation, now runs thousands of collectors.
His lesson: he expected to solve this with good code and UI, but **"if you don't get the people
part right … there's no amount of software that can fix that hole"**, while with trust and clear
communication a Slack channel and a spreadsheet suffice at 200 people. Evidence that motivated
collectors contribute back: their early Android-phone tracking was unreliable against blank white
walls, and one collector worked out by trial and error that **sticking sticky notes on the wall**
added enough features to stabilize it.

Closing argument: **operate across the stack.** Education is vertically divided (mechanical /
electrical / CS; SLAM person / learning person) but robotics sits at the intersection of every
engineering discipline, and a problem in one area often needs a solution in another. Sunday hires
for breadth, and the common trait is passion and curiosity — people who take things apart.

Q&A: wheeled base, not legs, for the first product — single-floor homes are a large enough niche,
and a wheeled robot is **passively stable**: cut power and it neither falls nor hurts anyone,
which he considers hard to guarantee for a biped before there is a consensus on what safety even
means for a humanoid in a home. Glove design: **simplicity, because every hardware complexity
grows failure probability exponentially**; degrees of freedom and sensors chosen by engineering
intuition from their PhD experience, then **~100–150 CAD iterations**. Data quality: filtering
matters, but aligning collectors' understanding with what you need matters more, because "there
are a million edge cases you wouldn't have thought of" if people are gaming the system. Collectors
are paid; many are motivated beyond pay (stay-at-home parents, older people wanting to help the
next generation) and need the connection between their work and its impact explained.

Ties to: Ch.6 (Diffusion Policy), Ch.9 (UMI-style data), Ch.11 (frontier, data flywheel, how to
do research).

## g06 — Ted Xiao, "Three Eras of Robot Learning" (week 7)

A ten-year history from inside Google Brain / Google DeepMind, offered as three eras. He is
explicit that his examples skew to where he worked, and that much was happening elsewhere.

**Era 1 — existence proofs (≈2015–2021).** Founding thesis: DQN and AlphaGo showed learning works
for decision-making in games; hardware for mobile manipulation already existed (he points to the
old Stanford teleoperated demo of tidying a living room / fetching a beer); the bottleneck was
intelligence, not mechanism. So Google Brain bought a dozen expensive robots — where an academic
lab had one — and put them in a room to collect real experience. The **arm farms**: banks of
KUKAs grasping objects from bins under autonomous exploration policies.
Works: **QT-Opt** — Q-learning for robotics, over **500,000 real grasps**, handling continuous
high-dimensional action spaces and pixel observations where tabular Q-learning cannot go;
**RL-CycleGAN**, an early real-to-sim evaluation protocol using GAN style transfer to make a
digital twin's images realistic so sim evaluation transfers; concurrent policy execution and
inference for dynamic rather than quasi-static control; **BC-Zero**, a large teleoperated dataset
on the Everyday Robots one-arm mobile manipulator with a language-conditioned BC policy;
**MT-Opt**, multi-task QT-Opt; and **learning from play**, where instead of task-specific rollouts
experts simply play in an environment for a long time and skills are extracted from the
unstructured, un-goal-directed data.
Closing move of the era: rather than incremental scaling, start over — a new robot at the start of
COVID, a large contracting team, a much larger fleet, all collecting demonstrations in the same
environments, targeting **hundreds or thousands of tasks** rather than ten or twenty, over about
eighteen months. To his knowledge one of the largest expert-demonstration collection projects
ever run.

**Era 2 — foundation models (≈2021–2024).** In parallel, GPT-3/3.5, InstructGPT, PaLM, LaMDA and
ChatGPT showed what internet-scale next-token prediction does. Components he isolates: treat
everything as tokens; leverage pre-trained representations or whole pre-trained models; use
foundation models as components of a larger system; and move from costly online on-policy
collection to **offline** learning on large behaviour-cloning datasets, where it does not matter
that the expert demo was not collected by your policy.
Works: **RT-1** — a strong vision encoder with **FiLM** conditioning, a token learner and a
transformer backbone; RGB + language in, **discretized action tokens** out; decoder-only;
**35 million parameters at 3 Hz**, hundreds of tasks, success in the 60–80% range; the first
general-purpose robot transformer.
**SayCan** (unnamed in the captions but described): an LLM proposes plan steps and returns
log-probs; a **value function / Q-function trained on top of RT-1** says how feasible each
instruction is in the current state; combining the two grounds the plan in what the robot can
actually do — the LLM likes "pick up the apple", the policy knows it must navigate to one first.
**Data augmentation by VLM relabeling:** RT-1's dataset was 87,000 trajectories collected over
eighteen months — tiny by current standards — and instruction-poor, so a VLM relabels episodes
with other feasible task descriptions, enriching the language distribution; he notes this is how
image and video models are trained today, arbitraging what the VLM knows but the dataset lacks.
**RT-2:** stop using foundation models for data or planning and make one **the backbone** — treat
action prediction as visual question answering, emit language tokens that decode to actions, on
**PaLI-X** and **PaLM-E**, co-fine-tuned roughly **50/50** with internet data. Transfers new
objects, common-sense reasoning, even reading text — capabilities never present in the robot data.
**Open X-Embodiment:** 30+ labs pooling and cleaning data collected for different projects on
different robots, to see whether motion knowledge transfers across morphologies.

**Era 3 — scale (≈2024–present).** Gemini replaces PaLM/PaLI as the backbone, and the bimanual
**ALOHA** puppeteering platform raises data throughput and quality. **Gemini Robotics** (released
around March of the previous year) combines Gemini 2.0's embodied reasoning and world knowledge
with large-scale diverse robot actions, showing state-of-the-art dexterity, post-training to new
embodiments (a Unitree humanoid, a bimanual Franka) and compositional generalization at test time.
**Gemini Robotics 1.5** adds two things: **thinking** — language-based reasoning at test time,
chain-of-thought before acting — and **motion transfer**, training all embodiments together at
pre-training time in a shared action space so a single network controls them all with no
per-embodiment fine-tuning.
Beyond Alphabet he points to π0.6 (espresso making, long-horizon and precise), Generalist, Dyna,
and to **evaluation at scale** as a genuine bottleneck — thousands to tens of thousands of real
trials are needed for statistically significant A/B tests, hence simulation evaluation and
decentralized efforts like **RoboArena**. On **data scaling** he lays out competing, opinionated
bets: UMI-style co-designed glove hardware shipped globally (Sunday, Generalist); skipping the
glove for pure hand/egocentric capture (GoPro, iPhone, glasses); and in-the-wild deployment data.
On **science**: world models for data, evaluation or backbone; robot-free data and its trade-offs
against expensive teleop; RLVR-style thinking models percolating from language; and the elephant
in the room that everything he discussed is manipulation, while locomotion, balance and whole-body
control advanced through sim-to-real RL — robots dancing, doing kung fu, recovering — "and that's
not happening via imitation learning". Uniting the two paradigms is open.
Summary line: the field has "made more progress than many of us would ever have thought possible
in our lifetimes, but now there's more open questions and uncertainties and open frontiers than
ever."

Q&A: on the future of high-quality teleop data — it has been the golden standard because data
quality is so hard to quantify that the safe bet was to maximize it in house; the burden is now
being externalized to distributions unlike the deployment target; he expects an NVIDIA-style data
pyramid (internet + sim + non-robot video at the base, a thin cherry of fine-tuning data on top)
to be where the world trends, but **the timeline is the uncertainty**: if the pyramid takes a
decade, high-quality teleop stays king in the meantime. On video/world action models: yes,
absolutely a rising trend, because video pre-training gives priors about time, space and intuitive
physics that text cannot — but he is not sure they replace VLAs, because so much capability in
other domains is driven by text, and reasoning in text space appears to lift every modality.

Ties to: Ch.9 (RT-1, RT-2, Open X-Embodiment), Ch.8 (world models), Ch.10 (thinking), Ch.11.

## g07 — Scott Reed, "What is the right Backbone for Embodied Agents?" (week 8)

Definition he uses: the **backbone** is the architecture that encodes sensors and language into a
shared representation for action prediction — it determines not just inference-time behaviour but
**how the policy soaks up knowledge during pre-training and transfers it**. Three choices: train
from scratch, initialize from a **VLM**, or initialize from a **video/world model**.

**VLAs.** Examples: RT-2, OpenVLA, π0/π0.5/π0.6, NVIDIA's GR00T models (humanoid-focused), TRI's
**Large Behavior Model**, Gemini. Principles: everything in one modality; good cross-embodiment
support; directly fine-tune a VLM to emit control tokens; internet-scale reasoning and grounding.
Architecture walk-through: **OpenVLA** is the simplest — pre-trained vision encoders (DINO and/or
CLIP), a pre-trained language model, actions discretized by binning and later de-tokenized to
continuous values; often frozen at first. The **π** models are fancier: both discrete and
continuous action prediction, a **FAST** tokenizer, and separate pathways so the VLM can be
co-trained on language tasks (predicting subtasks) *and* actions.
**A specific and important failure he explains:** naively co-training discrete language-token
prediction while back-propagating flow-matching or diffusion gradients through the VLM **destroys
the VLM weights** and you lose properties like language following — catastrophic forgetting.
Keeping everything discrete opens up pre-training options; but a separate diffusion/flow **action
expert** is still worth having, because decoding discrete action tokens can produce **decoding
errors**, and an undefined decoded action that becomes a default position target could fling a
robot arm dangerously. So the action expert earns its place on safety grounds as well as
performance.
He singles out the **TRI LBM paper** as one everyone should read, for methodology rather than
architecture: it rigorously tests whether multi-task VLA-style pre-training actually improves
downstream performance, data efficiency and top-end performance, using **double-blind evaluation**
— paired policies, evaluators blind to which is which, head-to-head on the same robot at the same
time — with careful statistical analysis. The findings back the community's intuitions, but
someone finally did it properly.
Weaknesses: prediction and reasoning happen in the action space, which may be the wrong place to
reason about physics or control; the action representation is bolted on after pre-training;
catastrophic forgetting during fine-tuning; **data islands** — we throw all embodiments together
and call it cross-embodiment, but the model may see disjoint islands with limited transfer given
differences in form and correlational structure; and evidence for zero-shot out-of-distribution or
new-embodiment generalization is, in his opinion, limited to non-existent for current VLAs.

**World/video action models.** Examples: Cosmos Policy, ByteDance's **GR-1/GR-2**, and a
recent model whose name the captions render "Dream Zero" (VERIFY). Paradigm shift: predict the
world state **in pixels**, before or jointly with acting, so prediction and reasoning happen in a
richer space; and the pre-training objective lets the policy absorb far more from the same data
than action prediction alone — "squeeze a lot more juice out of the data".
Architecture: a VAE encodes frames to latents, concatenated with action embeddings, conditioned on
language, through a **block-causal DiT** so KV-caching makes inference efficient; joint flow
matching over both the action chunk and the future frame chunk. A "Flash" variant takes one or two
steps without fully denoising the future vision chunk, focusing on the action chunk, and performs
just as well. Across the family, some models fully sample a rollout and recover actions with an
**inverse dynamics model**, some plan, and some use video prediction purely as a pre-training
technique and never diffuse observations at inference. He draws an analogy to reasoning models:
much of the benefit comes from having done it *during pre-training* — better representations —
even if you skip it at inference.
**Cosmos Policy** additionally diffuses future **proprioception and value**, which he thinks gives
it a stronger claim to being a real world model; its design tiles proprio, action and value
embeddings spatially into the image embedding space so that, from the diffusion model's point of
view, everything is vision.
**Scaling evidence:** sample quality and success rate both scale with model size — the 14B model
was far better than the 2B. **Failure analysis: most failures stem from video-generation errors
rather than action prediction** — whatever the video predicted is what the policy did. The
exciting implication is that improving the video backbone directly improves policy performance,
and the data to do it need not be robot data.
Weaknesses: expensive to sample; modelling every pixel is probably overkill, since the latent
space was learned to reconstruct aesthetically convincing video, not to control; a
domain-specific tokenizer (his example: Minecraft) can be far more compressed and still
generalize; and context length is currently limited.

**From scratch.** Historically: bespoke networks per task in the DQN era, then one big network on
all data — **Gato** (text, images, QA, Atari and robotics all serialized into one flat token
sequence for one transformer), **RT-1**, **RT-X**, **Octo**. Limits: data islands again, and being
bounded by how much high-quality data a consortium or a researcher's own harvesting can reach.
Modern from-scratch is different because the data is different: **UMI-style large-scale human
pre-training** (Generalist AI, Sunday) — he cites a figure of around **500 K hours** of
sensorized-human data — and camera-only annotation of humans acting in the wild, citing **Ego4D**
at **20 K hours** plus about **50 hours** of sensorized data (**Vive** trackers on the wrist,
**Manus** gloves on the fingers) and a tiny amount of robot data. Both show scaling-law behaviour
in *human* data: validation loss falls and success rate rises monotonically. So you can train a
foundation model without chaining yourself to a VLM or a video model, and the architecture may not
even matter much.

Conclusion: he is bullish on **world/video action models plus scaling human data**, and thinks
combining the two takes robot learning a long way.

Q&A: JEPA-style latent world models are the right direction but unproven — we believe pixels are
overkill, but we do not know the minimal sufficient feature set. On whether world models make
simulators redundant: not soon; neural sim may shine for contact-rich manipulation and
deformables, but hand-crafted sims are so efficient, and world models so expensive to run, that
for whole-body control on humanoids and quadrupeds he doubts sims are going anywhere. On tactile
and force: he makes a LeCun-style argument that a good enough video predictor must latently
represent forces, because there are correlates of them in the pixels — so we may need *some*
sensorized data, but perhaps orders of magnitude less than the video, mainly to **elicit** features
the model already has. On whether only well-capitalized labs can play: no — great work will come
from academia and companies of all sizes, and there are plenty of problems that need fewer GPU
hours than training a backbone.

Ties to: Ch.7 (backbones), Ch.8 (world models), Ch.9 (VLAs, Octo, cross-embodiment), Ch.11.

## g08 — Quan Vuong, "π0.7, A Generalist Model with Emergent Capabilities" (week 9)

Deliberately informal; the stated goal was to interact with the ETH community.
Claim: the main innovation is **a single model that performs many tasks at an extremely high
level** — previously, high performance on a task meant post-training a mediocre pre-trained model
onto that task. A single checkpoint matters because it is what scales: fewer models to manage, no
question of which checkpoint or hyperparameters to use per task at test time.

Scaling framing: two axes, data and model, and it is **not obvious what to scale or how**. Train
on all your robot data and you will usually get something worse than a heavily-tuned specialist —
so **more data does not equal a better model.**

Prior-work plot (from a PI work the captions render "RL token" — VERIFY): x-axis episode length at
evaluation, y-axis success rate. Green = human teleoperator speed; pink = a policy trained on that
teleoperation data, which is **slower than the data it was trained on** — a genuinely surprising
fact he flags; yellow = after online RL, **faster than the human**.

**Architecture** is largely unchanged from π0.5/π0.6: a language model plus a pre-trained vision
encoder with an **action expert grafted on** to "teach the model to speak the robot's language".
Inputs: a prompt ("clean the kitchen"), optionally a **subtask**, and **metadata indicating the
speed and quality of the training episode**. New in π0.7: **goal conditioning**, which he credits
with much better generalization. A separate **high-level** component — human, high-level policy or
world model — supplies plans but cannot itself produce low-level actions.

**Tasks stress different axes,** all from one pre-training checkpoint: laundry folding (effectively
infinite state space), screwing a tiny screw into a robot arm (precision), building a box
(two-handed coordination), taking out the trash (long horizon).

**Results.** Against an **RL specialist** and an **SFT specialist** tuned for each task, π0.7
matches or beats them. Why can a generalist beat a tuned specialist? Because **"in large-scale
robotic evaluation, really every evaluation is a generalization evaluation"** — you fix the scene
as much as you can, but something always changes, and the generalist is more robust to that.

**The metadata result is the one to keep.** x-axis: percentage of the data used, ordered so that
moving right adds progressively *lower-quality* data. **Without** metadata, going from 80% to 100%
— i.e. adding the lowest-quality data — **degrades** performance. **With** quality/speed metadata
conditioning, the same addition produces a **large jump**. Representing the information properly
lets a model benefit from data that otherwise hurts it.

**Cross-environment transfer.** A checkpoint trained on shirt-folding data from one bimanual
station runs shirt folding on a **station of two UR5s**, with **no shirt-folding data from that
station at all** — an unseen task-and-robot combination, on a task that normally takes hundreds of
hours because it is precise and has a huge observation space. He says they were very surprised.
Separately, a human **coaching the robot with language** gets tasks done in unseen environments on
unseen objects — his example involves air-frying a sweet potato where neither the food nor the air
fryer is in the training data.

**Open sourcing and deployment.** π0 and π0.5 are open source, and — a question he says surprises
people — the released checkpoints are **the same ones PI researchers use daily**. The "physical
intelligence layer" blog post asks how PI externalizes its models: by working very closely, "as if
we're on the same team", with companies deploying robots today. Examples: **Weave Robotics**
folding laundry on real customer orders in a laundromat in the Mission in San Francisco, on
completely unseen clothing, with recoveries from tangled trouser legs; and a packaging robot
loading deformable items into soft pouches through a narrow gap and moving sealed packages for
shipping — a task not easily automated with a classical stack. The video begins in daylight and
ends at night: **a full-day workload, mostly autonomous.** The economic frame he offers is
**remote intervention rate**: can you reach a level of autonomy where you break even financially
and can therefore scale deployment? For some partner tasks, he says, they are essentially there.

Q&A: **multi-finger hands** — for scale you need hardware that is cheap, reliable and easy to
maintain, and today multi-finger hands give you **two of the three**; one costs as much as six or
seven two-finger systems, or is cheap and breaks constantly. Across thousands of realistic tasks
at PI they have not often needed more than a two-finger mechanism, so hands are a distraction *if*
your question is intelligence rather than hardware. **Why not home robots yet** — a home robot is
close to physical-AI-complete; consumer robotics is economically brutal; human preferences vary
(success rate, interaction, footprint); the bottleneck is model capability, and multiple
scientific breakthroughs are needed. They show home tasks anyway because they are an excellent
research testbed *and* legible to non-experts: a layperson cannot tell that a precise assembly
task is hard, but everyone understands laundry. On **model size**: currently single-digit
billions; he expects low, then mid, then high double-digit billions, with more emergent capability
as size grows. On **VLA versus world-action model**: still open; what matters is long context,
durability and capacity, and both can get there.

Ties to: Ch.9 (generalist policies, π-series), Ch.6 (flow matching), Ch.10, Ch.11.

## g09 — Archit Sharma, "Scaling Test-Time Compute at the Frontier" (week 10)

He led **Gemini Deep Think** and co-created **DPO**.

Arc: until 2024, LLM gains came from scaling **pre-training** compute — next-token prediction on
ever more data with ever larger models, a remarkably scalable objective. Late 2024 / early 2025
brought **reasoning models**, which spend time thinking, working through context and tool calls
before answering. The new axis is **test-time compute**, and performance rises **predictably** with
it.
Evidence from the Gemini 2.5 report: **AIME 2025** (a high-school final-answer maths competition
LLMs were terrible at pre-2024), **LiveCodeBench** (competitive programming) and **GPQA Diamond**
(science and knowledge) all improve as thinking time grows — over **20 percentage points** on the
first. Large Gemini 1.5 → 2.5 Pro gains on coding, science and maths are attributed substantially
to inference-time scaling.
Definition he gives: ordinary neural networks spend a **fixed** amount of forward computation per
input; a test-time-compute system runs a **search** — in output space or otherwise — and can spend
much more than a single forward pass.

**AlphaGo as the canonical example.** The raw parametric model with a single forward pass reaches
about **3,000 Elo**; adding test-time search — **capped at five seconds** — takes the *same model*
to about **5,000 Elo**. He glosses the gap as a 100-Elo difference being roughly a 64% win rate,
and a 2,000-point gap meaning the weaker player essentially never wins; by ~3,500 you are already
superhuman. Caveat he states: this is hand-crafted for games with a simulator.
> Cross-check for the book: Ch.10 already carries an editor's note about the lecture's 120-Elo
> rule and the slide's 100,000× claim. Sharma's numbers (3,000 → 5,000 with a 5 s cap) are a
> *different* framing from the main lecture's and should be reported as his, not merged.

**Chain of thought** bridges to LLMs, with the canonical Roger-and-the-tennis-balls prompt: forced
to answer directly the model fails; encouraged to reason step by step it succeeds.
**GRPO / DeepSeek and RLVR:** warm-start the model to reason, then run RL with verifiable rewards
(maths with known answers, code with unit tests) and **reasoning emerges over training** — the
average response length grows on its own while training accuracy climbs from roughly 15–25% to
75–80%. Inference-time compute is being consumed more and more through training *and* evaluation.
Other axes for spending test-time compute: parallel reasoning, iterative self-refinement over
previous answers, tools (web search, code execution), sandboxes, self-verification. These produce
both **general reasoning systems** (Deep Think, ChatGPT Pro) and **specific harnesses** (Codex,
Gemini Deep Research, Claude Code).

**Deep Think.** On IMO-level proof problems, with the x-axis inference compute on a **log scale**
and the y-axis proof correctness as graded by an expert human, accuracy climbs from about **40% to
about 90%**, with the model working for **hours**. It was the first system to reach **gold-medal
standard at the IMO**, a milestone not expected in 2025. On **Codeforces** the latest version
reached an Elo of about **3,445**, with only around **seven humans in the world** rated higher.
Crucially the benefit extends to **non-verifiable** domains: asked to produce an HTML voxel scene
with cherry blossoms and pagodas, 2.5 Flash → 2.5 Pro improves the result, but *scaling inference
compute* improves it much further — far more detail in the trees and the pagoda.

**Open problems he names.** (a) Efficiency — using tokens and tools well is wide open. (b) A
reframing he finds under-appreciated: much pre-training progress came from increasing model
**depth**, and inference-time scaling also increases the *depth of computation*, since more tokens
means more forward passes — so what is the most effective way to add depth? (c) Long-horizon
agents: as agents work for days or weeks, how do we keep them making progress, measure that they
are, and keep it safe? He argues the demand is real — a million dollars of compute is trivially
justified against the Riemann hypothesis, drug discovery or cancer treatment, and companies that
once scaled engineer headcount may instead scale inference compute. (d) **Knowledge discovery** —
models solve well-defined problems superbly but struggle to identify which problems matter; he
cites the proposed **"Einstein test"**, rediscovering general relativity from data only up to the
early twentieth century. (e) **Improving with experience** — humans get better at their jobs;
agents redo the same expensive reasoning every time. Memories and skills are early, still largely
manual, versions of a fix.

Q&A: **latent-space reasoning** — token space is natural because the models are trained to predict
tokens, which is why reasoning emerges under GRPO, but it is arguably not the most efficient space
to think in; continuous space offers more room for abstract thought and people are working on it.
**Scaling RLVR to hard domains** is limited by three things: infrastructure (models must train
stably; training/inference **mismatch** can compound into serious divergence), running out of
problems (easy problems stop carrying signal for a strong pre-trained model), and verification
itself (maths **proofs** are not easy to verify and reward-hacking becomes possible). On agents
that get stuck: partly jaggedness, partly under-specified problems — and the fix he wants is for a
stuck agent to ask another agent or a human for help, as he does himself.

Ties to: Ch.10 (test-time scaling, GRPO), Ch.11.

## g10 — Lucas Beyer, "Vision in the Age of LLMs" (week 11)

Self-described as "probably the least robotics lecture in this robot learning course", and
positioned as the prehistory of every VLA: they are built on VLMs, and many on **PaliGemma**
specifically. Background: Belgium, mechanical engineering and a PhD in robotic perception at
Aachen, then Google Brain Zürich (ViT, SigLIP, PaliGemma), now Meta.
Long-term goal he still holds: **a robot any non-technical person can teach to do anything, without
programming.** Eight years ago he judged that needed robust general perception plus few-example
learning; language models have since made "teach it from a few instructions" plausible, but robust
general perception remains the key.

**What general perception means** — he demonstrates it live on the audience with three-way few-shot
classification: flowers (easy, you have seen millions), satellite images (fewer), and a final
unfamiliar domain most of the room has never seen, which they still get right. That is the target.
To make progress you must measure it: **VTAB, the Visual Task Adaptation Benchmark** — pre-train
however you like, then sample a long, diverse list of perception tasks, get a few training
examples per task, adapt however you like (fine-tuning being the classic choice), and average the
per-task scores.

The overall recipe, and the talk's outline: **pre-train → mid-train → fine-tune → RL-tune.**

**Pre-training.** Five to eight years ago the rage was self-supervised pre-training. They
reimplemented a large subset of methods and found **no method is consistently best**, but **making
the model larger is always better**. Worse, the scatter plot of pre-training performance against
downstream performance shows **almost no correlation across methods** — bubbles all over the place
— with a trend only *within* a method as it scales. He flags this as an insight that should
transfer to robotics.
The practical consequence: to pick a model you must evaluate, and to evaluate you need examples —
either a validation set or you watching the robot and writing down good/bad, which *is* a
validation set. So why not put a few of those labelled examples **into** the pre-training? They
did, and transfer improved dramatically. That killed purely self-supervised pre-training for them
and moved them to supervised pre-training at scale.
**The BiT scaling plot** (his "second favourite plot"): x-axis model size, y-axis ImageNet few-shot
performance. Contemporary papers scaling models on ImageNet-1M crawl from ~50 to ~55 — not worth
the cost. Going to ~15× more pre-training data, then another ~20× beyond that, changes everything:
the largest model on the largest data is far better than anything published before. **ObjectNet**,
which puts ImageNet classes in deliberately strange poses and locations to test out-of-distribution
generalization, shows exactly the same trend.
**Why the community took years to get there.** You need **all three** of larger model, larger data
and longer training, each by orders of magnitude. Two of three gives much less; one gives
essentially nothing. Concretely: take the standard ResNet-50-on-ImageNet recipe, train it on 10×
more data and you get **worse** results — a negative result several blog posts reported — and this
reproduces. Train 10× longer, then another 10× longer, and it starts to pay.
**His favourite plot in his career:** a training curve where the first **8 GPU-weeks** look
completely flat, so any reasonable person kills the job and reuses the GPUs. Zoomed out to **8
GPU-months** it is clearly still improving. "Good thing we were not reasonable." And a weight-decay
example where the run you would kill from two preliminary curves ends up beating the one you kept.
Details are not obvious at small scale.
**Where the data comes from.** Classical pre-training data is class-list-first: someone invents
classes, then crawls images for them — forever bounded by the creativity of the list-makers. His
anecdote: **MS COCO's 80 classes** came from the senior professor on the project asking his eight-
to ten-year-old child what things they could think of — microwave, pizza, frisbee, baseball — so
essentially every detector you know is trained to do "typical 8-to-10-year-old North American
things".
**CLIP** flips it: list *images* — crawl the web — and use whatever text surrounds them, canonically
alt-text. You get garbage ("Thumbnail for version…") but also "Frankfurt airport skyline", a class
nobody would ever have invented. He teaches the mechanism in full because half the room did not
know it: put ~32,000 image-text pairs in a batch, encode images and texts to vectors, and for each
text classify which image vector it matches and vice versa — a softmax over dot products with the
diagonal as ground truth. **SigLIP** simplifies this to a per-pair **binary** decision: dot
product, sigmoid, target 0/1.

**The anti-filtering argument.** People then showed better and better numbers by *filtering* the
image-text data: keep words in English Wikipedia; use LAION's 2B English-only subset rather than
the full 5B; score pairs with the original (English-only) CLIP model and keep high scorers; keep
images resembling ImageNet. The best model has all these heuristics — and is measured on ImageNet,
which is itself North-American-biased. He objected that we had just gained the ability to learn
every concept on the web and were throwing it away. Controlled experiment, English-filtered versus
unfiltered: the filtered model calls the **Milad Tower in Tehran** the **CN Tower in Toronto**, and
places a Brazilian cathedral in Montreal; the unfiltered model gets both right. Then the audience
exercise: *close your eyes and think of a toilet* — you thought of a Western one, and the other
kinds do not survive North-American filtering. They built a benchmark showing that as models improve
on ImageNet and COCO they get **worse** on across-the-globe coverage, and campaigned to stop the
filtering.

**CLIP's fundamental limitation, and the fix.** Take a perfectly clean image-caption pair. Within a
mini-batch, the model only needs to do *enough* to pick the right partner: if no other cat image is
in the batch, recognizing "cat" suffices and everything else can be ignored. To learn *sitting* the
batch must contain a cat and a dog not sitting; to learn *left of* it must contain a cat and dog
sitting the other way around. From random web data at batch size 32,000 — or a million — that is
vanishingly unlikely. So **CLIP does not learn relations.** People patched it by constructing
counterpart examples and enumerating relations; he wanted a fix that scales, and the simple one is
**a captioning loss** — generate the caption word by word, so producing "left" rather than "right"
after "sitting" is forced. The original CLIP paper had a figure showing captioning was far less
efficient; they reproduced it and found it an artifact of that particular setup. With the fix, the
relation benchmarks are nailed. **SigLIP 2 has a captioning loss; use it over SigLIP.**

**The lesson he says to take away from the whole talk if you take only one: LOOK AT THE DATA.**
The relation benchmark asks you to choose between "the horse is eating the grass" and "the grass is
eating the horse" — you do not need the picture. The benchmark is full of these. To prove it they
trained a **blind captioner** that never sees the image, and it nails the benchmark too. He notes
this class of broken benchmark recurs roughly every five years, every generation of PhD students,
and that others later built a proper version — on which the captioning pre-training also wins.

**Mid-training.** A recent term; he quotes an unnamed description he likes: the steps after the bulk
of self-supervised pre-training, shaping **core capabilities**, before fine-tuning or RL for exact
behaviours. **PaliGemma is the canonical example**: an image encoder (CLIP/SigLIP) turns the image
into vectors, i.e. tokens; those are concatenated with text tokens (typically a question or task);
a language model emits the answer — and in a VLA, actions instead. It is mid-training because it
**stitches two pre-trained models together and installs core skills that pre-training does not
supply**.
What matters is the **training mixture**: reasonably large, not necessarily comprehensive, but it
must force the skills. Captioning; **OCR** — feed random images with text and ask for the whole text
or chunks of it, which is useless to a user but installs *reading*; object-presence questions ("is
this object in the image", "which of these are"); **inverting question and answer** — given the
answer, generate the likely question; detection; segmentation; and region captioning. Many can be
generated semi-automatically from images with existing metadata. Several were added specifically to
make PaliGemma good for **robotics-style tasks**, so it learns about objects and locations.
Mid-training is also where you **scale the axes you could not afford in pre-training**: higher input
resolution, longer video context, more 3D slices.
**Turning tasks into text.** Detection becomes text by binning each axis into ~**1024** bins
(roughly pixel resolution) and emitting bounding boxes as coordinate tokens. The general mechanism
is **VQ-VAE**: an autoencoder whose bottleneck learns a discrete dictionary, so a segmentation mask
becomes a sequence of new tokens that you add to the model's vocabulary — and the VLM can then emit
segmentation masks inline with text.
**Fine-tuning** is a large mixture of specialized tasks, and it produces **skill transfer**: a model
that learned segmentation on natural photographs and question-answering on satellite images can
segment satellite images, a combination present in neither mid-training nor fine-tuning.

**The provocative conclusion, and its caveat.** This recipe "somewhat solves perception" — from
barely working eight years ago to essentially solved. But the "VLMs are blind" papers show frontier
models failing at things like counting intersections between two kinked lines, where humans exceed
90%. His answer: *solved* means **the recipe** is solved, and you still have to apply it. Those
obscure tasks are simply not in anyone's SFT mixture. He generated **128 examples** of the
line-intersection task and fine-tuned PaliGemma to **95–96%**; since it is really classification, he
fine-tuned **SigLIP alone to ~97%**. So the models are not blind — 128 examples cannot teach the
underlying skill of finding intersections, but they are enough to teach **what the user wants**.
Recipe as advice: for any *perception* task, spend an afternoon collecting a couple of hundred
examples, fine-tune a good pre-trained VLM, tune the learning rate, and it works; RL-tune if
needed; then deploy.
What the recipe does **not** solve, and what robot learning runs into: everything after perception —
**reasoning** ("solve my homework", "explain why this is funny") and **planning** ("robot, make me a
cappuccino" — it knows where the machine and the cup are, but cannot plan the sequence). The
unsatisfying part he names explicitly: free-form text alone is not enough to specify a new task; you
still need a little fine-tuning.

Q&A worth keeping: **augmentations** buy roughly one order of magnitude of data and no more, after
expensive tuning — get more data if you possibly can (see "How to train your ViT").
**Deduplication** is done heavily and silently in all their work: remove anything close to your
evaluation tasks from pre-training, or your benchmarks are in your training set and you are not
measuring what you think; roughly **10 million near-duplicates per billion pre-training images**,
which costs nothing in coverage and buys trust. **Do not freeze the image encoder** — PaliGemma
does not, and most VLMs that do cannot recover from CLIP's limitations, which matters exactly for
relations and locations; he would not use a frozen-encoder VLM for fine-tuning. On **JEPA**: his
view is that it renames what self-supervision has always done, the general direction is sensible,
but he does not share the claim that it outranks language models for reasoning. **Distillation** is
the missing addendum to his recipe: pre-train, transfer, RL-tune to make the model as good as
possible, then distill it to the latency you need — expensive, because it needs very long training,
but it can be the difference between a blocker and something you can run on a robot. On
**DINOv3** and text-free encoders: "not a fan — the text is there, why not use it"; DINO is the only
one that gets reasonable performance without text, and it is intellectually interesting, but it
makes the problem unnecessarily hard.

Ties to: Ch.7 (ViT, CLIP, tokenization, scaling laws), Ch.9 (PaliGemma under the VLAs), Ch.11.

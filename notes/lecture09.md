# Lecture 9 — Generalist Robot Policies (raw notes)

- Video: <https://www.youtube.com/watch?v=dtofzDY9zuo> (63.5 min)
- Transcript: `transcripts/09_generalist_policies.txt` (9,107 w) · Slides: `slides_png/lecture09/`
  (55 frames) · OCR `slides/lecture09.txt`
- Speaker: Oier Mees. Dated **27.04.2026** on the title slide. Assigned (wk9): Lynch et al.
  2021 (Language Conditioned Imitation Learning over Unstructured Data); Reed et al. 2022
  (*A Generalist Agent* / Gato); Physical Intelligence 2025 (π\*₀.₆: a VLA That Learns From
  Experience). Guest: **Quan Vuong** (co-founder, Physical Intelligence) — he also appears
  *inside* the lecture at 21:01 as the person running the remote Google evals for Octo.
- Mees's own-work lecture: OXE, Octo, CrossFormer and SIMPLER are all his papers. Cite
  even-handedly (same caution as mimic-video in Ch.8).

**The spine of the lecture: three ingredients.** Slide 43/53/54 is the organizing figure and
should open and close Ch.9 — **large datasets** (leverage existing robot data), **large
models** (cross-embodied policies with internet-scale priors), **scalable evaluation**
(leverage real-to-sim evals). Everything in between is one of those three.

## Framing — specialists → generalists (00:01–07:01, slides 1–3)
ACT and diffusion policies (Ch.3) "really excel at dexterous tasks and handling multimodal
behaviors" but fit **single-task, specialist** policies: you retrain per embodiment and per
task. The **North Star**: one model controlling **many robots**, in **many environments**,
performing **many tasks**, working alongside humans. The target future is that you
"**download your favorite robot brain online**" and out-of-the-box your robot does something
reasonable.

The template comes from NLP/vision (slides 2–3): train one model on a large diverse dataset
covering many tasks (code completion, question answering, translation) and it **surpasses
specialist models** built per task. Slide 3 names the specialists being displaced:
Seq2Seq/GNMT for translation, R-CNN/Fast-RCNN for detection, DenseCap/Show & Tell for
captioning — versus ViLBERT, Flamingo, BLIP, GPT-4V.

**Four differences that break the recipe in robotics** (05:01–07:01):
1. **Data scarcity.** No robot dataset is remotely comparable to frontier NLP/vision corpora.
   Robot data is scarce and expensive — the students collecting their first SO-101 teleop demos
   are told to imagine reaching frontier-model magnitude that way.
2. **Heterogeneity + multimodality.** Interaction in the real world is a multi-sensory
   experience; **every embodiment has different observation and action spaces**.
3. **Real-time control.** "We don't want to send a query to ChatGPT and wait a minute for its
   API to return the next action."
4. **Evaluation cost** grows dramatically once one policy does many tasks in many environments.

## Ingredient 1 — data: Open X-Embodiment (07:01–11:00, slides 4–7)
Teleoperation is costly for **every** new task (slide shows Mees teleoperating the Franka
setup from his PhD). **Key idea (slide 4): leverage existing robot datasets — aggregate them
into a common format that permits co-training.** Previous community datasets existed
(Bridge V2, Fractal, RoboTurk, RoboNet…) but not in a form that allowed co-training. The
observation that motivates it: every robotics lab in the world collects *some* data (e.g. a
small tactile-sensing teleop set) and never puts it online, assuming nobody else cares.

**Open X-Embodiment** (slide 5) — assembled by asking friends in labs worldwide:
- **1M+ real robot episodes**
- **22 robot embodiments**
- **34 research labs**
- **300+ scenes**

> Open X-Embodiment: Robotic Learning Datasets and RT-X Models. Open X-Embodiment
> Collaboration, …, **Mees** et al., **ICRA 2024. Best Conference Paper Award (out of 1765
> papers).**

**"Sparks of a generalist robot policy"** (slides 6–7) — first evidence that one model trained
on all these datasets beats the best method tailored to each setup. Bar chart, success rate
%, three bars per setup (original method / RT-1 / **RT-1-X**), read from the slide image:

| Setup | Original method | RT-1 | RT-1-X |
|---|---|---|---|
| Kitchen Manipulation | 43 (MVP BC-RNN) | 48 | **63** |
| Cable Routing | 24 (ResNet + MLP) | 18 | **56** |
| NYU Door Opening | 53 (VINN) | 65 | **80** |
| Autolab UR5 | 53 (ResNet + MLP) | 25 | 45 |
| Task-Agnostic Play | 33 (TACORL, HULC2) | 68 | **72** |
| **Mean** | 41 | 44 | **63** |

The "Task-Agnostic Play" column is Mees's own AIS (Freiburg) setup, arrowed on the slide as
"My PhD robot setup"; he contributed continuous evaluations during model development. Note
RT-1-X **loses** to the original method on Autolab UR5 (45 vs 53) — the win is on the mean,
not uniform. Impact claim: the dataset unlocked algorithmic progress by making training on
1M+ diverse cross-embodied trajectories possible at all; most of the rest of the lecture
builds on it.

## Why modelling this data is hard (11:00–12:16, slides 8–10)
Slides 8–10 walk one figure through three stress tests: a generalist policy takes a goal
image + wrist & third-person cameras and emits **end-effector control**; then the **task
specification** changes; then the **action space** changes to **joint control** with
proprioception added. Punchline box on slide 10: **robot data is heterogeneous — diverse
sensors, diverse actuators, diverse control frequencies.** Different task specifications,
different camera counts (one robot has one camera, another three or four), very different
action spaces. Sharing knowledge across robots that look this different is the problem.

## Robotics as multimodal sequence modelling (12:16–14:00, slides 11–13)
Slide 11: image + "Pick up the spoon" → **Policy** → `ACTION: [Δx, Δθ, ΔGrip] = …`.
Slide 12: swap the robot image for an internet image and the instruction for "Caption the
scene" → **Vision-Language Model** → "The picture shows the Statue of Liberty in NY". Same
shape.

**Key idea (slide 13):** view robotics as a **multimodal sequence-modelling** problem — learn
a model mapping images and text to answers, where in robotics the answers are **actions**.
Slide 13 shows three token strips: **Language**, **Image**, **Action**. Payoff: with language
tokens, image tokens and action tokens you inherit the advances in general multimodal
sequence modelling from non-robotic domains.

## Octo (14:00–25:00, slides 14–24)
**Octo** — the first open-source generalist policy. A large transformer-based policy trained
on **800,000 robot trajectories** from OXE. Same core idea as **Gato** (Reed et al. 2022 —
guest lecture the week before): tokenize heterogeneous inputs and action outputs, train one
big transformer.

> Octo: An Open-Source Generalist Policy. Octo Model Team, Ghosh\*, Walke\*, Pertsch\*,
> Black\*, **Mees**\* et al., RSS 2024.

**Architecture** (slides 14–18, built up over four states):
- **Task tokens** $\mathcal{T}_T$: language ("Put the knife on the plate") through a
  pre-trained **T5** language encoder; positional embedding $p$ added. Goal images can play
  the same role.
- **Observation tokens** $\mathcal{T}_o$: image observations patchified and run through a
  **shallow CNN**; positional embedding added.
- Concatenate task + observation tokens, pass through a transformer that "looks very similar
  to a vanilla ViT".
- **Block-wise causal masking**: task tokens attend among themselves but **not** to
  observation tokens; observation tokens at a given step attend to the task tokens and to
  observation tokens at the current and earlier steps, **not** to future steps.
- **Readout tokens** (purple on the slide): placeholder tokens that **summarize the
  embeddings** and feed the functional heads.
- **Action head**: a **diffusion decoding head** (slide 18) — chosen because in experiments
  it handled **multimodal behaviour** far better than the alternatives.

**Training objective** (slide 17 — the only equation in the deck):
$$\pi_\theta\!\left(a_t \mid s_t,\, s_g\right)$$
labelled **"Goal state conditioned BC"**, with an arrow into it from "goal image, language".
In words: predict a **sequence of actions** to reach a goal state, given the current state.
Symbols: $a_t$ action at time $t$; $s_t$ current state (image observations + proprio);
$s_g$ **goal state**; $\theta$ the policy parameters. The flexibility is that $s_g$ can be
supplied as a **goal image** *or* a **natural-language instruction**. Because the model is
sequential, it is run over multiple time steps.

**Design decisions** (slide 19, 17:59–19:43) — two bullets:
1. **Train everything from scratch, most params in the transformer.** Deliberately *not* the
   prior design of large per-image ResNet-style encoders fused late. Rationale at the time:
   "we have so much data, we can just train everything from scratch." Mees's own verdict:
   "in hindsight, maybe it was not the best idea, but at the time that's what we thought."
2. **Align the gripper action across OXE datasets.** Coordinate frames were *not* aligned
   (an explicit scalability choice); the gripper dimension *was*, because early failures were
   gripper-related (premature grasping). Slide 19 charts the typical motion
   (open → closed to grasp → open to release) under **four conventions found in OXE**:

| Convention | Datasets |
|---|---|
| Absolute, +1 open / 0 closed | Taco Play, Austin Sailor, Austin Sirius, NYU Franka Play |
| Absolute, 0 open / 1 closed (**inverted**) | RoboTurk, Viola, Stanford Hydra, BC-Z |
| Relative deltas, +1 opening / −1 closing | RT-1, Kuka, Jaco Play, Berkeley AutoLab UR5 |
| Continuous with transition ramps | Bridge (intermediate analog values while opening/closing) |

  **Octo maps all four to one target: absolute, +1 open / 0 closed.**

**Evaluation** split into **zero-shot** and **fine-tuning** evals across many labs and
institutions, with the **same fine-tuning recipe** used to adapt to new sensory and action
spaces. Results (not deep-dived in class): Octo controls multiple embodiments out of the box;
**outperforms RT-1-X** (trained on similar OXE data); **matches RT-2-X**, a much larger
**55-billion-parameter closed-source** VLA from Google — "kind of the first VLA".

**The Eureka moment** (slides 20–21, 20:45–22:16). Video of the first successful grasp the
team ever saw from Octo, on the **Google robot**, served **via remote server** from Berkeley.
**Quan Vuong** (that day's guest lecturer, then at Google) is on the call helping run it.
Two points Mees draws out: robot evals are hard, and harder still when you are not next to
the robot and depend on other people; and these evals were **out of distribution** even
though Google's data was in the training mix, because Google had **moved buildings** since
collecting it. Simple tasks still worked — "this was our Eureka moment".

**Adaptability / fine-tuning** (slides 22–24, 22:16–25:00). The generalist should be useful
even for a robot it never pre-trained on: new embodiment, extra sensing (force-torque), more
or fewer cameras, or a different action space (Cartesian → joint control). Mechanism: **slot
the new input in as a few extra tokens and fine-tune**; because most parameters live inside
the transformer, most knowledge is retained. Headline finding across fine-tuning setups at
different labs: **fine-tuning from a generalist robot policy / robot foundation model (RFM)
beats any state-of-the-art visual-representation-learning backbone** — slide 24: "Key: RFMs
learn better representations for transfer", "Researchers finetune to their robot with **50
demos**". Adoption evidence: an unseen **Spot** quadruped fine-tuned by a researcher (source:
Peter Mitrano via Twitter) and a **Japanese company's humanoid** (source: Tokyo Robotics).
Slide 24 also shows the two-line load: `from octo import OctoModel` /
`OctoModel.load_pretrained("hf://rail-berkeley/octo-base")`.

## CrossFormer — extreme cross-embodiment (25:00–30:35, slides 25–29)
"How generalist is a single-arm manipulation policy really, if all it can do is control a
7-DoF arm?" Robotics *has* drones, quadrupeds, self-driving cars, humanoids — methods that
learn from all of them can consume much more data. Transfer example given: **navigation data
teaching obstacle avoidance to a drone**, because avoiding obstacles is a common behaviour
whether the platform is a Roomba or an indoor quadcopter. Goal: a scalable approach that
takes **any** embodiment with **no manual action-space alignment** and lets the transformer
figure out how to combine everything.

**CrossFormer**: add bimanual manipulation, navigation and locomotion to Octo's mix →
**900,000 robot trajectories**, one big transformer with **embodiment-specific action heads**.

> Scaling Cross-Embodied Learning: One Policy for Manipulation, Navigation, Locomotion and
> Aviation. Doshi\*, Walke\*, **Mees**, Dasari and Levine. **CoRL 2024. Oral, top 4% of 670
> papers.**

Slide 27 (verified on the full-resolution frame) — the **Cross-Embodied Transformer** box:
- **Flexible Observation Spaces**
- **Flexible Action Spaces $\in [2,\dots,1400]$**
- **Control Freq. $\in [5\,\mathrm{Hz},\dots,50\,\mathrm{Hz}]$**

feeding five output branches: Quadrupeds, Single Arms, Navigation, Bimanual Arms,
Quadcopters. Input mix: 900k trajectories of navigation, locomotion, manipulation, bimanual.

**Why the heads.** Variable observation inputs *and* variable action outputs are needed
because control frequencies differ wildly — a **WidowX at ~5 Hz** versus a **bimanual
dexterous robot at ~50 Hz** — so the required **action-chunk length** differs too. Separate
heads are one way to handle that, and they remove any need for action-space alignment. To
maximize transfer, **maximize parameter sharing**: e.g. share image-encoder weights across
camera views **of the same type**.

**Architecture** (slide 28): language instruction ("Sweep the objects into the dustpan") →
language encoder → **FiLM conditioning** into a **ResNet** image tokenizer over current +
goal images (positional embedding $p$, tokens $\mathcal{T}_o$). Observation-token groups are
labelled **workspace image, navigation image, wrist image, quadruped proprio, bimanual
proprio**, plus **readout tokens**, all into the Cross-Embodied Transformer, out to four
labelled heads: **Quadruped / Single Arm / Navigation / Bimanual Action Head**. Bullets:
no action-space alignment required; can consume data from *any* robot embodiment; maximize
parameter sharing.

**Rollouts** (29:00–30:35): quadruped, Franka single-arm, indoor and outdoor navigation, and
the long-horizon bimanual **sushi-cutting** task. The point Mees stresses: **every clip comes
from one single checkpoint** — the same neural-network weights, no per-robot cherry-picking.

**Quantitative results** (slide 29) — success rate, three bars per embodiment (Best Prior
Method / Single-Robot Dataset / **CrossFormer**), read off the chart (approximate, no printed
values):

| | Best prior | Single-robot dataset | CrossFormer |
|---|---|---|---|
| **Average** | ≈0.52 | ≈0.62 | **≈0.70** |
| WidowX | ≈0.20 | ≈0.20 | ≈0.25 |
| Franka | ≈0.52 | ≈0.41 | ≈0.41 |
| ALOHA | ≈0.70 | ≈0.50 | ≈0.79 |
| LoCoBot | ≈0.48 | ≈0.91 | ≈0.92 |
| Go1 | — (no bar) | ≈1.0 | ≈1.0 |
| TELLO | ≈0.68 | ≈0.68 | ≈0.81 |

Slide caption: "**matches and outperforms specialist policies**". Same caveat as OXE — the
average wins; Franka does not (≈0.41 vs ≈0.52 for the best prior method).

## Does multi-task pre-training help post-training? — the TRI study (31:02–33:48)
CrossFormer asked whether one policy could control many embodiments and beat specialists.
This work from **TRI** asks a different question: **does multi-task pre-training help
post-training?** Widely believed in the community, hard to establish in robotics. Mees
recommends reading it as a **rigorous study**:
- **Diffusion transformer** policies pre-trained on **~1,700 hours** of data including OXE.
- Fine-tuned to **single bimanual tasks** on their Frankas, evaluated in **sim and real**.
- Statistical significance chased hard: **blind A/B testing in the real world** — operators
  did not know which policy they were scoring.
- Demo: cutting an apple, **~2 minutes** long, "super long horizon".

**Findings.** (1) Yes — pre-training makes post-training to a single task **3× to 5× more
sample efficient**. (2) The benefit is largest in the **low post-training-data regime**.
(3) **How you normalize your data often mattered more than architectural or algorithmic
changes** — Mees's gloss: robot learning has so many knobs that something as simple as
normalization can dominate.

> [UNCLEAR: lecture 9, 30:55–33:49 — no stable slide was captured for this ~3-minute segment
> (a video was playing), so the TRI **paper title and authors are not recoverable** from the
> deck; the transcript names only "this work from TRI". Resolve before Ch.9 goes out, or cite
> it as an unnamed TRI study.]

## Ingredient 2 (continued) — internet-scale priors: VLM → VLA (33:49–36:44, slides 30–34)
Everything so far trains on robot data **from scratch**, and OXE is "minuscule compared to
LLMs and VLMs" (slide 30). So: **do internet-scale priors like VLMs transfer to control?**

**LLaVA recap** (slide 31): **image tokens are prepended to the text sequence and the LLM
processes everything in a single unified self-attention pass.** Slide detail: CLIP vision
encoder (**always frozen**) → **MLP connector** projection layer (**trainable**) → **196
image tokens** prepended to text tokens → LLM (LLaMA), self-attention over all tokens
jointly, standard autoregressive generation, **no new attention mechanisms**. Text prompt
"describe this" → "a cat sitting on a mat". (Liu et al., 2023, *Visual Instruction Tuning*.)

**The move** (slide 32): "LLaVA treats images as another token sequence the LLM can attend
to — **can we treat robot actions the same way?**" That is how the first VLMs became VLAs.

**VLM → VLA** (slides 33–34, side-by-side): the pretrained VLM (RGB pixels + instruction →
ViT/CLIP vision + subword tokenizer → autoregressive LLM → **language tokens, vocab ~32k
IDs** → "The cat is on the mat.") is **fine-tuned on robot data** into a VLA (robot camera +
task command → **same encoder, same vocab** → **same weights, fine-tuned** → **action tokens,
256 reused vocab IDs** → `"1 128 91 241 5 101 127"` → de-tokenize → $[\Delta x, \Delta y,
\Delta z, \Delta\theta, \text{grip}]$).

Mechanics: **tokenize robot actions and inject them into the LLM vocabulary**, commonly by
**overriding the least-frequent tokens** in the vocabulary; then train with **next-token
prediction and the same cross-entropy loss**. Action tokenization itself was covered in Ch.7;
the recap is that the first approaches — **RT-2, OpenVLA** — used a naive **per-dimension,
per-time-step binning** discretization.

## Tips & tricks for training VLAs (36:44–51:38, slides 35–41)
Framed explicitly for the students' group projects, and Mees notes these generalize to world
models and other large-scale robot policy training, not just VLAs.

### 1. Convergence — when has training converged? (slide 35)
Rule of thumb for **autoregressive** VLAs: **wait until action-token accuracy reaches ~95%**
(the slide's plot has a dashed "95% target" line; accuracy rises from ~0.05 and crosses it
around ~60–75k steps of ~110k shown). Two caveats stated: it is computed under **teacher
forcing**, and it **does not represent real-world rollout performance** — but **below 95% you
should not bother doing real-world rollouts**. It only measures "did we pick the exact action
bin?" under the discretized scheme.

Also track **L1 and L2 action error**: how far the predicted **continuous** actions are from
ground truth *after* de-tokenizing and un-normalizing back to continuous values. On the slide
both fall from ~0.55 (L1) and ~0.85 (L2) to a plateau of ~0.1 by ~50–75k steps. (The slide
gives plots and the question "How far off are the predicted continuous actions (after
detokenization) from ground-truth actions?" — no formulas.)

### 2. Batching heterogeneous datasets (slides 36–37)
Datasets in OXE have **different observation spaces** — one embodiment has a single
third-person camera, another adds two wrist cameras for three total — so you cannot just stack
them into a batch.
- **Padding + attention masking.** Pad to the largest number of observation inputs and mask
  attention appropriately. What **Octo and CrossFormer** did; easiest to implement. Trade-off:
  "half your batch being full of zeros" — you waste a lot of FLOPs pushing zeros through the
  GPU.
- **Sequence packing.** Concatenate everything into one long sequence so each sample
  contributes exactly the tokens it has; **maximizes GPU throughput**. Cost is
  **implementation complexity**, and two concrete requirements:
  1. **Block-diagonal attention masks** — "tokens in sample $i$ can only attend to other
     tokens in sample $i$. Without this mask, sample 1 would attend to sample 3's images."
  2. **Positional encodings reset at each sample boundary** — "token 0 of every sample gets
     position 0, not its absolute offset in the packed sequence. Otherwise sample 4 would see
     'position 24+' as out-of-distribution input." Slide shows positions
     `0 1 · 0 1 · 0 1 2 3 · 0 1 2 3`.
  Bookkeeping is a cumulative sequence-length variable: slide 36 shows the packed view of four
  samples (`img|lang+act`, `img|lang+act`, `img|wrist L|wrist R|lang+act`, …) with
  **`cu_seqlens = [0, 8, 16, 32, 48]`** ← prefix sums of sample lengths.

### 3. Dataloading (slides 38–39) — "matters more than you might think"
Two strategies, compared in a table on the slide:

| | Sequential reads + shuffle buffer (Octo, OpenVLA) | True random reads (index-based samplers) |
|---|---|---|
| I/O pattern | sequential reads ✅ | random seeks — seek-bound ❌ |
| throughput | very high ✅ | lower — bottleneck at scale ❌ |
| randomness | approximate ❌ | exact — no buffer bias ✅ |
| memory | large buffer in RAM ❌ | index only — lightweight ✅ |
| obs. history | free — adjacent ✅ | extra seeks — cost × window size ❌ |

Left: stream from shards into a **shuffle buffer**, sample the batch from the buffer. **If the
buffer is too small the batches become correlated** — the degree of randomness is directly
proportional to buffer size. Right: keep a **flat index $[0 \dots N)$** over the dataset and
do random seeks per batch — exact unbiased randomness, but **fast I/O becomes critical** since
the dataset does not fit in memory.

**The Octo war story** (43:01–44:30): they started with a shuffle buffer of only **20,000
samples** combined with **trajectory-level interleaving**, and got **really poor
generalization**. Fix: shuffle and interleave **frames** from different trajectories
**before decoding the images**, which let the buffer grow to **500,000 samples**. "Nothing
else changed — same data mixture and everything" — and it made a big difference. Middle
grounds exist (e.g. chunked random reads rather than per-image).

### 4. Different action spaces across robots (slide 41, 46:01–48:00)
7-DoF arm in one dataset, 14-DoF bimanual in the next. Two popular approaches:
- **CrossFormer-style**: shared transformer backbone routing to **separate embodiment-specific
  action heads**. Benefit: variable-length outputs, accommodating different control
  frequencies. Downside: a new embodiment needs a **new head** (and fine-tuning).
- **π₀-style**: shared backbone → **a single action expert** emitting into a **unified padded
  action space**. Pick the **maximum action dimension across all embodiments** and **zero-pad**
  every robot's action to fit. Much simpler architecturally. Caveat: you typically predict a
  **fixed-length action chunk for all embodiments regardless of control frequency**. The slide
  visualizes the padding: single-arm and bimanual rows nearly full, quadruped shorter, drone
  just a stub, the remainder padding.

## Student Q&A — how does the VLA know the embodiment at test time? (48:00–51:38, slides 40–41)
Mees poses the question on slide 40 and gives 20 seconds of neighbour discussion: at test time
you have one model — how does it know whether to emit actions for a 7-DoF arm or a 14-DoF
bimanual, in each of the two designs? He calls the answers "a mixture of all your responses":

- **CrossFormer-style (multiple heads):** **explicitly handled by the user.** You specify
  which head to use as part of the **prompt or configuration** — "use the bimanual head", "use
  the quadruped head". **The routing is hard-coded by the user.**
- **π₀-style (single action expert):** **no explicit head selection** — the model must infer
  the embodiment **implicitly from the observations**: the **camera views** (different view
  types hint at the embodiment), the **proprioception** (also an input to the action head — "a
  very strong hint"), and often the **language instruction** too, because you cannot do the
  same tasks with all embodiments. Mees's example: "if you tell a Roomba 'cut the sushi', it's
  probably not going to work." The backbone learns to pick up on these cues and route
  information through the action expert accordingly.

## The current VLA recipe (51:38–54:15, slide 42)
Presented as the recipe "a lot of different labs have adopted or found success in
replicating", based mostly on the **π₀.₅** and **knowledge-insulation** papers. Two bullets:
1. **Next-token prediction for the VLM: FAST robot actions + web.** The VLM backbone is
   trained with NTP on a **mixture of FAST-tokenized robot actions and web data**. Co-training
   on web data **preserves the VLM backbone's capabilities and avoids catastrophic
   forgetting**; the FAST tokens are **good for representation learning** too. (FAST
   tokenization was covered in Ch.7.)
2. **Single action expert: flow matching + stop gradient to the VLM.** The expert produces
   **continuous** actions with a **flow-matching** head, for all embodiments. Besides **not
   attending to the FAST tokens**, it implements a **stop-gradient**: the action expert
   **reads from the VLM backbone but cannot update it**, insulating the backbone's semantic
   capabilities — and this also helps convergence and training speed.

Slide layout: image tokens (cameras + web) · language tokens (NTP loss) · FAST action tokens
(NTP loss) into the **VLM backbone**; a stop-gradient barrier; then the **action expert
(flow matching loss)** emitting continuous actions, shown as `-1.7 | 1.25 | 3.14 | 1.42`.
Marked "✗ stop gradient — action expert cannot update backbone".

> π₀.₅: a Vision-Language-Action Model with Open-World Generalization. Physical Intelligence
> (2025). · Knowledge Insulating Vision-Language-Action Models: Train Fast, Run Fast,
> Generalize Better. **Driess** et al., Physical Intelligence (2025).

Mees defers the newest model to Quan Vuong's guest lecture that day.

## Ingredient 3 — scalable evaluation (54:15–62:01, slides 43–52)
Slide 43/44/45: **robot evals are tedious, expensive and difficult to reproduce.** Mees polls
the room ("has anyone done rollouts with your SO-101 yet?", "how many people had hardware
failures?" — "Oh my god. Lots of hardware failures.") and lists the failure modes:
- Someone **bumps into the third-person camera** → its pose changes → out of distribution →
  the policy stops working → collect new data, fine-tune.
- **Hardware failures**: you replace motors to save the robot, and now **proprioception reads
  differently** from the data the policy was trained on.
- **Grippers get stuck.**
- Evals are just **slow**: low-frequency control, "you wait there for 2 minutes to see if it
  grasped something or not."

**Simulation** helps two ways (slides 45–46): it **democratizes research** for people without
your robot setup, and it is **more reproducible** — no bumped cameras, no changed proprio.

**SIMPLER** — started as a parallel project during Octo's development, with **Quan Vuong** and
**Ted Xiao** (both then at Google; Ted gave a guest lecture earlier in the course).

> Evaluating Real-World Robot Manipulation Policies in Simulation. Li\*, Hsu\*, Gu\*,
> Pertsch†, **Mees**† et al., CoRL 2024.

Goal: leverage **sim-to-real for policies trained exclusively on real-world data** — evaluate
real-world policies in simulation in a way that **informs** you about real-world performance,
so you can run a large number of evals in sim. Environments shown for **Google Robot** and
**BridgeData V2**.

**Does it work?** (slide 48) Real and SIMPLER success rates are **strongly correlated** — a
scatter plot over **RT-1, RT-1-X, RT-2-X and Octo** with a fitted diagonal: "How correlated
are real and SIMPLER performance measures? **Very!** SIMPLER is a reliable proxy for real
robot evaluation." Correlation holds **across models** *and* **across distribution shifts**
(slide 49) — SIMPLER reproduces an RT-1 policy's robustness ranking:

| Distribution shift | Δ real success rate | Δ SIMPLER success rate |
|---|---|---|
| Camera pose | −0.38 | −0.39 |
| Table texture | −0.17 | −0.19 |
| Background | −0.17 | −0.12 |
| Distractors | −0.08 | −0.06 |
| Lighting | −0.04 | −0.07 |

**What matters for a good simulated evaluation** (slides 50–51):
1. **Accurate control dynamics via system identification (SysID).** Mitigate the **control
   gap**: the same **open-loop action sequence** must move the simulated end-effector the way
   it moves the real one. Done with a SysID procedure on a **small number of real-world
   samples**. In a nutshell: the low-level controller in sim and real should produce the same
   outputs. Slide shows the same open-loop sequence under **Real / Sim w/o SysID / Sim after
   SysID (ours)**.
2. **Mitigate visual distribution shift via "visual matching".** Not photorealism — "not like
   NVIDIA Isaac Lab style". Two simple steps: **green screening** (segment out the interactive
   simulated assets and overlay them onto **real-world backgrounds**) and **texture matching**
   (project **real object textures** onto the simulated assets — e.g. take a real Coke can's
   texture and put it on the simulated can).

**The essential caveat** (60:01–61:00): SIMPLER gives you **correlated, not absolute**
performance. A 50% sim success rate on picking up the Coke can does **not** predict a
particular real-world success rate. What it does give is **pairwise comparison**: if policy A
beats policy B in SIMPLER, that ordering also holds in the real world. The paper covers how to
measure this with **ranking** metrics.

**Follow-up work on real-to-sim evals** (slide 52): **PolaRiS** — Scalable Real-to-Sim
Evaluations for Generalist Robot Policies (Jain et al., 2025; tools for scalable real-to-sim
environment generation, a simulation dataset for bridging the real-to-sim gap, evaluation
environments with strong real-to-sim correlation, and a hub for environment sharing);
**RobotArena ∞** — Scalable Robot Benchmarking via Real-to-Sim Translation (Jangir et al.,
2025); **RoboLab** — A High-Fidelity Simulation Benchmark for Analysis of Task Generalist
Policies (Yang et al., 2026). Mees adds there may be others he is not aware of. The value:
practitioners without every robot setup can still test whether a generalist policy is actually
generalist.

## Conclusion (62:01–63:27, slides 43/53/54)
The three-ingredient table, completed:

| Large datasets | Large models | Scalable evaluation |
|---|---|---|
| Leverage **existing robot data** — aggregate into a common format that enables co-training (OXE) | **Cross-embodied policies** with **internet-scale priors** (Octo → CrossFormer → VLAs) | Leverage **real-to-sim evals** (SIMPLER and successors) |

## Definitions for glossary
Generalist robot policy; robot foundation model (RFM); specialist vs generalist policy;
cross-embodiment learning; Open X-Embodiment (OXE); co-training; common data format;
multimodal sequence modelling; task token; observation token; readout token; block-wise causal
masking; goal-state-conditioned behaviour cloning; diffusion action head; embodiment-specific
action head; unified padded action space; action expert; vision-language-action model (VLA);
action tokenization / vocabulary override; action-token accuracy; L1/L2 action error; sequence
packing; block-diagonal attention mask; cumulative sequence lengths (`cu_seqlens`); shuffle
buffer; trajectory-level vs frame-level interleaving; true random reads; knowledge insulation;
stop gradient; FiLM conditioning; real-to-sim evaluation; system identification (SysID);
visual matching (green screening, texture matching); correlated vs absolute evaluation.

## Papers named
**Open X-Embodiment Collaboration, …, Mees et al., ICRA 2024** (OXE + RT-X, Best Paper of
1765); **Octo Model Team, Ghosh\*, Walke\*, Pertsch\*, Black\*, Mees\* et al., RSS 2024**
(Octo); **Doshi\*, Walke\*, Mees, Dasari, Levine, CoRL 2024** (CrossFormer, oral, top 4% of
670); **Li\*, Hsu\*, Gu\*, Pertsch†, Mees† et al., CoRL 2024** (SIMPLER); Liu et al. 2023
(LLaVA / Visual Instruction Tuning); RT-1; RT-1-X; RT-2 / RT-2-X (55B); OpenVLA; Gato (Reed et
al. 2022, assigned); π₀; **π₀.₅, Physical Intelligence 2025**; **Driess et al. 2025**
(Knowledge Insulating VLAs); an **unnamed TRI pre-training study** (see [UNCLEAR] above);
**Jain et al. 2025** (PolaRiS); **Jangir et al. 2025** (RobotArena ∞); **Yang et al. 2026**
(RoboLab). Prior datasets pictured: Bridge V2, Fractal, RoboTurk, RoboNet. Baselines named on
slide 7: MVP BC-RNN, ResNet + MLP, VINN, TACORL, HULC2. Assigned but not covered in the
lecture: Lynch et al. 2021 (Language Conditioned Imitation Learning over Unstructured Data),
π\*₀.₆.

## Figures worth reproducing
- `slide_005.jpg` — Open X-Embodiment scale card (1M+ / 22 / 34 / 300+) with the lab logos.
- `slide_007.jpg` — "Sparks of a generalist robot policy" bar chart (RT-1-X vs specialists).
- `slide_010.jpg` — robot data is heterogeneous (sensors, actuators, control frequencies).
- `slide_013.jpg` — robotics as multimodal sequence modelling (language/image/action tokens).
- `slide_018.jpg` — full Octo architecture with the diffusion action head.
- `slide_019.jpg` — the four OXE gripper conventions and the single target convention.
- `slide_027.jpg` — CrossFormer: flexible action spaces [2,…,1400], 5–50 Hz, five embodiments.
- `slide_028.jpg` — CrossFormer architecture with four embodiment-specific heads.
- `slide_033.jpg` — VLM → VLA side by side (vocab reuse, de-tokenization to Δ-pose).
- `slide_035.jpg` — convergence: action-token accuracy with the 95% line, plus L1/L2 error.
- `slide_036.jpg` + `slide_037.jpg` — sequence packing, `cu_seqlens`, block-diagonal mask.
- `slide_038.jpg` — dataloading trade-off table.
- `slide_041.jpg` — cross-embodiment heads: CrossFormer-style vs π₀-style padded space.
- `slide_042.jpg` — the current VLA recipe (NTP + FAST, action expert, stop gradient).
- `slide_048.jpg` — real vs SIMPLER success-rate correlation scatter.
- `slide_049.jpg` — distribution-shift deltas, real vs SIMPLER.
- `slide_050.jpg` + `slide_051.jpg` — SysID and visual matching (green screen + textures).
- `slide_053.jpg` — the completed three-ingredient summary (chapter opener/closer).

## [UNCLEAR] / caveats
- **Deck numbering is off by one.** The title slide reads "**Lecture 10**: Generalist Robot
  Policies" although this is the **9th** main lecture (playlist position 9; dated 27.04.2026,
  matching Week 9 / Apr 27 on the course page; L7 and L8 decks are numbered correctly). Use
  lecture/chapter 9 and do not repeat the slide's label.
- `> [UNCLEAR: lecture 9, 30:55–33:49 — TRI multi-task-pretraining study: no stable slide
  captured, so the paper title and authors are unrecoverable from the deck.]`
- **Caption garble on Octo's attention mask** (16:00): the captions read "all the task tokens
  cannot attend to each other, but they can't look at the observation tokens", which is
  self-contradictory. Reconstructed above from the following sentence about observation tokens
  plus slides 16–18 (Task / Observation / Readout blocks). Verify against the Octo paper before
  the sentence goes into Ch.9 as a claim about the mask.
- Caption manglings fixed against the slides: "Lava" → **LLaVA**; "Danny Drees" → **Driess**;
  "ORC-E" → **OXE**; "by manual" → **bimanual**; "Pi Zero" / "Pi 05" → **π₀ / π₀.₅**;
  "SR101" / "S O one zero one" → **SO-101**; "generous robot policy" → **generalist robot
  policy**; "Polaris" → **PolaRiS**; "Robot Arena Infinity" → **RobotArena ∞**; "find unit"
  → **fine-tune it**; "reproducable" is the slide's own spelling (slides 45–47).
- Numbers read off charts (CrossFormer slide 29, convergence slide 35) are **approximate** —
  the slides print no values. The OXE bar chart (slide 7) and the SIMPLER shift table (slide
  49) *do* print values and are exact as tabulated.
- **RT-2-X's 55B parameter count** and **Octo's 800k trajectories** come from the transcript
  only; neither number appears on a slide.
- Course logistics in this lecture (SO-101 group projects, hardware-failure poll) is colour,
  not content — at most a line in the preface.
- Mees's own work dominates: OXE, Octo, CrossFormer, SIMPLER. Also note RT-1-X loses on
  Autolab UR5 and CrossFormer loses on Franka; keep both in Ch.9's "where this breaks".

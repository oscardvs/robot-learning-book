# Lecture 10 — Embodied Reasoning and Test-time Scaling (raw notes)

- Video: <https://www.youtube.com/watch?v=CxhrjQuGEuE> (55.6 min)
- Transcript: `transcripts/10_reasoning.txt` (7,491 w) · Slides: `slides_png/lecture10/`
  (44 frames) · OCR `slides/lecture10.txt`
- Speaker: Oier Mees. Dated **04.05.2026**. Assigned (wk10): Fu et al. 2024 (In-Context
  Imitation Learning via Next-Token Prediction); Wang et al. 2023 (VOYAGER); **Chen et al.
  2025** (Training Strategies for Efficient Embodied Reasoning = ECoT-Lite, deep-dived here).
  Guest: **Archit Sharma** (Google DeepMind; Gemini Deep Think).
- Mees calls this "one of the frontiers nowadays in robot learning". His own work again: ECoT,
  ECoT-Lite and ARGOS. Several slides are credited to **Will** (Zawalski) — "adapted from Will".

**The argument in one line.** Data gives you a **better prior over behaviours** — it compresses
the demonstration distribution into the weights. What it does not give you is **reasoning**, so
an out-of-distribution situation has no mechanism to work its way out of. Reasoning is
**compositional**: reusable building blocks of logic and knowledge, recombinable to solve novel
problems from existing knowledge, so you need not have seen the situation before. Four takeaways
(slide 43) close the chapter.

## Framing — is scaling robot data all we need? (00:01–05:00, slides 1–4)
Slide 2: "**Is Scaling Robot Data All We Need?** — **No…**" Mees is careful: data absolutely
matters, this is not an anti-data argument. But even the most capable VLA, in an OOD situation,
"typically doesn't have a mechanism to intelligently work its way out of it — it will fail."
The analogy (slide 3): **LLMs train on orders of magnitude more data than the largest VLAs, and
all of the internet is still not enough** to solve everything we want from them; for robots,
where data is orders of magnitude more expensive, it is "almost certainly not going to be enough
either". So LLMs now **train specifically for reasoning** (slide 3 shows ChatGPT and DeepSeek
logos). Slide 3's right-hand caption defines the goal — **Intelligent Reasoning: Generalization,
Interpretability, Interaction, Controllability**.

Slide 4 reuses Ch.9's framing: because robotics is already **multimodal sequence modelling**
over language, image and action tokens, the course has been importing architectures,
pre-training objectives and scaling strategies from LLMs/VLMs. Two questions on the slide:
**"Can we transfer algorithmic improvements like reasoning?"** and **"Can a robot think harder
to act better?"**

## Embodied Chain-of-Thought (05:00–13:00, slides 5–14)
Core idea (slide 5): instead of mapping image + instruction **directly** to actions, **insert
intermediate reasoning steps** — a plan, the next sub-task, the movement, grounded in the image.
Chain of thought applied to the physical world. Slide 5's bullets: "Standard policies directly
map images to actions" · "**✗ They thus often fail on novel tasks**" · "We thus propose to add
*embodied* reasoning to the policy".

> Robotic Control via Embodied Chain-of-Thought Reasoning. **Zawalski\*, Chen\*, Pertsch,
> Mees, Finn, Levine.** CoRL 2024.

### Where does the reasoning data come from? (slides 6–7)
You cannot ask human annotators to label every trajectory in a large robot dataset with a plan,
a sub-task description, bounding boxes and gripper positions — "that isn't really scalable".
Instead: **distil internet-scale foundation models to annotate the existing robot dataset**.
Slide 6 names the suite used: **Gemini**, **OWLv2 + SAM**, **Prismatic VLM**, **Grounding
DINO**, applied to a robot trajectory from the dataset, producing the **Embodied
Chain-of-Thought Dataset**. A verbatim generated example (slides 6–7):

```
TASK:     Place the watermelon on the towel
PLAN:     1. Move to watermelon  2. Firmly grasp it  3. …
SUBTASK:  The watermelon is the first object the robot needs to interact with
          → Move to the watermelon
MOVE:     The watermelon is behind the robot, so it needs to move backward
          → Move backward
GRIPPER POS:   [156, 55]
VISIBLE OBJS:  Watermelon [126, 146, 141, 125], Towel [20, 59, 218, 198], …
```

### Architecture (slides 8–9)
"**Think carefully**" and "**look carefully**" before acting. An **autoregressive VLA** that
predicts the intermediate grounded reasoning steps — task, plan, sub-task, movement, gripper
position, visible objects with bounding boxes — **before** predicting the action tokens, so the
**action tokens are conditioned on the auxiliary reasoning tokens**. Slide 9 lays the chain out
left to right (Input → Generated Embodied Chain-of-Thought → Robot Action) and groups it:
**Semantic Reasoning** (task, plan, sub-task) then **Visual Reasoning** (gripper position,
visible objects with boxes, move), ending in `ACTION: [Δx, Δθ, ΔGrip] = …`.

### Results (slides 10–13)
Evaluated in deliberately hard **real-world OOD scenarios** — distractor objects, spatial
relations, unseen objects, unseen instructions. Slide 10: "**Boosts performance 30% without
extra robot data**", success-rate bars (approximate, axis 0–70):

| Model | Success rate |
|---|---|
| **ECoT (Ours)** | ≈65 |
| RT-2-X | ≈47 |
| OpenVLA | ≈36 |
| Octo | ≈19 |

The **30%** arrow on the slide spans OpenVLA → ECoT. Two claims Mees stresses: the gain is over
**the same model without reasoning** (OpenVLA, **7B**), and it also beats **RT-2-X, a 55B VLA
from Google**. So: **for the same teleop data you already have, ~30% better generalization**.

**Interpretability and interactiveness** (slides 11–12) come free: the reasoning steps are
human-readable, so a failure is legible, and **a human can edit the reasoning chain online at
test time** — because the action tokens are conditioned on it, the policy self-corrects. Slide
example: instruction "Pick up any object that is **not** yellow"; the robot misbehaves due to
incorrect reasoning ("Subtask: Move to the yellow cloth / Move: Move left" ✗); **ChatGPT's
corrected reasoning** ("The eggplant is a non-yellow object and should be picked up → Move to
the eggplant" ✓) fixes the behaviour.

**Reasonings generalize to unseen robots** (slide 13) — Mees's favourite experiment here. The
reasoning was trained on **a single dataset only (the WidowX / Bridge setup)**, then asked to
produce reasonings for **other OXE datasets**: novel robot, novel camera, everything new — and
the chains stay plausible. Slide 13 shows four such transfers, each with detections and a full
TASK/PLAN/SUBTASK/MOVE chain: a black bowl into a blue sink; a banana to a plate; a carrot into
a red bowl; a grey sponge onto a yellow towel. **Why it works**: many of the reasoning
sub-tasks are close to **VLM pre-training tasks**, so the VLM already carries the needed world
knowledge — embodied CoT is **unlocking reasoning that is already inside the VLM**. Implication:
a principled way to **transfer reasoning across embodiments** without collecting and annotating
demonstrations for every new morphology.

**Impact** (slide 14): a new standard for training VLAs with reasoning; improves
generalization, interpretability and interactiveness; **adopted in industry and academia** —
**Gemini Robotics VLA 1.5 incorporates it as a core component**, which Mees reads as the field
"converging towards treating reasoning as a first-class component in robot policies".

**Follow-ups** (slide 15, 13:01–13:43) — four, all worth reading:
- **MolmoAct: Action Reasoning Models that can Reason in Space** (Lee et al., 2025) — adds
  **depth perception tokens** and a **visual reasoning trace** to a pre-trained action
  reasoning model, i.e. spatial reasoning.
- **CoT-VLA: Visual Chain-of-Thought Reasoning for VLAs** (Zhao et al., 2025) — causal +
  full-attention over predicted future frames.
- **Action-Free Reasoning for Policy Generalization** (Clark et al., 2025) — "**RAD** learns
  broad reasoning from human data + robot data, and action generation from just robot data",
  i.e. **transfers action-free reasonings from human data by decoupling reasoning training from
  action prediction**.
- **Self-Supervised Bootstrapping of Action-Predictive Embodied Reasoning** (Ganai et al.,
  2026).

## The inference-cost problem (13:43–15:06, slides 16–17)
Reasoning multiplies the tokens generated per action. Slide 16, stated bluntly:

| | Inference speed |
|---|---|
| Autoregressive VLA (**OpenVLA**, 7B) | **4 actions / second** |
| **Embodied Chain-of-Thought Reasoning** | **4 seconds / action** 😢 |

A 16× swing. Mees's anecdote: the first real rollouts on the WidowX, run by lead authors
**Will and Michal**, were "really painful just to watch… one task was taking forever" (he
guesses ~1 Hz); speed optimizations came later. Roboticists need real-time control, so slide
17: **"Can we get the benefits of reasoning without the inference costs?"**

## Why does embodied reasoning help at all? (15:06–21:00, slides 18–19)
Mees pauses deliberately here, and the methodological aside is worth quoting in Ch.10: machine
learning tends to see something work, get excited and move on — but **without knowing why it
works you cannot know when it will fail or how to improve it**, so you cannot build on it in a
principled way. "The same scientific rigour we apply when experiments fail, I believe we should
also apply when things succeed."

Three hypotheses (slides 18–19, one figure built in three colours):

1. **Better representation learning.** The reasoning traces supply extra supervision that
   shapes internal representations — signalling that this object's location or that movement
   matters — forcing richer, more semantically grounded scene representations. Slide caption:
   **"Train on both, but only choose *actions* at test time."** If this is the primary
   mechanism, what matters is **the training signal, not generating reasoning at test time**,
   so you could train with reasoning and deploy without it, recovering low latency.
2. **Improved learning "curriculum".** Predicting continuous robot actions is **extremely OOD**
   for a VLM pre-trained on visual question answering; fine-tuning end-to-end straight to
   continuous actions is hard. Reasoning may act as an **implicit curriculum** — first learn
   easier intermediate mappings (movement description → action), then work up to pixels →
   actions. If true, reasoning could be **pure training scaffolding**: provide reasoning
   examples **in context during training but with no loss on them**, then remove at inference.
3. **Increased policy expressivity.** Simply having **more tokens in context increases the
   transformer's expressive capacity when predicting actions — even if the tokens are
   semantically meaningless**. Slide 19: "More tokens in-context improves expressivity (even
   when meaningless)", with a `<THINKING>` block feeding the action. Well documented in LLM
   work; the slide cites **Let's Think Dot by Dot: Hidden Computation in Transformer Language
   Models** (Pfau et al., 2024) and **Think before you speak: Training Language Models With
   Pause Tokens** (Goyal et al., 2024) — transformers using intermediate tokens as a **scratch
   space for hidden computation**.

The sharp question this raises: **how much of the benefit is the semantic content of the
reasoning, and how much is just the extra compute the extra tokens buy?** If mostly the latter,
the careful grounding matters less than we think and the benefit could be had far more cheaply
than by running foundation models to produce nice labels.

## ECoT-Lite — testing the hypotheses (21:00–26:02, slides 20–23)
The three mechanisms are **isolated empirically on LIBERO-90**.

> Training Strategies for Efficient Embodied Reasoning. **Chen, Belkhale, Mirchandani, Mees,
> Driess, Pertsch, Levine.** CoRL 2025. (= the assigned wk10 paper.)

**LIBERO-90 success rate** (slide 20; axis 70–90, values read off the chart, approximate):

| Variant | Success rate | Reasoning at test time? |
|---|---|---|
| **Embodied CoT** (full) | ≈90 | yes |
| **Reasoning Dropout** | ≈89.5 | optional |
| **Reasoning Pre-training** | ≈87 | no |
| Reasoning "Scaffolding" | ≈84 | no (input context, no loss) |
| Standard VLA | ≈82 | n/a |
| Thinking Tokens | ≈79.5 | null tokens |

Readings: **reasoning pre-training and reasoning dropout both remove reasoning at test time and
perform almost as well as full ECoT**. **Scaffolding** (reasoning as input context, no loss)
also does quite well. **Thinking tokens** — null/meaningless tokens — is **worse than the
standard VLA**, i.e. hypothesis 3 does *not* carry the benefit here. Mees corrects himself live
on this point mid-sentence ("although better than the standard VLA doesn't close the — oh, it's
not better, it's a bit worse").

**The two winning recipes** (slides 21–22):
- **Reasoning pre-training** — two stages. Stage 1: fine-tune the VLM to predict **only the
  reasonings** (plan, sub-task, move, bounding boxes, gripper), **no action loss and no action
  prediction**. Stage 2: take that model and fine-tune it to predict **continuous actions
  only**, no reasoning. You transfer **just the representations** learned in stage 1 and pay no
  inference cost. Slide 21 labels the stage-1→stage-2 arrow **"Transfer"**.
- **Reasoning dropout** — a **single joint training stage** like the original ECoT (predict
  reasonings and actions together), except the reasonings are **randomly dropped with some
  probability**, so the model also learns to emit action tokens **not** conditioned on
  reasoning. At test time you can **switch reasoning on or off in one model**.

**Real-world results, Bridge WidowX setup** (slide 23) — left: policy performance vs inference
frequency, showing full **Embodied CoT** top-left (strong, slow) and **Standard VLA**
bottom-right (weak, fast), with **ECoT-Lite variants** in the desirable top-right corner. Bar
values read off the chart (approximate):

| | Bridge success rate | Inference rate (Hz) |
|---|---|---|
| Embodied CoT | ≈78 | ≈0.5 (extended to ≈1.3 by a hatched segment) |
| Reasoning Pre-training | ≈70 | ≈3.5 |
| Reasoning Dropout | ≈61 | ≈3.5 |
| Standard VLA | ≈50 | ≈3.5 |

Slide caption: "**ECoT-lite is faster than reasoning policies and stronger than non-reasoning
policies**" · "More performant than standard VLAs *without* sacrificing speed!" Mees's summary:
full ECoT is best on generalization but at the lowest frequency; the two lite variants are
slightly worse on generalization at **the same frequency as a standard VLA**.

**Which to use** — it depends on your constraints:
- The **original** is too slow for most real-time settings.
- **Reasoning pre-training** is best when your **reasoning and action data are not paired** —
  e.g. transferring reasonings from simulation or human data.
- **Reasoning dropout** is **most flexible**: one model, reasoning toggled to fit your latency
  budget.

## Test-time compute scaling (26:02–34:00, slides 24–29)
Everything so far used a **fixed compute budget** at test time — the original ECoT was trained
on a fixed number of reasoning steps (Mees: "these are seven different reasoning steps, so I
will always produce all seven"). Slide 24: "**Can we do better by letting it think longer at
test time?**"

**"Isn't this just planning?"** (slide 25) — a comparison table Mees puts up pre-emptively,
running from hand-specified domains to open-ended tasks; each column **trades explicit
structure for generality**:

| | Classical planning (A\*, STRIPS, PDDL) | Learned planning (Chess, Go, Atari) | LLM reasoning (CoT, GRPO, R1) |
|---|---|---|---|
| **World model** | Hand-specified — transition function | Learned — policy + value network | Implicit in weights — no explicit model |
| **Search / thinking** | Explicit tree search — A\*, BFS, DFS | MCTS rollouts — many sims per move | Token generation — sequential reasoning |
| **Verifier** | Goal test — exact, hand-specified | Win / loss — exact, from game rules | Rule-based reward — math grader, unit test |
| **Scope** | Known domains — structured, discrete | Discrete games — bounded action space | Open-ended tasks — language, code, robots |

**AlphaGo — the canonical example** (slide 26, adapted from **Noam Brown**'s slides; data from
**Mastering the Game of Go without Human Knowledge**, Silver et al., *Nature* 2017). Elo
ratings read off the chart:

| | Elo |
|---|---|
| **Raw Network** (no test-time search) | ≈3030 |
| **AlphaGo Zero** (full, with MCTS) | ≈5190 |
| AlphaGo Master | ≈4860 |
| AlphaGo Lee | ≈3730 |
| AlphaGo Fan | ≈3130 |
| Crazy Stone | ≈1890 |
| Pachi | ≈1290 |
| GnuGo | ≈420 |
| *Superhuman performance* (dashed line) | ≈3650 |

**The rule of thumb on the slide: gaining ~120 Elo requires either 2× model size or 2×
test-time search** — the two are interchangeable. Consequence, also printed on the slide:
"**Improving the raw policy from 3000 to 5200 Elo points would require scaling the model by
~100,000×**." Mees's caveats, spoken: the number is probably inflated because AlphaGo was
trained against earlier checkpoints of itself; but — "as far as I know, to this day no one has
built a model that surpasses human performance without test-time compute search. **Every Go
agent uses test-time search.**"

**Does it hold in language?** (slides 27–28) Yes, **with a nuance**.

> Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters.
> **Snell et al., 2024.**

Slide 28 headline: **compute-optimal test-time scaling beats a ~14× larger model on
easy/medium problems at equal FLOPs**. Mechanism, per the slide: **SFT on the model's own
failed attempts plus a learned verifier** — the model learns to produce a better answer given
previous wrong ones, and the verifier picks the best; then at test time, **generate multiple
answers and select the best with the verifier**. Mees's gloss: thinking here is **search over
the model's own output distribution guided by a reward signal**.

The plot — *relative improvement in accuracy from test-time compute (%)* against the **ratio of
inference tokens to pre-training tokens** — printed values, exact:

| Ratio | Easy | Medium | Hard |
|---|---|---|---|
| ≪1 | **+21.6%** | **+27.8%** | **+11.8%** |
| ≈1 | **+16.7%** | **+3.5%** | **−11.9%** |
| ≫1 | **+5.4%** | **−24.3%** | **−37.2%** |

**The picture flips on hard questions**: at a high inference-to-pretraining ratio you are far
better off having pre-trained a bigger model. The intuition Mees gives: **test-time compute
amplifies what the model already knows — if the right answer is nowhere in the model's
distribution, no amount of search recovers it.**

**Why do reasoning tokens help — the theory** (slide 29):

> Chain of Thought Empowers Transformers to Solve Inherently Serial Problems. **Li et al.,
> 2024.**

Three bullets, verbatim in substance:
- **Any problem solvable in $T$ computational steps can be solved by a constant-size
  transformer generating $O(T)$ reasoning tokens.**
- **Generating $O(T)$ intermediate tokens before the answer gives the model $O(T)$ effective
  computation steps.**
- **Without reasoning tokens: needs a much deeper/larger model, or can't solve the problem at
  all.**

The intuition: a single forward pass has **fixed computational depth bounded by the number of
layers**, so it can execute only a constant number of sequential steps; generating intermediate
tokens autoregressively **unrolls additional computation at test time**. Mees names this the
**formal counterpart of hypothesis 3** (the thinking-tokens/expressivity hypothesis).

## Where CoT came from, and why it needs a big model (34:00–38:00, slides 30–32)
**Chain-of-Thought Prompting Elicits Reasoning in Large Language Models** (Wei, Wang et al.,
NeurIPS 2023). Slide 30 is the original side-by-side: standard prompting answers the tennis-ball
question "The answer is 11", then gets the cafeteria question wrong ("The answer is 27 ✗");
CoT prompting writes the intermediate arithmetic out ("Roger started with 5 balls. 2 cans of 3
tennis balls each is 6 balls. 5 + 6 = 11") and gets the second right ("23 − 20 = 3, they bought
6 more, so 3 + 6 = 9 ✓"). Slide caption: **more tokens = more computation steps**.

**The catch** (slide 31): **CoT prompting does not work with small base models.** The scaling
figure (GSM8K / SVAMP / MAWPS solve rate vs model scale in billions, for LaMDA / GPT / PaLM)
shows CoT **hurting** performance at small scale and only **breaking free somewhere around the
100B mark**, where it overtakes the prior supervised best. Takeaway: **reasoning emerges and
needs a base model that is good enough**. (Mees adds you can nowadays **distil** it into smaller
models, but you need a strong base model for it to emerge in the first place.)

**Original CoT = few-shot / in-context learning** (slide 32): manually write out examples with
reasoning traces, prepend to the prompt, ask it to generalize. Three limitations printed with
warning icons: **prompt-sensitive, brittle** · **requires human input** · **doesn't generalize
beyond the examples**.

So (slide 33): **"Instead of eliciting reasoning with human prompts, can we train the model to
reason intrinsically?"**

## Training a model to reason — GRPO (38:00–46:00, slides 34–37)
**What trained reasoning looks like** (slide 34, from **DeepSeek-R1 Thoughtology: Let's think
about LLM reasoning**, Marjanović et al., 2026). Same problem ("James writes a 3-page letter to
2 different friends twice a week. How many pages does he write a year?") given to a **single
chain of thought** (GPT-4o: clean, structured, template-following, 12 pages/week × 52 = **624
pages/year**) and to a **large reasoning model** (DeepSeek-R1, in `<think>` tags): messy,
**second-guesses itself** ("Wait, if he writes to 2 friends twice a week, does that mean…"),
considers alternative interpretations, double-checks, and **even wonders about leap years**
before concluding 624. The point: this is a model that **learned to reason through RL on
verifiable outcomes**, not one following human-written examples — so its thinking process need
not resemble a human's.

**How** (slide 35): reinforcement learning, and **GRPO** (**group relative policy
optimization**) is now the popular choice.

> DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models. **Shao et
> al., 2024.**

Slide bullets: "**Sample answers, compare with each other, update toward good ones**" · "**No
reward model, no value function, no human labels**."

Motivation Mees gives: GRPO is closely related to **PPO** (Ch.5), and the key problem in
applying PPO to language models is that **the critic — the value function — is expensive and
hard to train**, because you need a separate network estimating expected returns for every
possible token sequence. GRPO removes it: **sample a group of $G$ rollouts for one question and
compute advantages relative to the group.**

**The two equations, transcribed from the slide image (verified at full resolution):**

$$\hat{A}_i \;=\; \frac{r_i - \mu_{\mathbf{r}}}{\sigma_{\mathbf{r}}}$$

$$\mathcal{L} \;=\; \frac{1}{G}\sum_{i=1}^{G} \min\!\Big(\rho_i\,\hat{A}_i,\ \operatorname{clip}\!\big(\rho_i,\, 1\pm\varepsilon\big)\,\hat{A}_i\Big)\;-\;\beta\,\operatorname{KL}\!\big(\pi_\theta \,\|\, \pi_{\text{ref}}\big)$$

Symbol legend, exactly as the slide gives it:
- $\rho_i = \pi_\theta/\pi_{\text{old}}$ — **importance ratio**
- $\operatorname{clip}(\rho_i, 1\pm\varepsilon)$ — **trust region** ($\varepsilon \approx 0.2$)
- $\beta\cdot\operatorname{KL}(\pi_\theta\|\pi_{\text{ref}})$ — **drift penalty from
  $\pi_{\text{ref}}$**
- $\hat{A}_i$ — **group-relative advantage**
- $r_i$ — **binary reward** (slide: "correctness, format"); $\mu_{\mathbf r}, \sigma_{\mathbf r}$
  — mean and standard deviation of the rewards **within the group**
- $G$ — number of rollouts sampled per prompt; the pipeline on the slide is
  **Prompt $q$ → Policy $\pi_\theta$ → $G$ rollouts (chain-of-thought + answer) → reward $r_i$
  (binary) → advantage $\hat A_i$ → GRPO objective $\mathcal{L}_{\text{GRPO}}$ → updated
  $\pi_{\theta'}$**, with "↑ reinforce / ↓ suppress" on the update and a callout box: **"No
  critic model — rewards relative to other samples in the group."**

**The worked example on the slide** (use this in Ch.10 — it is the lecture's only numeric
example). Question: *"A train travels 60 miles in 90 minutes. What is its average speed?"* Five
sampled rollouts:

| Rollout | Reasoning | Answer | $r_i$ |
|---|---|---|---|
| 1 | $60 \div (90/60) = 60 \div 1.5$ | 40 mph ✓ | 1 |
| 2 | $90\ \text{min} = 1.5\ \text{h},\ v = 60/1.5$ | 40 mph ✓ | 1 |
| 3 | $\text{speed} = 60/1.5 = 40$ | 40 mph ✓ | 1 |
| 4 | $60 \div 90 \approx 0.67 \times 60$ | 45 mph ✗ | 0 |
| 5 | $\text{speed} = 60/90 = 0.67$ | 0.67 mph ✗ | 0 |

Three correct, two wrong → the group mean and standard deviation set the advantages, and **the
model learns by comparing its own outputs against each other**. What is *missing* is the point:
**no human labels, no reward models, no value functions** — with only **binary verifiable
answers** (e.g. maths), reasoning emerges, because the only way to consistently get the right
answer is to learn to think carefully.

**Why didn't this work before?** (slide 36) People had been doing RL with LLMs for years. The
answer the community now accepts: **"Base LLM needs to be good enough to produce any correct
rollouts to reinforce!"** If the base model is too weak to ever produce a correct rollout,
**there is nothing to reinforce**. What changed in the last ~1.5 years is that modern LLMs
crossed the capability threshold where they **occasionally** solve hard problems on their own —
after which RL can take over and systematically amplify that capability.

**Emergent reasoning behaviour** (slide 37, Figure 9 of **DeepSeek-R1: Incentivizing Reasoning
Capability in LLMs via Reinforcement Learning**, DeepSeek-AI, 2026): two panels — (a) frequency
of representative **reflective words** during training, (b) occurrence pattern of the word
**"wait"**. Reading: the model **never says "wait" until roughly step 6,000**, then discovers
that stopping to reconsider improves its reward and the frequency of reflective language
("let's think about this again") **jumps dramatically**. Nobody told it to say "wait"; nobody
labelled traces as good or bad; the signal was **binary correctness only**. Mees's verdict:
"one of the most compelling demonstrations of what reinforcement learning can do that
supervised learning fundamentally can't — **discover strategies that nobody explicitly
specified**." Corollary: on a weak base model, RL never gets past step zero.

## Does RL reasoning transfer to vision? (46:00–51:00, slides 38–41)
Yes — many papers in the last year; **Visual-RFT** is, as far as Mees knows, among the first.

> Visual-RFT: Visual Reinforcement Fine-Tuning. **Liu et al., 2025.**

Slide 39 bullets: **applies GRPO to enhance visual grounding of VLMs**, and **the verifier is
IoU (geometric), not a math grader** — intersection-over-union between the predicted and
ground-truth bounding box. The model still reasons inside `<think>` tags ("The vehicle has a
door that can be opened. The door is located on the right side of the vehicle, near the top.")
then predicts a box; **better reasoning → better localization → reinforced**. Rewards on the
slide:

$$R_{\text{IoU}} = \begin{cases} f(\text{IoU}), & \text{if match}\\ 0, & \text{otherwise}\end{cases}
\qquad\qquad
R_{\text{cls}} = \begin{cases} 1, & \text{if } P_{\text{cate}} = GT_{\text{cate}}\\ 0, & \text{otherwise}\end{cases}$$

where $P_{\text{cate}}$ is the predicted category and $GT_{\text{cate}}$ the ground-truth
category. The slide also shows a classification example (a columbine flower) reasoned about in
`<think>` and answered in `<answer>` tags. **Key insight: GRPO is agnostic to the verifier — any
verifiable reward will do**, and the vision community has many other geometric metrics available
for grounding VLMs with RL.

**The failure mode** (slide 40): **standard GRPO rewards the final answer only, so the reasoning
trace is invisible to the verifier.** In maths this is mostly fine — it is hard to reach the
right answer through wrong reasoning. **In vision, hallucinated reasoning and correct answers
are not mutually exclusive**: a model can describe a completely hallucinated scene in its
`<think>` block and still predict the right bounding box, by luck or by pattern-matching the
image directly.

**ARGOS** — Mees's fix, done at Microsoft.

> Multimodal Reinforcement Learning with Agentic Verifier for AI Agents. **Tan, Peng, Yang,
> Cheng, Mees et al.**, arXiv 2025.

Slide 41: "**aggregate multiple reward signals from intermediate reasoning steps, i.e. spatial &
temporal reasoning in videos**." Mechanism: an **adaptive verifier** that **selects different
verifiers (foundation models) per sample** to simultaneously score (a) **final-answer accuracy**,
(b) **spatiotemporal localization** of relevant objects, in single images *and* across videos,
and hence (c) **reasoning quality** itself. So the model **can no longer hallucinate its way to
a correct answer** — the intermediate reasoning is rewarded and checked at every step, including
temporal grounding in video. Slide detail: teacher models and scoring functions include
**Grounding DINO, SAM-2, MOLMO-7B, GLM-4.5V**, with metrics **pointing hand metric, string
match, relative accuracy, language model score** feeding **spatial score** and **action score**.
Two worked examples: a spatial 2D point ("white lamp, pixel coordinate x=346, y=126"; predicted
distance **1.8 m** vs ground truth **2.1 m**) and a temporal segment ("the person is handling
what appears to be an oil bottle", start frame 22 / 23.01 s, end frame 23 / 24.11 s) with the
answer "the person tried to pour oil but failed because the bottle cap is on".

## Back to robotics — the two-level picture (51:00–53:21, slides 42–43)
Slide 42 (ARGOS on **embodied AI benchmarks**):
- **Test-time reasoning helps for high-level planning.**
- **3–4× better than supervised CoT on the hardest tasks.** Mees's reading: a model that
  **learned** to reason through RL generalizes to hard problems in a way that a model which
  merely **imitated** reasoning traces does not.
- **For continuous control, internalize reasoning during VLA training and drop it at inference
  — ECoT-Lite style**, because you cannot afford full reasoning chains at every time step.

**The emerging architecture for robot learning** is therefore **two-level**: **RL-trained
reasoning for high-level planning and task decomposition**, plus **ECoT-Lite-style reasoning
internalization for fast reactive control**.

## Conclusion — the four takeaways (slide 43, 53:21–55:33)
1. **Scaling test-time compute is often more effective than scaling pre-training** — a new axis
   to scale on.
2. **Reasoning SFT in VLAs improves representations for control — drop reasoning at inference.**
   For continuous control you need not pay the inference cost: train with reasoning,
   internalize it, drop it at deployment. **The representations are what matter, not the tokens
   at test time.**
3. **RL can induce emergent reasoning in LLMs and VLMs** — not because you tell the model to
   reason, but because reasoning turns out to be the best strategy for maximizing reward. "A
   way more powerful regime than supervised imitation of human thought."
4. **For multimodal agents, verifying the reasoning trace, not just the final answer, is
   essential** — reward only the outcome and you get hallucinations.

Closing line: bringing all four together into a single robot policy that can **reason, adapt and
improve** is "very much an open problem yet".

## Definitions for glossary
Embodied chain-of-thought (ECoT); reasoning trace; semantic vs visual reasoning; grounded
reasoning; foundation-model distillation for annotation; gripper position token; visible-objects
bounding boxes; reasoning editing / online intervention; reasoning pre-training; reasoning
dropout; reasoning scaffolding; thinking / pause / null tokens; hidden computation; policy
expressivity; learning curriculum; test-time compute scaling; compute-optimal scaling; verifier;
best-of-$N$ selection; Monte Carlo tree search (MCTS); Elo rating; serial computational depth;
chain-of-thought prompting; emergence with scale; distillation of reasoning; large reasoning
model (LRM); GRPO (group relative policy optimization); group-relative advantage; importance
ratio; trust-region clipping; KL drift penalty; reference policy; verifiable reward; reflective
language; Visual-RFT; IoU reward; classification reward; agentic / adaptive verifier;
spatiotemporal grounding; two-level (planner + reactive controller) architecture.

## Papers named
**Zawalski\*, Chen\*, Pertsch, Mees, Finn, Levine, CoRL 2024** (ECoT); **Chen, Belkhale,
Mirchandani, Mees, Driess, Pertsch, Levine, CoRL 2025** (Training Strategies for Efficient
Embodied Reasoning / ECoT-Lite — assigned); **Lee et al. 2025** (MolmoAct); **Zhao et al. 2025**
(CoT-VLA); **Clark et al. 2025** (RAD / Action-Free Reasoning for Policy Generalization);
**Ganai et al. 2026** (Self-Supervised Bootstrapping of Action-Predictive Embodied Reasoning);
**Pfau et al. 2024** (Let's Think Dot by Dot); **Goyal et al. 2024** (Pause Tokens); **Silver et
al., Nature 2017** (Mastering the Game of Go without Human Knowledge); **Snell et al. 2024**
(Scaling LLM Test-Time Compute Optimally); **Li et al. 2024** (CoT Empowers Transformers to
Solve Inherently Serial Problems); **Wei, Wang et al., NeurIPS 2023** (CoT Prompting);
**Marjanović et al. 2026** (DeepSeek-R1 Thoughtology); **Shao et al. 2024** (DeepSeekMath /
GRPO); **DeepSeek-AI 2026** (DeepSeek-R1); **Liu et al. 2025** (Visual-RFT); **Tan, Peng, Yang,
Cheng, Mees et al. 2025** (ARGOS). Models/systems named: OpenVLA (7B), RT-2-X (55B), Octo,
Gemini Robotics VLA 1.5, GPT-4o, ChatGPT, DeepSeek-R1, AlphaGo Zero/Master/Lee/Fan, Crazy Stone,
Pachi, GnuGo, LaMDA, PaLM. Annotation suite: Gemini, OWLv2 + SAM, Prismatic VLM, Grounding DINO.
ARGOS verifiers: Grounding DINO, SAM-2, MOLMO-7B, GLM-4.5V. Benchmarks: LIBERO-90, Bridge
WidowX, GSM8K, SVAMP, MAWPS, ALFRED (transcript only). Slide credit: **Noam Brown** (AlphaGo
slide) and **Will** Zawalski (the three-hypotheses slides). Assigned but not covered: Fu et al.
2024 (In-Context Imitation Learning via Next-Token Prediction), Wang et al. 2023 (VOYAGER).

## Figures worth reproducing
- `slide_005.jpg` — ECoT vs a standard policy (the core idea in one picture).
- `slide_006.jpg` / `slide_007.jpg` — the annotation pipeline and a full generated chain.
- `slide_009.jpg` — the ECoT architecture, semantic → visual reasoning → action.
- `slide_010.jpg` — the 30% generalization bar chart (ECoT vs RT-2-X / OpenVLA / Octo).
- `slide_011.jpg` — human correcting a reasoning chain online.
- `slide_013.jpg` — reasonings transferring to unseen robots (four OXE datasets).
- `slide_016.jpg` — 4 actions/second vs 4 seconds/action.
- `slide_019.jpg` — the three hypotheses in one figure.
- `slide_020.jpg` — LIBERO-90 ablation across the five variants.
- `slide_021.jpg` + `slide_022.jpg` — reasoning pre-training and reasoning dropout.
- `slide_023.jpg` — the performance/frequency trade-off plus real-world Bridge bars.
- `slide_025.jpg` — classical planning → learned planning → LLM reasoning table.
- `slide_026.jpg` — AlphaGo Elo with and without test-time search.
- `slide_028.jpg` — Snell et al. FLOPs-matched comparison (the flip on hard questions).
- `slide_030.jpg` — the original CoT prompting side-by-side.
- `slide_031.jpg` — CoT emerges only in large models.
- `slide_034.jpg` — GPT-4o's clean chain vs DeepSeek-R1's messy thinking.
- `slide_035.jpg` — the GRPO pipeline with the train-speed worked example (key figure).
- `slide_037.jpg` — emergence of "wait" during RL training.
- `slide_039.jpg` — Visual-RFT with the IoU/CLS rewards.
- `slide_041.jpg` — ARGOS adaptive verifier over spatial and temporal reasoning.

## Student Q&A
**None.** Unlike Ch.9 there is no neighbour-discussion prompt and no audible student question;
the rhetorical questions on slides 2, 17, 24, 27, 33, 36 and 38 are Mees's own and structure the
lecture. Note this in Ch.10 rather than inventing an exchange.

## [UNCLEAR] / caveats
- **Numbering, again.** Both the title slide ("**Lecture 11**: Embodied Reasoning and Test-time
  Scaling") and Mees's opening words ("welcome to **lecture 11** of our robot learning course")
  are one ahead of the playlist, where this is the **10th** main lecture (dated 04.05.2026 =
  Week 10 / May 04 on the course page). Same offset as Ch.9's deck. The book uses playlist
  numbering; do not repeat "lecture 11".
- **A spoken number contradicts the slide.** At 32:20 Mees says hard questions can "lose up to
  30, 33.7%" versus pre-training a bigger model; **the slide's printed value is −37.2%** (hard
  questions, ratio ≫1). Slides are ground truth (hard rule #4) — use **−37.2%** and do not
  repeat 33.7%.
- The **hatched segment** on the Embodied-CoT inference-rate bar (slide 23) is **not labelled**;
  it plausibly marks the inference-speed optimizations Mees mentions at 14:20, but that is an
  inference, not a slide claim. Do not assert it — either omit or mark as an editor's note.
- Values read off charts — slides 10, 20, 23, 26 — are **approximate**; the slides print no
  numbers there. Slide 28 (Snell) **does** print values and is exact as tabulated. The GRPO and
  Visual-RFT equations were verified on zoomed crops of `slide_035.jpg` / `slide_039.jpg`.
- **OpenVLA's 4 actions/second and ECoT's 4 seconds/action** are on the slide; the "~1 Hz" for
  the first painful rollouts is Mees guessing aloud ("I don't know one hertz or I don't know
  what") — quote it as an anecdote, not a measurement.
- **ALFRED** is named in the transcript only ("like Alfred and so on"); slide 42 shows simulated
  scenes without naming the benchmarks. Flag if Ch.10 wants to name it.
- Caption manglings fixed against the slides: "Malmo Act" → **MolmoAct**; "bonding boxes" →
  **bounding boxes**; "E CoT light" → **ECoT-Lite**; "Libero 90" → **LIBERO-90**; "IOU" →
  **IoU**; "Deep Seek" → **DeepSeek**; "Charlie Snell" → **Snell et al.** (Mees names him
  correctly; the slide gives only the surname); "Argos" → **ARGOS**; "reasoning subtest time" →
  **reasoning *at* test time** (recurs several times); "not novel problems" → **novel problems**
  (05:00 — a caption drop that inverts the sentence).
- The slide deck's own **page numbers jump** (…24, 32, 33, 35…), so the ECoT-Lite slides are
  clearly lifted from a longer deck. Not a problem, but do not use the printed page numbers as
  slide indices — use `slides_png/lecture10/slide_NNN.jpg`.
- Mees's own work (ECoT, ECoT-Lite, ARGOS) again dominates; keep the attribution even-handed and
  note that the **thinking-tokens** result here (worse than a standard VLA) sits in tension with
  the LLM literature he cites for hypothesis 3 — good material for Ch.10's "where this breaks".

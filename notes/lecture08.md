# Lecture 8 — World Models (raw notes)

- Video: <https://www.youtube.com/watch?v=cTTmUZlOF2s> (71.7 min — longest lecture)
- Transcript: `transcripts/08_world_models.txt` (9,791 w) · Slides: `slides_png/lecture08/`
  (45 frames) · OCR `slides/lecture08.txt`
- Speaker: Oier Mees. Assigned (wk8): Du et al. 2023 (Universal Policies via Text-Guided
  Video); Hafner et al. 2025 (Training Agents Inside Scalable World Models = Dreamer V4);
  **Ye et al. 2026** (World Action Models are Zero-shot Policies). Guest: **Scott Reed**
  (NVIDIA GEAR; DreamZero co-author).

**One master formula, five families.** Everything answers $p(s_{t+1}\mid s_t, a_t, h_t)$ —
predict the next state given current state, action, and memory. Families differ in *how
they represent state*, *where actions live*, and *what data they use*. Maps to Ch.8.
(First ~12 min are group-project logistics — not book material; noted below only for
context.)

## Intuition & definition (slides 9–13)
**Baseball**: a fastball reaches the plate in ~400 ms; the visual signal takes ~100 ms to
reach the brain, leaving ~300 ms — not enough to perceive-then-decide. Batters hit 160 km/h
balls by using an **internal world model** to predict where the ball will be and swing
ahead of perception. Bringing this to ML: an agent with a world model can **simulate
consequences, plan ahead**.

**Policy vs world model** (slide 10): a policy/VLA asks "given state $s_t$ and goal $g$,
what action?" ($\pi(a_t\mid s_t, g)$); a world model asks "given state $s_t$ and action
$a_t$, what happens next?" — it models the **transition dynamics**
$$p(s_{t+1}\mid s_t, a_t) \quad\text{(with memory: } p(s_{t+1}\mid s_t, a_t, h_t)\text{)}$$
Policies are "blind to physical causality"; a world model has a temporal model of the
world.

**Why** (slide 11): run $N$ imagined rollouts, score them, execute only the best plan —
explore many hypothetical trajectories for the cost of one real trial. A world model is a
**learned, data-driven simulator** (slide 12): a physics engine is hand-built, exact only
for modeled phenomena; a world model learns $p(s_{t+1}\mid s_t,a_t)$ from any data (robot
trajectories, human/internet video), generalizing to anything on video but bounded by the
data. **Must be action-conditioned** — a text→video model $p(\text{video}\mid\text{text})$
is *not* a world model.

## Family 1 — Pixel action-conditioned WMs (slides 14–15)
Predict directly in pixel space. **Finn, Goodfellow, Levine 2016**: instead of generating a
full frame, predict an **action-conditioned flow field** that warps the current image into
the next ($F_{t+1} \approx$ warp of $o_t$). Conv-LSTM architecture. Predicting *motion* not
*pixels* is easier and less prone to hallucination. **Visual Foresight / Visual MPC**:
planning entirely in pixel space with the **cross-entropy method** (from Ch.4); user
specifies a goal (click a pixel, or a classifier); cost = pixel distance to goal image;
data collected autonomously. **Limits**: L2 loss → blurry predictions (averaging
uncertainty); errors accumulate over long horizons; pixel-space planning is expensive.

## Family 2 — Latent action-conditioned WMs (slides 16–26)
Compress observations to a latent, do dynamics + planning there — "train a policy entirely
in imagination." General structure (slide 17):
$$z_t = \mathrm{enc}_\phi(o_t), \qquad z_{t+1} \sim p(z_{t+1}\mid z_t, a_t, h_t), \qquad a_t = \pi(z_t, h_t)$$
plus an imagined reward. Train the policy on imagined rollouts (fix encoder+dynamics, roll
out $z_1,\dots,z_H$, optimize $\pi$ on imagined return) — no real-environment interaction.

**The OG: Ha & Schmidhuber 2018** — three modules: **V** (VAE, perception → latent $z$),
**M** (MDN-RNN memory: $p(z_{t+1}\mid a_t, z_t, h_t)$ as a **mixture of Gaussians** to handle
multimodal next states), **C** (controller: a single FC layer $a_t=\pi(z_t,h_t)$, trained
by **CMA-ES** — a gradient-free evolutionary method, because stochastic rollouts make
end-to-end differentiation hard). The world model does the heavy lifting so the controller
stays tiny. Solved car racing and VizDoom from pixels, trained purely in imagination.

**The drift problem** (slide 22): the VAE is trained separately from the RNN — it encodes
$o_t$, not the model's own beliefs, and there's **no prior $p(z_t\mid h_t)$**. In
imagination there is no real observation, so the RNN feeds its own **hallucinated** latents
back into itself → sampling errors compound → imagination drifts from reality.

**RSSM (PlaNet, Hafner et al. 2019)** — the fix. Split the latent state:
- **Deterministic path** $h_t$ — carries memory, **never sampled**, so it can't be
  corrupted (a clean anchor). $h_t = f(h_{t-1}, z_{t-1}, a_{t-1})$.
- **Stochastic path** $z_t$ — captures uncertainty about the current state.

Two distributions: **posterior** $q(z_t\mid h_t, o_t)$ (training, uses the real
observation) and **prior** $p(z_t\mid h_t)$ (imagination, needs only $h_t$ — the missing
piece from Ha & Schmidhuber). A **KL loss** $D_{KL}(q\|p)$ forces the prior to match the
posterior, so imagined latents stay in the region the model understands. Closed-loop
imagination (slide 24): policy reads $(h_t, z_t)$ → $a_t$; world model advances $h_{t+1} =
f(h_t, z_t, a_t)$, $z_{t+1}\sim p(z_{t+1}\mid h_{t+1})$ — no real observation anywhere.

**Dreamer V1 (Hafner et al. 2020)**: PlaNet still runs CEM from scratch every step
(expensive). Dreamer **amortizes planning into a learned actor-critic** — run imagination
rollouts during training, **backprop through the differentiable RSSM dynamics** to train
actor $a_t=\pi(h_t,z_t)$ and critic $v(h_t,z_t)$. Two phases: (1) collect real data, train
RSSM (ELBO); (2) freeze RSSM, train actor-critic in imagination. At deployment just run the
policy — no planning loop.

**DayDreamer**: Dreamer on real robots, same algorithm/hyperparameters — **1 hour of real
quadruped interaction → walking from scratch** (days of imagined training from that hour).
Contributions: asynchronous training/inference. ("The Matrix" analogy — Neo learns kung fu
in imagination.)

**Dreamer lineage** (slide 26): World Models 2018 (first agent in imagination) → PlaNet
2019 (RSSM, 200× more sample-efficient) → Dreamer V1 2020 (backprop, actor-critic) →
Dreamer V2 (categorical latents, KL balancing, matched DQN on Atari) → **Dreamer V3** (first
to get **diamonds in Minecraft** from pixels, 20,000+ actions) → **Dreamer V4** (offline —
diamonds from offline data only; pre-trains dynamics on **unlabeled video via flow
matching**, then fine-tunes with actions; replaces the RNN hidden state with a
**transformer KV cache** for longer memory).

**Limitation**: Dreamer latents are **domain-specific** (one Minecraft, one robot). To
understand the general visual world → scale to internet video.

## Interlude — video tokenization (slides 27–29)
Naive per-frame ViT explodes context: a 256×256 image → 256 tokens/frame × 200 frames (10 s
@ 20 FPS) = **51,200 tokens** (near GPT-4's limit) for one short clip. Three composable
compression axes: **spatial** (VQ-style encoders, larger strides — e.g. 8× → 4 tokens/
frame), **temporal** (merge frames — tubelets non-causally, or causal aggregation for
streaming/control), **adaptive** (more tokens for complex frames). Combined (Cosmos: 8×
spatial + 8× temporal = 512×) → 51,200 → ~100 tokens for the same clip.

## Families 3 & 4 — where do actions live? (slides 30–41)
At internet scale, action labels are scarce. Two video-based paradigms:
- **World Action Models (WAM)** — actions are **outputs**. A single model **jointly
  generates future video + predicts the actions** that produce it; initialized from a
  pre-trained video backbone. Example: **DreamZero** (Ye et al. 2026; guest Scott Reed) — a
  single causal DiT over video latents + noisy action tokens + proprioception + language,
  **jointly denoises video and actions via flow matching** with teacher forcing;
  autoregressive chunk generation with KV cache; closed-loop trick: **replace generated
  frames with real observations in the KV cache** after each action → bypasses the
  compounding errors of pure autoregressive video generation; runs a 14B model in real time.
- **Video Action Models (VAM)** — freeze an internet-pretrained **video backbone**, extract
  features, train a lightweight **inverse dynamics model (IDM)** head on robot data only.
  Example: **mimic-video** (Pai\*, Achenbach\*, …, **Mees**\*, Nava\*, 2025; co-authored with
  TAs Jonas & Liam).

**Why video backbones** (slides 32–35): a VLM is trained on **static** image-text pairs — it
knows "cutting a carrot" semantically but has **no temporal dynamics / physical causality**,
so converting a VLM→VLA needs lots of expensive teleop data to learn dynamics *and* control.
A **video backbone** has visual dynamics baked in, so fine-tuning only needs to learn
**control** (features→actions) → far less data. mimic-video: **~10% sample-efficiency boost**
over π₀.5-style VLAs. **Oracle experiment**: decoding actions from *ground-truth future*
latents gives near-perfect success regardless of robot fine-tuning → the pre-trained video
model already carries enough info; the bottleneck is **video-prediction quality**, not
action decoding → "the path to better robots is better video models." Uses **Cosmos Predict
2** backbone with a **partial-denoising** strategy (run video only to an intermediate flow
time, extract the latent visual plan, condition a light flow-matching action decoder; video
and action have independent flow schedules).

**WAM vs VAM trade-offs** (slides 39–41): AC-WMs/latent WMs win on **data** (any robot data:
play, failures, rollouts) and can do **RL in imagination / gradient-based planning** beyond
imitation; but cross-embodiment is an open problem and action conditioning can damage
pre-trained abilities. WAMs/VAMs win on **cross-embodiment** (backbone is robot-agnostic;
only the decoder needs robot data) and **retain pre-trained capabilities**; but need
instruction labels and (so far) only do imitation / best-of-N over text prompts.

## Family 5 — JEPA (slides 42–43)
"Do we even need to predict pixels?" **Joint-Embedding Predictive Architecture** predicts
the next frame's **embedding**, not its pixels — no decoder, no pixel loss:
$$z_t = \mathrm{enc}(o_t), \quad \hat z_{t+1} = \mathrm{pred}(z_t, a_t), \quad z_{t+1} = \mathrm{enc}(o_{t+1}), \qquad \mathcal{L} = \|\hat z_{t+1} - z_{t+1}\|^2$$
Cheaper, no capacity wasted on pixels. **Catch — representation collapse**: if the encoder
maps every frame to the same vector, the loss is trivially zero. Three fixes: **EMA target
encoder** (slow-moving copy the predictor chases — V-JEPA 2); **frozen pretrained encoder**
(e.g. DINO-WM — collapse impossible, but no end-to-end learning); **Gaussian regularizer**
(force the latent distribution to spread — provably prevents collapse, one hyperparameter).

## The five-family summary (slide 44) — Ch.8 organizing table
| Family | State repr. | Actions | Planning | Data | Example |
|---|---|---|---|---|---|
| Pixel AC-WM | pixels $o_t$ | input (conditions) | visual MPC (CEM) | robot + action labels | Finn 2016, Visual Foresight |
| Latent AC-WM | compact latent $z_t$ | input | RL in imagination | robot + action labels | Dreamer V1–V4, DayDreamer |
| WAM | video tokens (full frames) | output (jointly generated) | generate video + extract actions | internet video + robot fine-tune | DreamZero |
| VAM | video tokens (frozen backbone) | output (IDM reads video) | generate latent video + IDM | internet video + robot (IDM) | mimic-video |
| JEPA | latent $z_t$ (no decoder) | input | latent MPC | robot + action labels | V-JEPA 2, DINO-WM, LeWorldModel |

**Open questions**: flexible conditioning (one model on text *or* actions)? pixels or
latents (does pixel prediction help cross-embodiment or is it wasted cost)? can JEPA scale?

## Definitions for glossary
World model; action-conditioned; transition/dynamics model; learned simulator; imagination;
model predictive control (MPC); pixel AC-WM; flow-field prediction; visual foresight; latent
AC-WM; MDN-RNN / mixture density network; CMA-ES; imagination drift / exposure bias;
recurrent state-space model (RSSM); deterministic vs stochastic latent; prior vs posterior;
Dreamer; DayDreamer; categorical latents; video tokenization (spatial/temporal/adaptive
compression); tubelet; causal tokenizer; world action model (WAM); video action model (VAM);
inverse dynamics model (IDM); video backbone; partial denoising; JEPA; representation
collapse; EMA target encoder.

## Papers named
Finn, Goodfellow, Levine 2016; Ebert et al. (Visual Foresight); **Ha & Schmidhuber 2018**
(World Models); Hafner et al. 2019 (PlaNet/RSSM); Hafner et al. 2020 (Dreamer V1); Wu et al.
(DayDreamer); Dreamer V2/V3; **Hafner et al. 2025** (Dreamer V4, assigned); Cosmos (NVIDIA);
**Ye et al. 2026** (DreamZero/WAM, assigned); **Pai/Achenbach/…/Mees et al. 2025**
(mimic-video); V-JEPA 2; DINO-WM; LeWorldModel. Du et al. 2023 (Universal Policies,
assigned) — text-guided video for policy (not deep-dived in lecture).

## Figures worth reproducing
- `slide_009.jpg` — baseball / subconscious world model.
- `slide_010.jpg` — policy vs world model.
- `slide_017.jpg` — latent AC-WM general structure.
- `slide_022.jpg` — why imagination drifts (no prior).
- `slide_023.jpg` — RSSM (deterministic $h$ + stochastic $z$, prior/posterior).
- `slide_026.jpg` — Dreamer lineage timeline.
- `slide_029.jpg` — video-tokenization compression axes.
- `slide_034.jpg` — video-action model 10× sample efficiency.
- `slide_043.jpg` — JEPA + three anti-collapse strategies.
- `slide_044.jpg` — the five-family master table.

## Student Q&A
No formal in-lecture Q&A (ran over time); midterm feedback (slides 2–3) is course-process,
not content.

## [UNCLEAR] / caveats
- Group-project details (slides 4–8), NVIDIA compute (12,500 H100 h), demo-day VIPs (LeCun,
  Shuran Song, Jitendra Malik) are logistics — cite in the preface at most, not Ch.8.
- Ha & Schmidhuber "invented what" aside: Mees jokes "ask Schmidhuber" — keep the 2018
  attribution, note the priority tease as color.
- mimic-video and FAST (Ch.7) are both Mees's; be even-handed citing his own work.

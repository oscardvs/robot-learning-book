# Lecture 11 — Frontier & Open Problems (raw notes)

- Video: <https://www.youtube.com/watch?v=eL4lcy1KNzE> (62.1 min)
- Transcript: `transcripts/11_frontiers.txt` (9,700 w) · Slides: `slides_png/lecture11/`
  (43 frames) · OCR `slides/lecture11.txt`
- Speaker: Oier Mees. Dated **11.05.2026**. Assigned (wk11): **LeCun 2022** (A Path Towards
  Autonomous Machine Intelligence); **Sutton 2019** (The Bitter Lesson — cited in the lecture at
  31:00); **Brooks 1991** (Intelligence without Representation). Guest the same day: **Lucas
  Beyer** (Mees hands over at 61:00: "before we finish and I pass on to Lucas").
- **No equations in this lecture.** It is a problem-statement lecture plus a research-methods
  lecture. Ch.11 should be prose and figures, not derivations — closer to Ch.1 in register.
- Structure: **open problems** (00:01–43:41) then **how to do research** (43:42–59:25) then
  **thanks** (59:25–end). The second half is unlike anything else in the course and probably
  belongs in Ch.11 as its own titled section, or as an epilogue.

## Course announcement (00:01–01:01) — logistics, not content
Microsoft PCs were sourced from Mees's employer and brought to ETH into a room; students will get
access instructions by email and will deploy their policies on those machines on **demo day**.
Preface material at most.

## "Robotics is solved" — the hype problem (01:01–05:00)
> [UNCLEAR: lecture 11, 02:29–05:03 — no stable slide was captured for this stretch (autoplaying
> demo videos and tweet screenshots), so the announcement slide and the three-step "rockstar
> demo" recipe slide could not be recovered as images. Everything in this section is from the
> transcript only. The Brett Adcock tweet does resurface later on slide 39, which *was* captured.]

"Pretty much every single week someone declares that robotics is solved or manipulation is
solved." Named examples: **Genesis AI** a few days before the lecture — "we are approaching the
end game for robotics"; **Brett Adcock** — "their ChatGPT moment for robotics in their lab", two
years ago, "we're still waiting"; others promising "the road map to physical HRI". Mees is
explicit that he is not criticizing any specific claim, only asking for salt: "how can you
believe them if somebody else already declared to have solved robotics the week before?"

Two videos of what happens when you actually ask for generalization: a **Boston Dynamics
humanoid** and a **Stanford mobile manipulator** on kitchen/cooking tasks — "you will have to
wait quite a long time until the robot can cook dinner for you". Mees notes the clips are a few
years old but representative: **take the robot out of the lab — new lighting, new objects, new
camera viewpoints — and things break very quickly.** Same robot, same demo, next room, outside
its training distribution: it will probably fail badly.

**The not-so-secret recipe for a rockstar real-robot demo** (transcript only, ~04:00–05:02) —
worth reproducing verbatim-in-substance in Ch.11 because it is the lecture's sharpest point:
1. **Collect the training data yourself**, on your target platform. Don't rely on anyone else.
   As much as possible.
2. **Train a behaviour-cloning policy and keep collecting data until extrapolation becomes
   interpolation** for your policy.
3. **If possible, train and test on the same day** — no distributional shift whatsoever: no
   lighting change, no camera-viewpoint change, no table-height change, nothing.

"And it turns out you can get a lot of money from VCs for following this very simple recipe."

## What problem are we actually solving? (05:00–06:00, slide 3)
Slide 3 is four nested ellipses: **1 object ⊂ 1 room ⊂ 1 building ⊂ the world**. The most
impressive demos live between "1 object" and "1 room"; more ambitious work pulls toward "1
building"; **the real goal is the world**. The argument for why that is even reachable: humans
generalize without having seen every instance — **you do not need to have cooked in every kitchen
to cook in a new one, or grasped every mug to grasp an unseen mug.** You stitch knowledge
together, reason about novel situations, and compose what you know in new ways. **That is not
interpolation** — and it is exactly the "intelligent reasoning" that is still elusive for robot
policies. Explicitly: this goes beyond collecting more data.

## The two camps and the quest for both (06:00–09:03, slides 4–5)
Slide 4, **The Quest for the Best of Both Worlds**:

| Non-embodied foundation models | Specialist embodied models |
|---|---|
| ✅ Internet-scale data | ✅ Physical grounding |
| ✅ Broad generalization | ✅ Embodied sensing |
| ❌ **Lacks physical grounding** | ❌ **Narrow, task-specific data** |
| ❌ **Non-embodied sensing** | ❌ **Poor generalization** |

Mees's examples of the missing grounding: a VLM can describe an image with a glass on a table
but does not truly understand what happens if it is pushed off the edge and breaks. Same for
**generative video models** — **Sora** can synthesize very realistic-looking liquids pouring or
objects falling, "but if you look closely they do tend to violate basic physics". They are good
at **making it look like the world** without understanding it.

Slide 5, **The Path to Embodied Intelligence** — a loop: **Embodied Data (multimodal, temporal,
spatial, physical) ↔ Foundation Models → AI Agents for the Digital & Physical World.** Bullets:
"Today's foundation models lack physical grounding" · "Embodied data inherently **multimodal,
spatial & temporal**". The move is **beyond passive data, toward grounding models in the physical
world with richer embodied data**, so that agents don't just *describe* the world but **reason
about it and interact with it**.

## Open problem 1 — what is the best backbone? (09:03–11:00, slide 6)
Three camps in the community, all with serious proponents, "and the jury is still out":

| Camp | Argument |
|---|---|
| **Vision-Language Model** | Already carries rich semantic world knowledge and can reason about scenes; fine-tune on robot data and get **object-level semantic generalization for free**. |
| **Generative Video Model** | Better understanding of **temporal dynamics** — how the world evolves over time — and its pre-training is closer to what a policy must do: **reasoning over the consequences of actions**. |
| **"Doesn't matter if we have enough data to train from scratch?"** | The provocative third camp: with enough real-world robot data, forget internet pre-training and train everything from scratch. |

Mees points students at **Scott Reed's guest lecture** on exactly this question (a few weeks
earlier; on YouTube via the course website). Cross-reference to Ch.8, where Reed is the
DreamZero co-author.

## Open problem 2 — what is the best data recipe? (11:00–13:45, slides 7–8)
Four pyramids, bottom = largest/cheapest layer:

| Recipe | Layers (bottom → top) | Rationale on the slide / in the talk |
|---|---|---|
| A | **Web data** (Wikipedia, Common Crawl) → **Simulation data** → **Real-world data** | Web for world knowledge and language grounding; sim for cheap scalable experience; a little real data on top to bridge sim-to-real. |
| B | **Web data** → **Real-world data** | Strip the simulation layer: accurately simulating the whole world is very challenging and engineering-heavy; better to spend that time collecting real data. |
| C | **Internet videos** (YouTube) → **Human videos** (egocentric, mid-training) → **Real-world data** (post-training to predict actions) | **Video as a first-class citizen**: video is a far richer prior for embodied tasks than visual question answering could ever be. |
| D | **Real-world data → real-world data → real-world data** | The from-scratch recipe — all in on real data, varying only in annotation type and granularity. |

## Open problem 3 — how do you collect real data at scale? (13:45–16:04, slides 9–10)
Slide 9, a **zoo of data-collection interfaces**, each trading off scalability, alignment with
the target embodiment, and the complexity of demonstrable tasks: **UMI-style** (handheld
grippers), **gloves for dexterous hands**, **static bimanual puppeteering**, **VR**, **mobile
bimanual puppeteering**. Mees's comparisons: **UMI-style grippers** (from **Cheng** Chi's guest
lecture) are **more scalable than teleoperation robots**, but now you need cross-embodiment
learning; **puppeteering gives higher-quality data than VR teleop** but is the most expensive —
you need leader-follower arm setups, "and this means you will now also have more hardware to
break."

Slide 10, **Data Scalability vs Hardware Alignment** — three points on a downward line:

| Interface | Data scalability | Hardware alignment |
|---|---|---|
| **Egocentric videos** | **10⁷ hr** | worst — human data, big embodiment gap |
| **Data wearables** (e.g. gloves) | **10⁵ hr** | middle |
| **Teleop** | **10³ hr** | best — robot fully in the loop |

Axis labels: *Sensorized Human Data* → *Robot in the loop*. Mees: solving or side-stepping this
trade-off — "for example by having a humanoid robot to better leverage egocentric videos" — is
itself one of the open problems.

## Open problem 4 — dexterous generalist policies (16:04–19:00, slide 11)
The framing: **dexterity and generalization have so far required different ingredients**. Slide
11 is a two-circle Venn with **Goal** in the intersection:

| Dexterity needs | Generalization needs |
|---|---|
| **High-frequency control** — at odds with running large, slow, expensive foundation models | **Foundation models** |
| **Heterogeneous multimodal sensing** — e.g. touch, which most foundation models simply do not consume today | **Mobility** — a robot that moves across environments and accumulates experience across rooms and buildings generalizes better than the same robot **bolted to a table** seeing the same scene |

Most systems sit in one camp or the other; getting into the intersection — **dexterous *and*
general across unstructured environments and unseen objects** — is the open problem.

## Dexterity requires more than vision (19:00–20:37, slide 12)
A personal video from Mees's PhD (**Self-supervised 3D Shape and Viewpoint Estimation from
Single Images for Robotics**, **Mees, Tatarchenko et al., IROS 2019**; the on-screen robot is
labelled **TidyUpRobot**, Albert-Ludwigs-Universität Freiburg). He had spent a long time training
a model to take an RGB image and predict 3D shape and object pose — needed because the depth
camera saw objects only partially occluded — so the robot could locate e.g. a mug's handle
accurately enough to grasp it. In the video the robot **misses the handle, grasps the mug body
directly, and destroys it**, because it has **no touch or force feedback**: a blind grasp that
was far too strong. Mees generalizes the lesson to the present: "**our current VLAs are also
probably still annihilating objects** because we haven't made that much progress on this front —
our robots are still blind most of the time when making contact."

*(Note for Ch.11: the video's audio did not play in the lecture — "Can you hear the sound? Sorry,
I didn't check" — so nothing was lost from the notes, but the anecdote is narrated over silence.)*

## Open problem 5 — the long tail of robot sensing (20:37–24:13, slides 13–16)
**Recap: native multimodal models** (slide 13) — "instead of adding vision to an existing LLM,
train all modalities jointly from scratch". Slide detail: any combination of inputs (image /
audio / video / text, each through its own encoder; **each modality is optional**) becomes an
**interleaved token sequence in any order, any mix**, into a **unified multimodal transformer
trained from scratch — every weight has always seen every modality**. Examples printed: image
captioning `img img img txt txt txt`, audio transcription `aud aud aud aud txt`, video QA
`vid txt vid txt vid txt` (freely interleaved), multimodal reasoning `img txt aud img txt aud`.
So the naive fix is: throw touch, force and proprioception in too, and the problem is solved.

**Except** (slide 14, **The Long Tail of Robot Sensing**) — three obstacles, verbatim:
- **Scarcity**: many relevant sensing modalities (e.g. touch) are **not available at scale** —
  the hardware is expensive, fragile and not standardized ("still very researchy").
- **Pairing**: **cross-modal paired data** (RGB + depth + tactile + force **simultaneously**) is
  **nearly nonexistent**.
- **Heterogeneity**: sensors **vary across robot embodiments**, making transfer hard even when
  the data exists.

**The question this poses** (slide 15): **can language be the bridge to reason across modalities
never seen together?** The data we have is disjoint — large amounts of vision-language data, some
audio, a little touch, and nothing that pairs them all at scale. Slide 15 draws **Language** at
the centre with **Vision**, **Audio** and **Touch** around it.

**FuSe** — initial work at Berkeley (slide 16, "**Giving VLAs Senses They Were Never Trained
On**"): take a **pre-trained generalist policy** (Octo / a VLA), apply **FuSe finetuning** where
**generative + contrastive losses ground multimodal inputs in language**, using language as the
**semantic glue that binds heterogeneous modalities**. (Mees corrects himself mid-sentence:
"not to bridge — to **bind**".)

> Beyond Sight: Finetuning Generalist Robot Policies with Heterogeneous Sensors via Language
> Grounding. **Jones\*, Mees†, Sferrazza\*, Stachowicz, Abbeel, Levine.** ICRA 2025.

What it unlocks — **new cross-modal reasoning abilities**. Prompts printed on the slide: *"Push
the button that **plays piano**"*, *"Pick the object that **feels squishy**"*; Mees adds *"grasp
the object that **feels like a pineapple but is brown**"*. Three capability classes named:
**multimodal prompting**, **cross-modal (audio-visual) prompting**, and **generation of object
descriptions upon interaction** — his example being a robot reaching into a shopping bag where
the camera sees nothing, grasping a random object, and **describing what it thinks it is feeling
from the touch sensor**, "similar to what a human could do".

## Open problem 6 — when and how should a robot reason? (24:13–26:21, slide 17)
Direct continuation of Ch.10. Reasoning should sit on a **spectrum governed by policy
confidence** (slide 17, three columns; the header band runs **certain → uncertain → unknown**,
annotated **✓ no reasoning needed → adaptive TTC → escalate / stop**):

| | **In-distribution task** | **Near-distribution task** | **Out-of-distribution task** |
|---|---|---|---|
| Trigger | Known objects, scene, goal | Novelty or low confidence | Novel goal or failure mode |
| Response | **Reactive policy** — no reasoning tokens | **Uncertainty detection** → **scale test-time compute** (↓ frequency, ↑ reasoning) | **Escalate / ask for help** — pause and defer |
| Note | **~50 Hz control loop** | think through the task by spending more tokens | not solvable by more thinking |

And "**test-time compute can take many forms**": **more thinking tokens** (CoT, GRPO, RL
reasoning) · **larger / specialist model** (foundation-model fallback) · **human in the loop**
(teleop, correction, label). Mees's framing device is a **future robot butler at home**: in
distribution, don't reason — run the policy at the highest frequency, don't waste computation.

## Open problem 7 — introspection (26:21–28:23, slide 18)
The adaptive framework above **assumes a reliable way to detect when the model is uncertain**,
and "it turns out that is a very big assumption for our current machine-learning models". Slide
18: "**How does a model know what it doesn't know?**" — "Generalization across many axes:
objects, environments, embodiments, instructions, tasks…" — "**Open Problem: Introspection**".

Two reasons Mees gives for why it is hard and **getting harder as models scale**:
- Large models are **very good at pattern completion while remaining poorly calibrated about
  their own competence** — having seen so much data, a genuinely novel situation can still
  **appear superficially familiar**, which makes OOD detection very difficult.
- In robotics it is worse, because **failure can arise along so many dimensions** — objects,
  environments, embodiments, tasks, sensor noise — so **a policy can appear confident while being
  wrong for entirely different reasons.**

## Open problem 8 — breaking the imitation ceiling (28:23–30:57, slides 19–20)
Slide 19: **current robot models rely on imitation learning**, so the **policy is bounded by the
demonstrations in the dataset**. The toy example (the lecture's only worked example, a
three-node graph): if the dataset contains only demonstrations **1 → 2** and **2 → 3**, then **no
matter how large your model is**, the policy has no way to learn that a better path **1 → 3**
exists — or that a task might be solvable in a way no human operator would demonstrate.

Slide 20, **Can we Scale RL for Robotics?** — the same graph, twice:
- **Imitation learning**: imitates seen behaviours in the data (1→2→3).
- **Reinforcement learning**: **learns near-optimal policies from suboptimal data** and
  **stitches suboptimal trajectories** — so **offline RL** recovers the undemonstrated **1 → 3**
  edge.

Mees's assessment: RL is fuelling new capabilities in reasoning, agents and knowledge discovery,
but **scaling RL for real robots has been very challenging and still requires algorithmic
innovation, not just more compute**. "Getting RL to work at scale for robotics is probably one of
the highest-impact things you could work on right now."

## Open problem 9 — the data flywheel (30:57–34:08, slides 21–22)
"One of the holy grails." Slide 21 is the loop: **Increased deployments** (improved reliability)
→ **More training data** (deployment data, suboptimal demos, human corrections) → **Better
learning** (BC, RL, fine-tuning) → **More capable robots** (multiple embodiments) → back to
increased deployments. Grounded explicitly in **the bitter lesson**: more data usually means
better models, better models mean more capable robots, more capable robots get deployed more
widely, more deployments generate more data — "and then this cycle compounds itself".

**Why the obvious version fails** (slide 22, **Co-Training Expert & Autonomous Data**):

| Expert trajectories (human demos, teleoperation) | Autonomous rollouts (self-generated experience) |
|---|---|
| ✅ High quality | ✅ Cheap and scalable |
| ✅ **On-manifold states** | ✅ **Covers failure modes** |
| ✅ Short, smooth, dense | ❌ Noisy, suboptimal |
| ❌ Expensive, limited scale | ❌ **Off-manifold states** |
| ❌ **Bounded by human skill** | ❌ Longer, jerky, variable |

Between the two columns the slide names the two mismatches: **distribution mismatch — state
spaces don't overlap** and **temporal mismatch — frequency, length, smoothness**. Conclusion box:
**new algorithms required — weighting, alignment, joint learning.** Mees: naively mixing the two
with imitation learning "will not work really well — the model gets confused by the mismatch in
quality, frequency and distribution." What is needed are methods that **learn from all the data a
robot experiences, no matter how good or bad, and extract useful signal from it** — an area where
RL could help. The principle: **never throw data away, because real-world data is precious and
expensive.**

## Open problem 10 — lifelong learning (34:08–35:18, slide 23)
"A robot should improve over time by accumulating and learning from all its experience and
interaction in the physical world, similar to how intelligent beings do." **The dominant paradigm
does the opposite**: train a model, **freeze its weights**, deploy it, and then ask it to
generalize to situations its pre-training never prepared it for. Slide 23 plots performance
against time: at **deploy**, the **lifelong-learning** curve rises while **"reality today"**
declines, with the **gap** annotated between them; caption **"open problem: how do we get
there?"** Besides learning from mixed-quality deployment data, you must avoid **catastrophic
forgetting** of the model's original capabilities once you start fine-tuning on it.

## Open problem 11 — rapid adaptation / in-context learning (35:18–36:57, slide 24)
The immediate version of the same problem: **what do you do when your policy fails right now, in
the middle of deployment?** You want **recovery on the fly, not retraining**. Slide 24: **policy
failure** (novel task, environment…) → three in-context routes → **adapted policy, no retraining
required**:

| Route | Signal |
|---|---|
| **Corrective instructions** | language feedback |
| **Robot demo in context** | same embodiment |
| **Cross-embodiment demo in context** | human or novel robot |

Caption: **"open problem: few-shot, real-time adaptation"**. Mees's running example: you unpack a
robot at home for the first time and ask it to bring you a Coke from the fridge. It struggles to
grasp the fridge handle → **language feedback may be enough** ("you just need to grasp a bit more
to the left") put into the model's context. If it does not know how to open the fridge at all →
**you go and demonstrate it yourself**, and that demonstration goes into the context. "This is
the vision for in-context learning for robotics… **few-shot learning from whatever signal is
available.**"

## Open problem 12 — a unified model for mobile manipulation (36:57–39:31, slides 25–26)
The connection back to mobility: to generalize, robots need to **expose themselves to broader,
more diverse data**. But today's mobile manipulation is a pipeline with a seam in it. Slide 25,
left column, **today**: **SLAM + metric map → localization stack → nav planner → *hard handoff* →
VLA (manipulation only)**, annotated **"maps are static — world changes, can't precompute all"**.
Mees: only when the robot must touch an object is there "a **hard switch** to a learned policy",
and the hope is to converge on something more principled without that switch.

The right column asks **which environment representation?** — six candidates printed: **metric
map · Gaussian splat · topological map · scene graph · BEV projection · walkthrough video** — then
a **?**, then **mapless adaptation (reason from current obs + memory)**, flagged **"⚠ context
length bottleneck — can't fit a city map"**, feeding a **unified model (implicit state
estimation, loop closures, whole body control)** that splits into **navigation (mobile base)** and
**manipulation (bimanual, dexterous)**. Three research directions boxed at the bottom: **replace
SLAM (implicit localization)** · **environment representation (map, video, implicit?)** · **whole
body control (nav + manipulation jointly)**.

Mees's spoken list of the open questions here: a unified model doing **whole-body control** across
navigation and manipulation; **what representation** allows long-range navigation in a big
building (explicit 3D map? bird's-eye view? topological map? scene graphs? or just **someone
walking through the office filming on an iPhone** and dropping that video into the model's
context?); how such a model handles **state estimation** (implicit or explicit); how to handle
**environment changes**, since the world is not static; and retaining some **local navigation
without a map**.

## Open problem 13 — memory at scale (39:31–41:01)
Spoken over slide 26 (a duplicate of slide 25) — **there is no dedicated memory slide**, so Ch.11
carries this from the transcript. A robot generates **continuous streams of multimodal
experience** — video, depth, language, touch, audio, bounding boxes — all potentially useful. The
questions: **what do you store, and at what time scale?**
- **Short horizon** — very dense video.
- **Longer horizon** — compress experience into **semantic events**, which also helps remember
  what has already been done and track **task progress**.
- **When to write to memory, and what to forget.**
- Out to **years**: how to store, how to **retrieve**, how to do **cross-modal alignment**.

## First steps — Mees's own initial work (41:01–42:37, slides 27–28)
> [UNCLEAR: lecture 11, 41:01–41:50 — the slide covering VLMaps and LeLaN was not captured (the
> extractor found no stable frame; both are video-heavy results). Names below are reconstructed
> from the captions and are **transcript-only**: "VL maps" → **VLMaps**, "Leela" → **LeLaN**.
> Verify both titles and Mees's authorship before they enter Ch.11's bibliography.]

- **VLMaps** — "fuses VLM embeddings into 3D spatial maps, enabling **zero-shot spatial
  navigation to open-vocabulary targets without any training whatsoever** — really out of the
  box."
- **LeLaN** — "learns **mapless navigation entirely from videos**, like YouTube videos", and
  "**the more YouTube data we train on, the better the performance gets** for open-vocabulary
  mapless navigation."

**Autonomous improvement** (slide 27, captured): "**leverage foundation models to enable
autonomous improvement without human interventions**" — by **proposing and scoring tasks based on
environment affordances**. Slide architecture: a **robot policy** and **autonomous data
collection** across Robots 1…5, with two foundation models in the loop — one producing **task
proposals**, one acting as a **reward detector** — feeding an **offline dataset** and an **online
dataset** in a **continuous improvement** loop.

> Autonomous Improvement of Instruction Following Skills via Foundation Models. **Zhou\*,
> Atreya\*, Lee, Walke, Mees, Levine.** CoRL 2024.

**Adaptation via human feedback** (slide 28): "**leverage verbal or visual cues from humans to
adapt to new tasks**". **PALO** — **Policy Adaptation via Language Optimization** — a
**non-parametric** approach that **searches in language space** (decomposing a task with a VLM)
so a generalist policy adapts to **new long-horizon tasks from as little as 5 demonstrations**,
matching what **full fine-tuning needs ~100 demonstrations** to reach. The slide prints "**Only 5
demos!**" against "**+100 Demonstrations**" on the fine-tuning curve.

> Policy Adaptation via Language Optimization: Decomposing Tasks for Few-Shot Imitation.
> **Myers\*, Zheng\*, Mees et al.** CoRL 2024. · Composing Pick-and-Place Tasks By Grounding
> Language. **Mees, Burgard.** ISER 2021. (The second gives the dialogue example on the slide:
> "Fetch the round yellow thing" → "Do you mean the lemon in the middle?" → "Yes" → "Place it
> left of the object on the bottom".)

## The four pillars (42:37–43:41, slides 29–30) — Ch.11's organizing figure
Everything above distils into four boxes:

| **Intelligent Embodied Reasoning** | **Dexterous Mobile Manipulation** | **Lifelong Learning** | **Rapid Adaptation** |
|---|---|---|---|

Mees: these are what "will actually need to be solved to make robotics work — not just for a demo
video, but in general". And, closing the loop on the lecture's opening: "**maybe this is my end
game for robotics.**"

## How to do research in robot learning (43:42–59:25, slides 31–40)
A distinct second half. Mees frames it as "things I have learned about how to do research,
sometimes the hard way".

### The (harsh) reality of research (slide 32)
1. **Most research is incremental** — and that is not a criticism, it is how science works.
   Slide's example: today's self-driving cars rest on **~40 years of work — from Pomerleau's
   **ALVINN** in 1986, through the DARPA Challenge, to modern end-to-end learning**. Nobody
   solved it in a single paper.
2. **Most research ideas never become papers.** Mees's honest ratio, spoken: **10 ideas → 5
   experiments run → 2 interesting results → 1 published paper**, "and that would be a good
   ratio". Most ideas don't work; that is the process, not failure.
3. **Most papers don't stand the test of time.** The field moves fast; today's breakthrough can
   be a footnote in two years.
4. **The most impactful ideas are often the simplest, because simple ideas can be scaled.** If
   your idea needs **17 different moving parts** to work, ask whether there is a simpler version
   that gets **80% of the way**.

### The recipe for good research problems (slides 33–35, built in three stages)
1. **An important problem.**
2. **A plan for how to tackle it.** You need **both** — the two failure modes on the slide are
   "**cure cancer** (important, but how?)" and "**an algorithm that improves 1% on the LIBERO
   benchmark** (missing problem)". Mees on the second: LIBERO is "a very narrow and saturated
   simulated robot benchmark" and 1% there "does not move the needle on anything that matters."
   The sweet spot is an important problem where you have an **angle of attack**. Also worth asking
   up front: **if you succeed, how does it help the community — what becomes possible that
   wasn't?**
3. **Excitement!** "Research requires tons of time and effort… you will be more likely to succeed
   if you are excited." Experiments fail, deadlines hurt, papers get rejected — if you find the
   problem genuinely interesting the hard parts feel worth it; **if you're not excited it just
   feels like work.**
4. **Be your own reviewer #2.** Before embarking on a multi-month research journey, ask: **what
   is the most likely reason your idea could fail?** "If you can answer that honestly and still
   believe in the idea, proceed." Why it matters: it **protects your most valuable research
   resource, which is your time.**

### Styles of research (slide 36)
| **Method-driven** | **Problem-driven** |
|---|---|
| You start with an idea, but need to find the problem for it. | You start with a problem, but need to find the method for it. |
| *"Video diffusion models just dropped, let me apply it to robot manipulation… somehow"* | *"How can I make my VLA work with a novel camera viewpoint?"* |

**Both can lead to impactful research, but problem-driven is safer for a PhD student**: if the
method doesn't pan out you can try another one and you are still attacking an impactful problem —
whereas if a method-driven project's method fails, **you have nothing to fall back on**.

### Debugging your research (slide 37)
- **Start with something that should work, then make it incrementally harder** — e.g. run an
  **overfitting experiment** before trying to solve everything at once. "If you start at full
  complexity and your experiment fails, you have no idea what the problem is."
- **Talk to colleagues, authors of papers you are building upon, advisors** — "this can really
  save you weeks of effort."
- **Visualize your model's data and outputs** — both inputs *and* outputs — to understand its
  behaviour. "Really, really important."
- **Revisit your initial assumptions after experiments.**

### Share your research (slides 38–39)
- **Sharing your findings is how you find your community** — the people who care about the same
  problems may be your next collaborators.
- **Open-source code and data** — "the most direct way for your research to be useful to others
  other than yourself."
- **An image is worth a thousand words: polish your figures.** Ideally someone understands a
  figure immediately, without reading the captions or the paper; if they have to work at it,
  they'll move on.
- **Adapt to your audience** — "even experts may know nothing about your specific topic"; don't
  assume they share your foundations.
- **If nobody knows about your research, it didn't happen** — a great paper nobody reads has zero
  impact. Put it on arXiv, post about it.
- **But find the line between making people curious and overhyping it "like this"** — slide 39
  reproduces the tweet: **Brett Adcock (@adcock_brett)**, "we just had an AI breakthrough in our
  lab / robotics is about to have its ChatGPT moment / and that moment is happening tomorrow",
  **1:17 AM · Jan 7, 2024 · 2.4M views**, marked with a large red **✗**. This closes the loop
  with the lecture's opening.

### The personal backstory (slide 40, 54:40–59:25)
> [UNCLEAR: lecture 11, 56:54–59:25 — no stable slide captured for the second half of the story
> (the Franka setup, the simulation environment and CALVIN were shown as videos, "as you can see
> on the left video with the VR controller"). Narrative below is transcript-only.]

Slide 40's own text: "Early PhD: frustrated with thousand ROS nodes, disjoint models and errors
accumulating through a complex pipeline. **Fun fact: robot broke a week before the deadline** →
Can I ditch ROS and learn everything (motor skills + language) end2end for a cool end-of-PhD
demo? What would it take? **Wrote a proposal that funded me for the next PhD years.**"

The full arc as told:
1. **Drowning in the classic pipeline** — "a thousand ROS nodes", disjoint perception, planning
   and control models **accumulating errors** across the stack.
2. **A week before a major deadline the robot broke** — it wouldn't finish self-calibrating at
   startup, so none of his code would run. "As any decent computer scientist would ask in such a
   situation: what do you do? You **try turning it off and on again.**" He did that for a few
   days until it finally self-calibrated — he thinks on the night of the deadline — then pulled an
   **all-nighter** to run every experiment.
3. **The traumatic experience became the research question**: can I ditch all of this and do
   **end-to-end learning** — one model, multiple manipulation tasks, commanded in language?
4. He **wrote a proposal with loose ideas that got funded for a few years**, and convinced his
   advisor to **buy him a Franka** ("I'm very grateful for his help with this").
5. **A year setting the robot up from zero**: custom heavy metal table with holes, writing the VR
   teleop code, mounting cameras, **3D-printing the wrist-camera mounts**, making the low-level
   controller smooth. "A lot a lot of work."
6. Once researching, he realized **iterating in the real world would take forever** but he wanted
   to graduate — so he built a **simulation environment using the same teleop stack** (VR
   controller).
7. Polishing the sim, he found **no simulation benchmark or dataset existed for training
   long-horizon, language-conditioned policies requiring generalization** — so he thought he'd
   polish his sim and "maybe make a small paper out of it, in case it's useful for others".
8. **That byproduct/afterthought became the CALVIN benchmark**, "which to this day is still one
   of my highest-cited papers and also won a best award."
9. **~5 years total** to reach the end-of-PhD demo: **no ROS running, over 25 different
   manipulation tasks, all grounded in language, generalizing to unseen combinations.**

This is the concrete illustration of the research advice: an infrastructure detour, in a lab
"primarily focused on doing SLAM", that then **let him iterate quickly on the problem he actually
wanted to solve**.

## Closing (59:25–end, slides 41–43) — preface material
Slide 41: "**This was my last lecture of the course!**" — thanks for the students' patience with
a brand-new course ("I really felt like we have been flying a plane while building it at the same
time"), thanks for the **mid-term feedback**, and: "**Teaching this has been an absolute
privilege, even while juggling two full-time jobs**" — the first course he has taught, and the
first where he designed all the materials from scratch. He is not a professor; he works in
industry. What made him happy: students excited about their policies training, **scheming to share
data across teams**, and asking the guest speakers insightful questions. The course's goal
"beyond teaching content and basics" is **to inspire that robot learning is a cool field to work
on**. Slide 42: **Huge Thanks to the Teaching Assistants** (group photo) — "this course would not
have been possible without them… the exercises, the project supervision, the robot setups, the TA
sessions, that was all of them" — and he asks the TAs to stand for an applause. Slide 43,
**References** — the material sources for the whole course, which belong in Ch.6's
acknowledgements: **Uni Freiburg, Deep Learning Lab** · **UC Berkeley Deep RL** · **Stanford
University, Deep RL** · **Cornell Robot Learning**.

## Definitions for glossary
Generalization scope (object / room / building / world); physical grounding; non-embodied
foundation model; specialist embodied model; embodied data; backbone (VLM vs generative video
model vs from-scratch); data recipe; data-collection interface (UMI-style, gloves, static and
mobile bimanual puppeteering, VR teleop); data scalability vs hardware alignment; embodiment gap;
dexterous generalist policy; high-frequency control; heterogeneous multimodal sensing; native
multimodal model; long tail of robot sensing; cross-modal paired data; language as semantic glue /
binding; FuSe; multimodal prompting; adaptive test-time compute (TTC); introspection; calibration;
out-of-distribution detection; imitation ceiling; trajectory stitching; offline RL; data flywheel;
expert vs autonomous data; distribution mismatch; temporal mismatch; on-manifold / off-manifold
states; lifelong / continual learning; catastrophic forgetting; rapid adaptation; in-context
learning for robotics; corrective instruction; cross-embodiment demo in context; whole-body
control; environment representation (metric map, Gaussian splat, topological map, scene graph, BEV
projection, walkthrough video); implicit state estimation; loop closure; mapless navigation;
memory at scale (short vs long horizon, semantic events, write/forget policy, retrieval,
cross-modal alignment); autonomous improvement; task proposal; reward detector; PALO;
non-parametric adaptation; method-driven vs problem-driven research; reviewer #2.

## Papers named
**Mees, Tatarchenko et al., IROS 2019** (Self-supervised 3D Shape and Viewpoint Estimation from
Single Images for Robotics); **Jones\*, Mees†, Sferrazza\*, Stachowicz, Abbeel, Levine, ICRA
2025** (Beyond Sight / FuSe); **Zhou\*, Atreya\*, Lee, Walke, Mees, Levine, CoRL 2024**
(Autonomous Improvement of Instruction Following Skills via Foundation Models); **Myers\*,
Zheng\*, Mees et al., CoRL 2024** (PALO); **Mees, Burgard, ISER 2021** (Composing Pick-and-Place
Tasks By Grounding Language); **Pomerleau's ALVINN, 1986**; the **DARPA Challenge**;
**VLMaps** and **LeLaN** (transcript only — see [UNCLEAR]); the **CALVIN benchmark** (named in
the story, no slide); **Sutton's bitter lesson** (invoked at 31:00, assigned reading). Systems and
organizations named: Genesis AI; Brett Adcock (Figure) and his tweet; Boston Dynamics humanoid;
a Stanford mobile manipulator; Sora; ROS; Franka; Octo; LIBERO. Guest lectures referenced: **Scott
Reed** (backbone/from-scratch camp) and **Cheng** Chi (UMI). Course material references (slide
43): Uni Freiburg Deep Learning Lab; UC Berkeley Deep RL; Stanford Deep RL; Cornell Robot
Learning. Assigned but not directly covered: **LeCun 2022**, **Brooks 1991**.

## Figures worth reproducing
- `slide_003.jpg` — the generalization-scope nesting (1 object → the world). Chapter opener.
- `slide_004.jpg` — non-embodied foundation models vs specialist embodied models.
- `slide_005.jpg` — the embodied-data ↔ foundation-model loop.
- `slide_006.jpg` — the three backbone camps.
- `slide_007.jpg` + `slide_008.jpg` — the four data-recipe pyramids.
- `slide_009.jpg` — the zoo of data-collection interfaces.
- `slide_010.jpg` — data scalability vs hardware alignment (10³–10⁷ hr).
- `slide_011.jpg` — the dexterity/generalization Venn with **Goal** in the intersection.
- `slide_013.jpg` — native multimodal models (interleaved any-modality token sequence).
- `slide_014.jpg` — the long tail of robot sensing (scarcity / pairing / heterogeneity).
- `slide_016.jpg` — FuSe: giving VLAs senses they were never trained on.
- `slide_017.jpg` — **the confidence-graded reasoning table** (key figure; pairs with Ch.10).
- `slide_019.jpg` + `slide_020.jpg` — the 1→2→3 imitation ceiling and the offline-RL 1→3 stitch.
- `slide_021.jpg` — the data flywheel.
- `slide_022.jpg` — expert vs autonomous data, the two mismatches.
- `slide_023.jpg` — lifelong learning vs "reality today", with the gap.
- `slide_024.jpg` — rapid adaptation: three in-context routes.
- `slide_025.jpg` — today's SLAM→VLA pipeline vs the unified model (the hard handoff).
- `slide_027.jpg` — autonomous improvement with task proposals + reward detector.
- `slide_028.jpg` — PALO: 5 demos vs 100.
- `slide_029.jpg` — **the four pillars** (chapter closer).
- `slide_032.jpg`–`slide_039.jpg` — the research-methods sequence (harsh realities, the recipe,
  styles, debugging, sharing, the overhyped tweet).
- `slide_040.jpg` — the personal backstory panel.

## Student Q&A
**None.** No questions or neighbour discussions in this lecture; it ends slightly over time
("Oh, okay, we are at time") and hands over to the guest speaker.

## [UNCLEAR] / caveats
- **Numbering, third time.** The deck reads "**Lecture 12**: Frontier & Open Problems" and Mees
  opens with "the **12th** and last lecture from my side" — one ahead of the playlist, where this
  is the **11th** main lecture (dated 11.05.2026 = Week 11 / May 11 on the course page). The same
  +1 offset appeared in Ch.9 (deck "Lecture 10") and Ch.10 (deck and speech "Lecture 11"). Worth
  **one** footnote in the preface explaining the course's internal numbering runs one ahead of
  the public playlist from lecture 9 onward, then use playlist numbers throughout and never
  repeat the deck's label.
- Three content gaps where no stable slide could be extracted (autoplaying video / screenshots).
  All three are flagged inline above; consolidated here so Phase 9 can check they survive:
  `> [UNCLEAR: lecture 11, 02:29–05:03 — "robotics is solved" announcements + the three-step
  rockstar-demo recipe: transcript only.]`
  `> [UNCLEAR: lecture 11, 41:01–41:50 — VLMaps / LeLaN slide not captured; names reconstructed
  from captions, authorship unverified.]`
  `> [UNCLEAR: lecture 11, 56:54–59:25 — Franka setup / simulation / CALVIN slides not captured;
  narrative is transcript only.]`
- **Slide 2 is a duplicate of slide 1** (title slide re-shown at 01:19) and **slide 26 duplicates
  slide 25**, **slide 30 duplicates slide 29** — artefacts of the deck's build steps, not new
  content. The memory-at-scale material (39:31–41:01) was spoken over the duplicate slide 26 and
  has **no slide of its own**.
- **CALVIN's award is vague in the transcript** — "won a best award". Do not name a specific award
  in Ch.11 without checking; "an award" or a checked citation only.
- Caption manglings fixed against the slides: "Yumi style grippers" → **UMI-style** (slide 9);
  "Ross notes" → **ROS nodes**; "Alvin car" → **ALVINN** (slide 32); "liberal benchmark" →
  **LIBERO** (slide 33); "Brad Adcock" → **Brett Adcock** (slide 39); "PAL" → **PALO** (slide 28);
  "Leela" → **LeLaN** and "VL maps" → **VLMaps** (both unverified, see above); "Calvin" →
  **CALVIN**; "physical HRI" is what the captions give for the third hype claim and may itself be
  a mangling — treat as unverified.
- Mees's own work again supplies most of the "first steps" (FuSe, autonomous improvement, PALO,
  VLMaps, LeLaN, CALVIN, the IROS 2019 shape estimation). Ch.11 should say plainly that these are
  the lecturer's examples of early progress, not a survey of the field's best attempts.
- The lecture makes **no quantitative claims** other than PALO's **5 vs ~100 demonstrations**,
  the **10³/10⁵/10⁷ hr** scalability axis, the **~50 Hz** control-loop figure on slide 17, the
  **~40 years** of self-driving work, the **10 → 5 → 2 → 1** research ratio, the **>25 tasks** and
  **~5 years** of the PhD demo, and the tweet's **2.4M views**. Everything else is qualitative —
  Ch.11 should not manufacture numbers to look like the technical chapters.

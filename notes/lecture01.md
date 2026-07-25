# Lecture 1 — Introduction to Robot Learning (raw notes)

- Video: <https://www.youtube.com/watch?v=X0k14u6pSxw> (64.5 min)
- Transcript: `transcripts/01_introduction.txt` (auto-caption, 9,480 w)
- Slides: `slides_png/lecture01/` (44 reconstructed frames), OCR `slides/lecture01.txt`
- Speakers: **Marc Pollefeys** (intro/mentor, 00:00–02:01), then **Oier Mees** (teaches).
  Captions mangle "Oier Mees"→"Oyer Mes", "Freiburg"→"Framework". Slides are ground truth.

Nature of lecture: motivational/historical overview. Almost no math (one notation
slide, #39). The book's Chapter 1 is built from this.

---

## Cast, dates, numbers (all from transcript/slides)

- Course: **263-5911-00L**, "Robot Learning: From Fundamentals to Foundation Models",
  Spring 2026, first lecture dated **16.02.2026** (slide 1).
- Marc Pollefeys: ETH CS professor + leads Microsoft **Spatial AI Lab**; Oier Mees is
  a researcher there. Course is Mees's; Pollefeys is mentor. [00:02]
- Oier Mees bio (slide 2): from Basque Country, Spain; PhD **Freiburg**; postdoc
  **Berkeley** (with **Sergey Levine**, [02:22]); now Zurich/Microsoft.
- **290 enrolled students** [05:04]; open TA positions.
- **50 × SO-101** robots purchased (Mees says "50 SO101 … thanks to the generosity of
  Mark"; slide 7 & transcript [19:00]). From "Leo Robot" [= LeRobot] with a
  puppeteering (teleop) setup for demos.
- Grading (slide 11, [15:56]): **Paper presentation & discussion 20% / Practical
  homework 40% / Final group project 40%. No final exam.**
- 4 individual HWs (slide 9): HW1 PyTorch & NumPy (16.02–26.02); HW2 Robot Control &
  MDPs (23.02–05.03); HW3 Imitation Learning (02.03–16.03); HW4 Reinforcement Learning
  (16.03–30.03). Autograder + Gradescope; GitHub `mees-robot-learning-course/ethz-course-2026`.
- Format: Mon 16:15, ~45 min lecture + student paper discussion; guest spotlights ~20
  min on most weeks; Thu 10:15–12:00 TA practice. HW1 deadline later extended to Mar 5.

## Data-scaling worked numbers (slide 32, [44:00]) — reused in Ch.1

"Average time for a single human to read/process the training set":
- **ImageNet ≈ 2 years**
- **GPT-2 ≈ 60 years**
- **Llama 3 ≈ 90,000 years**
Circles "not to scale" (Mees apologizes). Point: data scale drove the vision/NLP
paradigm shift; robotics lacks data at this scale.

---

## Slide-by-slide map (reconstructed slide → content → what was said)

Real PDF page numbers (from slide corners) noted as "pg N".

1. **Title** (pg 1). "Robot Learning: From Fundamentals to Foundation Models", L1.
2. **About Me** [01:43]. Map graphics Spain→Germany→Berkeley→Zurich. Mees bio.
3. **Course Staff: TAs** (pg 3) [04:05]. 8 TAs w/ photos+emails: Alexey Gavryushin,
   Jonas Pai, Liam Achenbach, Nicola Irmiger, Tianxu An, Šimon Sukup, Nicole Damblon,
   Zador Pataki.
4. **Course Staff: TAs** (pg 4) [05:01]. Carl Brander + "several open TA positions".
5. **The Plan for Today** [05:34]. (1) Course goals & logistics (2) Why study RL.
6. **Course Goal** [05:52]. Four bullets: Mastery of Fundamentals (Imitation,
   Reinforcement, Policy Learning); Practical Skills (sim + real-robot deployment);
   Frontier Models (foundation models for robotics); Systems Design (scalable pipelines
   for perception, control, reasoning).
7. **Course Structure** [08:24]. Website, Mon/Thu schedule, 4 HWs, group projects on
   SO-101.
8. **Paper Discussion** [10:22]. 3 papers/lecture; 15 min each; groups of 4; Group A
   presents & defends, Group B criticizes ("reviewer two"). QR to sign-up sheet.
9. **Individual Homework** [13:00]. The 4 HWs + dates; Gradescope; GitHub link.
10. **Homework Advice** [13:57]. "NNs take time to train… don't start the night
    before." (meme: "Me waiting for my neural network to finish training").
11. **Course Grading** (pg 12) [14:59]. 20/40/40.
12. **Feedback Welcome** (pg 13) [15:49]. First time teaching at this scale; surveys.
13. **Robots in Science Fiction** (pg 14) [16:53]. Q the Automaton 1918, Metropolis
    1927, Star Wars 1977, The Jetsons 1962, Transformers 2007, Wall-E 2008. Timeline of
    *evolving expectations* for autonomy: industrial → utility/service → social agents.
14. **Why Robots** (pg 15) [24:25]. Photos: Mars rover, surgical robot, mining, elderly
    care. Reasons robots matter: dangerous/distant/demanding tasks — interplanetary &
    ocean exploration, dirty/dangerous jobs (mining), disaster search-and-rescue,
    healthcare, and the **aging-society care crisis**.
15–22. **Shakey the Robot** (pg 16) [26:35–28:xx]. SRI/Stanford **1966** video (note:
    Mees says "Stanford"/"developed in Stanford" at [28:xx] though Shakey was SRI
    International; slide says "Stanford 1966"). Key claims: first robot doing **planning**
    (not scripted); **sense–plan–act** loop; TV camera for scene analysis, sonar/cat-
    whisker feelers, push bar; ran on a computer with **300,000 36-bit words** of
    storage over a radio link. **A\* was developed for Shakey** ("fun fact", [27:xx]).
    A* would run for "minutes or half an hour or an hour" before deciding a move.
23. **Robot Engineering** (pg 17) [29:39]. Sense-Plan-Act; similar to Shakey; structured
    environments only. 70s–90s industrial arms (car assembly): sense → geometric plan in
    known map → act with high precision. Successful only in **structured** settings —
    "state machines", "very blind", don't adapt to changes. Course goal: **move beyond
    the closed-world assumption** with data-driven algorithms.
24. **When State Estimation Fails** (pg 18) [32:02]. DARPA Robotics Challenge 2015 &
    Boston Dynamics falls. Even world-class hardware relies on **near-perfect state
    estimation**; QR codes on Atlas for localization; a few cm off → catastrophic.
25. **When State Estimation Fails** (pg 18, more) [33:23]. Boston Dynamics 2018/2022
    parkour = "almost blind" movements assuming perfect environment knowledge; small
    perception/planning error → falls & broken hardware.
    → **Moravec's paradox** ([33:xx], stated verbally, not on its own slide): Hans
    Moravec, CMU faculty, **1988**. High-level reasoning (chess, math) is *easy* for AI;
    sensorimotor skills that toddlers/animals do effortlessly are *hard* — no internet
    data to crawl for "how to grasp a bottle and drink". Example: Mees's PhD 2019 PR2 in
    Freiburg grasping a mug from point clouds + analytical grasp-pose estimation — fails,
    then crushes the mug ([34:50]). Orangutans use tools by imitation, effortlessly.
26. **Robot Learning** — Venn diagram [35:44]. **Robotics** (Physical World, Engineer
    Solutions) ∩ **Machine Learning** (Digital World, Data-driven Solutions) = **Robot
    Learning**. Def (verbatim [35:xx]): "*Robot learning is the study of algorithms that
    enable a robot to acquire new skills or adapt to an unstructured environment by
    learning from data and experience rather than relying on explicit or hand-coded
    programming.*" Synthesis = "bringing generalization into the physical world."
27. **Robot Learning** [37:04]. "**Solving Robotics via Machine Learning**." Left = the
    *what* (Perception, Control) — pillars of robotics, historically model-based. Right =
    the *how* (Imitation Learning, Reinforcement Learning, Dynamics Learning,
    Representation Learning) — the ML toolbox.
28. **Are These Robots?** (pg 22) [38:05]. Dishwasher / da Vinci surgical robot / ChatGPT
    on phone. Think-pair-share. Student answer [38:50]: dishwasher = robot (changes
    physical world); ChatGPT = not (no embodiment, world unchanged); surgical robot =
    teleoperation, not autonomous. Mees: RL wants the intersection — appliance
    reliability + surgical dexterity + foundation-model reasoning.
29–30. **Why Don't We Already Have Autonomous Robots?** (pg 23) [41:10]. Berger &
    Wyrobek, Stanford **2007**, **PR1** tidying a room — but **teleoperated**. Point: the
    *hardware* to tidy a room has existed since 2007; the missing piece is the *software/
    brain* (autonomy).
31. **Recent Hardware Advances** (pg 24) [41:59]. Humanoid line-up (Boston Dynamics,
    Unitree, Figure, Tesla, Sanctuary, Agility, Apptronik, 1X…) + NVIDIA GPU racks. Two
    fronts shifted since 2007: humanoids went from prototypes to a commercial industry;
    compute exploded. "A robot platform without a brain is just a puppet."
32. **Recent AI Advances: Data Scaling** (pg 25) [43:41]. The 2yr / 60yr / 90,000yr
    chart (see numbers above).
33. **Recent AI Advances: Models** (pg 26) [46:14]. CV segmentation → **AlphaGo** →
    **Gemini** (multimodal). AlphaGo's **move 37** (game 2) — "so alien" it looked like a
    hallucination, actually a novel strategy. Robotics wants to move from the
    **hand-coded era to the discovery era**.
34. **Recent Advances in Robot Learning** (pg 29) [49:20]. **Large Datasets** ×
    **Large Models**. Dataset = **Open X-Embodiment** ("Open X-Embodiment: Robotic
    Learning Datasets and RT-X Models", Open X-Embodiment Collaboration, **Mees et al.,
    ICRA 2024, Best Conference Paper Award, out of 1765 papers**). >200 institutions,
    ~22 embodiments (single/dual arm, navigation…) — "ImageNet for robotics." Mees
    misspeaks "2004"; it is 2024. Models named: **Octo, Isaac GR00T, π₀, RT-2**.
35. **[Pick up the spoon]** (pg 30) [50:05]. Basic policy: image obs + language
    instruction "Pick up the spoon" → Policy → ACTION `[Δx, Δθ, ΔGrip] = …` (end-effector
    poses).
36. **Vision-Language Model** (pg 32) [51:20]. Swap robot image → Statue of Liberty
    image; instruction → "Caption the scene"; output → "The picture shows the Statue of
    Liberty in NY". Same shape as a VLM.
37. **Key: Robotics as Multimodal Sequence Modeling** (pg 33) [51:59]. Language / Image /
    Action **tokens** in one sequence. The book's thesis slide. Lets robotics **leverage
    NLP/vision advances**. (Only place "sequence modeling" is defined at high level.)
38. **So we train a large transformer on robot data and we are done?** (pg 34) [52:36].
    "**Not quite…**" Then the four robotics-specific difficulties [52:40–54:30]:
    (1) **data scarcity** — teleop supervision is expensive/slow; OXE still ≪ LLM data;
    (2) **highly multimodal & heterogeneous** — many sensors, every robot has different
    sensors/actuators; (3) **real-time** control → model size matters (can't wait for a
    100B API call on a quadruped); (4) **evaluation on real hardware is tedious/expensive**.
39. **Algorithms for Robotic Learning** (pg 36) [54:40]. **IL vs RL** table (only
    notation in L1):
    - Imitation Learning: given labeled data $\mathcal{D}=\{(x_i,y_i)\}$, learn
      $f(x)\approx y$; assumes inputs $x$ are **i.i.d.** Dataset → Supervised Learning.
    - Reinforcement Learning: learn behavior/policy $\pi(a\mid s)$; data is **not**
      i.i.d., actions affect future states; Dataset ↔ RL loop with reward & trial.
    Verbal [55:xx]: IL = "supervised learning for the physical world"; i.i.d. = points
    independent & identically distributed, links train/test performance. RL = trial-and-
    error to maximize reward; in robotics data is not i.i.d. (actions affect future
    states → feedback loop).
40. **Course Syllabus: 1st Half** (pg 37) [58:19]. Fundamentals & Algorithms: Robot
    Control & MDPs; Imitation Learning; Reinforcement Learning (Online & Offline).
    Homework in simulation. Sim = **MuJoCo**, SO-101 arm (built by Liam), same as real
    projects for code reuse.
41. **Course Syllabus: 2nd Half** (pg 38) [59:52]. "**Scaling Robot Learning**":
    Generative Models; Sequence Modeling & Transformers; World Models; Robot Foundation
    Models & Embodied Reasoning. Group projects with real robots.
42. **After the Course** (pg 41) [62:42]. DARPA Robotics Challenge 2015 → **Figure AI
    2026**. Parallel paradigm shifts: manipulation, self-driving (DARPA 2005 desert →
    Tesla self-delivery), humanoids (DARPA 2015 → Figure). "Hard-coding → learned
    physical intelligence."
43. **Why You Should Study Robot Learning** (pg 42) [64:09]. Broad skills (foundation-
    model training ↔ PID control); advances universal across applications. ("I WANT YOU
    TO SOLVE PHYSICAL AGI" Uncle-Sam meme.)
44. **Thank you** [64:25].

---

## Definitions to carry into the glossary
- **Robot learning** (slide 26, verbatim above; also "solving robotics via machine
  learning", slide 27).
- **Sense–Plan–Act** (Shakey/industrial paradigm, slide 23).
- **Moravec's paradox** (Moravec, CMU, 1988; verbal, ~[33:30]).
- **i.i.d.** (slide 39 / [55:30]) — independently & identically distributed; each point
  doesn't influence others & all from the same distribution; links train/test perf.
- **Generalist robot policy / robot foundation model** ([47:xx]) — the field's "North
  Star": take a large robot dataset in, output actions for **any task, any robot, any
  environment**; "download your favorite robot brain online", plug-and-play.
- **Robotics as multimodal sequence modeling** (slide 37) — language/image/action tokens.

## Systems / datasets / papers named (with timestamps)
- Shakey (SRI, 1966); **A\*** developed for it [27:xx].
- PR2 (Mees PhD, Freiburg, 2019) mug-grasp failure [34:50].
- PR1 (Berger & Wyrobek, Stanford 2007) teleoperated tidying [41:10].
- DARPA Robotics Challenge 2015; Boston Dynamics Atlas (2018, 2022); DARPA Grand
  Challenge (self-driving) 2005.
- **Open X-Embodiment** (Mees et al., ICRA 2024, Best Paper /1765) [49:20].
- Models: **Octo, Isaac GR00T, π₀ (pi-zero), RT-2** (slide 34); RT-2 from Google [50:xx].
- AlphaGo (move 37); Gemini; GPT-2, Llama 3, ImageNet (data-scaling).
- Companies: Figure, Tesla, Boston Dynamics, Physical Intelligence [60:xx].
- Sim: MuJoCo, SO-101 / LeRobot.

## Student Q&A (good chapter material)
- [11:30] "One paper or all?" — present *one* as a team; recommended to read all.
- [17:10] Mark asks re **compute**: HW1 runs on a PC; more compute sought for 2nd-half
  robot projects.
- [18:03] Paper sign-up logistics — "just write your name, don't overcomplicate."
- [18:40] Final project? — 50 SO-101 robots; a set of **canonical projects** (TA load
  would be too high for 50 bespoke ones); flexibility for advanced/PhD students to do
  research-aligned projects on their own platforms (Pollefeys, [21:40]).

## Figures worth reproducing (source → caption idea)
- `slides_png/lecture01/slide_026.jpg` — Robotics ∩ ML Venn ("Robot Learning").
- `slides_png/lecture01/slide_027.jpg` — "Solving Robotics via ML" (what vs how).
- `slides_png/lecture01/slide_032.jpg` — data-scaling circles (2yr/60yr/90,000yr).
- `slides_png/lecture01/slide_037.jpg` — multimodal sequence modeling (L/I/A tokens).
- `slides_png/lecture01/slide_039.jpg` — IL vs RL comparison (the one notation slide).

## [UNCLEAR] / caveats
- Shakey attribution: slide & Mees say "Stanford 1966"; historically SRI International
  (Menlo Park). Ch.1 will state "SRI (the slide says Stanford)" — **Editor's note**.
- "Leo Robot" in transcript = **LeRobot** (Hugging Face) — caption mangling.
- "2004" for Open X-Embodiment is a slip for **2024** (slide/paper are 2024).

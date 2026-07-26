# Guest Lectures I: Where the Data Comes From

Alongside the eleven main lectures the course ran a second track. Each week a researcher who had
built the thing under discussion came to talk about it — usually over Zoom, usually for half an
hour, usually with fifteen minutes of questions from the lecture hall afterwards. Ten of those
talks are recoverable, and this chapter and the next set down what was in them.

They are worth the two chapters they take. The main lectures are a survey: they have to cover
imitation learning in seventy minutes and cannot stop to say what it is like to run a thousand
gloves through a calibration rig, or why the run you would have killed after eight GPU-weeks was
the one that worked. The guests could stop. What they add is not more coverage but a different
kind of evidence — the numbers people actually got, the approaches that failed quietly, and in
several cases a flat contradiction of something the field says out loud.

This chapter takes the first five, from weeks 2 through 6. They arrange themselves around one
question, which is the question the main lectures keep running into: **robot data is scarce, so
where is more of it going to come from?** Abhishek Gupta says simulation, if you can stop paying
for it by hand. Danfei Xu says people, recorded going about their lives. Aviral Kumar says the
data we already collect is the wrong *kind*, and names what is missing. Andrew Wagenmaker says
the robot should collect its own. Cheng Chi says that whatever you decide, the hard part is the
supply chain and the thousand people you have to hire. Chapter 13 takes weeks 7 through 11, which
ask what to build once you have the data.

## How these two chapters were sourced

The course publishes no slides for the guest talks. This was checked three ways: the course page
lists the speakers but links no decks; each video description links only back to the course
website; and the course GitHub repository contains the four homework assignments and nothing else
— no PDFs at all, for the guests or for the main lectures. The decks here are therefore
reconstructed from the recordings by the same procedure the preface describes for the main
lectures, and the figure credits say so.

Two things follow that a reader should know about.

**The transcripts are auto-generated captions, and they are worse here than in the main
lectures.** Most speakers are remote, several are fast, and technical names take a beating. The
captions render π0.7 variously as "PILE-7", "Pilot 7", "PyTorch 7" and "Pyro 7"; EgoMimic becomes
"Google makes"; world action models become "whens"; Aviral Kumar's method, which the slide shows
as **RaC**, is spoken onto the transcript as "rack". Every name, number and acronym in these two
chapters was therefore checked against the slide image before it was written down, and where the
slide does not settle it, the text says so instead of guessing.

**The recordings are Zoom screen-shares, not clean slide captures.** A live speaker webcam sits
over the top-right corner of the frame, and some talks add a column of participant thumbnails
down the right edge. The slide reconstruction excludes that strip from its change detection, so
the decks come out — but a slide title that runs to the right-hand edge can be physically
occluded by the speaker's face. Where that happened and the words could not be recovered, the
text carries an `[UNCLEAR]` marker rather than a plausible reconstruction.

**One talk cannot be recovered at all.** Week 12 was given over entirely to guests, and Dieter Fox
(University of Washington, and director of robotics research at NVIDIA) spoke. The eleventh entry
in the guest playlist is a **private video**; `yt-dlp` reports one unavailable video hidden, and
the course page lists no recording for that week. There is no transcript, no deck, and no
secondary record of what was said. Nothing about that talk is reported here, because there is
nothing to report — inventing a summary from the speaker's published work would be exactly the
substitution this book refuses to make.

> **Editor's note.** Notation in these two chapters follows the book's symbol set (the appendix)
> wherever the object already has a symbol there — $\pi_\theta$ for a policy, $\phi$ for an
> encoder or critic, $o$ and $a$ for observations and actions. Where a speaker introduces
> something the book has no symbol for, their own notation is reproduced and flagged, because a
> reader who goes to the paper should find the same letters. One collision is worth naming in
> advance: in @eq:jot below, $\epsilon$ is an entropic-regularization weight, not the Gaussian
> noise it denotes everywhere else in this book.

## Abhishek Gupta: simulation, once you stop paying for it by hand

Gupta runs the WEIRD lab at the University of Washington — Washington Embodied Intelligence and
Robotics Development, a name he notes they were allowed to keep — and he organizes the entire talk
around a joke about being lazy. It is a better organizing device than it sounds. Each of his three
sections deletes one category of human labor from the simulation pipeline, and the joke is what
holds them together.

The setup is the data argument from Chapter 1, sharpened. Vision and language grew from MNIST to
ImageNet to LAION, from a few tens of thousands of labelled sentiments to trillions of tokens of
Common Crawl. The part that matters is not the size but that the growth was **passive**: nobody
sat down and typed the internet in for the purpose. People were using it anyway, so the data
accumulated anyway. Robotics has no such stream, because there are not enough robots deployed in
enough real applications for one to exist. Teleoperation rigs — UMI grippers, VR controllers — are
much better than what came before, but they are still *active*: somebody has to go to $K$
different environments and spend the time, and Gupta's line is that at the coverage vision and
language achieved, this is "a proposition that I certainly don't have funding for".

So he proposes **off-domain data**: data relevant to robotics that was not collected on a robot.
Generative models, large-scale video, and the subject of the talk, simulation. He states the
catch before the benefits, which is the reason to trust the rest:

> Off-domain data is wrong data. It's never going to be as good as your data on a robot collected
> by some high-quality expert operator. But it can still be useful.

Simulation's advantages are the familiar ones — compute instead of person-hours, privileged state,
free resets, easy reward specification, faster than real time, massively parallel — and he credits
ETH directly for much of the legged and humanoid progress those advantages enabled. But the
advantages are "in principle", and the qualifier is the talk. Getting simulation to work for
manipulation means an artist or a graduate student building a scene in Blender for many hours,
then many more hours getting a robot to do anything in it, then discovering the simulator does not
match reality and hand-tuning parameters until it does. Three sections, three deletions.

### Real-to-sim: environments from a phone video

Walk through a kitchen with a short video and get back not a static mesh but a **fully interactive
articulated scene** — microwave, cabinets and dishwasher all movable, physics attached. The
pipeline combines Gaussian splatting, which turns multi-view images into high-fidelity geometry
and appearance, with foundation models — Grounded SAM, and GPT-4 at the time — that segment the
parts, decide whether each is a cabinet, a drawer, a dishwasher or a fridge, and articulate them
with the appropriate hinges and joints, iterating between the two. Only the phone's camera images
are used; he is explicit that they take neither the iPhone's depth nor its lidar, and that COLMAP
recovers where the cameras were. The same procedure applied to a range of different kitchens
produces a scene that looks like *that* kitchen rather than a generic one, and the cost falls from
several days to several minutes.

The payoff he spends the most time on is not data generation but **evaluation**, and it lands
directly on the problem Chapter 9 leaves open. Evaluating a real robot policy means a human in the
room running trials one at a time, which makes every new algorithm expensive to assess. But a
photorealistic reconstruction lets you evaluate *policies that were trained in the real world*
inside the simulator. They rebuilt scenes at Washington and at Princeton and ran Physical
Intelligence's policies — trained on real data, with no simulated data in them — inside the
reconstructions.

![Real-to-sim evaluation. Policies trained in the real world are run inside reconstructed scenes; each point is a policy, and the axes are its simulated and real success. What has to transfer is the ordering, not the absolute number. Credit: reconstructed from the guest-lecture recording, Abhishek Gupta, week 2.](../slides_png/guest01_gupta/slide_019.jpg){#fig:gupta-realtosim width=88%}

The metrics on the slide are **Pearson $R = 0.90$**, which you want high, and **MMRV $= 0.03$**, a
mean rank-violation measure, which you want low (@fig:gupta-realtosim). Gupta is careful about what
the claim is: not that behavior is identical, but that **the ordering transfers** — a policy that
looks better in simulation is better in reality — and the slide's own summary is "strong
correlations and policy rankings on held-out scenes". Two caveats he volunteers, one of which the
slide labels the "magic sauce". It is not zero-shot: a little simulation data has to be co-trained
into the mixture so the model adapts to the general fact of simulation. And on less realistic
scenes it worked considerably worse.

### Behavior without reward engineering: resets as the privilege

Generating behavior in a simulator normally means either teleoperating it through a VR interface
or writing a reward function, and he shows one of the latter — a screen of terms with arbitrary
weights — as an object lesson. His students Tyler and Patrick asked whether simulation's
*privileges* could substitute for that work, and settled on the one privilege that has no real
counterpart: **you cannot teleport the world, but you can teleport the simulator.**

The exploration problem is a needle in a haystack. Starting always from the same initial state,
a randomly wiggling arm has to stumble onto the goal, and reward shaping exists mostly to direct
that search. But if the simulator can be reset anywhere, start it *next to the goal*, where the
problem is trivial; then one step away; then two. Each problem is short-horizon and easy, and the
reset distribution does the work that shaping would have done. Their reset states include
partial assemblies and partial grasps, generated programmatically.

What comes out is contact-rich behavior learned from **sparse rewards only, with no demonstrations
and no reward design**: non-prehensile nudging, wiggling, flipping, furniture assembly, using the
edge of the table as a fixture. Gupta stresses two things about it. The behavior is emergent — none
of it is coded. And **the code is identical across tasks; the only per-task input is the CAD
model.** Broad resets also buy broad competence: place the table anywhere in the workspace and it
gets assembled, where a demonstration-trained policy succeeds only in the narrow region the
demonstrations covered.

Where does the reset distribution come from? For assembly, from **assembly through disassembly** —
the user supplies the completed assembly, and noise is injected backwards from it to generate
nearby states. Asked in the Q&A how to define "close to the goal" for tasks that are not assembly,
he does not have an answer and says so: "I think it's a pretty open question how you do this for
the broader class of any problem."

### Sim-to-real without system identification

Simulation is wrong. The physics is a bit wrong and the visuals are a bit wrong, and the standard
response is to spend human time making it less wrong. Gupta's alternative rests on a distinction:
simulation is **right about global structure** — pick up the leg, insert it, rotate — and wrong
about local contact and forces. So keep what it is good at and fix the rest from reality. They
cast this as world modelling: pre-train a world model in simulation, freeze the long-horizon part,
and adapt only the short-horizon prediction using real data, autonomously. Transferred policies
initially get the details wrong and fail to seat the leg; roughly **fifteen minutes** of autonomous
real-world data turns that into complete furniture assembly, with the same recipe working on other
manipulation tasks and on quadrupeds, where it corrects the physics errors while inheriting the
gait structure from simulation.

One more Q&A answer is worth recording because it cuts against an intuition the field holds
strongly. Asked whether they try to estimate physical properties — friction, softness, damping —
and import them into the simulator, Gupta says they have tried it several times and found it
**less effective than simply randomizing over a reasonable parameter range** and training a policy
that is adaptive across it. He hedges appropriately: their tasks are not very dynamic, and which
problems system identification actually pays for is open.

## Danfei Xu: humans as the data source, and the triangle that constrains it

Xu opens by asking whether the day's topic really was imitation learning, and on being told it
was, offers what he calls an alternative view. The hypothesis under test is simple: **robot
capability can be scaled with human experience data**, on the grounds that language and vision
models succeed on naturally occurring data while robotics still runs almost entirely on
teleoperation.

His framing device is the **triangle of robot learning** — data source, learning algorithm, and
physical system. The claim is that you cannot change one corner in isolation, and that progress
comes from co-designing all three. He returns to it as a scorecard after each result, which makes
the talk unusually easy to follow, and it also sets up his diagnosis.

Teleoperation, he argues, welds the three corners together. Data exists only when a human acts
*through a particular robot*; the algorithm learns from that robot's data; the resulting policy
runs on that hardware and no other. To get more data you need more robots; to change embodiment
you re-collect from scratch. Behind the engineering bottleneck is a larger waste: humans carry
enormous sensorimotor knowledge about the physical world, and we capture it only in the rare
moments someone deliberately drives a robot. Everything else is discarded.

### EgoMimic: treating a person as another embodiment

The proposal is to take the robot out of the collection loop and record humans **acting naturally**
with wearable cameras — data that is rich, collectable anywhere, and requires no deliberate
demonstration. **EgoMimic** captures it egocentrically with Project Aria glasses and then, rather
than treating it as a separate modality, treats the human as simply a different kind of robot with
inputs and outputs, so the data can sit alongside robot data in one training mixture.

Two gaps had to be closed to make that literally true, and both are hardware answers to a data
problem — the triangle in action.

The first is embodiment and viewpoint. In 2023 there were few human-like robots, so they built
lean human-like arms — and then mounted **the same Aria glasses on the robot**, so that the camera
hardware and the viewpoint match and the inter-embodiment gap shrinks to something a network can
bridge.

The second is subtler and is the technical heart of the first half. A robot's actions are
naturally expressed in a fixed frame. A human's head moves constantly — you look around, check the
workspace, glance at what you are about to pick up — so a hand position recorded egocentrically is
tracked relative to a *moving* reference frame, which makes it useless as action supervision. The
Aria glasses run SLAM, which gives head pose in a world frame, so trajectories can be transformed
into a stable base frame. Xu shows the before and after: hand trajectories scattered by head
motion, then the same trajectories resolved into clean, stable curves.

With inputs and outputs aligned, the policy itself is deliberately unremarkable — ordinary
behavior cloning on the combined data. Tasks include bagging groceries, where he points out the
closed-loop policy correcting its own mistakes; folding clothes; and making pour-over coffee, about
which he is refreshingly blunt: "It's a very hard task. Succeeds once in a while."

The scaling result is the point. Plotting hours collected against performance, robot-only data
gives a mild upward slope; adding human data on top of a base of robot data produces a pronounced
jump. And humans demonstrate **up to ten times faster** than teleoperation, with no robot tied up
while they do it.

### EgoBridge: pulling the two distributions together

EgoMimic still requires the task to appear in the robot data as well — paired and
co-distributed. The ambition is **zero-shot transfer**: the robot performs something that exists
only in human data. The idealized picture is a domain-invariant latent space in which human and
robot data for the same task land together, so that a new task seen only in human data still
decodes to sensible actions.

In practice it does not happen. Their student Ryan found the human and robot data form two clearly
separated clusters in the learned latent space. **EgoBridge** is the response: supervise the
alignment directly with an optimal-transport objective.

$$\mathcal{L}_{\text{OT-joint}}(\phi) = \sum_{i,j} \big(T^*_\epsilon\big)_{ij} \cdot \mathcal{C}\Big(\big(f_\phi(o^H_i), a^H_i\big),\ \big(f_\phi(o^R_j), a^R_j\big)\Big)$$ {#eq:jot}

**In words.** Find the cheapest way to match human experience to robot experience, pair by pair,
and then push the encoder to make the matched pairs actually look alike.

**The symbols.** $f_\phi$ is the policy's encoder, with parameters $\phi$ — the book's convention
for an encoder, and the slide's too. The superscripts $H$ and $R$ mark human and robot data:
$o^H_i$ is the $i$-th human observation and $a^H_i$ the accompanying human action, and likewise
$o^R_j, a^R_j$ on the robot side. $\mathcal{C}$ is the **transport cost** between one
latent-and-action pair and another. $T^*_\epsilon$ is the **transport map** — the optimal
soft matching between the two sets, with $(T^*_\epsilon)_{ij}$ the mass moved from human sample
$i$ to robot sample $j$. Its subscript $\epsilon$ is the entropic-regularization weight that makes
the transport problem differentiable, and is **not** the Gaussian noise that $\epsilon$ denotes
elsewhere in this book.

**Why this shape.** Two properties earn the choice of optimal transport over a simpler
distribution-matching penalty. It aligns the two distributions *without destroying the internal
structure of either* — mass is moved, not collapsed — which matters because the robot marginal is
the thing you ultimately deploy. And because the entropically-regularized transport map is
differentiable, the whole thing is one extra loss term bolted onto the existing pipeline rather
than a new training procedure; Xu describes it as plug and play. The cost $\mathcal{C}$ they use
compares the *shape* of action trajectories, on the reasoning that a human and a robot doing the
same thing should trace similar curves, and he notes the objective extends to any weak supervision
you can write as a cost — language descriptions being the obvious candidate.

![EgoBridge supervises the alignment of human and robot policy latents with a joint optimal-transport objective, leaving each domain's marginal structure intact. Credit: reconstructed from the guest-lecture recording, Danfei Xu, week 3.](../slides_png/guest02_xu/slide_025.jpg){#fig:egobridge width=88%}

The alignment visibly improves, cross-domain nearest neighbours show matching behavior, and there
is an early instance of the capability they were after: a drawer task in which the human data
covers all quadrants of the workspace but the robot data covers only one, and the policy solves
the region for which no robot data exists.

**EMMA** extends the approach to mobile manipulation, where teleoperated demonstration is both
physically awkward and unintuitive, but where Aria recordings already contain everything needed —
hand poses, actions, a SLAM map, and where the person was standing at each moment. At equal
collection time, fixed-base teleoperation plus mobile human data substantially outperforms mobile
teleoperation, with a clean scaling curve in human data, and stretches to genuinely long-range
tasks: grocery *shopping* rather than grocery bagging.

### What is missing, and the pyramid he wants to flip

Xu closes on open problems, and is franker about the limits of his own program than the talk to
this point would suggest.

First-person video is **not** sensorimotor experience and **not** decision-making context. Tactile
and force signals — the ones people actually use for contact-rich manipulation — are nowhere near
being captured. And context is more than the current frame: the chef in his example turns to the
other counter because of what he prepared minutes ago and what he learned over years of training,
none of which is in the instantaneous observation. Asked directly whether they estimate forces
from video, he answers "We don't. Right now, we don't," and argues the problem is misconceived
anyway — what matters is the total force transmitted to the object, not a fingertip reading. Event
cameras will not help, because contact is occluded by definition.

The proposal he ends on inverts a picture the field repeats often. The standard data pyramid puts
abundant low-quality data at the base and scarce high-quality robot data at the apex, and
fine-tunes down the stack. Xu suggests the dependency runs the other way as well: **a stronger
robot foundation model makes human data more useful.** In collaboration with Physical Intelligence
they found that a better-pretrained robot model gains *more* from human-data fine-tuning, and that
human data aligns better with in-distribution robot data underneath a better VLA — the EgoBridge
effect arriving for free from a stronger backbone. Finally, **EgoVerse**: shared infrastructure
pooling roughly **1,300 hours** of human data from several institutions and companies and growing,
with a browsable portal, cross-validated at three universities on three different robots with a
comparable performance jump in each case.

## Aviral Kumar: the missing middle of the LLM recipe

Kumar works on both large language models and robot learning, and the talk is an argument that the
robotics community has copied the language recipe badly. It is the most structurally critical of
the ten talks, and the criticism is specific.

The recipe as it actually runs for language models has three stages, not two: **pre-train,
mid-train, post-train.** Pre-training learns to generate arbitrary internet text, and the resulting
model is explicitly *not* an optimal policy — it models the distribution of what people write.
Mid-training then instils behaviors that pre-training does not supply and the internet does not
contain: long chains of thought, teaching the model to search across candidate solutions before
committing. Post-training is reinforcement learning from the model's own autonomous rollouts.

Line the robot recipe up against it and three things are wrong.

**Robot pre-training is not pre-training.** A VLA is pre-trained on expert teleoperation data to
solve many tasks *optimally*. In language terms that is instruction fine-tuning — part of
post-training. Kumar says outright that in his opinion robot pre-training "is kind of not quite
correct" as currently practised, and sketches the alternative his lab is working on but has not
published: a VLA should model multiple modes of behavior, the way a language model models all the
text people write, rather than the narrow expert slice that teleoperators happen to demonstrate.

**Robot post-training is not post-training.** It is fine-tuning on more human demonstrations, not
learning from autonomous experience.

**And there is no mid-training at all.** That gap is what the talk is about.

### RaC: recovery and correction as the robot's chain of thought

Expert demonstration shows the optimal solution and nothing else, which Kumar argues is
*suboptimal for generalization* in exactly the way that showing a language model only final
answers would be. Reasoning models do not go straight to the answer; they explore branches and
back out of them. The robot analogue is data in which the policy gets into trouble and gets out
again.

Their protocol trains a base policy on expert demonstrations, deploys it, and collects human
interventions **structured as recovery followed by correction**. In the running example the robot
is inserting a hanger into a t-shirt; when it takes the hanger toward the front of the shirt, the
human takes over, backs the arm away to a state the policy handles well, and then demonstrates the
right move from there.

The insight that makes this work is a claim about volumes, and Kumar states it twice because the
audience pushes on it:

> Recovery is actually easier than correctly solving the task.

The picture is a funnel. Initial states occupy a wide disk; as the task progresses through its
subtasks — grab the hanger, insert one side of the collar, insert the other — the set of good
states narrows. Now suppose the policy has drifted out of the funnel. To *correct* is to reach the
narrow set of states from which the task can still be completed, so any error in imitating the
correction is fatal. To *recover* is to get back to any of the many earlier, wider states, and then
continue. There are simply far more states you can retreat to than states you must hit, so recovery
is the easier behavior to learn, and having learned it the policy can try again. He also offers a
compact model of the resulting error reduction, which he calls the $P$-to-the-$K$ model: if a
subtask succeeds with probability $P$ and the policy can recover on the $1-P$ failures, it gets
repeated attempts, and compounding error over the rollout falls accordingly.

> **Editor's note.** Kumar shows a slide with this model on it and says he does not have time to
> present it. The verbal description above is complete enough to reconstruct the argument's shape,
> but the exact expression on the slide could not be read from the recording — it is small, and
> the speaker's video tile overlaps that corner of the frame.
> `[UNCLEAR: guest lecture 3, ~14:30 — the closed form of the "P to the K" recovery model.]`

The consequence he draws is a genuine surprise. Because the policy retries, you get a robot
analogue of **test-time scaling**, but in low-level action space rather than token space. Their
plot deliberately mirrors the one from OpenAI's o1 announcement: where that had chain-of-thought
length on the $x$-axis, theirs has **the number of recoveries the policy performs within a
rollout**, and success rate rises with it along a linear fit.

The efficiency numbers are the argument's payload. Using a modest flow-matching transformer
policy, RaC reached a success rate comparable to **Aloha Unleashed's** result on shirt-hanging from
**5 hours** of collection, against Aloha Unleashed's **89 hours** of pure expert data — about an
order of magnitude better — and beat a **4-billion-parameter ByteDance VLA** that had both more
pre-training and more data. Data-efficient and parameter-efficient at once, which is what
reasoning bought in language.

![Three policies on the same long-horizon task. RaC retries and corrects until it succeeds; HG-DAgger makes corrective attempts that do not generalize; behavior cloning gets stuck. Credit: reconstructed from the guest-lecture recording, Aviral Kumar, week 4.](../slides_png/guest03_kumar/slide_007.jpg){#fig:rac width=88%}

The comparison that clarifies what is new is with **HG-DAgger**, which also collects human
interventions. Kumar is precise about the difference: HG-DAgger's intervention solves the task
*from wherever the policy currently is*, with no backtracking, and the literature never specifies a
concrete protocol for how the human should intervene. Without the recovery step the policy must
learn to hit the narrow set, which is the hard problem. In the three-way video, RaC persists and
succeeds, HG-DAgger makes corrective attempts that fail to generalize, and plain behavior cloning
gets stuck.

### Policy-agnostic RL: doing the optimization on actions

The second half addresses post-training. The obstacle is that reinforcement learning machinery is
stable mainly for small Gaussian policies, and modern robot policies are not that. Improving a
policy against a $Q$-function requires the gradient of the policy's output with respect to its own
parameters, and that is awkward or impossible for every class we care about: diffusion policies
would require back-propagating through the whole denoising chain, flow policies likewise, and for
a transformer that samples its action there is no differentiable path at all, leaving only
high-variance REINFORCE-style estimators. Kumar notes that even a year on from this work, methods
for RL on flow and diffusion policies remain fragile on real hardware.

**PA-RL** decomposes policy improvement into two steps and puts all the reinforcement learning on
the *actions*:

1. **Optimize the action particles.** Sample a set of candidate actions from the base policy, keep
   the subset with the highest $Q$-values, and then take gradient steps on those action vectors
   with respect to $Q(s,a)$ — a global filter followed by local ascent, in the space of actions
   rather than parameters.
2. **Distill the optimized actions back into the policy** with an ordinary maximum-likelihood loss
   — which every generative model already supports, because maximum likelihood is what they were
   all trained with in the first place.

Because nothing differentiates the policy, the method is agnostic to policy class, and Kumar
emphasizes the practical finding that mattered: the *same* hyperparameters and design choices
transferred across classes. The headline result is fine-tuning **OpenVLA autonomously on a real
WidowX arm in 40 minutes**, with no demonstrations — to his knowledge the first time a
state-of-the-art VLA had been improved that way on real hardware — with matching results for
diffusion policies. He is careful to date it: the work is a year old, the robot was poor by current
standards, and he guesses the same result would take ten minutes today.

## Andrew Wagenmaker: explore in noise space, not action space

Wagenmaker's opening image is learning to iron a shirt. You might watch a video first, but you did
not get it right on the first attempt; you had to lay the shirt out, notice you were ironing
creases in, and adjust. Each prior-data source available to a robot is individually insufficient in
a way the example makes concrete: a shirt's dynamics are genuinely hard to simulate, internet video
is ungrounded — watching a human iron tells you nothing about what torques to send — and human
demonstrations are expensive and still leave distribution shift at deployment.

The obstacle he identifies as fundamental is **exploration**: to learn from experience you must
collect the experience that distinguishes correct behavior from incorrect. If the policy never
once picks up the spray bottle, no amount of rolling it out will teach it to. And conventional
reinforcement-learning exploration — from any state, consider any action — will not find that
behavior on a real robot in a million tries. Humans explore differently: from this state, there are
about three sensible things to do, and I will try one of them.

### DSRL: steering a frozen policy through its noise

The idea that closes the gap is elegant enough to state in one sentence. A diffusion or flow
behavior-cloning policy **is a mapping from Gaussian noise to demonstrator-like actions**.
Therefore, if the policy was trained on a reasonable spread of human demonstrations, then feeding
it different noise draws already produces different *sensible* actions — one toward the spray
bottle, one toward the iron, one toward the shirt. The structured, human-like exploration
Wagenmaker wants is already latent in the BC policy; you just have to explore in the right space.

So move the exploration distribution from action space into **noise space**. On top of the frozen
BC policy, learn a **noise policy** that chooses which noise to feed it and a **noise critic** that
values noise vectors at states. Training is ordinary: fit the value function, train the noise
policy to maximize it, and at each step sample a noise, push it through the BC policy, execute the
resulting action, and record what happened.

Two consequences follow, and the second is the one that makes the method practical beyond its own
results. Exploration is structured and plausible **from the very first episode**, because every
action executed is one the demonstrator might have taken. And because the BC policy is never
differentiated, the approach **sidesteps the standard obstacle to running RL on diffusion
policies** — no back-propagation through the denoising chain, no need to write down a likelihood.
Wagenmaker notes this makes it possible to bring pre-trained BC policies into an RL loop in a way
that "really wasn't possible before".

The results are strong and the timescales are short. On a mushroom-onto-cloth task the BC policy
started below 50% and the method **locked onto the correct behavior after 25 episodes** of online
interaction. Across a range of diffusion policies and VLAs, policies that succeeded less than half
the time reached **90–100% in 30 to 90 minutes** of real-world online training. The contrast video
is the clearest evidence: action-space exploration flails into free space and collects nothing that
bears on the task, while noise-space exploration is making a reasonable attempt every time. And the
result replicated independently — researchers at ByteDance applied it to a bimanual high-precision
task where demonstrations alone plateaued below 50%, and reached close to 100%.

### Is behavior cloning even the right thing to pre-train?

The second half asks a question the first half assumed away. If the point of the pre-trained policy
is to serve as a starting point for reinforcement learning, is fitting the demonstrations the best
way to produce it?

Not necessarily, and the failure is structural. If the demonstrator never picked up the spray
bottle — perhaps you simply have not collected enough demonstrations — then behavior cloning, doing
its job perfectly, yields a policy that does not express that behavior at all, and no amount of
online improvement will recover it. Wagenmaker says this can be shown formally.

The obvious patch is to add exploration noise on top of the BC policy, and it runs into a
**trade-off he shows is fundamental**. Explore more and you express more behaviors but degrade
performance, because you are deviating from behavior you already know to be right — you are
over-exploring in the part of the task the demonstrations cover. Explore less and you keep the
performance but add no expressivity where you need it.

The resolution is to stop treating pre-training as pure imitation and treat it as inference:
**quantify the uncertainty about what the demonstrator would do, and scale exploration in
proportion to it.** Lock in tightly where the demonstrator is predictable; stay broad where they
are not. The evaluation makes the point cleanly, because it is designed to show that the benefit is
invisible until you look for it. On a corn-into-palm task, their pre-trained policy and the BC
policy perform *the same* — both mostly fail. Run online RL on top of each, and BC stalls below
50% while theirs improves to about 75%. The pre-training that looked equivalent was not.

In the Q&A he is asked about π0.6-star, which conditions a single policy on advantages rather than
refining it with a second policy, and he declines to claim superiority: both of his papers predate
it, there is probably a regime for each, and "we don't actually have a very good understanding at
the moment" of which is right when. He also concedes a real precondition of DSRL — it works only
if the BC policy is genuinely steerable through its initial noise, which depends on how it was
trained.

## Cheng Chi: the parts of robotics that are not algorithms

Chi is co-founder and CTO of Sunday Robotics; during his PhD he built **Diffusion Policy** and
**UMI**, the Universal Manipulation Interface. He notes something about the second that frames the
whole talk: UMI was "much more a hardware project than a software project" — its code base is the
same as Diffusion Policy's — and his life since the PhD has been far more about scaling UMI than
about scaling Diffusion Policy.

![Diffusion Policy, from Chi's own PhD: an explicit policy regresses one action, an implicit policy minimizes a learned energy, and a diffusion policy denoises an action over $K$ iterations. Credit: reconstructed from the guest-lecture recording, Cheng Chi, week 6.](../slides_png/guest05_chi/slide_005.jpg){#fig:diffpolicy-chi width=88%}

His framing is that a modern robot system is a policy plus a layer of classical robotics software —
PID at the simple end, SLAM at the complex end — and that "even though people keep saying
end-to-end, there was never actually end-to-end". Those two layers are what universities teach,
and he is candid about why: they are interesting, and they are easy to set homework around, because
you clone a repository and run a script. Hardware and data are at least as decisive and are taught
almost nowhere. That is the gap the talk fills, and it is the one talk of the ten with essentially
no equations in it.

### Hardware, explained through a camera and a package manager

The device Chi uses throughout is an analogy to software dependency management, and it is more
illuminating than it first appears.

Starting a hardware project resembles starting a software one: you rarely begin from scratch, so
you find open-source hardware, or you buy the nearest thing on Amazon and take it apart. A camera
decomposes into a lens, a sensor, an ISP, a PCB and a cable. The software project's
`requirements.txt` corresponds to the **bill of materials** — parts, quantities, where to buy them,
what they cost — and he shows the Diffusion Policy project's BOM as an example. Then `pip install`
corresponds to **procurement**, and this is where the analogy starts doing work, because
procurement is much harder: the parts come from different vendors, and things go out of stock.

UMI went smoothly, he says, because its entire bill of materials was on Amazon. **Retail is a
caching layer** — an "illusion of low latency" produced by keeping physical and virtual shelves
near the customer. Change any component, or order a large quantity, and you exhaust the cache and
must reach past your supplier to your supplier's suppliers. The lens vendor buys glass and
housings; the PCB vendor buys sensors and ISPs; everyone is buying things and assembling them. Chi
prefers **"supply tree"** to supply chain, and points out that the timeline complexity compounds
brutally: if every tier operates on the Amazon model, waiting until it runs out before ordering,
a complex product takes many months. Hence supply-chain management as a full-time job — telling
your suppliers' suppliers what is coming so the whole tree ramps in sync. His summary analogy is
`uv` resolving an entire dependency tree rather than `pip` fetching the first layer.

Why it matters is a decision, not a logistics detail: **the supply chain determines the
buy-versus-build boundary**, and the common mistake he sees in researchers moving into hardware is
trying to build everything themselves when much of it can be bought.

### Making a thousand of something

The second half of the hardware section is about manufacturing the skill-capture glove, derived
from UMI. The photograph is of the thousandth glove; they painted it gold.

Assembly is manual, so it needs a **standard operating procedure** — many pages, divided across
workstations. The problem that shows up immediately is **consistency**: build the same sensor
assembly a hundred times by hand and the readings differ. The fix is a chain of unglamorous steps.
Give every unit an identity, with a printed QR-coded serial number, and record its components in a
database. Then do **calibration and quality assurance together, in software**: plug the glove in,
run it through a prescribed set of motions, record the minimum and maximum range of every joint,
and use the same pass to calibrate the sensors *and* to catch faults — a finger that moves while
the reading does not, or a calibration range far outside what other gloves produce. Reject or
return those. Then pack and ship. The whole stage is **FATP** — final assembly, test and pack —
which is what Foxconn does for Apple, and what people are actually picturing when they say
"factory".

The lesson Chi draws from it is about software, and it is the sharpest general claim in the talk.
Their founding software engineer built a system that tracks every component, who assembled each
glove, when, and how it was calibrated — and carries that provenance **all the way through to the
training data loader**, so a researcher who suspects a particular batch of gloves can exclude their
data with a configuration change. What is instructive is how he found the problem: he ate dinner
and went to the gym with the people assembling the gloves, and saw that the bottleneck was
information scattered across ad-hoc Python scripts. Chi generalizes it:

> Many times there exists a software solution for a hardware problem and vice versa. And often the
> solution and the problem space may not exist in the same domain.

### Data collection is an operation, and operations are about people

Sunday has had three owners of data collection, and the sequence is the argument.

Co-founder Tony recruited the first twenty collectors himself — knocking on doors, posting on
Craigslist. Camilla, who had previously run a mayoral campaign in Honolulu, became head of
operations and scaled from twenty to two hundred, formalizing recruitment, qualification and
shipping while still knowing every collector personally; Chi observes that this is roughly the
ceiling for one person's relationships. Perry, who started as a data labeler on Tesla Autopilot and
grew to lead Tesla's labeling operation, now runs thousands of collectors.

Chi expected this to be a software problem and says plainly that it is not:

> If you don't get the people part right — people don't feel like they're valued, they're
> respected, and they don't clearly understand exactly what you need and exactly what you don't
> want — then actually there's no amount of software, there's no amount of technical work that you
> can fix that hole.

Conversely, with trust and clear communication, "just a Slack channel and then some spreadsheet"
suffices at two hundred people. His evidence that motivated collectors give back is a good story:
their early phone-based tracking was unreliable against blank white walls, and one collector worked
out by trial and error that **sticking sticky notes on the wall** added enough visual features to
stabilize it.

The closing argument is about training. Engineering education is vertically divided — mechanical,
electrical, computer science; the SLAM person, the learning person — but robotics sits at the
intersection of every one of those disciplines, and a problem in one area routinely requires a
solution in another. Sunday hires for breadth, and Chi says the common trait among the people who
have it is not credentials but curiosity: they take things apart.

Three answers from the Q&A are worth keeping. On **wheels versus legs**: their first product rolls,
because a large enough niche of homes is single-storey and a wheeled base is **passively stable** —
cut the power and it neither falls over nor hurts anyone, which he considers hard to guarantee for
a biped "before there's a consensus what does safety even mean for a humanoid in the home". On
**glove design**: simplicity, because in hardware "every complexity you introduce exponentially
grows the probability of that causing a failure"; degrees of freedom and sensor choice came from
engineering intuition, and then roughly **100 to 150 CAD iterations**. On **data quality**:
filtering matters, but aligning what collectors understand with what you actually need matters
more, because if people are gaming the system "there are a million edge cases you wouldn't have
thought of".

## Where this breaks

Reading the five talks together, the disagreements are as informative as the agreements, and they
are real disagreements rather than differences of emphasis.

**On whether simulation earns its place.** Gupta's entire program is making simulation cheap enough
to be worth it, and his evaluation results are the strongest argument in these two chapters that it
is. Xu's program does not use simulation at all. Neither addresses the other.

**On where the next order of magnitude of data comes from.** Xu says wearables on people going
about their lives. Chi's company ships a purpose-built glove to thousands of paid collectors, which
is human data too but is emphatically *not* passively collected. Gupta says the cheapest data is
synthetic. Kumar says the axis is wrong — we should change the *kind* of data before we scale the
amount, because expert-only demonstration is the wrong distribution to pre-train on.

**On what to do with a pre-trained policy.** Kumar and Wagenmaker both fine-tune with reinforcement
learning on a real robot, and both had to invent machinery to do it because standard RL does not
work on modern policy classes — but their solutions are opposites. Kumar leaves the policy alone
and optimizes *actions*, then distils. Wagenmaker leaves the policy alone and optimizes the *noise*
that drives it. That two groups independently concluded the frozen policy should not be
differentiated is the most interesting agreement in the chapter; that they route around it
differently suggests neither answer is settled.

**And on how much of this is a research problem at all.** Chi's talk is a sustained argument that
the binding constraints at the frontier are procurement, manufacturing consistency and the
management of a thousand people — none of which appears in any other talk, and none of which is
taught. His claim is not that the algorithms do not matter. It is that he was taught only the
algorithms, and that this turned out to be a small part of getting a robot to work.

## What this connects to

Gupta's evaluation results are the strongest available answer to the problem Chapter 9 raises and
leaves open — that policy evaluation on real hardware is slow enough to distort the research
process — and his world-model adaptation is Chapter 8's machinery used for sim-to-real rather than
for planning. His reset-based exploration is a direct commentary on the exploration problem of
Chapters 4 and 5.

Xu's talk is the natural sequel to Chapter 3: it accepts imitation learning's framing entirely and
attacks its input. EgoBridge's optimal-transport objective is the only piece of new mathematics in
these two chapters, and @eq:jot's use of $\phi$ for the encoder is the same convention the notation
appendix sets out.

Kumar's talk reorganizes Chapters 3, 5 and 10 into one story: compounding error (Chapter 3) is what
recovery data fixes, reinforcement-learning fine-tuning (Chapter 5) is what PA-RL makes possible on
modern policy classes, and test-time scaling (Chapter 10) turns out to have a low-level action-space
analogue nobody had looked for.

Wagenmaker's DSRL sits exactly on the seam between Chapter 5 and Chapter 6 — it is a policy-gradient
method whose whole design is dictated by the structure of a diffusion model — and his second half is
a caution about Chapter 3 that Chapter 3 does not contain: behavior cloning optimizes for imitation
quality, which is not the same as optimizing for improvability.

Chi's talk connects to Chapter 6, where Diffusion Policy is developed, and to Chapter 11, whose
final section asks how to do research in robot learning. It is also the only place in this book
where the answer involves a bill of materials.

Chapter 13 takes the second five talks, which move from where the data comes from to what should be
built on top of it.

## Further reading

The guest talks name their own sources on the slides, and these are the works the five speakers
pointed at. Where a paper is discussed above, the citation is the one printed on the speaker's
slide.

- **Jain et al., "PolaRiS: Scalable Real-to-Sim Evaluations for Generalist Robot Policies"
  (2025).** The evaluation result behind @fig:gupta-realtosim, and the most direct answer in this
  book to Chapter 9's complaint that real-robot evaluation is too slow to trust.
- **Hu et al., "RaC: Robot Learning for Long-Horizon Tasks by Scaling Recovery and Correction"
  (arXiv, 2025).** The recovery-and-correction paper from Kumar's talk, and the source of
  @fig:rac. Read it for the funnel argument and the recoveries-versus-success-rate plot.
- **Punamiya et al., "Domain Adaptation for Generalizable Imitation from Egocentric Human Data"
  (NeurIPS 2025).** EgoBridge, and the source of @eq:jot and @fig:egobridge.
- **C. Chi et al., "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion".** Developed
  in Chapter 6; listed again here because Chi's talk is partly a retrospective on what building it
  and UMI actually involved.
- **"Universal Manipulation Interface"**, the open-source hand-held gripper behind the data-collection
  argument in Chi's talk and the scaling bets in Chapter 13.
- **Aloha Unleashed**, the bimanual demonstration-scaling result that RaC's 5-hours-against-89-hours
  comparison is measured against.
- **HG-DAgger**, the human-intervention baseline Kumar contrasts recovery-and-correction with, and
  the reason the distinction between recovering and correcting is worth drawing at all.

# Glossary {.unnumbered}

\markboth{Glossary}{Glossary}

Chapter numbers point to where the term is introduced or developed.

## A {.unnumbered}

**Action chunk** (7, 9). A short sequence of future actions predicted from a single observation, executed as a block before the policy is queried again. Produces smoother motion than per-step prediction at the cost of being blind for the chunk's duration.

**Action expert** (9). In the current vision-language-action recipe, a separate module that reads from the frozen language backbone and emits continuous actions by flow matching, emitting into a unified padded action space so that one module serves every embodiment.

**Action-conditioned** (8). Of a predictive model: takes the action as an input, so it can answer what happens *if you do this*. A text-to-video model is not a world model precisely because it is not action-conditioned.

**Action tokenization** (7, 9). Turning continuous actions into discrete tokens a sequence model can emit: normalize per dimension, bin the range, and assign each bin a token identifier. See *quantile normalization*, *vocabulary override*.

**Action-token accuracy** (9). The fraction of action tokens predicted exactly right under teacher forcing. A convergence diagnostic, not a performance measure; the rule of thumb is to reach about 95% before attempting a real rollout.

**Actor** (4, 5). The network that produces actions. Parameterized by $\theta$ throughout this book.

**Actor-critic** (5). Any method combining a policy that acts with a value function that scores, so that the critic supplies a low-variance advantage to the actor's gradient.

**AdaLN-zero** (6). Adaptive layer normalization initialized so the modulation starts as the identity; used in diffusion transformers in place of cross-attention, and what makes diffusion policies scale.

**Advantage function** (5). $A^\pi(s,a) = Q^\pi(s,a) - V^\pi(s)$: how much better an action is than what the policy would typically do in that state. The state-relative baseline that a plain batch mean cannot provide.

**Attention** (7). A soft, differentiable dictionary lookup: each position forms a query, every position advertises a key and a value, and the output is the values blended by how well each key matches. Gives an $O(1)$ path between any two positions at quadratic cost in sequence length.

**Autoencoder** (6). An encoder-decoder pair trained to reconstruct its input through a narrow bottleneck. Compresses, and cannot generate, because its latent is produced deterministically from an input you must already have.

**Autoregressive model** (3, 7). A model that factorizes a joint distribution into a product of conditionals and predicts one element at a time given the prefix.

**Autonomous improvement** (11). A robot improving without human intervention, for instance by having foundation models propose tasks the environment affords and detect whether they succeeded.

## B {.unnumbered}

**Backbone** (11). The pre-trained model a robot policy is built on. The open question is whether it should be a vision-language model, a generative video model, or nothing at all.

**Baseline** (5). A quantity subtracted from the return before it weights a policy gradient. Leaves the expected gradient unchanged and reduces its variance, often by orders of magnitude.

**Behavior cloning** (3). Supervised regression of a policy onto an expert's recorded actions. The simplest imitation-learning algorithm and the foundation of nearly every deployed robot policy.

**Bellman contraction** (4). The property that applying the Bellman update to any two value functions brings them closer by at least a factor $\gamma$, which is why value iteration converges to a unique fixed point. Holds for a table and not for a neural network.

**Bellman expectation equation** (4). $V^\pi(s) = \mathbb{E}[r(s,a) + \gamma V^\pi(s')]$: the value of a state is the immediate reward plus the discounted value of the next state. Reduces an infinite-horizon problem to a one-step recursion.

**Best-of-$N$ selection** (10). Generate several candidate outputs and let a verifier choose. The simplest form of test-time compute scaling.

**Bitter lesson** (7, 9, 11). Sutton's observation that methods which scale with compute eventually beat methods with hand-engineered structure. The organizing argument of the book's second half, and an open bet in robotics, where data is scarce.

**Block-diagonal attention mask** (9). Required when several training examples are packed into one sequence: tokens in one example must not attend to tokens in another.

**Block-wise causal masking** (9). Octo's attention structure: task tokens attend among themselves, observation tokens attend to task tokens and to past observations, and nothing attends to the future.

**Bootstrapping** (4, 5). Using a current estimate of a value in place of an actual future outcome. Buys a usable learning signal after one step instead of a full episode, at the cost of some bias.

**Byte-pair encoding** (7). A tokenizer built by repeatedly merging the most frequent adjacent pair of symbols in a corpus. Yields subwords: short sequences, and nothing out of vocabulary. Reused by FAST on quantized action coefficients.

## C {.unnumbered}

**Calibration** (11). Whether a model's confidence matches its accuracy. Large models are notably poorly calibrated about their own competence, which is what makes *introspection* hard.

**Catastrophic forgetting** (9, 11). Losing previously learned capabilities when fine-tuning on new data. What web-data co-training and knowledge insulation are designed to prevent.

**Causal confusion** (3). When a policy given a rich history latches onto a correlate of the expert's action rather than its cause — a force-sensor spike that accompanies pulling, rather than the visual situation that warranted it. More capacity and more history make it more likely.

**Causal mask** (7). A triangular mask that sets attention scores for future positions to $-\infty$, so each token attends only to itself and its predecessors. The single modification that makes autoregressive generation possible.

**Chain-of-thought prompting** (10). Eliciting reasoning by showing a model worked examples in its prompt. Hurts small models and helps large ones, crossing over around 100 billion parameters.

**Classifier-free guidance** (6). Train one network on both the conditional and unconditional problem, then at sampling time extrapolate along the difference between their predictions to strengthen adherence to the condition.

**Codebook** (6). The finite set of learned vectors a VQ-VAE quantizes to. *Codebook collapse* is the failure in which only a few entries are ever used.

**Co-training** (9). Training one model on several datasets at once. The property Open X-Embodiment's common format was built to enable.

**Compounding error** (3, 8). Small errors moving a system into states it was not trained on, where its errors are larger still. The mechanism behind imitation learning's quadratic cost bound and behind a world model's imagination drift.

**Compute-optimal** (7, 10). The allocation of a fixed compute budget that minimizes loss. For pre-training, roughly 20 tokens per parameter; for inference, an entirely different calculation.

**Configuration space** (2). The set of all configurations a robot can adopt, written $\mathcal{C}$. Its topology depends on the joints — a two-revolute-joint arm's is a torus, not a rectangle.

**Contrastive learning** (7). Training embeddings so that matched pairs score higher than mismatched ones, with negatives supplied by the rest of the batch. The mechanism behind CLIP.

**Critic** (4, 5). A learned value function used to score states or actions. Parameterized by $\phi$ throughout this book. A *privileged critic* is trained with information unavailable at deployment, which is legitimate because the critic is discarded.

**Cross-attention** (7). Attention in which queries come from one sequence and keys and values from another, so one modality or stage can read from a different one.

**Cross-embodiment learning** (9). Training one policy on data from robots with different bodies, and the transfer that makes it worthwhile.

**Cross-entropy method** (4, 8). Iterative sampling for optimization without gradients: sample candidates, keep the best, refit the sampling distribution, repeat. Unimodal, and expensive when run at every control step.

**Curse of dimensionality** (4). The exponential growth of a state or action space with its dimension, which makes tabular methods unusable and forces function approximation.

## D {.unnumbered}

**DAgger** (3). Dataset aggregation: roll out the learned policy, ask the expert what it should have done at the states visited, add those labels to the dataset, retrain. Converges the visited-state distributions and removes imitation learning's extra factor of the horizon.

**Data flywheel** (11). The hoped-for loop in which better models produce more capable robots, more deployments, more data, and better models again. Blocked by the mismatch between expert and autonomous data.

**Data recipe** (11). The mixture and ordering of data sources used to train a policy — web, simulation, human video, real robot data — drawn as a pyramid. Four competing recipes are in use.

**DDIM** (6). A deterministic diffusion sampler that estimates the clean sample and re-noises it directly to an arbitrary lower level, so the step count at inference can be far smaller than at training. The reason diffusion is fast enough for control.

**DDPM** (6). The standard stochastic diffusion sampler: subtract the predicted noise, rescale, and re-inject a little fresh noise at every step.

**DDPG** (4). Deep deterministic policy gradient: learn a network that outputs the action maximizing a learned critic, so acting is one forward pass. Notoriously brittle.

**Degrees of freedom** (2). The number of independent parameters needed to specify a robot's configuration. Countable from the parts with the Chebychev–Grübler–Kutzbach formula.

**Dense reward** (2). A reward giving continuous partial credit, which accelerates learning enormously and is also the kind most vulnerable to being gamed. Contrast *sparse reward*.

**Deterministic policy gradient** (4). The chain-rule gradient that trains an actor by differentiating a critic with respect to its action input.

**Diffusion** (3, 6). A generative model that learns to reverse a fixed noising process, generating by denoising from noise. In robotics the object denoised is an action chunk.

**Diffusion policy** (6). A policy that denoises action sequences conditioned on an observation, trained with DDPM and sampled with DDIM. Handles multimodality well; a specialist.

**Discount factor** (2). $\gamma \in [0,1)$, which shrinks distant rewards so an infinite sum converges and near outcomes count for more. A modelling choice that changes what the optimal policy is.

**Discretization** (3, 4, 7). Replacing a continuous space by bins so that regression becomes classification. Exponential in dimension unless done per dimension, or unless the action space is a location in an image.

**Distribution shift** (3). A mismatch between the data a model was trained on and the data it is evaluated on. In imitation learning it is *caused* by the model, which is what makes it unfixable by more training on the same data.

**Double DQN** (4). Using one network to select the maximizing action and another to evaluate it, which removes the upward bias created by maximizing over noisy estimates.

**Dreamer** (8). A family of latent world-model agents that train an actor and critic entirely on imagined rollouts, backpropagating through differentiable learned dynamics. *DayDreamer* is its application to real robots.

## E {.unnumbered}

**Early fusion** (7, 9). Prepending image tokens to text tokens and letting one pre-trained model attend over the concatenation. Richest cross-modal mixing; risks degrading the language model.

**ELBO** (3, 6). The evidence lower bound: a tractable lower bound on log-likelihood, consisting of a reconstruction term and a divergence to a prior. The training objective of variational autoencoders, and the ancestor of the diffusion objective.

**Elo rating** (10). A relative skill scale. Used in this book for the observation that gaining about 120 Elo requires either doubling a model's size or doubling its test-time search.

**EMA target encoder** (8). A slowly-updated copy of an encoder that a predictor chases, used to prevent representation collapse in joint-embedding architectures.

**Embodiment gap** (11). The mismatch between data collected on one body and the body you will deploy on. Egocentric human video has the most data and the largest gap.

**Embodied chain-of-thought** (10). A policy that generates grounded intermediate reasoning — plan, sub-task, movement, bounding boxes, gripper position — before emitting action tokens, so the actions are conditioned on the reasoning.

**Entropy regularization** (5). Adding a bonus for policy uncertainty, so a policy does not collapse to determinism and lose the support that importance sampling and exploration require.

**Experience replay** (4). Storing transitions and training on random minibatches from the store, which decorrelates batches and reuses expensive interactions many times. Requires off-policy learning.

**Exposure bias** (8). See *compounding error*: a model trained on real inputs and evaluated on its own outputs drifts, because it was never trained on the distribution its own mistakes create.

## F {.unnumbered}

**FAST** (7, 9). An action tokenizer that applies a discrete cosine transform per action dimension, quantizes the coefficients, and compresses them with byte-pair encoding — which is what lets autoregressive policies work above about 5 Hz.

**FiLM** (6, 9). Feature-wise linear modulation: conditioning a network by scaling and shifting its intermediate features with values computed from the condition.

**Fisher information matrix** (5). The second-order object TRPO needs to solve its constrained update, and the reason TRPO costs roughly twenty times an ordinary gradient step.

**FlashAttention** (7). Computing attention in tiles held in fast on-chip memory, so the score matrix is never materialized. Same arithmetic, linear memory.

**Flow matching** (6, 9). Learning the velocity field of a straight path from noise to data, and generating by integrating it. Needs no noise schedule and few integration steps; equivalent to diffusion under a linear schedule.

**Forward kinematics** (2). Where the end-effector is, given the joint angles. Deterministic, cheap, and not injective.

## G {.unnumbered}

**Generalist robot policy** (9). One model controlling many robots, in many environments, on many tasks. Contrast *specialist*.

**Generative model** (6). A learned transformation from a simple distribution you can sample to a complicated data distribution.

**Goal-conditioning** (3, 9). Conditioning a policy on a target state rather than a task identifier, so that one policy can be asked for any goal — supplied as an image or as language. Adopted because task success is not well defined and tasks are continuous.

**Goal relabeling** (3). Taking the final state of any recorded window as the goal it demonstrates reaching, which turns unlabeled play into supervised data.

**GRPO** (10). Group relative policy optimization: PPO with the critic deleted, using the standardized rewards of a group of sampled answers to the same prompt as the advantage. No reward model, no value function, no human labels.

**Guidance scale** (6). The strength with which classifier-free guidance exaggerates the condition's effect, trading diversity for adherence.

## H {.unnumbered}

**Hidden computation** (10). A transformer using intermediate tokens as scratch space, improving its answers even when those tokens carry no semantic content.

**Homogeneous transform** (2). A matrix packing rotation and translation together so that composing motions is matrix multiplication.

**Horizon** (2). How long an episode runs. A finite horizon changes optimal behavior near the deadline; an infinite one requires discounting.

**Human-gated DAgger** (3). Letting the robot run and having a human take over only when it is about to fail, which concentrates expert effort where the policy is weak.

## I {.unnumbered}

**Imagination** (8). Rolling a learned world model forward without touching the environment, so that a policy can be trained or a plan evaluated at no real-world cost.

**Imitation ceiling** (3, 4, 11). A policy trained to copy demonstrations cannot exceed them. The three-node illustration: data containing 1→2 and 2→3 can never teach that 1→3 is better.

**Importance sampling** (5). Estimating an expectation under one distribution from samples of another by reweighting with the density ratio. Requires overlapping support and degrades as the distributions separate.

**In-context learning** (7, 10, 11). Adapting from examples supplied in the input rather than by a gradient step. In robotics, the mechanism behind rapid adaptation from a correction or a single demonstration.

**Introspection** (11). A model knowing when it does not know. Unsolved, becoming harder with scale, and a prerequisite for the confidence-graded reasoning architecture, for automated intervention, and for safe deployment.

**Inverse dynamics model** (8). A head that reads a predicted future — typically video — and outputs the action that would produce it. What lets a frozen video backbone be used for control.

**Inverse kinematics** (2). The joint angles that achieve a desired end-effector pose. Generally set-valued, often without closed form.

## J {.unnumbered}

**Jacobian** (2). The matrix of partial derivatives relating joint velocities to end-effector velocities. Its transpose is used for inverse kinematics because it always exists, including where the inverse does not.

**JEPA** (8). Joint-embedding predictive architecture: predict the next observation's embedding rather than its pixels, with no decoder. Cheap, and vulnerable to *representation collapse*.

## K {.unnumbered}

**Knowledge insulation** (9). Applying a stop gradient between an action module and a pre-trained backbone, so the action task cannot erode the backbone's semantic capabilities.

**KL divergence** (3, 5, 6, 10). A measure of how far one distribution is from another. Used to keep a prior near a posterior, a new policy near an old one, and a reasoning model near its pre-trained reference.

## L {.unnumbered}

**Late fusion** (7). Adding a modality through new cross-attention blocks inserted into a frozen model, typically behind a gate initialized to zero so the augmented model starts out identical to the original.

**Latent-variable model** (3, 6). A model whose output depends on a sampled latent as well as its input, so that a simple output distribution can represent a complex one. Needs the latent trained into meaning.

**Learned simulator** (8). A world model, contrasted with a physics engine: learned from data rather than hand-built, so bounded by coverage rather than by the modeller's foresight.

**Lifelong learning** (11). A robot improving over its whole operational life by accumulating experience, against the dominant paradigm of freezing weights at deployment.

**Log-derivative trick** (5). The identity $\nabla p = p\,\nabla \log p$, which converts the gradient of a density into an expectation that can be estimated by sampling. The step that makes policy gradients possible.

## M {.unnumbered}

**Markov property** (2). The claim that the current state contains everything relevant to what happens next, so the past can be ignored. A statement about the state, not about the world, and usually false for a single observation.

**Markov decision process** (2). The tuple $\langle\mathcal{S},\mathcal{A},\mathcal{P},\mathcal{R}\rangle$: states, actions, transitions, rewards. The smallest description that supports the question "what should I do?", and indifferent to the body.

**Mode averaging** (3). A squared-error policy outputting the mean of several valid actions, which is often invalid — going left of a tree and right of a tree averaging to a collision.

**Model predictive control** (8). Planning a short horizon, executing the first action, and replanning. What visual foresight and latent world models do with a learned model in place of a known one.

**Monte Carlo tree search** (10). Search that estimates action values by sampled rollouts. The test-time compute that takes a Go policy network from below to well above human play.

**Multimodal behavior** (3). Several distinct actions all being correct. The reason a policy must be a distribution rather than a function.

## N {.unnumbered}

**Native multimodal model** (7, 11). One model trained on all modalities jointly from scratch, interleaved in any order. Most flexible, most expensive, and blocked in robotics by the absence of cross-modal paired data.

**Noise prediction** (6). Training a diffusion model to output the noise added rather than the previous sample, which converts an intractable inversion into ordinary Gaussian regression.

**Null-space motion** (2). Motion that changes the configuration without changing the end-effector pose, available whenever a robot is redundant for its task. What lets an arm reach around an obstacle while holding something still.

## O {.unnumbered}

**Off-policy** (4, 5). Learning about one policy from data generated by another. What makes replay buffers, months-old data, and human demonstrations usable, and what makes soft actor-critic the most sample-efficient method here.

**Offline reinforcement learning** (5, 11). Learning from a fixed dataset with no new interaction, and the setting in which trajectory stitching can break the imitation ceiling without dangerous exploration.

**On-manifold and off-manifold states** (11). States that resemble those an expert visits, and states that do not. Autonomous rollouts produce the latter, which is both their value and the reason they are hard to co-train with expert data.

**Open X-Embodiment** (9). A pooled dataset of more than a million real robot episodes across 22 embodiments from 34 laboratories, converted to a common format so that co-training is possible. Most of the second half of this book is trained on it.

**Overestimation bias** (4). The upward bias created by maximizing over noisy value estimates, since the maximum selects for whichever estimate is too high.

## P {.unnumbered}

**PID control** (2). Proportional-integral-derivative feedback: a spring pulling toward the target, an accumulator defeating steady disturbances, and a damper preventing overshoot. Needs a sufficiently fast control rate to work, which puts a floor under policy inference speed.

**Play data** (3). Unstructured teleoperation with no assigned task, cheap and reset-free, made usable by goal relabeling.

**Policy** (1, 2). The function that decides what to do: $\pi_\theta(a\mid s)$. Everything in this book is a way of obtaining or improving one.

**Policy gradient theorem** (5). $\nabla_\theta J = \mathbb{E}[\nabla_\theta\log p_\theta(\tau)R(\tau)]$, in which the unknown dynamics cancel, leaving an estimator computable from the policy's own log-probabilities and observed rewards.

**Policy iteration** (4). Alternating full policy evaluation with a greedy improvement step. Converges monotonically, and needs a model.

**Posterior collapse** (6). A decoder strong enough to model the data on its own ignoring the latent entirely, which returns a latent-variable policy to being deterministic without any visible symptom.

**PPO** (5, 10). Proximal policy optimization: clip the probability ratio so that a step which moves the policy too far stops helping. First-order, cheap, and the backbone of reinforcement learning from human feedback and of GRPO.

**Prior mismatch** (6). A latent sampled from the prior falling in a gap between the regions the encoder actually used, so the decoder is asked about a code it never trained on. For a policy, the output is an action nobody has reason to trust.

**Privileged information** (3, 5). Information available during data collection or training but not at deployment — a teleoperator's view around an occlusion, a simulator's true object pose. Useful for a critic, damaging for a policy's training targets.

## Q {.unnumbered}

**Q-function** (4). $Q^\pi(s,a)$: the return from committing to an action now and behaving according to $\pi$ afterwards. Absorbs the transition expectation, so acting needs no dynamics model.

**Q-learning** (4). Replacing the transition expectation with a single sampled experience, which removes the model from training as well as from acting. Off-policy, because its target maximizes over next actions.

**Quantile normalization** (7). Clipping each action dimension to its 1st and 99th percentile before mapping to a fixed range, so outliers do not waste bins and scales are comparable across robots.

**Quintic time scaling** (2). Pacing a motion along its path with a fifth-order polynomial, the lowest order that can match position, velocity and acceleration at both ends. Eliminates the impulsive acceleration of linear interpolation at the cost of a higher peak velocity.

## R {.unnumbered}

**Rapid adaptation** (11). Recovering from a failure at deployment without retraining, using a language correction, a demonstration, or a cross-embodiment demonstration placed in context.

**Readout token** (9). A placeholder token carrying no input information, which attends to everything and summarizes it for an output head.

**Rectified flow** (6). Retraining a flow model on coupled noise-data pairs generated by itself, so that crossing paths untangle and fewer integration steps are needed.

**Recurrent state-space model** (8). A world model whose latent splits into a deterministic path that is never sampled and a stochastic path that carries uncertainty, with a prior trained by a KL term to match an observation-conditioned posterior. The fix for imagination drift.

**Redundancy** (2). Having more degrees of freedom than the task space requires. The source of null-space motion and of inverse kinematics being set-valued.

**REINFORCE** (5). The original policy-gradient algorithm: the behavior-cloning gradient weighted by each trajectory's return. Correct and very noisy.

**Reparameterization trick** (5, 6). Sampling a fixed standard noise and transforming it with the learned parameters, so gradients flow through the transformation rather than through a log-probability. Dramatically lower variance than the score-function estimator.

**Representation collapse** (8). An encoder mapping every input to the same vector, which makes a joint-embedding objective trivially zero. Prevented by an EMA target encoder, a frozen encoder, or a distributional regularizer.

**Reasoning dropout** (10). Training a policy on reasoning and actions jointly while randomly dropping the reasoning, so one model can run with or without it at test time.

**Reasoning pre-training** (10). Fine-tuning to predict only reasoning, then fine-tuning that model to predict only actions, so the representations transfer and the inference cost does not.

**Reward-to-go** (5). Weighting an action by the reward that followed it rather than by the whole episode's return. Unbiased, lower variance.

## S {.unnumbered}

**SARSA** (4). Q-learning's on-policy counterpart, whose target uses the action actually taken next. Learns the value of the policy you are actually running, exploration and mistakes included, which produces safer behavior near cliffs.

**Scaling laws** (7). Empirical relations between compute, model size and data that identify a compute-optimal allocation and allow a large run's loss to be predicted from small ones. Established for text; assumed for robots.

**Score-function estimator** (6). Differentiating the log-probability of a sample rather than the sample itself. High variance, because it learns that an outcome was good without learning which way to move.

**Sequence packing** (9). Concatenating variable-length examples into one long sequence to avoid padding waste. Requires a block-diagonal mask and per-example positional-encoding resets.

**Shuffle buffer** (9). A window of streamed examples from which batches are drawn. Randomness is proportional to buffer size, and a buffer too small produces correlated batches and measurably worse generalization.

**SIMPLER** (9). Evaluating real-world-trained policies in simulation, by matching control dynamics through system identification and appearance through green screening and texture transfer. Gives correlated rankings, not absolute success rates.

**Soft actor-critic** (5). A fully off-policy actor-critic with entropy inside the critic's target, so the value learned is the value of behaving stochastically. The most sample-efficient method in this book and the usual choice on hardware.

**Sparse reward** (2). A reward that fires only on success. What you actually care about, and nearly useless as a training signal because an unsuccessful policy receives the same zero for every attempt.

**Spatial discretization** (4). Identifying the action space with the pixels of a top-down view, so a fully convolutional network can output a dense map of action values and maximizing becomes maximizing over an image.

**Specialist policy** (9). A policy trained for one task on one embodiment. Usually better at that task than a generalist, and requiring retraining for anything else.

**Stop gradient** (6, 9). An operation that is the identity forward and zero backward, used to allocate which parameters a loss term may move. The mechanism behind the straight-through estimator and behind knowledge insulation.

**Straight-through estimator** (6). Passing a gradient around a non-differentiable operation as if it were the identity. What makes vector quantization trainable.

**System identification** (9). Fitting a simulator's low-level dynamics to a small number of real samples, so that the same open-loop action sequence produces the same motion in both. A prerequisite for real-to-sim evaluation.

## T {.unnumbered}

**Target network** (4, 5). A frozen or slowly-updated copy of a value network used to compute regression targets, which turns an unstable moving-target problem into ordinary supervised regression. Written with an overbar in this book.

**Task space** (2). The space in which an objective naturally lives, independent of the robot's body. Comparing its dimension with the robot's degrees of freedom tells you whether the robot is redundant.

**Teacher forcing** (7). Training a sequence model on the ground-truth prefix rather than its own predictions, which allows all positions' losses to be computed in one pass.

**Temporal ensembling** (7). Re-querying a chunked policy every step and combining the overlapping predictions with exponentially decaying weights, which recovers reactivity without giving up smoothness.

**Temporal-difference target** (4). A one-sample estimate of a Bellman right-hand side: the observed reward plus the discounted current estimate of the next state's value.

**Test-time compute scaling** (10). Spending more computation at inference — more reasoning tokens, more samples, a larger fallback model, or a human — to get better answers from the same weights. Amplifies what a model already knows and cannot extend its distribution.

**Thinking tokens** (10). Content-free tokens inserted to buy computation. Well supported in language models, and worse than no reasoning at all in the robot-policy ablation.

**Trajectory stitching** (11). Recombining fragments of suboptimal trajectories into a better one than any that was demonstrated. What offline reinforcement learning does and imitation cannot.

**Trust region** (5). A bound on how far a policy update may move the policy's behavior distribution. Enforced as a constraint by TRPO and approximated by clipping in PPO.

## V {.unnumbered}

**Value function** (4). $V^\pi(s)$: the expected return from a state under a policy. Turns a whole-trajectory objective into a local one.

**Value iteration** (4). Repeatedly applying the Bellman optimality update until values stop changing. Converges by contraction; needs a model and a small discrete state space.

**Verifier** (10). Anything that can score an output as correct or not — a maths grader, a unit test, an intersection-over-union threshold, or a foundation model. GRPO is agnostic to which, which is what makes it portable, and most robot tasks do not have one.

**Vision transformer** (7). An image split into patches, each linearly projected and given a positional encoding, so that a transformer consumes it exactly as it consumes text.

**Vision-language-action model** (7, 9). A vision-language model fine-tuned to emit actions, typically by overwriting rarely-used vocabulary entries with action tokens or by attaching a flow-matching action expert.

**Visual matching** (9). Reducing the appearance gap between simulation and reality cheaply — compositing simulated assets onto real backgrounds and projecting real textures onto simulated objects — instead of pursuing photorealism.

**Vocabulary override** (7, 9). Replacing a language model's least-frequent tokens with action tokens, so actions become emittable without changing the architecture.

**VQ-VAE** (6). An autoencoder whose latent is quantized to a finite codebook, which removes prior mismatch and turns a latent into a sequence of integers a sequence model can consume.

## W {.unnumbered}

**Whole-body control** (11). One controller handling navigation and manipulation together, in place of today's hard handoff between a classical navigation stack and a learned manipulation policy.

**World model** (8). A learned, action-conditioned model of consequences, $p(s_{t+1}\mid s_t, a_t, h_t)$. The object that lets an agent evaluate actions it has not taken.

**World action model** (8). A model that jointly generates future video and the actions producing it, so that no action labels are needed at internet scale — at the cost of actions being an output, which forecloses planning.

**Workspace** (2). The set of points in the world an end-effector can reach. Lives in the world; the configuration space lives in the joints.

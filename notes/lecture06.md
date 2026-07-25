# Lecture 6 — Generative Models (raw notes)

- Video: <https://www.youtube.com/watch?v=qd6Ldsuu46I> (51 min)
- Transcript: `transcripts/06_generative.txt` (7,437 w) · Slides: `slides_png/lecture06/`
  (37 frames) · OCR `slides/lecture06.txt`
- Speaker: Oier Mees. Assigned (wk6): Janner & Du et al. 2022 (Planning with Diffusion);
  Florence et al. 2021 (Implicit BC); Wagenmaker et al. 2025 (Steering Diffusion Policy).
  Guest: **Cheng Chi** (Diffusion Policy & UMI author — the case study is his).

Three families, each answering a different question about representing complex
distributions: **VAEs** (encode), **diffusion** (sample by denoising), **flow models**
(transport). Maps to Ch.6. Equations verified against slides 19–36.

Motivation (slides 2–5): obs→action is a **distribution**, not a function (stochasticity +
expert inconsistency); MSE averages modes. **A generative model is a learned transformation
from a simple distribution $p(z)$ (e.g. a Gaussian) to the data distribution
$p_{\text{data}}(x)$** — for robotics, $p_\theta(x)\to\pi_\theta(a_t\mid s_t)$.

---

## Autoencoders → VAE (slides 6–13)
**Autoencoder**: encoder $z=f_\phi(x)$ compresses to a latent, decoder $x'=g_\theta(z)$
reconstructs; loss $\mathcal{L}=\|x - g_\theta(f_\phi(x))\|^2$. Self-supervised; the
bottleneck forces useful features. **Limits**: latent has no structure; bottleneck size is
the only regularizer; $z$ is deterministic → **can't sample new data**.

**VAE** (slide 9): encode to a *distribution* — encoder outputs $(\mu,\sigma)$ of a
Gaussian, sample $z$, and regularize the posterior toward a prior $p(z)=\mathcal{N}(0,I)$.
Maximize the log-likelihood via the **ELBO**:
$$\log p_\theta(x) \ge \underbrace{-\,\mathrm{KL}\big(q_\phi(z\mid x)\,\|\,p(z)\big)}_{\text{regularization}} + \underbrace{\mathbb{E}_{q_\phi(z\mid x)}[\log p_\theta(x\mid z)]}_{\text{reconstruction}}$$
Now generative: at test time sample $z\sim p(z)$, decode (no encoder needed).

**Reparameterization trick** (slides 10–11): sampling is non-differentiable. Rewrite
$$z = \mu_\phi(x) + \sigma_\phi(x)\odot\epsilon, \qquad \epsilon\sim\mathcal{N}(0,I)\ (\text{not learned})$$
so randomness is external and gradients flow to $\mu,\sigma$. Two ways to handle the
$\phi$-dependent expectation: **(1) score-function estimator = REINFORCE** —
$\nabla_\phi L=\mathbb{E}_{q_\phi}[f(z)\nabla_\phi\log q_\phi(z\mid x)]$, gradient acts on
$\log q$ only → **high variance** (the optimizer knows if a sample was good but not how to
shift $\mu,\sigma$). **(2) reparameterization** — $\nabla_\phi L=\mathbb{E}_{\epsilon}
[\nabla_\phi f(\mu_\phi+\sigma_\phi\odot\epsilon)]$, gradient acts on $f$ directly → **low
variance** (the decoder's gradient tells the encoder which way to move $z$).

**VAE failure modes** (slide 13): **posterior collapse** (a powerful decoder models $p(x)$
directly, ignoring $z$ → back to deterministic); **prior mismatch** (a test $z$ sampled
between two trained modes lands where the decoder never trained → hallucination — dangerous
for robots, e.g. unsafe actions).

## VQ-VAE (slides 14–18)
Replace the continuous Gaussian latent with a **discrete codebook** $C=\{e_1,\dots,e_K\}$;
force the encoder to *commit* to a code by nearest-neighbor lookup:
$$z_q(x) = e_k, \quad k = \arg\min_j \|z_e(x) - e_j\|_2$$
$\arg\min$ is **non-differentiable** (piecewise constant → zero gradient). Fix with the
**straight-through estimator**: copy the decoder-input gradient straight to the encoder
output, bypassing the argmin, via a stop-gradient identity:
$$z_q = z_e + \mathrm{sg}[z_q - z_e]$$
($\mathrm{sg}$ = identity forward, zero gradient backward). **Full loss**:
$$\mathcal{L} = \underbrace{\|x - D(z_q)\|_2}_{\text{reconstruction}} + \underbrace{\|\mathrm{sg}(z_e) - e_k\|_2^2}_{\text{codebook}} + \underbrace{\beta\|z_e - \mathrm{sg}(e_k)\|_2^2}_{\text{commitment}}$$
(reconstruction trains encoder+decoder via STE; codebook moves $e_k$ toward encoder
outputs; commitment keeps $z_e$ near its chosen code). **Generation is two-stage**: after
training, encode the dataset to code-index sequences, then learn a **categorical prior**
over codes $p(k_1,\dots,k_n)=\prod_i p(k_i\mid k_1,\dots,k_{i-1})$ (e.g. an autoregressive
transformer); at inference, sample indices, look up vectors, decode. Paper: van den Oord,
Vinyals et al. 2017.

**Limits**: **codebook collapse** (few codes used → **FSQ**, finite scalar quantization,
as a fix); must fix $K$ in advance; MSE reconstruction still mean-seeks (blurry). **Uses in
robotics**: tokenizing images/video (GAIA, Cosmos), latent-action learning (LAPA, Genie),
latent plans from play (Mees), discretizing continuous actions for VLAs.

## Diffusion (slides 19–27)
"Model the full continuous distribution over $x$, no bottleneck." Two processes:
**Forward** (add noise, $\beta_i$ = noise schedule):
$$x_{i+1} = \underbrace{\sqrt{1-\beta_{i+1}}\,x_i}_{\text{signal decay}} + \underbrace{\sqrt{\beta_{i+1}}\,\epsilon_i}_{\text{noise}}, \qquad \epsilon_i\sim\mathcal{N}(0,I)$$
**Backward**: $p(x_{i-1}\mid x_i)$ is intractable, so **predict the added noise** instead of
the previous image — an easy Gaussian regression target: $x_{i-1}\approx x_i -
\epsilon_\theta(x_i,i)$.

**Objective** (slide 22): the VAE ELBO extended to $T$ steps ($q$ fixed):
$$\log p_\theta(x_0) \ge -D_{KL}(q(x_T\mid x_0)\|p(x_T)) + \sum_{i=2}^T -D_{KL}\big(q(x_{i-1}\mid x_i,x_0)\|p_\theta(x_{i-1}\mid x_i)\big) + \log p_\theta(x_0\mid x_1)$$
Because both are Gaussians of equal variance, each KL reduces to an L2 between means,
giving the **simple loss** (Ho et al. 2020, DDPM):
$$\mathcal{L}_{\text{simple}} = \mathbb{E}_{i\sim U(1,T),\,\epsilon\sim\mathcal{N}(0,I)}\big[\|\epsilon - \epsilon_\theta(x_i,i)\|^2\big]$$
**Efficient training** (slide 23): avoid iterating the forward process. With $\alpha_i =
1-\beta_i$ and $\bar\alpha_i=\prod_{j=1}^i\alpha_j$, the sum-of-Gaussians collapses to let
you "teleport" from $x_0$ to any $x_i$ in one step ($O(1)$):
$$x_i = \sqrt{\bar\alpha_i}\,x_0 + \sqrt{1-\bar\alpha_i}\,\bar\epsilon$$
**DDPM sampling** (slide 24): from $x_T\sim\mathcal{N}(0,I)$, for $i=T\dots1$:
$$x_{i-1} = \frac{1}{\sqrt{\alpha_i}}\Big(x_i - \frac{1-\alpha_i}{\sqrt{1-\bar\alpha_i}}\epsilon_\theta(x_i,i)\Big) + \sigma_i z, \qquad z\sim\mathcal{N}(0,I)\ (i>1),\ \sigma_i=\sqrt{\beta_i}$$
The re-injected noise keeps diversity (pure determinism collapses samples to the mean).
DDPM = discrete SDE; denoising = a score step $\nabla\log p$ + Langevin noise. **Slow**
(~1000 steps) → bad for real-time control.

**DDIM** (slide 25, Song et al. 2020): deterministic, fewer steps. Define a subset
$\tau=\{t_1,\dots,t_K\}$ (~20 not 1000). Estimate the clean image (inverse teleport), then
re-noise deterministically (**no noise term**):
$$\hat x_0 = \frac{x_i - \sqrt{1-\bar\alpha_i}\,\epsilon_\theta(x_i,i)}{\sqrt{\bar\alpha_i}}, \qquad x_{i-1} = \sqrt{\bar\alpha_{i-1}}\,\hat x_0 + \sqrt{1-\bar\alpha_{i-1}}\,\epsilon_\theta(x_i,i)$$
Decouples train/inference step counts; discretizes the probability-flow ODE; same
marginals as DDPM but non-Markovian.

**Conditioning** (slides 26–27): everything so far is unconditional. Pass a condition $c$
to the noise predictor $\epsilon_\theta(x_t,t,c)$ — but the model may ignore it.
**Classifier-Free Guidance** (Ho & Salimans 2022): randomly drop $c$ during training (train
conditional + unconditional in one net), then blend at inference:
$$\hat\epsilon = \epsilon_\theta(x_t,t,\emptyset) + w\big(\epsilon_\theta(x_t,t,c) - \epsilon_\theta(x_t,t,\emptyset)\big)$$
$w$ = guidance scale (higher → sharper/more prompt-consistent, less diverse).

## Diffusion Policy (slides 28–30)
**Cheng Chi et al. 2023** (today's guest): **denoise robot action sequences instead of
images.** DDPM training, DDIM inference, observations injected into the noise predictor (no
future-state prediction). With $O_t$ = observation, $A_t$ = action sequence:
$$\mathcal{L} = \mathrm{MSE}\big(\epsilon^k,\ \epsilon_\theta(O_t,\ A_t^0 + \epsilon^k,\ k)\big), \qquad A_t^{k-1} = \alpha\big(A_t^k - \gamma\,\epsilon_\theta(O_t,A_t^k,k) + \mathcal{N}(0,\sigma^2 I)\big)$$
$O_t$ computed **once** before $K$ denoising steps (efficiency); noise predictor is a **1D
temporal U-Net** with $O_t$ injected via **FiLM** (feature-wise linear modulation:
$a\cdot x + b$), plus a transformer variant using cross-attention. Handles multimodality
well; but **specialist** (great single-task, hard to scale to multitask; transformer
variant brittle). Scaling follow-up: **DiT-Block Policy** (Dasari, Mees et al., ICRA 2025) —
replace cross-attention with **AdaLN-zero** (adaptive layer-norm), scales with model/data,
stable, long-horizon bimanual dexterous tasks (1500+ steps, sushi cutting). Also **Octo**
(800k trajectories, readout tokens + diffusion head — see Ch.9).

## Flow matching (slides 31–35)
"Why destroy data with a noise schedule — draw a **straight line** from noise to data."
Learn a **velocity field** $v_\theta(x_t,t)$ transporting $\epsilon\sim\mathcal{N}(0,I)$ to
$x_0\sim p(x_0)$ (Lipman et al. 2023):
$$x_t = (1-t)\epsilon + t\,x_0, \quad \epsilon\sim\mathcal{N}(0,I),\ t\in[0,1]$$
$$\text{Training: } \mathcal{L} = \mathbb{E}_{t,x_0,\epsilon}\big[\|v_\theta(x_t,t) - (x_0-\epsilon)\|^2\big], \qquad \text{Inference (Euler ODE): } x_{t+\Delta t} = x_t + v_\theta(x_t,t)\Delta t$$
Ground-truth velocity $x_0-\epsilon$ is constant in $t$ (no schedule). **Relationship**:
diffusion predicts noise $\mathbb{E}[\|\epsilon-\epsilon_\theta(x_t,t)\|^2]$; flow matching
predicts velocity; **equivalent for a linear schedule** (related by reparameterization).
Straight paths → fewer integration steps → now the go-to in image + robot generation.

**Rectified flow** (slides 32–34): randomly paired noise/data give straight lines that
*cross*, forcing the learned field to curve (slow). Fix: train once, generate coupled
(noise, data) pairs *with its own flow*, retrain on those → trajectories untangle, paths
straighten, fewer steps.

**π₀** (slide 35, Physical Intelligence 2024): first flow-matching VLA — fine-tune a VLM to
output actions via flow matching (now the default for VLAs). Detail: sample flow-time from
a **shifted Beta distribution** to focus on the noisier, harder steps. (More in Ch.9.)

## Conclusion (slide 36)
- **Latent variable**: AE (compress) → VAE (reparameterization) → VQ-VAE (codebook).
- **Diffusion**: DDPM (stochastic SDE) → DDIM (deterministic, fewer steps) → CFG (steer).
- **Flow**: flow matching (velocity field) → rectified flow (straighten).
- **Unifying**: with a linear schedule, Diffusion (DDPM) ↔ DDIM ↔ Flow Matching — same ODE,
  flow matching just uses a simpler Euler solver.

Robotics takeaway: behavior is multimodal; MSE/deterministic policies fail; VAE →
diffusion → flow matching are the tools behind today's best robot policies.

## Definitions for glossary
Generative model; latent variable; autoencoder; VAE; ELBO; reparameterization trick; score-
function estimator; posterior collapse; prior mismatch; VQ-VAE; codebook; nearest-neighbor
quantization; straight-through estimator; stop-gradient; codebook/commitment loss; codebook
collapse; FSQ; diffusion; forward/backward process; noise schedule $\beta$; noise
prediction; DDPM; $\bar\alpha$ / teleporting; DDIM; probability-flow ODE; classifier(-free)
guidance; guidance scale; diffusion policy; FiLM; AdaLN-zero / DiT; flow matching; velocity
field; rectified flow; π₀.

## Papers named
van den Oord & Vinyals 2017 (VQ-VAE); Ho et al. 2020 (DDPM); Song et al. 2020 (DDIM); Ho &
Salimans 2022 (CFG); **Cheng Chi et al. 2023 (Diffusion Policy)**; Dasari, Mees et al. ICRA
2025 (DiT-Block Policy); Lipman et al. 2023 (Flow Matching); Physical Intelligence 2024
(π₀). Applications: GAIA, Cosmos, LAPA, Genie, Octo.

## Figures worth reproducing
- `slide_007.jpg`/`slide_009.jpg` — AE vs VAE; ELBO.
- `slide_011.jpg` — score-function vs reparameterization (variance).
- `slide_015.jpg`/`slide_016.jpg` — VQ-VAE quantization, STE, full loss.
- `slide_018.jpg` — AE/VAE/VQ-VAE latent-space comparison.
- `slide_020.jpg`–`slide_025.jpg` — diffusion forward/backward/objective/DDPM/DDIM.
- `slide_027.jpg` — classifier-free guidance.
- `slide_028.jpg`/`slide_029.jpg` — diffusion policy (loss + U-Net/FiLM/transformer).
- `slide_031.jpg` — flow matching (velocity field, straight line).
- `slide_036.jpg` — the unifying DDPM↔DDIM↔flow-matching diagram.

## Student Q&A
Questions deferred to end/paper discussion; in-lecture prompts are rhetorical. The
reparameterization callback to Lecture 5 ("this appears again") is a good cross-reference.

## [UNCLEAR] / caveats
- Diffusion notation uses step index $i$ (forward) and $k$/$t$ elsewhere; reconcile a single
  step symbol in Ch.6 (notation pass).
- FSQ mentioned but not detailed ("no time"); mark as pointer, not covered.

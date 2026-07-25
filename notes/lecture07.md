# Lecture 7 — Sequence Modeling & Transformers (raw notes)

- Video: <https://www.youtube.com/watch?v=imSTfMJjp7M> (55.1 min)
- Transcript: `transcripts/07_sequence_modeling.txt` (8,104 w) · Slides:
  `slides_png/lecture07/` (40 frames) · OCR `slides/lecture07.txt`
- Speaker: Oier Mees. Assigned (wk7): Chen et al. 2021 (Decision Transformer); **Zhao et
  al. 2023** (ALOHA/ACT); Radosavovic et al. 2024 (Humanoid Locomotion as Next-Token
  Prediction). Guest: **Ted Xiao** (Prometheus, ex-Google).

The bridge from robot-specific methods to the foundation-model era. Arc: reactive-policy
limits → autoregressive/RNN → **transformers** (attention) → **LLMs** (scaling) → **VLMs**
(fusion) → **robotics as multimodal sequence modeling** (action tokenization, chunking,
FAST). Maps to Ch.7. The Bitter Lesson is the through-line.

Motivation (slide 2): reactive $\pi(a\mid o_t)$ fails on **memory** (a POMDP — one snapshot
can't tell how pedestrians move / what I did 10 s ago) and **action smoothness** (single-
step → jerky). Fix: model the sequence $\tau=(o_0,a_0,o_1,a_1,\dots)$.

---

## Autoregressive models & RNNs (slides 4–5)
Chain rule: any joint factors into conditionals,
$$p_\theta(x) = \prod_{t=1}^T p_\theta(x_t\mid x_{1:t-1})$$
**RNNs** (SOTA to 2016): hidden state $h_t=f(h_{t-1},x_t)$ summarizes history; handle
variable length. Three failure modes: **long-range dependencies** (gradients through all
intermediate steps explode/vanish; LSTMs help, don't solve); **hard to parallelize**
(recurrence); **fixed-size bottleneck** (all history crushed into $h$). Path length to the
first token: $O(n)$.

## Transformers: attention (slides 6–10)
Replace recurrence with **attention** → **$O(1)$ equal-access** path between any two
positions (Vaswani et al. 2017). For each token, compute relevance as query·key, softmax,
weighted sum of values:
$$\mathrm{score}(q,k) = \frac{q\cdot k}{\sqrt{d}}, \qquad \mathrm{Attention}(Q,K,V) = \mathrm{softmax}\!\Big(\frac{QK^\top}{\sqrt{d}}\Big)V, \qquad \text{output}_i = \sum_j a_{ij} v_j$$
Intuition: a **soft, differentiable dictionary lookup** — retrieve all values, blended by
how well each key matches the query. The model learns both the representation and the
search strategy.

**Positional encodings** (slide 11): attention is a set operation ("robot picked up spoon"
= "spoon picked up robot" without order). Fix by injecting position. **Absolute** (Vaswani):
add a fixed vector $\mathrm{PE}(i)$ to each embedding — fails on longer-than-trained
sequences. **Relative**: add a bias $b(i-j)$ (token distance) to the attention score —
generalizes to unseen lengths.

## The original transformer (slides 12–13)
Built for translation → **encoder-decoder**. **Encoder**: bidirectional self-attention
(every token sees all, past+future) for the richest representation. **Decoder**: **causal
self-attention** — a triangular mask sets future scores to $-\infty$ before softmax, so
each token attends only to itself and earlier ones (enables autoregressive generation).
**Cross-attention** (middle): decoder queries, encoder keys/values ("what from the source is
relevant now?"). **Training = teacher forcing**: feed ground-truth preceding tokens,
maximize next-token likelihood via cross-entropy — one forward pass computes all $T$ losses
(RNNs need $T$):
$$\mathcal{L} = -\frac{1}{T}\sum_{t=1}^{T}\log p_\theta(x_t\mid x_{1:t-1})$$

## Tokenization (slides 14–17)
Characters (tiny vocab, long sequences) vs words (short sequences, but unseen-word
problem). Want subwords. **Byte-Pair Encoding** (Sennrich et al. 2015): start from
characters, iteratively merge the most frequent adjacent pair $k$ times → a vocabulary.
Common subwords merge early → short sequences (attention is **quadratic**, so this matters);
unseen words break into known subwords. Example: 54 chars → 34 tokens (37% fewer). The
compression factor scales with corpus size (LLMs: 50k–100k vocab, ~3–4× compression).

## Scaling to LLMs (slides 18–22)
Engineering that made scale work: **decoder-only** (drop the encoder — a causal decoder on
next-token prediction scales simpler); **byte-level BPE** (no unknown tokens, even emojis);
**RoPE** (rotary position embeddings — rotate $Q,K$ by an angle ∝ position so $Q\cdot K$
depends only on relative distance); **FlashAttention** ($O(n)$ memory via SRAM tiling, never
materializing the $n\times n$ matrix). GPT-1 (2018, pre-train+finetune) → GPT-2 (2019, 10×,
**zero-shot** generalization) → GPT-3 (2020, 175B/300B tokens, **in-context learning**
emerges from scale). This is the **Bitter Lesson** (Sutton 2019): methods that scale with
compute beat hand-engineered ones.

**Scaling laws** (Chinchilla, Hoffmann et al. 2022): given a compute budget, scale model
and data **equally** — $n^* \propto c^{0.5}$, $D^* \propto c^{0.5}$, $C \approx 6ND$, **~20
tokens per parameter**. GPT-3 was *undertrained* (too big for its tokens). You can **predict**
a large model's loss from cheap small runs (isoFLOP power-law fit). LLaMA-3 is deliberately
*over*-trained past compute-optimal because it's cheaper to *serve* a smaller model to
millions of users.

## Extending to vision — VLMs (slides 23–30)
**Image tokenization / ViT** (Dosovitskiy, Beyer et al. 2020): split a 224×224 image into
16×16 patches → 196 patches, flatten, linear-project, add positional encoding → 196 tokens
that look like text tokens (+1 [CLS] = 197). Same philosophy as BPE: find the right unit,
embed, let attention do the rest.

Aligning vision & language — three paradigms:
- **CLIP** (Radford et al. 2021): two towers (ViT + text transformer), align via
  **contrastive learning** on $N$ image-text pairs — cosine-similarity matrix, learnable
  temperature $\tau$, symmetric InfoNCE:
  $$\mathcal{L}_{\text{CLIP}} = -\frac{1}{2N}\sum_i\Big(\log\frac{e^{s_{ii}/\tau}}{\sum_j e^{s_{ij}/\tau}} + \log\frac{e^{s_{ii}/\tau}}{\sum_j e^{s_{ji}/\tau}}\Big)$$
  → "apple" image and "apple" text land nearby.
- **LLaVA / early fusion** (Liu et al. 2023): frozen CLIP encoder → trainable MLP connector
  → **prepend** image tokens to text → one unified self-attention pass in a pre-trained LLM;
  fine-tune LLM on visual-instruction data.
- **Flamingo / late fusion** (Alayrac et al. 2022): frozen vision encoder → **perceiver
  resampler** to fixed-size K,V → a new **gated cross-attention** block at every LLM layer;
  text queries attend to vision. Elegant part: a **tanh gate init at zero** so it starts as
  a pure LLM and gradually opens:
  $$x \leftarrow x + \tanh(\alpha)\cdot\text{x-attn}(Q,K,V), \quad \alpha\ \text{learned, init }0,\ \tanh(0)=0$$
- **Native multimodal** (Gemini, GPT-4o): train all modalities jointly from scratch,
  interleaved in any order — most flexible, most expensive.

Trade-off: early fusion = richest cross-modal mixing but risks degrading the LLM; late
fusion preserves the LLM but limits interaction; native removes constraints but trains from
scratch.

## Robotics as multimodal sequence modeling (slides 31–38)
Same play as every modality: tokenize, feed the same architecture, scale. Now **action
tokens** join language + image tokens; run next-token prediction, unchanged. Attention also
addresses the **memory** problem (attend over history).

**Action tokenization** (slide 33; RT-2, Brohan et al. 2023; OpenVLA, Kim et al. 2024):
actions are continuous → discretize per-dimension, per-timestep. **Quantile normalization**:
per dimension, clip to the 1st–99th percentile, map to $[-1,+1]$ (identical across robots;
RT-2's min-max wastes bins on outliers). Divide $[-1,+1]$ into **256 bins** (width
$2/256=0.0078$); an N-dim action → N discrete tokens; **inject into the LLM vocabulary** by
overriding the 256 least-frequent tokens; train with next-token cross-entropy.

**Action chunking** (slide 34; ACT, Zhao et al. 2023) — the smoothness fix. Predict $k$
future actions at once: $\pi(a_{t:t+k}\mid o_t)$, execute the chunk, re-query. Fluid because
all $k$ are planned together. Long chunks (e.g. 100 at 50 Hz for a bimanual ALOHA →
predict 14×100=1,400 values/pass) risk the robot being "blind" for 2 s → **temporal
ensembling**: re-query every step, keep overlapping predictions, combine with exponentially
decaying weights
$$w_i = \exp(-m\cdot i), \qquad \hat a_t = \frac{\sum_i w_i a_i}{\sum_i w_i}$$
(newest highest weight). Smooth *and* reactive. ACT excels at high-tolerance dexterous tasks
(battery insertion).

**High-frequency breakdown & FAST** (slides 35–38). Autoregressive VLAs break at high
control frequency: consecutive tokens are highly correlated → near-zero marginal information
→ the model **copies the previous action token** and never learns the skill (performance
degrades past ~5 Hz with naive binning). Need compression — like subwords for language.
BPE doesn't suit continuous data; VQ-VAE is complex. **FAST** (Pertsch\*, Stachowicz\*,
Ichter, Driess, Nair, Vuong, **Mees** et al., RSS 2025, best-paper finalist) borrows from
JPEG: apply the **Discrete Cosine Transform** per action dimension (smooth trajectories →
energy in low frequencies → sparse), quantize/round, flatten low-frequency-first, then run
**BPE** on the integer sequence → compact dense tokens for the existing vocabulary.

Results: performance keeps improving past 5 Hz; **π₀-FAST** (autoregressive on a PaliGemma
backbone) converges **5× faster** than flow-matching π₀; trained on DROID it did **zero-shot**
language tasks in unseen kitchens (Berkeley/Stanford/UW) and 50 Hz bimanual laundry folding
— pushing **generality and dexterity** together (usually in tension: ACT precise-but-narrow,
OpenVLA broad-but-not-dexterous). Off-the-shelf tokenizer released on Hugging Face.

## Conclusion (slide 39)
Robotics is a sequence-modeling problem: transformers (scalable) → LLMs (emergent) →
VLMs/native multimodal (perception) → robot actions (tokenize, but naive tokenization breaks
at high frequency → compression like FAST). Central insight: **the Bitter Lesson applied to
robotics** — right representation + general scalable architecture + let data/compute work.

## Definitions for glossary
Reactive policy; POMDP; autoregressive model; chain rule of probability; RNN/LSTM;
vanishing/exploding gradients; attention (query/key/value); self-attention; scaled dot-
product; positional encoding (absolute/relative/RoPE); encoder-decoder; causal mask; cross-
attention; teacher forcing; cross-entropy; tokenization; byte-pair encoding; subword;
decoder-only; FlashAttention; zero-shot / in-context learning; Bitter Lesson; scaling laws;
compute-optimal; ViT / image patches; CLIP / contrastive learning; temperature; early/late/
native fusion; perceiver resampler; gated cross-attention; VLA; action tokenization;
quantile normalization; action chunking; temporal ensembling; FAST / DCT tokenization.

## Papers named
Sutskever et al. 2014 (Seq2Seq); Hochreiter & Schmidhuber 1997 (LSTM); Vaswani et al. 2017
(Transformer); Sennrich et al. 2015 (BPE); Sutton 2019 (Bitter Lesson); Brown et al. 2020
(GPT-3); Hoffmann et al. 2022 (Chinchilla); Dosovitskiy, Beyer et al. 2020 (ViT); Radford et
al. 2021 (CLIP); Liu et al. 2023 (LLaVA); Alayrac et al. 2022 (Flamingo); Brohan et al. 2023
(RT-2); Kim et al. 2024 (OpenVLA); **Zhao et al. 2023 (ACT)**; Pertsch/Stachowicz/…/**Mees**
et al. RSS 2025 (FAST).

## Figures worth reproducing
- `slide_007.jpg` — attention mechanism (softmax QKᵀ/√d · V).
- `slide_011.jpg` — absolute vs relative positional encoding.
- `slide_012.jpg` — encoder-decoder + causal mask.
- `slide_015.jpg` — BPE pseudocode.
- `slide_021.jpg`/`slide_022.jpg` — Chinchilla scaling / isoFLOP extrapolation.
- `slide_024.jpg` — ViT image tokenization.
- `slide_026.jpg` — CLIP two-tower contrastive.
- `slide_028.jpg` — Flamingo gated cross-attention (tanh gate).
- `slide_033.jpg` — action tokenization (quantile → 256 bins).
- `slide_034.jpg` — action chunking + temporal ensemble.
- `slide_036.jpg` — FAST (DCT → BPE) pipeline.

## Student Q&A
Deferred to end; in-lecture prompts rhetorical. Nice personal notes: Mees overlapped with
**Alexey Dosovitskiy** (ViT) and **Lucas Beyer** (ViT co-author, upcoming guest lecturer) in
Freiburg — good color for Ch.7/Ch.11.

## [UNCLEAR] / caveats
- Attention/CLIP/scaling equations are textbook-standard and OCR-clean; robotics-specific
  ones (Flamingo gate, action tokenization/chunking/FAST) verified on slide images.
- FAST is Mees's own work; the DROID zero-shot + laundry-folding results are from that
  collaboration (Berkeley + Physical Intelligence).

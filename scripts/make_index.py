#!/usr/bin/env python3
"""Build chapters/15-index.md from the rendered PDF.

The index is the last section of the book, so adding it does not move any page
it refers to -- run this against a build that does not yet contain it, then
rebuild. Page numbers are the printed (arabic) page numbers.

Only the preface and the eleven chapters are indexed; the notation appendix,
glossary and bibliography are already ordered for lookup.
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "build" / "robot-learning.pdf"
OUT = ROOT / "chapters" / "15-index.md"

# term -> regex alternatives (case-insensitive, word-boundary where sensible)
TERMS = {
    "action chunking": [r"action chunk"],
    "action expert": [r"action expert"],
    "action tokenization": [r"action tokeniz"],
    "actor-critic": [r"actor-critic"],
    "advantage function": [r"advantage"],
    "ALOHA": [r"ALOHA"],
    "AlphaGo": [r"AlphaGo"],
    "attention": [r"\battention\b"],
    "autoencoder": [r"autoencoder"],
    "autoregressive models": [r"autoregressiv"],
    "baseline (policy gradient)": [r"\bbaseline\b"],
    "behavior cloning": [r"behavior cloning"],
    "Bellman equation": [r"Bellman"],
    "bitter lesson": [r"bitter lesson"],
    "bootstrapping": [r"bootstrapp"],
    "byte-pair encoding": [r"byte-pair"],
    "CALVIN benchmark": [r"CALVIN"],
    "catastrophic forgetting": [r"catastrophic forgetting"],
    "causal confusion": [r"causal confusion"],
    "causal mask": [r"causal (self-attention|mask)"],
    "chain-of-thought": [r"chain-of-thought", r"chain of thought"],
    "classifier-free guidance": [r"classifier-free guidance"],
    "CLIP": [r"\bCLIP\b"],
    "codebook": [r"codebook"],
    "compounding error": [r"compound"],
    "configuration space": [r"configuration space", r"C-space"],
    "contrastive learning": [r"contrastive"],
    "Cosmos": [r"Cosmos"],
    "cross-attention": [r"cross-attention"],
    "cross-embodiment learning": [r"cross-embod"],
    "cross-entropy method": [r"cross-entropy method"],
    "CrossFormer": [r"CrossFormer"],
    "curse of dimensionality": [r"curse of dimensionality"],
    "DAgger": [r"DAgger"],
    "data flywheel": [r"flywheel"],
    "DayDreamer": [r"DayDreamer"],
    "DDIM": [r"\bDDIM\b"],
    "DDPG": [r"\bDDPG\b"],
    "DDPM": [r"\bDDPM\b"],
    "DeepSeek-R1": [r"DeepSeek"],
    "degrees of freedom": [r"degrees of freedom", r"\bDoF\b"],
    "diffusion models": [r"\bdiffusion\b"],
    "Diffusion Policy": [r"Diffusion Policy"],
    "discount factor": [r"discount"],
    "discretization": [r"discretiz"],
    "distribution shift": [r"distribution shift", r"covariate shift"],
    "Double DQN": [r"Double DQN"],
    "DQN": [r"\bDQN\b"],
    "DreamZero": [r"DreamZero"],
    "Dreamer": [r"\bDreamer\b"],
    "early fusion": [r"early fusion"],
    "ELBO": [r"ELBO", r"evidence lower bound", r"variational lower bound"],
    "embodiment gap": [r"embodiment gap"],
    "entropy regularization": [r"entropy"],
    "experience replay": [r"experience replay", r"replay buffer"],
    "exploration": [r"explorat"],
    "FAST tokenizer": [r"\bFAST\b"],
    "FiLM": [r"\bFiLM\b"],
    "FlashAttention": [r"FlashAttention"],
    "Flamingo": [r"Flamingo"],
    "flow matching": [r"flow matching"],
    "forward kinematics": [r"forward kinematics"],
    "Franka": [r"Franka"],
    "FuSe": [r"FuSe"],
    "Gato": [r"\bGato\b"],
    "generalist robot policy": [r"generalist (robot )?polic"],
    "goal-conditioning": [r"goal-condition"],
    "gripper conventions": [r"gripper (action )?convention"],
    "GRPO": [r"\bGRPO\b"],
    "imitation ceiling": [r"imitation ceiling"],
    "imitation learning": [r"imitation learning"],
    "importance sampling": [r"importance sampling"],
    "in-context learning": [r"in-context learning"],
    "introspection": [r"introspection"],
    "inverse dynamics model": [r"inverse dynamics"],
    "inverse kinematics": [r"inverse kinematics"],
    "Jacobian": [r"Jacobian"],
    "JEPA": [r"JEPA"],
    "knowledge insulation": [r"knowledge insulat"],
    "Kutzbach formula": [r"Kutzbach"],
    "late fusion": [r"late fusion"],
    "latent-variable models": [r"latent-variable", r"latent variable"],
    "LIBERO": [r"LIBERO"],
    "lifelong learning": [r"lifelong learning"],
    "LLaVA": [r"LLaVA"],
    "log-derivative trick": [r"log-derivative"],
    "Markov decision process": [r"Markov decision process", r"\bMDP\b"],
    "Markov property": [r"Markov property"],
    "mixture of Gaussians": [r"mixture of Gaussians"],
    "mobile manipulation": [r"mobile manipulation"],
    "mode averaging": [r"mode averaging", r"averages the modes"],
    "multimodal behavior": [r"multimodal (behavior|behaviour)"],
    "notation, deviations from slides": [r"notation table"],
    "Octo": [r"\bOcto\b"],
    "off-policy learning": [r"off-policy"],
    "offline reinforcement learning": [r"offline reinforcement learning", r"offline RL"],
    "Open X-Embodiment": [r"Open X-Embodiment"],
    "OpenVLA": [r"OpenVLA"],
    "overestimation bias": [r"overestimation"],
    "PALO": [r"PALO"],
    "PID control": [r"\bPID\b"],
    "pi-zero (flow-matching VLA)": [r"\bπ0\b", r"\bpi_?0\b"],
    "play data": [r"\bplay data\b"],
    "policy gradient": [r"policy gradient"],
    "policy iteration": [r"policy iteration"],
    "positional encoding": [r"positional encoding"],
    "posterior collapse": [r"posterior collapse"],
    "PPO": [r"\bPPO\b"],
    "prior mismatch": [r"prior mismatch"],
    "privileged information": [r"privileged"],
    "Q-function": [r"Q-function", r"Q-value"],
    "Q-learning": [r"Q-learning"],
    "quantile normalization": [r"quantile normaliz"],
    "quintic time scaling": [r"quintic"],
    "rapid adaptation": [r"rapid adaptation"],
    "readout token": [r"readout token"],
    "reasoning dropout": [r"reasoning dropout"],
    "reasoning pre-training": [r"reasoning pre-training"],
    "rectified flow": [r"rectified flow"],
    "recurrent state-space model": [r"recurrent state-space", r"\bRSSM\b"],
    "redundancy": [r"redundan"],
    "REINFORCE": [r"REINFORCE"],
    "reparameterization trick": [r"reparameteriz"],
    "representation collapse": [r"representation collapse"],
    "reward, sparse and dense": [r"sparse reward", r"dense reward"],
    "reward-to-go": [r"reward-to-go"],
    "RT-2": [r"RT-2"],
    "SARSA": [r"SARSA"],
    "scaling laws": [r"scaling law", r"Chinchilla"],
    "sequence packing": [r"sequence packing"],
    "shuffle buffer": [r"shuffle buffer"],
    "SIMPLER": [r"SIMPLER"],
    "SO-101": [r"SO-101"],
    "soft actor-critic": [r"soft actor-critic", r"\bSAC\b"],
    "spatial discretization": [r"spatial (action )?discretiz"],
    "stop gradient": [r"stop.gradient"],
    "straight-through estimator": [r"straight-through"],
    "system identification": [r"system identification", r"SysID"],
    "target network": [r"target network"],
    "task space": [r"task space"],
    "teacher forcing": [r"teacher forcing"],
    "temporal ensembling": [r"temporal ensembl"],
    "temporal-difference target": [r"temporal-difference", r"\bTD target\b"],
    "test-time compute scaling": [r"test-time compute"],
    "thinking tokens": [r"thinking tokens"],
    "trajectory": [r"\btrajector"],
    "transformer": [r"transformer"],
    "TRPO": [r"\bTRPO\b"],
    "trust region": [r"trust region"],
    "value function": [r"value function"],
    "value iteration": [r"value iteration"],
    "verifier": [r"verifier"],
    "vision transformer": [r"vision transformer", r"\bViT\b"],
    "vision-language-action model": [r"vision-language-action", r"\bVLA\b"],
    "visual matching": [r"visual matching"],
    "vocabulary override": [r"least-frequent tokens", r"vocabulary"],
    "VQ-VAE": [r"VQ-VAE"],
    "whole-body control": [r"whole.body control"],
    "world model": [r"world model"],
    "workspace": [r"workspace"],
}


def page_text(pdf: Path, n: int) -> str:
    r = subprocess.run(
        ["pdftotext", "-f", str(n), "-l", str(n), str(pdf), "-"],
        capture_output=True, text=True)
    return r.stdout


def find_folio_offset(pages: list[str]) -> int:
    """printed page number = physical index - offset.

    Derived from the running heads, which begin with the folio on verso pages.
    The mode of (physical - folio) over every page that shows one is used, so a
    stray number at the top of a page cannot shift the result.
    """
    from collections import Counter
    votes: Counter = Counter()
    for i, t in enumerate(pages, start=1):
        head = t.lstrip().split("\n", 1)[0].strip()
        m = re.match(r"^(\d{1,3})\b", head)
        if m:
            votes[i - int(m.group(1))] += 1
    if not votes:
        return 0
    return votes.most_common(1)[0][0]


# first sentence of the notation appendix, used to locate where the body ends
NOTATION_OPENER = "The lectures this book is compiled from are not internally consistent"


def find_last_body_page(pages: list[str]) -> int:
    """The index covers everything up to the notation appendix."""
    for i, t in enumerate(pages, start=1):
        if NOTATION_OPENER in " ".join(t.split()):
            return i - 1
    raise SystemExit("could not locate the notation appendix; check NOTATION_OPENER")


def compress(nums: list[int]) -> str:
    """[3,4,5,9] -> '3--5, 9'"""
    out, i = [], 0
    while i < len(nums):
        j = i
        while j + 1 < len(nums) and nums[j + 1] == nums[j] + 1:
            j += 1
        out.append(f"{nums[i]}--{nums[j]}" if j - i >= 2 else
                   ", ".join(str(n) for n in nums[i:j + 1]))
        i = j + 1
    return ", ".join(out)


def main() -> int:
    if not PDF.exists():
        print(f"missing {PDF}; build the book first", file=sys.stderr)
        return 1
    n_pages = int(subprocess.run(["pdfinfo", str(PDF)], capture_output=True,
                                 text=True).stdout.split("Pages:")[1].split()[0])
    pages = [page_text(PDF, n) for n in range(1, n_pages + 1)]
    offset = find_folio_offset(pages)
    first = offset + 1          # printed page 1: the start of the preface
    last = find_last_body_page(pages)
    print(f"indexing physical pages {first}-{last} of {n_pages}; "
          f"folio offset {offset} (printed = physical - {offset})")

    entries: dict[str, list[int]] = {}
    for term, patterns in TERMS.items():
        joined = "|".join(patterns)
        # Acronyms must match case-sensitively: "SIMPLER", "FAST" and "CLIP" are
        # also ordinary English words that appear on most pages of this book.
        case_sensitive = re.search(r"[A-Z]{2}", joined) is not None
        rx = re.compile(joined, 0 if case_sensitive else re.IGNORECASE)
        hits = [n - offset for n in range(first, last + 1)
                if rx.search(pages[n - 1])]
        if hits:
            entries[term] = hits

    lines = ["# Index {.unnumbered}", "", "\\markboth{Index}{Index}", "",
             "Page numbers refer to the preface and the eleven chapters. The notation "
             "appendix, glossary and bibliography are already ordered for lookup and are "
             "not indexed here. Terms are indexed at every page where they are discussed, "
             "not only at first use.", ""]
    current_letter = ""
    for term in sorted(entries, key=lambda s: s.lower()):
        letter = term[0].upper()
        if letter != current_letter:
            current_letter = letter
            lines += [f"## {letter} {{.unnumbered}}", ""]
        lines.append(f"**{term}**, {compress(entries[term])}")
        lines.append("")
    OUT.write_text("\n".join(lines) + "\n")
    print(f"wrote {OUT} with {len(entries)} entries")
    return 0


if __name__ == "__main__":
    sys.exit(main())

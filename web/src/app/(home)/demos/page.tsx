import type { Metadata } from 'next';
import Link from 'next/link';

import { ValueIteration } from '@/components/demos/value-iteration';
import { PolicyModes } from '@/components/demos/policy-modes';
import { CliffWalk } from '@/components/demos/cliff-walk';
import { Denoiser } from '@/components/demos/denoiser';
import { Attention } from '@/components/demos/attention';

export const metadata: Metadata = {
  title: 'Live demos',
  description:
    'The algorithms from the course, running in the page: value iteration, Q-learning against SARSA on the cliff, diffusion sampling, and one attention head with its mask.',
};

export default function DemosPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="u-label mb-5">Live demos</p>
      <h1 className="u-display max-w-[20ch] text-[clamp(1.875rem,4vw,2.75rem)] font-semibold leading-tight text-ink">
        Algorithms are easier to believe when you can push on them
      </h1>
      <p className="mt-5 max-w-[60ch] font-body text-[1rem] leading-relaxed text-ink-dim">
        These are the same demos embedded in the chapters, collected here so you can play
        with them on their own. They run entirely in the page — nothing is precomputed, so
        moving a slider genuinely re-solves the problem.
      </p>

      <Demo
        n="01"
        title="Value iteration"
        chapter="Chapter 4 — Reinforcement learning I"
        blurb="A robot on a grid. It knows only that the goal is worth 1 and the pit is worth −1; everything else it has to work out. Each sweep applies the Bellman backup to every square: what is this square worth, if I act well from here? Watch the value spread outward from the goal, and the arrows settle into a plan."
      >
        <ValueIteration />
        <Notes>
          <li>
            <strong>Discount γ</strong> is how much a reward one step later is worth. Drop
            it and the robot stops caring about distant goals, so far-off squares go cold.
          </li>
          <li>
            <strong>Slip</strong> is the chance it moves sideways instead of where it
            aimed. Turn it up and the policy starts hugging walls, because a slip near the
            pit is expensive.
          </li>
          <li>
            <strong>Step cost</strong> is what an ordinary move costs. Make it harsher and
            the robot takes riskier shortcuts; set it near zero and it wanders safely.
          </li>
          <li>
            Click any square to put a wall there — the problem changes and the solve
            restarts.
          </li>
        </Notes>
      </Demo>

      <Demo
        n="02"
        title="Why a policy outputs a distribution"
        chapter="Chapter 1 — the shape of a policy"
        blurb="The expert went round the obstacle sometimes over the top and sometimes underneath. Both are correct. Train a network to predict the one right action and it learns the average of the two, which is the single route that fails."
      >
        <PolicyModes />
        <Notes>
          <li>
            <strong>Predict one action</strong> is ordinary regression: minimise the error
            against every demonstration at once. The best single answer sits between the
            two modes.
          </li>
          <li>
            <strong>Predict a distribution</strong> keeps both modes and samples one. Every
            sample is a route someone actually drove.
          </li>
          <li>
            This is why Chapter 1 writes a policy as <em>a ∼ π(a | s)</em> with a
            distribution, and it is the failure that Chapters 3 and 6 keep coming back to.
          </li>
        </Notes>
      </Demo>

      <Demo
        n="03"
        title="Q-learning and SARSA on the cliff"
        chapter="Chapter 4 — Reinforcement learning I"
        blurb="Two update rules that differ by one term, learning on the same cliff from their own experience. They do not converge on the same route, and the reason is the term."
      >
        <CliffWalk />
        <Notes>
          <li>
            <strong>Q-learning</strong> bootstraps from the best action available at the next
            state. It assumes it will never slip, so it learns the shortest route — right
            along the edge.
          </li>
          <li>
            <strong>SARSA</strong> bootstraps from the action its own ε-greedy policy will
            actually take, which sometimes walks off. The squares beside the drop inherit
            that cost, so it keeps its distance.
          </li>
          <li>
            <strong>ε</strong> is how often the behaviour policy explores. Raise it and SARSA
            retreats further from the edge; take it to zero and the two rules agree, because
            the policy being followed is the greedy one.
          </li>
          <li>
            The returns shown are collected <em>while exploring</em>, so SARSA usually scores
            higher even though its route is longer — Q-learning keeps falling off the edge it
            learned to hug. Optimal-if-you-never-slip and best-given-that-you-do are different
            questions, and this is the demo where they give different answers.
          </li>
        </Notes>
      </Demo>

      <Demo
        n="04"
        title="Denoising into a multimodal action"
        chapter="Chapter 6 — Generative models"
        blurb="The sampler from Chapter 6, run on a distribution whose score is known exactly, so what you are watching is the reverse process rather than a network's approximation error."
      >
        <Denoiser />
        <Notes>
          <li>
            Every particle starts as Gaussian noise. Each step subtracts the noise predicted
            at that level and rescales — the update written as Equation (6.11).
          </li>
          <li>
            Nothing lands between the modes. That is the property a policy needs: the mean of
            three good actions is usually not one of them.
          </li>
          <li>
            <strong>Steps K</strong> is the speed problem in one slider. Drop it and the chain
            runs out of budget before it resolves, which is exactly the cost flow matching and
            consistency models are trying to buy back.
          </li>
        </Notes>
      </Demo>

      <Demo
        n="05"
        title="One attention head, with and without its mask"
        chapter="Chapter 7 — Sequence modeling"
        blurb="Seven tokens, one head, every row a distribution over the keys. The two switches are the two design decisions that make the mechanism trainable."
      >
        <Attention />
        <Notes>
          <li>
            <strong>The causal mask</strong> is what lets a decoder be trained on a whole
            sequence in one pass. Turn it off and every position can see the future, which is
            the encoder&rsquo;s bidirectional attention — and useless for generation.
          </li>
          <li>
            <strong>Divide by √d</strong>: dot products of d-dimensional vectors have variance
            d. Switch the scaling off and raise d, and the softmax saturates onto one key
            while the gradient through the rest goes to nothing.
          </li>
          <li>
            Both occurrences of &ldquo;the&rdquo; share an embedding, so they are genuinely
            identical keys — the second one can attend to the first.
          </li>
        </Notes>
      </Demo>

      <p className="mt-16 border-t border-line pt-8 font-body text-[0.9375rem] leading-relaxed text-ink-dim">
        Each of these is embedded in the chapter it belongs to, where the surrounding text
        does the explaining.{' '}
        <Link href="/docs" className="text-policy hover:underline">
          Read the book
        </Link>{' '}
        for the reasoning behind them.
      </p>
    </main>
  );
}

function Demo({
  n,
  title,
  chapter,
  blurb,
  children,
}: {
  n: string;
  title: string;
  chapter: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 border-t border-line pt-10">
      <div className="flex items-baseline gap-3">
        <span className="u-readout text-xs text-policy">{n}</span>
        <h2 className="u-display text-[1.375rem] font-semibold text-ink">{title}</h2>
      </div>
      <p className="u-label mt-2">{chapter}</p>
      <p className="mt-4 max-w-[62ch] font-body text-[0.9375rem] leading-relaxed text-ink-dim">
        {blurb}
      </p>
      {children}
    </section>
  );
}

function Notes({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mt-6 max-w-[62ch] space-y-3 border-l border-line pl-5 font-body text-[0.875rem] leading-relaxed text-ink-dim [&_strong]:text-ink">
      {children}
    </ul>
  );
}

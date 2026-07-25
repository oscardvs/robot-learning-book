import type { Metadata } from 'next';
import Link from 'next/link';

import { ValueIteration } from '@/components/demos/value-iteration';
import { PolicyModes } from '@/components/demos/policy-modes';

export const metadata: Metadata = {
  title: 'Live demos',
  description:
    'The algorithms from the course, running in the page: value iteration on a grid world, and why a policy has to output a distribution.',
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
        chapter="Chapter 2 — Robot control & MDPs"
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

      <p className="mt-16 border-t border-line pt-8 font-body text-[0.9375rem] leading-relaxed text-ink-dim">
        More will land as the chapters do — policy gradients, Q-learning on the same grid,
        and the diffusion policy from Chapter 6.{' '}
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

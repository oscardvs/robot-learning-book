import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName } from './shared';
import status from '@/data/status.json';

function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden
        className="inline-block size-2.5 rotate-45 border border-policy bg-policy/25"
      />
      <span className="u-display text-[0.95rem] font-semibold tracking-tight">{appName}</span>
      <span className="u-label hidden sm:inline">{status.course.institution}</span>
    </span>
  );
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: <Wordmark />, transparentMode: 'top' },
    links: [
      { text: 'The book', url: '/docs', active: 'nested-url' },
      { text: 'Slides', url: '/slides', active: 'nested-url' },
      { text: 'Demos', url: '/demos', active: 'nested-url' },
      { text: 'Course page', url: status.course.homepage, external: true },
    ],
  };
}

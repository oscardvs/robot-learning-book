import Link from 'next/link';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import status from '@/data/status.json';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      sidebar={{
        banner: (
          <Link
            href="/"
            className="block border border-line bg-surface px-3 py-2.5 transition-colors hover:border-ink-faint"
          >
            <span className="u-label">in progress</span>
            <span className="u-readout mt-1.5 block text-xs text-ink">
              {status.chaptersWritten} of {status.lectureCount} chapters written
            </span>
          </Link>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}

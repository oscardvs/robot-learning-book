import { getPageImageUrl, getPageMarkdownUrl, source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PlayIcon } from 'lucide-react';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import status from '@/data/status.json';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const { chapter, kind } = page.data as { chapter?: number; kind?: string };
  const isChapter = kind === 'chapter';
  const lecture = isChapter ? status.lectures.find((l) => l.n === chapter) : undefined;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      {lecture ? (
        <p className="u-label mb-4">
          Chapter {String(chapter).padStart(2, '0')} · after lecture {lecture.n}
        </p>
      ) : null}

      <DocsTitle>{page.data.title}</DocsTitle>
      {/* A chapter opens with its own lede paragraph, so repeating it as a subtitle
          would just say the same sentence twice. The preface and the back matter do
          not, so they keep theirs. The description still goes out in page metadata. */}
      {isChapter ? null : (
        <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      )}

      <div className="flex flex-row flex-wrap items-center gap-2 border-b border-line pb-6">
        {lecture ? (
          <>
            <a
              href={`https://www.youtube.com/watch?v=${lecture.video}`}
              target="_blank"
              rel="noreferrer"
              className="u-label inline-flex items-center gap-1.5 border border-line px-2.5 py-2 text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
            >
              <PlayIcon className="size-3" />
              watch the lecture
            </a>
            <Link
              href={`/slides/lecture${String(lecture.n).padStart(2, '0')}`}
              className="u-label inline-flex items-center gap-1.5 border border-line px-2.5 py-2 text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
            >
              {lecture.slideCount} slides
            </Link>
          </>
        ) : null}
        <MarkdownCopyButton markdownUrl={markdownUrl} />
      </div>

      <DocsBody>
        <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: { images: getPageImageUrl(page).url },
  };
}

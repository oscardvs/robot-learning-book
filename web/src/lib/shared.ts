export const appName = 'Robot Learning';
export const tagline =
  'An open study companion to ETH Zürich’s Robot Learning course — the book, the reconstructed slides, and the algorithms running live.';

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://robot-learning-book.vercel.app';

export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

/**
 * Set this once the repo is on GitHub; until then the "edit this page" affordances
 * stay hidden rather than pointing somewhere that does not exist.
 */
export const gitConfig: { user: string; repo: string; branch: string } | null = null;

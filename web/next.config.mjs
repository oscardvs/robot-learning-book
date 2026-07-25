import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();
const here = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // The book repo sits one level up and has no lockfile of its own; pin the root so
  // Next does not wander up looking for one.
  turbopack: { root: here },
};

export default withMDX(config);

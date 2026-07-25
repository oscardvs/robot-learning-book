import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import * as z from 'zod';

// `chapter`, `lecture` and `video` are written by scripts/sync-content.mjs so a page
// can link back to the lecture it came from.
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema.extend({
      chapter: z.number().optional(),
      kind: z.enum(['front', 'chapter', 'back']).optional(),
      lecture: z.number().optional(),
      video: z.string().optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {},
});

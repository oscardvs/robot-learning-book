import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import { Figure } from './book/figure';
import { BlockMath, InlineMath } from './book/math';
import { Aside, EditorNote, XRef } from './book/annotations';
import { Mermaid } from './book/mermaid';
import { ValueIteration } from './demos/value-iteration';
import { PolicyModes } from './demos/policy-modes';

// Everything the book can use. The first group is emitted by the sync script from
// the chapter source; the second is available to write by hand in any chapter.
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,

    Figure,
    InlineMath,
    BlockMath,
    XRef,
    EditorNote,
    Aside,
    blockquote: Aside,

    Mermaid,
    ValueIteration,
    PolicyModes,

    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}

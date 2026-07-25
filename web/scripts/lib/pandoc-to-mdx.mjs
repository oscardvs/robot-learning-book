// Converts the book's pandoc-flavoured Markdown into MDX that Fumadocs can render.
//
// The book source is written for a pandoc + pandoc-crossref -> LaTeX build. It uses
// four constructs MDX does not understand:
//
//   $x$ and $$x$$ {#eq:id}        maths, whose braces would be read as JSX expressions
//   ![cap](p){#fig:id width=70%}  images with an attribute block
//   @fig:id / @eq:id / @tbl:id    cross-references
//   > **Editor's note.** ...      an editorial aside
//
// Maths never reaches the Markdown parser: it is lifted out of the raw source into a
// side table and replaced by an alphanumeric placeholder, then put back as a JSX node
// after parsing. That keeps LaTeX braces away from MDX entirely rather than trying to
// escape around them.

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import remarkMdx from 'remark-mdx';
import { visit } from 'unist-util-visit';
import { toString as nodeToString } from 'mdast-util-to-string';

const PH = {
  inline: (i) => `ZqInlineMath${i}Zq`,
  display: (i) => `ZqDisplayMath${i}Zq`,
};
const PH_PATTERN = /Zq(InlineMath|DisplayMath)(\d+)Zq/g;
const XREF_PATTERN = /@(fig|eq|tbl|sec|lst):([A-Za-z0-9][A-Za-z0-9_-]*)/g;

/* ------------------------------------------------------------------ maths lift */

/** Replace `$...$` outside inline code with placeholders. */
function liftInlineMath(text, store) {
  return text
    .split(/(`+[^`]*`+)/g)
    .map((chunk) => {
      if (chunk.startsWith('`')) return chunk;
      return chunk.replace(
        /(?<![\\$])\$(?!\s)((?:[^$\\\n]|\\.)+?)(?<!\\)\$(?!\$)/g,
        (_m, tex) => PH.inline(store.inline.push(tex.trim()) - 1),
      );
    })
    .join('');
}

/**
 * Pull every maths span out of the raw source.
 * Handles fenced code, `$$..$$` on one line, and `$$` blocks spanning lines.
 */
function liftMath(source) {
  const store = { inline: [], display: [] };
  const lines = source.split('\n');
  const out = [];
  let fence = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})/);

    if (fenceMatch) {
      if (fence && line.trimStart().startsWith(fence)) fence = null;
      else if (!fence) fence = fenceMatch[1][0].repeat(3);
      out.push(line);
      continue;
    }
    if (fence) {
      out.push(line);
      continue;
    }

    // `$$` alone on a line opens a block that runs to the next `$$`.
    if (/^\s*\$\$\s*$/.test(line)) {
      const body = [];
      let j = i + 1;
      let id = null;
      for (; j < lines.length; j++) {
        const close = lines[j].match(/^\s*\$\$\s*(?:\{#([^}\s]+)[^}]*\})?\s*$/);
        if (close) {
          id = close[1] ?? null;
          break;
        }
        body.push(lines[j]);
      }
      const k = store.display.push({ tex: body.join('\n').trim(), id }) - 1;
      out.push(PH.display(k));
      i = j;
      continue;
    }

    // `$$ ... $$ {#eq:id}` all on one line.
    const oneLine = line.match(/^\s*\$\$([\s\S]+?)\$\$\s*(?:\{#([^}\s]+)[^}]*\})?\s*$/);
    if (oneLine) {
      const k = store.display.push({ tex: oneLine[1].trim(), id: oneLine[2] ?? null }) - 1;
      out.push(PH.display(k));
      continue;
    }

    out.push(liftInlineMath(line, store));
  }

  return { source: out.join('\n'), store };
}

/* ------------------------------------------------------------- JSX node helpers */

const attr = (name, value) => ({ type: 'mdxJsxAttribute', name, value });

/** An attribute whose value is a JS expression, so arbitrary text stays literal. */
const exprAttr = (name, value) => ({
  type: 'mdxJsxAttribute',
  name,
  value: { type: 'mdxJsxAttributeValueExpression', value: JSON.stringify(value) },
});

const jsx = (name, attributes = [], children = [], flow = false) => ({
  type: flow ? 'mdxJsxFlowElement' : 'mdxJsxTextElement',
  name,
  attributes,
  children,
});

/* ----------------------------------------------------------------- label passes */

/**
 * First pass: walk the source in reading order and assign a number to every
 * labelled figure, equation and table. Numbers are `chapter.index`, as in the book.
 */
function collectLabels(tree, store, chapter) {
  const labels = new Map();
  const counters = { fig: 0, eq: 0, tbl: 0 };
  const assign = (id, kind) => {
    if (!id || labels.has(id)) return;
    counters[kind] += 1;
    labels.set(id, { kind, number: `${chapter}.${counters[kind]}`, anchor: anchorFor(id) });
  };

  visit(tree, (node) => {
    if (node.type === 'image') {
      const attrs = readAttrBlock(node);
      if (attrs?.id) assign(attrs.id, 'fig');
    }
    if (node.type === 'text') {
      let m;
      PH_PATTERN.lastIndex = 0;
      while ((m = PH_PATTERN.exec(node.value))) {
        if (m[1] === 'DisplayMath') assign(store.display[Number(m[2])]?.id, 'eq');
      }
    }
  });

  return labels;
}

const anchorFor = (id) => id.replace(/[^A-Za-z0-9]+/g, '-').toLowerCase();

/**
 * Read the `{#fig:id width=70%}` block that pandoc puts after an image. remark keeps
 * it as literal text in the parent, so it is stashed on the image node by the caller.
 */
function readAttrBlock(imageNode) {
  return imageNode.__attrs ?? null;
}

function parseAttrBlock(raw) {
  const out = { id: null, width: null };
  const idMatch = raw.match(/#([A-Za-z0-9][A-Za-z0-9:_-]*)/);
  if (idMatch) out.id = idMatch[1];
  const widthMatch = raw.match(/width\s*=\s*([0-9.]+%?)/);
  if (widthMatch) out.width = widthMatch[1].endsWith('%') ? widthMatch[1] : `${widthMatch[1]}%`;
  return out;
}

/** Attach `{#id ...}` blocks to their image and drop them from the text. */
function bindImageAttributes(tree) {
  visit(tree, (node) => {
    if (!node.children) return;
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (child.type !== 'image') continue;
      const next = node.children[i + 1];
      if (next?.type === 'text') {
        const m = next.value.match(/^\s*\{([^}]*)\}/);
        if (m) {
          child.__attrs = parseAttrBlock(m[1]);
          next.value = next.value.slice(m[0].length);
          if (!next.value.trim()) node.children.splice(i + 1, 1);
        }
      }
    }
  });
}

/* ---------------------------------------------------------------- text rewriting */

/** Split a text node into text + JSX for placeholders and `@fig:` references. */
function rewriteText(value, ctx) {
  const nodes = [];
  let cursor = 0;

  const tokens = [];
  PH_PATTERN.lastIndex = 0;
  for (let m; (m = PH_PATTERN.exec(value)); ) {
    tokens.push({ start: m.index, end: m.index + m[0].length, kind: m[1], index: Number(m[2]) });
  }
  XREF_PATTERN.lastIndex = 0;
  for (let m; (m = XREF_PATTERN.exec(value)); ) {
    tokens.push({ start: m.index, end: m.index + m[0].length, kind: 'xref', id: `${m[1]}:${m[2]}` });
  }
  tokens.sort((a, b) => a.start - b.start);

  for (const token of tokens) {
    if (token.start < cursor) continue;
    if (token.start > cursor) nodes.push({ type: 'text', value: value.slice(cursor, token.start) });

    if (token.kind === 'InlineMath') {
      nodes.push(jsx('InlineMath', [exprAttr('tex', ctx.store.inline[token.index] ?? '')]));
    } else if (token.kind === 'DisplayMath') {
      // A display equation stranded inside a paragraph: render it inline-block.
      const eq = ctx.store.display[token.index];
      nodes.push(jsx('InlineMath', [exprAttr('tex', eq?.tex ?? ''), attr('display', 'true')]));
    } else {
      const label = ctx.labels.get(token.id);
      nodes.push(
        jsx('XRef', [
          attr('kind', token.id.split(':')[0]),
          attr('anchor', anchorFor(token.id)),
          attr('number', label?.number ?? '?'),
        ]),
      );
    }
    cursor = token.end;
  }

  if (cursor < value.length) nodes.push({ type: 'text', value: value.slice(cursor) });
  return nodes.length ? nodes : [{ type: 'text', value }];
}

/* ------------------------------------------------------------------- main passes */

function transformTree(tree, ctx) {
  // Paragraph-level nodes first: display equations, figures, editor's notes.
  visit(tree, (node, index, parent) => {
    if (!parent || index == null) return;

    if (node.type === 'paragraph') {
      const only = node.children.length === 1 ? node.children[0] : null;

      // A display equation sits alone in its paragraph.
      if (only?.type === 'text') {
        const m = only.value.trim().match(/^ZqDisplayMath(\d+)Zq$/);
        if (m) {
          const eq = ctx.store.display[Number(m[1])];
          const label = eq?.id ? ctx.labels.get(eq.id) : null;
          parent.children[index] = jsx(
            'BlockMath',
            [
              exprAttr('tex', eq?.tex ?? ''),
              ...(label ? [attr('id', label.anchor), attr('number', label.number)] : []),
            ],
            [],
            true,
          );
          return;
        }
      }

      // A figure: an image alone in its paragraph.
      const image = node.children.find((c) => c.type === 'image');
      if (image && node.children.every((c) => c.type === 'image' || (c.type === 'text' && !c.value.trim()))) {
        parent.children[index] = buildFigure(image, ctx);
        return;
      }
    }

    if (node.type === 'blockquote') {
      const lead = nodeToString(node.children[0] ?? {});
      const isNote = /^editor'?s note\b/i.test(lead.trim());
      const name = isNote ? 'EditorNote' : 'Aside';
      if (isNote) stripNoteLabel(node);
      parent.children[index] = jsx(name, [], node.children, true);
    }
  });

  // Then inline text everywhere that survived.
  visit(tree, 'text', (node, index, parent) => {
    if (!parent || index == null) return;
    if (parent.type === 'mdxJsxFlowElement' && parent.name === 'BlockMath') return;
    const replacement = rewriteText(node.value, ctx);
    if (replacement.length !== 1 || replacement[0].type !== 'text') {
      parent.children.splice(index, 1, ...replacement);
      return index + replacement.length;
    }
  });
}

/** Remove the leading `**Editor's note.**` label; the component supplies its own. */
function stripNoteLabel(node) {
  const first = node.children[0];
  if (first?.type !== 'paragraph') return;
  const [strong, next] = first.children;
  if (strong?.type === 'strong' && /^editor'?s note/i.test(nodeToString(strong))) {
    first.children.shift();
    if (next?.type === 'text') next.value = next.value.replace(/^\s+/, '');
  }
}

function buildFigure(image, ctx) {
  const attrs = readAttrBlock(image) ?? { id: null, width: null };
  const label = attrs.id ? ctx.labels.get(attrs.id) : null;
  const resolved = ctx.resolveImage(image.url);

  const caption = ctx.parseInline(image.alt ?? '');

  return jsx(
    'Figure',
    [
      ...(label ? [attr('id', label.anchor), attr('number', label.number)] : []),
      attr('src', resolved.src),
      ...(resolved.width ? [attr('width', String(resolved.width))] : []),
      ...(resolved.height ? [attr('height', String(resolved.height))] : []),
      ...(attrs.width ? [attr('scale', attrs.width)] : []),
      ...(resolved.videoUrl ? [attr('videoUrl', resolved.videoUrl)] : []),
      ...(resolved.timecode ? [attr('timecode', resolved.timecode)] : []),
      ...(resolved.lecture ? [attr('lecture', String(resolved.lecture))] : []),
    ],
    caption,
    true,
  );
}

/* ------------------------------------------------------------------------- entry */

const parser = unified().use(remarkParse).use(remarkGfm);
const serializer = unified()
  .use(remarkStringify, { bullet: '-', emphasis: '_', rule: '-', fences: true })
  .use(remarkGfm)
  .use(remarkMdx);

/**
 * @param {string} markdown  raw chapter source
 * @param {object} options
 * @param {number} options.chapter          chapter number, used for `1.2` labels
 * @param {(url:string)=>object} options.resolveImage
 * @returns {{ title: string|null, body: string, labels: Map }}
 */
export function pandocToMdx(markdown, { chapter, resolveImage }) {
  const { source, store } = liftMath(markdown);
  const tree = parser.parse(source);
  parser.runSync(tree);
  bindImageAttributes(tree);

  // Lift the H1 out: Fumadocs renders the title from frontmatter.
  let title = null;
  const firstHeading = tree.children.findIndex((n) => n.type === 'heading' && n.depth === 1);
  if (firstHeading !== -1) {
    title = nodeToString(tree.children[firstHeading]);
    tree.children.splice(firstHeading, 1);
  }

  const labels = collectLabels(tree, store, chapter);

  const ctx = {
    store,
    labels,
    resolveImage,
    parseInline: (text) => {
      if (!text.trim()) return [];
      const { source: lifted, store: inner } = liftMath(text);
      const sub = parser.parse(lifted);
      const para = sub.children[0];
      const children = para?.type === 'paragraph' ? para.children : [{ type: 'text', value: text }];
      const innerCtx = { store: inner, labels, resolveImage, parseInline: () => [] };
      const holder = { type: 'paragraph', children };
      visit(holder, 'text', (n, i, p) => {
        if (!p || i == null) return;
        const rep = rewriteText(n.value, innerCtx);
        if (rep.length !== 1 || rep[0].type !== 'text') {
          p.children.splice(i, 1, ...rep);
          return i + rep.length;
        }
      });
      return holder.children;
    },
  };

  transformTree(tree, ctx);

  const body = serializer.stringify(tree);
  return { title, body, labels };
}

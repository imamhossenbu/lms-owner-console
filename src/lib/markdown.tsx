import React from "react";

/**
 * A small Markdown → React renderer for blog posts (same as the website’s, for the editor preview). It only understands the syntax the Owner Console editor
 * offers (## / ### headings, paragraphs, - and 1. lists, > quotes, ``` code, ![image](https://…), ---, and inline
 * **bold**, *italic*, `code`, [links](…)). Output is built from React elements, never raw HTML, so content can't
 * inject markup or scripts.
 */

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export const headingId = (text: string) =>
  text
    .toLowerCase()
    .replace(/[`*_[\]()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";

const stripInline = (s: string) => s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/\[(.+?)\]\((.+?)\)/g, "$1");

/** ## and ### headings, for the table of contents (ids match the rendered headings). */
export function extractHeadings(md: string): Heading[] {
  const seen = new Map<string, number>();
  return md
    .split("\n")
    .map((l) => /^(#{2,3})\s+(.+)$/.exec(l.trim()))
    .filter((m): m is RegExpExecArray => !!m)
    .map((m) => {
      const text = stripInline(m[2].trim());
      return { id: uniqueId(headingId(text), seen), text, level: m[1].length as 2 | 3 };
    });
}

function uniqueId(id: string, seen: Map<string, number>) {
  const n = seen.get(id) ?? 0;
  seen.set(id, n + 1);
  return n ? `${id}-${n + 1}` : id;
}

const safeHref = (href: string) => (/^(https?:\/\/|\/|#|mailto:)/i.test(href) ? href : "#");

/** Inline syntax → React nodes. */
function inline(text: string, key = "i"): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${i++}`;
    if (m[2]) out.push(<strong key={k} className="font-semibold text-primary-500">{inline(m[2], k)}</strong>);
    else if (m[4]) out.push(<em key={k}>{inline(m[4], k)}</em>);
    else if (m[6]) out.push(<code key={k} className="rounded-md bg-brand-orange-light px-1.5 py-0.5 body-sm-medium text-brand-orange-hover">{m[6]}</code>);
    else if (m[8]) {
      const href = safeHref(m[9]);
      const external = /^https?:\/\//i.test(href);
      out.push(
        <a key={k} href={href} className="font-medium text-brand-orange underline decoration-brand-orange-20 underline-offset-4 transition-colors hover:decoration-brand-orange" {...(external && { target: "_blank", rel: "noopener noreferrer" })}>
          {inline(m[8], k)}
        </a>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Renders a Markdown document into article blocks styled with the design tokens. */
export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  const seen = new Map<string, number>();
  let i = 0;
  let k = 0;
  const key = () => `b${k++}`;

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (!t) {
      i++;
      continue;
    }
    // Code fence
    if (t.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) code.push(lines[i++]);
      i++;
      blocks.push(
        <pre key={key()} className="my-6 overflow-x-auto rounded-2xl bg-primary-500 p-5 body-sm-regular text-white/90">
          <code>{code.join("\n")}</code>
        </pre>
      );
      continue;
    }
    // Headings
    const h = /^(#{2,3})\s+(.+)$/.exec(t);
    if (h) {
      const text = h[2].trim();
      const id = uniqueId(headingId(stripInline(text)), seen);
      blocks.push(
        h[1].length === 2 ? (
          <h2 key={key()} id={id} className="heading-h3 mt-12 scroll-mt-28 text-primary-500">
            {inline(text)}
          </h2>
        ) : (
          <h3 key={key()} id={id} className="heading-h5 mt-8 scroll-mt-28 text-primary-500">
            {inline(text)}
          </h3>
        )
      );
      i++;
      continue;
    }
    // Rule
    if (/^(-{3,}|\*{3,})$/.test(t)) {
      blocks.push(<hr key={key()} className="my-10 border-dash" />);
      i++;
      continue;
    }
    // Image on its own line
    const img = /^!\[(.*?)\]\((https:\/\/[^\s)]+)\)$/.exec(t);
    if (img) {
      blocks.push(
        <figure key={key()} className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element -- author-supplied URL of any host */}
          <img src={img[2]} alt={img[1]} loading="lazy" className="w-full rounded-2xl border border-dash object-cover" />
          {img[1] && <figcaption className="mt-2 text-center body-sm-regular text-primary-300">{img[1]}</figcaption>}
        </figure>
      );
      i++;
      continue;
    }
    // Quote
    if (t.startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) quote.push(lines[i++].trim().replace(/^>\s?/, ""));
      blocks.push(
        <blockquote key={key()} className="my-8 rounded-r-2xl border-l-4 border-brand-orange bg-brand-orange-soft px-6 py-4 body-l-regular text-primary-500">
          {inline(quote.join(" "))}
        </blockquote>
      );
      continue;
    }
    // Lists
    const isUl = (s: string) => /^[-*]\s+/.test(s.trim());
    const isOl = (s: string) => /^\d+[.)]\s+/.test(s.trim());
    if (isUl(t) || isOl(t)) {
      const ordered = isOl(t);
      const items: string[] = [];
      while (i < lines.length && (ordered ? isOl(lines[i]) : isUl(lines[i]))) items.push(lines[i++].trim().replace(ordered ? /^\d+[.)]\s+/ : /^[-*]\s+/, ""));
      const Tag = ordered ? "ol" : "ul";
      blocks.push(
        <Tag key={key()} className={`my-6 space-y-2.5 pl-6 body-l-regular text-primary-400 ${ordered ? "list-decimal" : "list-disc"} marker:text-brand-orange`}>
          {items.map((it, n) => (
            <li key={n} className="pl-1.5">
              {inline(it, `${k}-${n}`)}
            </li>
          ))}
        </Tag>
      );
      continue;
    }
    // Paragraph (until a blank line or another block)
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,3}\s|```|>|[-*]\s|\d+[.)]\s|!\[)/.test(lines[i].trim())) para.push(lines[i++].trim());
    if (!para.length) {
      para.push(t);
      i++;
    }
    blocks.push(
      <p key={key()} className="my-5 body-l-regular leading-relaxed text-primary-400">
        {inline(para.join(" "))}
      </p>
    );
  }
  return <>{blocks}</>;
}

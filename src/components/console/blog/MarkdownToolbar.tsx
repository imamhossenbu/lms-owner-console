"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bold, Code, Heading2, Heading3, Image as ImageIcon, Italic, Link2, List, ListOrdered, Minus, Quote, type LucideIcon } from "lucide-react";

type Action = { icon: LucideIcon; label: string; wrap?: [string, string]; line?: string; block?: string };

const ACTIONS: Action[] = [
  { icon: Heading2, label: "Heading", line: "## " },
  { icon: Heading3, label: "Sub-heading", line: "### " },
  { icon: Bold, label: "Bold", wrap: ["**", "**"] },
  { icon: Italic, label: "Italic", wrap: ["*", "*"] },
  { icon: Code, label: "Inline code", wrap: ["`", "`"] },
  { icon: Link2, label: "Link", wrap: ["[", "](https://)"] },
  { icon: List, label: "Bulleted list", line: "- " },
  { icon: ListOrdered, label: "Numbered list", line: "1. " },
  { icon: Quote, label: "Quote", line: "> " },
  { icon: ImageIcon, label: "Image", block: "![Caption](https://)" },
  { icon: Minus, label: "Divider", block: "---" },
];

/**
 * Formatting buttons above the Markdown textarea: wrap the selection (bold, italic, code, link), prefix the
 * current line (headings, lists, quote) or insert a block (image, divider). Calls `onChange` with the new text.
 */
export function MarkdownToolbar({ textarea, onChange }: { textarea: React.RefObject<HTMLTextAreaElement | null>; onChange: (value: string) => void }) {
  const apply = (a: Action) => {
    const el = textarea.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    let next = value;
    let caret = e;
    if (a.wrap) {
      const sel = value.slice(s, e) || a.label.toLowerCase();
      next = value.slice(0, s) + a.wrap[0] + sel + a.wrap[1] + value.slice(e);
      caret = s + a.wrap[0].length + sel.length;
    } else if (a.line) {
      const start = value.lastIndexOf("\n", s - 1) + 1;
      next = value.slice(0, start) + a.line + value.slice(start);
      caret = e + a.line.length;
    } else if (a.block) {
      const before = value.slice(0, s).replace(/\n*$/, "");
      const insert = `${before ? "\n\n" : ""}${a.block}\n\n`;
      next = before + insert + value.slice(e).replace(/^\n*/, "");
      caret = before.length + insert.length;
    }
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-dash bg-gray-bg px-2 py-1.5" role="toolbar" aria-label="Formatting">
      {ACTIONS.map((a) => (
        <motion.button
          key={a.label}
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => apply(a)}
          title={a.label}
          aria-label={a.label}
          className="flex h-8 w-8 items-center justify-center rounded-md text-primary-400 transition-colors hover:bg-white hover:text-brand-orange"
        >
          <a.icon className="h-4 w-4" />
        </motion.button>
      ))}
    </div>
  );
}

export default MarkdownToolbar;

#!/usr/bin/env node
/**
 * Design-token guard (AGENTS.md §2): text size/weight/colour must come from globals.css classes.
 *
 *   node scripts/check-design-tokens.mjs [dir-or-file ...]   (default: src)
 *
 * Flags, per class string ("…", '…', `…`) in .tsx/.ts files:
 *   size      raw Tailwind text sizes (text-xs … text-9xl)            → body-, title-, heading- classes
 *   arbitrary arbitrary text/bg/border/colour values (text-[…], bg-[#…]) → tokens
 *   palette   Tailwind palette TEXT colours (text-slate-400 …)          → text-primary-N / status tokens
 *   hex       raw hex colours in class strings / style props            → tokens (chartTheme for charts)
 *   weight    font-* weight utility on an element without a typography token in the same class string
 *             (allowed: `font-semibold!` etc. next to a body-, title- or heading- class)
 * Exit code 1 when anything is found.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const targets = process.argv.slice(2).length ? process.argv.slice(2) : ["src"];
// Files that legitimately hold raw colour values (chart palette, email/certificate render output).
const HEX_ALLOW = [/ui\/charts\/chartTheme\.ts$/, /globals\.css$/];

const TOKEN = /(^|\s)(body-[a-z0-9-]+|title-[a-z0-9-]+|heading-[a-z0-9-]+|display-h1|h[1-6](-[a-z]+)?)(?=\s|$|!)/;
const RULES = [
  ["size", /(^|[\s:"'`])text-(xs|sm|base|lg|xl|[2-9]xl)(?=[\s"'`!]|$)/],
  ["arbitrary", /(^|[\s:"'`])(text|bg|border|fill|stroke|from|to|via|ring|outline|decoration)-\[(#|rgb|hsl|\d)/],
  ["palette", /(^|[\s:"'`])text-(slate|gray|zinc|neutral|stone|red|green|blue|orange|amber|emerald|yellow|purple|indigo|sky|rose|teal|cyan|lime|pink|fuchsia|violet)-\d{2,3}\b/],
];
const WEIGHT = /(^|[\s:])font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)(?![!\w-])/;
const HEX = /#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b(?![0-9A-Fa-f])/;

function walk(p, out) {
  const s = statSync(p);
  if (s.isDirectory()) {
    if (/node_modules|\.next|__tests__/.test(p)) return;
    readdirSync(p).forEach((f) => walk(join(p, f), out));
  } else if (/\.(tsx|ts)$/.test(p)) out.push(p);
}

const files = [];
targets.forEach((t) => walk(join(ROOT, t), files));
const problems = [];

for (const file of files) {
  const rel = relative(ROOT, file);
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
    const strings = line.match(/"[^"]*"|'[^']*'|`[^`]*`/g) ?? [];
    for (const raw of strings) {
      const str = raw.slice(1, -1);
      for (const [name, re] of RULES) if (re.test(" " + str)) problems.push([rel, i + 1, name, str.trim().slice(0, 90)]);
      if (WEIGHT.test(" " + str) && !TOKEN.test(" " + str) && /(text-|truncate|leading|tracking|uppercase|flex|block|inline)/.test(str))
        problems.push([rel, i + 1, "weight", str.trim().slice(0, 90)]);
      if (HEX.test(str) && !HEX_ALLOW.some((r) => r.test(rel)) && /(className|style|color|fill|stroke|background)/i.test(line))
        problems.push([rel, i + 1, "hex", str.trim().slice(0, 90)]);
    }
  });
}

problems.forEach(([f, l, n, s]) => console.log(`${f}:${l}  [${n}]  ${s}`));
const byRule = problems.reduce((a, [, , n]) => ((a[n] = (a[n] ?? 0) + 1), a), {});
console.log(`\n${problems.length} problem(s) in ${new Set(problems.map((p) => p[0])).size} file(s)`, byRule);
process.exit(problems.length ? 1 : 0);

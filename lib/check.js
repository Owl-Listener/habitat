/**
 * Checks UI code against the design system: the rules a program can check,
 * so people and the review skill can spend their attention on the rest.
 *
 *   raw-colour         a hex, rgb() or hsl() colour instead of a token
 *   raw-size           a pixel value instead of a token (0, 1px and 2px are
 *                      allowed: hairlines and focus outlines are rarely tokens)
 *   unknown-token      var(--something) that is not a token in tokens.md
 *   raw-element        a native <button>, <input>... where the system has a
 *                      component for it (the component's own file is exempt)
 *   deprecated         a deprecated component, with its replacement
 *
 * Each finding carries a file, line and column, so it can be fixed or counted.
 * Counting them is what turns an eval from an impression into a number.
 *
 * When there is exactly one right answer, a finding also carries a fix: a raw
 * value that matches a single semantic token is replaced by that token's CSS
 * variable. When several tokens share the value, the finding lists them and a
 * person picks, because only the meaning can say which is right. Swapping a
 * native element or a deprecated component for a system component is never
 * automatic: their props differ, and a wrong guess would break the screen.
 */

import { execFileSync } from "node:child_process";

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";

const CODE = new Set([".css", ".scss", ".less", ".tsx", ".jsx", ".ts", ".js", ".vue", ".svelte", ".html"]);

// Native elements a design system usually wraps, by component name.
const NATIVE = { button: "button", input: "input", select: "select", textarea: "textarea", table: "table", dialog: "dialog", checkbox: 'input type="checkbox"', link: "a" };

const STYLES = new Set([".css", ".scss", ".less"]);

// In a stylesheet, any "#1f6f6b" after a space or colon is a colour. In other
// files it only counts inside a string ("#1f6f6b" in a style prop), so page
// text like "Issue #123" or an HTML entity like "&#160;" is left alone.
function looksLikeColour(path, line, index) {
  const before = line.slice(0, index);
  if (STYLES.has(extname(path))) return /[\s:,(]$/.test(before) || index === 0;
  return ['"', "'", "`"].some((q) => before.split(q).length % 2 === 0);
}

// Which kind of token belongs on which CSS property, by token name.
const PROPERTY_KINDS = [
  [/^(padding|margin|gap|row-gap|column-gap|inset|top|right|bottom|left)/, /\b(space|spacing)\b/],
  [/^font-size$/, /\b(size|font-size)\b/],
  [/radius$/, /\b(radius|rounded)\b/],
  [/^(border|outline)(-[a-z]+)*-color$|^border(-top|-right|-bottom|-left)?$/, /\b(border|focus|ring|outline)/i],
  [/^outline/, /\b(focus|ring|outline)/i],
  [/^(background|background-color|fill)$/, /\b(surface|background|bg|brand|fill)/i],
  [/^(color|caret-color|-webkit-text-fill-color)$/, /\btext\b/i],
];

// The CSS property a value belongs to: "padding: 16px" in a stylesheet, or
// padding: "16px" in a style object, as kebab-case.
function propertyBefore(line, index) {
  const m = line.slice(0, index).match(/([a-zA-Z-]+)["']?\s*:\s*["'`]?[^:;{}]*$/);
  return m ? m[1].replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : null;
}

// "#FFF", "#ffffff" and "rgb(255, 255, 255)" are the same colour, so compare them as one.
function normalise(value) {
  let v = String(value).trim().toLowerCase();
  const rgb = v.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*(?:[,/]\s*(1|1\.0+|100%))?\s*\)$/);
  if (rgb) v = "#" + rgb.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, "0")).join("");
  if (/^#[0-9a-f]{3}$/.test(v)) v = "#" + [...v.slice(1)].map((c) => c + c).join("");
  return v;
}

/** color.text.onBrand -> --color-text-on-brand, the CSS variable convention. */
export const cssVar = (token) =>
  "--" + token.replace(/\./g, "-").replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** Every code file under the given paths, skipping dependencies and build output. */
export function collectFiles(paths) {
  const out = [];
  const walk = (p) => {
    const stat = statSync(p);
    if (stat.isDirectory()) {
      for (const name of readdirSync(p)) {
        if (!["node_modules", "dist", "build", ".git"].includes(name)) walk(join(p, name));
      }
    } else if (CODE.has(extname(p))) {
      out.push({ path: resolve(p), text: readFileSync(p, "utf8") });
    }
  };
  paths.forEach((p) => walk(p));
  return out;
}

/** The file that implements a component, if its contract links to one. */
export function implementationPath(component) {
  const impl = component.data?.codeConnect?.implementation;
  return impl && impl.startsWith(".") ? resolve(dirname(component.path), impl) : null;
}

export function checkCode(design, files) {
  const tokens = design.tokens?.data?.tokens || [];
  const vars = new Set(tokens.map((t) => cssVar(t.name)));
  // Which tokens have a given raw value, so a finding can suggest them.
  // Several tokens can share a value (text and border colours often do),
  // so list them all and let a person pick the one with the right meaning.
  const byName = new Map(tokens.map((t) => [t.name, t]));
  const valueOf = (t, seen = new Set()) => {
    if (!t?.aliasOf || seen.has(t.name)) return t?.value;
    seen.add(t.name);
    return valueOf(byName.get(t.aliasOf), seen);
  };
  const byValue = new Map();
  for (const t of tokens) {
    const value = valueOf(t);
    if (!["string", "number"].includes(typeof value) || t.replacedBy || t.tier === "primitive") continue;
    const key = normalise(value);
    byValue.set(key, [...(byValue.get(key) || []), t.name]);
  }
  // The tokens a raw value could be. When several share it, the CSS property
  // it sits on (padding, color, border-color...) usually says which kind is
  // meant, so narrow by that before giving up and asking a person.
  const candidates = (raw, property) => {
    const names = byValue.get(normalise(raw)) || [];
    if (names.length < 2 || !property) return names;
    const kind = PROPERTY_KINDS.find(([p]) => p.test(property))?.[1];
    const narrowed = kind ? names.filter((n) => kind.test(n)) : names;
    return narrowed.length ? narrowed : names;
  };
  const suggest = (raw, property) => {
    const names = candidates(raw, property);
    if (!names.length) return "";
    return names.length === 1 ? `; use ${names[0]}: var(${cssVar(names[0])})` : `; the same value as ${names.join(" or ")} (pick by meaning)`;
  };
  // The fix for a raw value, when exactly one token fits.
  const fixFor = (raw, index, property) => {
    const names = candidates(raw, property);
    return names.length === 1 ? { column: index, length: raw.length, replacement: `var(${cssVar(names[0])})` } : undefined;
  };

  const natives = design.components
    .map((c) => ({ c, tag: NATIVE[c.data?.name?.canonical?.toLowerCase()] }))
    .filter((n) => n.tag);
  const deprecated = design.components.filter((c) => c.data?.status === "deprecated");

  const findings = [];
  for (const file of files) {
    const own = design.components.filter((c) => {
      const impl = implementationPath(c);
      return impl ? impl === file.path : basename(file.path, extname(file.path)) === c.data?.name?.canonical;
    });
    file.text.split("\n").forEach((line, i) => {
      const at = { path: file.path, line: i + 1 };
      const add = (rule, message, column = 0, fix) => findings.push({ ...at, column, rule, message, ...(fix && { fix }) });
      const trimmed = line.trim();
      if (/^(\/\/|\/\*|\*)/.test(trimmed)) return; // comments
      if (/^--[\w-]+\s*:/.test(trimmed)) return; // token definitions, e.g. tokens.css

      for (const m of line.matchAll(/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\([^)]*\)/gi)) {
        if (m[0].startsWith("#") && !looksLikeColour(file.path, line, m.index)) continue;
        const property = propertyBefore(line, m.index);
        add("raw-colour", `raw colour ${m[0]}${suggest(m[0], property)}`, m.index, fixFor(m[0], m.index, property));
      }
      for (const m of line.matchAll(/(?<![\w-])(\d*\.?\d+)px\b/g)) {
        if (["0", "1", "2"].includes(m[1])) continue;
        const property = propertyBefore(line, m.index);
        add("raw-size", `raw size ${m[0]}${suggest(m[0], property)}`, m.index, fixFor(m[0], m.index, property));
      }
      if (vars.size) {
        for (const m of line.matchAll(/var\((--[\w-]+)/g)) {
          if (!vars.has(m[1])) add("unknown-token", `${m[1]} is not a token in tokens.md`, m.index + 4);
        }
      }
      for (const { c, tag } of natives) {
        if (own.includes(c)) continue;
        const el = tag.split(" ")[0];
        const pattern = tag.includes(" ") ? new RegExp(`<${el}\\b[^>]*${tag.split(" ")[1]}`) : new RegExp(`<${el}[\\s>/]`);
        const hit = line.match(pattern);
        if (hit) add("raw-element", `native <${el}> used; the system has ${c.data.name.canonical}`, hit.index);
      }
      for (const c of deprecated) {
        const hit = line.match(new RegExp(`<${c.data.name.canonical}[\\s>/]`));
        if (hit) add("deprecated", `${c.data.name.canonical} is deprecated${c.data.replacedBy ? `; use ${c.data.replacedBy}` : ""}`, hit.index);
      }
    });
  }
  return findings.sort((a, b) => (a.path === b.path ? a.line - b.line || a.column - b.column : 0));
}

/**
 * Apply every fix to the files on disk. Fixes on one line are applied right
 * to left, so an earlier replacement never shifts a later one's position.
 * Returns how many were applied.
 */
export function applyFixes(files, findings) {
  let applied = 0;
  for (const file of files) {
    const fixes = findings.filter((f) => f.fix && f.path === file.path);
    if (!fixes.length) continue;
    const lines = file.text.split("\n");
    for (const f of fixes.sort((a, b) => b.line - a.line || b.fix.column - a.fix.column)) {
      const line = lines[f.line - 1];
      lines[f.line - 1] = line.slice(0, f.fix.column) + f.fix.replacement + line.slice(f.fix.column + f.fix.length);
      applied++;
    }
    file.text = lines.join("\n");
    writeFileSync(file.path, file.text);
  }
  return applied;
}

/**
 * The lines changed since a git ref (a branch, tag or commit), by absolute
 * file path, so a pull request is only held to account for what it touched.
 */
export function changedLines(ref, cwd = process.cwd()) {
  const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd, encoding: "utf8" }).trim();
  const diff = execFileSync("git", ["diff", "--unified=0", "--no-color", "--no-ext-diff", ref, "--"], { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const changed = new Map();
  let file = null;
  for (const line of diff.split("\n")) {
    const target = line.match(/^\+\+\+ (?:b\/)?(.+)$/);
    if (target) {
      file = target[1] === "/dev/null" ? null : resolve(root, target[1]);
      if (file) changed.set(file, new Set());
      continue;
    }
    const hunk = line.match(/^@@ -\S+ \+(\d+)(?:,(\d+))? @@/);
    if (hunk && file) {
      const start = Number(hunk[1]);
      const count = hunk[2] === undefined ? 1 : Number(hunk[2]);
      for (let n = start; n < start + count; n++) changed.get(file).add(n);
    }
  }
  return changed;
}

/** One finding as a GitHub Actions annotation, which shows up on the pull request's lines. */
export const githubAnnotation = (f, rel) =>
  `::warning file=${rel},line=${f.line},col=${f.column + 1},title=habitat ${f.rule}::${f.message.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A")}`;

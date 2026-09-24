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
 * Each finding carries a file and line, so it can be fixed or counted.
 * Counting them is what turns an eval from an impression into a number.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
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
  const byValue = new Map();
  for (const t of tokens) {
    if (t.value === undefined || t.replacedBy || t.tier === "primitive") continue;
    const key = String(t.value).toLowerCase();
    byValue.set(key, [...(byValue.get(key) || []), t.name]);
  }
  const suggest = (raw) => {
    const names = byValue.get(raw.toLowerCase());
    return names ? `; the same value as ${names.join(" or ")}` : "";
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
      const add = (rule, message) => findings.push({ ...at, rule, message });
      const trimmed = line.trim();
      if (/^(\/\/|\/\*|\*)/.test(trimmed)) return; // comments
      if (/^--[\w-]+\s*:/.test(trimmed)) return; // token definitions, e.g. tokens.css

      for (const m of line.matchAll(/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\([^)]*\)/gi)) {
        if (m[0].startsWith("#") && !looksLikeColour(file.path, line, m.index)) continue;
        add("raw-colour", `raw colour ${m[0]}${suggest(m[0])}`);
      }
      for (const m of line.matchAll(/(?<![\w-])(\d*\.?\d+)px\b/g)) {
        if (["0", "1", "2"].includes(m[1])) continue;
        add("raw-size", `raw size ${m[0]}${suggest(m[0])}`);
      }
      if (vars.size) {
        for (const m of line.matchAll(/var\((--[\w-]+)/g)) {
          if (!vars.has(m[1])) add("unknown-token", `${m[1]} is not a token in tokens.md`);
        }
      }
      for (const { c, tag } of natives) {
        if (own.includes(c)) continue;
        const el = tag.split(" ")[0];
        const pattern = tag.includes(" ") ? new RegExp(`<${el}\\b[^>]*${tag.split(" ")[1]}`) : new RegExp(`<${el}[\\s>/]`);
        if (pattern.test(line)) add("raw-element", `native <${el}> used; the system has ${c.data.name.canonical}`);
      }
      for (const c of deprecated) {
        if (new RegExp(`<${c.data.name.canonical}[\\s>/]`).test(line)) {
          add("deprecated", `${c.data.name.canonical} is deprecated${c.data.replacedBy ? `; use ${c.data.replacedBy}` : ""}`);
        }
      }
    });
  }
  return findings;
}

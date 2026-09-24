/**
 * Checks a design folder and prints a report a designer can act on.
 *
 * Three kinds of finding:
 *   - error:   the file breaks the schema, so an agent would misread it.
 *   - todo:    a question the AI could not answer and a person still needs to.
 *   - warning: something that is valid but probably a mistake, such as a
 *              component bound to a token that tokens.md never defines, or a
 *              file nobody has reviewed in six months.
 *
 * Returns true when there are no errors. With { strict: true }, TODOs count
 * as errors too, which is what CI should run once a system is finished.
 */

import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import { loadDesign, findTodos, findComponent } from "./habitat.js";

const schema = (name) =>
  JSON.parse(readFileSync(fileURLToPath(new URL(`../schema/${name}`, import.meta.url)), "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
const checkComponent = ajv.compile(schema("component.schema.json"));
const checkTokens = ajv.compile(schema("tokens.schema.json"));

const STALE_DAYS = 183;

function staleness(data, today) {
  if (!data?.lastReviewed || data.status === "draft") return [];
  const days = Math.floor((today - new Date(data.lastReviewed)) / 86_400_000);
  return days > STALE_DAYS
    ? [`last reviewed ${days} days ago; check it still matches Figma and code`]
    : [];
}

// Every "a.b.c" word in a binding like "space.md space.lg" is a token reference.
const tokenRefs = (binding) => String(binding).split(/[\s,]+/).filter((w) => /^[a-z][\w-]*(\.[\w-]+)+$/i.test(w));

export function validate(dir, { strict = false, today = new Date() } = {}) {
  const design = loadDesign(dir);
  const rel = (p) => relative(process.cwd(), p) || p;
  let errors = 0;
  let todos = 0;

  const report = (file, check, warnings = []) => {
    const lines = [];
    if (check && !check(file.data)) {
      for (const e of check.errors) lines.push(`  error    ${e.instancePath || "(top)"} ${e.message}`);
    }
    const open = findTodos(file);
    if (open.length && file.data?.status === "reviewed") {
      lines.push(`  error    marked "reviewed" but still has ${open.length} TODO(s)`);
    }
    for (const t of open) lines.push(`  todo     ${t}`);
    for (const w of warnings) lines.push(`  warning  ${w}`);
    const fileErrors = lines.filter((l) => l.startsWith("  error")).length;
    errors += fileErrors;
    todos += open.length;
    const mark = fileErrors ? "✗" : open.length || warnings.length ? "…" : "✓";
    console.log(`${mark} ${rel(file.path)}`);
    lines.forEach((l) => console.log(l));
  };

  for (const e of design.errors) {
    console.log(`✗ ${rel(e.path)}\n  error    ${e.message}`);
    errors++;
  }

  if (design.principles) report(design.principles, null);
  else console.log("… DESIGN.md is missing. Principles are what stop an agent inventing its own taste.");

  // Index the tokens so components can be checked against them.
  const tokens = new Map((design.tokens?.data?.tokens || []).map((t) => [t.name, t]));
  if (design.tokens) {
    const warnings = [...staleness(design.tokens.data, today)];
    for (const t of tokens.values()) {
      if (t.aliasOf && !tokens.has(t.aliasOf)) warnings.push(`${t.name} is an alias of "${t.aliasOf}", which is not defined`);
      if (t.replacedBy && !tokens.has(t.replacedBy)) warnings.push(`${t.name} is replaced by "${t.replacedBy}", which is not defined`);
    }
    report(design.tokens, checkTokens, warnings);
  } else {
    console.log("… tokens.md is missing.");
  }

  for (const component of design.components) {
    const { data } = component;
    const warnings = [...staleness(data, today)];

    if (data?.status === "deprecated" && data.replacedBy && !findComponent(design, data.replacedBy)) {
      warnings.push(`replaced by "${data.replacedBy}", which has no file in components/`);
    }

    // Token binding: every token a component names should exist, be current,
    // and be a role (semantic) rather than a raw palette value (primitive).
    if (tokens.size) {
      const layout = data?.anatomy?.layout || {};
      const bindings = [
        ...Object.entries(data?.tokens || {}).map(([k, v]) => [`tokens.${k}`, v]),
        ...["gap", "padding"].filter((k) => layout[k]).map((k) => [`anatomy.layout.${k}`, layout[k]]),
      ];
      for (const [where, binding] of bindings) {
        for (const ref of tokenRefs(binding)) {
          const token = tokens.get(ref);
          if (!token) warnings.push(`${where} uses "${ref}", which tokens.md does not define`);
          else if (token.replacedBy) warnings.push(`${where} uses deprecated "${ref}"; use "${token.replacedBy}"`);
          else if (token.tier === "primitive") warnings.push(`${where} binds to primitive "${ref}"; bind to a semantic token so re-theming works`);
        }
      }
    }
    report(component, checkComponent, warnings);
  }

  if (!design.components.length) console.log("… no components yet in components/.");

  const failed = errors + (strict ? todos : 0);
  console.log(
    `\n${design.components.length} component(s), ${errors} error(s), ${todos} open TODO(s).` +
      (todos && !strict ? " Answer the TODOs, then set status: reviewed." : "")
  );
  return failed === 0;
}

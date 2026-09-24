/**
 * Checks a design folder and prints a report a designer can act on.
 *
 * Three kinds of finding:
 *   - error:   the file breaks the schema, so an agent would misread it.
 *   - todo:    a question the AI could not answer and a person still needs to.
 *   - warning: something that is valid but probably a mistake, such as a
 *              component bound to a token that tokens.md never defines.
 *
 * Returns true when there are no errors. With { strict: true }, TODOs count
 * as errors too, which is what CI should run once a system is finished.
 */

import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import { loadDesign, findTodos } from "./habitat.js";

const schema = (name) =>
  JSON.parse(readFileSync(fileURLToPath(new URL(`../schema/${name}`, import.meta.url)), "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
const checkComponent = ajv.compile(schema("component.schema.json"));
const checkTokens = ajv.compile(schema("tokens.schema.json"));

export function validate(dir, { strict = false } = {}) {
  const design = loadDesign(dir);
  const rel = (p) => relative(process.cwd(), p) || p;
  let errors = 0;
  let todos = 0;

  const report = (file, check) => {
    const lines = [];
    if (check && !check(file.data)) {
      for (const e of check.errors) lines.push(`  error    ${e.instancePath || "(top)"} ${e.message}`);
    }
    const open = findTodos(file);
    if (open.length && file.data?.status === "reviewed") {
      lines.push(`  error    marked "reviewed" but still has ${open.length} TODO(s)`);
    }
    for (const t of open) lines.push(`  todo     ${t}`);
    const fileErrors = lines.filter((l) => l.startsWith("  error")).length;
    errors += fileErrors;
    todos += open.length;
    const mark = fileErrors ? "✗" : open.length ? "…" : "✓";
    console.log(`${mark} ${rel(file.path)}`);
    lines.forEach((l) => console.log(l));
  };

  for (const e of design.errors) {
    console.log(`✗ ${rel(e.path)}\n  error    ${e.message}`);
    errors++;
  }

  if (design.principles) report(design.principles, null);
  else console.log("… DESIGN.md is missing. Principles are what stop an agent inventing its own taste.");

  const known = new Set();
  if (design.tokens) {
    report(design.tokens, checkTokens);
    for (const t of design.tokens.data?.tokens || []) known.add(t.name);
  } else {
    console.log("… tokens.md is missing.");
  }

  for (const component of design.components) {
    report(component, checkComponent);
    // Token binding: every token a component names should exist in tokens.md.
    if (known.size) {
      for (const [prop, binding] of Object.entries(component.data?.tokens || {})) {
        for (const ref of String(binding).split(/\s+/)) {
          if (ref.includes(".") && !known.has(ref)) {
            console.log(`  warning  tokens.${prop} uses "${ref}", which tokens.md does not define`);
          }
        }
      }
    }
  }

  if (!design.components.length) console.log("… no components yet in components/.");

  const failed = errors + (strict ? todos : 0);
  console.log(
    `\n${design.components.length} component(s), ${errors} error(s), ${todos} open TODO(s).` +
      (todos && !strict ? " Answer the TODOs, then set status: reviewed." : "")
  );
  return failed === 0;
}

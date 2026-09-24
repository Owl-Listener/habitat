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
const checkInsight = ajv.compile(schema("insight.schema.json"));
const checkPerson = ajv.compile(schema("person.schema.json"));

// Design files drift within months; research findings age more slowly.
function staleness(data, today, { days = 183, what = "check it still matches Figma and code" } = {}) {
  if (!data?.lastReviewed || data.status === "draft" || data.status === "retired") return [];
  const age = Math.floor((today - new Date(data.lastReviewed)) / 86_400_000);
  return age > days ? [`last reviewed ${age} days ago; ${what}`] : [];
}
const researchStaleness = (data, today) =>
  staleness(data, today, { days: 365, what: "check the finding still holds for today's users" });

// Research files are committed and read by AI tools, so they must not carry
// personal data. This catches the obvious slips; it is not a guarantee.
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/;
const PHONE = /(?:\+\d{1,3}[\s-]?)?\(?\d{3,5}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}\b/;
function personalData(file) {
  const text = readFileSync(file.path, "utf8").replace(/\d{4}-\d{2}(-\d{2})?/g, ""); // dates are not phone numbers
  const found = [];
  if (EMAIL.test(text)) found.push("an email address");
  if (PHONE.test(text)) found.push("a phone number");
  return found.map((f) => `seems to contain ${f}; research files should hold distilled, anonymised findings and link to the source`);
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

  // Index the research, so the rules that cite it can be checked.
  const insights = new Map(design.insights.map((i) => [i.data?.id, i.data]));
  const people = new Map(design.people.map((p) => [p.data?.id, p.data]));
  const prefixes = [...new Set([...insights.keys()].filter(Boolean).map((id) => id.split("-")[0]))];
  const citation = prefixes.length ? new RegExp(`\\b(?:${prefixes.join("|")})-\\d+\\b`, "g") : null;

  // What a rule's evidence says about it: missing, retired, or only a hunch.
  const evidenceWarnings = (where, ids = []) => {
    const out = [];
    for (const id of ids) {
      const i = insights.get(id);
      if (!i) out.push(`${where} cites ${id}, which has no file in research/insights/`);
      else if (i.status === "retired") out.push(`${where} cites retired ${id}${i.supersededBy ? `; see ${i.supersededBy}` : ""}`);
    }
    const found = ids.map((id) => insights.get(id)).filter(Boolean);
    if (found.length && found.every((i) => i.confidence === "hunch")) {
      out.push(`${where} rests only on a hunch (${ids.join(", ")}); worth testing with users`);
    }
    return out;
  };

  if (design.principles) {
    // Check each line's citations on their own: a principle resting on a hunch
    // should not be hidden by strong research cited elsewhere in the file.
    const warnings = citation
      ? design.principles.body.split("\n").flatMap((line, i) => {
          const ids = [...new Set(line.match(citation) || [])];
          return ids.length ? evidenceWarnings(`DESIGN.md line ${i + 1}`, ids) : [];
        })
      : [];
    report(design.principles, null, warnings);
  } else {
    console.log("… DESIGN.md is missing. Principles are what stop an agent inventing its own taste.");
  }

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

    (data?.antiPatterns || []).forEach((a, i) => warnings.push(...evidenceWarnings(`antiPatterns[${i}]`, a.evidence)));
    (data?.variants || []).forEach((v) => warnings.push(...evidenceWarnings(`variant "${v.name}"`, v.evidence)));

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

  // Research: each insight and person, their links, and a personal data check.
  const seen = new Set();
  for (const insight of design.insights) {
    const { data } = insight;
    const warnings = [...researchStaleness(data, today), ...personalData(insight)];
    if (seen.has(data?.id)) warnings.push(`id ${data.id} is used by more than one insight`);
    seen.add(data?.id);
    if (data?.supersededBy && !insights.has(data.supersededBy)) warnings.push(`superseded by ${data.supersededBy}, which has no file`);
    if (people.size) {
      for (const p of data?.people || []) {
        if (!people.has(p)) warnings.push(`people lists "${p}", which has no file in research/people/`);
      }
    }
    report(insight, checkInsight, warnings);
  }
  for (const person of design.people) {
    const { data } = person;
    const warnings = [...researchStaleness(data, today), ...personalData(person)];
    for (const id of data?.evidence || []) {
      if (!insights.has(id)) warnings.push(`evidence cites ${id}, which has no file in research/insights/`);
    }
    report(person, checkPerson, warnings);
  }

  const failed = errors + (strict ? todos : 0);
  const research = design.insights.length ? `, ${design.insights.length} insight(s)` : "";
  console.log(
    `\n${design.components.length} component(s)${research}, ${errors} error(s), ${todos} open TODO(s).` +
      (todos && !strict ? " Answer the TODOs, then set status: reviewed." : "")
  );
  return failed === 0;
}

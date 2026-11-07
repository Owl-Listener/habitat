/**
 * Moves tokens between tokens.md and the W3C design tokens format (DTCG).
 *
 * DTCG is the shared JSON format design tools and token pipelines speak:
 * Figma's variable export, Tokens Studio, Style Dictionary and others. It
 * nests tokens in groups and marks each one with "$value" and "$type":
 *
 *   { "color": { "brand": { "default": { "$type": "color", "$value": "{color.teal.600}" } } } }
 *
 * export: tokens.md -> DTCG JSON. The facts go in $value and $type, the
 *         meaning goes in $description, and the rest of habitat's judgement
 *         (tier, useFor, avoid, modes) rides along in $extensions.habitat.
 *
 * import: DTCG JSON -> tokens.md, following habitat's one rule: facts are
 *         refreshed, judgement is preserved. Values, aliases, modes and types
 *         are updated; meaning, useFor and avoid are never overwritten. New
 *         tokens arrive with their meaning as a TODO for a person to answer.
 *         The YAML is edited in place, so comments and formatting survive.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import YAML from "yaml";

// --- Types --------------------------------------------------------------

const HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const DIMENSION = /^(-?\d*\.?\d+)(px|rem)$/;

/** The DTCG $type for a token, from its own `type` or a guess from its value. */
export function dtcgType(token) {
  if (token.type) return token.type;
  const v = token.value ?? Object.values(token.modes || {})[0];
  if (typeof v === "string" && (HEX.test(v) || /^(rgb|hsl)a?\(/.test(v))) return "color";
  if (typeof v === "string" && DIMENSION.test(v)) return "dimension";
  if (typeof v === "string" && /^\d+ms$/.test(v)) return "duration";
  if (typeof v === "number") return "number";
  if (v && typeof v === "object" && "fontFamily" in v) return "typography";
  if (v && typeof v === "object" && ("blur" in v || "offsetX" in v)) return "shadow";
  return undefined;
}

// DTCG writes a colour as an object and a dimension as { value, unit }.
// habitat keeps the plain text a person would write ("#1f6f6b", "16px").
function toDtcgValue(value, type) {
  if (type === "color" && typeof value === "string" && HEX.test(value)) {
    let hex = value.slice(1);
    if (hex.length <= 4) hex = [...hex].map((c) => c + c).join("");
    const components = [0, 2, 4].map((i) => Number((parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(4)));
    const alpha = hex.length === 8 ? Number((parseInt(hex.slice(6, 8), 16) / 255).toFixed(4)) : undefined;
    return { colorSpace: "srgb", components, ...(alpha !== undefined && { alpha }), hex: `#${hex.slice(0, 6)}` };
  }
  if (type === "dimension" && typeof value === "string" && DIMENSION.test(value)) {
    const [, n, unit] = value.match(DIMENSION);
    return { value: Number(n), unit };
  }
  return value;
}

function fromDtcgValue(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    if ("colorSpace" in value || "components" in value) {
      if (value.hex) {
        const alpha = value.alpha !== undefined && value.alpha < 1 ? Math.round(value.alpha * 255).toString(16).padStart(2, "0") : "";
        return value.hex.toLowerCase() + alpha;
      }
      if (value.colorSpace === "srgb" && Array.isArray(value.components)) {
        const hex = value.components.map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("");
        return `#${hex}`;
      }
      return JSON.stringify(value); // another colour space: keep it, a person can tidy it
    }
    if ("value" in value && "unit" in value) return `${value.value}${value.unit}`;
  }
  return value;
}

const aliasOf = (value) => (typeof value === "string" && /^\{[^}]+\}$/.test(value) ? value.slice(1, -1) : null);

// --- Export -------------------------------------------------------------

export function toDtcg(tokens) {
  const root = {};
  for (const t of tokens) {
    const type = dtcgType(t);
    const habitat = Object.fromEntries(
      Object.entries({ tier: t.tier, useFor: t.useFor, avoid: t.avoid, modes: t.modes, figma: t.figma }).filter(([, v]) => v !== undefined)
    );
    const entry = {
      ...(type && { $type: type }),
      $value: t.aliasOf ? `{${t.aliasOf}}` : toDtcgValue(t.value, type),
      ...(t.meaning && { $description: t.meaning }),
      ...(t.replacedBy && { $deprecated: `Use {${t.replacedBy}} instead.` }),
      ...(Object.keys(habitat).length && { $extensions: { habitat } }),
    };
    // Put the token into nested groups: color.brand.default -> color > brand > default.
    const path = t.name.split(".");
    let group = root;
    for (const part of path.slice(0, -1)) {
      group[part] ??= {};
      if ("$value" in group[part]) throw new Error(`${t.name}: "${part}" is both a token and a group; DTCG cannot hold both`);
      group = group[part];
    }
    group[path.at(-1)] = entry;
  }
  return root;
}

// --- Import -------------------------------------------------------------

/** Flatten a DTCG file into a list of { name, type, value | aliasOf, description, ... }. */
export function fromDtcg(json) {
  const out = [];
  const walk = (node, path, inheritedType) => {
    if (!node || typeof node !== "object") return;
    const type = node.$type ?? inheritedType; // a group's $type applies to everything in it
    if ("$value" in node) {
      const alias = aliasOf(node.$value);
      out.push({
        name: path.join("."),
        ...(type && { type }),
        ...(alias ? { aliasOf: alias } : { value: fromDtcgValue(node.$value) }),
        ...(node.$description && { description: node.$description }),
        ...(node.$deprecated && { deprecated: node.$deprecated }),
        ...(node.$extensions?.habitat && { habitat: node.$extensions.habitat }),
      });
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (!key.startsWith("$")) walk(child, [...path, key], type);
    }
  };
  walk(json, [], undefined);
  return out;
}

/**
 * Several files can be passed, one per mode (light.json, dark.json), the way
 * Figma exports a collection with modes. The first file gives each token's
 * default value; every file adds a mode named after it.
 */
export function readDtcgFiles(paths) {
  const sets = paths.map((p) => ({ mode: basename(p).replace(/(\.tokens)?\.json$/i, ""), tokens: fromDtcg(JSON.parse(readFileSync(p, "utf8"))) }));
  const merged = new Map();
  for (const { mode, tokens } of sets) {
    for (const t of tokens) {
      const existing = merged.get(t.name);
      if (!existing) merged.set(t.name, { ...t, ...(sets.length > 1 && t.value !== undefined && { modes: { [mode]: t.value } }) });
      else if (sets.length > 1 && t.value !== undefined) existing.modes = { ...existing.modes, [mode]: t.value };
    }
  }
  return [...merged.values()];
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Merge imported tokens into the text of a tokens.md file. Returns the new
 * text and a list of changes, grouped the way /habitat-refresh reports them.
 */
export function mergeIntoTokensFile(text, imported) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error("tokens.md has no YAML front matter (the block between the two --- lines)");
  const doc = YAML.parseDocument(match[1]);
  let seq = doc.get("tokens");
  if (!seq) {
    doc.set("tokens", doc.createNode([]));
    seq = doc.get("tokens");
  }
  const changes = { updated: [], added: [], judgement: [], missing: [] };
  const byName = new Map(seq.items.map((item) => [item.get("name"), item]));

  for (const t of imported) {
    const item = byName.get(t.name);
    if (!item) {
      // New token: the facts, plus questions for a person. A description from
      // the source is a starting point, not an answer, unless it came from
      // another habitat file, where a person already wrote it.
      const h = t.habitat || {};
      const meaning = h.tier !== undefined || h.useFor !== undefined ? t.description : null;
      const node = {
        name: t.name,
        ...(h.tier && { tier: h.tier }),
        ...(t.type && { type: t.type }),
        ...(t.aliasOf ? { aliasOf: t.aliasOf } : { value: t.value }),
        ...(t.modes && { modes: t.modes }),
        ...(h.figma && { figma: h.figma }),
        meaning: meaning ?? (t.description ? `TODO confirm: ${t.description}` : "TODO: what is this for?"),
        ...(meaning && h.useFor && { useFor: h.useFor }),
        ...(meaning && h.avoid && { avoid: h.avoid }),
      };
      seq.add(doc.createNode(node));
      changes.added.push(t.name);
      continue;
    }
    // Existing token: refresh the facts only.
    const before = item.toJSON();
    const facts = [];
    if (t.aliasOf) {
      if (before.aliasOf !== t.aliasOf) {
        item.set("aliasOf", t.aliasOf);
        item.delete("value");
        facts.push(`alias ${before.aliasOf ?? before.value} → {${t.aliasOf}}`);
      }
    } else if (!same(before.value, t.value)) {
      item.set("value", doc.createNode(t.value));
      item.delete("aliasOf");
      facts.push(`value ${JSON.stringify(before.value ?? `{${before.aliasOf}}`)} → ${JSON.stringify(t.value)}`);
      if (before.useFor || before.avoid) changes.judgement.push(`${t.name} changed value; do its useFor and avoid still hold?`);
    }
    if (t.modes && !same(before.modes, t.modes)) {
      item.set("modes", doc.createNode(t.modes));
      facts.push("modes");
    }
    if (t.type && before.type && before.type !== t.type) {
      item.set("type", t.type);
      facts.push(`type ${before.type} → ${t.type}`);
    }
    if (facts.length) changes.updated.push(`${t.name}: ${facts.join(", ")}`);
  }

  const importedNames = new Set(imported.map((t) => t.name));
  for (const name of byName.keys()) {
    if (!importedNames.has(name)) changes.missing.push(name);
  }
  const front = doc.toString({ lineWidth: 100, singleQuote: true }).replace(/\n$/, "");
  return { text: `---\n${front}\n---\n${match[2]}`, changes };
}

export function printTokenChanges(changes, { dryRun }) {
  const section = (title, items) => {
    if (!items.length) return;
    console.log(`\n${title}`);
    items.forEach((i) => console.log(`  ${i}`));
  };
  section("Updated (facts only)", changes.updated);
  section("Added, with meaning left for a person", changes.added);
  section("Decisions needed", changes.judgement);
  section("In tokens.md but not in the import (removed upstream? nothing was deleted)", changes.missing);
  console.log(
    `\n${changes.updated.length} updated, ${changes.added.length} added, ${changes.missing.length} not in the import.` +
      (dryRun ? " Dry run: tokens.md was not changed." : "")
  );
}

export function importTokens(tokensPath, files, { dryRun = false } = {}) {
  const { text, changes } = mergeIntoTokensFile(readFileSync(tokensPath, "utf8"), readDtcgFiles(files));
  const changed = changes.updated.length || changes.added.length;
  if (!dryRun && changed) writeFileSync(tokensPath, text);
  return changes;
}

/**
 * Does the design system on paper match the one in code?
 *
 * When Figma and code drift apart, AI confidently builds interfaces that
 * look right from components that don't exist. This checks the code half:
 *
 *   - every contract links to an implementation that exists
 *   - every prop and option in the contract appears in that implementation
 *   - every component in the code folder has a contract
 *
 * The Figma half (does every Figma component have a contract, and does it
 * still match?) needs the Figma MCP server, so it lives in /habitat-refresh.
 *
 * For React code (.tsx, .jsx, .ts, .js) it parses the component and reads
 * its declared props, their allowed values and defaults (see ast.js), so it
 * also finds the reverse: props and values the code has that the contract
 * never mentions. For other files it falls back to searching the text.
 * Prop and option findings are "check" items for a person; only a missing
 * file is an error.
 */

import { existsSync, readFileSync } from "node:fs";
import { basename, extname, relative } from "node:path";
import { collectFiles, implementationPath } from "./check.js";
import { HTML_ATTRIBUTES, readComponentApi } from "./ast.js";

// Props every React component passes through, which no contract needs to list.
const PLUMBING = new Set(["className", "style", "ref", "key", "id", "as", "rest", "props"]);

// For files the parser cannot read (Vue, Svelte): look for each name in the text.
function textParity(name, props, codeNameOf, source, path) {
  const out = [];
  for (const prop of props) {
    const codeName = codeNameOf(prop);
    if (!new RegExp(`\\b${codeName}\\b`).test(source)) {
      out.push(`${name}: prop "${codeName}" not found in ${path} (fine if inherited, e.g. from HTML attributes)`);
      continue;
    }
    for (const option of prop.options || []) {
      if (typeof option === "string" && !new RegExp(`["'\`]${option}["'\`]`).test(source)) {
        out.push(`${name}: option "${option}" of "${codeName}" not found in ${path}`);
      }
    }
  }
  return out;
}

const COMPONENT_FILE = /^[A-Z][A-Za-z0-9]*\.(tsx|jsx|vue|svelte)$/;

export function parity(design, { codePaths = [] } = {}) {
  const rel = (p) => relative(process.cwd(), p) || p;
  const errors = [];
  const checks = [];
  const linked = new Set();
  const unlinked = [];

  for (const component of design.components) {
    const { data } = component;
    const name = data?.name?.canonical;
    if (data?.status === "deprecated") continue;
    const impl = data?.codeConnect?.implementation;
    if (!impl) {
      unlinked.push(name);
      continue;
    }
    const path = implementationPath(component);
    if (!path) {
      checks.push(`${name}: implementation "${impl}" is a package import; not checked`);
      continue;
    }
    if (!existsSync(path)) {
      errors.push(`${name}: implementation ${rel(path)} does not exist`);
      continue;
    }
    linked.add(path);
    const source = readFileSync(path, "utf8");
    const api = readComponentApi(source, path);
    const props = data.props || [];
    const codeNameOf = (prop) => data.codeConnect.propMap?.[prop.name] ?? prop.name;
    if (!api) {
      checks.push(...textParity(name, props, codeNameOf, source, rel(path)));
      continue;
    }
    // Read from the code's own types: compare names, allowed values and defaults.
    for (const prop of props) {
      const codeName = codeNameOf(prop);
      const inCode = api.props.get(codeName);
      if (!inCode) {
        if (!(api.inheritsHtml && HTML_ATTRIBUTES.has(codeName))) {
          checks.push(`${name}: prop "${codeName}" is in the contract but ${rel(path)} does not declare or take it`);
        }
        continue;
      }
      const documented = (prop.options || []).filter((o) => typeof o === "string");
      if (inCode.options && documented.length) {
        for (const o of documented.filter((o) => !inCode.options.includes(o))) {
          checks.push(`${name}: option "${o}" of "${codeName}" is in the contract but not in the code`);
        }
        for (const o of inCode.options.filter((o) => !documented.includes(o))) {
          checks.push(`${name}: the code allows "${o}" for "${codeName}", which the contract does not document`);
        }
      }
      if (prop.default !== undefined && inCode.default !== undefined && String(prop.default) !== String(inCode.default)) {
        checks.push(`${name}: "${codeName}" defaults to "${inCode.default}" in code but "${prop.default}" in the contract`);
      }
    }
    const documentedNames = new Set(props.map(codeNameOf));
    for (const codeName of api.props.keys()) {
      if (!documentedNames.has(codeName) && !PLUMBING.has(codeName)) {
        checks.push(`${name}: the code takes "${codeName}", which the contract does not document`);
      }
    }
  }

  // Components in code with no contract: what an agent can find but not understand.
  const names = new Set(design.components.flatMap((c) => [c.data?.name?.canonical, ...(c.data?.name?.aliases || [])]).filter(Boolean));
  const orphans = collectFiles(codePaths)
    .filter((f) => COMPONENT_FILE.test(basename(f.path)) && !linked.has(f.path))
    .filter((f) => !names.has(basename(f.path, extname(f.path))))
    .map((f) => rel(f.path));

  return { errors, checks, unlinked, orphans };
}

export function printParity(result, { codePaths }) {
  const { errors, checks, unlinked, orphans } = result;
  const section = (title, items, mark) => {
    if (!items.length) return;
    console.log(`\n${title}`);
    items.forEach((i) => console.log(`  ${mark} ${i}`));
  };
  section("Missing implementations", errors, "✗");
  section("To check by hand", checks, "…");
  section("Contracts with no link to code (Figma only?)", unlinked, "…");
  if (codePaths.length) section("Components in code with no contract", orphans, "…");
  else console.log("\n(Pass --code <folder> to also find components in code that have no contract.)");
  console.log(
    `\n${errors.length} missing, ${checks.length} to check, ${unlinked.length} not linked` +
      (codePaths.length ? `, ${orphans.length} without a contract.` : ".")
  );
  return errors.length === 0;
}

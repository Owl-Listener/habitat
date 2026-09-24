/**
 * Does the design system on paper match the one in code?
 *
 * Buzz Usborne's finding at Help Scout: without parity between Figma and
 * code, AI "confidently produc[es] interfaces that appeared correct but were
 * built from invented components". This checks the code half of that:
 *
 *   - every contract links to an implementation that exists
 *   - every prop and option in the contract appears in that implementation
 *   - every component in the code folder has a contract
 *
 * The Figma half (does every Figma component have a contract, and does it
 * still match?) needs the Figma MCP server, so it lives in /habitat-refresh.
 *
 * These are text checks, not a compiler: a prop inherited from HTML
 * attributes will not appear by name. So prop and option findings are
 * "check" items for a person, and only a missing file is an error.
 */

import { existsSync, readFileSync } from "node:fs";
import { basename, extname, relative } from "node:path";
import { collectFiles, implementationPath } from "./check.js";

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
    for (const prop of data.props || []) {
      const codeName = data.codeConnect.propMap?.[prop.name] ?? prop.name;
      if (!new RegExp(`\\b${codeName}\\b`).test(source)) {
        checks.push(`${name}: prop "${codeName}" not found in ${rel(path)} (fine if inherited, e.g. from HTML attributes)`);
        continue;
      }
      for (const option of prop.options || []) {
        if (typeof option === "string" && !new RegExp(`["'\`]${option}["'\`]`).test(source)) {
          checks.push(`${name}: option "${option}" of "${codeName}" not found in ${rel(path)}`);
        }
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

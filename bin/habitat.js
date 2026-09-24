#!/usr/bin/env node
/**
 * habitat command line.
 *
 *   habitat init [dir]                 scaffold a design folder (default: ./design),
 *                                      install the skills and the agent rules
 *   habitat validate [dir] [--strict]  check the folder, list open TODOs
 *   habitat check <paths...> [--design dir]
 *                                      check UI code against the system
 *   habitat parity [dir] [--code path] check the contracts match the code
 *   habitat serve [dir]                serve the folder to an agent over MCP
 *
 * Run it without installing anything:
 *   npx github:Owl-Listener/habitat init
 */

import { appendFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const kit = fileURLToPath(new URL("..", import.meta.url));
const [command, ...args] = process.argv.slice(2);

// Split the arguments into flags (--strict, --code path) and plain paths.
const flags = {};
const paths = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--strict") flags.strict = true;
  else if (args[i].startsWith("--")) flags[args[i].slice(2)] = args[++i];
  else paths.push(args[i]);
}
const dir = resolve((command === "check" ? flags.design : paths[0]) || "design");
const shortDir = relative(process.cwd(), dir) || ".";
const SKILLS = ["habitat-extract", "habitat-research", "habitat-review", "habitat-refresh"];

// A mistyped path should say so plainly, not crash with a stack trace.
function mustExist(...ps) {
  for (const p of ps) {
    if (!existsSync(p)) {
      console.log(`habitat: ${p} not found`);
      process.exit(1);
    }
  }
}

// Copy a file only if it is not already there, so re-running init never
// overwrites work someone has already done.
function place(from, to) {
  if (existsSync(to)) {
    console.log(`  kept     ${to} (already exists)`);
    return;
  }
  mkdirSync(resolve(to, ".."), { recursive: true });
  cpSync(join(kit, from), to);
  console.log(`  created  ${to}`);
}

// The always-on rules: instructions an agent reads before every task, so it
// consults the design system without being asked. They go in a marked block,
// so re-running init never duplicates them and never touches the rest of the file.
const START = "<!-- habitat:start -->";
const END = "<!-- habitat:end -->";

function addRules(to, { header = "", whenMissing } = {}) {
  const rules = readFileSync(join(kit, "templates/agent-rules.md"), "utf8").replaceAll("{{DIR}}", shortDir);
  const block = `${START}\n${rules.trim()}\n${END}\n`;
  if (!existsSync(to)) {
    mkdirSync(resolve(to, ".."), { recursive: true });
    writeFileSync(to, whenMissing ?? header + block);
    console.log(`  created  ${to}`);
  } else if (readFileSync(to, "utf8").includes(START)) {
    console.log(`  kept     ${to} (habitat rules already there)`);
  } else {
    appendFileSync(to, `\n${block}`);
    console.log(`  added    habitat rules to ${to}`);
  }
}

switch (command) {
  case "init": {
    console.log(`Setting up ${shortDir}/\n`);
    place("templates/DESIGN.md", join(dir, "DESIGN.md"));
    place("templates/tokens.md", join(dir, "tokens.md"));
    place("templates/component.md", join(dir, "components", "_TEMPLATE.md"));
    place("templates/eval.md", join(dir, "evals", "_TEMPLATE.md"));
    place("templates/insight.md", join(dir, "research", "insights", "_TEMPLATE.md"));
    place("templates/person.md", join(dir, "research", "people", "_TEMPLATE.md"));
    for (const skill of SKILLS) place(`skills/${skill}/SKILL.md`, resolve(`.claude/skills/${skill}/SKILL.md`));
    // AGENTS.md is read by Cursor, Codex and others. Claude Code reads
    // CLAUDE.md, which can pull AGENTS.md in with an @ import.
    addRules(resolve("AGENTS.md"));
    const claude = resolve("CLAUDE.md");
    if (existsSync(claude) && readFileSync(claude, "utf8").includes("@AGENTS.md")) {
      console.log(`  kept     ${claude} (already imports AGENTS.md)`);
    } else {
      addRules(claude, { whenMissing: "@AGENTS.md\n" });
    }
    addRules(resolve(".cursor/rules/habitat.mdc"), {
      header: "---\ndescription: How to use this project's design system\nalwaysApply: true\n---\n\n",
    });
    console.log(`
Next:
  1. Connect the Figma MCP server to your AI tool (see the habitat README).
  2. In Claude Code, run /habitat-extract and give it your Figma file link.
     Using another AI? Paste the prompts from:
     https://github.com/Owl-Listener/habitat/tree/main/prompts
  3. Check your progress:  npx github:Owl-Listener/habitat validate ${shortDir}
  4. Serve it to your agent:
     claude mcp add habitat -- npx -y github:Owl-Listener/habitat serve ${shortDir}
  5. Have user research? /habitat-research turns it into insights your rules can cite.
  6. Later: /habitat-review to critique a screen, /habitat-refresh when Figma changes.`);
    break;
  }
  case "validate": {
    const { validate } = await import("../lib/validate.js");
    process.exit(validate(dir, { strict: flags.strict }) ? 0 : 1);
  }
  case "check": {
    if (!paths.length) {
      console.log("Usage: habitat check <files or folders...> [--design dir]");
      process.exit(1);
    }
    mustExist(dir, ...paths);
    const { loadDesign } = await import("../lib/habitat.js");
    const { checkCode, collectFiles } = await import("../lib/check.js");
    const files = collectFiles(paths);
    const findings = checkCode(loadDesign(dir), files);
    for (const f of findings) console.log(`${relative(process.cwd(), f.path)}:${f.line}  ${f.rule.padEnd(13)} ${f.message}`);
    const counts = {};
    for (const f of findings) counts[f.rule] = (counts[f.rule] || 0) + 1;
    const byRule = Object.entries(counts).map(([rule, n]) => `${rule} ${n}`);
    console.log(`\n${files.length} file(s) checked, ${findings.length} problem(s)${byRule.length ? ` (${byRule.join(", ")})` : ""}.`);
    process.exit(findings.length ? 1 : 0);
  }
  case "parity": {
    const { loadDesign } = await import("../lib/habitat.js");
    const { parity, printParity } = await import("../lib/parity.js");
    const codePaths = flags.code ? [flags.code] : [];
    mustExist(dir, ...codePaths);
    process.exit(printParity(parity(loadDesign(dir), { codePaths }), { codePaths }) ? 0 : 1);
  }
  case "serve": {
    const { serve } = await import("../mcp-server/index.js");
    await serve(dir);
    break;
  }
  default:
    console.log(`habitat: make your design system legible to AI agents

  habitat init [dir]                        scaffold a design folder (default ./design)
  habitat validate [dir] [--strict]         check it and list open TODOs
  habitat check <paths...> [--design dir]   check UI code against the system
  habitat parity [dir] [--code path]        check the contracts match the code
  habitat serve [dir]                       serve it to an agent over MCP`);
    process.exit(command ? 1 : 0);
}

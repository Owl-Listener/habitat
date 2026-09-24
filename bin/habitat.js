#!/usr/bin/env node
/**
 * habitat command line.
 *
 *   habitat init [dir]              scaffold a design folder (default: ./design)
 *                                   and install the Claude Code skill
 *   habitat validate [dir] [--strict]   check the folder, list open TODOs
 *   habitat serve [dir]             serve the folder to an agent over MCP
 *
 * Run it without installing anything:
 *   npx github:Owl-Listener/habitat init
 */

import { appendFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const kit = fileURLToPath(new URL("..", import.meta.url));
const [command, ...rest] = process.argv.slice(2);
const strict = rest.includes("--strict");
const dir = resolve(rest.find((a) => !a.startsWith("--")) || "design");
const shortDir = relative(process.cwd(), dir) || ".";

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
    place("skills/habitat-extract/SKILL.md", resolve(".claude/skills/habitat-extract/SKILL.md"));
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
     claude mcp add habitat -- npx -y github:Owl-Listener/habitat serve ${shortDir}`);
    break;
  }
  case "validate": {
    const { validate } = await import("../lib/validate.js");
    process.exit(validate(dir, { strict }) ? 0 : 1);
  }
  case "serve": {
    const { serve } = await import("../mcp-server/index.js");
    await serve(dir);
    break;
  }
  default:
    console.log(`habitat: make your design system legible to AI agents

  habitat init [dir]                  scaffold a design folder (default ./design)
  habitat validate [dir] [--strict]   check it and list open TODOs
  habitat serve [dir]                 serve it to an agent over MCP`);
    process.exit(command ? 1 : 0);
}

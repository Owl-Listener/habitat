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

import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const kit = fileURLToPath(new URL("..", import.meta.url));
const [command, ...rest] = process.argv.slice(2);
const strict = rest.includes("--strict");
const dir = resolve(rest.find((a) => !a.startsWith("--")) || "design");

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

switch (command) {
  case "init": {
    console.log(`Setting up ${dir}\n`);
    place("templates/DESIGN.md", join(dir, "DESIGN.md"));
    place("templates/tokens.md", join(dir, "tokens.md"));
    place("templates/component.md", join(dir, "components", "_TEMPLATE.md"));
    place("skills/habitat-extract/SKILL.md", resolve(".claude/skills/habitat-extract/SKILL.md"));
    console.log(`
Next:
  1. Connect the Figma MCP server to your AI tool (see the habitat README).
  2. In Claude Code, run /habitat-extract and give it your Figma file link.
     Using another AI? Paste the prompts from:
     https://github.com/Owl-Listener/habitat/tree/main/prompts
  3. Check your progress:  npx github:Owl-Listener/habitat validate ${dir}
  4. Serve it to your agent:
     claude mcp add habitat -- npx -y github:Owl-Listener/habitat serve ${dir}`);
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

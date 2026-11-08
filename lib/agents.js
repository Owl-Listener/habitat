/**
 * The coding agents habitat knows how to set up, and where each one looks.
 *
 * Every agent gets the same three things, in its own place:
 *
 *   rules   the always-on instructions it reads before every task.
 *           AGENTS.md is the shared file most agents read (Codex, Cursor,
 *           Copilot, Gemini CLI, Windsurf and others), so it is always
 *           written; agents with a file of their own get the rules there too.
 *   skills  the four guided processes, as Agent Skills (a folder with a
 *           SKILL.md). Claude Code reads .claude/skills; Codex, Cursor,
 *           Copilot and Gemini CLI share .agents/skills.
 *   mcp     how to connect the habitat MCP server, so the agent can look up
 *           components, tokens, journeys and research while it works.
 *
 * Agents change where they look more often than anything else here, so this
 * is the one file to update when one moves.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const PACKAGE = "@owl-listener/habitat";

export const AGENTS = {
  claude: {
    name: "Claude Code",
    rules: { file: "CLAUDE.md", importsAgentsMd: true },
    skills: ".claude/skills",
    mcp: { kind: "json", file: ".mcp.json", key: "mcpServers", entry: (dir) => ({ command: "npx", args: ["-y", PACKAGE, "serve", dir] }), path: "relative" },
    command: (dir) => `claude mcp add habitat -- npx -y ${PACKAGE} serve ${dir}`,
  },
  cursor: {
    name: "Cursor",
    rules: { file: ".cursor/rules/habitat.mdc", header: "---\ndescription: How to use this project's design system\nalwaysApply: true\n---\n\n" },
    skills: ".agents/skills",
    mcp: { kind: "json", file: ".cursor/mcp.json", key: "mcpServers", entry: (dir) => ({ command: "npx", args: ["-y", PACKAGE, "serve", dir] }), path: "workspace" },
  },
  copilot: {
    name: "GitHub Copilot (VS Code)",
    rules: { file: ".github/copilot-instructions.md" },
    skills: ".agents/skills",
    mcp: { kind: "json", file: ".vscode/mcp.json", key: "servers", entry: (dir) => ({ type: "stdio", command: "npx", args: ["-y", PACKAGE, "serve", dir] }), path: "workspace" },
  },
  codex: {
    name: "OpenAI Codex",
    rules: null, // reads AGENTS.md
    skills: ".agents/skills",
    mcp: { kind: "global", where: "~/.codex/config.toml", path: "absolute" },
    command: (dir) => `codex mcp add habitat -- npx -y ${PACKAGE} serve ${dir}`,
    toml: (dir) => `[mcp_servers.habitat]\ncommand = "npx"\nargs = ["-y", "${PACKAGE}", "serve", "${dir}"]`,
  },
  gemini: {
    name: "Gemini CLI",
    rules: { file: "GEMINI.md" },
    skills: ".agents/skills",
    mcp: { kind: "json", file: ".gemini/settings.json", key: "mcpServers", entry: (dir) => ({ command: "npx", args: ["-y", PACKAGE, "serve", dir] }), path: "absolute" },
  },
  windsurf: {
    name: "Windsurf",
    rules: null, // reads AGENTS.md
    skills: null, // uses the prompts
    mcp: { kind: "global", where: "~/.codeium/windsurf/mcp_config.json", path: "absolute" },
  },
};

export const AGENT_IDS = Object.keys(AGENTS);

/** Parse "--agents claude,cursor" into a list, or every agent when it is absent. */
export function parseAgents(value) {
  if (!value || value === "all") return AGENT_IDS;
  const ids = value.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const unknown = ids.filter((id) => !AGENTS[id]);
  if (unknown.length) throw new Error(`unknown agent ${unknown.join(", ")}; choose from ${AGENT_IDS.join(", ")}`);
  return ids;
}

/**
 * The design folder as each agent's config needs it. Project files for
 * Cursor and VS Code can say ${workspaceFolder}, so they still work when the
 * project moves or a teammate checks it out somewhere else. Global configs
 * have no project, so they need the full path.
 */
export function designPathFor(agent, { absolute, relative }) {
  const how = AGENTS[agent].mcp.path;
  if (how === "workspace") return `\${workspaceFolder}/${relative}`;
  if (how === "relative") return relative;
  return absolute;
}

/** What to paste, or run, to connect one agent. */
export function connectInstructions(agent, paths) {
  const a = AGENTS[agent];
  const dir = designPathFor(agent, paths);
  const lines = [`${a.name}`];
  if (a.command) lines.push(`  Run:\n    ${a.command(dir)}`);
  if (a.mcp.kind === "json") {
    const snippet = JSON.stringify({ [a.mcp.key]: { habitat: a.mcp.entry(dir) } }, null, 2).replace(/^/gm, "    ");
    lines.push(`  ${a.command ? "Or add" : "Add"} this to ${a.mcp.file} (or run habitat connect ${agent} --write):\n${snippet}`);
  }
  if (a.toml) lines.push(`  Or add this to ${a.mcp.where}:\n${a.toml(dir).replace(/^/gm, "    ")}`);
  if (a.mcp.kind === "global" && !a.toml) {
    const snippet = JSON.stringify({ mcpServers: { habitat: { command: "npx", args: ["-y", PACKAGE, "serve", dir] } } }, null, 2).replace(/^/gm, "    ");
    lines.push(`  Add this to ${a.mcp.where} (it applies to every project, so the path is the full one):\n${snippet}`);
  }
  return lines.join("\n");
}

/**
 * Add habitat to an agent's project MCP file, keeping everything else in it.
 * Returns a message. Refuses, rather than guesses, when the file is not
 * plain JSON (VS Code allows comments, which a rewrite would lose).
 */
export function writeMcpConfig(agent, paths, cwd = process.cwd()) {
  const a = AGENTS[agent];
  if (a.mcp.kind !== "json") return { ok: false, message: `${a.name} keeps its MCP settings outside the project (${a.mcp.where}), so add it there by hand.` };
  const file = resolve(cwd, a.mcp.file);
  let config = {};
  if (existsSync(file)) {
    try {
      config = JSON.parse(readFileSync(file, "utf8"));
    } catch {
      return { ok: false, message: `${a.mcp.file} is not plain JSON (it may have comments), so it was left alone. Add the snippet by hand.` };
    }
  }
  if (config[a.mcp.key]?.habitat) return { ok: true, message: `kept     ${a.mcp.file} (habitat already connected)` };
  config[a.mcp.key] = { ...config[a.mcp.key], habitat: a.mcp.entry(designPathFor(agent, paths)) };
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(config, null, 2) + "\n");
  return { ok: true, message: `added    habitat to ${a.mcp.file}` };
}

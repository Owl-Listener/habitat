#!/usr/bin/env node
/**
 * habitat MCP server
 *
 * Serves the design system to a coding agent over MCP (stdio), so the agent
 * queries the system instead of guessing. Exposes four tools:
 *   - list_components : names + purposes of every component
 *   - get_component   : the full contract for one component
 *   - get_tokens      : the design tokens
 *   - get_rules       : every anti-pattern and relationship, aggregated
 *
 * Targets @modelcontextprotocol/sdk. If the SDK's API has shifted, the tool
 * registrations below are the only thing that needs adjusting.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const componentsDir = join(root, "components");
const tokensPath = join(root, "tokens", "tokens.json");

function loadComponents() {
  const out = {};
  if (!existsSync(componentsDir)) return out;
  for (const entry of readdirSync(componentsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const metaPath = join(componentsDir, entry.name, `${entry.name}.meta.json`);
    if (existsSync(metaPath)) {
      try {
        const meta = JSON.parse(readFileSync(metaPath, "utf8"));
        const key = meta?.name?.canonical || entry.name;
        out[key] = meta;
      } catch (err) {
        process.stderr.write(`habitat: failed to parse ${metaPath}: ${err}\n`);
      }
    }
  }
  return out;
}

function loadTokens() {
  return existsSync(tokensPath)
    ? JSON.parse(readFileSync(tokensPath, "utf8"))
    : {};
}

const server = new McpServer({ name: "habitat", version: "0.1.0" });

server.tool(
  "list_components",
  "List every component in the system with its canonical name and purpose.",
  {},
  async () => {
    const components = loadComponents();
    const list = Object.values(components).map((c) => ({
      name: c.name?.canonical,
      purpose: c.purpose,
    }));
    return { content: [{ type: "text", text: JSON.stringify(list, null, 2) }] };
  }
);

server.tool(
  "get_component",
  "Get the full agent-readable contract for one component by name.",
  { name: z.string().describe("Canonical component name, e.g. 'Button'.") },
  async ({ name }) => {
    const components = loadComponents();
    const match =
      components[name] ||
      Object.values(components).find(
        (c) =>
          c.name?.canonical?.toLowerCase() === name.toLowerCase() ||
          (c.name?.aliases || []).some(
            (a) => a.toLowerCase() === name.toLowerCase()
          )
      );
    if (!match) {
      return {
        content: [
          {
            type: "text",
            text: `No component named "${name}". Try list_components.`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(match, null, 2) }],
    };
  }
);

server.tool(
  "get_tokens",
  "Get the design tokens. Every component property is bound to one of these.",
  {},
  async () => {
    return {
      content: [{ type: "text", text: JSON.stringify(loadTokens(), null, 2) }],
    };
  }
);

server.tool(
  "get_rules",
  "Get every anti-pattern and relationship across the whole system, so the agent knows what to never do and how components fit together.",
  {},
  async () => {
    const components = loadComponents();
    const rules = Object.values(components).map((c) => ({
      component: c.name?.canonical,
      antiPatterns: c.antiPatterns || [],
      relationships: c.relationships || {},
    }));
    return { content: [{ type: "text", text: JSON.stringify(rules, null, 2) }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write("habitat MCP server running on stdio\n");

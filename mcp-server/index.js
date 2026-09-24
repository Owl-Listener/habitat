/**
 * habitat MCP server
 *
 * Serves a design folder to a coding agent over MCP (stdio), so the agent
 * reads your system instead of guessing at it. Five tools:
 *   - get_principles  : DESIGN.md, the product-wide rules and taste
 *   - list_components : names + purposes of every component
 *   - get_component   : the full contract and notes for one component
 *   - get_tokens      : the tokens, with what each one means
 *   - get_rules       : every anti-pattern across the system, in one place
 *
 * Files are re-read on every call, so edits show up without a restart.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadDesign, findComponent } from "../lib/habitat.js";

const text = (value) => ({
  content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
});

export async function serve(dir) {
  const server = new McpServer({ name: "habitat", version: "0.2.0" });

  server.registerTool(
    "get_principles",
    {
      description:
        "Read this first, before building any UI. Returns DESIGN.md: the product's design principles, how it uses colour, layout and language, and the system-wide rules the agent must follow.",
    },
    async () => {
      const { principles } = loadDesign(dir);
      return text(principles ? principles.body : "No DESIGN.md in this design folder yet.");
    }
  );

  server.registerTool(
    "list_components",
    {
      description:
        "List every component in the system with its canonical name, purpose and status. Build only from these. If a screen needs something that is not here, tell the user about the gap; never invent a lookalike or hand-code a replacement.",
    },
    async () =>
      text(
        loadDesign(dir).components.map(({ data }) => ({
          name: data?.name?.canonical,
          purpose: data?.purpose,
          status: data?.status,
          ...(data?.replacedBy && { replacedBy: data.replacedBy }),
        }))
      )
  );

  server.registerTool(
    "get_component",
    {
      description:
        "Get the full contract for one component: when to use each variant, states, token bindings, accessibility, and the anti-patterns it must never break. Also returns the designer's notes.",
      inputSchema: { name: z.string().describe("Canonical name or alias, e.g. 'Button' or 'CTA'.") },
    },
    async ({ name }) => {
      const match = findComponent(loadDesign(dir), name);
      if (!match) {
        return {
          ...text(`No component named "${name}". Check list_components; if nothing fits, report the gap to the user instead of inventing one.`),
          isError: true,
        };
      }
      const { data, body } = match;
      const warning =
        data.status === "deprecated"
          ? { warning: `${data.name.canonical} is deprecated. Do not use it in new work${data.replacedBy ? `; use ${data.replacedBy} instead` : ""}.` }
          : {};
      return text({ ...warning, ...data, notes: body });
    }
  );

  server.registerTool(
    "get_tokens",
    { description: "Get the design tokens with what each one means, where to use it, and where not to. Bind to these; never use raw values." },
    async () => {
      const { tokens } = loadDesign(dir);
      return text(tokens ? { tokens: tokens.data.tokens, notes: tokens.body } : "No tokens.md in this design folder yet.");
    }
  );

  server.registerTool(
    "get_rules",
    { description: "Get every anti-pattern and relationship across the whole system, so the agent knows what never to do and how components fit together." },
    async () =>
      text(
        loadDesign(dir).components.map(({ data }) => ({
          component: data?.name?.canonical,
          antiPatterns: data?.antiPatterns || [],
          relationships: data?.relationships || {},
        }))
      )
  );

  await server.connect(new StdioServerTransport());
  process.stderr.write(`habitat MCP server serving ${loadDesign(dir).root}\n`);
}

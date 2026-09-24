// Tests for the habitat command line. Run with: npm test
//
// Each test runs the real command in a throwaway folder, the way a person
// would, and checks what it prints and whether it succeeds.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const kit = fileURLToPath(new URL("..", import.meta.url));
const cli = join(kit, "bin/habitat.js");
const example = join(kit, "examples/design");

function habitat(args, cwd = kit) {
  const r = spawnSync("node", [cli, ...args], { cwd, encoding: "utf8" });
  return { ok: r.status === 0, out: r.stdout + r.stderr };
}
const scratch = () => mkdtempSync(join(tmpdir(), "habitat-"));

test("the worked example is complete and valid", () => {
  const r = habitat(["validate", example, "--strict"]);
  assert.ok(r.ok, r.out);
  assert.match(r.out, /0 error\(s\), 0 open TODO\(s\)/);
});

test("fresh templates are valid drafts, and strict mode fails on their TODOs", () => {
  const dir = scratch();
  assert.ok(habitat(["init"], dir).ok);
  cpSync(join(dir, "design/components/_TEMPLATE.md"), join(dir, "design/components/example.md"));
  const r = habitat(["validate", "design"], dir);
  assert.ok(r.ok, r.out);
  assert.match(r.out, /0 error\(s\)/);
  assert.ok(!habitat(["validate", "design", "--strict"], dir).ok);
});

test("init installs skills and rules once, and keeps existing content", () => {
  const dir = scratch();
  writeFileSync(join(dir, "AGENTS.md"), "# My project\n\nUse pnpm.\n");
  habitat(["init"], dir);
  habitat(["init"], dir);
  const agents = readFileSync(join(dir, "AGENTS.md"), "utf8");
  assert.ok(agents.startsWith("# My project"));
  assert.equal(agents.split("habitat:start").length - 1, 1);
  assert.equal(readFileSync(join(dir, "CLAUDE.md"), "utf8"), "@AGENTS.md\n");
  for (const skill of ["habitat-extract", "habitat-review", "habitat-refresh"]) {
    assert.ok(existsSync(join(dir, `.claude/skills/${skill}/SKILL.md`)), skill);
  }
  assert.match(readFileSync(join(dir, ".cursor/rules/habitat.mdc"), "utf8"), /alwaysApply: true/);
});

test("validate warns about bad token bindings, stale files and broken replacements", () => {
  const dir = scratch();
  cpSync(example, join(dir, "design"), { recursive: true });
  const button = join(dir, "design/components/button.md");
  writeFileSync(button, readFileSync(button, "utf8")
    .replace("primary.background: color.brand.default", "primary.background: color.teal.600")
    .replace("radius: radius.sm", "radius: radius.xx")
    .replace(/lastReviewed: .*/, "lastReviewed: '2025-01-01'")
    .replace("status: reviewed", "status: deprecated\nreplacedBy: Missing"));
  const r = habitat(["validate", "design"], dir);
  assert.match(r.out, /binds to primitive "color.teal.600"/);
  assert.match(r.out, /"radius.xx", which tokens.md does not define/);
  assert.match(r.out, /last reviewed \d+ days ago/);
  assert.match(r.out, /replaced by "Missing", which has no file/);
});

test("check finds every kind of problem in a badly built screen", () => {
  const r = habitat(["check", "test/fixtures/bad-screen.tsx", "--design", example]);
  assert.ok(!r.ok);
  assert.match(r.out, /raw colour #16201f; the same value as color.text.default or color.border.strong/);
  assert.match(r.out, /raw size 24px; the same value as space.xl/);
  assert.match(r.out, /native <input> used; the system has Input/);
  assert.match(r.out, /native <button> used; the system has Button/);
  assert.match(r.out, /--space-huge is not a token/);
  assert.doesNotMatch(r.out, /#123/, "page text like 'Issue #123' is not a colour");
  assert.match(r.out, /6 problem\(s\)/);
});

test("check flags deprecated components and passes clean code", () => {
  const dir = scratch();
  cpSync(example, join(dir, "design"), { recursive: true });
  const input = join(dir, "design/components/input.md");
  writeFileSync(input, readFileSync(input, "utf8")
    .replace("status: reviewed", "status: deprecated\nreplacedBy: Button")
    .replace("canonical: Input", "canonical: OldInput"));
  writeFileSync(join(dir, "screen.tsx"), '<OldInput label="Name" />\n');
  assert.match(habitat(["check", "screen.tsx"], dir).out, /OldInput is deprecated; use Button/);
  assert.ok(habitat(["check", "examples/code", "--design", example]).ok);
});

test("parity links every example contract to its code, and finds orphans", () => {
  const r = habitat(["parity", example, "--code", "examples/code"]);
  assert.ok(r.ok, r.out);
  assert.match(r.out, /0 missing/);
  assert.match(r.out, /0 without a contract/);

  const dir = scratch();
  cpSync(example, join(dir, "design"), { recursive: true });
  cpSync(join(kit, "examples/code"), join(dir, "code"), { recursive: true });
  writeFileSync(join(dir, "code/Tooltip.tsx"), "export const Tooltip = () => null;\n");
  const button = join(dir, "design/components/button.md");
  writeFileSync(button, readFileSync(button, "utf8").replace("- ghost\n", "- ghost\n      - danger\n"));
  const orphan = habitat(["parity", "design", "--code", "code"], dir);
  assert.match(orphan.out, /Tooltip\.tsx/);
  assert.match(orphan.out, /option "danger" of "variant" not found/);
});

test("the MCP server answers, resolves aliases and warns about deprecated components", async () => {
  const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
  const { StdioClientTransport } = await import("@modelcontextprotocol/sdk/client/stdio.js");
  const client = new Client({ name: "test", version: "1" });
  await client.connect(new StdioClientTransport({ command: "node", args: [cli, "serve", example], stderr: "ignore" }));
  const call = async (name, args = {}) => (await client.callTool({ name, arguments: args })).content[0].text;

  const tools = (await client.listTools()).tools.map((t) => t.name).sort();
  assert.deepEqual(tools, ["check_code", "get_component", "get_principles", "get_rules", "get_tokens", "list_components"]);
  assert.equal(JSON.parse(await call("get_component", { name: "CTA" })).name.canonical, "Button");
  assert.match(await call("get_component", { name: "Tooltip" }), /report the gap/);
  assert.match(await call("check_code", { code: '<button style={{color: "#fff"}}>Go</button>' }), /raw-element/);
  await client.close();
});

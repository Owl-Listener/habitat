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
  cpSync(join(dir, "design/research/insights/_TEMPLATE.md"), join(dir, "design/research/insights/INS-001.md"));
  cpSync(join(dir, "design/research/people/_TEMPLATE.md"), join(dir, "design/research/people/example.md"));
  cpSync(join(dir, "design/flows/_TEMPLATE.md"), join(dir, "design/flows/example.md"));
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
  assert.ok(existsSync(join(dir, "design/flows/_TEMPLATE.md")));
  for (const skill of ["habitat-extract", "habitat-research", "habitat-review", "habitat-refresh"]) {
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
  assert.match(orphan.out, /option "danger" of "variant" is in the contract but not in the code/);
});

test("parity reads the code's types: undocumented props, extra values and different defaults", () => {
  const dir = scratch();
  cpSync(example, join(dir, "design"), { recursive: true });
  cpSync(join(kit, "examples/code"), join(dir, "code"), { recursive: true });
  const code = join(dir, "code/Button.tsx");
  writeFileSync(code, readFileSync(code, "utf8")
    .replace('"primary" | "secondary" | "ghost"', '"primary" | "secondary" | "ghost" | "link"')
    .replace("loading?: boolean;", "loading?: boolean;\n  icon?: string;")
    .replace('variant = "primary"', 'variant = "secondary"')
    // A comment naming a prop must not count as declaring it.
    .replace("export const Button", "// size is documented elsewhere\nexport const Button"));
  const r = habitat(["parity", "design", "--code", "code"], dir);
  assert.match(r.out, /the code allows "link" for "variant", which the contract does not document/);
  assert.match(r.out, /the code takes "icon", which the contract does not document/);
  assert.match(r.out, /"variant" defaults to "secondary" in code but "primary" in the contract/);
  // Input's type and placeholder are inherited HTML attributes, so they are not reported.
  assert.doesNotMatch(r.out, /"placeholder"/);
});

test("tokens export to DTCG and import back without changing anything", () => {
  const dir = scratch();
  cpSync(example, join(dir, "design"), { recursive: true });
  assert.ok(habitat(["tokens", "export", "design", "--out", "tokens.json"], dir).ok);
  const json = JSON.parse(readFileSync(join(dir, "tokens.json"), "utf8"));
  assert.equal(json.color.brand.default.$value, "{color.teal.600}");
  assert.deepEqual(json.color.teal["600"].$value.hex, "#1f6f6b");
  assert.deepEqual(json.space.lg.$value, { value: 16, unit: "px" });
  assert.equal(json.type.style.heading.$type, "typography");
  const before = readFileSync(join(dir, "design/tokens.md"), "utf8");
  const r = habitat(["tokens", "import", "tokens.json", "--design", "design"], dir);
  assert.match(r.out, /0 updated, 0 added, 0 not in the import/);
  assert.equal(readFileSync(join(dir, "design/tokens.md"), "utf8"), before);
});

test("tokens import refreshes facts, keeps judgement, and reads one file per mode", () => {
  const dir = scratch();
  cpSync(example, join(dir, "design"), { recursive: true });
  const figma = (hex) => ({
    color: {
      teal: { 600: { $type: "color", $value: "#1f6f6b" }, 700: { $type: "color", $value: "#1a605c" } },
      brand: { default: { $type: "color", $value: "{color.teal.700}", $description: "Something else entirely" } },
      state: { error: { $type: "color", $value: { colorSpace: "srgb", components: [0.7, 0.2, 0.1], hex } } },
      warning: { $type: "color", $value: "#e6a700", $description: "Warning colour" },
    },
  });
  writeFileSync(join(dir, "light.tokens.json"), JSON.stringify(figma("#b03020")));
  writeFileSync(join(dir, "dark.tokens.json"), JSON.stringify(figma("#ff6b5b")));
  const tokensPath = join(dir, "design/tokens.md");
  const original = readFileSync(tokensPath, "utf8");

  const dry = habitat(["tokens", "import", "light.tokens.json", "dark.tokens.json", "--design", "design", "--dry-run"], dir);
  assert.match(dry.out, /Dry run/);
  assert.equal(readFileSync(tokensPath, "utf8"), original);

  const r = habitat(["tokens", "import", "light.tokens.json", "dark.tokens.json", "--design", "design"], dir);
  assert.match(r.out, /color.brand.default: alias color.teal.600 → \{color.teal.700\}/);
  assert.match(r.out, /color.state.error changed value; do its useFor and avoid still hold\?/);
  assert.match(r.out, /radius.full/, "tokens missing from the import are listed, not deleted");
  const after = readFileSync(tokensPath, "utf8");
  assert.match(after, /meaning: 'Primary brand colour, used for primary actions.'/, "meaning is never overwritten");
  assert.match(after, /meaning: 'TODO confirm: Warning colour'/);
  assert.match(after, /light: '#b03020'\n\s+dark: '#ff6b5b'/);
  assert.match(after, /name: radius.full/);
});

test("validate checks flows and Figma styles", () => {
  const dir = scratch();
  cpSync(example, join(dir, "design"), { recursive: true });
  const flow = join(dir, "design/flows/send-invoice.md");
  writeFileSync(flow, readFileSync(flow, "utf8")
    .replace("journey: Send an invoice", "journey: Pay a bill")
    .replace("    to: sent\n", "    to: sending\n")
    .replace("      - Input\n", "      - DatePicker\n")
    .replace("    end: true\n", ""));
  const tokens = join(dir, "design/tokens.md");
  writeFileSync(tokens, readFileSync(tokens, "utf8").replace("---\n\n# Tokens", `  - name: color.style.ink
    tier: semantic
    value: '#16201F'
    figma:
      style: Ink
      styleType: PAINT
    meaning: Text colour, as a Figma style.
---\n\n# Tokens`));
  const r = habitat(["validate", "design"], dir);
  assert.match(r.out, /journey "Pay a bill" is not one of the core journeys/);
  assert.match(r.out, /screen "sending", which is not in screens/);
  assert.match(r.out, /uses DatePicker, which has no file in components/);
  assert.match(r.out, /screen "sent" has no way out/);
  assert.match(r.out, /color.style.ink \(style "Ink"\) has the same value as variable color.text.default/);
});

test("eval runs both conditions, counts problems and writes a report", async () => {
  const { loadDesign } = await import("../lib/habitat.js");
  const { runEval, writeEval, evalPlan } = await import("../lib/eval.js");
  const dir = scratch();
  cpSync(example, join(dir, "design"), { recursive: true });
  const design = loadDesign(join(dir, "design"));
  const sent = [];
  // A stand-in for the Anthropic client: without the design system it hand-codes
  // a button with a raw colour; with it, it uses the Button component.
  const client = {
    beta: {
      messages: {
        stream: (params) => {
          sent.push(params);
          const judging = Boolean(params.output_config.format);
          const withSystem = params.system.includes("<design-system>");
          const text = judging
            ? JSON.stringify({ problems: withSystem && params.messages[0].content.includes("<button") ? [{ problem: "Two primary actions", type: "broke a principle", rule: "one primary per view (DESIGN.md)" }] : [] })
            : withSystem
              ? '```tsx\n<Button variant="primary">Send invoice</Button>\n```'
              : '```tsx\n<button style={{ background: "#1f6f6b" }}>Send</button>\n```';
          return { finalMessage: async () => ({ stop_reason: "end_turn", content: [{ type: "text", text }] }) };
        },
      },
    },
  };
  assert.equal(evalPlan(design, { runs: 2, judge: true }).requests, 8);
  const result = await runEval(design, { prompt: "Build the send invoice screen", runs: 2, judge: true, client });
  assert.equal(sent.length, 8);
  assert.ok(sent.every((p) => p.model === "claude-opus-5-5" && p.fallbacks === "default"));
  assert.ok(!sent[0].system.includes("<design-system>"), "the baseline never sees the design system");
  const { reportPath } = writeEval(design, result, { journey: "Send an invoice", date: "2026-11-07" });
  const report = readFileSync(reportPath, "utf8");
  assert.match(report, /\| baseline \| 2 \| 1 \| 3 \|/);
  assert.match(report, /\| habitat \| 0 \| 0 \| 0 \|/);
  assert.match(report, /0 with habitat, down from 3 without it \(100% fewer\)/);
  assert.ok(existsSync(join(dir, "design/evals/runs/2026-11-07-send-an-invoice/baseline-1/screen.tsx")));
});

test("eval explains itself without a prompt, and a dry run sends nothing", () => {
  assert.match(habitat(["eval", example]).out, /Usage: habitat eval/);
  const r = habitat(["eval", example, "--prompt", "Build it", "--judge", "--runs", "2", "--dry-run"]);
  assert.ok(r.ok, r.out);
  assert.match(r.out, /8 request\(s\)/);
  assert.match(r.out, /Dry run: nothing was sent/);
});

test("the MCP server answers, resolves aliases, serves research and checks code", async (t) => {
  const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
  const { StdioClientTransport } = await import("@modelcontextprotocol/sdk/client/stdio.js");
  const client = new Client({ name: "test", version: "1" });
  await client.connect(new StdioClientTransport({ command: "node", args: [cli, "serve", example], stderr: "ignore" }));
  t.after(() => client.close()); // always stop the server, even if an assertion fails
  const call = async (name, args = {}) => (await client.callTool({ name, arguments: args })).content[0].text;

  const tools = (await client.listTools()).tools.map((t) => t.name).sort();
  assert.deepEqual(tools, ["check_code", "get_component", "get_flows", "get_principles", "get_research", "get_rules", "get_tokens", "list_components"]);
  assert.equal(JSON.parse(await call("get_component", { name: "CTA" })).name.canonical, "Button");
  assert.match(await call("get_component", { name: "Tooltip" }), /report the gap/);
  assert.match(await call("check_code", { code: '<button style={{color: "#fff"}}>Go</button>' }), /raw-element/);

  // Research: filtered by journey, and attached to the component rules that cite it.
  const research = JSON.parse(await call("get_research", { journey: "Send an invoice" }));
  assert.deepEqual(research.insights.map((i) => i.id).sort(), ["INS-001", "INS-002", "INS-003"]);
  assert.equal(JSON.parse(await call("get_research", { person: "sole-trader" })).people[0].name, "Sole trader");
  const button = JSON.parse(await call("get_component", { name: "Button" }));
  assert.deepEqual(button.research.map((r) => r.id).sort(), ["INS-001", "INS-002"]);
  assert.match(await call("get_research", { journey: "Onboarding" }), /No research matches/);

  // Flows: listed, found by journey, and their rules included in get_rules.
  assert.equal(JSON.parse(await call("get_flows"))[0].name, "Send an invoice");
  const flow = JSON.parse(await call("get_flows", { journey: "send an invoice" }));
  assert.deepEqual(flow.screens.map((s) => s.id), ["customer", "details", "review", "sent"]);
  assert.match(await call("get_flows", { journey: "Onboarding" }), /No flow for "Onboarding"/);
  assert.match(await call("get_rules"), /add a confirmation dialog before sending/);
});

test("validate checks research: citations, retired and hunch evidence, stale findings, personal data", () => {
  const dir = scratch();
  cpSync(example, join(dir, "design"), { recursive: true });
  const edit = (file, from, to) => {
    const p = join(dir, "design", file);
    writeFileSync(p, readFileSync(p, "utf8").replace(from, to));
  };
  // A rule citing an insight that does not exist, and one citing a retired insight.
  edit("components/input.md", "- INS-003", "- INS-099");
  edit("research/insights/INS-002.md", "status: reviewed", "status: retired\nsupersededBy: INS-001");
  // A rule resting only on a hunch.
  edit("DESIGN.md", "(INS-003)", "(INS-004)");
  // An old finding, and a quote that leaks personal data.
  edit("research/insights/INS-001.md", "lastReviewed: '2026-09-01'", "lastReviewed: '2024-01-01'");
  edit("research/insights/INS-003.md", "telling me off", "telling me off, said jo.bloggs@example.com");
  // A person citing an insight that does not exist.
  edit("research/people/sole-trader.md", "evidence:", "evidence:\n  - INS-050");

  const r = habitat(["validate", "design"], dir);
  assert.match(r.out, /cites INS-099, which has no file/);
  assert.match(r.out, /cites retired INS-002; see INS-001/);
  assert.match(r.out, /DESIGN.md line \d+ rests only on a hunch \(INS-004\)/);
  assert.match(r.out, /last reviewed \d+ days ago; check the finding still holds/);
  assert.match(r.out, /seems to contain an email address/);
  assert.match(r.out, /evidence cites INS-050/);
  assert.doesNotMatch(r.out, /phone number/, "dates and counts are not phone numbers");
});

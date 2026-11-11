#!/usr/bin/env node
/**
 * habitat command line.
 *
 *   habitat init [dir] [--agents claude,cursor,...]
 *                                      scaffold a design folder (default: ./design),
 *                                      install the skills and the agent rules
 *   habitat connect [agent] [--write]  how to connect an agent to the MCP server
 *   habitat validate [dir] [--strict]  check the folder, list open TODOs
 *   habitat check <paths...> [--design dir] [--fix] [--changed-since ref] [--format github]
 *                                      check UI code against the system
 *   habitat parity [dir] [--code path] check the contracts match the code
 *   habitat tokens export [dir] [--out file]
 *                                      write the tokens as W3C design tokens (DTCG) JSON
 *   habitat tokens import <files...> [--design dir] [--dry-run]
 *                                      bring DTCG JSON (e.g. a Figma export) into tokens.md
 *   habitat export [dir] [--out DESIGN.md] [--name "Product"]
 *                                      write a DESIGN.md in Google's open format
 *   habitat eval [dir] --prompt "..." [--journey name] [--runs 3] [--judge]
 *                                      run the same prompt with and without the
 *                                      design system, and count the problems
 *   habitat serve [dir]                serve the folder to an agent over MCP
 *
 * Run it without installing anything:
 *   npx @owl-listener/habitat init
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
  else if (args[i] === "--dry-run") flags.dryRun = true;
  else if (args[i] === "--judge") flags.judge = true;
  else if (args[i] === "--force") flags.force = true;
  else if (args[i] === "--fix") flags.fix = true;
  else if (args[i] === "--write") flags.write = true;
  else if (args[i].startsWith("--")) flags[args[i].slice(2)] = args[++i];
  else paths.push(args[i]);
}
// Most commands take the design folder as their first path; check and
// tokens import take files first, so their folder comes from --design.
const designArg = {
  check: flags.design,
  eval: paths[0],
  tokens: paths[0] === "import" ? flags.design : paths[1],
}[command] ?? (command === "tokens" || command === "check" ? undefined : paths[0]);
const dir = resolve(designArg || "design");
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
    const { AGENTS, parseAgents } = await import("../lib/agents.js");
    let agents;
    try {
      agents = parseAgents(flags.agents);
    } catch (err) {
      console.log(`habitat: ${err.message}`);
      process.exit(1);
    }
    console.log(`Setting up ${shortDir}/\n`);
    place("templates/DESIGN.md", join(dir, "DESIGN.md"));
    place("templates/tokens.md", join(dir, "tokens.md"));
    place("templates/component.md", join(dir, "components", "_TEMPLATE.md"));
    place("templates/flow.md", join(dir, "flows", "_TEMPLATE.md"));
    place("templates/eval.md", join(dir, "evals", "_TEMPLATE.md"));
    place("templates/insight.md", join(dir, "research", "insights", "_TEMPLATE.md"));
    place("templates/person.md", join(dir, "research", "people", "_TEMPLATE.md"));
    // The skills, once per folder: Claude Code reads .claude/skills, and
    // Codex, Cursor, Copilot and Gemini CLI share .agents/skills.
    for (const folder of new Set(agents.map((a) => AGENTS[a].skills).filter(Boolean))) {
      for (const skill of SKILLS) place(`skills/${skill}/SKILL.md`, resolve(folder, skill, "SKILL.md"));
    }
    // AGENTS.md is the shared file most agents read, so it is always written.
    addRules(resolve("AGENTS.md"));
    for (const id of agents) {
      const rules = AGENTS[id].rules;
      if (!rules) continue;
      const to = resolve(rules.file);
      // Claude Code's CLAUDE.md pulls AGENTS.md in with an @ import, rather than a second copy.
      if (rules.importsAgentsMd && existsSync(to) && readFileSync(to, "utf8").includes("@AGENTS.md")) {
        console.log(`  kept     ${to} (already imports AGENTS.md)`);
      } else {
        addRules(to, { header: rules.header ?? "", ...(rules.importsAgentsMd && { whenMissing: "@AGENTS.md\n" }) });
      }
    }
    console.log(`
Set up for: ${agents.map((a) => AGENTS[a].name).join(", ")}. (Choose with --agents, e.g. --agents claude,cursor.)

Next:
  1. Connect the Figma MCP server to your AI tool (see the habitat README).
  2. Write your system down. In Claude Code, run /habitat-extract. In Codex,
     Cursor, Copilot or Gemini CLI, ask: "Use the habitat-extract skill".
     Anything else? Paste the prompts from:
     https://github.com/Owl-Listener/habitat/tree/main/prompts
  3. Check your progress:  npx @owl-listener/habitat validate ${shortDir}
  4. Connect habitat to your agent, so it reads your system while it works:
     npx @owl-listener/habitat connect          (shows how, for each agent)
  5. Have user research? The habitat-research skill turns it into insights your rules can cite.
  6. Later: habitat-review to critique a screen, habitat-refresh when Figma changes.`);
    break;
  }
  case "connect": {
    const { AGENTS, AGENT_IDS, connectInstructions, writeMcpConfig } = await import("../lib/agents.js");
    const [agent] = paths;
    if (agent && !AGENTS[agent]) {
      console.log(`habitat: unknown agent "${agent}"; choose from ${AGENT_IDS.join(", ")}`);
      process.exit(1);
    }
    const designDir = resolve(flags.design || "design");
    const where = { absolute: designDir, relative: relative(process.cwd(), designDir) || "." };
    if (flags.write) {
      if (!agent) {
        console.log("habitat: name the agent to write for, e.g. habitat connect cursor --write");
        process.exit(1);
      }
      const r = writeMcpConfig(agent, where);
      console.log(r.ok ? `  ${r.message}` : `habitat: ${r.message}\n\n${connectInstructions(agent, where)}`);
      process.exit(r.ok ? 0 : 1);
    }
    console.log(`Connect the habitat MCP server, so your agent can read ${where.relative}/ while it works.\n`);
    console.log((agent ? [agent] : AGENT_IDS).map((a) => connectInstructions(a, where)).join("\n\n"));
    console.log(`\nAny other agent that supports MCP: run  npx -y @owl-listener/habitat serve ${designDir}`);
    break;
  }
  case "validate": {
    const { validate } = await import("../lib/validate.js");
    process.exit(validate(dir, { strict: flags.strict }) ? 0 : 1);
  }
  case "check": {
    if (!paths.length) {
      console.log(`Usage: habitat check <files or folders...> [--design dir]

  --fix                  apply the fixes that have one right answer
  --changed-since <ref>  only report lines changed since a git ref, e.g. origin/main
  --format github        print GitHub Actions annotations for pull requests`);
      process.exit(1);
    }
    mustExist(dir, ...paths);
    const { loadDesign } = await import("../lib/habitat.js");
    const { checkCode, collectFiles, applyFixes, changedLines, githubAnnotation } = await import("../lib/check.js");
    const design = loadDesign(dir);
    const files = collectFiles(paths);
    let findings = checkCode(design, files);
    if (flags["changed-since"]) {
      const changed = changedLines(flags["changed-since"]);
      findings = findings.filter((f) => changed.get(f.path)?.has(f.line));
    }
    if (flags.fix) {
      const applied = applyFixes(files, findings);
      console.log(`Fixed ${applied} problem(s).`);
      findings = checkCode(design, files);
      if (flags["changed-since"]) {
        const changed = changedLines(flags["changed-since"]);
        findings = findings.filter((f) => changed.get(f.path)?.has(f.line));
      }
    }
    const rel = (p) => relative(process.cwd(), p);
    for (const f of findings) {
      if (flags.format === "github") console.log(githubAnnotation(f, rel(f.path)));
      else console.log(`${rel(f.path)}:${f.line}:${f.column + 1}  ${f.rule.padEnd(13)} ${f.message}${f.fix ? "  (fixable)" : ""}`);
    }
    const counts = {};
    for (const f of findings) counts[f.rule] = (counts[f.rule] || 0) + 1;
    const byRule = Object.entries(counts).map(([rule, n]) => `${rule} ${n}`);
    const fixable = findings.filter((f) => f.fix).length;
    console.log(
      `\n${files.length} file(s) checked, ${findings.length} problem(s)${byRule.length ? ` (${byRule.join(", ")})` : ""}.` +
        (fixable ? ` ${fixable} can be fixed with --fix.` : "")
    );
    process.exit(findings.length ? 1 : 0);
  }
  case "parity": {
    const { loadDesign } = await import("../lib/habitat.js");
    const { parity, printParity } = await import("../lib/parity.js");
    const codePaths = flags.code ? [flags.code] : [];
    mustExist(dir, ...codePaths);
    process.exit(printParity(parity(loadDesign(dir), { codePaths }), { codePaths }) ? 0 : 1);
  }
  case "tokens": {
    const [action, ...files] = paths;
    const tokensPath = join(dir, "tokens.md");
    if (action === "export") {
      mustExist(tokensPath);
      const { loadDesign } = await import("../lib/habitat.js");
      const { toDtcg } = await import("../lib/tokens.js");
      const json = JSON.stringify(toDtcg(loadDesign(dir).tokens?.data?.tokens || []), null, 2) + "\n";
      if (flags.out) {
        writeFileSync(flags.out, json);
        console.log(`Wrote ${flags.out}`);
      } else process.stdout.write(json);
      break;
    }
    if (action === "import" && files.length) {
      mustExist(tokensPath, ...files);
      const { importTokens, printTokenChanges } = await import("../lib/tokens.js");
      printTokenChanges(importTokens(tokensPath, files, { dryRun: flags.dryRun }), { dryRun: flags.dryRun });
      console.log("Run habitat validate to check the result, then answer the new TODOs.");
      break;
    }
    console.log(`Usage:
  habitat tokens export [dir] [--out tokens.json]
  habitat tokens import <file.json...> [--design dir] [--dry-run]
    One file per mode (light.json dark.json) adds each as a mode.`);
    process.exit(1);
  }
  case "export": {
    mustExist(dir);
    const { loadDesign } = await import("../lib/habitat.js");
    const design = loadDesign(dir);
    if (flags.format === "dtcg") {
      const { toDtcg } = await import("../lib/tokens.js");
      const json = JSON.stringify(toDtcg(design.tokens?.data?.tokens || []), null, 2) + "\n";
      if (flags.out) writeFileSync(flags.out, json);
      else process.stdout.write(json);
      break;
    }
    if (flags.format && flags.format !== "design-md") {
      console.log("habitat: --format must be design-md (the default) or dtcg");
      process.exit(1);
    }
    const { toDesignMd, GENERATED } = await import("../lib/designmd.js");
    const out = resolve(flags.out || "DESIGN.md");
    // Never overwrite habitat's own DESIGN.md, or a DESIGN.md someone wrote by hand.
    if (out === join(dir, "DESIGN.md")) {
      console.log(`habitat: ${relative(process.cwd(), out)} is habitat's own file. Choose another path with --out.`);
      process.exit(1);
    }
    if (existsSync(out) && !readFileSync(out, "utf8").includes(GENERATED) && !flags.force) {
      console.log(`habitat: ${relative(process.cwd(), out)} already exists and was not made by habitat. Use --out for another path, or --force to replace it.`);
      process.exit(1);
    }
    writeFileSync(out, toDesignMd(design, { name: flags.name, primary: flags.primary }));
    console.log(`Wrote ${relative(process.cwd(), out)} in the DESIGN.md format (google-labs-code/design.md, alpha).
Check it with:  npx @google/design.md lint ${relative(process.cwd(), out)}`);
    break;
  }
  case "eval": {
    if (!flags.prompt && !flags["prompt-file"]) {
      console.log(`Usage: habitat eval [dir] --prompt "Build the screen where..." [options]

  --prompt-file file   read the prompt from a file instead
  --journey name       the core journey it tests, used to name the report
  --runs n             runs per condition (default 3; AI output varies)
  --judge              also have Claude review each result against your rules
  --only baseline,facts,habitat
                       which conditions to run (default: all three)
  --model id           default claude-opus-5-5
  --dry-run            show what would run, without calling the API

Needs an Anthropic API key in ANTHROPIC_API_KEY (or an \`ant auth login\` profile).`);
      process.exit(1);
    }
    mustExist(dir, ...(flags["prompt-file"] ? [flags["prompt-file"]] : []));
    const prompt = (flags.prompt ?? readFileSync(flags["prompt-file"], "utf8")).trim();
    const runs = Number(flags.runs ?? 3);
    if (!Number.isInteger(runs) || runs < 1) {
      console.log("habitat: --runs must be a whole number, 1 or more");
      process.exit(1);
    }
    const { loadDesign } = await import("../lib/habitat.js");
    const { evalPlan, runEval, writeEval, summarise, hasAnthropicCredentials, CONDITIONS, DEFAULT_MODEL } = await import("../lib/eval.js");
    const only = flags.only?.split(",").map((c) => c.trim()).filter(Boolean);
    if (only?.some((c) => !CONDITIONS.includes(c))) {
      console.log(`habitat: --only takes ${CONDITIONS.join(", ")}, separated by commas`);
      process.exit(1);
    }
    const design = loadDesign(dir);
    const options = { prompt, runs, judge: flags.judge, only, model: flags.model ?? DEFAULT_MODEL };
    const plan = evalPlan(design, options);
    console.log(
      `Eval${flags.journey ? ` "${flags.journey}"` : ""}: ${plan.conditions.length > 1 ? `${plan.conditions.slice(0, -1).join(", ")} and ${plan.conditions.at(-1)}` : plan.conditions[0]}, ${runs} run(s) each, ` +
        `${plan.requests} request(s) to ${options.model}. The design system adds about ${Math.round(plan.contextCharacters / 4).toLocaleString()} tokens to each habitat request.`
    );
    if (flags.dryRun) {
      console.log("Dry run: nothing was sent.");
      break;
    }
    if (!hasAnthropicCredentials()) {
      console.log(`habitat: eval needs an Anthropic API key, and none is set.
  Get one at https://console.anthropic.com, then set it before running:
    export ANTHROPIC_API_KEY=...        (macOS and Linux)
    setx ANTHROPIC_API_KEY ...          (Windows; open a new terminal after)
  Add --dry-run to see what would run without one.`);
      process.exit(1);
    }
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    let result;
    try {
      result = await runEval(design, { ...options, client: new Anthropic(), onProgress: (m) => console.log(`  ${m}`) });
    } catch (err) {
      if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError || /authentication|api key|credentials/i.test(err.message)) {
        console.log("habitat: the Anthropic API key was not accepted, so nothing was run. Check ANTHROPIC_API_KEY and try again.");
      }
      else console.log(`habitat: ${err.message}`);
      process.exit(1);
    }
    const failed = result.results.filter((r) => r.error);
    if (failed.length === result.results.length) {
      console.log(`habitat: every run failed. The first error: ${failed[0].error}`);
      process.exit(1);
    }
    const { reportPath } = writeEval(design, result, { journey: flags.journey });
    for (const [condition, s] of Object.entries(summarise(result))) {
      const avg = s.totals.length ? (s.totals.reduce((a, b) => a + b, 0) / s.totals.length).toFixed(1) : "n/a";
      console.log(`${condition.padEnd(9)} ${avg} problem(s) per run${s.errors ? `, ${s.errors} failed` : ""}`);
    }
    console.log(`\nWrote ${relative(process.cwd(), reportPath)}. Add a row to the calibration log in DESIGN.md.`);
    break;
  }
  case "serve": {
    const { serve } = await import("../mcp-server/index.js");
    await serve(dir);
    break;
  }
  default:
    console.log(`habitat: make your design system legible to AI agents

  habitat init [dir] [--agents list]        scaffold a design folder (default ./design)
  habitat connect [agent] [--write]         connect an agent to habitat over MCP
  habitat validate [dir] [--strict]         check it and list open TODOs
  habitat check <paths...> [--design dir]   check UI code against the system
  habitat parity [dir] [--code path]        check the contracts match the code
  habitat tokens export [dir] [--out file]  write the tokens as DTCG JSON
  habitat tokens import <files...>          bring DTCG JSON into tokens.md
         [--design dir] [--dry-run]
  habitat export [dir] [--out DESIGN.md]    write a DESIGN.md in Google's open format
         [--name "Product"] [--format dtcg]
  habitat eval [dir] --prompt "..."         run a prompt with and without the system,
         [--journey name] [--judge]         and count the problems
  habitat serve [dir]                       serve it to an agent over MCP`);
    process.exit(command ? 1 : 0);
}

/**
 * Runs an eval for you: the same prompt, with and without the design system.
 *
 * The habitat method is a loop: ask an AI for a real screen, see what it
 * gets wrong, write down the missing rule, run it again. Done by hand, the
 * count depends on who is looking and how tired they are. This does the
 * asking and the counting with a program, so the numbers can be compared
 * from one month to the next:
 *
 *   1. For each condition (baseline: no design system; habitat: the design
 *      folder in the prompt), ask Claude to build the screen, `runs` times.
 *      AI output varies from run to run, so one run proves little; three or
 *      more give an average and a range.
 *   2. Count the problems in each result with the automatic checks (the
 *      same ones `habitat check` runs). This count needs no judgement.
 *   3. With `judge`, ask Claude a second time to review each result against
 *      the design system, for the problems a program cannot see: a broken
 *      principle, the wrong component, an interaction rule ignored. Both
 *      conditions are judged against the same system, which is the point:
 *      the baseline is measured against the rules it never saw.
 *
 * The result is written to evals/ as a Markdown file next to the hand-run
 * evals, and the generated code is kept, so a person can check the count.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import YAML from "yaml";
import { checkCode } from "./check.js";

export const DEFAULT_MODEL = "claude-opus-5-5";
const CONDITIONS = ["baseline", "habitat"];
const PROBLEM_TYPES = ["invented component", "raw value", "wrong component", "broke a principle", "broke an interaction rule", "other"];

const BUILD_INSTRUCTIONS = `You are a front-end developer building a screen for a product.
Write it as React with TypeScript. Put all the code in fenced code blocks: one \`\`\`tsx block for the screen, and a \`\`\`css block if you need styles.
Write the complete code, with no placeholders. After the code, add at most three short sentences about anything you were unsure of.`;

const WITH_SYSTEM = `This product has a design system, given below between <design-system> tags. Follow it: build only from its components, take every value from its tokens, follow its principles, interaction rules and anti-patterns, and if the screen needs something the system does not have, say so instead of inventing it.`;

/** The design folder as one document an AI can read in a single prompt. */
export function designContext(design) {
  const parts = [];
  if (design.principles) parts.push(`# DESIGN.md\n\n${design.principles.body}`);
  if (design.tokens) parts.push(`# tokens.md\n\n${YAML.stringify(design.tokens.data.tokens)}\n${design.tokens.body}`);
  for (const c of design.components) {
    parts.push(`# components/${relative(join(design.root, "components"), c.path)}\n\n${YAML.stringify(c.data)}\n${c.body}`);
  }
  for (const f of design.flows || []) {
    parts.push(`# flows/${relative(join(design.root, "flows"), f.path)}\n\n${YAML.stringify(f.data)}\n${f.body}`);
  }
  for (const i of design.insights || []) {
    if (i.data?.status !== "retired") parts.push(`# research: ${i.data?.id}\n\n${YAML.stringify(i.data)}`);
  }
  return parts.join("\n\n---\n\n");
}

/** Pull the code out of a reply: each fenced block becomes a file the checks can read. */
export function extractCode(reply, dir = "screen") {
  const files = [];
  const counts = {};
  for (const m of reply.matchAll(/```([\w-]*)[^\n]*\n([\s\S]*?)```/g)) {
    const lang = (m[1] || "tsx").toLowerCase();
    const ext = { typescript: "tsx", ts: "tsx", jsx: "jsx", javascript: "jsx", js: "jsx", scss: "scss", html: "html" }[lang] ?? (lang === "css" ? "css" : "tsx");
    counts[ext] = (counts[ext] || 0) + 1;
    const name = `${counts[ext] > 1 ? `screen-${counts[ext]}` : "screen"}.${ext}`;
    files.push({ path: join(dir, name), text: m[2] });
  }
  return files;
}

const textOf = (message) => message.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");

// One request. Streaming keeps long answers clear of HTTP timeouts, caching
// means the design system is paid for in full once rather than every run, and
// `fallbacks: "default"` lets the API hand a request its safety checks
// decline to another model, rather than failing the run.
async function ask(client, { model, system, prompt, effort, format }) {
  const message = await client.beta.messages
    .stream({
      model,
      max_tokens: 64000,
      system,
      messages: [{ role: "user", content: prompt }],
      output_config: { effort, ...(format && { format }) },
      cache_control: { type: "ephemeral" }, // the design system repeats across runs, so cache it
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    })
    .finalMessage();
  if (message.stop_reason === "refusal") throw new Error("the model declined this request");
  return message;
}

const JUDGE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["problems"],
  properties: {
    problems: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["problem", "type", "rule"],
        properties: {
          problem: { type: "string", description: "What is wrong, and where in the code." },
          type: { type: "string", enum: PROBLEM_TYPES },
          rule: { type: "string", description: "The rule it breaks and the file it is in, e.g. 'one primary per view (DESIGN.md)', or 'no rule: <the gap>'." },
        },
      },
    },
  },
};

async function judgeRun(client, { model, context, prompt, code, automatic }) {
  const system = `You review UI code against a design system, the way its own designers would. The design system is between <design-system> tags.
List every problem a designer on this team would ask to have fixed: a principle broken, the wrong component for the job, an interaction rule ignored, an anti-pattern followed, a component invented where the system has one or should report a gap.
Judge only against this system's rules and taste, not your own. Do not list problems the automatic checks already found; they are given to you so you can skip them.

<design-system>
${context}
</design-system>`;
  const user = `The screen was asked for with this prompt:\n\n${prompt}\n\nThe code:\n\n${code}\n\nAlready found by the automatic checks (do not repeat these):\n${automatic.length ? automatic.map((f) => `- ${f.rule}: ${f.message}`).join("\n") : "- none"}`;
  const message = await ask(client, { model, system, prompt: user, effort: "high", format: { type: "json_schema", schema: JUDGE_SCHEMA } });
  return JSON.parse(textOf(message)).problems;
}

/** The plan, without calling anything: what would run, and how many requests. */
export function evalPlan(design, { runs = 3, judge = false, only } = {}) {
  const conditions = only ? [only] : CONDITIONS;
  const context = designContext(design);
  return {
    conditions,
    runs,
    requests: conditions.length * runs * (judge ? 2 : 1),
    contextCharacters: context.length,
  };
}

export async function runEval(design, { prompt, runs = 3, model = DEFAULT_MODEL, judge = false, only, client, onProgress = () => {} }) {
  const context = designContext(design);
  const conditions = only ? [only] : CONDITIONS;
  const results = [];
  for (const condition of conditions) {
    const system = condition === "habitat" ? `${BUILD_INSTRUCTIONS}\n\n${WITH_SYSTEM}\n\n<design-system>\n${context}\n</design-system>` : BUILD_INSTRUCTIONS;
    for (let run = 1; run <= runs; run++) {
      onProgress(`${condition} ${run}/${runs}: building`);
      const result = { condition, run };
      try {
        const reply = textOf(await ask(client, { model, system, prompt, effort: "medium" }));
        result.reply = reply;
        result.files = extractCode(reply, `${condition}-${run}`);
        result.automatic = checkCode(design, result.files);
        if (judge) {
          onProgress(`${condition} ${run}/${runs}: judging`);
          const code = result.files.map((f) => `// ${f.path}\n${f.text}`).join("\n\n");
          result.judged = await judgeRun(client, { model, context, prompt, code, automatic: result.automatic });
        }
      } catch (err) {
        result.error = err.message;
      }
      results.push(result);
    }
  }
  return { prompt, model, runs, judge, results };
}

// --- Summaries and the report -------------------------------------------

export function summarise(evalResult) {
  const out = {};
  for (const r of evalResult.results) {
    const s = (out[r.condition] ??= { totals: [], automatic: [], judged: [], byRule: {}, byType: {}, errors: 0 });
    if (r.error) {
      s.errors++;
      continue;
    }
    const judged = r.judged?.length ?? 0;
    s.automatic.push(r.automatic.length);
    s.judged.push(judged);
    s.totals.push(r.automatic.length + judged);
    for (const f of r.automatic) s.byRule[f.rule] = (s.byRule[f.rule] || 0) + 1;
    for (const p of r.judged || []) s.byType[p.type] = (s.byType[p.type] || 0) + 1;
  }
  return out;
}

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);
const range = (xs) => (Math.min(...xs) === Math.max(...xs) ? "" : ` (${Math.min(...xs)}–${Math.max(...xs)})`);
const fmt = (xs) => (xs.length ? `${Number(mean(xs).toFixed(1))}${range(xs)}` : "n/a");

export function reportMarkdown(evalResult, { journey, date, codeDir }) {
  const summary = summarise(evalResult);
  const { prompt, model, runs, judge } = evalResult;
  const lines = [
    `# Eval: ${journey || "untitled journey"}, ${date} (automatic)`,
    "",
    "<!-- Written by `habitat eval`. The generated code is kept so a person can check the count. -->",
    "",
    `- **Journey:** ${journey || "TODO"}`,
    `- **Conditions:** ${Object.keys(summary).map((c) => (c === "baseline" ? "baseline (no design system)" : "habitat (the design folder in the prompt)")).join("; ")}`,
    `- **Model:** ${model}, ${runs} run(s) per condition${judge ? ", reviewed by the same model as judge" : ""}`,
    `- **Prompt:** ${prompt.replace(/\n+/g, " ")}`,
    `- **Code:** \`${codeDir}\``,
    "",
    "## Problems per run",
    "",
    `| Condition | Automatic check | ${judge ? "Judge | " : ""}Total |`,
    `| --- | --- | ${judge ? "--- | " : ""}--- |`,
  ];
  for (const [condition, s] of Object.entries(summary)) {
    lines.push(`| ${condition} | ${fmt(s.automatic)} | ${judge ? `${fmt(s.judged)} | ` : ""}${fmt(s.totals)} |`);
  }
  lines.push("", "Numbers are the average per run, with the range in brackets.");
  if (summary.baseline?.totals.length && summary.habitat?.totals.length) {
    const before = mean(summary.baseline.totals);
    const after = mean(summary.habitat.totals);
    const drop = before ? Math.round(((before - after) / before) * 100) : 0;
    lines.push("", `**Total problems:** ${Number(after.toFixed(1))} with habitat, down from ${Number(before.toFixed(1))} without it (${drop}% fewer).`);
  }
  for (const [condition, s] of Object.entries(summary)) {
    const rules = Object.entries(s.byRule).map(([k, v]) => `${k} ${v}`).join(", ");
    const types = Object.entries(s.byType).map(([k, v]) => `${k} ${v}`).join(", ");
    lines.push("", `### ${condition}`, "", `- Automatic check, all runs: ${rules || "nothing found"}`);
    if (judge) lines.push(`- Judge, all runs: ${types || "nothing found"}`);
    if (s.errors) lines.push(`- ${s.errors} run(s) failed and are not counted`);
  }
  if (judge) {
    lines.push("", "## What the judge found", "", "| Condition | Run | Problem | Type | Rule |", "| --- | --- | --- | --- | --- |");
    for (const r of evalResult.results) {
      for (const p of r.judged || []) lines.push(`| ${r.condition} | ${r.run} | ${p.problem.replace(/\|/g, "\\|")} | ${p.type} | ${p.rule.replace(/\|/g, "\\|")} |`);
    }
    lines.push("", "A judge can be wrong. Read its list, strike what you disagree with, and turn each real problem into a rule, as with any eval.");
  }
  lines.push("", "## Next", "", "For each problem with habitat, find the missing rule and add it to the right file. Then run the same command again: the prompt is above.");
  return lines.join("\n") + "\n";
}

/** Write the report and the generated code into the design folder's evals/. */
export function writeEval(design, evalResult, { journey, date = new Date().toISOString().slice(0, 10) } = {}) {
  const slug = (journey || "eval").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const evals = join(design.root, "evals");
  const codeDir = join(evals, "runs", `${date}-${slug}`);
  for (const r of evalResult.results) {
    const dir = join(codeDir, `${r.condition}-${r.run}`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "reply.md"), r.reply ?? `This run failed: ${r.error}\n`);
    for (const f of r.files || []) writeFileSync(join(codeDir, f.path), f.text);
  }
  const reportPath = join(evals, `${date}-${slug}-auto.md`);
  writeFileSync(reportPath, reportMarkdown(evalResult, { journey, date, codeDir: relative(evals, codeDir) }));
  return { reportPath, codeDir };
}

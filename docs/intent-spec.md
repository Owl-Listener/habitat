# The intent spec

This is the contract every habitat component file carries, and the reasoning behind each field. It is deliberately the same shape as the checks in [agent-ready](https://github.com/Owl-Listener/agent-ready): agent-ready measures whether a file has these things, habitat helps you write them down for your own system. Between the two repos, the same standard is defined from two directions.

The contract is the YAML front matter at the top of each `components/<name>.md`. The schema lives in [`../schema/component.schema.json`](../schema/component.schema.json); tokens have their own in [`../schema/tokens.schema.json`](../schema/tokens.schema.json), and journeys in [`../schema/flow.schema.json`](../schema/flow.schema.json). This document explains why each field is there, and where its answer comes from.

## The mapping

| Contract field | What it captures | Where it comes from | agent-ready check |
| --- | --- | --- | --- |
| `name` | Canonical name plus aliases, so the same thing is referred to the same way | Figma (name), designer (aliases) | Naming consistency |
| `purpose` | Why the component exists, by purpose not appearance | Designer, starting from the Figma description | Description coverage and quality |
| `props` | Every settable prop, typed, with its Figma property name | Figma component properties | Component properties |
| `variants` | Named variants and the decision rule for each | Figma (names), designer (`whenToUse`) | Component coverage |
| `states` | The interaction and status states the component defines | Figma variant properties | State completeness |
| `anatomy` | The named parts, which are optional and what shows them, and the auto layout | Figma layers and auto layout | Auto-layout |
| `tokens` | Which token binds to which visual property | Figma variable bindings | Token binding |
| `relationships` | Where the component belongs, what it contains, what it pairs with | Designer, checked against real screens | Relationships and hierarchy |
| `antiPatterns` | What the agent must never do, why, and who said so | Designer only | The refusals that keep generated UI honest |
| `accessibility` | Role, keyboard, focus, ARIA, contrast | AI proposes the standard, designer confirms | Accessibility annotations |
| `content` | Real example content, never lorem | Figma text layers and real screens | Real content |
| `codeConnect` | Optional bridge to the implementation, and the prop mapping | Codebase or Figma Code Connect | Code Connect bridge |

Alongside these, every file carries lifecycle fields: `status` (draft, reviewed, deprecated), `owner`, `lastReviewed`, and `replacedBy` for deprecated components. They answer the questions an agent cannot: is this still true, and who decides?

Look down the third column. Figma holds the *what*. The *why* only exists in people's heads, which is why habitat's extraction is half reading and half interview.

## Drafts, TODOs and review

A file is `status: draft` while it is being written. Any answer the AI could not get is written as `TODO: <the question>`, and any guess it makes is written as `TODO confirm: <the guess>`, so a guess can never pass for a fact. The validator lists every open TODO. A person sets `status: reviewed` once every field is right, and the validator refuses a reviewed file that still has TODOs.

## Why anti-patterns are the heart of it

Tokens and props tell an agent what it *can* do. Anti-patterns tell it what it must *not* do, and that is the part it cannot infer on its own. An agent has no taste and no memory of the time someone put two primary buttons side by side and the screen lost its meaning. The `antiPatterns` field is where that hard-won judgment gets written down so it survives into every interface the agent builds.

Each anti-pattern has two parts on purpose: the `never`, which is the rule, and the `because`, which is the reason. The reason matters because an agent that understands *why* a rule exists can apply it to situations the rule never literally named. A rule without a reason is brittle. A rule with a reason travels.

## Why principles sit above components

Some judgement belongs to no single component: what brand colour means, how dense a screen should be, how the product talks, how forms validate and where focus goes. That lives in `DESIGN.md`, in prose, and the MCP server tells agents to read it first. It is where you write down how you design, not only what you design.

## Why tokens have tiers

A primitive (`color.teal.600`) says what a value is; a semantic token (`color.brand.default`) says what it is for. Components should bind to semantic tokens, so that re-theming changes one alias rather than every component, and so that an agent choosing a colour chooses a role, not a hex code. The validator warns when a component binds to a primitive. The usage rule for a token (where it may and may not go) lives in its `useFor` and `avoid`, because that is the guidance a name cannot carry.

## Why research sits underneath the rules

A rule is compressed judgement: it tells an agent what to do in the cases someone foresaw. A research insight is what the judgement was compressed from, and it is what lets an agent reason about a case nobody wrote a rule for. So insights live in `research/insights/`, one finding per file, each with its evidence and an honest `confidence` (strong, emerging or hunch), and rules cite them: `evidence: [INS-004]` on an anti-pattern or variant, or the id in brackets in `DESIGN.md`. The schemas are [`../schema/insight.schema.json`](../schema/insight.schema.json) and, for the optional descriptions of who the product serves, [`../schema/person.schema.json`](../schema/person.schema.json).

The links make three things checkable: a rule that cites research which does not exist or has been retired, a rule that rests only on a hunch, and a finding that no rule has acted on yet. Research files hold distilled, anonymised findings and link to their sources, never transcripts or personal data, because they are committed to a repository and read by AI tools.

## Why journeys have their own files

A component file says what one part is for. It can't say what comes before or after it, which is what an agent needs when it's asked for the third screen of a journey. A flow file holds that: the screens of one core journey, the components on each, and the transitions between them.

The screens and transitions come from the Figma prototype's connections, so they are facts. Two things never come from the prototype, and they are the point of the file. The `condition` on a transition (when is this step allowed?) and the `unhappyPaths` (what does the user see when sending fails, or when they leave halfway?) come from the designer, because prototypes almost always show only the path where everything works. That's exactly where agents improvise. A flow can carry `antiPatterns` too, for rules that belong to a journey rather than a component, like "never add a confirmation dialog before sending".

## Why tokens can come from styles, and travel as DTCG

Plenty of Figma libraries still keep colours, type and shadows as styles rather than variables. An agent needs both, so a token can record where it came from: `figma.variable`, or `figma.style` and `figma.styleType`. A text style's value is an object (font, size, weight, line height). When a colour style and a variable share a value, the validator says so, because two names for one decision means an agent will use either.

Tokens can also move in and out as W3C design tokens (DTCG) JSON, the format Figma's variable export and most token tools share. Import follows the same rule as refresh: values, aliases and modes are facts and get updated; meaning, useFor and avoid are judgement and never get touched. Export carries the judgement along in `$description` and `$extensions.habitat`, so it isn't lost on the way to another tool.

## Why evals are part of the spec

A contract is only as good as the screens an agent builds from it. `evals/` records the same prompt run before the documentation existed and after each round of calibration, with a count of what went wrong. The drop is the evidence that the documentation works, and every problem that survives points at the rule still missing.

A count made by eye depends on who is looking. `habitat eval` makes the count repeatable: it runs the prompt several times with and without the design system (AI output varies, so one run proves little), counts what the automatic checks find, and with `--judge` asks Claude to review each screen against the system's own rules. Both conditions are judged against the same rules, so the baseline is measured against the rules it never saw. The generated code is kept, because a judge can be wrong and a person should be able to check.

## Why this is a standard, not just a file format

If the fields are stable and the meaning is shared, anyone can write a contract, anyone can validate it, and any agent that learns to read one habitat contract can read them all. agent-ready already emits an `@agent-ready-report` block that records what an agent saw and what it had to guess. That report is the audit half of the same standard: the contract says what should be true, the report says what was actually found. Keep the two aligned and you have a measurable, enforceable definition of what it means for a design system to be ready for agents.

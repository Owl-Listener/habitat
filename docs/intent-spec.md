# The intent spec

This is the contract every habitat component carries, and the reasoning behind each field. It is deliberately the same shape as the checks in [agent-ready](https://github.com/Owl-Listener/agent-ready): agent-ready measures whether a file has these things, habitat demonstrates what they look like when present. Between the two repos, the same standard is defined from two directions.

The schema lives in [`../schema/component.schema.json`](../schema/component.schema.json). This document explains why each field is there.

## The mapping

| Contract field | What it captures | agent-ready check |
| --- | --- | --- |
| `name` | Canonical name plus aliases, so the same thing is referred to the same way | Naming consistency |
| `purpose` | Why the component exists, by purpose not appearance | Description coverage and quality |
| `props` | Every settable prop, fully typed | Component properties |
| `variants` | Named variants and the decision rule for each | Component coverage |
| `states` | The interaction and status states the component defines | State completeness |
| `tokens` | Which token binds to which visual property | Token binding |
| `relationships` | Where the component belongs, what it contains, what it pairs with | Relationships and hierarchy |
| `antiPatterns` | What the agent must never do, and why | The refusals that keep generated UI honest |
| `accessibility` | Role, keyboard, focus, ARIA, contrast | Accessibility annotations |
| `content` | Real example content, never lorem | Real content |
| `codeConnect` | The bridge from contract to implementation, and the prop mapping | Code Connect bridge |

## Why anti-patterns are the heart of it

Tokens and props tell an agent what it *can* do. Anti-patterns tell it what it must *not* do, and that is the part it cannot infer on its own. An agent has no taste and no memory of the time someone put two primary buttons side by side and the screen lost its meaning. The `antiPatterns` field is where that hard-won judgment gets written down so it survives into every interface the agent builds.

Each anti-pattern has two parts on purpose: the `never`, which is the rule, and the `because`, which is the reason. The reason matters because an agent that understands *why* a rule exists can apply it to situations the rule never literally named. A rule without a reason is brittle. A rule with a reason travels.

## Why this is a standard, not just a file format

If the fields are stable and the meaning is shared, anyone can write a contract, anyone can validate it, and any agent that learns to read one habitat contract can read them all. agent-ready already emits an `@agent-ready-report` block that records what an agent saw and what it had to guess. That report is the audit half of the same standard: the contract says what should be true, the report says what was actually found. Keep the two aligned and you have a measurable, enforceable definition of what it means for a design system to be ready for agents.

## Adding a component

1. Copy the `components/button/` folder as your template.
2. Replace the implementation and styles. Bind every value to a token.
3. Fill in the contract. Do not skip `antiPatterns` or `accessibility`; they are required for a reason.
4. Validate against the schema before you commit.
5. Run agent-ready over it. Full marks means the contract is complete.

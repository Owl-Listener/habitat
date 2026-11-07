---
name: habitat-refresh
description: Bring a project's habitat design files back in line with Figma (and code) after the design system has changed. Re-reads components, variables, styles and prototype connections through the Figma MCP server, updates the facts (props, variants, states, anatomy, token values and bindings, screens and transitions), never rewrites the designer's judgement (purpose, whenToUse, anti-patterns, conditions, unhappy paths, principles), and reports every change that needs a person - new variants without a decision rule, rules that mention removed variants, new screens in a journey, components in Figma with no file, and components with no code counterpart. Use when someone says the design system or Figma library has changed, asks to sync, update or refresh the habitat files, check for drift, or runs /habitat-refresh.
---

# habitat-refresh

A design system keeps changing, and documentation that no longer matches it is worse for an agent than none: the agent follows it with confidence. Your job is to bring the habitat files back in line with Figma and code, and to hand the designer a short list of the decisions the change needs from them.

## The one rule

**Facts are refreshed; judgement is preserved.**

| You may update | You must never rewrite |
| --- | --- |
| `props` (and their `figma` mapping), `variants[].name`, `states`, `anatomy`, `tokens` bindings, `content.examples`, `figma` links | `purpose`, `whenToUse`, `antiPatterns`, `relationships`, `accessibility` decisions, notes, anything in `DESIGN.md` |
| In `tokens.md`: `value`, `aliasOf`, `modes`, `tier`, `type`, `figma`, new tokens | `meaning`, `useFor`, `avoid` |
| In `flows/`: `screens` (names, node ids, components), `transitions` (from, to, trigger, element, action), `figma` | `purpose`, `condition`, `unhappyPaths`, `antiPatterns`, `end`, notes |

When a fact changes in a way that may make judgement wrong (a variant renamed, a state removed, a token's value changed a lot), do not edit the judgement. Flag it for the designer.

## Step 1: Load what is written down

Read `design/tokens.md`, every file in `design/components/` and every file in `design/flows/`. Note each component's `figma.nodeId`, `status` and `lastReviewed`.

## Step 2: Re-read Figma

Use the Figma MCP tools (`get_metadata`, `get_variable_defs`, `get_design_context`, `search_design_system`):

- **Tokens:** read the variables again. Compare names, values, aliases and modes with `tokens.md`. If the designer can export the variables as W3C design tokens JSON, `npx @owl-listener/habitat tokens import <file.json…> --design design --dry-run` lists every change without touching the file; run it again without `--dry-run` to apply the facts. It never touches `meaning`, `useFor` or `avoid`.
- **Styles:** read the paint, text and effect styles again (the `use_figma` snippet in `/habitat-extract`, step 2b) and compare them with the tokens that have a `figma.style`.
- **Flows:** for each file in `flows/`, read the prototype's connections again on its page (the `use_figma` snippet in `/habitat-extract`, step 4) and compare screens and transitions.
- **Each component with a `figma.nodeId`:** read its properties, variants, states, layers and auto layout, and its variable bindings. Compare with the file, field by field.
- **The whole library:** list its components, and find any that have no file in `components/`.

If a `nodeId` no longer exists, search for the component by name; if it is gone, flag it (it may be deprecated).

## Step 3: Compare with code

If the project's component library has a Storybook with the Storybook MCP addon, or a shadcn registry with the shadcn MCP, read it too: it is a second source of facts about what exists in code and which props it takes, and it often shows components that Figma does not. Treat a disagreement between Storybook, Figma and the habitat file as a fact to report, never as a reason to change judgement.

Run `npx @owl-listener/habitat parity design --code <the component folder>`. It reports contracts whose implementation is missing, props and options that are not in the code, and components in code with no contract. Ask the designer where the component code lives if you do not know.

## Step 4: Update the facts

Edit the fact fields in place, keeping the files' existing formatting and comments. For a new component in Figma, create a draft file from `design/components/_TEMPLATE.md` with the facts filled in and every judgement field left as `TODO`; it can go through `/habitat-extract`'s interview later. For a new token, add it with `meaning: TODO: what is this for?`.

Do not change `status` or `lastReviewed`; those record a person's review.

## Step 5: Report what needs a person

Give the designer one list, grouped like this, and only include groups that have something in them:

```markdown
# Refresh: <date>

## Decisions needed
- Button has a new variant "danger". When should it be used? (whenToUse is TODO)
- Button's anti-pattern 2 mentions the "ghost" variant, which no longer exists in Figma.
- color.brand.default changed from #1f6f6b to #0e7c66. Do its useFor and avoid still hold?

## New in Figma, not yet documented
- Tooltip (draft file created: components/tooltip.md)

## Journeys that changed
- Send an invoice: new screen "Choose template" between customer and details. What is it for, and can it be skipped?
- Send an invoice: the transition review → sent now opens an overlay. Is that a confirmation dialog? anti-pattern 1 says never add one.

## Gone from Figma
- Chip (node 22:10 not found). Deprecate it, and if so, what replaces it?

## Figma and code disagree
- Input: prop "size" is in Figma but not in Input.tsx
- DatePicker.tsx exists in code with no contract

## Updated automatically
- Button: states (added "pressed"), anatomy.layout.gap (space.sm → space.xs)
- tokens.md: 3 values changed, 2 tokens added, 1 text style changed size
- flows/send-invoice.md: node ids of 2 screens
```

## Step 6: Finish

1. Run `npx @owl-listener/habitat validate design` and fix anything the refresh broke.
2. When the designer has answered the decisions, write their answers in (with `source` on any new anti-pattern), and let them set `lastReviewed` on the files they have checked.
3. If the change was large, suggest re-running the latest eval prompt to see whether AI output has changed.

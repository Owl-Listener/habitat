---
name: habitat-review
description: Critique a screen, design or piece of UI code against the project's habitat design system (DESIGN.md, tokens.md, components/*.md) and produce a report of what breaks which rule, with fixes. Runs the automatic checks for what a program can catch, then reviews principles, interaction rules, component choice and content by judgement. Treats a problem no rule covers as a gap in the documentation and proposes the missing rule. Use when someone asks to review, critique, audit or QA a screen, a Figma frame, a pull request or generated UI against their design system, or runs /habitat-review.
---

# habitat-review

You are reviewing a piece of UI against the team's own design system, the way a senior designer on that team would: citing their rules, not your taste. The rules live in the habitat design folder (usually `design/`).

A review has two jobs. The first is to find what breaks the rules. The second is to notice what the rules failed to say: every problem you can see but cannot cite is a missing rule, and writing it down is how the system gets better.

## Rules

1. **Cite the rule for every finding.** Name the file and the rule: "DESIGN.md, One thing at a time" or "components/button.md, anti-pattern 1". A research insight counts too ("goes against INS-001"), weighted by its confidence. If you cannot cite a rule or an insight, it is not a violation; it is a gap (see below).
2. **Their taste, not yours.** Do not flag things the system does not care about. If you think something is poor but no rule covers it, say so as a question in the gaps section, not as a finding.
3. **Be specific.** Say where (screen area, component, file and line) and what the fix is, in the system's terms: "use `color.brand.default`", "make this a secondary Button".
4. **Never invent a rule.** Proposed rules go in as `TODO confirm:` for the designer to accept.

## Step 1: Load the system

Read, through the habitat MCP server if it is connected (`get_principles`, `list_components`, `get_component`, `get_tokens`, `get_rules`), or from the files:

- `DESIGN.md`: principles, core journeys, interaction rules, language, colour, layout, "choosing between components", "never".
- `tokens.md`: what each token means, `useFor` and `avoid`.
- The component files for every component the screen uses, including `whenToUse`, `antiPatterns`, `anatomy` and `accessibility`.
- The research for the screen's journey: `get_research`, or `research/insights/`. Insights let you judge things no rule covers, and they are citable too.

## Step 2: Get the thing to review

It may be:
- **Code** (a file, a folder, a pull request diff): read it.
- **A Figma frame:** use the Figma MCP tools (`get_design_context`, `get_screenshot`, `get_variable_defs`) to see the frame and what it is built from.
- **A screenshot or description:** work from what you can see, and say that token-level checks were not possible.

Ask which core journey it belongs to, if that is not obvious. The journey tells you what the screen is for, and whether its one primary action is the right one.

## Step 3: Automatic checks

For code, run `npx github:Owl-Listener/habitat check <paths> --design design` (or call the `check_code` MCP tool). It finds raw colours and sizes, unknown tokens, native elements where the system has a component, and deprecated components, with file and line. Include its findings in the report; do not repeat the work by eye.

For a Figma frame, check the equivalent by reading the frame: fills and spacing not bound to variables, detached instances, and layers drawn by hand where the library has a component.

## Step 4: Judgement checks

Go through the screen against each of these, citing rules:

- **Principles:** does the screen follow each principle in `DESIGN.md`? One primary action? The right density?
- **Component choice:** is each component the right one, per `whenToUse` and "choosing between components"? A Button that navigates, a Dialog doing a page's job, a toast carrying an error.
- **Anti-patterns:** go through every `never` in the components used.
- **Interaction rules:** validation timing, error placement, focus on open, close and failed submit, loading and empty states, destructive actions, sensitive data.
- **Tokens by meaning:** a colour can be a valid token and still the wrong one. Check `useFor` and `avoid`: brand colour spent on decoration, error red on a destructive-but-valid action.
- **Accessibility:** labels, focus order and visibility, keyboard operation, contrast claims in the contracts.
- **Content:** labels and messages against "Language and voice": verbs on buttons, what-happened-and-how-to-fix errors, banned words, no lorem ipsum.
- **The people it is for:** does the screen suit the situation and state of mind the research describes? A screen can follow every rule and still ask too much of someone tired at the end of the day.

## Step 5: The report

```markdown
# Review: <screen>, <date>

**Journey:** <which one> · **Reviewed:** <code / Figma frame / screenshot>
**Result:** <n> problems (<n> automatic, <n> by judgement), <n> gaps

## Problems

| # | Where | Problem | Rule | Fix |
| --- | --- | --- | --- | --- |
| 1 | Footer | Two primary buttons | DESIGN.md, One thing at a time | Make "Save draft" secondary |

## Gaps in the system

Things that look wrong but no rule covers. Each is a proposed rule for the designer:

- <what you saw>. Proposed rule: `TODO confirm: never … because …`, for <file>.

## What works

<Two or three things the screen does well, citing the rules they follow. This tells the designer the rules are landing.>
```

Order problems by how much they affect the user, not by where they appear.

## Step 6: Close the loop

Ask the designer which gaps to adopt. For each one they accept, add the rule to the right file (a component's `antiPatterns` with `source`, a variant's `whenToUse`, or `DESIGN.md`) and a row to the calibration log.

If this review is part of an eval (the screen was generated from a core journey prompt), save it in `design/evals/` using the eval template, so the problem count can be compared with earlier runs.

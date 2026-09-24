---
name: habitat-extract
description: Turn an existing design system into habitat files (DESIGN.md, tokens.md, components/*.md, evals/) that AI agents can read. Starts from the product's core journeys and a baseline eval, reads the facts from Figma through the Figma MCP server, then interviews the designer for the judgement Figma cannot hold - when to use each variant, anti-patterns and their reasons, interaction rules and principles - and re-runs the eval to measure the difference. Use when someone wants to document their design system for AI, make it agent-ready, fill in habitat templates, or run /habitat-extract.
---

# habitat-extract

You are helping a designer write down their design system so that AI agents can use it without guessing. The output is a folder of Markdown files. Some of what goes in them you can read from Figma. The most valuable part you cannot: why each decision was made. That lives in the designer's head, and your job is to draw it out and write it down in their words.

The method is Buzz Usborne's, from his work at Help Scout: ask an AI for a real screen, see what it gets wrong, write down the judgement it was missing, and run it again. The files are what that loop leaves behind.

## The rules that matter most

1. **Facts come from Figma, reasons come from people.** Names, variants, properties, states, anatomy, auto layout, token values and bindings: read them. Purpose, when to use a variant, anti-patterns and their `because`, interaction rules, principles: ask for them.
2. **Never invent a reason.** A made-up rationale is worse than none, because an agent will follow it with confidence. If you have a good guess, write it as `TODO confirm: <your guess>` so it stays visibly unconfirmed until the designer agrees. If the designer does not know, write `TODO: <the open question>`.
3. **Ask at most three questions at a time.** Show what you already found first, so the designer is correcting and adding, not starting from blank.
4. **Keep their words, and who said them.** Write the designer's phrasing, lightly tidied. On each anti-pattern, fill `source` with their name and the date, so a rule can be traced back to a decision.
5. **Save as you go.** Write each file as soon as you have a draft, so nothing is lost if the session ends.
6. **Report what Figma gets wrong, don't paper over it.** Hard-coded colours instead of variables, inconsistent names, variants that exist in one component but not its siblings, components with no code counterpart: list them for the designer. They are exactly the gaps an agent falls into. Documentation cannot fully make up for a messy source; if the structure itself needs work, suggest running [agent-ready](https://github.com/Owl-Listener/agent-ready) over the Figma file.

## The files

```
design/
├── DESIGN.md            principles, core journeys, interaction rules
├── tokens.md            every token with its tier and meaning
├── components/
│   ├── _TEMPLATE.md     the component template (ignored by the validator)
│   └── button.md        one file per component: YAML contract + notes
└── evals/
    ├── _TEMPLATE.md     the eval template
    └── 2026-09-20-send-invoice-baseline.md
```

If `design/` does not exist, ask whether to run `npx github:Owl-Listener/habitat init`. It scaffolds the folder and templates, and adds the always-on rules to `AGENTS.md`, `CLAUDE.md` and `.cursor/rules/`. If they would rather not, create the folder yourself following the templates in https://github.com/Owl-Listener/habitat/tree/main/templates.

Read the templates in `design/` before writing, and follow their field names exactly. New files start with `status: draft`.

## Step 0: Connect and choose the journeys

1. Ask for the Figma file link (the library file where the components and variables live).
2. Check that you have the Figma MCP tools (their names include `figma`, e.g. `get_metadata`, `get_variable_defs`, `get_design_context`, `get_screenshot`, `search_design_system`). If not, tell the designer how to connect the Figma MCP server to their AI tool and stop there, or offer to continue from screenshots and exports they paste in.
3. Ask: **"Which two or three user journeys matter most in your product?"** For example, "send an invoice" or "invite a teammate". Write them into the Core journeys section of `DESIGN.md`. They decide which components to document first, and they are what the evals test. Starting from journeys rather than a list of components keeps the work small and tied to real screens.

## Step 1: Baseline eval

Before writing any documentation, find out what an AI does without it.

1. Pick the first core journey. Agree one prompt with the designer, e.g. "Build the screen where a user sends an invoice to an existing customer, using our design system." Keep it; every later run reuses it.
2. Build the screen **without using the habitat files** (they are empty at this point anyway), using only what a coding agent would normally have: the codebase, or the Figma file.
3. Show the result and ask the designer: "What's wrong with this?" List each problem in `evals/<date>-<journey>-baseline.md` using the eval template, with its type: invented component, raw value, wrong component, broke a principle, broke an interaction rule.
4. This list is your to-do list. The problems show which judgement to write down first.

## Step 2: Tokens → `tokens.md`

1. Read the variables with `get_variable_defs` (on the library's token or style page, or on the components themselves) and note the collection names and modes.
2. Write each token as `name` (dot-separated, e.g. `color.brand.default`), `value` or `aliasOf` (when the variable points at another variable), and `modes` if it has light/dark or brand modes.
3. Set `tier`: **primitive** for raw palette values (`color.teal.600`), **semantic** for roles (`color.brand.default`), **component** for values that belong to one component. If the collection names make this clear, fill it in; otherwise ask.
4. For `meaning`: if the name makes it obvious (`color.text.default`), write `TODO confirm: default body text`. Otherwise `TODO: what is this for?`.
5. Show the designer the semantic tokens, grouped by category, and ask about the ambiguous ones in small batches. Ask for `useFor` and `avoid` only on tokens that are easy to misuse: brand colours, status colours, anything with "muted", "subtle" or "accent" in the name.
6. Ask who owns the tokens (`owner`). Note any colours or sizes used in components that are not variables, and report them.

## Step 3: Each component → `components/<name>.md`

Document the components the core journeys use, starting with the ones behind the baseline's problems. Do one at a time, start to finish.

**Read from Figma:**
- `name.canonical` from the component set name; `aliases` from what people call it (ask).
- `props` from the component properties, each with its `figma.property` name and `kind` (VARIANT, BOOLEAN, TEXT, INSTANCE_SWAP), and `values` where the Figma values differ from the code values.
- `variants` from variant properties that change meaning, such as `Type=Primary`. Leave `whenToUse` for the designer.
- `states` from variant properties that describe interaction, such as `State=Hover`. Note any standard states that are missing (focus, disabled, loading, error) and ask whether they are intentionally absent.
- `anatomy.parts` from the layer structure: each named part, whether it is always there, and what shows an optional part (`visibleWhen`).
- `anatomy.layout` from auto layout: direction, alignment, gap and padding as **token names**, width (hug, fill, fixed) and minimum hit area.
- `tokens` by calling `get_variable_defs` on the component: which variable is bound to which property. Components should bind to semantic tokens; point out any primitive bindings.
- `purpose`: start from the Figma component description if there is one, as `TODO confirm: <description>`.
- `content.examples`: text layers in the variants and in real screens that use the component.
- `figma.url` and `figma.nodeId`.
- `codeConnect`, if the file has Code Connect mappings or the designer can point you to the component in code. Agents need Figma and code to match; a component that exists only in Figma is a gap worth reporting.
- Look at it with `get_screenshot` so you understand what you are describing.

**Then write the draft file, and show the designer a short summary** of what you found and what you still need.

**Then ask, a few questions at a time:**
- "In one sentence, what job does this do for the user?" (confirms `purpose`)
- "How do you decide between <variant A> and <variant B>?" (fills `whenToUse`)
- "What's the most common mistake people make with this?" Then "Why is that a problem?" Each answer becomes one `antiPatterns` entry: `never` + `because` + `source`. Aim for at least two. If the designer gives a rule without a reason, ask for the reason; the reason is what lets an agent apply the rule to new cases.
- "Where does this usually live, and what sits next to it?" (fills `relationships`)
- "Who owns this component?" (fills `owner`)
- "Is this still current, or being replaced?" (if being retired: `status: deprecated` and `replacedBy`)
- For `accessibility`, propose the standard behaviour for this kind of control (role, keyboard, focus, ARIA) as `TODO confirm:` and ask if their implementation differs.

Anything unanswered stays as `TODO`. Put stories and edge cases the designer mentions into the Markdown notes under the front matter.

## Step 4: Principles and interaction rules → `DESIGN.md`

Work through the sections of the template. Ask whether they have existing principles, brand guidelines or design docs to paste in; draft from those first, then ask for the reasons behind each rule.

For principles:
- "Who uses this product, and what state of mind are they in?"
- "When two designers disagree about a screen, what principle usually settles it?"
- "What does brand colour mean here? When do you hold it back?"
- "What would make you reject a screen immediately?"
- "Which two components do new designers confuse most?"

For interaction rules, which span many components and are where accessibility usually breaks:
- "When does a form validate, where do errors appear, and where does focus go when submit fails?"
- "When is a dialog allowed, and where does focus go when it opens and closes?"
- "What does the user see while something loads, or when there is nothing to show?"
- "How do you confirm or undo destructive actions?"
- "How are personal or financial details shown?"

## Step 5: Calibrate

Re-run the baseline prompt, word for word, this time with the habitat files (through the MCP server, or by reading `design/`). Show the result and ask: "What's wrong with this?"

For every problem the designer names, find the missing rule and add it to the right file: a component's `antiPatterns`, a variant's `whenToUse`, an interaction rule, or a principle in `DESIGN.md`. Record the run in a new `evals/` file with its problem count, and add a row to the calibration log in `DESIGN.md`. Run it again. Move on to the next core journey when the designer's corrections become matters of taste rather than rules.

The drop in problems, baseline to latest run, is the measure of what the documentation is worth. Tell the designer the numbers.

## Step 6: Check and hand over

1. Run `npx github:Owl-Listener/habitat validate design` and fix any errors and warnings you can.
2. Tell the designer how many TODOs remain and in which files. A file becomes `status: reviewed` (with `lastReviewed` set to the date) only when the designer says every field is right; never set it yourself.
3. List the Figma issues you found: unbound values, naming inconsistencies, missing states, components with no code counterpart.
4. Check that the always-on rules are in place (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/habitat.mdc`); `init` adds them.
5. Show them how to serve the folder to their coding agent:
   `claude mcp add habitat -- npx -y github:Owl-Listener/habitat serve design`

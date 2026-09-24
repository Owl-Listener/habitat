---
name: habitat-extract
description: Turn an existing design system into habitat files (DESIGN.md, tokens.md, components/*.md) that AI agents can read. Reads the facts from Figma through the Figma MCP server, then interviews the designer for the judgement Figma cannot hold - when to use each variant, anti-patterns and their reasons, and product-wide principles. Use when someone wants to document their design system for AI, make it agent-ready, fill in habitat templates, or run /habitat-extract.
---

# habitat-extract

You are helping a designer write down their design system so that AI agents can use it without guessing. The output is a folder of Markdown files. Some of what goes in them you can read from Figma. The most valuable part you cannot: why each decision was made. That lives in the designer's head, and your job is to draw it out and write it down in their words.

## The rules that matter most

1. **Facts come from Figma, reasons come from people.** Names, variants, properties, states, token values and bindings: read them. Purpose, when to use a variant, anti-patterns and their `because`, principles: ask for them.
2. **Never invent a reason.** A made-up rationale is worse than none, because an agent will follow it with confidence. If you have a good guess, write it as `TODO confirm: <your guess>` so it stays visibly unconfirmed until the designer agrees. If the designer does not know, write `TODO: <the open question>`.
3. **Ask at most three questions at a time.** Show what you already found first, so the designer is correcting and adding, not starting from blank.
4. **Keep their words.** When the designer explains a rule, write their phrasing, lightly tidied. Their voice is part of the system.
5. **Save as you go.** Write each file as soon as you have a draft, so nothing is lost if the session ends.
6. **Report what Figma gets wrong, don't paper over it.** Hard-coded colours instead of variables, inconsistent names, variants that exist in one component but not its siblings: list them for the designer. They are exactly the gaps an agent would fall into.

## The files

```
design/
├── DESIGN.md            product-wide principles, plain Markdown
├── tokens.md            YAML front matter: every token with its meaning
└── components/
    ├── _TEMPLATE.md     the component template (ignored by the validator)
    └── button.md        one file per component: YAML contract + notes
```

If `design/` does not exist, ask whether to run `npx github:Owl-Listener/habitat init` (it scaffolds the folder and templates). If they would rather not, create the folder yourself following the structure of the templates in https://github.com/Owl-Listener/habitat/tree/main/templates.

Read `design/components/_TEMPLATE.md` and `design/tokens.md` before writing, and follow their field names exactly. Every component file starts with `kind: component` and `status: draft`; every tokens file with `kind: tokens` and `status: draft`.

## Step 0: Connect

1. Ask for the Figma file link (the library file where the components and variables live).
2. Check that you have the Figma MCP tools (their names include `figma`, e.g. `get_metadata`, `get_variable_defs`, `get_design_context`, `get_screenshot`, `search_design_system`). If not, tell the designer how to connect the Figma MCP server to their AI tool and stop there, or offer to continue from screenshots and exports they paste in.
3. Ask one question about scope: "Which five components cause the most trouble, or get used the most?" Start with those. A whole system in one session is too much for both of you.

## Step 1: Tokens → `tokens.md`

1. Read the variables with `get_variable_defs` (on the library's token or style page, or on the components themselves) and note the collection names and modes.
2. Write each token as `name` (dot-separated, e.g. `color.brand.default`), `value`, and `modes` if it has light/dark or brand modes.
3. For `meaning`: if the name makes it obvious (`color.text.default`), write `TODO confirm: default body text`. Otherwise `TODO: what is this for?`.
4. Show the designer the list, grouped by category, and ask about the ambiguous ones in small batches. Ask for `useFor` and `avoid` only on the tokens that are easy to misuse: brand colours, status colours, anything with "muted", "subtle" or "accent" in the name.
5. Note any colours or sizes used in components that are not variables. Report them.

## Step 2: Each component → `components/<name>.md`

Do one component at a time, start to finish, before moving on.

**Read from Figma:**
- `name.canonical` from the component set name; `aliases` from what people call it (ask).
- `props` from the component properties (boolean, text, instance swap, variant).
- `variants` from variant properties that change meaning, such as `Type=Primary`. Leave `whenToUse` for the designer.
- `states` from variant properties that describe interaction, such as `State=Hover`. Note any standard states that are missing (focus, disabled, loading, error) and ask whether they are intentionally absent.
- `tokens` by calling `get_variable_defs` on the component: which variable is bound to which property.
- `purpose`: start from the Figma component description if there is one, as `TODO confirm: <description>`.
- `content.examples`: text layers in the variants and in real screens that use the component.
- `figma.url` and `figma.nodeId`.
- Look at it with `get_screenshot` so you understand what you are describing.

**Then write the draft file, and show the designer a short summary** of what you found and what you still need.

**Then ask, a few questions at a time:**
- "In one sentence, what job does this do for the user?" (confirms `purpose`)
- "How do you decide between <variant A> and <variant B>?" (fills `whenToUse`)
- "What's the most common mistake people make with this?" Then "Why is that a problem?" Each answer becomes one `antiPatterns` entry: `never` + `because`. Aim for at least two. If the designer gives a rule without a reason, ask for the reason; the reason is what lets an agent apply the rule to new cases.
- "Where does this usually live, and what sits next to it?" (fills `relationships`)
- For `accessibility`, propose the standard behaviour for this kind of control (role, keyboard, focus, ARIA) as `TODO confirm:` and ask if their implementation differs.
- If they have it in code: "Where is it in your codebase?" (fills optional `codeConnect`)

Anything unanswered stays as `TODO`. Put stories and edge cases the designer mentions into the Markdown notes under the front matter.

## Step 3: Principles → `DESIGN.md`

Work through the sections of the template. Good openers:
- "Who uses this product, and what state of mind are they in?"
- "When two designers disagree about a screen, what principle usually settles it?"
- "What does brand colour mean here? When do you hold it back?"
- "What would make you reject a screen immediately?"
- "Which two components do new designers confuse most?"

Ask whether they have existing principles, brand guidelines or design docs to paste in; draft from those first, then ask for the reasons behind each rule.

## Step 4: Calibrate

This is where the files get good. Ask the designer for a real, everyday screen (e.g. "the settings page", "the invoice form"). Build it, or describe it component by component, using only what the habitat files say. Show it, and ask: "What's wrong with this?"

For every problem the designer names, find the missing rule and add it to the right file: a component's `antiPatterns`, a variant's `whenToUse`, or `DESIGN.md`. Add a row to the calibration log in `DESIGN.md` (date, what the AI did, the rule added). Run the same screen again. Stop when the designer's corrections become matters of taste rather than rules.

## Step 5: Check and hand over

1. Run `npx github:Owl-Listener/habitat validate design` and fix any errors.
2. Tell the designer how many TODOs remain and in which files. A file becomes `status: reviewed` only when the designer says every field is right; never set it yourself.
3. List the Figma issues you found (unbound values, naming inconsistencies, missing states).
4. Show them how to serve the folder to their coding agent:
   `claude mcp add habitat -- npx -y github:Owl-Listener/habitat serve design`

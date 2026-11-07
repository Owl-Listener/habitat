---
name: habitat-extract
description: Turn an existing design system into habitat files (DESIGN.md, tokens.md, components/*.md, flows/*.md, evals/) that AI agents can read. Starts from the product's core journeys and a baseline eval, reads the facts from Figma through the Figma MCP server (variables, styles, components and prototype connections), then interviews the designer for the judgement Figma cannot hold - when to use each variant, anti-patterns and their reasons, what happens when a journey goes wrong, interaction rules and principles - and re-runs the eval to measure the difference. Use when someone wants to document their design system for AI, make it agent-ready, fill in habitat templates, or run /habitat-extract.
---

# habitat-extract

You are helping a designer write down their design system so that AI agents can use it without guessing. The output is a folder of Markdown files. Some of what goes in them you can read from Figma. The most valuable part you cannot: why each decision was made. That lives in the designer's head, and your job is to draw it out and write it down in their words.

The method is a loop: ask an AI for a real screen, see what it gets wrong, write down the judgement it was missing, and run it again. The files are what that loop leaves behind.

## The rules that matter most

1. **Facts come from Figma, reasons come from people.** Names, variants, properties, states, anatomy, auto layout, variables, styles, token values and bindings, and the prototype's screens and connections: read them. Purpose, when to use a variant, anti-patterns and their `because`, when a transition is allowed, what happens when things go wrong, interaction rules, principles: ask for them.
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
├── flows/
│   ├── _TEMPLATE.md     the flow template
│   └── send-invoice.md  one file per core journey: screens and transitions
└── evals/
    ├── _TEMPLATE.md     the eval template
    └── 2026-09-20-send-invoice-baseline.md
```

If `design/` does not exist, ask whether to run `npx @owl-listener/habitat init`. It scaffolds the folder and templates, and adds the always-on rules to `AGENTS.md`, `CLAUDE.md` and `.cursor/rules/`. If they would rather not, create the folder yourself following the templates in https://github.com/Owl-Listener/habitat/tree/main/templates.

Read the templates in `design/` before writing, and follow their field names exactly. New files start with `status: draft`.

## Step 0: Connect and choose the journeys

1. Ask for the Figma file link (the library file where the components and variables live).
2. Check that you have the Figma MCP tools (their names include `figma`, e.g. `get_metadata`, `get_variable_defs`, `get_design_context`, `get_screenshot`, `search_design_system`, `use_figma`). If not, tell the designer how to connect the Figma MCP server to their AI tool and stop there, or offer to continue from screenshots and exports they paste in.
   If the Figma file is too messy to trust, or there isn't one, offer to start from the live product instead: screenshots of real screens, or the site's URL if you can read it. Read the colours, type, spacing and components from what ships, mark everything you infer as `TODO confirm:`, and say plainly that the source is the product, not the library. The interview is the same either way.
3. If the project also has Storybook (with the Storybook MCP addon) or a shadcn registry (with the shadcn MCP), use them alongside Figma: they say what exists in code and which props it really takes.
4. Ask: **"Which two or three user journeys matter most in your product?"** For example, "send an invoice" or "invite a teammate". Write them into the Core journeys section of `DESIGN.md`. They decide which components to document first, and they are what the evals test. Starting from journeys rather than a list of components keeps the work small and tied to real screens.
5. Ask whether the team has user research. If it does, suggest running `/habitat-research` after this extraction (or before, if the research is fresh), so the rules you write can cite the evidence behind them.

## Step 1: Baseline eval

Before writing any documentation, find out what an AI does without it.

1. Pick the first core journey. Agree one prompt with the designer, e.g. "Build the screen where a user sends an invoice to an existing customer, using our design system." Keep it; every later run reuses it.
2. Build the screen **without using the habitat files** (they are empty at this point anyway), using only what a coding agent would normally have: the codebase, or the Figma file.
3. Show the result and ask the designer: "What's wrong with this?" List each problem in `evals/<date>-<journey>-baseline.md` using the eval template, with its type: invented component, raw value, wrong component, broke a principle, broke an interaction rule.
4. This list is your to-do list. The problems show which judgement to write down first.

## Step 2: Tokens → `tokens.md`

1. Read the variables with `get_variable_defs` (on the library's token or style page, or on the components themselves) and note the collection names and modes.
   If the designer can export the variables as W3C design tokens JSON (Figma's variable export, or a plugin such as Tokens Studio), `npx @owl-listener/habitat tokens import <file.json…> --design design` writes the facts into `tokens.md` for you, one file per mode, and leaves each meaning as a TODO. Then carry on from step 3.
2. Write each token as `name` (dot-separated, e.g. `color.brand.default`), `value` or `aliasOf` (when the variable points at another variable), and `modes` if it has light/dark or brand modes. Record where it came from in `figma.variable` and `figma.collection`.
2b. **Read the styles too.** Many libraries still keep colours, type and shadows as Figma styles rather than variables, and an agent needs both. `get_variable_defs` on a component lists the styles it uses; for the whole library, run this with `use_figma` (load the `figma-use` skill first if your tool offers it):

   ```js
   const paint = (await figma.getLocalPaintStylesAsync()).map((s) => ({ name: s.name, paints: s.paints, boundVariables: s.boundVariables }));
   const text = (await figma.getLocalTextStylesAsync()).map((s) => ({ name: s.name, fontName: s.fontName, fontSize: s.fontSize, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing }));
   const effect = (await figma.getLocalEffectStylesAsync()).map((s) => ({ name: s.name, effects: s.effects }));
   return { paint, text, effect };
   ```

   Write each style as a token with `figma.style` (its name) and `figma.styleType` (`PAINT`, `TEXT`, `EFFECT` or `GRID`). A colour style's `value` is its hex; a text style's `value` is an object (`fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`) with `type: typography`; a shadow is `type: shadow`. Name them like the rest (`type.style.heading`, `shadow.raised`). If a colour style has the same value as a variable, ask which one agents should use: two names for one decision is a gap the validator will flag.
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

## Step 4: Each core journey → `flows/<journey>.md`

Components say what each part is; a flow says how the screens of a journey fit together, which is what an agent needs to build the screen before or after the one it was asked for. The prototype holds the facts.

**Read from Figma:**
1. Ask which page holds the prototype for this journey, and its flow starting point if it has one.
2. Read the prototype's connections (Figma calls them reactions). `get_design_context` and `get_metadata` do not include them, so run this with `use_figma` on that page:

   ```js
   const page = figma.currentPage;
   const frameOf = (n) => { while (n.parent && n.parent.type !== "PAGE") n = n.parent; return n; };
   const out = { startingPoints: page.flowStartingPoints, frames: page.children.filter((n) => n.type === "FRAME").map((f) => ({ id: f.id, name: f.name })), reactions: [] };
   for (const node of page.findAll((n) => "reactions" in n && n.reactions.length > 0)) {
     const main = node.type === "INSTANCE" ? await node.getMainComponentAsync() : null;
     const component = main?.parent?.type === "COMPONENT_SET" ? main.parent.name : main?.name;
     for (const r of node.reactions) {
       for (const a of r.actions ?? [r.action]) {
         if (!a) continue;
         const to = a.destinationId ? (await figma.getNodeByIdAsync(a.destinationId))?.name : a.url;
         out.reactions.push({ from: frameOf(node).name, element: node.name, component, trigger: r.trigger?.type, action: a.type === "NODE" ? a.navigation : a.type, to });
       }
     }
   }
   return out;
   ```

   If `use_figma` is not available, ask the designer for screenshots of the prototype view (with the connection arrows showing) and build the list from those.
3. Turn what you read into the flow file:
   - `screens` from the frames the journey passes through, in order, each with a short `id`, its `figma.nodeId`, and the design system `components` on it (look at it with `get_screenshot` or `get_metadata`).
   - `transitions` from the reactions: `from` and `to` screen ids, `trigger` (`ON_CLICK` → `click`, `AFTER_TIMEOUT` → `after-delay`, and so on), the `element` and its `component`, and `action` (`NAVIGATE` → `navigate`, `OVERLAY` → `overlay`, `SWAP` → `swap`, `BACK` → `back`, `CLOSE` → `close`, `SCROLL_TO` → `scroll`, `URL` → `open-link`, `CHANGE_TO` → `change-to`). Leave out connections inside interactive components (hover states and the like); those belong to the component's `states`.
   - Mark the screen where the journey finishes with `end: true`.

**Then ask, a few questions at a time:**
- "What is the user trying to get done here, and how do they know they're done?" (fills `purpose`)
- For each transition that commits something: "When is this allowed? What has to be true first?" (fills `condition`)
- "What happens when it goes wrong: an error, no connection, an empty list, or the user leaving halfway?" A prototype almost never shows these, and they are where agents improvise most. Each answer is one `unhappyPaths` entry: `when` + `then`.
- "What would you never want to see in this journey?" Each answer is one `antiPatterns` entry, with `because` and `source`, exactly as for components.

Report screens with no way out, connections to frames outside the journey, and components on the screens that have no file yet.

## Step 5: Principles and interaction rules → `DESIGN.md`

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

## Step 6: Calibrate

Re-run the baseline prompt, word for word, this time with the habitat files (through the MCP server, or by reading `design/`). Show the result and ask: "What's wrong with this?" If you wrote code, also run `npx @owl-listener/habitat check <files> --design design`: its count needs no judgement, so it is the most comparable number between runs. For a thorough critique, `/habitat-review` goes through every rule.

For every problem the designer names, find the missing rule and add it to the right file: a component's `antiPatterns`, a variant's `whenToUse`, a flow's `unhappyPaths` or `condition`, an interaction rule, or a principle in `DESIGN.md`. Record the run in a new `evals/` file with its problem count, and add a row to the calibration log in `DESIGN.md`. Run it again.

If the designer has an Anthropic API key, `npx @owl-listener/habitat eval design --journey "<journey>" --prompt "<the prompt>" --judge` runs the prompt with and without the habitat files, several times each, and writes the counts to `evals/` for them. It is the same loop, done by a program, so the numbers are comparable from one month to the next. Move on to the next core journey when the designer's corrections become matters of taste rather than rules.

The drop in problems, baseline to latest run, is the measure of what the documentation is worth. Tell the designer the numbers.

## Step 7: Check and hand over

1. Run `npx @owl-listener/habitat validate design` and fix any errors and warnings you can.
   If the components exist in code, also run `npx @owl-listener/habitat parity design --code <component folder>`. Missing implementations and components with no contract are what make an agent build screens that look right from parts that don't exist.
2. Tell the designer how many TODOs remain and in which files. A file becomes `status: reviewed` (with `lastReviewed` set to the date) only when the designer says every field is right; never set it yourself.
3. List the Figma issues you found: unbound values, naming inconsistencies, missing states, components with no code counterpart.
4. Check that the always-on rules are in place (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/habitat.mdc`); `init` adds them.
5. Show them how to serve the folder to their coding agent:
   `claude mcp add habitat -- npx -y @owl-listener/habitat serve design`
6. Tell them what comes next: `/habitat-research` to ground the rules in user research, `/habitat-review` to critique any screen against the system, and `/habitat-refresh` whenever the Figma library changes.

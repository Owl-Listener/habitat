# habitat

**Make your design system legible to AI agents.**

Most design systems are written for humans. A designer or developer opens the docs, reads them, interprets them, and applies judgment. An AI agent gets none of that. It reads your components and tokens literally, and where the meaning is missing, it guesses. The guesses compound, and the interface it builds comes out generic, or wrong.

habitat doesn't give you a new design system. It helps you write down the one you already have, in a form an agent can read: a few Markdown files, filled in with your AI and your Figma file, tested against real screens, then served to your coding agent.

By MC Dean · [Percolates on Substack](https://marieclairedean.substack.com) · MIT licensed.

---

## The idea in one paragraph

Figma already knows *what* your system is: its components, variants, properties, layout and variables. What it can't hold is *why*: when to pick one variant over another, the mistakes you've seen people make, what your brand colour is allowed to mean. That judgement lives in your team's heads, and it's exactly what an agent needs. habitat reads the facts from Figma, interviews you for the reasons, and tests the result by asking an AI to build real screens. It follows the method Buzz Usborne describes in [Designing with AI](https://buzzusborne.com/work/designing-with-ai/): start with no context, ask for a screen, explain what's wrong, run it again. Each pass exposes another piece of judgement the system needs.

## What you end up with

```
design/
├── DESIGN.md            principles, core journeys and interaction rules, in prose
├── tokens.md            every token, its tier, and what it means
├── components/
│   ├── button.md        one file per component: a contract + notes
│   └── ...
└── evals/               before-and-after runs: what the AI got wrong, and what fixed it
```

Plus a short block of always-on rules in `AGENTS.md`, `CLAUDE.md` and `.cursor/rules/`, so every agent is told to read the system before building UI, never to hard-code values, and to report a missing component instead of inventing a lookalike.

Each component file has a structured contract at the top (purpose, when to use each variant, states, anatomy and layout, token bindings, accessibility, and anti-patterns written as *never … because …*) and your notes underneath. See the worked example in [`examples/design`](examples/design).

## Two ways to start

**Start like Buzz (an afternoon).** Write `DESIGN.md` only: the product, two or three core journeys, your principles and interaction rules. Run a baseline eval, then calibrate a few times. You'll get AI output that is *recognisably yours* without documenting a single component. Add component files later, for whatever keeps going wrong.

**The full extraction (a few days).** Everything below: tokens and components from Figma, with an interview for the reasons, calibrated against your core journeys. This is what gets you from *recognisably yours* towards production-ready.

## How to use it

### 1. Set up

In your project folder:

```bash
npx github:Owl-Listener/habitat init
```

This creates `design/` with the templates, installs the `/habitat-extract` skill for Claude Code, and adds the always-on rules to `AGENTS.md`, `CLAUDE.md` and `.cursor/rules/habitat.mdc`. It never overwrites files that already exist; the rules go in a marked block, added once.

### 2. Connect Figma to your AI

Connect the [Figma MCP server](https://help.figma.com/hc/en-us/articles/39216419318551-Get-started-with-the-Figma-MCP-server) to your AI tool, so it can read your library file. (No Figma connection? Screenshots and a variables export work too, just more slowly.)

### 3. Fill it in with your AI

- **Claude Code:** run `/habitat-extract` and give it your Figma file link.
- **Any other AI:** paste the [prompts](prompts), in order.

Either way, the process is the same:

0. **Journeys and baseline.** Name your two or three most important user journeys. The AI builds the first one *without* any documentation, and you list what's wrong. That's your "before", and your to-do list.
1. **Tokens.** The AI reads your variables, sorts them into primitive, semantic and component tiers, then asks you what the ambiguous ones mean.
2. **Components.** One at a time, starting with the ones your journeys use. The AI reads the variants, properties, states, layers, auto layout and bindings, then asks you how you choose between variants and what people get wrong, and records who said so.
3. **Principles and interaction rules.** An interview that turns into `DESIGN.md`: how the product thinks, and how forms, errors, dialogs and focus behave everywhere.
4. **Calibrate.** The AI re-runs the baseline prompt with your files. You say what's wrong, and each correction becomes a new rule. Repeat until your corrections are about taste, not rules. The drop in problems from baseline to latest run shows what the documentation is worth.

The AI never invents a reason. Anything it doesn't know stays as `TODO:`, and anything it guesses is marked `TODO confirm:` until you agree.

### 4. Check your progress

```bash
npx github:Owl-Listener/habitat validate design
```

This checks every file and lists every open TODO. It warns when a component binds to a token that doesn't exist, is deprecated, or is a primitive rather than a semantic token; when an alias or replacement points nowhere; and when a file hasn't been reviewed in six months, because out-of-date documentation is worse for an agent than none. When a person has checked a file, set `status: reviewed` and `lastReviewed`. Add `--strict` in CI to fail on any remaining TODO.

### 5. Serve it to your coding agent

```bash
claude mcp add habitat -- npx -y github:Owl-Listener/habitat serve design
```

For other agents, add a stdio MCP server that runs `npx -y github:Owl-Listener/habitat serve design`. The agent gets five tools: `get_principles` (read first), `list_components`, `get_component`, `get_tokens` and `get_rules`. Asking for a deprecated component returns a warning and its replacement.

## What habitat can and can't do for you

Buzz's work at Help Scout had two halves. habitat covers the first fully and the second partly.

**It helps you do:**
- Write down your judgement (principles, interaction rules, when to use what, what never to do, and why) through an interview, instead of a blank page.
- Read the facts out of Figma instead of retyping them.
- Test the documentation with before-and-after evals on your own journeys.
- Make every agent read it, through the always-on rules and the MCP server.
- Keep it honest over time, with owners, review dates and deprecations.

**It can't do for you:**
- **Fix a messy source.** Buzz rebuilt 200+ components and standardised hundreds of tokens before AI could use his system. habitat reports what's wrong in Figma; run [agent-ready](https://github.com/Owl-Listener/agent-ready) to score and fix the structure itself.
- **Match Figma and code yet.** Buzz's biggest finding: without full parity between Figma and code, AI confidently builds screens that look right from components that don't exist. habitat records where each component lives in code, but doesn't check parity yet. That, a screen-review skill, and a refresh that re-reads Figma to catch drift are next on the roadmap.
- **Supply the judgement.** The interview draws out what your team knows. It can't invent taste you haven't formed yet, and it won't try.

The story across the two repos: **fix the structure** (agent-ready) → **write down the judgement** (habitat) → **serve it** (MCP) → **check it** (evals).

## What's in this repo

```
habitat/
├── templates/            blank DESIGN.md, tokens.md, component.md, eval.md and the agent rules
├── skills/habitat-extract/   the Claude Code skill that runs the extraction
├── prompts/              the same process as copy-paste prompts, for any AI
├── schema/               what a valid component and tokens file look like
├── bin/ lib/             the command line: init, validate, serve
├── mcp-server/           serves a design folder to an agent over MCP
├── examples/
│   ├── design/           a finished design folder for an imaginary product, with evals
│   └── code/             the Button and Input it describes, in React
└── docs/intent-spec.md   every contract field, why it exists, and where its answer comes from
```

## The contract maps to agent-ready's checks

Every field in the contract exists because an agent needs it, and maps to one of the checks in [agent-ready](https://github.com/Owl-Listener/agent-ready). agent-ready scores how legible your Figma file is; habitat helps you close the gaps it finds. See [`docs/intent-spec.md`](docs/intent-spec.md) for the full mapping.

## Related

- [agent-ready](https://github.com/Owl-Listener/agent-ready): scores how agent-ready a design file is.
- [designer-skills](https://github.com/Owl-Listener/designer-skills): the judgment of a design team, written down as agent skills.
- [Design System Contracts](https://github.com/southleft/ds-contracts-poc) by Southleft: machine-readable component contracts that generate matching React and Figma libraries. Where habitat captures judgement, it captures structure; the two fit together. Its with-and-without test is a good model for your own evals: the same model scored 100 with contracts and 69 without.

## Contributing

Fork it, break it, make it better. Run `npm run validate` before you open a PR.

## License

MIT.

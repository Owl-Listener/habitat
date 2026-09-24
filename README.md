# habitat

**Make your design system legible to AI agents.**

Most design systems are written for humans. A designer or developer opens the docs, reads them, interprets them, and applies judgment. An AI agent gets none of that. It reads your components and tokens literally, and where the meaning is missing, it guesses. The guesses compound, and the interface it builds comes out generic, or wrong.

habitat doesn't give you a new design system. It helps you write down the one you already have, in a form an agent can read: a few Markdown files, filled in with your AI and your Figma file, then served to your coding agent.

By MC Dean · [Percolates on Substack](https://marieclairedean.substack.com) · MIT licensed.

---

## The idea in one paragraph

Figma already knows *what* your system is: its components, variants, properties and variables. What it can't hold is *why*: when to pick one variant over another, the mistakes you've seen people make, what your brand colour is allowed to mean. That judgement lives in your team's heads, and it's exactly what an agent needs. habitat reads the facts from Figma, interviews you for the reasons, and writes both into files an agent can rely on. It's the approach Buzz Usborne describes in [Designing with AI](https://buzzusborne.com/work/designing-with-ai/): articulating *how* you design is every bit as important as documenting *what* you design.

## What you end up with

```
design/
├── DESIGN.md            your principles: how the product thinks, in prose
├── tokens.md            every token, and what it means
└── components/
    ├── button.md        one file per component: a contract + notes
    └── ...
```

Each component file has a structured contract at the top (purpose, when to use each variant, states, token bindings, accessibility, and anti-patterns written as *never … because …*) and your notes underneath. See the worked example in [`examples/design`](examples/design).

## How to use it

### 1. Set up

In your project folder:

```bash
npx github:Owl-Listener/habitat init
```

This creates `design/` with the templates, and installs the `/habitat-extract` skill for Claude Code. It never overwrites files that already exist.

### 2. Connect Figma to your AI

Connect the [Figma MCP server](https://help.figma.com/hc/en-us/articles/39216419318551-Get-started-with-the-Figma-MCP-server) to your AI tool, so it can read your library file. (No Figma connection? Screenshots and a variables export work too, just more slowly.)

### 3. Fill it in with your AI

- **Claude Code:** run `/habitat-extract` and give it your Figma file link.
- **Any other AI:** paste the [prompts](prompts), in order.

Either way, the process is the same:

1. **Tokens.** The AI reads your variables, then asks you what the ambiguous ones mean.
2. **Components.** One at a time, starting with the five that cause the most trouble. The AI reads the variants, properties, states and bindings, then asks you how you choose between variants and what people get wrong.
3. **Principles.** An interview that turns into `DESIGN.md`.
4. **Calibrate.** The AI builds a real screen using only your files. You say what's wrong, and each correction becomes a new rule. Repeat until your corrections are about taste, not rules.

The AI never invents a reason. Anything it doesn't know stays as `TODO:`, and anything it guesses is marked `TODO confirm:` until you agree.

### 4. Check your progress

```bash
npx github:Owl-Listener/habitat validate design
```

This checks every file, warns when a component uses a token `tokens.md` doesn't define, and lists every open TODO. When a person has checked a file, set `status: reviewed`. Add `--strict` in CI to fail on any remaining TODO.

### 5. Serve it to your coding agent

```bash
claude mcp add habitat -- npx -y github:Owl-Listener/habitat serve design
```

For other agents, add a stdio MCP server that runs `npx -y github:Owl-Listener/habitat serve design`. The agent gets five tools: `get_principles` (read first), `list_components`, `get_component`, `get_tokens` and `get_rules`. Now when you ask it to build, it asks your system instead of inventing one.

## What's in this repo

```
habitat/
├── templates/            the blank DESIGN.md, tokens.md and component.md
├── skills/habitat-extract/   the Claude Code skill that runs the extraction
├── prompts/              the same process as copy-paste prompts, for any AI
├── schema/               what a valid component and tokens file look like
├── bin/ lib/             the command line: init, validate, serve
├── mcp-server/           serves a design folder to an agent over MCP
├── examples/
│   ├── design/           a finished design folder for an imaginary product
│   └── code/             the Button and Input it describes, in React
└── docs/intent-spec.md   every contract field, why it exists, and where its answer comes from
```

## The contract maps to agent-ready's checks

Every field in the contract exists because an agent needs it, and maps to one of the checks in [agent-ready](https://github.com/Owl-Listener/agent-ready). agent-ready scores how legible your Figma file is; habitat helps you close the gaps it finds. See [`docs/intent-spec.md`](docs/intent-spec.md) for the full mapping.

## Related

- [agent-ready](https://github.com/Owl-Listener/agent-ready): scores how agent-ready a design file is.
- [designer-skills](https://github.com/Owl-Listener/designer-skills): the judgment of a design team, written down as agent skills.

## Contributing

Fork it, break it, make it better. Run `npm run validate` before you open a PR.

## License

MIT.

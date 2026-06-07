# habitat

**A design system built to be read by agents, not just by people.**

Most design systems are written for humans. A designer or developer opens the docs, reads them, interprets them, and applies judgment. An AI agent gets none of that. It reads your components and tokens literally, and where the meaning is missing, it guesses. The guesses compound, and the interface it builds comes out generic, or wrong.

habitat is the other side of [agent-ready](https://github.com/Owl-Listener/agent-ready). agent-ready tells you how legible your design files are to an agent and scores the gaps. habitat is a small, opinionated reference for what a system looks like when it scores full marks, so you have something real to fork instead of a checklist to chase.

It ships three things that usually live apart, kept deliberately together:

- **Components and tokens**, the ordinary material of a design system.
- **A machine-readable contract** on every component, recording purpose, props, states, relationships, and the things an agent must never do.
- **An MCP server** that serves all of it to a coding agent on demand, so the agent reads the system instead of guessing at it.

By MC Dean · [Percolates on Substack](https://marieclairedean.substack.com) · MIT licensed.

---

## The idea in one paragraph

A component is not agent-ready because it exists. It is agent-ready when an agent can tell what it is for, when to reach for it, what state it should be in, which tokens it must use, and what it should refuse to do. habitat treats that knowledge as part of the component, written down in a form a machine can hold, and validates it against a schema. The same button means the same thing in the docs, in the code, and in Claude.

## What's in here

```
habitat/
├── tokens/                  the design tokens, the raw material
│   ├── tokens.json          source of truth
│   └── tokens.css           the same values as CSS variables
├── schema/
│   └── component.schema.json  the contract every component must satisfy
├── components/
│   └── button/              one component, worked end to end, as the pattern to copy
│       ├── Button.tsx        the implementation
│       ├── Button.css        styles, bound to tokens, never raw values
│       ├── button.meta.json  the machine-readable contract
│       └── README.md         the human-readable note
├── docs/
│   └── intent-spec.md       what every field in the contract means, and why
└── mcp-server/              serves the system to an agent over MCP
    ├── index.js
    └── package.json
```

## How to use it

1. **Fork it.** Strip the button down to your own primitives, or keep it and add your own components alongside.
2. **Write the contract as you build.** For each component, fill in `*.meta.json` against `schema/component.schema.json`. The contract is the work, the code is the easy part.
3. **Serve it to your agent.** Run the MCP server and point Claude Code or Gemini CLI at it. Now when you ask the agent to build, it queries the system rather than inventing one.
4. **Check yourself with agent-ready.** Run [agent-ready](https://github.com/Owl-Listener/agent-ready) over your work. A habitat-shaped component should score full marks. If it doesn't, the contract has a gap.

## The contract maps to agent-ready's checks

Every field in the contract exists because an agent needs it. The mapping is one to one with the thirteen checks in agent-ready, so the two repos define a single standard from two directions, one that measures, one that demonstrates. See [`docs/intent-spec.md`](docs/intent-spec.md) for the full mapping.

## Run the MCP server

```bash
cd mcp-server
npm install
npm start
```

Then add it to your agent's MCP configuration as a stdio server pointing at `mcp-server/index.js`. The server exposes four tools: `list_components`, `get_component`, `get_tokens`, and `get_rules`.

## A note on the styling

The button looks plain on purpose. The value of habitat is the contract and the way the system makes itself legible, not the look. Re-theme it through the tokens and make it yours. Taste belongs to you, the structure is what travels.

## Related

- [agent-ready](https://github.com/Owl-Listener/agent-ready) — scores how agent-ready a design file is, and closes the gaps.
- [designer-skills](https://github.com/Owl-Listener/designer-skills) — the judgment of a design team, written down as agent skills.

## Contributing

Fork it, break it, make it better. If you add a component, ship its contract in the same commit, and run it through `schema/component.schema.json` before you open a PR. A component without its contract is not finished.

## License

MIT.

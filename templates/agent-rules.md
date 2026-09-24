## Design system (habitat)

This project's design system is written down for agents in `{{DIR}}/`, and served by the `habitat` MCP server when it is connected.

Before building or changing any UI:

1. Read the principles: call `get_principles` (or read `{{DIR}}/DESIGN.md`).
2. Find components with `list_components`, and read each one you use with `get_component` (or `{{DIR}}/components/<name>.md`), including its anti-patterns.
3. Take values from `get_tokens` (or `{{DIR}}/tokens.md`).
4. Read what the team knows about its users for the journey you are building: `get_research` (or `{{DIR}}/research/`). Use it for the cases no rule covers, and weigh each insight by its confidence.

Always:

- Build only from the system's components. If a screen needs something the system does not have, stop and tell the user about the gap. Never invent a lookalike or hand-code a replacement.
- Bind every colour, size and spacing value to a semantic token. Never write raw values.
- Never use a deprecated component or token; use its `replacedBy`.
- Follow every `never … because …` rule. If a rule seems to block the task, ask rather than work around it.
- When the files do not say what to do, say so instead of quietly choosing.
- Before handing over UI code, check it with the `check_code` tool (or `npx github:Owl-Listener/habitat check <files> --design {{DIR}}`) and fix what it finds.

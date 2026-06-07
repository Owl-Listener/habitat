# Button

Lets a user commit to an action. The most direct control in the system.

This folder is the pattern to copy for every other component:

- `Button.tsx` — the implementation. Props are typed and documented.
- `Button.css` — styles, every value bound to a token, none raw.
- `button.meta.json` — the agent-readable contract. This is the part that matters.
- `README.md` — this note, for humans skimming the repo.

The contract in `button.meta.json` is validated against `../../schema/component.schema.json`. When you add a component, ship its contract in the same commit. A component without its contract is not finished, because an agent reading it will guess, and the guesses compound.

## Quick reference

- **primary** — the one main action in a view. At most one visible at a time.
- **secondary** — a supporting action, e.g. Cancel beside Save.
- **ghost** — low emphasis, e.g. in a toolbar or card footer.

For the full decision rules, states, token bindings, and the things this component must never do, read `button.meta.json`. That file is written for the agent, but it reads perfectly well for a person too.

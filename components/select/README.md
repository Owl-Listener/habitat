# Select

Lets a user choose one option from a list.

Use Select when there are enough options that showing them all at once would crowd the layout — typically five or more. For four or fewer choices, prefer radio buttons or a button group so all options stay visible without a click.

The label is not optional. Like Input and Textarea, `label` is a required prop linked to the `<select>` via `htmlFor`/`id`. The native `<select>` element is used deliberately: keyboard navigation, screen reader support, and mobile behaviour come for free. See the anti-patterns in `select.meta.json` for what breaks when a custom dropdown is built without replicating that behaviour.

All visual properties are bound to tokens. The browser's native arrow is replaced with a token-bound chevron via `appearance: none`. See `select.meta.json` for the full agent-readable contract.

# Textarea

Collects multi-line text from the user.

Use Textarea when the expected content may span more than one line — messages, descriptions, comments, bios. For short single-line values like names or email addresses, use Input instead. The two components share the same label, error, and disabled patterns deliberately: an agent that knows one should recognise the other.

The label is not optional. Like Input, `label` is a required prop and is linked to the `<textarea>` via `htmlFor`/`id`. Resize is set to `vertical` by default — users may always make the field taller. Setting `resize: none` is an anti-pattern listed in the contract.

All visual properties are bound to tokens. See `textarea.meta.json` for the full agent-readable contract.

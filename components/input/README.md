# Input

Collects a short piece of typed text from the user.

The label is not optional. A field without a visible, associated label is inaccessible — `Input` enforces this by making `label` a required prop. The label is linked to the `<input>` element via `htmlFor`/`id` so that clicking the label focuses the field and screen readers announce it correctly.

Error messages are surfaced through `errorMessage`. Setting this prop triggers the error visual state, sets `aria-invalid`, and wires up `aria-describedby` so the message is read out by assistive technology. Show errors after the user has interacted with the field, not before.

All visual properties are bound to tokens. See `input.meta.json` for the full agent-readable contract.

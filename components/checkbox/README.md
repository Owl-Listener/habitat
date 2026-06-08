# Checkbox

Lets a user toggle a boolean choice or select items from a list.

Use Checkbox for deferred choices — ones that are applied when the user submits or confirms. For a setting that takes immediate effect, use a Toggle instead. For a group where only one option can be selected, use Radio buttons.

The label is not optional. Like all habitat form controls, `label` is a required prop. The `<label>` wraps the `<input>` directly, so clicking anywhere on the label text toggles the checkbox.

The indeterminate state is set via a JavaScript DOM property, not an HTML attribute. It has one meaning: some but not all items in a controlled child group are checked. It is not a third value for a standalone checkbox. See `checkbox.meta.json` for the full decision rule.

All visual properties are bound to tokens. The browser's default checkbox is replaced with `appearance: none`; the tick and dash are drawn with CSS `::after`. See `checkbox.meta.json` for the full agent-readable contract.

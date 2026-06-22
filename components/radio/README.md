# RadioGroup / Radio

Lets a user choose exactly one option from a small, fixed list.

Use RadioGroup when choices are mutually exclusive and there are between two and five options. For six or more, use Select — a long list of visible radios clutters the layout. For choices that aren’t mutually exclusive, use Checkbox.

`Radio` must always be used inside a `RadioGroup`. The group owns the `name` attribute that ties the inputs together and enforces mutual exclusivity. A lone `Radio` has no name, is not connected to anything, and will not behave correctly.

The group is wrapped in a `<fieldset>` with a `<legend>`. This is the correct accessible structure — screen readers announce the legend before each option, so the user always knows which group they’re navigating. The keyboard pattern is also different from other controls: arrow keys move between options within the group, and Tab exits the group entirely.

All visual properties are bound to tokens. See `radio.meta.json` for the full agent-readable contract.

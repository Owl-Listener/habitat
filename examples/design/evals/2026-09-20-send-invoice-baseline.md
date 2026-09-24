# Eval: Send an invoice, 2026-09-20 (baseline)

<!-- An illustrative example for the imaginary product Ledger, not a real measurement. -->

- **Journey:** Send an invoice
- **Context the AI had:** none (baseline). It was told only that the product uses a React component library.
- **Tool and model:** Claude Code
- **Prompt:** "Build the screen where a user creates and sends an invoice to an existing customer, using our design system."

## What came out

A two-column form with a hand-built date picker, a red "Delete draft" button, "Save" and "Save and send" side by side as two primary buttons, and "Oops! Something went wrong" as the error message.

## What was wrong

| # | Problem | Type | Rule added (file) |
| --- | --- | --- | --- |
| 1 | Hand-coded a date picker instead of reporting that the system has none | invented component | Report gaps, never lookalikes (AGENTS.md rules) |
| 2 | Hex colours and pixel values in the styles | raw value | Never raw values (DESIGN.md, Never) |
| 3 | Two primary buttons | broke a principle | One thing at a time (DESIGN.md) |
| 4 | Red Delete button | broke a principle | Colour: red only means an error (DESIGN.md) |
| 5 | Two-column form | broke a principle | Layout: single-column forms (DESIGN.md) |
| 6 | Placeholder used as the only label | wrong component use | Input anti-pattern (components/input.md) |
| 7 | Validated while typing | broke an interaction rule | Forms and validation (DESIGN.md, Interaction rules) |
| 8 | "Oops! Something went wrong" | broke a principle | Language and voice (DESIGN.md) |

**Total problems:** 8

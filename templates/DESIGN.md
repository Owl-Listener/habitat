# Design principles

<!--
This file is read by AI agents before they build anything with your design
system. It holds what no single component can: how your product thinks.

Write it the way you would brief a talented new designer on their first day.
Not what the components are (that lives in components/), but how you decide.
Every rule needs a reason. An agent that knows why a rule exists can apply it
to situations the rule never named.

Replace each TODO with your answer. Delete any section that does not apply.
Keep it short enough that you would actually read it: one to three pages.
-->

## The product

TODO: One paragraph. Who is it for, what are they trying to get done, and what state of mind are they usually in when they use it? (e.g. "Support agents clearing a queue under time pressure. They want speed and calm, not delight.")

## Core journeys

<!--
The two or three journeys that matter most. They decide which components to
document first, and they are the screens you test the AI against in evals/.
Start here rather than with a list of components.
-->

1. TODO e.g. "Send an invoice: from a customer record to a sent PDF."
2. TODO

## Principles

<!--
Three to six. Each one should help someone choose between two reasonable
options. "Be simple" does not; "Show one primary action per screen, because
our users are interrupted constantly and need to resume in one glance" does.
-->

### TODO: Principle name

TODO: The principle in one sentence.

- **In practice:** TODO: What it looks like in a real screen.
- **Because:** TODO: Why this matters for your users or your product.

### TODO: Principle name

TODO: The principle in one sentence.

- **In practice:** TODO
- **Because:** TODO

## Colour

TODO: How colour carries meaning here. When is brand colour used, and when is it held back? What does each status colour promise the user? (e.g. "Brand teal is only for the single primary action. Everything else is neutral, so the action is never in doubt.")

## Layout and density

TODO: How tight or airy screens should be, the grid, how content is grouped, and what you do on small screens.

## Language and voice

TODO: How the interface talks. Button labels (verbs? sentence case?), error messages, empty states, and words you never use.

## Interaction rules

<!--
Behaviour that spans many components, which no single component file can own.
Agents get these wrong constantly, and it is where accessibility breaks.
-->

- **Forms and validation:** TODO When does validation run (on blur, on submit)? Where do errors appear? Where does focus go when submit fails?
- **Errors and recovery:** TODO How are system errors shown, and what can the user do next?
- **Dialogs and focus:** TODO When is a dialog allowed? Where does focus go when it opens and closes? How is it dismissed?
- **Loading and empty states:** TODO What does the user see while waiting, and when there is nothing to show?
- **Destructive actions:** TODO How are irreversible actions confirmed or undone?
- **Sensitive data:** TODO How are personal or financial details shown, masked or confirmed?

## Choosing between components

<!--
The decisions an agent gets wrong most often. Think of the questions a new
designer asks you in their first month.
-->

- TODO: e.g. "Dialog vs. new page: use a Dialog only for a single, short decision. Anything with more than one step gets its own page."
- TODO: e.g. "Toast vs. inline message: errors are always inline, next to what caused them. Toasts are for confirmations the user can safely miss."

## Never

<!-- System-wide refusals, each with its reason. Component-specific ones live in that component's file. -->

- **Never** TODO: the rule. **Because** TODO: the reason.

## Calibration log

<!--
Buzz Usborne's loop: ask the AI to build a real screen with these files, look
at what it got wrong, and write down the rule it was missing. Then run it
again. Each entry here is a lesson the system learned the hard way.
-->

| Date | What the AI did | The rule we added |
| --- | --- | --- |
| TODO | TODO | TODO |

<!-- Full runs, with before/after problem counts, live in evals/. -->

---

Owner: TODO who approves changes to these principles · Last reviewed: TODO YYYY-MM-DD

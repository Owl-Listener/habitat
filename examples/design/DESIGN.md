# Design principles

<!-- A worked example for an imaginary product. Yours will be different; the shape is what to copy. -->

## The product

Ledger is a bookkeeping tool for people who run small businesses and are not accountants. They open it at the end of a long day, usually to do one chore (send an invoice, file a receipt) and leave. They are tired, slightly anxious about money, and want to feel in control rather than impressed.

## Core journeys

1. **Send an invoice:** from a customer record to a sent invoice, in under two minutes.
2. **File a receipt:** photograph or upload a receipt and categorise it.
3. **See where the money went:** the monthly overview of income and spending.

## Principles

### One thing at a time

Every screen has one job and one primary action.

- **In practice:** A single primary Button per view. Secondary actions are secondary or ghost Buttons, or live in a menu.
- **Because:** Our users arrive tired and with one chore in mind. When two things compete, they stall, and a stalled bookkeeping task becomes a late one.

### Calm over clever

Plain layouts, plain words, no surprises.

- **In practice:** No animation beyond state transitions. No illustrations in task flows. Numbers are shown in full, never abbreviated ("£1,240.00", not "£1.2k").
- **Because:** Money makes people anxious. Anything that looks playful or vague about a number reads as untrustworthy.

### Say what happened, and what to do next

Every outcome is explained in words next to where it happened.

- **In practice:** Errors appear inline under the field that caused them, and say how to fix it. Success is confirmed where the user is looking, not in a corner.
- **Because:** Our users are not experts. A red border alone tells them something is wrong but not what, and they will give up rather than guess.

## Colour

Brand teal (`color.brand.default`) means "this is the thing to do". It appears on the primary action and nowhere else, so the eye always finds it. Everything else is neutral. Red (`color.state.error`) only ever means "something went wrong", never "this is dangerous"; a Delete button is secondary, not red.

## Layout and density

Comfortable, not compact. Controls use `md` size by default; `sm` only in tables and toolbars. Forms are a single column, never side by side, so the reading order is always top to bottom. Group related fields with `space.xl` between groups.

## Language and voice

- Buttons start with a verb and name the outcome: "Send invoice", not "Submit" or "OK".
- Sentence case everywhere.
- Error messages say what happened and how to fix it: "Enter a date after 1 Jan 2020", not "Invalid date".
- Never: "Oops", "Whoops", exclamation marks, or blaming the user ("You entered…").

## Interaction rules

- **Forms and validation:** validate a field when the user leaves it, and again on submit; never while they are still typing. On a failed submit, move focus to the first field with an error. The submit Button stays enabled, because a disabled Save gives no reason.
- **Errors and recovery:** field errors go inline under the Input. Problems with the whole page (lost connection, a failed save) go in a banner at the top that says what to do next, and nothing the user typed is lost.
- **Confirmations:** confirm success where the user is looking, for example the invoice's status changing to "Sent". Never only in a toast in the corner, which tired users miss.
- **Dialogs and focus:** a dialog is only for one short decision. Focus moves to the dialog's first control when it opens and back to the control that opened it when it closes. Escape always closes it.
- **Loading and empty states:** show the page's layout with placeholders while loading, never a full-screen spinner. Empty states say what will appear here and offer the one action that fills it.
- **Destructive actions:** prefer undo over confirmation. Only irreversible actions that involve money (voiding a paid invoice) ask for confirmation, and the confirm button names the action ("Void invoice").
- **Sensitive data:** bank details show only the last four digits until the user chooses to reveal them.

## Choosing between components

- **Button vs. Link:** a Button makes something happen here; a Link takes you somewhere else. If it changes the URL, it is a Link.
- **Inline error vs. banner:** errors about one field go inline under that Input. A banner is only for problems with the whole page, such as a lost connection.
- **Hide vs. disable:** if the user cannot know why an action is unavailable, hide it. Disable only when the reason is visible on screen.

## Never

- **Never** use a raw colour, size or spacing value. **Because** unbound values are invisible to the system and drift the moment the tokens change.
- **Never** use placeholder text as the only label. **Because** it disappears on typing and screen readers do not announce it as a label.
- **Never** fill a screen with lorem ipsum or "John Doe". **Because** fake content hides real problems: long names, large numbers, empty states.

## Calibration log

| Date | What the AI did | The rule we added |
| --- | --- | --- |
| 2026-09-20 | Put "Save" and "Save and send" side by side, both primary | "One thing at a time": one primary action per view |
| 2026-09-20 | Showed a red Delete button | Colour: red only means an error, never danger |
| 2026-09-21 | Wrote "Oops! Something went wrong" | Language: no "Oops", say what happened and how to fix it |

Full runs, with before and after problem counts, are in [evals/](evals/).

---

Owner: Sam Okafor (design lead) · Last reviewed: 2026-09-20

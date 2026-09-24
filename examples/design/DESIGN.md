# Design principles

<!-- A worked example for an imaginary product. Yours will be different; the shape is what to copy. -->

## The product

Ledger is a bookkeeping tool for people who run small businesses and are not accountants. They open it at the end of a long day, usually to do one chore (send an invoice, file a receipt) and leave. They are tired, slightly anxious about money, and want to feel in control rather than impressed.

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

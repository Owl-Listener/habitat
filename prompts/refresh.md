# Refresh after Figma changes

Use when your Figma library has changed. Paste this with your habitat files attached, and either Figma access or fresh screenshots and a variables export.

If you can, first run `npx github:Owl-Listener/habitat parity design --code <your component folder>` and paste the output. It shows where your contracts and your code disagree.

---

My Figma library has changed since I wrote these design files. Bring them back in line, following one rule: **facts are refreshed, judgement is preserved.**

You may update: props and their Figma mapping, variant names, states, anatomy, token bindings, example content and Figma links in the component files, and values, aliases, modes, tiers and new tokens in `tokens.md`.

You must never rewrite: `purpose`, `whenToUse`, `antiPatterns`, `relationships`, accessibility decisions, notes, anything in `DESIGN.md`, or a token's `meaning`, `useFor` and `avoid`. Don't change `status` or `lastReviewed` either; those record my review.

Compare what Figma says now with what the files say. Update the facts, and give me the complete updated files. Then give me one list of what needs my decision:
- new variants without a decision rule
- rules that mention variants, states or tokens that no longer exist
- tokens whose values changed enough that their guidance may be wrong
- components in Figma with no file (create a draft file with the facts and `TODO` for everything else)
- components that seem to be gone from Figma (should they be deprecated, and what replaces them?)
- anything from the parity report where Figma and code disagree

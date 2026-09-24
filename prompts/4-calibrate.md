# 4. Calibrate

This is where the files get good, and where you see what they are worth. Paste this with all your habitat files attached (or with the habitat MCP server connected), plus your baseline eval.

---

Using **only** what my attached design files say (DESIGN.md, tokens.md and the component files), run my baseline prompt again, word for word: **[THE SAME PROMPT AS THE BASELINE]**.

Describe the screen component by component (or build it in code if you can), and for every choice, say which rule in my files you followed. Where the files didn't tell you what to do, say so explicitly instead of quietly choosing. If the screen needs a component my system doesn't have, tell me about the gap; don't invent a lookalike.

Then I'll tell you what's wrong. For each problem:
1. Work out which rule was missing or unclear.
2. Write it into the right place: a component's `antiPatterns` or `whenToUse`, an interaction rule, or a principle in `DESIGN.md`. Include the `because`, and the `source` for anti-patterns.
3. Add a row to the calibration log in `DESIGN.md`: date, what you did, the rule we added.

Give me this run as a new eval file (same template as the baseline), with its problem count next to the baseline's. Then run it again. We'll stop when my corrections are about taste rather than rules, and move on to the next journey.

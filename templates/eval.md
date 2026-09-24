# Eval: TODO journey name, TODO date

<!--
One file per run, e.g. evals/2026-09-24-send-invoice-baseline.md.

This is Buzz Usborne's method: ask the AI for a real screen, see what it gets
wrong, write down the missing rule, run it again. The first run happens BEFORE
any habitat files exist (the baseline), so you can see what your documentation
changes. Use the same prompt every time, so runs are comparable.
-->

- **Journey:** TODO e.g. "Send an invoice"
- **Context the AI had:** TODO "none (baseline)" or "habitat files + MCP"
- **Tool and model:** TODO e.g. Claude Code
- **Prompt:** TODO the exact prompt, reused on every run

## What came out

TODO a screenshot, a link, or a short description of the screen.

## What was wrong

| # | Problem | Type | Rule added (file) |
| --- | --- | --- | --- |
| 1 | TODO e.g. "Two primary buttons" | TODO invented component / raw value / wrong component / broke a principle / other | TODO e.g. "one primary per view (DESIGN.md)" |

**Total problems:** TODO

**Automatic check:** TODO if the AI wrote code, the last line of `habitat check <files> --design design`, e.g. "7 problem(s) (raw-colour 3, raw-size 2, raw-element 2)". This part of the count needs no judgement, so it is the most comparable between runs.

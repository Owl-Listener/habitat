# Eval: Send an invoice, 2026-09-21 (with habitat)

<!-- An illustrative example for the imaginary product Ledger, not a real measurement. -->

- **Journey:** Send an invoice
- **Context the AI had:** habitat files, AGENTS.md rules and the habitat MCP server
- **Tool and model:** Claude Code
- **Prompt:** the same prompt as the baseline.

## What came out

A single-column form built from Input and Button, one primary "Send invoice" with a secondary "Save draft", inline errors on blur. The AI stopped at the due date field and reported: "The system has no date picker. I used a plain Input with type=date for now; should a DatePicker be added?"

## What was wrong

| # | Problem | Type | Rule added (file) |
| --- | --- | --- | --- |
| 1 | Confirmed "Invoice sent" with a toast in the corner | broke a principle | Success is confirmed where the user is looking (DESIGN.md, "Say what happened"); now also listed under Interaction rules |

**Total problems:** 1 (down from 8). The date picker gap was reported rather than invented, which is the behaviour we want; it is now on the design system backlog.

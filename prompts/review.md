# Review a screen

Use any time, once your habitat files exist. Paste this with your habitat files attached (or the habitat MCP server connected), plus the screen: code, a Figma link, or a screenshot.

If it's code, first run `npx github:Owl-Listener/habitat check <file> --design design` and paste the output too. It catches raw values, unknown tokens, native elements and deprecated components automatically.

---

Review this screen against my design system, the way a senior designer on my team would: citing my rules, not your own taste.

For every problem, name the rule it breaks (the file and the rule, e.g. "DESIGN.md, One thing at a time" or "button.md, anti-pattern 1"), say where it is, and give the fix in my system's terms. Check principles, component choice (`whenToUse`), every anti-pattern of the components used, interaction rules (validation, errors, focus, loading, destructive actions), tokens by meaning (`useFor` and `avoid`), accessibility, and language. Include the automatic check results I pasted rather than redoing them.

If you see a problem that no rule covers, don't report it as a violation. List it under "Gaps in the system" with a proposed rule written as `TODO confirm: never … because …`, and say which file it belongs in.

End with two or three things the screen does well, citing the rules it follows. Give me the result as a table of problems (where, problem, rule, fix), then the gaps, then what works, with a count at the top.

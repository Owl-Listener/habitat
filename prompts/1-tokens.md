# 1. Tokens

Paste this, then attach `templates/tokens.md` and either your Figma file link (if your AI can reach Figma) or your exported variables.

---

Now let's write a `tokens.md` file in the exact format of the template I've attached: YAML front matter between `---` lines, with `kind: tokens`, `status: draft`, and a `tokens` list.

1. From my Figma variables (or the export I've attached), list every token with `name` (dot-separated, like `color.brand.default`), and either `value`, or `aliasOf` when the variable points at another one. Add `modes` if it has light/dark or theme values.
2. Give each token a `tier`: `primitive` for raw palette values (like `color.teal.600`), `semantic` for roles (like `color.brand.default`), `component` for values belonging to one component. Ask me if it isn't clear.
3. For `meaning`: only where the name makes it obvious, write `TODO confirm: <your guess>`. Otherwise write `TODO: what is this for?`. Never present a guess as fact.
4. Then ask me about the ambiguous semantic tokens, a few at a time. For tokens that are easy to misuse (brand colours, status colours, anything "muted", "subtle" or "accent"), also ask me for `useFor` and `avoid`.
5. Ask me who owns the tokens, and write my answers in my words, lightly tidied.
6. At the end, tell me about any colours or sizes you noticed that aren't variables, and give me the complete file.

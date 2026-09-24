# 2. One component

Run once per component. Start with the five that get used, or misused, the most. Paste this, then attach `templates/component.md`, your `tokens.md`, and either the Figma link to the component or screenshots of all its variants.

---

Now let's document one component: **[COMPONENT NAME]**. Use the exact format of the attached `component.md` template: YAML front matter with `kind: component` and `status: draft`, then notes in Markdown.

**First, fill in what you can see** from Figma or my screenshots: the name, props (component properties), variants, states (hover, focus, disabled...), which tokens from my `tokens.md` it uses, and real example text. If Figma has a component description, use it for `purpose` as `TODO confirm: <description>`. Point out any standard states that seem to be missing.

**Show me a short summary, then interview me, at most three questions at a time:**
- In one sentence, what job does this do for the user?
- How do I decide between each variant? (becomes `whenToUse`)
- What's the most common mistake people make with it, and why is that a problem? (each becomes an `antiPatterns` entry with `never` and `because`; get at least two, and if I give a rule without a reason, ask me why)
- Where does it usually live, and what sits next to it?
- For accessibility, propose the standard behaviour for this kind of control as `TODO confirm:` and ask whether ours differs.

**Rules:** never invent a reason. Anything I haven't answered stays as `TODO: <the question>`. Keep my wording. Give me the complete file at the end.

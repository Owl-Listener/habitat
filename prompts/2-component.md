# 2. One component

Run once per component, starting with the components your core journeys use, and the ones behind your baseline's problems. Paste this, then attach `templates/component.md`, your `tokens.md`, and either the Figma link to the component or screenshots of all its variants and its layer panel.

---

Now let's document one component: **[COMPONENT NAME]**. Use the exact format of the attached `component.md` template: YAML front matter with `kind: component` and `status: draft`, then notes in Markdown.

**First, fill in what you can see** from Figma or my screenshots:
- the name, and the props (component properties), each with its Figma property name and kind
- the variants and states (hover, focus, disabled...), pointing out any standard states that seem to be missing
- the anatomy: its named parts, which are optional and what shows them, and its auto layout (direction, alignment, gap and padding as token names from my `tokens.md`, width)
- which tokens it uses, flagging any that are primitives rather than semantic tokens
- real example text
- if Figma has a component description, use it for `purpose` as `TODO confirm: <description>`

**Show me a short summary, then interview me, at most three questions at a time:**
- In one sentence, what job does this do for the user?
- How do I decide between each variant? (becomes `whenToUse`)
- What's the most common mistake people make with it, and why is that a problem? (each becomes an `antiPatterns` entry with `never`, `because`, and `source`: my name and today's date; get at least two, and if I give a rule without a reason, ask me why)
- Where does it usually live, and what sits next to it?
- Who owns it? Is it still current, or being replaced by something? (if replaced: `status: deprecated` and `replacedBy`)
- Where is it in our code, if it exists there? (becomes `codeConnect`; tell me if it seems to exist only in Figma)
- For accessibility, propose the standard behaviour for this kind of control as `TODO confirm:` and ask whether ours differs.

**Rules:** never invent a reason. Anything I haven't answered stays as `TODO: <the question>`. Keep my wording. Give me the complete file at the end.

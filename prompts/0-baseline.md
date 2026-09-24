# 0. Journeys and baseline

Paste this first, in a fresh conversation, and attach `templates/eval.md`. Give the AI nothing else about your design system: the point is to see what it does without help.

---

I'm going to document my design system so that AI agents can use it properly. First I want to see what you do without any documentation.

1. Ask me which two or three user journeys matter most in my product (for example "send an invoice" or "invite a teammate"). Write them down as a short list; I'll use it later.
2. Then, for the first journey, design the screen, describing it component by component (or build it in code if you can): **[THE PROMPT, e.g. "Build the screen where a user sends an invoice to an existing customer, using our design system."]**. Keep this exact prompt; we will reuse it word for word.
3. Then ask me what's wrong with it. For each problem I name, note its type (invented component, raw value, wrong component, broke a principle, broke an interaction rule).
4. Give me the result as a file in the format of the attached eval template, with the total number of problems. This is my baseline.

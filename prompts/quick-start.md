# Try it in ten minutes

No install, no terminal, no Figma connection. Just you and any AI chat (Claude, ChatGPT, Gemini). Use one conversation from start to finish.

This is the smallest version of the habitat loop: see what the AI does without your judgement, write down a little of it, and see what changes.

---

## Step 1: Before (about three minutes)

Paste this, changing the bit in brackets to a real screen from your product:

> I want to see how you design for my product without any guidance. **[Design the screen where a user sends an invoice to an existing customer.]** Describe it section by section: what's on the screen, which components, which actions, and what the buttons say. Don't ask me anything first; make your best guess.

Read what comes back, then list what's wrong with it in a sentence each. Count them. That number is your before.

## Step 2: Write some of it down (about five minutes)

Paste this:

> Now interview me so you can write a short DESIGN.md: the judgement a new designer on my team would need. Ask me these five questions one at a time, and wait for each answer:
>
> 1. Who uses this product, and what state of mind are they usually in?
> 2. When two designers disagree about a screen, what principle usually settles it, and why?
> 3. What does our brand colour mean, and when do we hold it back?
> 4. What would make me reject a screen straight away, and why?
> 5. How should forms and errors behave: when do we validate, and where do errors appear?
>
> Then write the file with these sections: The product, Principles (each with "In practice" and "Because"), Colour, Interaction rules, Never (each with a reason). Use my words, lightly tidied. Never invent a reason: if I didn't give one, write "TODO: why?" instead.

Answer in your own words. Short answers are fine.

## Step 3: After (about two minutes)

Paste this:

> Now design the same screen again, word for word the same request as before, following the DESIGN.md you just wrote. Then list which of my earlier problems are fixed and which aren't.

Count what's still wrong. That's your after.

---

## What next

- **Keep the file.** Save the DESIGN.md somewhere you'll find it. It's the start of your habitat folder.
- **Use it today.** Paste it into a Claude Project's instructions, a custom GPT, or your team's AI tool, and every screen you ask for starts from your judgement.
- **Whatever is still wrong is your next rule.** Add it to the file and run step 3 again.
- **Ready for the full version?** The [numbered prompts](README.md) add your tokens, components and journeys, from Figma or screenshots, the same way. With a terminal, `npx @owl-listener/habitat init` sets it all up and checks your files for you.

I'd love to hear your before and after numbers. [Open an issue](https://github.com/Owl-Listener/habitat/issues) and tell me.

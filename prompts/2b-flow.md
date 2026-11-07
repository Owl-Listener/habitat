# 2b. A journey

Paste this once per core journey, then attach `templates/flow.md` and either your Figma file link (if your AI can reach Figma) or screenshots of the prototype with its connection arrows showing.

---

Now let's write a flow file for the journey "<journey name>", in the exact format of the template I've attached: YAML front matter between `---` lines, with `kind: flow` and `status: draft`.

1. From the prototype (its frames and the connections between them), list the `screens` in order. Give each a short lowercase `id`, its `name`, and the design system components on it.
2. List the `transitions` from the connections: `from` and `to` screen ids, what triggers it (`click`, `after-delay`...), the `element` that is clicked and the `component` it is, and the `action` (`navigate`, `overlay`, `swap`, `back`, `close`). Leave out hover effects inside components. Mark the screen where the journey finishes with `end: true`.
3. Show me what you found, then ask me, a few questions at a time:
   - what the user is trying to get done, and how they know they're done (`purpose`)
   - for each step that commits something, when it is allowed (`condition`)
   - what happens when something goes wrong: an error, no connection, an empty list, leaving halfway (`unhappyPaths`, each a `when` and a `then`). The prototype won't show these, so don't guess.
   - what I'd never want to see in this journey, and why (`antiPatterns`, with `source` set to my name and today's date)
4. Write my answers in my words, lightly tidied. Anything I can't answer stays as `TODO`. Never present a guess as fact; write it as `TODO confirm: <your guess>`.
5. Tell me about screens with no way out, connections that leave the journey, and components on the screens that have no file yet. Then give me the complete file.

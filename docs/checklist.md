# Your checklist

The [walkthrough in the README](../README.md#a-walkthrough), as a list you can work through on your own design system. Each task says how you'll know it's done. The optional ones can wait, and nothing breaks without them.

## Before you start (about half an hour)

- [ ] **Install Node.js 20 or later.** Done when `node --version` shows v20 or higher.
- [ ] **Connect the [Figma MCP server](https://help.figma.com/hc/en-us/articles/39216419318551-Get-started-with-the-Figma-MCP-server) to your AI tool.** Done when it can read your library file from its link.
- [ ] **Optional: score your Figma file with [agent-ready](https://github.com/Owl-Listener/agent-ready)** and fix the worst of it first, such as detached instances, hard-coded colours or missing auto layout. Done when the biggest gaps are closed, or you've decided to live with them for now.

## Set up (five minutes)

- [ ] **Run `npx @owl-listener/habitat init`** in your project folder. Done when you have a `design/` folder, the four skills in `.claude/skills/` and `.agents/skills/`, and the habitat rules in `AGENTS.md` and your agents' own files.

## See the problem first (about half an hour)

- [ ] **Start the guided extraction** and paste your Figma library link. In Claude Code, type `/habitat-extract`. In Codex, Cursor, Copilot or Gemini CLI, ask: "Use the habitat-extract skill".
- [ ] **Name the two or three journeys that matter most**, such as "send an invoice".
- [ ] **Run the baseline.** Your AI builds the first journey with no documentation, and you list everything wrong with it. Done when there's a baseline file in `design/evals/` with a problem count. That list is your to-do list.

## Write it down (an afternoon to a few days)

- [ ] **Tokens.** Your AI reads your variables and styles and sorts them into primitive, semantic and component tiers (or run `npx @owl-listener/habitat tokens import` on a design tokens export); you explain the ambiguous ones, and where brand and status colours may and may not go. Done when every semantic token in `tokens.md` has a meaning.
- [ ] **Components, one at a time**, starting with the ones your journeys use. Your AI reads the variants, properties, states, layers and auto layout; you say what each is for, how to choose between variants, what people get wrong and why, who owns it, and whether it's being retired. Done when each has a file with at least two never … because … rules.
- [ ] **Journeys, one per core journey.** Your AI reads the screens and connections from your prototype; you say when each step is allowed and what happens when things go wrong. Done when each core journey has a file in `design/flows/` with its unhappy paths filled in.
- [ ] **Principles and interaction rules.** An interview about your product and its users, what your brand colour means, and how forms, errors, dialogs, loading and destructive actions behave. Done when `DESIGN.md` has no big gaps.
- [ ] **Optional, and worth it: bring in your research** with the `habitat-research` skill. Hand over whatever you have; a researcher confirms each finding, then your AI links findings to rules. Done when your key rules cite evidence, and you've seen which ones rest on nothing.
- [ ] **Optional: link components to code.** Add where each lives in your codebase, then run `npx @owl-listener/habitat parity design --code src/components`. Done when nothing is missing from code, and you know which code components have no documentation yet.

## Prove it worked (an hour or two, more than once)

- [ ] **Run the baseline prompt again**, word for word, with the files in place. Each problem you still see becomes a new rule.
- [ ] **Count the problems.** If your AI wrote code, `npx @owl-listener/habitat check <files> --design design` gives a number anyone can repeat. Log each run in `design/evals/`.
- [ ] **Optional: automate it.** With an Anthropic API key, `npx @owl-listener/habitat eval design --prompt "…" --judge` runs the prompt with and without your files, three times each, and writes the counts to `design/evals/`. Done when you have an automatic report you can run again next month.
- [ ] **Repeat until your corrections are about taste rather than rules**, then move on to the next journey. Done when the count has dropped clearly from your baseline.

## Finish and switch it on (about half an hour)

- [ ] **Run `npx @owl-listener/habitat validate design`** and clear the errors.
- [ ] **Answer the remaining TODOs**, or leave the ones you choose to, and set `status: reviewed` and `lastReviewed` on each file you've checked.
- [ ] **Connect it to your agent:** `npx @owl-listener/habitat connect` shows how for each one. Done when your agent can call `get_principles`.
- [ ] **Commit `design/` and the rules files**, so your whole team and their agents get them. Done when a teammate asks their agent for a screen and it builds from your system, or tells them what's missing instead of inventing it.

## Keep it true (as you go)

- [ ] **When Figma changes**, run the `habitat-refresh` skill and answer the decisions it lists.
- [ ] **When you review a screen or pull request**, run the `habitat-review` skill, and adopt the proposed rules you agree with.
- [ ] **When new research lands**, add it with the `habitat-research` skill, and retire the findings it replaces.
- [ ] **Every so often**, run `validate` to catch files nobody has reviewed in six months and research more than a year old. You can also add `validate --strict` to your CI.
- [ ] **Optional: check every pull request.** Add the habitat GitHub Action or the ESLint plugin (see [In pull requests and your editor](../README.md#in-pull-requests-and-your-editor)). Done when a pull request with a hard-coded colour gets a comment on that line.

## If you only have an afternoon

Install Node, connect Figma, run `init`, do the baseline, write `DESIGN.md`, run the baseline again, and connect it to your agent. That's enough to get output that is recognisably yours, and to see for yourself whether the rest is worth doing.

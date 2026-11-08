# Prompts for any AI

The same process as the Claude Code skill, as prompts you paste into any AI tool (Claude, ChatGPT, Gemini, Cursor). Run them in order, in one conversation. You don't need a terminal or anything installed.

New to this? Start with [quick-start.md](quick-start.md): ten minutes, one screen, a before and an after.

| Prompt | What it produces | What to give the AI |
| --- | --- | --- |
| [0-baseline.md](0-baseline.md) | Your core journeys, and `evals/…-baseline.md` | Nothing yet: this shows what the AI does without help |
| [1-tokens.md](1-tokens.md) | `tokens.md` | Figma access, or your exported variables (JSON) |
| [2-component.md](2-component.md) | `components/<name>.md` | Figma access, or screenshots of the component, its variants and its layers |
| [2b-flow.md](2b-flow.md) | `flows/<journey>.md` | Figma access, or screenshots of the prototype with its connections showing |
| [3-principles.md](3-principles.md) | `DESIGN.md` | Any existing principles or brand guidelines you have |
| [4-calibrate.md](4-calibrate.md) | Sharper rules everywhere, and a before/after count | Everything above |

And three you'll come back to:

| Prompt | When | What it produces |
| --- | --- | --- |
| [research.md](research.md) | When you have user research to bring in | Insight files, and your rules linked to the evidence behind them |
| [review.md](review.md) | Any time you want a screen critiqued against your system | A report: problems with the rule each breaks, and gaps in the rules |
| [refresh.md](refresh.md) | When your Figma library changes | Updated facts, and a list of decisions only you can make |

The method is a loop: ask an AI for a real screen, see what it gets wrong, write down the judgement it was missing, and run it again. Prompt 0 is the "before"; prompt 4 is the "after".

**If your AI tool can connect to Figma** (through the Figma MCP server), it can read the file itself. **If it can't,** export your variables (in Figma, use a variables export plugin, or copy them from the Variables panel), take screenshots of each component's variants and layer panel, and take screenshots of your prototype with the connection arrows showing. If your export is W3C design tokens JSON, `npx @owl-listener/habitat tokens import <file.json> --design design` writes the facts into `tokens.md` without the AI. The prompts work either way.

Attach the matching template from [`../templates`](../templates) to each prompt, so the AI copies its exact format. Run 2-component once per component, starting with the ones your core journeys use, and 2b-flow once per core journey.

Save each file the AI gives you into a folder called `design`. When you are done, and if you have Node.js, check your files:

```bash
npx @owl-listener/habitat validate design
```

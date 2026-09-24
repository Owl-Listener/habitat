# Prompts for any AI

The same process as the Claude Code skill, as prompts you paste into any AI tool (Claude, ChatGPT, Gemini, Cursor). Run them in order, in one conversation.

| Prompt | What it produces | What to give the AI |
| --- | --- | --- |
| [1-tokens.md](1-tokens.md) | `tokens.md` | Figma access, or your exported variables (JSON) |
| [2-component.md](2-component.md) | `components/<name>.md` | Figma access, or screenshots of the component and its variants |
| [3-principles.md](3-principles.md) | `DESIGN.md` | Any existing principles or brand guidelines you have |
| [4-calibrate.md](4-calibrate.md) | Sharper rules everywhere | A real screen you build often |

**If your AI tool can connect to Figma** (through the Figma MCP server), it can read the file itself. **If it can't,** export your variables (in Figma, use a variables export plugin, or copy them from the Variables panel) and take screenshots of each component's variants. The prompts work either way.

Attach the matching template from [`../templates`](../templates) to each prompt, so the AI copies its exact format. Run 2-component once per component.

When you are done, check your files:

```bash
npx github:Owl-Listener/habitat validate design
```

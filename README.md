# habitat

**Your design system is invisible to AI. habitat helps you change that.**

Ask a coding agent to build a screen with your design system and watch what happens. It invents components you already have. It hard-codes colours. It puts two primary buttons side by side, because nothing told it why you never would. The agent is capable. It just can't see the years of decisions that live in your team's heads.

habitat is a kit for writing those decisions down, in a form an agent can read, and then checking that it worked. You keep your own design system; habitat helps you make it legible. You bring your Figma library and your AI, and together they draw the reasoning out of you, a few questions at a time.

By MC Dean · [MC Percolates on Substack](https://marieclairedean.substack.com) · [On npm as @owl-listener/habitat](https://www.npmjs.com/package/@owl-listener/habitat) · MIT licensed

If you're new, [try it in ten minutes](#try-it-in-ten-minutes) with nothing to install. To set it up properly, start at the [quick start](#quick-start) and follow the [walkthrough](#a-walkthrough), or the same steps as a [checklist](docs/checklist.md). [The commands](#the-commands) and [your agent's setup](#works-with-your-agent) are further down for when you need to look something up.

---

## How does it work?

Figma already knows what your system is made of: components, variants, properties, layout, variables. What it can't hold is why. When to pick one variant over another, the mistakes you've watched people make, what your brand colour is allowed to mean. That judgement is exactly what an agent needs.

So habitat splits the work in two. **The AI reads the facts from Figma. You supply the reasons.** It interviews you for them, and it never makes one up. Anything it doesn't know stays marked `TODO`, and anything it guesses stays marked `TODO confirm:` until you agree.

Then it tests the result. Ask an AI to build a real screen with no context, look at what it gets wrong, write down the missing rule, and run it again. Each pass exposes another piece of judgement the system needs, and the drop in problems tells you what your documentation is worth.

## Try it in ten minutes

You don't need to install anything to see whether this is worth your time. Open any AI chat (Claude, ChatGPT, Gemini) and follow [the ten-minute version](prompts/quick-start.md):

1. **Before.** Ask the AI to design one real screen from your product with no guidance, and count what's wrong with it.
2. **Write some of it down.** Answer five questions about your product, your principles and your brand colour. The AI turns your answers into a short `DESIGN.md`, in your words, and marks anything you didn't give a reason for as `TODO`.
3. **After.** Ask for the same screen again with that file, and count again.

The difference between those two numbers is the whole idea of habitat, in miniature. Keep the file: paste it into a Claude Project or a custom GPT and every screen you ask for starts from your judgement. Everything below is how to go further.

## What you'll need

For the ten-minute version, just an AI chat. For the full kit:

- **Node.js 20 or later, for the commands.** The `habitat` command runs on it. Check with `node --version`, and install it from [nodejs.org](https://nodejs.org) if you need to. Never used a terminal? You can skip this: the prompts do the same work without it (see [No terminal?](#no-terminal-use-any-ai) below).
- **An AI tool.** Claude Code, Codex, Cursor, GitHub Copilot and Gemini CLI get the guided skills. Windsurf, ChatGPT or anything else can use the copy-paste prompts. See [Works with your agent](#works-with-your-agent).
- **Your Figma library, connected to your AI** through the [Figma MCP server](https://help.figma.com/hc/en-us/articles/39216419318551-Get-started-with-the-Figma-MCP-server). No connection? Screenshots and a variables export work too, just more slowly.

You don't need to install habitat itself. Every command below runs it straight from npm with `npx`.

## Quick start

### With a terminal

In your project folder:

```bash
npx @owl-listener/habitat init
```

Then start the guided extraction. In Claude Code, type `/habitat-extract`. In Codex, Cursor, Copilot or Gemini CLI, ask: "Use the habitat-extract skill". Give it your Figma file link, and it takes you through everything else.

### No terminal? Use any AI

The same process works as copy-paste prompts in any AI chat, with nothing to install. It's slower, because you do the saving and checking yourself, but you get the same files.

1. **Download the templates.** Open the [templates folder](templates), open each file, and use the download button (or copy the text into a file of the same name). Keep them together in a folder called `design`.
2. **Work through the [prompts](prompts) in order**, in one conversation. Each one says which template to attach. If your AI can't reach Figma, attach screenshots of your components and an export of your variables instead.
3. **Save each file the AI gives you** into your `design` folder, replacing the template.
4. **Give the folder to your AI.** Add the files to a Claude Project or a custom GPT, or hand the folder to whoever sets up your team's coding agent. When they connect it with the habitat commands, nothing needs redoing.

## A walkthrough

Here's what it looks like for Sam, a design lead with a Figma library and a React codebase. Sam is made up, and so are the numbers. They're there to show you the shape of the loop, and the real test is your own before and after.

If you'd rather tick things off as you go, the same steps are in a [checklist](docs/checklist.md), where each task says how you'll know it's done.

### 1. Set up (five minutes)

Sam runs `npx @owl-listener/habitat init` in the project folder. That creates a `design/` folder with the templates, installs the four guided skills where Claude Code and the other agents look for them, and adds a short block of always-on rules to `AGENTS.md` (the file most agents read), plus `CLAUDE.md`, `.cursor/rules/`, `.github/copilot-instructions.md` and `GEMINI.md`. Agents read these before every task, and they say: read the design system first, never hard-code values, and if something's missing, say so instead of inventing a lookalike. If the team only uses some of those tools, `--agents claude,cursor` keeps it to those.

It never overwrites anything. Run it twice and nothing changes.

### 2. See the problem (half an hour)

Sam runs `/habitat-extract` and pastes the Figma link. The first thing it asks is which two or three user journeys matter most, say "send an invoice". Then it builds that screen with no documentation at all, and asks Sam what's wrong with it.

Sam finds eight problems. Two primary buttons, a hand-built date picker, hard-coded colours, "Oops!" in the error message... That list is the baseline, and it's also the to-do list.

### 3. Write it down (an afternoon to a few days)

The AI reads what it can from Figma: variables and styles, components, variants, states, layers, auto layout, and the prototype's screens and the connections between them. Then it interviews Sam for what Figma can't hold.

- How do you decide between primary and secondary?
- What's the most common mistake people make with this?
- Why is that a problem?

For each journey it also asks what the prototype doesn't show: when each step is allowed, and what happens when something goes wrong. Prototypes almost always show the path where everything works, and that's exactly where agents improvise.

Sam's answers go into the files in Sam's own words, with Sam's name and the date on each rule, so anyone can trace a rule back to a decision.

### 4. Prove it worked

The AI runs the same prompt again, this time with the files. Sam says what's still wrong, and each correction becomes a new rule. When the AI writes code, `habitat check` gives a number anyone can repeat:

```bash
npx @owl-listener/habitat check src/screens --design design
```

Eight problems down to one is the evidence. Sam stops when the corrections feel like matters of taste rather than rules.

Once the team has an Anthropic API key, `habitat eval` does the asking and the counting for them. It runs the same prompt several times under three conditions, counts the problems in each, and can have Claude review each screen against the team's own rules:

- **Baseline:** nothing about the design system at all.
- **Facts only:** the tokens and components (names, values, props, variants), without any of the reasons. Roughly what a Figma file or a component library already gives an agent.
- **habitat:** the whole design folder.

A baseline that never saw your tokens can't use them, so some of its problems are guaranteed, and a drop from baseline would flatter habitat. The fair comparison is facts only against habitat: same tokens and components, with and without the reasons behind them. That gap is what writing down your judgement is worth, and the report shows both. The numbers land in `design/evals/`, so this month's run can be compared with last month's:

```bash
npx @owl-listener/habitat eval design --journey "Send an invoice" --prompt "Build the screen where a user sends an invoice to an existing customer" --judge
```

### 5. Bring in the research (optional, and worth it)

Rules tell an agent what to do in the cases someone foresaw. Research tells it why, and that's what lets it make a good call when nothing in the files covers the case. An agent that knows "our users do their bookkeeping at the end of a tiring day, and abandon anything that feels risky with money" will reach for undo over a confirmation dialog on a screen nobody wrote a rule for.

Sam runs `/habitat-research` and hands it whatever the team has: reports, interview notes, a research repository export, survey results, support tickets. It can live anywhere. The AI distils it into short findings, one per file, each with its evidence and an honest confidence rating (strong, emerging or hunch), and a researcher confirms every one. Then it links each finding to the rules it supports, and shows Sam which rules rest on nothing, and which findings have no rule yet.

Two things it's careful about. It never copies transcripts or personal data into the files, because they're committed to a repository and read by AI tools; it distils, anonymises and links to the source instead. And it keeps hunches labelled as hunches, so an agent doesn't treat one vivid quote as law.

If the team keeps evidence-based descriptions of who it serves, those can go in too, as situations rather than invented personas. If not, the findings work on their own.

### 6. Switch it on for the team

```bash
npx @owl-listener/habitat connect
```

That shows how to connect habitat to each agent: one command for Claude Code and Codex, and a few lines of settings for Cursor, Copilot, Gemini CLI and Windsurf. `connect cursor --write` adds it to the project's settings for you.

Now, when anyone asks an agent to build UI, it reads the principles, looks up the right components and what the team knows about the people it's building for, checks its own code before handing it over, and says "there's no date picker in the system" instead of quietly building one.

### 7. Keep it true

A design system keeps growing, and documentation that no longer matches it is worse for an agent than none, because the agent follows it with confidence.

- **`/habitat-review`** critiques any screen, Figma frame or pull request against the team's rules, and names the rule behind every problem. Anything no rule covers comes back as a proposed new rule, so every review makes the system a little smarter.
- **`/habitat-refresh`** re-reads Figma when the library changes: components, variables, styles and prototypes. It updates the facts, never touches the reasons, and hands Sam a short list of the decisions only a person can make.
- **`habitat tokens import`** brings a W3C design tokens file (Figma's variable export, Tokens Studio and others speak it) into `tokens.md` under the same rule, and **`habitat tokens export`** hands the tokens, meanings included, back to any token pipeline.
- **`habitat parity`** reads the component code and shows where it and the documentation disagree, in both directions: props the documentation promises that the code doesn't have, and props and values the code has that nobody wrote down.
- **`habitat validate`** flags any file nobody has reviewed in six months, research that's more than a year old, and rules that still cite findings newer research has replaced.

### Or start smaller

Not ready for all of that? Start with [the ten-minute version](prompts/quick-start.md). Then fill in `design/DESIGN.md` on its own (your product, your core journeys, your principles and how forms, errors and dialogs should behave) and run a few rounds of steps 2 and 4. It's an afternoon's work, and it gets you AI output that is recognisably yours before you've documented a single component. Add component files later, for whatever keeps going wrong.

## What you end up with

```
your-project/
├── design/
│   ├── DESIGN.md          your principles, core journeys and interaction rules
│   ├── tokens.md          every token, its tier, and what it means
│   ├── components/
│   │   └── button.md      one file per component: a contract, then your notes
│   ├── flows/
│   │   └── send-invoice.md one file per core journey: screens, steps, what goes wrong
│   ├── research/          optional: what you know about your users
│   │   ├── insights/      one finding per file, with its evidence and confidence
│   │   └── people/        optional: the kinds of people you serve
│   └── evals/             each test run: what the AI got wrong, and what fixed it
├── AGENTS.md              the always-on rules, read by most agents (added to your existing file)
├── CLAUDE.md, GEMINI.md, .github/copilot-instructions.md, .cursor/rules/habitat.mdc
│                          the same rules, for agents with a file of their own
├── .claude/skills/        the four skills, for Claude Code
└── .agents/skills/        the same skills, for Codex, Cursor, Copilot and Gemini CLI
```

Each component file opens with a structured contract: what it's for, when to use each variant, its states, anatomy and layout, which tokens it uses, accessibility, and the things it must never do, each with a because, and the research it rests on where there is some. Your notes go underneath, in plain prose. Each flow file does the same for a journey: its screens and the components on them, the steps between them and when each is allowed, what happens when things go wrong, and what never to do along the way. Have a look at the worked example in [`examples/design`](examples/design) to see a finished set.

## The commands

| Command | What it does |
| --- | --- |
| `habitat init [folder]` | Sets up a design folder (`design` by default), the skills and the always-on rules for every agent. `--agents claude,cursor` keeps it to the tools you use |
| `habitat validate [folder]` | Checks every file, lists open TODOs, and warns about stale files, missing tokens and broken references. Add `--strict` in CI to fail while any TODO remains |
| `habitat check <files> --design <folder>` | Checks code for hard-coded colours and sizes, invented tokens, retired components, and native elements where your system has a component, with file, line and the fix where there's one right answer. `--fix` applies those fixes, `--changed-since origin/main` keeps to the lines you changed, and `--format github` annotates a pull request |
| `habitat parity [folder] --code <folder>` | Reads your component code and checks each documented component exists with the props, values and defaults it promises; lists props and code components nobody documented |
| `habitat tokens import <files> --design <folder>` | Brings W3C design tokens JSON (one file per mode) into `tokens.md`: updates values, never meanings. Add `--dry-run` to see the changes first |
| `habitat tokens export [folder]` | Writes your tokens, meanings included, as W3C design tokens JSON for other tools |
| `habitat export [folder]` | Writes a `DESIGN.md` in [Google's open format](https://github.com/google-labs-code/design.md), so tools that read that format get your tokens, components and rules too. Add `--name` for your product's name |
| `habitat eval [folder] --prompt "…"` | Runs the prompt with nothing, with only your tokens and components, and with the whole design folder, counts the problems, and writes a report to `evals/`. Add `--judge` for a review against your rules, `--dry-run` to see the plan. Needs an Anthropic API key |
| `habitat connect [agent]` | Shows how to connect habitat to Claude Code, Codex, Cursor, Copilot, Gemini CLI or Windsurf, with your folder's path filled in. `--write` adds it to that agent's settings in your project |
| `habitat serve [folder]` | Serves your design folder to a coding agent over MCP |

Put `npx @owl-listener/habitat` in front of each one. When an agent is connected through `serve`, it gets eight tools: `get_principles` (read first), `list_components`, `get_component`, `get_tokens`, `get_rules`, `get_flows` for how a journey moves between screens, `get_research` for what the team knows about its users, and `check_code` for checking its own work.

## The skills and prompts

| As a skill | As prompts, for any AI | When |
| --- | --- | --- |
| `habitat-extract` | [prompts 0 to 4](prompts), with 2b for journeys | Writing your system down for the first time |
| `habitat-research` | [research.md](prompts/research.md) | When you have user research to bring in |
| `habitat-review` | [review.md](prompts/review.md) | Whenever you want a screen critiqued against your rules |
| `habitat-refresh` | [refresh.md](prompts/refresh.md) | When your Figma library changes |

## Works with your agent

habitat isn't tied to one AI. The design files are plain Markdown, the rules go where each agent looks, and the MCP server speaks an open standard.

| Agent | Always-on rules | Guided skills | Connect the MCP server |
| --- | --- | --- | --- |
| Claude Code | `CLAUDE.md` (imports `AGENTS.md`) | `.claude/skills/`, run as `/habitat-extract` | `claude mcp add habitat -- npx -y @owl-listener/habitat serve design` |
| OpenAI Codex | `AGENTS.md` | `.agents/skills/` | `codex mcp add habitat -- npx -y @owl-listener/habitat serve /full/path/to/design` |
| Cursor | `.cursor/rules/habitat.mdc` | `.agents/skills/` | `npx @owl-listener/habitat connect cursor --write` |
| GitHub Copilot (VS Code) | `.github/copilot-instructions.md` | `.agents/skills/` | `npx @owl-listener/habitat connect copilot --write` |
| Gemini CLI | `GEMINI.md` | `.agents/skills/` | `npx @owl-listener/habitat connect gemini --write` |
| Windsurf | `AGENTS.md` | use the [prompts](prompts) | add it to `~/.codeium/windsurf/mcp_config.json` (see below) |

In the agents other than Claude Code, start a skill by asking for it by name: "Use the habitat-extract skill".

`npx @owl-listener/habitat connect` prints the exact setup for every agent, with your folder's path filled in. `connect <agent> --write` adds habitat to that agent's settings file in your project. It keeps anything already there, and leaves alone a file it can't read safely. Codex and Windsurf keep their settings outside the project, so for those it shows what to add. Any other agent that supports MCP can run `npx -y @owl-listener/habitat serve /full/path/to/design`.

<details>
<summary>The settings, if you'd rather add them by hand</summary>

Cursor, in `.cursor/mcp.json`:

```json
{ "mcpServers": { "habitat": { "command": "npx", "args": ["-y", "@owl-listener/habitat", "serve", "${workspaceFolder}/design"] } } }
```

GitHub Copilot in VS Code, in `.vscode/mcp.json`:

```json
{ "servers": { "habitat": { "type": "stdio", "command": "npx", "args": ["-y", "@owl-listener/habitat", "serve", "${workspaceFolder}/design"] } } }
```

Gemini CLI, in `.gemini/settings.json`:

```json
{ "mcpServers": { "habitat": { "command": "npx", "args": ["-y", "@owl-listener/habitat", "serve", "/full/path/to/design"] } } }
```

Codex, in `~/.codex/config.toml`:

```toml
[mcp_servers.habitat]
command = "npx"
args = ["-y", "@owl-listener/habitat", "serve", "/full/path/to/design"]
```

Windsurf, in `~/.codeium/windsurf/mcp_config.json`: the same as Gemini CLI's.

</details>

Agents move their settings around more often than anything else here. If one of these stops working, [open an issue](https://github.com/Owl-Listener/habitat/issues) and I'll update it.

## In pull requests and your editor

You don't have to remember to run `check`. Two ways to have it run for you:

**On every pull request.** Add this to a workflow in `.github/workflows/`, and problems show up as comments on the lines the pull request changed. Old code doesn't block new work.

```yaml
on: pull_request
jobs:
  design-system:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Owl-Listener/habitat@v0.4.0
        with:
          paths: src
          design: design
```

**In your editor, and in the linting you already run.** habitat comes with an ESLint plugin that runs the same checks on your JavaScript and TypeScript as you type, and `eslint --fix` applies the same safe fixes. ESLint doesn't read CSS, so keep `habitat check` (or the GitHub Action) for stylesheets.

Add it to `eslint.config.js`. On its own, this works for `.js` and `.jsx` files:

```js
import habitat from "@owl-listener/habitat/eslint";

export default [
  habitat.configs.recommended, // reads ./design
];
```

ESLint can't read TypeScript without a parser, so for `.ts` and `.tsx` put one first. If your project already lints TypeScript, add the habitat line to that config. If not, `npm install -D typescript-eslint` and:

```js
import tseslint from "typescript-eslint";
import habitat from "@owl-listener/habitat/eslint";

export default [
  tseslint.configs.base, // lets ESLint read TypeScript, with no rules of its own
  habitat.configs.recommended,
];
```

For another folder: `{ plugins: { habitat }, rules: { "habitat/design-system": ["warn", { design: "src/design" }] } }`.

A fix is only ever automatic when there's exactly one right answer: a raw value that matches one token of the right kind (a spacing token on `padding`, a text colour on `color`). Swapping a hand-built button for your Button component is always left to a person, because the props differ.

## habitat and the tools you already use

habitat is the judgement layer. It works best next to the tools that hold your facts, rather than instead of them.

- **[Figma's MCP server](https://help.figma.com/hc/en-us/articles/39216419318551-Get-started-with-the-Figma-MCP-server)** is where the facts come from. Figma also offers a skill that writes design system rules from your codebase's conventions. habitat's rules come from your team's reasons, and the two sit happily side by side.
- **[Storybook's MCP addon](https://storybook.js.org/blog/storybook-mcp-for-react/)** and the **shadcn MCP** tell an agent which components exist in code and which props they take. Connect them alongside habitat: they say what a component is, habitat says when to use it and what never to do with it. The extract, review and refresh skills use them when they're connected.
- **[DESIGN.md](https://github.com/google-labs-code/design.md)** is Google's open format for describing a design system in one file, popularised by collections like [awesome-design-md](https://github.com/VoltAgent/design-md). Those files capture how a product looks; habitat captures why. `habitat export` writes your system in that format, so you can use both.
- **W3C design tokens.** `habitat tokens import` and `export` speak the format Figma's variable export, Tokens Studio and Style Dictionary share.

## What habitat can't do for you

I'd rather you knew this upfront.

- **It can't tidy a messy source.** If your library is full of detached instances, hard-coded colours and inconsistent names, no amount of documentation will fully make up for it, and some teams find they have to restructure before AI can use their system well. habitat tells you what's wrong in Figma; [agent-ready](https://github.com/Owl-Listener/agent-ready) scores the structure and helps you fix it, but the fixing is still your work.
- **It can't make Figma and code match.** When the two drift apart, AI confidently builds screens that look right from components that don't exist. habitat finds the mismatches. Building the missing components and retiring the stale ones is design and engineering work. Its parity check also reads code as text, so treat what it finds as things to look at, not proof something is wrong.
- **It can't supply the judgement.** The interview draws out what your team already knows. It won't invent taste you haven't formed yet, and it won't try.

Put together with agent-ready, the whole loop looks like this: fix the structure, write down the judgement, serve it to your agents, check the results, and keep it true as things change.

## What's in this repo

```
habitat/
├── templates/          the blank files that init copies into your project
├── skills/             the four skills (Agent Skills format)
├── prompts/            the same processes as copy-paste prompts, for any AI
├── schema/             what valid component, flow, tokens and research files look like
├── bin/ and lib/       the habitat command
├── mcp-server/         serves a design folder to an agent
├── examples/
│   ├── design/         a finished design folder for an imaginary product, Ledger
│   └── code/           the Button and Input it describes, in React
├── test/               tests for the command and the MCP server
├── .github/workflows/  validation on every push, and publishing to npm on each release
├── action.yml          the GitHub Action that checks pull requests
└── docs/
    ├── checklist.md    the walkthrough as a list you can tick off
    └── intent-spec.md  every field in the contract, why it exists, and where its answer comes from
```

## Related

- [agent-ready](https://github.com/Owl-Listener/agent-ready) scores how legible your Figma file is to an agent. Every field in a habitat contract maps to one of its checks, so the two define the same standard from two directions.
- [designer-skills](https://github.com/Owl-Listener/designer-skills) is the judgement of a design team, written down as agent skills.
- [DESIGN.md](https://github.com/google-labs-code/design.md) by Google Labs is an open, single-file format for design systems. habitat can export to it.
- [design-system-mcp](https://glama.ai/mcp/servers/dgesteves/design-system-mcp) serves a React design system's components and tokens to agents, with a linter whose fix-it suggestions inspired habitat's.
- [Design System Contracts](https://github.com/southleft/ds-contracts-poc) by Southleft generates matching React and Figma libraries from machine-readable contracts. It captures structure where habitat captures judgement, and the two fit together well. Their with-and-without test is a good model for your own evals, the same model scored 100 with contracts and 69 without.

## Further reading

The writing that shaped habitat. Each one is worth your time in full.

- **[Designing with AI](https://buzzusborne.com/work/designing-with-ai/)** by Buzz Usborne. How Help Scout made a mature design system legible to LLMs: articulating how they design as well as what, a design.md built through repeated evals, and full parity between Figma and React. The clearest account I've read of how much work this really is, and why it pays off.
- **[My 4-step framework to make design systems AI-readable](https://medium.muz.li/my-4-step-framework-to-make-design-systems-ai-readable-74ba07145312)** by The Maker's Lab. Audit a handful of components first, generate specs that include anatomy and layout, start with one component, and measure the difference.
- **[Designing with AI-Readable Design Systems in Cursor](https://medium.com/design-bootcamp/working-with-ai-readable-design-systems-in-cursor-2bba9c9c09d9)** on Bootcamp. Prompts, rules and instructions as three layers, always-on rules the agent reads before every task, and checkpoints where the AI compares its output with the system.
- **[Machine-Readable Design Tokens for AI-Ready Component Libraries](https://southleft.com/insights/design-systems/machine-readable-design-tokens-for-ai-ready-component-libraries/)** by Southleft. Primitive, semantic and component tokens, and the case for putting each token's usage rule in its description, because that's the guidance a name can't carry.
- **[Digital Design Systems as the Foundation for AI-Powered Product Development](https://ibmix.de/en/blog/design-systems-and-ai)** by IBM iX. The organisational view: governance, versioning and deprecation, interaction and validation rules for agents, a traceable why behind every pattern, and measuring impact rather than activity.

Thank you to everyone writing openly about this while it's still being worked out. If you've written something that belongs here, [open an issue](https://github.com/Owl-Listener/habitat/issues) and tell me about it.

## Contributing

Fork it, break it, make it better. Run `npm install` and then `npm test` before you open a pull request.

If you try habitat on your own design system, I'd love to hear what your before and after looked like. That's the real test of whether any of this works, so go and run your baseline, then [open an issue](https://github.com/Owl-Listener/habitat/issues) and tell me what you find.

### Releasing a new version

1. Change `version` in `package.json` (for example to `0.4.0`), and merge that change into main.
2. On GitHub, go to Releases and draft a new release. Give it a tag that matches the version with a `v` in front (`v0.4.0`), targeting main, and publish it.
3. GitHub runs the tests and publishes the package to npm. It stops if the tag and the version don't match. You can follow it under the Actions tab, and the new version is usually on npm within a few minutes.

Then update the `@v0.4.0` in the GitHub Action example above to the new tag.

## Licence

MIT.

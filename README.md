# habitat

**Your design system is invisible to AI. habitat helps you change that.**

Ask a coding agent to build a screen with your design system and watch what happens. It invents components you already have. It hard-codes colours. It puts two primary buttons side by side, because nothing told it why you never would. The agent is capable. It just can't see the years of decisions that live in your team's heads.

habitat is a kit for writing those decisions down, in a form an agent can read, and then checking that it worked. You keep your own design system; habitat helps you make it legible. You bring your Figma library and your AI, and together they draw the reasoning out of you, a few questions at a time.

By MC Dean · [MC Percolates on Substack](https://marieclairedean.substack.com) · MIT licensed

---

## How does it work?

Figma already knows what your system is made of: components, variants, properties, layout, variables. What it can't hold is why. When to pick one variant over another, the mistakes you've watched people make, what your brand colour is allowed to mean. That judgement is exactly what an agent needs.

So habitat splits the work in two. **The AI reads the facts from Figma. You supply the reasons.** It interviews you for them, and it never makes one up. Anything it doesn't know stays marked `TODO`, and anything it guesses stays marked `TODO confirm:` until you agree.

Then it tests the result. The method comes from Buzz Usborne's work at Help Scout, described in [Designing with AI](https://buzzusborne.com/work/designing-with-ai/). Ask an AI to build a real screen with no context, look at what it gets wrong, write down the missing rule, and run it again. Each pass exposes another piece of judgement the system needs, and the drop in problems tells you what your documentation is worth.

## What you'll need

- **Node.js 20 or later.** The `habitat` command runs on it. Check with `node --version`, and install it from [nodejs.org](https://nodejs.org) if you need to.
- **An AI tool.** Claude Code gets the guided skills. Anything else (ChatGPT, Gemini, Cursor) can use the copy-paste prompts.
- **Your Figma library, connected to your AI** through the [Figma MCP server](https://help.figma.com/hc/en-us/articles/39216419318551-Get-started-with-the-Figma-MCP-server). No connection? Screenshots and a variables export work too, just more slowly.

You don't need to install habitat itself. Every command below runs it straight from GitHub with `npx`.

## Quick start

In your project folder:

```bash
npx github:Owl-Listener/habitat init
```

Then, in Claude Code:

```
/habitat-extract
```

Give it your Figma file link, and it takes you through everything else. Using a different AI? Open the [prompts](prompts) and paste them in order.

## A walkthrough

Here's what it looks like for Sam, a design lead with a Figma library and a React codebase.

### 1. Set up (five minutes)

Sam runs `npx github:Owl-Listener/habitat init` in the project folder. That creates a `design/` folder with the templates, installs three Claude Code skills, and adds a short block of always-on rules to `AGENTS.md`, `CLAUDE.md` and `.cursor/rules/habitat.mdc`. Claude Code, Cursor and other agents that support these files read them before every task. They say: read the design system first, never hard-code values, and if something's missing, say so instead of inventing a lookalike.

It never overwrites anything. Run it twice and nothing changes.

### 2. See the problem (half an hour)

Sam runs `/habitat-extract` and pastes the Figma link. The first thing it asks is which two or three user journeys matter most, say "send an invoice". Then it builds that screen with no documentation at all, and asks Sam what's wrong with it.

Sam finds eight problems. Two primary buttons, a hand-built date picker, hard-coded colours, "Oops!" in the error message... That list is the baseline, and it's also the to-do list.

### 3. Write it down (an afternoon to a few days)

The AI reads what it can from Figma: tokens, components, variants, states, layers, auto layout. Then it interviews Sam for what Figma can't hold.

- How do you decide between primary and secondary?
- What's the most common mistake people make with this?
- Why is that a problem?

Sam's answers go into the files in Sam's own words, with Sam's name and the date on each rule, so anyone can trace a rule back to a decision.

### 4. Prove it worked

The AI runs the same prompt again, this time with the files. Sam says what's still wrong, and each correction becomes a new rule. When the AI writes code, `habitat check` gives a number anyone can repeat:

```bash
npx github:Owl-Listener/habitat check src/screens --design design
```

Eight problems down to one is the evidence. Sam stops when the corrections feel like matters of taste rather than rules.

### 5. Bring in the research (optional, and worth it)

Rules tell an agent what to do in the cases someone foresaw. Research tells it why, and that's what lets it make a good call when nothing in the files covers the case. An agent that knows "our users do their bookkeeping at the end of a tiring day, and abandon anything that feels risky with money" will reach for undo over a confirmation dialog on a screen nobody wrote a rule for.

Sam runs `/habitat-research` and hands it whatever the team has: reports, interview notes, a research repository export, survey results, support tickets. It can live anywhere. The AI distils it into short findings, one per file, each with its evidence and an honest confidence rating (strong, emerging or hunch), and a researcher confirms every one. Then it links each finding to the rules it supports, and shows Sam which rules rest on nothing, and which findings have no rule yet.

Two things it's careful about. It never copies transcripts or personal data into the files, because they're committed to a repository and read by AI tools; it distils, anonymises and links to the source instead. And it keeps hunches labelled as hunches, so an agent doesn't treat one vivid quote as law.

If the team keeps evidence-based descriptions of who it serves, those can go in too, as situations rather than invented personas. If not, the findings work on their own.

### 6. Switch it on for the team

```bash
claude mcp add habitat -- npx -y github:Owl-Listener/habitat serve design
```

Now, when anyone asks an agent to build UI, it reads the principles, looks up the right components and what the team knows about the people it's building for, checks its own code before handing it over, and says "there's no date picker in the system" instead of quietly building one.

### 7. Keep it true

A design system keeps growing, and documentation that no longer matches it is worse for an agent than none, because the agent follows it with confidence.

- **`/habitat-review`** critiques any screen, Figma frame or pull request against the team's rules, and names the rule behind every problem. Anything no rule covers comes back as a proposed new rule, so every review makes the system a little smarter.
- **`/habitat-refresh`** re-reads Figma when the library changes. It updates the facts, never touches the reasons, and hands Sam a short list of the decisions only a person can make.
- **`habitat parity`** shows where the documentation and the code disagree.
- **`habitat validate`** flags any file nobody has reviewed in six months, research that's more than a year old, and rules that still cite findings newer research has replaced.

### Or start smaller

Not ready for all of that? Fill in `design/DESIGN.md` on its own (your product, your core journeys, your principles and how forms, errors and dialogs should behave) and run a few rounds of steps 2 and 4. It's an afternoon's work, and it gets you AI output that is recognisably yours before you've documented a single component. Add component files later, for whatever keeps going wrong.

## What you end up with

```
your-project/
├── design/
│   ├── DESIGN.md          your principles, core journeys and interaction rules
│   ├── tokens.md          every token, its tier, and what it means
│   ├── components/
│   │   └── button.md      one file per component: a contract, then your notes
│   ├── research/          optional: what you know about your users
│   │   ├── insights/      one finding per file, with its evidence and confidence
│   │   └── people/        optional: the kinds of people you serve
│   └── evals/             each test run: what the AI got wrong, and what fixed it
├── AGENTS.md              the always-on rules (added to your existing file)
├── CLAUDE.md
└── .cursor/rules/habitat.mdc
```

Each component file opens with a structured contract: what it's for, when to use each variant, its states, anatomy and layout, which tokens it uses, accessibility, and the things it must never do, each with a because, and the research it rests on where there is some. Your notes go underneath, in plain prose. Have a look at the worked example in [`examples/design`](examples/design) to see a finished set.

## The commands

| Command | What it does |
| --- | --- |
| `habitat init [folder]` | Sets up a design folder (`design` by default), the skills and the always-on rules |
| `habitat validate [folder]` | Checks every file, lists open TODOs, and warns about stale files, missing tokens and broken references. Add `--strict` in CI to fail while any TODO remains |
| `habitat check <files> --design <folder>` | Checks code for hard-coded colours and sizes, invented tokens, retired components, and native elements where your system has a component, with file and line |
| `habitat parity [folder] --code <folder>` | Checks each documented component exists in code with the props it promises, and lists code components with no documentation |
| `habitat serve [folder]` | Serves your design folder to a coding agent over MCP |

Put `npx github:Owl-Listener/habitat` in front of each one. When an agent is connected through `serve`, it gets seven tools: `get_principles` (read first), `list_components`, `get_component`, `get_tokens`, `get_rules`, `get_research` for what the team knows about its users, and `check_code` for checking its own work.

## The skills and prompts

| For Claude Code | For any other AI | When |
| --- | --- | --- |
| `/habitat-extract` | [prompts 0 to 4](prompts) | Writing your system down for the first time |
| `/habitat-research` | [research.md](prompts/research.md) | When you have user research to bring in |
| `/habitat-review` | [review.md](prompts/review.md) | Whenever you want a screen critiqued against your rules |
| `/habitat-refresh` | [refresh.md](prompts/refresh.md) | When your Figma library changes |

## What habitat can't do for you

I'd rather you knew this upfront.

- **It can't tidy a messy source.** Buzz rebuilt more than 200 components and standardised hundreds of tokens before AI could use his system. habitat tells you what's wrong in Figma; [agent-ready](https://github.com/Owl-Listener/agent-ready) scores the structure and helps you fix it, but the fixing is still your work.
- **It can't make Figma and code match.** Buzz's biggest finding was that without full parity, AI confidently builds screens that look right from components that don't exist. habitat finds the mismatches. Building the missing components and retiring the stale ones is design and engineering work. Its parity check also reads code as text, so treat what it finds as things to look at, not proof something is wrong.
- **It can't supply the judgement.** The interview draws out what your team already knows. It won't invent taste you haven't formed yet, and it won't try.

Put together with agent-ready, the whole loop looks like this: fix the structure, write down the judgement, serve it to your agents, check the results, and keep it true as things change.

## What's in this repo

```
habitat/
├── templates/          the blank files that init copies into your project
├── skills/             the four Claude Code skills
├── prompts/            the same processes as copy-paste prompts, for any AI
├── schema/             what a valid component file and tokens file look like
├── bin/ and lib/       the habitat command
├── mcp-server/         serves a design folder to an agent
├── examples/
│   ├── design/         a finished design folder for an imaginary product, Ledger
│   └── code/           the Button and Input it describes, in React
├── test/               tests for the command and the MCP server
└── docs/intent-spec.md every field in the contract, why it exists, and where its answer comes from
```

## Related

- [agent-ready](https://github.com/Owl-Listener/agent-ready) scores how legible your Figma file is to an agent. Every field in a habitat contract maps to one of its checks, so the two define the same standard from two directions.
- [designer-skills](https://github.com/Owl-Listener/designer-skills) is the judgement of a design team, written down as agent skills.
- [Design System Contracts](https://github.com/southleft/ds-contracts-poc) by Southleft generates matching React and Figma libraries from machine-readable contracts. It captures structure where habitat captures judgement, and the two fit together well. Their with-and-without test is a good model for your own evals, the same model scored 100 with contracts and 69 without.

## Contributing

Fork it, break it, make it better. Run `npm install` and then `npm test` before you open a pull request.

If you try habitat on your own design system, I'd love to hear what your before and after looked like. That's the real test of whether any of this works, so go and run your baseline, then [open an issue](https://github.com/Owl-Listener/habitat/issues) and tell me what you find.

## Licence

MIT.

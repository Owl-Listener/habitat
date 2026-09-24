---
name: habitat-research
description: Turn a team's user research into habitat insight files (research/insights/*.md, and optionally research/people/*.md) that AI agents can reason from, and link each insight to the design rules it supports. Works from research in any form - reports, interview notes, a research repository export, survey results, analytics summaries, support tickets, decks - distilling findings, rating confidence honestly, stripping personal data, and having a researcher confirm every insight. Use when someone wants to add user research, insights, personas or evidence to their design system, ground design rules in research, or runs /habitat-research.
---

# habitat-research

You are helping a team bring what they know about their users into their design system, so that AI agents design for real people rather than imagined ones.

Rules tell an agent what to do in the cases someone foresaw. Insights tell it why, and that is what lets it make good choices in cases nobody wrote a rule for. Your job is to distil the team's research into short, honest findings, link each one to the rules it supports, and have a researcher confirm every one.

## The rules that matter most

1. **Distil, never copy.** An insight is one or two plain sentences about people and what they do. Never paste transcripts, recordings, survey responses or raw notes into the files. They are committed to a repository and read by AI tools.
2. **Protect participants.** No names, emails, phone numbers, company names, or anything that could identify a person. Quotes are optional; if you keep one, anonymise it and keep it short. Link to the source instead of reproducing it. If the material you are given contains personal data, say so, and do not carry any of it into the files.
3. **Be honest about confidence.** `strong` means consistent across studies, or a well-run study with a clear pattern. `emerging` means seen, but in few people or one study. `hunch` means the team believes it but has not tested it. When unsure, go lower. Agents weigh insights by this, and a hunch dressed up as strong will mislead them with confidence.
4. **Findings about people, not interfaces.** "Owners abandon tasks that feel risky with money" is an insight. "Use undo instead of confirmation" is an implication. Keep them apart: the insight goes in `insight`, what it means for design goes in `implications`.
5. **Never invent a finding.** Every insight must trace to something in the material you were given. Your drafts are proposals, written as `TODO confirm:` until a researcher approves them.

## The files

```
design/research/
├── insights/
│   ├── _TEMPLATE.md
│   └── INS-001.md       one finding per file, cited by id
└── people/              optional
    ├── _TEMPLATE.md
    └── sole-trader.md   a kind of person the product serves, grounded in insights
```

If the folders do not exist, ask whether to run `npx github:Owl-Listener/habitat init` (it adds the templates without touching existing files), or create them following https://github.com/Owl-Listener/habitat/tree/main/templates. Read the templates and follow their field names exactly.

## Step 1: Gather what they have

Ask what research exists and where, and take it in whatever form it comes: pasted text, files, exports, links you can read, a deck, a summary from memory. Research can live anywhere. Also ask:

- Who did the research, and who can confirm the insights? (becomes `owner`)
- Which core journeys from `DESIGN.md` does it cover? If `DESIGN.md` has none yet, ask for the two or three that matter most.
- Does the team keep descriptions of the kinds of people it serves? If yes, you will write `research/people/` files too. If not, skip them; insights work on their own.

## Step 2: Draft the insights

Read the material and propose findings. For each one:

- `insight`: the finding in one or two sentences, in plain words.
- `confidence`: your honest rating, with a one-line reason in the notes.
- `evidence`: the study or source, method, number of participants, date, and a link to where it lives. Several studies can support one insight.
- `journeys` and `people`: what it applies to.
- `implications`: what it means for design, in plain words.
- Give each a new id: `INS-` and the next free number.

Write each draft with `status: draft`, the `insight` itself as `TODO confirm: <your wording>`, and show the researcher a short list: the insight, its confidence, and its evidence. Merge findings that say the same thing; split findings that say two things.

Watch for contradictions between studies. Do not quietly pick one. Write both, note the conflict in each file, and ask the researcher which holds, or whether it depends on who or when.

## Step 3: Confirm with a researcher

Go through the drafts a few at a time. For each, ask whether the wording is right, whether the confidence is right, and whether anything important is missing. Remove `TODO confirm:` only when they agree. A file becomes `status: reviewed` (with `lastReviewed`) only when they say so; never set it yourself.

## Step 4: Link insights to rules

This is where research starts shaping what agents build. Read `DESIGN.md` and the component files, and for each rule look for the insights behind it:

- Component rules: add `evidence: [INS-003]` to the anti-pattern or variant it supports.
- Principles and interaction rules in `DESIGN.md`: add the id in brackets after the reason, e.g. "(INS-001)".

Then look the other way:

- **Rules with no evidence:** list them for the designer. Some are fine as craft judgement; others are assumptions worth testing.
- **Insights with no rule:** these are the most valuable finds. Propose the rule each one implies, as `TODO confirm: never … because …`, and ask the designer whether to adopt it.
- **Rules that contradict an insight:** flag them plainly. The research may be right, or the rule may encode something the research missed; the team decides.

## Step 5: People (optional)

If the team keeps descriptions of who it serves, write one `research/people/` file per group: their situation, goals, constraints, state of mind and common access needs, each grounded in the insights listed in `evidence`. Describe situations, not invented biographies: "a sole trader doing the books at the end of the day", not a made-up name and photo. Set `people` on the insights to these ids.

## Step 6: Check and hand over

1. Run `npx github:Owl-Listener/habitat validate design`. It checks every insight, warns when a rule cites an insight that does not exist, is retired, or is only a hunch, flags research not reviewed in a year, and warns if a research file seems to contain an email address or phone number.
2. Tell the team how many insights there are, how many rules now cite evidence, and which rules rest only on hunches or on nothing.
3. Suggest re-running an eval (see `design/evals/`). The same prompt, now with research available through the `get_research` tool, often changes what an agent does in exactly the cases no rule covers.
4. Remind them research ages: when a new study replaces a finding, mark the old insight `retired` with `supersededBy`, and the validator will point at every rule that still cites it.

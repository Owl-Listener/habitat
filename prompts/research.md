# Add your user research

Use any time you have research to bring in: reports, interview notes, a research repository export, survey results, analytics summaries, support tickets, a synthesis deck. Paste this, then attach `templates/insight.md`, your `DESIGN.md` and component files, and the research itself.

**Before you paste research into any AI tool,** remove names, emails, phone numbers and anything else that identifies a participant, and check your organisation allows it.

---

I want to bring our user research into our design system, so AI agents design for our real users. Please turn it into insight files in the exact format of the attached `insight.md` template.

Rules:
- **Distil, never copy.** Each insight is one or two plain sentences about people and what they do. No transcripts or raw notes.
- **No personal data.** No names, emails, companies or anything identifying. Quotes are optional, short and anonymised. Link to the source instead of reproducing it. If my material contains personal data, tell me and leave it out.
- **Honest confidence.** `strong` (consistent across studies, or a well-run study with a clear pattern), `emerging` (few people, or one study) or `hunch` (believed but untested). When unsure, go lower.
- **Keep findings and implications apart.** The finding goes in `insight`; what it means for design goes in `implications`.
- **Never invent a finding.** Everything must trace to what I gave you. Write each insight as `TODO confirm: <wording>` until I approve it.

Steps:
1. Propose the insights as a short list (insight, confidence, evidence), with ids INS-001, INS-002 and so on. Merge duplicates. If two studies contradict each other, show me both rather than picking one.
2. Go through them with me a few at a time, and fix the wording and confidence until I agree.
3. Then link them to my rules. For each anti-pattern or variant in my component files that an insight supports, add `evidence: [INS-…]`. For principles in `DESIGN.md`, add the id in brackets after the reason.
4. Show me three lists: rules with no evidence, insights with no rule (propose the rule each implies, as `TODO confirm: never … because …`), and any rule that contradicts an insight.
5. Give me the complete insight files and the updated rule files.

If we keep descriptions of the kinds of people we serve, also write a `research/people/` file for each (attach `templates/person.md`), describing their situation rather than an invented persona, and grounded in the insight ids.

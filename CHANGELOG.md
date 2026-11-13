# Changelog

What changed in each version of habitat, newest first. Versions follow the
npm package, [@owl-listener/habitat](https://www.npmjs.com/package/@owl-listener/habitat).

## Unreleased

- **Releases are staged.** A GitHub release now stages the new version on npm, and it goes live only when a maintainer approves it on npmjs.com. Publishing uses npm's trusted publishing, so there's no token to store or renew.

## 0.5.0 (2026-11-12)

- **A fairer eval.** `habitat eval` now runs three conditions instead of two. Alongside the baseline (nothing at all) and habitat (the whole design folder) there's **facts only**: your tokens and components, without any of the reasons. A baseline that never saw your tokens can't use them, so part of its count was guaranteed. The report now leads with facts only against habitat, which is what writing down your judgement adds. `--only` takes a list, e.g. `--only facts,habitat`.
- **eval says when there's no API key**, before it sends anything, instead of failing six times with an error from the SDK. If a key is rejected, it stops at the first request.
- **The ESLint plugin works on its own** for `.js` and `.jsx` files. The README now says plainly that TypeScript needs a parser first (with an example), and that CSS still needs `habitat check`.
- `habitat connect` is in the README's command table.
- Dependencies updated: zod 4 and the latest MCP SDK. `npm audit` reports no vulnerabilities in what ships.

## 0.4.0 (2026-11-09)

- **Works with any agent.** `init` writes the always-on rules to `AGENTS.md` and to each agent's own file (`CLAUDE.md`, `.cursor/rules/`, `.github/copilot-instructions.md`, `GEMINI.md`), and installs the skills in `.claude/skills/` and the shared `.agents/skills/`. `--agents` keeps it to the tools a team uses.
- **`habitat connect`** shows how to connect the MCP server to Claude Code, Codex, Cursor, Copilot, Gemini CLI and Windsurf, and `--write` adds it to the project's settings.
- A ten-minute way to try habitat in any AI chat, with nothing installed, and a no-terminal path through the prompts.

## 0.3.0 (2026-11-07)

The first version on npm.

- **Journeys:** `flows/` files read from the Figma prototype's connections, with the conditions and unhappy paths a prototype doesn't show.
- **Figma styles**, alongside variables.
- **`habitat tokens import` and `export`**, in the W3C design tokens format.
- **`habitat export`** writes a DESIGN.md in Google's open format.
- **`habitat eval`** runs the baseline test for you.
- **`habitat check`** suggests fixes, applies the safe ones with `--fix`, keeps to changed lines with `--changed-since`, and annotates pull requests. A GitHub Action and an ESLint plugin run it for you.
- **`habitat parity`** reads component code properly, in both directions.

## 0.2.0

habitat became a kit for your own design system rather than a reference one: templates, the extraction skills and prompts, the validator, the code check, parity and the MCP server, with research as an optional layer.

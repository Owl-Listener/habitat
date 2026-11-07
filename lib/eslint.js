/**
 * habitat as an ESLint plugin, so the design system's checks show up in the
 * editor while someone (or an agent) types, and in the linting a project
 * already runs in CI, without anyone remembering to run `habitat check`.
 *
 * In eslint.config.js:
 *
 *   import habitat from "@owl-listener/habitat/eslint";
 *
 *   export default [
 *     habitat.configs.recommended,                 // reads ./design
 *     // or, with your own folder:
 *     // { plugins: { habitat }, rules: { "habitat/design-system": ["warn", { design: "src/design" }] } },
 *   ];
 *
 * It runs the same rules as `habitat check` (raw colours and sizes, unknown
 * tokens, native elements, deprecated components), and `eslint --fix`
 * applies the same fixes: only where exactly one token fits.
 */

import { readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { loadDesign } from "./habitat.js";
import { checkCode } from "./check.js";

const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

// Reading the design folder for every file would be slow, so keep it, and
// read it again only when tokens.md or a component file has changed.
const cache = new Map();
function designFor(dir) {
  const stamp = (() => {
    try {
      return statSync(join(dir, "tokens.md")).mtimeMs + statSync(join(dir, "components")).mtimeMs;
    } catch {
      return 0;
    }
  })();
  const hit = cache.get(dir);
  if (hit && hit.stamp === stamp) return hit.design;
  const design = loadDesign(dir);
  cache.set(dir, { stamp, design });
  return design;
}

const designSystem = {
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: { description: "Use the design system's tokens and components instead of raw values and native elements." },
    schema: [
      {
        type: "object",
        properties: { design: { type: "string", description: "The habitat design folder, relative to where ESLint runs." } },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const dir = resolve(context.cwd ?? process.cwd(), context.options[0]?.design ?? "design");
    const source = context.sourceCode ?? context.getSourceCode();
    const design = designFor(dir);
    if (!design.tokens && !design.components.length) return {};
    return {
      "Program:exit"() {
        const findings = checkCode(design, [{ path: resolve(context.filename ?? context.getFilename()), text: source.text }]);
        for (const f of findings) {
          context.report({
            loc: { line: f.line, column: f.column },
            message: `${f.message} (${f.rule})`,
            ...(f.fix && {
              fix: (fixer) => {
                const start = source.getIndexFromLoc({ line: f.line, column: f.fix.column });
                return fixer.replaceTextRange([start, start + f.fix.length], f.fix.replacement);
              },
            }),
          });
        }
      },
    };
  },
};

const plugin = {
  meta: { name: "@owl-listener/habitat", version },
  rules: { "design-system": designSystem },
  configs: {},
};
plugin.configs.recommended = {
  name: "habitat/recommended",
  files: ["**/*.{js,jsx,ts,tsx,mjs}"],
  plugins: { habitat: plugin },
  rules: { "habitat/design-system": "warn" },
};

export default plugin;

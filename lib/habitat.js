/**
 * Reads a habitat design folder from disk.
 *
 * A design folder looks like this:
 *
 *   design/
 *   ├── DESIGN.md             product-wide principles, plain Markdown
 *   ├── tokens.md             YAML front matter (the tokens) + prose
 *   └── components/
 *       └── button.md         YAML front matter (the contract) + prose
 *
 * "Front matter" is the block between the two `---` lines at the top of a
 * Markdown file. gray-matter splits a file into that structured part (`data`)
 * and the prose underneath (`body`). The structured part is what we validate
 * and hand to agents as facts; the prose is where the reasoning lives.
 *
 * Both the validator and the MCP server call loadDesign(), so they always
 * agree on what the design system says.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import matter from "gray-matter";

// YAML reads `2026-09-20` as a Date object. Turn dates back into plain
// "YYYY-MM-DD" text so the schema, the validator and agents all see the same thing.
function plainDates(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.map(plainDates);
  if (value && typeof value === "object")
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, plainDates(v)]));
  return value;
}

function readMarkdown(path) {
  const { data, content } = matter(readFileSync(path, "utf8"));
  return { path, data: plainDates(data), body: content.trim() };
}

export function loadDesign(dir) {
  const root = resolve(dir);
  const design = { root, principles: null, tokens: null, components: [], errors: [] };

  if (!existsSync(root)) {
    design.errors.push({ path: root, message: "folder not found" });
    return design;
  }

  const principlesPath = join(root, "DESIGN.md");
  if (existsSync(principlesPath)) design.principles = readMarkdown(principlesPath);

  const tokensPath = join(root, "tokens.md");
  if (existsSync(tokensPath)) {
    try {
      design.tokens = readMarkdown(tokensPath);
    } catch (err) {
      design.errors.push({ path: tokensPath, message: `could not parse: ${err.message}` });
    }
  }

  const componentsDir = join(root, "components");
  if (existsSync(componentsDir)) {
    for (const file of readdirSync(componentsDir).sort()) {
      // Files starting with "_" (like _TEMPLATE.md) are scaffolding, not components.
      if (!file.endsWith(".md") || file.startsWith("_") || file.toLowerCase() === "readme.md") continue;
      const path = join(componentsDir, file);
      try {
        design.components.push(readMarkdown(path));
      } catch (err) {
        design.errors.push({ path, message: `could not parse: ${err.message}` });
      }
    }
  }

  return design;
}

/** Find a component by its canonical name or any alias, ignoring case. */
export function findComponent(design, name) {
  const wanted = name.toLowerCase();
  return design.components.find(({ data }) =>
    data?.name?.canonical?.toLowerCase() === wanted ||
    (data?.name?.aliases || []).some((a) => a.toLowerCase() === wanted)
  );
}

/**
 * Collect every unfinished answer. A TODO is any string that starts with
 * "TODO", in the front matter or as a line in the prose. These are the
 * questions the AI could not answer from Figma and still needs a person for.
 */
export function findTodos(file) {
  const todos = [];
  const walk = (value, at) => {
    if (typeof value === "string" && /^\s*TODO\b/i.test(value)) todos.push(`${at}: ${value.trim()}`);
    else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${at}[${i}]`));
    else if (value && typeof value === "object")
      for (const [k, v] of Object.entries(value)) walk(v, at ? `${at}.${k}` : k);
  };
  walk(file.data, "");
  // Ignore <!-- guidance comments -->, which mention TODO without being one.
  // Blank them out rather than delete them, so line numbers stay true.
  const prose = file.body.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ""));
  prose.split("\n").forEach((line, i) => {
    if (/\bTODO\b/.test(line)) todos.push(`body line ${i + 1}: ${line.trim()}`);
  });
  return todos;
}

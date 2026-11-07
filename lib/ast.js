/**
 * Reads a component's real API from its source code.
 *
 * Earlier versions of parity searched the file's text for each prop name,
 * which a comment or an unrelated variable could fool. This parses the code
 * into a syntax tree (an "AST": the structure a compiler sees) and reads:
 *
 *   - the props the component declares, from its `...Props` interface or type
 *   - the props it takes, from the destructured first argument
 *   - each prop's allowed values, when its type is a union of strings
 *     ('primary' | 'secondary'), followed through type aliases
 *   - default values, from `variant = "primary"` in the destructuring
 *   - whether it inherits HTML attributes (extends ButtonHTMLAttributes...),
 *     so a contract prop like `type` or `placeholder` can be accounted for
 *
 * It understands .tsx, .ts, .jsx and .js. For anything else (Vue, Svelte) it
 * returns null and parity falls back to the text search.
 */

import { parse } from "@babel/parser";
import { extname } from "node:path";

const PARSEABLE = new Set([".tsx", ".ts", ".jsx", ".js", ".mjs"]);

// HTML attributes a contract often lists, which a component that extends the
// element's attributes accepts without declaring them itself.
export const HTML_ATTRIBUTES = new Set([
  "type", "placeholder", "value", "defaultValue", "name", "disabled", "required", "readOnly",
  "autoComplete", "autoFocus", "checked", "defaultChecked", "min", "max", "step", "minLength",
  "maxLength", "pattern", "multiple", "accept", "href", "target", "rel", "download", "title",
  "role", "tabIndex", "id", "form", "rows", "cols", "inputMode", "onClick", "onChange",
  "onBlur", "onFocus", "onSubmit", "onKeyDown", "children",
]);

// Every node in the tree, depth first. Babel nodes are plain objects with a
// `type`; their children sit in ordinary properties or arrays.
function* walk(node) {
  if (!node || typeof node.type !== "string") return;
  yield node;
  for (const [key, value] of Object.entries(node)) {
    if (key === "loc" || key === "leadingComments" || key === "trailingComments") continue;
    if (Array.isArray(value)) for (const v of value) yield* walk(v);
    else if (value && typeof value.type === "string") yield* walk(value);
  }
}

const keyName = (key) => key?.name ?? key?.value;

export function readComponentApi(source, filename) {
  if (!PARSEABLE.has(extname(filename))) return null;
  let ast;
  try {
    ast = parse(source, { sourceType: "module", plugins: ["jsx", "typescript"], errorRecovery: true });
  } catch {
    return null;
  }

  // Type aliases first, so `variant?: ButtonVariant` can be followed to its values.
  const aliases = new Map();
  for (const node of walk(ast)) {
    if (node.type === "TSTypeAliasDeclaration") aliases.set(node.id.name, node.typeAnnotation);
  }
  const literals = (type, seen = new Set()) => {
    if (!type) return null;
    if (type.type === "TSLiteralType" && typeof type.literal.value === "string") return [type.literal.value];
    if (type.type === "TSUnionType") {
      const parts = type.types.map((t) => literals(t, seen));
      return parts.every(Boolean) ? parts.flat() : null;
    }
    if (type.type === "TSTypeReference" && type.typeName?.name && !seen.has(type.typeName.name)) {
      seen.add(type.typeName.name);
      return literals(aliases.get(type.typeName.name), seen);
    }
    return null;
  };

  const props = new Map(); // name -> { options?: string[], default?: string|number|boolean }
  const add = (name, info = {}) => props.set(name, { ...props.get(name), ...info });
  let inheritsHtml = false;
  const mentionsHtml = (node) => [...walk(node)].some((n) => n.type === "Identifier" && /HTMLAttributes$/.test(n.name));

  // 1. Declared props: interface FooProps { ... } or type FooProps = { ... } & ...
  for (const node of walk(ast)) {
    let members = null;
    if (node.type === "TSInterfaceDeclaration" && /Props$/.test(node.id.name)) {
      members = node.body.body;
      if ((node.extends || []).some(mentionsHtml)) inheritsHtml = true;
    } else if (node.type === "TSTypeAliasDeclaration" && /Props$/.test(node.id.name)) {
      if (mentionsHtml(node.typeAnnotation)) inheritsHtml = true;
      members = [...walk(node.typeAnnotation)].filter((n) => n.type === "TSTypeLiteral").flatMap((n) => n.members);
    }
    for (const m of members || []) {
      if (m.type !== "TSPropertySignature") continue;
      const options = literals(m.typeAnnotation?.typeAnnotation);
      add(keyName(m.key), options ? { options } : {});
    }
  }

  // 2. Taken props: the destructured first argument of a component function,
  //    including ones wrapped in forwardRef() or memo().
  //    Only capitalised names count, which is how React tells components
  //    from helpers, so a small helper's arguments are never read as props.
  const isFunction = (n) => ["ArrowFunctionExpression", "FunctionExpression", "FunctionDeclaration"].includes(n?.type);
  const unwrap = (n) => (n?.type === "CallExpression" ? unwrap(n.arguments[0]) : n); // forwardRef(memo(fn))
  const components = [];
  for (const node of walk(ast)) {
    if (node.type === "FunctionDeclaration" && /^[A-Z]/.test(node.id?.name || "")) components.push(node);
    if (node.type === "VariableDeclarator" && /^[A-Z]/.test(node.id?.name || "") && isFunction(unwrap(node.init))) {
      components.push(unwrap(node.init));
    }
  }
  for (const fn of components) {
    const param = fn.params[0];
    if (param?.type !== "ObjectPattern") continue;
    for (const p of param.properties) {
      if (p.type !== "ObjectProperty") continue;
      const name = keyName(p.key);
      const fallback = p.value?.type === "AssignmentPattern" ? p.value.right : null;
      const value = fallback && "value" in fallback ? fallback.value : undefined;
      add(name, value !== undefined ? { default: value } : {});
    }
  }

  return props.size ? { props, inheritsHtml } : null;
}

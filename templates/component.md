---
# One file per component, named after it: components/button.md
#
# The block between the --- lines is the contract. It is structured so an
# agent can rely on it and the validator can check it. Much of it can be read
# from Figma (name, props, variants, states, tokens). The rest (purpose, when
# to use each variant, anti-patterns) has to come from the people who designed
# it. Leave TODO where you do not know yet; never guess.
#
# Set status to "reviewed" once a person has checked every field.
kind: component
status: draft
figma:
  url: TODO link to the component in Figma
  nodeId: TODO

name:
  canonical: TODO the one true name, e.g. Button
  aliases: []                # other names people use: CTA, btn

purpose: TODO what job it does, by purpose not appearance. "Lets a user commit to an action", not "a rounded rectangle".

props:                        # from Figma component properties
  - name: TODO
    type: TODO               # e.g. boolean, string, 'primary' | 'secondary'
    required: false
    description: TODO

variants:                     # from Figma; whenToUse comes from you
  - name: TODO
    whenToUse: TODO the decision rule for picking this variant

states:                       # default, hover, focus, active, disabled, loading, error...
  - name: default
    description: TODO

tokens:                       # visual property -> token name from tokens.md
  background: TODO

relationships:
  belongsIn: []               # where it lives: Form, Toolbar, Dialog
  contains: []                # what goes inside it
  pairsWith: []               # what it is usually next to

antiPatterns:                 # the heart of it: what must never happen, and why
  - never: TODO the forbidden move
    because: TODO the reason, so the rule survives paraphrase

accessibility:
  role: TODO
  keyboard: []
  focus: TODO
  aria: []
  contrast: TODO

content:
  examples:                   # real labels and copy from your product, never lorem ipsum
    - TODO

# codeConnect:                # optional: where this lives in code
#   implementation: "@your-org/ui/Button"
#   propMap: { variant: variant }
---

# TODO Component name

<!--
Notes for humans and agents that do not fit the fields above: history,
edge cases, the story behind an anti-pattern, links to research.
-->

---
# One file per component, named after it: components/button.md
#
# The block between the --- lines is the contract. It is structured so an
# agent can rely on it and the validator can check it. Much of it can be read
# from Figma (name, props, variants, states, anatomy, tokens). The rest
# (purpose, when to use each variant, anti-patterns) has to come from the
# people who designed it. Leave TODO where you do not know yet; never guess.
#
# status: draft while being filled in; reviewed once a person has checked
# every field (add lastReviewed then); deprecated when retiring it (add
# replacedBy, so agents know what to use instead).
kind: component
status: draft
owner: TODO who approves changes to this component
# lastReviewed: 2026-01-31     # add when a person has checked it
# replacedBy: NewComponent     # only when deprecated
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
    figma:
      property: TODO         # the property name in Figma, e.g. Type
      kind: VARIANT          # VARIANT, BOOLEAN, TEXT or INSTANCE_SWAP

variants:                     # from Figma; whenToUse comes from you
  - name: TODO
    whenToUse: TODO the decision rule for picking this variant

states:                       # default, hover, focus, active, disabled, loading, error...
  - name: default
    description: TODO

anatomy:                      # from the Figma layers and auto layout
  parts:
    - name: TODO             # e.g. label, leadingIcon, spinner
      description: TODO
      required: true
      # visibleWhen: loading is true
  layout:
    direction: row           # row or column
    align: TODO              # e.g. center
    gap: TODO                # a token name, e.g. space.sm
    padding: TODO            # token names, e.g. space.md space.lg
    width: TODO              # hug, fill, or a constraint

tokens:                       # visual property -> semantic token name from tokens.md
  background: TODO

relationships:
  belongsIn: []               # where it lives: Form, Toolbar, Dialog
  contains: []                # what goes inside it
  pairsWith: []               # what it is usually next to

antiPatterns:                 # the heart of it: what must never happen, and why
  - never: TODO the forbidden move
    because: TODO the reason, so the rule survives paraphrase
    source: TODO who said so, and when

accessibility:
  role: TODO
  keyboard: []
  focus: TODO
  aria: []
  contrast: TODO

content:
  examples:                   # real labels and copy from your product, never lorem ipsum
    - TODO

# codeConnect:                # where this lives in code; agents need Figma and code to match
#   implementation: "@your-org/ui/Button"
#   propMap: { variant: variant }
---

# TODO Component name

<!--
Notes for humans and agents that do not fit the fields above: history,
edge cases, the story behind an anti-pattern, links to research.
-->

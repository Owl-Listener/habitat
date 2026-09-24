---
# Your design tokens, with what each one MEANS.
#
# The AI fills in name, value, tier and aliasOf from your Figma variables.
# You fill in meaning, useFor and avoid, because a hex code cannot say when
# to use it. Any answer still starting with TODO is a question left for you.
#
# Tiers:
#   primitive  a raw palette value with no meaning of its own (color.teal.600)
#   semantic   a role, which is what components bind to (color.brand.default)
#   component  a value for one component only (button.primary.background)
# Only semantic and component tokens need useFor and avoid.
#
# Set status to "reviewed" (and add lastReviewed) once a person has checked
# every token. Mark a retired token with replacedBy.
kind: tokens
status: draft
owner: TODO who approves changes to the tokens
figma:
  url: TODO paste your Figma file link
  collections: []
tokens:
  - name: color.teal.600
    tier: primitive
    value: "TODO"
    meaning: TODO e.g. teal, step 600 of the palette
  - name: color.brand.default
    tier: semantic
    aliasOf: color.teal.600
    meaning: TODO what this colour is for, in one sentence
    useFor: TODO where to reach for it
    avoid: TODO where it must not go, and why
---

# Tokens

<!--
Anything about tokens that does not fit a single token: how the naming works,
how modes (light/dark, brand themes) are organised, and which tokens are
deprecated and what replaced them.
-->

TODO: How your tokens are named and organised.

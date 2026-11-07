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
# Libraries that still use Figma styles (colour, text and effect styles)
# can list them here too: give the token a figma.style and figma.styleType.
# A text or shadow style has an object as its value (see the example below).
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
  # A Figma text style. Delete this if your library has none.
  - name: type.style.heading
    tier: semantic
    type: typography
    value:
      fontFamily: TODO
      fontSize: TODO
      fontWeight: TODO
      lineHeight: TODO
    figma:
      style: TODO e.g. Heading/Medium
      styleType: TEXT
    meaning: TODO what this style is for
---

# Tokens

<!--
Anything about tokens that does not fit a single token: how the naming works,
how modes (light/dark, brand themes) are organised, and which tokens are
deprecated and what replaced them.
-->

TODO: How your tokens are named and organised.

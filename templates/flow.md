---
# How one core journey moves from screen to screen.
#
# The AI reads the screens and transitions from your Figma prototype's
# connections. You fill in the purpose, the conditions, the unhappy paths
# and the rules, because a prototype usually shows only the path where
# everything goes right. Any answer still starting with TODO is a question
# left for you. Copy this file once per core journey, e.g. send-invoice.md.
kind: flow
status: draft
owner: TODO who answers questions about this journey
name: TODO e.g. Send an invoice
journey: TODO the core journey in DESIGN.md, in the same words
figma:
  url: TODO the file with the prototype
  startingPoint: TODO the prototype's flow starting point
purpose: TODO what the user is trying to get done, and what counts as done
screens:
  - id: start
    name: TODO the first frame's name
    purpose: TODO what this screen is for
    components: []
  - id: done
    name: TODO the last frame's name
    purpose: TODO
    components: []
    end: true
transitions:
  - from: start
    to: done
    trigger: click
    element: TODO the layer that is clicked
    component: TODO e.g. Button
    action: navigate
    condition: TODO when is this allowed? (the prototype will not say)
unhappyPaths:
  - when: TODO e.g. saving fails
    then: TODO what the user sees, and what they can do next
antiPatterns:
  - never: TODO something an agent must never do in this journey
    because: TODO why
    source: TODO who said so, and when
---

# TODO: Journey name

<!--
Anything about the journey that does not fit above: how it connects to other
journeys, edge cases the team argues about, and what is still undecided.
-->

TODO: Notes on this journey.

---
kind: flow
status: reviewed
owner: Invoicing squad
lastReviewed: '2026-09-22'
name: Send an invoice
journey: Send an invoice
figma:
  url: 'https://www.figma.com/design/EXAMPLE/Ledger-Flows'
  page: Invoicing
  startingPoint: Send an invoice
  nodeId: '40:1'
purpose: >-
  An owner turns a customer record into a sent invoice in under two minutes. Done means the
  invoice's status reads "Sent" and the customer has it.
screens:
  - id: customer
    name: Customer record
    figma:
      nodeId: '40:1'
    purpose: Where the journey starts. Shows the customer and their past invoices.
    components:
      - Button
  - id: details
    name: Invoice details
    figma:
      nodeId: '40:22'
    purpose: 'Line items, amounts and due date, in one column.'
    components:
      - Input
      - Button
  - id: review
    name: Review and send
    figma:
      nodeId: '40:57'
    purpose: The whole invoice as the customer will see it, with the total in full.
    components:
      - Button
  - id: sent
    name: Invoice sent
    figma:
      nodeId: '40:80'
    purpose: The invoice with its status changed to "Sent", in place.
    components:
      - Button
    end: true
transitions:
  - from: customer
    to: details
    trigger: click
    element: New invoice
    component: Button
    action: navigate
  - from: details
    to: review
    trigger: click
    element: Review invoice
    component: Button
    action: navigate
    condition: 'Always enabled. Validation runs on click, and focus moves to the first field with an error if it fails.'
  - from: review
    to: details
    trigger: click
    element: Edit
    component: Button
    action: back
  - from: review
    to: sent
    trigger: click
    element: Send invoice
    component: Button
    action: navigate
    condition: Only when the customer has an email address; otherwise the review screen asks for one first.
unhappyPaths:
  - when: Sending fails (no connection, or the email bounces)
    then: >-
      A banner at the top of the review screen says what happened and offers Try again. The invoice
      stays as a draft and nothing the owner typed is lost.
    screen: review
    evidence:
      - INS-001
  - when: The owner leaves halfway through
    then: The invoice is kept as a draft and appears on the customer record with a Continue action.
    screen: details
    evidence:
      - INS-001
antiPatterns:
  - never: add a confirmation dialog before sending
    because: >-
      The review screen is the confirmation. A second "Are you sure?" makes a routine task feel
      risky, and owners abandon tasks that feel risky with money.
    source: 'Priya (product designer), 2026-09-22'
    evidence:
      - INS-001
  - never: show "Send invoice" and "Save draft" as two primary buttons on the review screen
    because: Owners stop and reread two equal actions, and some pick neither. Save draft is secondary.
    source: 'Priya (product designer), 2026-09-22'
    evidence:
      - INS-002
---

# Send an invoice

The prototype shows four screens and the happy path between them. The unhappy paths above are not in the prototype; they came from the interview with Priya, and the error banner follows the Errors and recovery rule in DESIGN.md.

The date picker gap from the evals sits on the details screen: until the system has a DatePicker, the due date is an Input with `type="date"`.

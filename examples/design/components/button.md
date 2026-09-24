---
kind: component
status: reviewed
owner: Design systems team
lastReviewed: '2026-09-20'
figma:
  url: 'https://www.figma.com/design/EXAMPLE/Ledger-Library'
  nodeId: '12:340'
name:
  canonical: Button
  aliases:
    - btn
    - CTA
    - action button
purpose: >-
  Lets a user commit to an action and make something happen immediately, such as submitting a form
  or confirming a choice. It is the most direct control in the system. For navigation to another
  place, use a Link instead.
props:
  - name: variant
    type: '''primary'' | ''secondary'' | ''ghost'''
    required: false
    default: primary
    options:
      - primary
      - secondary
      - ghost
    description: Visual emphasis of the button.
    figma:
      property: Type
      kind: VARIANT
      values:
        primary: Primary
        secondary: Secondary
        ghost: Ghost
  - name: size
    type: '''sm'' | ''md'''
    required: false
    default: md
    options:
      - sm
      - md
    description: Control size. Use sm only in dense or secondary contexts.
    figma:
      property: Size
      kind: VARIANT
      values:
        sm: Small
        md: Medium
  - name: loading
    type: boolean
    required: false
    default: false
    description: Shows a busy spinner and blocks interaction while an action is in flight.
    figma:
      property: Loading
      kind: BOOLEAN
  - name: disabled
    type: boolean
    required: false
    default: false
    description: >-
      Disables the button. Prefer hiding an action over disabling it when the user cannot know why
      it is unavailable.
    figma:
      property: Disabled
      kind: BOOLEAN
  - name: children
    type: string
    required: true
    description: 'The label. Use a verb that names the action, e.g. ''Save changes''.'
    figma:
      property: Label
      kind: TEXT
variants:
  - name: primary
    whenToUse: >-
      The single most important action in a view. There should be at most one primary button visible
      at a time.
    evidence:
      - INS-002
  - name: secondary
    whenToUse: 'A supporting action shown next to a primary one, such as Cancel beside Save.'
  - name: ghost
    whenToUse: >-
      A low-emphasis action where a bordered button would be visually heavy, such as a toolbar or a
      card footer.
states:
  - name: default
    description: Resting state.
  - name: hover
    description: Pointer over the control; background shifts to the hover token.
  - name: focus
    description: Keyboard focus; shows a visible 2px focus ring using the focus-ring token.
  - name: active
    description: Pressed; background shifts to the active token.
  - name: disabled
    description: Non-interactive; uses disabled surface and text tokens and not-allowed cursor.
  - name: loading
    description: 'Action in flight; shows a spinner, sets aria-busy, and blocks interaction.'
anatomy:
  parts:
    - name: label
      description: 'The action, as a verb phrase.'
      required: true
    - name: leadingIcon
      description: Optional icon before the label; never an icon without a label.
      required: false
    - name: spinner
      description: Busy indicator that replaces the leading icon.
      required: false
      visibleWhen: loading is true
  layout:
    direction: row
    align: center
    justify: center
    gap: space.sm
    padding: space.md space.lg
    width: hug
    minTarget: 44px
tokens:
  primary.background: color.brand.default
  primary.background.hover: color.brand.hover
  primary.background.active: color.brand.active
  primary.text: color.text.onBrand
  secondary.border: color.border.strong
  secondary.text: color.text.default
  disabled.background: color.state.disabledSurface
  disabled.text: color.state.disabledText
  focusRing: color.state.focusRing
  radius: radius.sm
  paddingMd: space.md space.lg
  paddingSm: space.sm space.md
  font: type.family
  weight: type.weight.medium
  transition: motion.fast
relationships:
  belongsIn:
    - Form
    - Toolbar
    - Card
    - Dialog
    - PageHeader
  contains:
    - text label
    - optional leading or trailing icon
  pairsWith:
    - 'Button (secondary, as Cancel)'
    - Input
    - Field
antiPatterns:
  - never: Place two primary buttons in the same view.
    because: >-
      Primary signals the single most important action. Two of them removes the hierarchy and leaves
      the user unsure which matters.
    source: 'Sam Okafor (design lead), 2026-09-20'
    evidence:
      - INS-002
      - INS-001
  - never: Use a Button to navigate to another page or URL.
    because: >-
      Navigation is a Link. Using a button breaks browser affordances like open-in-new-tab and
      confuses assistive technology about whether something will happen or somewhere will be
      visited.
    source: 'Sam Okafor (design lead), 2026-09-20'
  - never: Disable a button without making the reason discoverable.
    because: >-
      A disabled control with no explanation reads as a dead end. Either show why it is disabled or
      hide it until it is available.
    source: 'Sam Okafor (design lead), 2026-09-20'
  - never: Set raw colour or spacing values on the button.
    because: >-
      Unbound values are invisible to the design system and to an agent reading it. Always bind to a
      token.
    source: 'Sam Okafor (design lead), 2026-09-20'
accessibility:
  role: button (native <button> element)
  keyboard:
    - Enter activates
    - Space activates
  focus: >-
    Native focus order. Visible 2px focus ring on :focus-visible using the focus-ring token, offset
    by 2px.
  aria:
    - aria-busy="true" while loading
    - aria-disabled is not used; the native disabled attribute is preferred
  contrast: >-
    Primary text on brand and disabled text on disabled surface both meet WCAG AA 4.5:1 for the
    default token set.
content:
  examples:
    - Save changes
    - Add to basket
    - Send invite
    - Delete file
    - Try again
codeConnect:
  implementation: ../../code/Button.tsx
  propMap:
    variant: variant
    size: size
    loading: loading
    disabled: disabled
    children: children
---

# Button

When the surrounding context is a form submission, default to a primary Button labelled with the specific action verb, and pair it with a secondary Cancel. Never invent a destructive default; a delete action should be secondary or require confirmation.

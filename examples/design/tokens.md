---
kind: tokens
status: reviewed
owner: Design systems team
lastReviewed: '2026-09-20'
tokens:
  - name: color.teal.600
    tier: primitive
    value: '#1f6f6b'
    meaning: 'Teal, palette step 600.'
  - name: color.teal.700
    tier: primitive
    value: '#1a605c'
    meaning: 'Teal, palette step 700.'
  - name: color.teal.800
    tier: primitive
    value: '#154f4c'
    meaning: 'Teal, palette step 800.'
  - name: color.brand.default
    tier: semantic
    aliasOf: color.teal.600
    meaning: 'Primary brand colour, used for primary actions.'
    useFor: The background of the single primary action in a view.
    avoid: >-
      Large backgrounds or decoration. Brand colour signals "act here", and spending it elsewhere
      dilutes that.
  - name: color.brand.hover
    tier: semantic
    aliasOf: color.teal.700
    meaning: Primary brand colour on hover.
  - name: color.brand.active
    tier: semantic
    aliasOf: color.teal.800
    meaning: Primary brand colour when pressed.
  - name: color.surface.default
    tier: semantic
    value: '#ffffff'
    meaning: Default background surface.
  - name: color.surface.muted
    tier: semantic
    value: '#f4f6f6'
    meaning: Subtle background for secondary surfaces.
  - name: color.text.onBrand
    tier: semantic
    value: '#ffffff'
    meaning: Text on top of a brand-coloured surface.
  - name: color.text.default
    tier: semantic
    value: '#16201f'
    meaning: Default body text.
  - name: color.text.muted
    tier: semantic
    value: '#5b6b6a'
    meaning: 'Secondary, lower-emphasis text.'
    avoid: 'Anything the user must read to complete a task, such as instructions.'
  - name: color.border.default
    tier: semantic
    value: '#d4dbda'
    meaning: Default border colour.
  - name: color.border.strong
    tier: semantic
    value: '#16201f'
    meaning: 'High-contrast border, used for secondary buttons.'
  - name: color.state.disabledSurface
    tier: semantic
    value: '#e7eaea'
    meaning: Background of a disabled control.
  - name: color.state.disabledText
    tier: semantic
    value: '#9aa6a5'
    meaning: Text of a disabled control.
  - name: color.state.focusRing
    tier: semantic
    aliasOf: color.teal.600
    meaning: 'Focus ring colour, must meet 3:1 against adjacent colours.'
  - name: color.state.error
    tier: semantic
    value: '#c0392b'
    meaning: 'Error state colour for borders and messages. Meets WCAG AA 4.5:1 against white.'
    useFor: 'Error borders and error messages, always alongside text that explains the problem.'
    avoid: Destructive-but-valid actions like Delete. Red on those reads as "something went wrong".
  - name: space.xs
    tier: semantic
    value: 4px
    meaning: 'Tightest gap, between a label and its field.'
  - name: space.sm
    tier: semantic
    value: 8px
    meaning: 'Small gap, inside compact controls and between related items.'
  - name: space.md
    tier: semantic
    value: 12px
    meaning: Default padding inside controls.
  - name: space.lg
    tier: semantic
    value: 16px
    meaning: Padding for comfortable controls and gaps between groups.
  - name: space.xl
    tier: semantic
    value: 24px
    meaning: Separation between sections of a screen.
  - name: radius.sm
    tier: semantic
    value: 6px
    meaning: 'Corner radius for controls: buttons, inputs, selects.'
  - name: radius.md
    tier: semantic
    value: 10px
    meaning: 'Corner radius for containers: cards, dialogs.'
  - name: type.family
    tier: semantic
    value: 'system-ui, sans-serif'
    meaning: Body and UI font. Re-theme to your own.
  - name: type.size.sm
    tier: semantic
    value: 14px
    meaning: 'Small text: labels, helper and error messages, dense controls.'
  - name: type.size.md
    tier: semantic
    value: 16px
    meaning: Default text size for body copy and controls.
  - name: type.weight.regular
    tier: semantic
    value: '400'
    meaning: Body text weight.
  - name: type.weight.medium
    tier: semantic
    value: '550'
    meaning: Emphasis weight for labels and button text.
    avoid: 'Long passages of body text, where it tires the eye.'
  - name: motion.fast
    tier: semantic
    value: 120ms
    meaning: Duration for state transitions like hover.
---

# Tokens

Names follow `category.role.variant`, e.g. `color.brand.hover`. Components bind to the role, never to a raw value, so re-theming means changing a value here and nowhere else. `../code/tokens.css` holds the same values as CSS variables, with dots and camelCase turned into dashes (`color.text.onBrand` becomes `--color-text-on-brand`).

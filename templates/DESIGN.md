---
# DESIGN.md — follows the open spec at:
# https://github.com/google-labs-code/design.md/blob/main/docs/spec.md
#
# Validate with: npx @google/design.md validate DESIGN.md
# Generate from Figma: https://github.com/bergside/design-md-figma
#
# Sections marked <!-- PROJECT-SPECIFIC --> must be authored per project.
# Sections marked <!-- CROSS-PROJECT --> carry reusable guidance — customize
# values but keep the structure.

# NOTE: "Tokens" in this file refers to *design tokens* — named values for
# colors, spacing, typography, and other visual properties. This is standard
# design systems terminology (see https://tr.designtokens.org/format/), not
# related to LLM/AI tokens.

name: "Project Name"

# <!-- PROJECT-SPECIFIC: replace with your project's color tokens -->
# Use semantic role names, not raw color names (e.g., "primary" not "blue").
# Follow Material Design 3 naming conventions for maximum tooling compatibility.
# See: https://m3.material.io/styles/color/roles
colors:
  # --- Surface / Background ---
  surface: "#ffffff"
  on-surface: "#1a1a1a"
  surface-container: "#f4f4f4"
  surface-container-low: "#fafafa"

  # --- Primary ---
  primary: "#0066cc"
  on-primary: "#ffffff"
  primary-container: "#d6e4ff"
  on-primary-container: "#001a40"

  # --- Secondary ---
  secondary: "#5c5c5c"
  on-secondary: "#ffffff"
  secondary-container: "#e0e0e0"
  on-secondary-container: "#1a1a1a"

  # --- Semantic ---
  positive: "#16a34a"
  on-positive: "#ffffff"
  negative: "#dc2626"
  on-negative: "#ffffff"
  warning: "#d97706"
  on-warning: "#ffffff"

  # --- Outline / Borders ---
  outline: "#cccccc"
  outline-variant: "#e5e5e5"

# <!-- PROJECT-SPECIFIC: replace with your project's type scale -->
# Use semantic level names. Recommended hierarchy (adapt to your needs):
#   display > headline > title > body > label > caption
typography:
  display:
    fontFamily: "Inter"
    fontSize: 44px
    fontWeight: "800"
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: "Inter"
    fontSize: 32px
    fontWeight: "700"
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: "Inter"
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 32px
  title-lg:
    fontFamily: "Inter"
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 28px
  body-lg:
    fontFamily: "Inter"
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 28px
  body-md:
    fontFamily: "Inter"
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  label-md:
    fontFamily: "Inter"
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px
    letterSpacing: 0.01em
  caption:
    fontFamily: "Inter"
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 16px

# <!-- CROSS-PROJECT: adjust values but keep the scale structure -->
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px

# <!-- CROSS-PROJECT: adjust values but keep the scale structure -->
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 16px
  margin: 24px

# <!-- PROJECT-SPECIFIC: define your project's component token mappings -->
# Reference tokens from the groups above using {group.token} syntax.
# Model interactive states as separate entries (e.g., button-primary-hover).
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.md}"
  input-field:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.DEFAULT}"
    padding: "{spacing.sm}"
---

<!-- PROJECT-SPECIFIC: replace this entire section with your project's brand
     personality, target audience, and emotional tone. Include a brief ICP
     framing (2-3 sentences about who the product serves and their mental
     model) to anchor design decisions. -->

## Brand & Style

[Project Name] is designed for [target audience]. The visual language is
[describe the emotional tone: e.g., "clean and professional with moments of
warmth" or "dense and data-rich with high information density"].

**Design principles:**

- [Principle 1 — e.g., "Scannable in 3 seconds: primary data → supporting context → action"]
- [Principle 2 — e.g., "No color without a reason: every color carries semantic meaning"]
- [Principle 3 — e.g., "Structural consistency: same layout skeleton across sibling views"]

<!-- PROJECT-SPECIFIC -->

## Colors

The palette uses semantic role naming. Colors communicate meaning, not
decoration:

- **Primary** — brand identity, primary actions, key interactive elements
- **Surface** — backgrounds and containers at different elevation levels
- **Positive / Negative** — directional feedback (gain/loss, success/error)
- **Outline** — borders and separators

Use the fewest colors needed. Each color carries semantic meaning — decorative
color adds noise.

Both light and dark modes must convey the same information with the same
hierarchy. Elements that work in one mode but disappear or clash in the other
are bugs.

<!-- PROJECT-SPECIFIC -->

## Typography

The type scale uses [number] levels. Hierarchy is established through size.
Differentiation within a level is achieved through weight (Bold = primary data,
Regular = supporting data) and color (Primary = main value, Secondary = label,
Semantic = directional indicator).

**Rules:**

- Never introduce intermediate sizes outside the defined scale
- Same-level items differentiate through weight and color, not size
- All text nodes must reference a token — never hardcode size/weight
- Components that serve the same role must use the same text style

<!-- PROJECT-SPECIFIC -->

## Layout & Spacing

Spacing follows a consistent base unit scale. Consistent spacing rhythm
creates visual grouping; uneven spacing breaks perceived structure.

The spec supports `px`, `em`, and `rem` units for dimensions — choose based
on your project's needs (px for fixed layouts, rem for responsive scaling).
The values in the YAML frontmatter above are placeholders; adjust them to
match your project's spacing system.

- **Base unit:** [your base unit, e.g., 8px or 0.5rem]
- **Micro adjustments:** [half the base unit, for tight inline spacing]
- **Section padding:** Use the `md` or `lg` spacing tokens
- **Row/item gaps:** Use `sm` or `base` spacing tokens

Every element should align to at least one other element. Stray elements that
don't share edges or baselines with neighbors look accidental.

<!-- CROSS-PROJECT -->

## Elevation & Depth

[Describe how visual hierarchy is achieved in this project: shadows, tonal
surface layers, borders, blur, or a combination. If the project uses a flat
design with no elevation, state that explicitly.]

<!-- PROJECT-SPECIFIC -->

## Shapes

Corner radii follow a semantic scale:

- **sm** (0.25rem) — subtle rounding for inline elements, badges
- **DEFAULT** (0.5rem) — standard interactive elements, inputs
- **lg** (1rem) — buttons, prominent interactive elements
- **xl** (1.5rem) — cards, containers
- **full** (9999px) — pills, avatars, circular elements

[Adjust the scale and mapping to match your project's visual language.]

<!-- CROSS-PROJECT -->

## Components

[Document component-specific styling guidance here. Use sub-headings for
component categories. Focus on design token usage, interactive states, and
structural patterns — not implementation details.]

### Buttons

- Primary action is the most visually distinct element after the title
- Use consistent styling for the primary CTA across all views

### Cards

- Cards of the same type share a structural skeleton: same layout, same column
  positions, same component vocabulary
- A user who has seen one card should instantly understand another

### Data display

- Visual encodings (bar widths, chart heights) must accurately reflect data
  proportions
- When data does not fit, show what fits plus a truncation indicator — never
  clip content silently

<!-- PROJECT-SPECIFIC -->

## Do's and Don'ts

**Do:**

- Verify both light and dark modes after every visual change
- Test with varying data lengths (short names, long names, edge cases)
- Use semantic color tokens — never hardcode hex values in components
- Maintain consistent spacing rhythm using the defined scale

**Don't:**

- Add color without semantic meaning — decorative color is noise
- Mix hierarchy levels — if two elements look the same size but serve different
  roles, one is at the wrong level
- Silently clip content — always indicate when there is more to show
- Introduce spacing values outside the defined scale

<!-- PROJECT-SPECIFIC -->

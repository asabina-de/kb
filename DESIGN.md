---
# DESIGN.md — Asabina GmbH Corporate Identity
# Follows the open spec at:
# https://github.com/google-labs-code/design.md/blob/main/docs/spec.md
#
# Lint with: npx @google/design.md lint DESIGN.md
#
# This file covers the company's visual identity across all surfaces:
# app UI, presentations, print collateral. See decision record
# docs/decisions/0004-design-guide-corporate-identity.md for rationale.

name: "Asabina"

colors:
  # --- Core ---
  background-dark: "#000000"
  background-light: "#ffffff"
  surface-dark: "#141414"
  surface-light: "#f5f5f5"

  # --- Text ---
  on-dark: "#ffffff"
  on-light: "#121212"
  muted-on-dark: "#8c8c8c"
  muted-on-light: "#737373"
  label-on-dark: "#666666"
  label-on-light: "#8c8c8c"

  # --- Accent ---
  accent: "#ff5583"

  # --- Semantic ---
  positive: "#16a34a"
  negative: "#dc2626"

  # --- Outline ---
  outline-dark: "#333333"
  outline-light: "#e5e5e5"

typography:
  title:
    fontFamily: "Inter"
    fontSize: 96px
    fontWeight: "800"
    lineHeight: 120%
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: "Inter"
    fontSize: 60px
    fontWeight: "700"
    lineHeight: 120%
    letterSpacing: -0.022em
  headline-md:
    fontFamily: "Inter"
    fontSize: 48px
    fontWeight: "700"
    lineHeight: 120%
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: "Inter"
    fontSize: 36px
    fontWeight: "700"
    lineHeight: 132%
    letterSpacing: -0.02em
  body-lg:
    fontFamily: "Inter"
    fontSize: 36px
    fontWeight: "400"
    lineHeight: 140%
    letterSpacing: -0.01em
  body-md:
    fontFamily: "Inter"
    fontSize: 30px
    fontWeight: "400"
    lineHeight: 136%
    letterSpacing: -0.01em
  body-sm:
    fontFamily: "Inter"
    fontSize: 24px
    fontWeight: "400"
    lineHeight: 134%
    letterSpacing: -0.005em
  label:
    fontFamily: "Inter"
    fontSize: 20px
    fontWeight: "400"
    lineHeight: 140%
    letterSpacing: 0.3em
  note:
    fontFamily: "Inter"
    fontSize: 20px
    fontWeight: "400"
    lineHeight: 140%
  disclaimer:
    fontFamily: "Inter"
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 160%

rounded:
  sm: 2px
  DEFAULT: 4px
  lg: 8px

spacing:
  base: 8px
  xs: 4px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 60px
  section: 120px

components:
  slide-cover:
    backgroundColor: "{colors.background-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.title}"
  slide-content:
    backgroundColor: "{colors.background-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-sm}"
  slide-accent-line:
    backgroundColor: "{colors.accent}"
    height: 4px
    rounded: "{rounded.sm}"
---

## Brand & Style

Asabina is an engineering consultancy that helps companies become AI-native.
The visual language is high-contrast, minimal, and information-dense — black
backgrounds, white text, pink accents. The brand communicates technical
credibility through restraint: no decorative elements, no gradients, no
unnecessary chrome. Every visual element earns its place.

**Design principles:**

- High contrast first: black/white base, pink accent for emphasis
- Information density over decoration: every element conveys meaning
- Consistent restraint: minimal corner radii, no shadows, no gradients
- Parametric: all values are variables, switchable between dark and light modes

## Colors

The palette is built around a black/white axis with a single accent color.

- **Background** — pure black (`#000000`) for dark mode, pure white for light
- **Accent** — pink `rgb(255, 85, 131)` / `#ff5583` — the only chromatic color
  in the primary palette. Used for subtitles, secondary CTAs, and emphasis
- **Text hierarchy** — white → gray → dim gray, three levels of prominence
- **Semantic** — green for positive, red for negative (standard, not branded)

Two modes exist: **Asabina Dark** (default, black background) and **Asabina
Light** (white background). The accent pink stays constant across both modes.

## Typography

One typeface: **Inter**. Hierarchy through size and weight, never through
typeface variation.

The type scale maps to Figma Slides template styles: Title (96px), Header 1-3
(60/48/36px), Body 1-3 (36/30/24px), Note (20px), Label (20px uppercase with
letter-spacing), Disclaimer (14px).

**Rules:**

- `textCase = 'UPPER'` for labels and section markers — never hardcode
  uppercase into the text content
- `letterSpacing` for spaced-out label treatments — never add spaces between
  characters
- Same-level items differentiate through weight (Bold = primary, Regular =
  supporting) and color (Primary = main value, Muted = secondary)

## Layout & Spacing

Presentation slides use a 1920x1080 canvas with 120px left/right margins.

- **Three-column layout:** 520px columns, 60px gaps
- **Section label** at y=80, heading at y=140, content starting at y=340
- **Page number** bottom-right at (1740, 1030)
- **Pink accent line** — 80-120px wide, 4px tall, positioned below the heading
  as a signature element. Decorative, not margin-to-margin.

## Elevation & Depth

Flat design. No shadows, no elevation layers. Depth is communicated through
color contrast (foreground elements are brighter on dark, darker on light) and
thin divider lines (`#333333` on dark, `#e5e5e5` on light).

## Shapes

Minimal corner radii: 2px for small elements, 4px default, 8px for larger
containers. No large radius treatments. No rounded pills except for badges.

## Components

Slide components follow the inventory in `docs/presentation-template-inventory.md`.
The master deck is at [Asabina Master Deck](https://www.figma.com/slides/xXJMUyCLRXHmNPfwooiqK7).

### Slides

- Every slide has a section label (Label style, top-left), a heading
  (H1 or Title, below the accent line), and a page number (Note, bottom-right)
- The pink accent line appears on every slide as a signature element
- Metadata uses "ORG @ **Person**" format with bold on the person name

### Accent line

A short (80-120px) pink rectangle, 4px tall, with 2px corner radius. Positioned
below the section label, above the heading. This is the visual signature —
present on every slide, recognizable out of context.

## Do's and Don'ts

**Do:**

- Use `textCase` and `letterSpacing` for visual text transforms
- Verify both Asabina Dark and Asabina Light modes after visual changes
- Test with varying data lengths (short names, long names, edge cases)
- Use Deck Theme variables for all colors — never hardcode hex values
- Maintain consistent spacing rhythm using the defined scale

**Don't:**

- Add spaces between characters in text content — use `letterSpacing`
- Type text in uppercase — use `textCase = 'UPPER'`
- Add color without purpose — the only chromatic color is the accent pink
- Use shadows, gradients, or decorative elements
- Mix font families — Inter is the only typeface

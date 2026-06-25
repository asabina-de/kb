---
title: "DESIGN.md Spec Coverage for Corporate Identity"
tags: [design, corporate-identity, standards, brand]
status: decided
decision: "Use DESIGN.md for corporate identity visual tokens (colors, typography, spacing). Presentation design language encodes as component tokens. Watch the emerging brand.md standard for strategic brand context (voice, personality, positioning) but don't adopt it yet."
review_date: 2026-12-25
related_to: ["0003"]
supersedes: ""
---

# DESIGN.md Spec Coverage for Corporate Identity

## Status Log

| Status | Date       | Author | Related Tickets                                                  | Notes                                                          |
| :----- | :--------- | :----- | :--------------------------------------------------------------- | :------------------------------------------------------------- |
| DONE   | 2026-06-25 | claude | [KB-68](https://linear.app/asabina/issue/KB-68) | Survey completed, decision finalized via pairing |

## Context

Decision record 0003 (KB-61) adopted the [DESIGN.md open spec](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md) for repo-local design guides, scoped to app/UI design. During KB-66 (presentation template inventory), we found that presentation design language (dark backgrounds, section label styles, type hierarchy) needed a home. The question: can DESIGN.md also cover corporate identity — presentations, brand collateral, print — or does it need a separate spec?

## Exploration

### Can the DESIGN.md spec cover corporate identity?

**Yes, with targeted extensions.** The spec is [intentionally format-agnostic](https://github.com/google-labs-code/design.md/blob/main/PHILOSOPHY.md) — "the format grows through its users, not its spec." The CLI's [section-order rule](https://github.com/google-labs-code/design.md/blob/main/packages/cli/src/linter/linter/rules/section-order.ts) ignores unknown sections entirely, so custom sections (`## Logo`, `## Slide Layouts`) pass through without error. The official [totality-festival example](https://github.com/google-labs-code/design.md/blob/main/examples/totality-festival/DESIGN.md) is a festival brand identity — not an app UI — confirming the maintainers consider the format usable beyond pure UI.

**Section-by-section mapping:**

| Corporate identity need | DESIGN.md coverage | Gap |
| :--- | :--- | :--- |
| Brand colors (screen) | Native — `colors` token | None |
| Brand colors (CMYK print) | Custom key required | CMYK [rejected by color parser](https://github.com/google-labs-code/design.md/blob/main/packages/cli/src/linter/model/color-parser.ts) in `colors` block |
| Presentation/print type scales | Works — `pt` and `mm` are [parseable dimensions](https://github.com/google-labs-code/design.md/blob/main/packages/cli/src/linter/model/spec.ts) | Semantic labels are screen-convention, not enforced |
| Slide layout grids | Prose in `## Layout` section | No structured token for canvas dimensions |
| Print bleed/margins | Custom section/key | No native token concept |
| Logo usage rules | `## Do's and Don'ts` prose | No token-level enforcement |
| Slide components (title, pricing table, quote card) | `components` token — custom properties accepted with warning | No slide-specific component vocabulary |
| Brand guardrails | `## Do's and Don'ts` prose | Fully supported |

### Structured brand identity frameworks ("brand as code")

The field is nascent. Two notable projects exist:

- [**brandspec**](https://github.com/brandspec/brandspec) (MIT, TypeScript) — YAML schema CLI with six sections: meta, core (essence, tagline, personality, voice), tokens (W3C DTCG format), assets (logo variants with print context flag), guidelines (severity levels), extensions. Outputs CSS, Tailwind v4, Figma tokens, Style Dictionary.
- [**sentinels-identity**](https://github.com/sentinels-hub/sentinels-identity) (MIT, JS) — JSON Schema-validated brand system with YAML persona, voice/tone (formality scale, warmth scale, forbidden words), DTCG tokens, and AI agent personas. The most AI-native brand identity structure found.

Both have minimal adoption (0-5 stars). No production-scale usage found.

The [W3C Design Tokens Community Group (DTCG)](https://www.w3.org/community/design-tokens/) spec (stable October 2025) is explicitly digital-only: token types cover color (sRGB, Oklch, Display P3), dimension (px/rem), typography, duration, and composites. No CMYK, no slide dimensions, no brand voice.

### The emerging `brand.md` standard

Two independent initiatives propose a `brand.md` file:

- [**caiopizzol/brand.md**](https://github.com/caiopizzol/brand.md) — "the AGENTS.md for brand context." Sections: Strategy (positioning, personality, promise), Voice (identity, tagline, tonal rules), Visual (colors, typography, photography).
- [**Sameness-Design/brand.md**](https://github.com/Sameness-Design/brand.md) — three layers per element: Precision (machine-verifiable values), Semantic (mood keywords, image prompts), Relationship (governance rules, approved pairings). Explicitly positions brand.md as **upstream of design.md**: "Brand identity defines intent and constraints. Design systems execute those constraints."

Neither has significant adoption yet. The conceptual split is sound: `brand.md` = "what is this brand and how does it think, speak, and look?" vs `design.md` = "how should this product interface be built?"

### How companies handle it today

Companies consistently **separate app design systems from corporate identity**, with weak token bridges:

- [**GitHub (Primer)**](https://github.com/primer/brand) — two systems: Primer Product UI (app) and Primer Brand (marketing). Shared foundations (Mona Sans, GitHub Green), separate npm packages and governance.
- [**Aerolab/brand-kauffman-fellows**](https://github.com/Aerolab/brand-kauffman-fellows) — token-first brand system (CSS, JSON, DTCG) consumable by Claude Design and web projects. Digital-only output targets.
- **Large enterprises** (IBM, Microsoft, Atlassian) — separate brand identity and product design system teams. Token sync via manual governance, not tooling.

No tool found explicitly generates presentation templates from design tokens. [Figma Slides](https://developers.figma.com/docs/plugins/working-in-slides/) sharing the same library/variable system as Figma Design is the closest approximation.

### Alternatives considered

**A: Single DESIGN.md for both app and corporate identity**

One file covering UI components and slide/collateral design language.

- (+) Single source of truth for all visual tokens
- (+) Shared color palette and typography tokens naturally stay in sync
- (−) File becomes large and confusing — app developers don't need slide component specs
- (−) Different update cadences — app design changes frequently, brand identity rarely

**B: Separate DESIGN.md files per context**

`DESIGN.md` for app UI, a second file (e.g., `DESIGN.slides.md` or `BRAND_DESIGN.md`) for presentation/corporate identity.

- (+) Clean separation of concerns — each file serves its audience
- (+) Shared token foundations referenced via the same palette/type scale
- (−) Risk of token drift between files
- (−) No ecosystem support for multiple DESIGN.md files — tooling expects one

**C: DESIGN.md for visual tokens + brand.md for strategic brand context**

Use DESIGN.md (possibly per-context) for colors, typography, spacing, components. Adopt the emerging `brand.md` pattern for brand voice, personality, positioning.

- (+) Matches the conceptual split the `brand.md` initiatives propose
- (+) DESIGN.md stays spec-pure for visual/implementation concerns
- (+) brand.md covers what DESIGN.md can't: voice, personality, strategic positioning
- (−) brand.md is too nascent to adopt as a standard — 0-5 stars, no production usage
- (−) Another file in the stack

**D: Wait for the ecosystem to mature**

Don't adopt anything beyond DESIGN.md for now. Revisit when brand.md or similar has real adoption.

- (+) No premature commitment
- (−) Corporate identity design language has no home in the meantime

## Decision

**Use DESIGN.md for corporate identity visual tokens. Watch brand.md but don't adopt yet. (Hybrid of A and D.)**

Specifically:

1. **One DESIGN.md per project** covers both app UI and presentation visual tokens. The spec's extensibility handles this — slide components model as `components` tokens (`title-slide`, `pricing-table`, `quote-card`), presentation typography as additional entries in the `typography` token group, and corporate color semantics alongside app color semantics in the `colors` group. The `## Do's and Don'ts` section carries brand usage rules (logo clear space, forbidden combinations).

2. **Presentation-specific design language** (section label styles, page numbering conventions, slide dimensions) encodes in the DESIGN.md `## Components` section prose and as `components` tokens in the YAML frontmatter. This is the same pattern as app components — just different component names.

3. **CMYK print colors** go in a custom `cmyk_colors` YAML key (the standard `colors` key rejects CMYK). The CLI accepts unknown top-level keys without error.

4. **Don't adopt brand.md yet.** The concept is sound (brand identity upstream of design system), but the standard is too nascent (two competing specs, 0-5 stars each, no production usage). Revisit at the review date (2026-12-25) when the ecosystem has had 6 months to settle. If a project needs brand voice/personality documentation before then, use a custom `## Brand Voice` section in DESIGN.md or a freeform Markdown file — don't force a premature standard.

5. **For the KB presentation template** (KB-66/KB-67): the design language removed from the inventory document should be encoded in the Figma Slides file's own DESIGN.md once the file has one. That DESIGN.md would carry the presentation color tokens, typography scale, and slide component definitions.

## Consequences

**Positive:**

- One file covers both contexts — no token drift between separate files
- DESIGN.md remains the single design reference agents read before any design work
- Presentation components are first-class citizens alongside UI components
- No premature commitment to a nascent standard

**Negative:**

- DESIGN.md files will be longer in projects that have both app UI and presentations
- The brand voice/personality gap has no structured home until brand.md matures
- CMYK requires a non-standard YAML key — tooling won't validate those values

**Trade-offs accepted:**

- Longer files over separate files: a single source of truth is worth the extra scrolling
- No brand voice standard: prose in Do's and Don'ts or a freeform section is sufficient for now

## Confirmation

- Projects with both app and presentation design should have one DESIGN.md with both app and slide component tokens
- Presentation design language from the KB-66 inventory is encoded as DESIGN.md component tokens, not in the inventory doc
- CMYK values use a custom `cmyk_colors` YAML key, not the standard `colors` key
- Review brand.md ecosystem maturity at 2026-12-25

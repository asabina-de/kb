---
title: "Design Guide Standards for Repo-Local Guides"
tags: [design, documentation, standards, templates]
status: decided
decision: "Adopt the DESIGN.md open spec for repo-local design guides; keep it spec-pure with tooling guidance in AGENTS.md and Figma workflow patterns in a dedicated skill."
review_date: 2026-12-24
related_to: []
supersedes: ""
---

# Design Guide Standards for Repo-Local Guides

## Status Log

| Status | Date       | Author | Related Tickets                                                  | Notes                                            |
| :----- | :--------- | :----- | :--------------------------------------------------------------- | :----------------------------------------------- |
| DONE   | 2026-06-24 | claude | [KB-61](https://linear.app/asabina/issue/KB-61) | Survey completed, decisions finalized via pairing |

## Context

Our engineering projects need a consistent way to document design guidance — visual identity, color semantics, typography, layout principles, and component conventions — so that both human collaborators and AI agents can produce coherent UI without re-discovering conventions each session.

Our first design guide (`ivos-trades/DESIGN_GUIDE.md`) accumulated organically from Figma pairing sessions. It's effective but:

- Local-only (not committed to git) and project-specific
- Deeply coupled to Figma Plugin API workarounds
- Missing standard sections (accessibility, interaction states, motion, content strategy)
- No template exists in the KB for other projects to follow

The question: what should a well-structured in-repo design guide contain, and how should we standardize it across projects?

## Exploration

### Survey of existing standards

We surveyed conventions for repo-local design documentation. Key findings:

**The DESIGN.md open spec (Google Labs, April 2026)**

Google released an [open spec](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md) for `DESIGN.md` files via the Stitch project. It defines a dual-layer format:

- **YAML frontmatter** — machine-readable tokens (colors, typography scales, spacing, component mappings)
- **Markdown body** — human-readable rationale organized in mandatory section order

Prescribed sections: Overview/Brand → Colors → Typography → Layout → Elevation & Depth → Shapes → Components → Do's & Don'ts → Responsive Behavior. An optional Agent Prompt Guide section exists for tool-specific meta-instructions.

The spec has an [npm CLI](https://github.com/google-labs-code/design.md) that validates files, checks WCAG contrast ratios, and exports to Tailwind/W3C DTCG format. A [Figma plugin](https://github.com/bergside/design-md-figma) generates DESIGN.md files from Figma local styles.

The [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) collection has 73+ brand examples (Linear, Stripe, Vercel, Cal.com, etc.), indicating real adoption. The collection had a [12.6% fork rate](https://dev.to/wonderlab/one-open-source-project-a-day-no-36-awesome-design-md-making-design-specs-truly-readable-for-304d) vs ~8-9% for comparable "awesome" lists.

**Other in-repo design guide examples**

- [contribute-design/examples](https://github.com/contribute-design/examples) — pre-AI template for inviting designer contributions to open-source projects. Covers: overview, target audience, current visual state, tools, contribution workflow.
- [UNICEF design-system](https://github.com/unicef/design-system/blob/master/design-guidelines.md) — institutional example with principles explicitly shaped by non-visual constraints (network conditions, user tech savviness).
- [MetaBrainz design-system](https://github.com/metabrainz/design-system/blob/master/guidelines/design-guidelines.md) — React component library guidelines nested in a `guidelines/` directory alongside Storybook.
- [GitLab Pajamas](https://design.gitlab.com/get-started/structure/) — comprehensive open-source design system with sections for brand, foundations (tokens, color, typography, spacing, iconography), components, patterns, data visualization, content, and accessibility.

**Storybook-driven guides** complement (not replace) a repo-local file. Typical structure: intro → getting started → contribution guidelines → design tokens → changelog → components. [Storybook docs](https://storybook.js.org/blog/structuring-your-storybook/) recommend pairing with the Figma plugin for in-tool validation.

### Alternatives considered

**A: Custom `DESIGN_GUIDE.md` convention**

Define our own file name and structure, drawing from survey findings but not following any external spec.

- (+) Full control over section ordering and content
- (+) Can include tool-specific sections (Figma workflow, Plugin API workarounds)
- (−) No ecosystem compatibility — tooling, linters, generators won't recognize it
- (−) Maintenance burden of our own spec vs leveraging a community standard

**B: Adopt `DESIGN.md` spec as-is**

Follow the spec exactly. Keep the file spec-pure. Put everything else (tooling, Figma workflow, opinionated patterns) in other files.

- (+) Full ecosystem compatibility (CLI validation, Figma plugin generation, awesome-design-md examples as references)
- (+) Zero spec maintenance — the community maintains the standard
- (+) AI agents that understand DESIGN.md (growing number) can consume our files natively
- (−) The spec doesn't cover ICP/persona framing, content strategy, or tool workflow
- (−) Requires additional files/guidance for what the spec omits

**C: Extend `DESIGN.md` with custom sections**

Follow the spec for standard sections but add non-spec sections for our needs (ICP, Figma workflow, friction log).

- (+) Single file covers everything
- (−) Non-spec sections may break tooling that validates against the spec
- (−) Ambiguity about section ordering (spec mandates order for its sections)
- (−) Coupling design guidance with tool-specific workflow

### Where do non-spec concerns live?

The survey identified content our projects need that the DESIGN.md spec intentionally omits:

| Concern | Why the spec omits it | Where it belongs |
| :--- | :--- | :--- |
| ICP/persona framing | The spec's `## Overview` covers "target audience" briefly | DESIGN.md `## Overview` section (spec-compliant, marked project-specific) |
| Figma workflow conventions | Spec is tool-agnostic by design | Dedicated capability in agent instructions (e.g., a Figma conventions guide) |
| Figma Plugin API workarounds | Tool-specific edge cases | Same dedicated capability — not in any design guide |
| Design onboarding path | Operational, not design content | AGENTS.md + KB README/PROJECT_SETUP_GUIDE.md |
| Agent-specific tool instructions | Varies by agent system | AGENTS.md (or equivalent per agent platform) |

### Single file vs split (`DESIGN.md` + `PRODUCT.md`)

We considered separating product context (ICP, engagement cadence, mental models) into a `PRODUCT.md`. This was rejected:

- The DESIGN.md spec's `## Overview` section already accommodates brief audience/brand framing
- AI agents generating UI need both visual tokens and product context — one file read vs two
- No tooling recognizes `PRODUCT.md` — agents wouldn't know to look for it
- Adding another file to the doc stack (README, AGENTS, CONTRIBUTING, GUIDELINES, CHANGELOG, TODO, DESIGN_NOTES, DECISIONS) increases onboarding friction without proportional benefit

Deep product strategy (full personas, market positioning, engagement models) belongs in the project README or a dedicated product brief if the project needs one — not in the design guide.

## Decision

**Adopt the [DESIGN.md open spec](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md) (Alternative B) for repo-local design guides. Keep the file spec-pure. Route non-spec concerns to their proper homes.**

Specifically:

1. **`DESIGN.md`** follows the community standard naming and section structure. Project-specific sections (Overview, Colors, Typography, Components, Do's & Don'ts) are marked with HTML comments (`<!-- PROJECT-SPECIFIC -->`) in the KB template so agents and humans can identify what needs customization per project.

2. **AGENTS.md** (the template, not the KB's own) references DESIGN.md as required reading when design work starts. It also points to Figma workflow guidance and the design onboarding path — described by function, not by tool-specific endpoint names, so the guidance works across different agent systems.

3. **Figma workflow patterns** (edit the base component, variables-first, verify visually, friction log of Plugin API edge cases) live in a dedicated skill (tracked as KB-62). This is semantically distinct: DESIGN.md = "what to design", the Figma conventions skill = "how to work effectively in Figma."

4. **The KB template links to the canonical spec** at the top of the file rather than duplicating the spec's documentation. Projects can use the [Figma plugin](https://github.com/bergside/design-md-figma) to seed their DESIGN.md from existing Figma files, or use the [npm CLI](https://github.com/google-labs-code/design.md) to validate their file against the spec.

## Consequences

**Positive:**

- Ecosystem compatibility: CLI validation, Figma plugin generation, awesome-design-md examples as starting points
- Zero spec maintenance burden — Google Labs and the community maintain the standard
- Clean separation between design specification (DESIGN.md), tooling workflow (Figma conventions), and agent instructions (AGENTS.md)
- AI agents with DESIGN.md awareness can consume our files natively

**Negative:**

- Our ICP framing must fit within the spec's Overview section — no dedicated section for it
- Figma workflow patterns live outside DESIGN.md (in the Figma conventions skill, KB-62) — collaborators need to know both resources exist
- Projects that don't use Figma still get a template whose onboarding path references the Figma ecosystem (plugin, variable export) — may need adaptation for other tools

**Trade-offs accepted:**

- Spec-purity over convenience: we accept that one file doesn't cover everything in exchange for ecosystem compatibility
- Community standard over custom: we lose control of section ordering and structure in exchange for not maintaining our own spec

## Confirmation

- **Template existence:** `templates/DESIGN.md` exists in the KB with spec-compliant structure and `<!-- PROJECT-SPECIFIC -->` markers
- **AGENTS.md reference:** `templates/AGENTS.md` includes a design-work section that references DESIGN.md
- **Onboarding path:** KB README and/or PROJECT_SETUP_GUIDE.md documents how to set up DESIGN.md in a new project (spec link, Figma plugin, CLI validation)
- **Spec-purity check:** DESIGN.md files should pass linting via `npx @google/design.md lint` — this can be added as a pre-commit hook or CI check per project

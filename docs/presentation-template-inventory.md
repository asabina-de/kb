# Presentation Template Inventory

Slide types for reusable pitch deck templates. Each type is a componentized master slide in Figma Slides with placeholder content (no client names). The inventory drives KB-67 implementation.

## Design language

- Dark background (near-black), white/gray text
- Section labels in spaced uppercase monospace (`02 :: SECTION NAME`)
- Page numbers as `NN / total` bottom-right
- Company name bottom-left on applicable slides
- Consistent type hierarchy: bold heading, regular body, monospace labels

## Slide type inventory

### First implementation

| # | Type | Layout | When to use |
|---|---|---|---|
| 1 | **Cover** | Title + subtitle + FOR/BY/DATE metadata | Opening slide. Sets project name, tagline, parties, and date. |
| 2 | **Agenda / TOC** | Numbered section list with optional progress indicator | Orientation slide for decks with 5+ sections. |
| 3 | **Three-Column Points** | Section label + heading + 3 numbered items (title + body) | Pain points, key themes, feature highlights — any "3 things" message. |
| 4 | **Before/After Diagram** | Heading + two-panel visual comparison with arrow | Current state vs future state. Tool landscape, architecture, workflow. |
| 5 | **Phase Timeline** | Heading + N phases with dot-line connector | Engagement structure, project roadmap, sequential milestones. |
| 6 | **Phase Detail** | Heading + badge + description + deliverable tables | Deep dive on a single phase. Two-column layout for dual deliverables. |
| 7 | **Process Flow** | Heading + horizontal stage row (e.g., Scope → Build → Roll Out) + example row | Sprint anatomy, workflow stages, any linear process. |
| 8 | **Four-Point Grid** | Heading + subtitle + 2×2 numbered items + tagline | Support tiers, feature categories, value pillars — any "4 things" message. |
| 9 | **Pricing Table** | Heading + N-row table (phase/scope/investment) + summary callouts | Investment overview. Rows per offering, callout for entry price and full program. |
| 10 | **Credibility Split** | Heading + two-panel cards with center connecting element + tagline | "Why us" — two complementary strengths with visual bridge. |
| 11 | **CTA / Closer** | CTA heading with fill-in-the-blank + contact details + confidentiality footer | Final slide. Call to action, champion/lead contacts, legal note. |
| 12 | **Quote / Testimonial** | Large pull-quote + attribution (name, role, org) | Social proof, client voice, stakeholder endorsement. |
| 13 | **Metrics Highlight** | 2–3 large numbers with labels + optional context line | Impact stats, KPIs, before/after metrics — any "numbers that matter" message. |
| 14 | **Full-Bleed Image** | Full-frame image with optional overlay text | Visual break, section divider, mood setter. |

### Deferred (inventoried, not yet implemented)

| # | Type | Layout | When to use |
|---|---|---|---|
| 15 | **Team / People** | Headshots + names + roles + brief bios | Emotional connector. Who the client will work with. |
| 16 | **Comparison Matrix** | Feature/candidate grid with check/cross/rating marks | Tool evaluations, vendor comparisons, option scoring. |
| 17 | **Case Study** | Problem → approach → result (3-panel or stacked) | Past work proof. Concrete example of delivered value. |

## Narrative guidance

> Placeholder for future development: guidance on how to structure a strong deck — which slides in which order, which are must-haves vs optional, narrative arc (hook → problem → vision → approach → proof → ask). This may evolve into a skill that helps compose decks from the template inventory.

### Typical engagement proposal arc

Based on the Junction pitch deck structure:

1. **Cover** — who, what, when
2. **Three-Column Points** — what we heard (empathy, mirror their pain)
3. **Before/After Diagram** — the vision (what it could look like)
4. **Phase Timeline** — how we get there (overview)
5. **Phase Detail** × N — deep dive per phase (with deliverables)
6. **Pricing Table** — investment (anchored to phases)
7. **Credibility Split** — why us
8. **CTA / Closer** — next step

Optional inserts depending on context:
- **Quote/Testimonial** after Credibility Split (if available)
- **Metrics Highlight** after Phase Detail (if past results exist)
- **Team/People** before or after Credibility Split
- **Agenda/TOC** after Cover (for longer decks, 10+ slides)
- **Full-Bleed Image** as section dividers between phases

## Figma Slides implementation notes

- All interaction goes through `use_figma` Plugin API — `get_metadata` and `generate_figma_design` don't support Slides files
- The `figma-use-slides` skill handles Slides-specific operations
- Target file: https://www.figma.com/slides/xXJMUyCLRXHmNPfwooiqK7 (needs edit access for MCP)
- Each slide type becomes a Figma component on a Components page
- See `skills/figma-conventions/SKILL.md` for component organization patterns

## Source

Inventory derived from analysis of:
- Junction Growth Investors engagement proposal (10 slides, Claude Design export)
- Common pitch deck patterns across consulting/advisory presentations

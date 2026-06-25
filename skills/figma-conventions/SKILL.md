---
name: figma-conventions
description: "Use this skill when the user is about to do design work in Figma — creating or editing components, building layouts, working with variables/tokens, or reviewing visual output. Trigger for prompts like 'let's work on the Figma', 'design this component', 'update the card layout', 'fix the alignment', 'add a new variant', or when a task involves modifying a Figma file through the Plugin API or MCP tools. This skill provides opinionated workflow conventions for how to organize and maintain Figma files effectively — it complements the operational Figma skills (figma-use, figma-generate-design) which handle API mechanics. Do NOT trigger for purely code-side design token work (that's DESIGN.md territory) or for reading Figma files without modifying them."
api_description: "Opinionated Figma workflow conventions — how to organize files, edit components, manage variables, and avoid common pitfalls. Strategic guidance that complements the operational Figma MCP skills."
---

# figma-conventions

Opinionated workflow conventions for working effectively in Figma. This skill covers **how to organize and maintain Figma files** — the strategic layer on top of the operational Figma skills (`figma-use`, `figma-generate-design`, etc.) which handle API mechanics.

These conventions were distilled from pairing sessions and encode patterns that prevent common Figma pitfalls: silent failures, divergence between components and instances, layout fragility, and wasted iteration cycles.

## When to read this

Read this skill before any Figma modification work. The conventions apply whether you're using the Figma Plugin API directly, MCP tools, or guiding a human through manual edits.

**Also read:** the project's `DESIGN.md` for visual design tokens (colors, typography, spacing). This skill is about *how to work in Figma*; DESIGN.md is about *what the design looks like*. Both are needed for design work.

## Enforcement phases

Not all conventions carry equal weight at every stage of work. Use this priority framework to decide what to enforce now vs defer:

**Always enforce (any phase):**
- Edit the base component, never instances
- Trace back to the source of truth before editing
- Verify visually after every change
- Check component inventory before building new frames

**Enforce during implementation (skip during rapid prototyping):**
- Variables-first architecture
- Column alignment discipline (FIXED widths)
- Flow layout over freeform

**Defer to refinement pass (flag for later):**
- Test with varying data lengths
- Dark/light mode parity verification
- Complete variable scoping cleanup

When skipping a convention to maintain velocity, log what was skipped so the gap can be closed. Example: "Skipped data-length testing on the holdings table — flagged for refinement pass."

## Conventions

### Edit the base component, never instances

When making structural or styling changes (spacing, padding, font sizes, colors), **always edit the base component**, not an instance. Editing an instance creates an override that breaks inheritance — the instance stops tracking the component for that property.

**Common violations:**
- Changing `itemSpacing` on an instance instead of the component
- Applying text styles to instance text nodes instead of the component's
- Resizing padding/margins on instances
- Reparenting or restructuring inside instances

**Recovery from accidental instance overrides:**
- In the Figma UI: right-click the instance → "Reset all overrides" (or reset individual properties via the properties panel)
- Via Plugin API: there is no `resetOverrides()` method. The only programmatic fix is to delete the instance and create a fresh one from the component, then reapply the intended property overrides (text values, variant selection, gap sizes for bars)

**Rule:** before writing any modification code targeting a node, ask: "is this node an instance? Should this change live on the component instead?" If yes, navigate to the component first.

### Trace back to the source of truth

Before editing anything, **trace the lineage** to the source of truth:

1. Is this node an **instance**? → find the component
2. Is that component inside **another component** (e.g., a row component inside a table component)? → the inner component is the source of truth
3. Edit the **innermost source component first**, then verify propagation outward through all compositions

The chain is: **source component → parent component → view instance**. Changes flow downward. If you edit a parent component or a view instance directly, you've skipped the source and created divergence.

**After restructuring a component frame** (reparenting, merging sections, replacing instances), audit all component property overrides on instances in that frame. `INSTANCE_SWAP` properties do not carry over when an instance is recreated during restructuring — they reset to defaults. Always verify swap values match the component's intent after any structural change.

### Verify visually after every change

After every modification to the canvas, **take a screenshot and actually look at it**. Don't assume the change worked — confirm it visually. Common failure modes:

- Sizes not sticking on nested instances
- Text clipping or overflowing containers
- Colors not resolving correctly in the current mode (light/dark)
- Layout shifts from reparenting nodes
- Invisible nodes taking up space (0-size placeholders, empty frames)
- Column misalignment in tables (check the full table, not one row)
- Negative `itemSpacing` causing frame overlap

The workflow: **build → screenshot → inspect → fix**. Not: build → build → build → inspect → discover 3 broken things.

### Check component inventory before building

Before creating raw frames or fixing layout issues in a view, **check the Components page** for existing components that serve the same purpose. Using raw frames when components exist creates divergence: the component gets updated but the raw frame stays stale.

**Protocol:**
1. Before any structural modification, list the components on the Components page
2. Ask: "does a component already exist for what I'm about to build?"
3. If yes, use an instance — don't duplicate structure
4. If a view has raw frames that should be component instances, replace them

### Inspect before assuming

Before writing any modification code, **read the current state** of the target frame — fonts, colors, variables, structure may have changed since the last session. Use `get_design_context` or `get_metadata` to discover current conventions, then match them. Don't assume font names, sizes, or colors from memory.

### Variables-first architecture

Every repeated value (color, spacing, stroke weight, radius) should be a Figma variable. If you're about to hardcode a hex or a number and it appears more than once, make it a variable.

**When to add a variable:**
- A value is used in 2+ places, OR
- It carries semantic meaning (e.g., "this green means positive return") — even if used once

**When NOT to add a variable:**
- One-off layout values (a specific padding that only one frame uses) stay as literals unless they become a pattern

**Variable organization:**
- Scope variables tightly — `FRAME_FILL` for backgrounds, `TEXT_FILL` for text colors, `STROKE_COLOR` for borders, `GAP` for spacing. `ALL_SCOPES` is a code smell — tighten as the system matures.
- Organize by role (Background, Text/Primary, Text/Secondary, Border, Semantic/Positive, Semantic/Negative), not by component.
- Use a single collection per theme dimension. One collection with Light/Dark modes is fine for small projects. Split into `Theme` (bg, text, border) and `Semantic` (positive, negative, chart) when collections grow unwieldy.

**Discover variables as you go.** Early design is iterative — don't front-load a full token system. Add variables when you notice repetition or semantic meaning emerging, not before.

### Flow layout over freeform

Prefer auto-layout over absolute positioning. Auto-layout frames respond to content changes; freeform breaks when text reflows or data changes length.

- Use auto-layout as the default container. Only use freeform frames when you need overlapping/layered elements (e.g., sparkline with markers on top).
- Child sizing: `FILL` for elements that should stretch, `HUG` for elements that should wrap their content, `FIXED` only when a specific dimension is required (e.g., avatar circle, table column).

**Text sizing in mixed-height rows:** text nodes inside auto-layout default to `HUG` — this causes vertical misalignment in rows where text sits alongside taller elements (bars, swatches, icons). Fix: set text nodes to `layoutSizingVertical = 'FILL'` in horizontal auto-layout rows with mixed-height children. The text fills the row height and renders vertically centered.

**Don't hack alignment — use the layout system.** When elements don't align:
1. Don't manually set `y` coordinates — that's freeform thinking
2. Don't resize everything to the same pixel height — fragile
3. Don't add padding hacks to compensate
4. Do check if `layoutSizingVertical` is HUG when it should be FILL
5. Do check if `counterAxisAlignItems` is correct on the parent
6. Do make the fix on the source component, verify visually, then confirm propagation

### Containers and separation

- Prefer **stroke-on-frame** (bottom/top border) to separate sections over inserting divider rectangles. Fewer layers, cleaner tree.
- Containers are **outlined, not filled** — fill = background variable, stroke = border variable. No nested card-in-card backgrounds unless semantically distinct.
- Minimal chrome: no shadows, no large corner radii (2px max unless the project's DESIGN.md specifies otherwise), no container gradients.

### Column alignment in data tables

When building table-like layouts with rows of aligned columns:

- **Every column must be FIXED width** — including container frames that hold variable-width content (bars, icons).
- **Never use HUG or FILL on a column that has siblings after it** in a horizontal auto-layout — downstream columns will shift per row.
- The pattern: `[FIXED col] [FIXED col] ... [FILL col]` where only the LAST column (or a spacer) uses FILL to absorb remaining space.
- **Header rows must match column structure** — use the same fixed widths as data rows so headers align with their columns.
- Test column alignment by looking at the full table, not individual rows.

### Variant components for conditional states

Figma components have no conditional logic. Use **variants** to represent mutually exclusive states (e.g., `Direction=positive` / `Direction=negative` for gain/loss indicators). The variant switches visual properties (color, position, icon) — users select the variant in the properties panel without detaching.

Properties shared across variants (text content, data values) work the same regardless of which variant is active.

### Gap-based resizable bars (Figma workaround)

Figma has no numeric component property and no per-instance variable binding. To make bar widths adjustable per instance **without detaching**, use the gap trick:

1. Create an auto-layout frame (this IS the bar — its fill is the bar color)
2. Set `layoutSizingHorizontal = 'HUG'`
3. Add two invisible rectangles (0.01×0.01, no fill) as children
4. Set `itemSpacing` to the desired bar width
5. On instances, override `itemSpacing` in the auto-layout section

The frame's `cornerRadius` and `fills` make it look like a solid bar. The gap between the invisible dots controls its width. Auto-layout properties (gap, padding) are overridable on instances, unlike child node dimensions.

**When to use:** allocation bars, delta bars, progress indicators — any component that needs a per-instance numeric width.

**Critical: wrap gap-bars in fixed containers for column alignment.** A HUG-width gap-bar as a direct child of a row will shift all downstream columns when its gap changes. Always place gap-bars inside a FIXED-width container frame with `clipsContent = true`.

### Nested instance limitations

Figma does not allow resizing nested children inside component instances through the Plugin API. `resize()` calls on deeply nested nodes are silently ignored.

**If a component needs per-instance numeric values:**
1. Use gap-based sizing (gap overrides DO work on nested instances)
2. Detach the outer instance (makes inner instances direct children)
3. Or detach the inner instance (makes the element a plain node)

**Rule of thumb:** if it can't use gaps (complex shapes, non-rectangular elements), accept that instances will need detaching.

### No floating labels on the canvas

Don't add loose text nodes next to components as descriptions — they interfere with selection and get stale. Component names in the Figma layer panel are sufficient for navigation. If a component needs explanation, put it in the component's `description` field.

### Page organization

Organize Figma files with clear page separation:

- **Views** — active compositions (what stakeholders see)
- **Components** — the library, organized by category in horizontal columns
- **Archive** — old iterations (for reference, not active use)

Within the Components page, organize in horizontal columns left-to-right by category, with generous spacing (80px+) between items for isolation.

## Don't pretend to see something you don't

When verifying a change visually, if the screenshot shows the same state as before, say so. Don't construct a narrative about how it "actually looks correct" when it doesn't. The user can see the same image.

## Fix one thing at a time

Each fix should be: identify problem → trace to source → make one change → screenshot → verify → move on. Don't batch multiple fixes in one modification call — when something breaks, you can't tell which change caused it.

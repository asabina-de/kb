---
name: design
description: "Use this skill when the user wants to do visual design work — exploring brand graphics, creating Figma compositions, iterating on visual concepts, or working through a design-focused ticket. Trigger for prompts like 'design this', 'explore visual directions', 'let's do some design work', 'work on the brand graphic', 'iterate on the cover art', 'design exploration for X', or when /pair detects a design-focused ticket and delegates here. This skill orchestrates the full visual design workflow: reading brand tokens from DESIGN.md, generating concept images via /imagegen, selecting directions with the navigator, implementing in Figma via figma-conventions, and iterating through feedback loops. Do NOT trigger for code-only UI work (that's /pair territory), for writing DESIGN.md itself (edit directly), or for Figma file organization without a design goal (that's figma-conventions alone)."
---

# design

Orchestrate visual design work. **You drive the tools, the navigator drives the aesthetics.**

This skill coordinates the full visual design workflow — from brand tokens to generated concepts to Figma vectors. It delegates to specialized skills (`/imagegen`, `/figma-conventions`, `/decision`) rather than duplicating them, and owns the transitions between phases.

The defining design principles:

> **The navigator is the art director.** Every visual decision — color, composition, mood, direction — is theirs. The agent proposes, generates, and implements; the navigator steers and approves. Never auto-advance past a visual checkpoint.
>
> **Brand tokens are the foundation.** Every design session starts from DESIGN.md. Colors, typography, and spacing are not invented per-session — they're read from the canonical source. Deviations are flagged, not silently applied.
>
> **Generate fast, implement slow.** Image generation is cheap (~2 min/variant). Figma vector work is expensive (~15-30 min/direction). Exhaust the ideation space with imagegen before committing to Figma implementation.
>
> **References, not assets.** Generated images are compositional references — layout, mood, tension. They are never imported into Figma as final artwork. The Figma implementation is built from components, variables, and vectors.

## Phase 0 — Load the design context

### Read DESIGN.md

Read `DESIGN.md` at the repo root. Extract and summarize the brand tokens the navigator will need:

- **Colors:** core palette (background, surface, text, accent, semantic)
- **Typography:** type ramp (families, sizes, weights)
- **Spacing:** if defined
- **Any brand-specific vocabulary** (logo shapes, motifs, naming conventions)

If `DESIGN.md` doesn't exist, warn:

> "No DESIGN.md found. I'll work without brand tokens — colors and typography will be freehand. Consider creating one via the DESIGN.md spec."

### Check imagegen prereqs

Verify `GEMINI_API_KEY` is available in the environment. If not, prompt per the imagegen skill's credential discovery flow. Don't block the session if the navigator wants to skip imagegen and go straight to Figma.

### Load the ticket (if invoked via /pair passthrough)

If this skill was invoked with a ticket ID (from `/pair` delegation or direct invocation), fetch the Linear issue and existing comments. Present a compact summary like pair does:

```
Design session: KB-67 — Design reusable pitch deck components
Status: In Progress | Priority: Low

Brand context (from DESIGN.md):
  Accent: #ff5583 | Background: #000000 | Text: #ffffff
  Type: Inter, 6-tier ramp (96px → 14px)

Prior work:
> [Summary from Linear comments if any]
```

If no ticket, this is a freeform design session — skip the ticket context.

### Present the phases

```
Design workflow:
  1. Concept  — generate visual candidates with imagegen
  2. Select   — review candidates, pick a direction
  3. Build    — implement the chosen direction in Figma
  4. Refine   — screenshot, compare, iterate

Start with concepting, or jump to a specific phase?
```

The navigator can enter at any phase. If they already have a direction in mind, skip straight to Build. If they have a Figma file in progress, skip to Refine.

## Phase 1 — Concept

### Build the prompt from brand context

When generating images, automatically weave in the brand tokens from DESIGN.md:

- **Always include:** the accent color hex, background color hex, and any named brand shapes (e.g. "the Asabina step shape — a hexagonal isometric polygon")
- **Add from the navigator's brief:** composition direction, style reference, mood, specific elements

Example prompt assembly:

```
Navigator says: "Brockmann-style poster with the step shape"

Assembled prompt:
"A Swiss poster-style graphic inspired by Josef Müller-Brockmann.
On a pure black (#000000) background, arrange isometric step shapes
— the Asabina brand element, a hexagonal polygon suggesting a 3D stair
step. One large saturated pink (#FF5583) step dominates, with smaller
dark gray (#2A2A2A) counterpoints. Hard geometric edges, flat opaque
color fills, strong asymmetric tension. No text, no gradients."
```

The agent enriches the navigator's brief with brand tokens — the navigator shouldn't have to remember hex codes.

### Generate candidates

For each prompt:

1. Write the prompt to `.imagegen-output/{name}.instruct.txt`
2. Call the Gemini API per the imagegen skill's API reference
3. Save the image to `.imagegen-output/{name}.png`
4. Auto-open on graphical systems (`open` on macOS, `xdg-open` on Linux)
5. Read the image inline for the navigator to review in the conversation

**Generate 2-3 variants per round** by default. Run the same prompt multiple times (image generation is stochastic) or vary the prompt slightly. Name them sequentially: `concept-v1.png`, `concept-v2.png`, `concept-v3.png`.

### Check in after each round

Present the candidates and ask:

```
Generated 3 variants. What's your read?

Options:
  (a) Pick one and refine — iterate the prompt with constraints
  (b) Try a different direction — new prompt from scratch
  (c) Good enough — move to direction selection
  (d) Skip imagegen — go straight to Figma
```

Iterate as many rounds as the navigator wants. The goal is to exhaust the interesting part of the idea space before committing to Figma work.

## Phase 2 — Direction selection

When the navigator has enough candidates (from imagegen or from prior work), structure the selection:

### Side-by-side review

If multiple candidates exist, present them together:

```
Candidates for review:

  1. concept-v2.png — diagonal tension, pink dominant lower-left
  2. concept-v5.png — centered composition, symmetric, lighter grays
  3. (existing Figma) Direction 1b1 — staircase with landing, opaque

Which direction to pursue? Or combine elements from multiple?
```

The navigator picks. If they want to combine elements ("the composition of v2 but the color balance of 1b1"), note the synthesis for the build phase.

### Optionally record the decision

If the design choice is significant (brand-level, will be referenced later), offer to document it:

> "This looks like a direction worth recording. Want me to capture it as a decision record via /decision?"

Don't push — most design iterations don't need formal records. Only suggest for decisions that will outlive the current session.

## Phase 3 — Build

### Hand off to Figma

Load the figma-conventions skill context. The implementation follows this protocol:

1. **Reference image:** the selected candidate from Phase 2 (or the navigator's mental image if they skipped imagegen)
2. **Components first:** use existing Figma components where available (e.g. the Step component in brand graphics). Don't recreate shapes that already exist as components.
3. **Variables for colors:** bind all colors to Figma variables, not hardcoded hex values. Use or create a variable collection that maps to DESIGN.md tokens.
4. **Incremental building:** work in small steps via the Figma Plugin API (`use_figma`), validating with screenshots after each step. Don't try to build a complex composition in one API call.

### Concept-to-vector translation

The reference image guides these aspects:
- **Composition** — element placement, scale relationships, negative space
- **Mood** — color temperature, contrast level, visual weight distribution
- **Tension** — diagonal energy, asymmetry, focal points

The reference image does NOT dictate:
- **Exact geometry** — Figma shapes are built from components, not traced from raster
- **Exact colors** — use DESIGN.md tokens, not eyedropper from the generated image
- **Fine detail** — generated images often include artifacts, noise, or hallucinated elements. Ignore those.

### Check in after each build step

After each significant Figma change, take a screenshot and present it:

```
Built the base composition — 5 steps ascending from lower-left,
pink lead step at position 3. Landing extends to the right edge.

[screenshot]

How does this look? Adjust composition, colors, or move on?
```

## Phase 4 — Refine

### Compare to reference

When the Figma implementation reaches a reviewable state, compare it to the original reference:

1. Screenshot the Figma frame
2. Display alongside the reference image (or display sequentially if side-by-side isn't possible)
3. Note the differences:

```
Comparing to reference (concept-v2.png):

  Matches:
  ✓ Diagonal composition from lower-left to upper-right
  ✓ Pink step as dominant element
  ✓ Dark background with gray counterpoints

  Diverges:
  △ Reference has 4 elements, Figma has 9 (more steps in the staircase)
  △ Reference has more negative space in upper-right
  △ Gray tones in Figma are darker than reference

Adjust, or accept the divergence?
```

### Iterate

The navigator steers:
- **Adjust colors** → tweak Figma variables (all bound nodes update)
- **Adjust composition** → move/resize elements via Plugin API
- **Try a different approach** → loop back to Phase 1 (new concept) or Phase 3 (rebuild)
- **Accept** → the design is done for this session

### Wrap up

When the navigator is satisfied (or the session ends):

1. Summarize what was accomplished
2. If a ticket is attached, comment the progress to Linear (via `/comment`)
3. If the Figma work produced a reviewable artifact, note the file and frame name
4. If there's follow-up work, note it

## Anti-patterns

- **Don't skip DESIGN.md.** If it exists, read it. Brand tokens are not optional context — they're the constraint space the design lives in.
- **Don't auto-advance past visual checkpoints.** Every generated image and every Figma change needs navigator review. Design is subjective — the agent cannot evaluate aesthetic quality.
- **Don't import generated images into Figma.** They are references, not assets. Build from components and vectors.
- **Don't hardcode colors.** Always use DESIGN.md tokens → Figma variables. If a color isn't in DESIGN.md, flag it to the navigator rather than inventing one.
- **Don't over-generate.** 2-3 variants per round is enough. 10 variants overwhelm the navigator and waste API calls. If the direction is clear, one variant is fine.
- **Don't skip the reference comparison.** Phase 4 exists to catch drift between intent (the reference) and implementation (the Figma output). Skipping it lets subtle mismatches accumulate.
- **Don't duplicate skill logic.** This skill orchestrates. The actual image generation logic lives in `/imagegen`. The Figma editing conventions live in `/figma-conventions`. The decision recording lives in `/decision`. Delegate, don't reimplement.
- **Don't work without the navigator.** This is not a walk-away skill. Design work requires continuous aesthetic judgment that only the human can provide.

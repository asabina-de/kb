# Decisions

This directory contains **decision records** — living documents that start as explorations and graduate in place to settled decisions. Each record follows a unified format covering the full lifecycle from "we should think about this" to "here's what we decided and how we enforce it."

## Getting Started

1. **Find the next serial number**: `ls docs/decisions/ | sort -n | tail -1`
2. **Copy the template**: `cp 0000-decision-template.md docs/decisions/NNNN-your-slug.md`
3. **Fill in frontmatter**: title, tags, status (`exploring`), review_date
4. **Write**: start with Context and Exploration. Decision, Consequences, and Confirmation get filled when the call is made.
5. **Update the status log**: add a row for each significant transition
6. **Archive**: move superseded records to `ARCHIVE/` and set `status: superseded` in frontmatter

## Naming Convention

```
nnnn-slug.md
```

- **`nnnn`** — zero-padded serial number (0001, 0002, ...). Check the highest existing number before creating.
- **`slug`** — kebab-case description of the topic. Should be clearly scoped, general enough to survive reframing, and stable across revisits.

Examples:

```
0001-select-apm.md
0002-database-choice.md
0003-authentication-approach.md
0019-select-apm.md              ← revisit of 0001, with supersedes: "0001"
```

## Frontmatter Schema

```yaml
---
title: "Human-Readable Title"
tags: [tag1, tag2]
status: exploring | decided | superseded | deprecated
decision: ""              # one-line TL;DR, filled when status becomes "decided"
review_date: YYYY-MM-DD   # when should this be revisited?
related_to: []             # serial numbers of related records (e.g. ["0003", "0007"])
supersedes: ""             # serial number of superseded record (e.g. "0003")
---
```

### Quick filtering

```bash
# All decided records
grep -rl "^status: decided" docs/decisions/

# Every record's status and verdict in one pass
grep -E "^(status|decision):" docs/decisions/*.md

# Find records by tag
grep -rl "tags:.*authentication" docs/decisions/
```

## Status Lifecycle

- **`exploring`** — actively being investigated. Context and Exploration sections are being filled.
- **`decided`** — the call has been made. Decision and Consequences sections are frozen; amendments go in the status log.
- **`superseded`** — replaced by a newer record. Set `supersedes:` in the new record's frontmatter.
- **`deprecated`** — no longer relevant. Move to `ARCHIVE/`.

## Status Log

Each record includes a status log table that tracks transitions over time:

| Status | Date       | Author | Related Tickets | Notes                    |
| :----- | :--------- | :----- | :-------------- | :----------------------- |
| TODO   | 2025-09-12 | Alice  | KB-123          | Initial creation         |
| WIP    | 2025-09-15 | Alice  | KB-123          | Started exploring options |
| DONE   | 2025-09-20 | Alice  | KB-123          | Decision finalized       |

The status log provides human-readable history (multi-author tracking, ticket links, dated transitions) while the frontmatter `status` field enables machine filtering.

## Template Sections

```
## Context          — why this matters, what's in scope
## Exploration      — alternatives considered, trade-offs
## Decision         — one-line TL;DR (mirrors frontmatter), then full rationale
## Consequences     — positive and negative outcomes of the decision
## Confirmation     — how we verify this was followed (CI, hooks, review checklists)
```

For records in `status: exploring`, the Decision, Consequences, and Confirmation sections are empty or carry `_No decision yet._`

## Where do raw ideas go?

This directory is for topics someone is actively thinking about. Half-baked "what if we..." ideas belong in `TODO.md` under Later/Never until someone picks them up for exploration. The bar for creating a record here is: **someone is actively exploring this.**

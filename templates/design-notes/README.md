# Design Notes Directory

This directory contains **individual design exploration files** to avoid git worktree conflicts when working on multiple design concerns simultaneously.

## Getting Started

1. **Copy template**: Use `YYYY-MM-DD.design-note-template.md` as your starting point
2. **Name your file**: Use format `YYYY-MM-DD.specific-topic-name.md`
3. **Iterate**: Develop ideas within individual files (no merge conflicts!)
4. **Complete**: Choose appropriate completion path based on your needs
5. **Archive**: Move old explorations to `ARCHIVE/` when no longer relevant

## Completion Paths

**Path A - Graduate to ADR**: Design-before-implementation workflow

- Early design scribbles and ideas that mature into formal, immutable architectural decisions
- Move finalized design to `decisions/` with full rationale
- Update status to "Completed" and archive the design note
- Best for: System architecture, technology choices, major design patterns

**Path B - Standalone Documentation**: Implementation-focused workflow

- Keep design note as living documentation that evolves with the system
- Captures ongoing observations, iterations, and implementation details
- Status remains "Active", "Implemented", or "Stable"
- Best for: CI setups, implementation approaches, process documentation

## Design Notes vs Decision Records

**Design Notes**: Living, evolving documents

- Can be created before OR after decisions are made
- Capture ongoing observations during implementation
- Updated as understanding and implementation evolve
- Multiple iterations and status changes expected

**Decision Records**: Immutable snapshots

- Formal decisions made at specific points in time
- Should remain largely unchanged once written
- Provide historical context of what was decided and why
- Referenced but not modified during implementation

## Status Lifecycle

- **Draft** -> **Active** -> **Implemented** -> **Stable** (Path B)
- **Draft** -> **Active** -> **Completed** -> **Archived** (Path A)
- **Draft** -> **Deprecated** -> **Archived** (abandoned approaches)

## Examples

- `2024-01-15.user-authentication-strategy.md` (ADR candidate)
- `2024-01-22.ci-with-e2e-coverage-tracking.md` (implementation documentation)
- `2024-02-03.performance-monitoring-setup.md` (process documentation)

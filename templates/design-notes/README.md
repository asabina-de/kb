# Design Notes Directory

This directory contains **individual design exploration files** to avoid git worktree conflicts when working on multiple design concerns simultaneously.

## Getting Started

1. **Copy template**: Use `YYYY-MM-DD.TODO.design-note-template.md` as your starting point
2. **Name your file**: Use format `YYYY-MM-DD.STATE.specific-topic-name.md` (e.g., `2025-09-12.WIP.api-authentication.md`)
3. **Update status log**: Add new rows to track progress and decisions over time
4. **Iterate**: Develop ideas within individual files (no merge conflicts!)
5. **Complete**: Choose appropriate completion path based on your needs
6. **Archive**: Move old explorations to `ARCHIVE/` when no longer relevant

## Status Log Format

Each design note includes a **Status Log** table that tracks changes over time:

```markdown
| Status | Date       | Author | Related Tickets                                 | Notes                                 |
| :----- | :--------- | :----- | :---------------------------------------------- | :------------------------------------ |
| TODO   | 2025-09-12 | Alice  | [Z-322](https://linear.app/asabina/issue/Z-322) | Initial exploration                   |
| WIP    | 2025-09-15 | Alice  | [Z-322](https://linear.app/asabina/issue/Z-322) | Started prototyping auth flow         |
| REVIEW | 2025-09-18 | Bob    | [Z-322](https://linear.app/asabina/issue/Z-322) | Ready for team review                 |
| DONE   | 2025-09-20 | Alice  | [Z-322](https://linear.app/asabina/issue/Z-322) | Decision finalized, graduating to ADR |
```

**Table Benefits:**

- ✅ **GitHub-friendly**: Renders properly in GitHub's markdown (unlike line-break format)
- ✅ **Change history**: Complete log of status transitions and reasoning
- ✅ **Context tracking**: Links to tickets and brief notes about changes
- ✅ **Multi-author support**: Track who made changes (important for team projects)

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

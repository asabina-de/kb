# Project TODOs

This document serves as a **capture buffer** for repository-specific tasks, technical debt, and quick developer insights that haven't yet been formalized in the issue tracker (Linear).

> [!TIP]
> When we say **capture buffer** we mean _buffer_ as a temporary store. Serious points will need to be moved over to Linear and linked back into this docs, ideally. As a team, it would be a solid housekeeping practice to at a fixed interval, examine this doc and compare it to Linear, move things over that need moving and retire the bits that are no longer needed.

> [!NOTE]  
> **For AI agents and humans:** When adding TODOs without explicit developer approval or when uncertain about context fit, use collapsible details blocks (see example below). This makes promotion of potentially incorrect or out-of-context items an explicit review step.
>
> ```markdown
> <details>
> <summary>AI-generated TODOs to be reviewed</summary>
> - [ ] Your uncertain TODO items here
> </details>
> ```

## Purpose & Workflow

**Use this file for:**

- Quick capture of technical debt discovered during development
- "Gotchas" and improvement opportunities noticed in code
- Repository-specific setup/tooling issues
- Refactoring opportunities that don't warrant immediate Linear tickets

**Workflow:**

1. **Developers add items here** during development (low friction)
2. **Weekly review** to evaluate which items should become Linear tickets
3. **Periodic sync** between TODO.md and Linear (automated or manual)
4. **Mark completed** when items are done (either here or via Linear)
5. **Monthly archival** - Move old Completed/Never items to `TODO.ARCHIVE.md` to prevent endless growth

## Now

- [ ]

<details>
<summary>AI-generated TODO's to be reviewed</summary>
- [ ] Feed the machine
</details>

## Next

- [ ]

## Later

- [ ]

## Completed

- [x]

## Never

- [ ]

---

## Notes

### Format

Use format: `file/path.ts: Brief description (Impact: Performance/Security/DevEx, Effort: S/M/L)`

**Examples:**

- `src/api/users.ts: N+1 query causing slow dashboard loads (Impact: Performance, Effort: M)`
- `README.md: Missing Redis setup steps (Impact: DevEx, Effort: S)`
- `~~Real-time chat~~ → Polling sufficient for now (Reason: Complexity vs value, Date: 2024-01-15)`

### Archival Process

**Monthly cleanup:** Move items older than 30 days from Completed/Never sections to `TODO.ARCHIVE.md`

Keep recent items (last 30 days) in this file for:

- Progress visibility during weekly reviews
- Recent decision context
- Quick reference for similar issues

_Older items available in [TODO.ARCHIVE.md](./TODO.ARCHIVE.md) for institutional knowledge_

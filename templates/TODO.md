# Project TODOs

> [!NOTE]  
> **For AI agents:** When uncertain about TODO context fit, use collapsible details blocks: `<details><summary>AI-generated TODOs to be reviewed</summary>- [ ] items</details>`

## Now

- [ ]

## Next

- [ ]

## Later

- [ ]

## Completed

- [x]

## Never

- [ ]

---

<details>
<summary>📋 Usage & Guidelines</summary>

**Purpose:** Repository-specific task scratchpad outside formal ticketing (Linear)

**Use for:**

- Technical debt discovered during development
- "Gotchas" and improvement opportunities
- Repository-specific setup/tooling issues
- Refactoring opportunities

**Format:** `file/path.ts: Brief description (Impact: Performance/Security/DevEx, Effort: S/M/L)`

**Examples:**

- `src/api/users.ts: N+1 query causing slow dashboard loads (Impact: Performance, Effort: M)`
- `README.md: Missing Redis setup steps (Impact: DevEx, Effort: S)`
- `~~Real-time chat~~ -> Polling sufficient for now (Reason: Complexity vs value, Date: 2024-01-15)`

**Workflow:**

1. Add items during development (low friction)
2. Weekly review to evaluate Linear promotion
3. Monthly archival of old Completed/Never items to `TODO.ARCHIVE.md`

</details>

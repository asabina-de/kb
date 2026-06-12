---
name: align
description: "Use this skill when the user wants to bring a repo's conventions into alignment with the KB standards. Trigger for prompts like 'align this repo', 'sync conventions', 'check what's out of date', 'run the migration', 'what KB changes apply here', or when the user invokes `/align`. The skill reads the KB's CHANGELOG.md for stateless migration instructions, assesses the current repo's state across all resource types (files, repo settings, tickets, CI/CD, infra), and presents a gap analysis. Migrations are applied interactively with operator approval. Do NOT trigger for creating new conventions (that's a design task), for KB development itself (the KB repo is the source, not a target), or for one-off file edits that don't relate to convention alignment."
allowed-tools: Bash Glob Grep Read Edit Write Agent AskUserQuestion Skill mcp__claude_ai_Linear__list_issues mcp__claude_ai_Linear__get_issue mcp__claude_ai_Linear__save_issue mcp__claude_ai_Linear__list_comments mcp__claude_ai_Linear__list_teams mcp__claude_ai_Linear__list_projects mcp__claude_ai_Linear__list_issue_labels mcp__github__search_repositories mcp__github__get_file_contents mcp__github__list_branches
---

# align

Bring a repo's conventions into alignment with the KB standards. **Assess everything, fix nothing without approval.**

The defining design principles:

> **The CHANGELOG is the source of truth.** The KB's `CHANGELOG.md` carries dated, stateless migration instructions. The skill reads them, assesses which apply to the current repo, and presents the gaps. It does not hardcode conventions — it follows whatever the CHANGELOG says.
>
> **Resources, not just files.** Convention changes affect multiple resource types: files, repo settings, tickets, CI/CD, infrastructure, databases, observability, external services. The skill infers affected resources from what each convention change assumes about the world, and checks all of them.
>
> **Critical by default.** The skill pushes back when migration scope is incomplete — if a CHANGELOG entry implies a resource type that the repo hasn't addressed, the skill flags it rather than silently skipping. It also flags destructive operations and requires explicit confirmation before proceeding.
>
> **Safe and reversible.** Destructive operations (file deletions, renames, config changes that affect all contributors) are flagged with warnings and require explicit confirmation. The skill prefers additive changes (create new files, append sections) over destructive ones (delete, overwrite). When a migration step can't be undone, say so before executing.
>
> **Interactive, not autonomous.** Every migration step is presented, explained, and approved before execution. The operator can skip, defer, or modify any step. Batch approval is available for mechanical steps, but destructive or ambiguous steps are always individual.

## How this skill relates to other skills

```
KB repo (source of truth)
  │
  ├── CHANGELOG.md — dated migration entries with resource-typed steps
  ├── templates/ — canonical file templates
  └── skills/ — skill definitions (including this one)
        │
        ▼
/align (this skill) — reads CHANGELOG, assesses target repo, presents gaps
  │
  ├── File migrations → Edit/Write directly
  ├── Repo settings → surface gh CLI commands (HITL)
  ├── Ticket migrations → /linearissue for title/scope fixes
  └── Manual steps → surface instructions, can't automate
```

## Phase 0 — Locate the KB

The skill needs access to the KB repo's `CHANGELOG.md`. Discover it in this order:

1. **Symlink at repo root:** check for `./kb` or `./knowledge-base` symlink. If present, use it.
2. **Explicit path:** if the user passed a path argument (e.g. `/align ~/Code/asabina-de/kb`), use it.
3. **Environment variable:** check `$KB_PATH` if set.
4. **Ask:** if none of the above, ask the operator: "Where is the KB repo? Provide a path, or set up a `./kb` symlink."

Verify the path by checking for `CHANGELOG.md` at the root. If missing, refuse: "No CHANGELOG.md found at {path} — this doesn't look like the KB repo."

Read the full `CHANGELOG.md`. Parse each dated section, extracting:
- **Date** — when the change landed
- **Changed/Added/Removed items** — what changed
- **Migration steps** — grouped by resource type (or ungrouped in older entries)

## Phase 1 — Assess the target repo

Read the target repo's current state in parallel:

- **Repo docs:** `CONTRIBUTING.md`, `AGENTS.md` / `CLAUDE.md`, `README.md`, `CHANGELOG.md`
- **CI/CD:** `.github/workflows/`, `.pre-commit-config.yaml`
- **Repo config:** `.github-settings.yaml`, `.gitignore`, `.envrc`
- **Templates vs local:** compare local files against KB `templates/` to detect drift
- **Git config:** merge strategy, branch protection (via `gh api` if available)
- **Recent history:** `git log --oneline -20` for convention compliance in recent commits

### Infer resource scope

For each CHANGELOG migration entry, infer what resource types it affects:

1. Read the migration steps — they may already be grouped by resource type (newer entries).
2. For ungrouped entries (older format), infer: does this change affect files? Repo settings? Tickets? CI? Read the "Changed" description to understand what the convention assumes.
3. Build a resource map: `{changelog_date: [{resource_type, migration_step, applies: bool, status: done|gap|partial|unknown}]}`

### Detect gaps

For each migration step, check whether the target repo has already applied it:

**Files:**
- Does the file exist? Does its content match the expected pattern?
- Use `Grep` for pattern matching (e.g. "does CONTRIBUTING.md have an 'AI Co-authorship' section?")
- Compare against the KB template version for drift

**Repo settings:**
- Read `.github-settings.yaml` if present — compare declared settings against the KB template
- If no `.github-settings.yaml`, flag as "repo settings not declared — unknown compliance"
- Check observable settings via `gh api repos/{owner}/{repo}` if `gh` is available

**Tickets:**
- Fetch open issues from Linear (`list_issues` filtered by project/team)
- Run each title through the quality gate: imperative voice, verb tiers, statement detection, truncation check
- Check descriptions for DoD presence
- Flag scope issues: overly broad tickets, missing breakdown

**CI/CD:**
- Check for expected workflows (e.g. `lint-pr.yaml`)
- Compare workflow content against KB template version

## Phase 2 — Present the gap analysis

Print a structured report:

```
Convention alignment report for {repo-name}
KB reference: {kb-path}/CHANGELOG.md
Last KB entry: [YYYY-MM-DD]

✅ Up to date (N items)
  - [2026-06-05] decisions/ consolidation — applied
  - [2026-06-04] CONTRIBUTING.md template — applied

⚠️  Gaps found (M items)

  [2026-06-12] Imperative voice title standard
    Files:     ✅ CONTRIBUTING.md has PR title convention
    Tickets:   ⚠️  5 of 12 open tickets have statement titles
    Repo settings: ✅ .github-settings.yaml present

  [2026-06-11] Semantic PR title CI enforcement
    Files:     ❌ No .github/workflows/lint-pr.yaml
    Repo settings: ❌ No .github-settings.yaml
    Files:     ⚠️  CONTRIBUTING.md missing PR Title Convention section

❓ Cannot assess (K items)
  - [2026-06-11] Squash-merge title format — no gh CLI access to check GitHub settings

📋 Migration plan: {total} steps across {resource_types} resource types
   {N} automated · {M} manual · {K} destructive (require confirmation)
```

### Push back on incomplete scope

After presenting gaps, check whether the migration entries themselves cover all resource types implied by the change. If a CHANGELOG entry changes a convention but its migration steps only cover files (not tickets, not repo settings), flag it:

```
⚠️  Migration scope may be incomplete:

  [2026-06-12] Imperative voice title standard
    The CHANGELOG migration steps cover files but not tickets.
    This convention change also affects existing ticket titles in the backlog.
    Recommend: audit open tickets for statement titles before proceeding.
```

The skill should propose additional migration steps for uncovered resource types and add them to the plan with operator approval.

### Flag destructive operations

Before presenting the migration plan, classify each step:

- **Additive** — creates new files, appends sections. Safe, reversible.
- **Modifying** — edits existing content. Reversible via git.
- **Destructive** — deletes files, renames, changes repo-wide settings. Harder to reverse.
- **External** — changes outside the repo (GitHub settings, Linear tickets, CI config). May affect all contributors.

Mark destructive and external steps clearly:

```
Step 3: ⚠️ DESTRUCTIVE — Remove design-notes/ directory
  git rm -r docs/design-notes/
  This cannot be undone without git history recovery.
  
Step 5: 🔧 EXTERNAL — Set squash-merge title to "PR title" (manual)
  gh api repos/{owner}/{repo} -X PATCH -f squash_merge_commit_title=PR_TITLE
  This affects all contributors immediately.
```

## Phase 3 — Execute migrations

Present the full migration plan as a numbered checklist:

```
Migration plan ({N} steps)

 1. [auto]    Copy .github/workflows/lint-pr.yaml from KB template
 2. [auto]    Add PR Title Convention section to CONTRIBUTING.md
 3. [auto]    Add AI Co-authorship section to CONTRIBUTING.md
 4. [manual]  Set squash-merge title format in GitHub Settings
              gh api repos/{owner}/{repo} -X PATCH -f squash_merge_commit_title=PR_TITLE
 5. [auto]    Create .github-settings.yaml from KB template
 6. [tickets] Audit 5 ticket titles for imperative voice compliance
 7. ⚠️ [destructive] Remove docs/design-notes/ (migrated to docs/decisions/)

Execute all auto steps? (manual/destructive steps are always individual)
```

Use `AskUserQuestion` with options:
- **Execute all auto steps** — run all non-destructive automated steps, then present manual/destructive ones individually
- **Step through one by one** — present each step for individual approval
- **Skip to specific step** — jump to a numbered step
- **Bail** — stop, no changes made

### Executing steps

For each approved step:

1. **Announce** what's about to happen and which resource type it affects.
2. **Execute** the change:
   - **File changes:** `Edit` / `Write` / `Bash` (for `git mv`, `git rm`)
   - **Repo settings:** surface `gh` CLI commands for the operator. On explicit approval ("go ahead"), execute them. Never auto-execute external changes.
   - **Ticket changes:** delegate to the `/linearissue` skill for title rewrites and scope fixes. Present proposed changes and get approval before applying.
   - **Manual steps:** print instructions clearly. Mark as done only when the operator confirms they've completed it.
3. **Verify** the step succeeded — re-run the gap check for that specific item.
4. **Mark complete** and move to the next step.

### Defensive measures

- **Before any file edit:** verify the file exists and show what will change. Never blindly overwrite.
- **Before any deletion:** show what will be deleted and confirm. Suggest `git rm` over `rm` for tracked files so the change is in the commit history.
- **Before any rename:** check for references to the old name in other files and flag them.
- **Before any repo setting change:** warn that this affects all contributors and confirm.
- **Before any ticket change:** show the current title/description alongside the proposed change.
- **On failure:** stop the current step, report what happened, and ask how to proceed. Don't continue to the next step — the operator may want to fix manually.

## Phase 4 — Summary

Print what was accomplished:

```
Alignment complete for {repo-name}

Applied:
 ✅ Step 1: Copied lint-pr.yaml workflow
 ✅ Step 2: Added PR Title Convention to CONTRIBUTING.md
 ✅ Step 3: Added AI Co-authorship to CONTRIBUTING.md
 ✅ Step 5: Created .github-settings.yaml

Manual (operator to complete):
 📋 Step 4: Set squash-merge title format — gh command provided above

Skipped:
 ⏭️ Step 7: design-notes/ removal — operator deferred

Tickets audited:
 ✅ 3 titles rewritten to imperative voice
 ⏭️ 2 titles kept as-is (operator approved current wording)

Files changed: {list}
Suggested commit: doc: align repo conventions to KB standards [YYYY-MM-DD] [ai:claude]
```

Do not commit — git is HITL. Present the suggested commit message using `commitmsg` methodology.

## Anti-patterns

- **Don't hardcode conventions.** Read them from the KB CHANGELOG. If the CHANGELOG doesn't mention it, the skill doesn't enforce it.
- **Don't silently skip resource types.** If a convention change implies tickets should be audited but the CHANGELOG entry only covers files, flag the gap — don't ignore it.
- **Don't auto-execute destructive operations.** File deletions, renames, repo setting changes, and ticket modifications always require individual confirmation.
- **Don't auto-execute external changes.** Repo settings, CI config, and anything outside the local repo are HITL — surface commands, don't run them unless explicitly approved.
- **Don't apply migrations out of order.** Some migrations depend on earlier ones (e.g. "add CONTRIBUTING.md" must happen before "add PR Title Convention section to CONTRIBUTING.md"). Respect the dependency chain.
- **Don't modify the KB repo itself.** This skill targets downstream repos. The KB repo is the source of truth — use normal development workflow to change it.
- **Don't fabricate migration steps.** If the CHANGELOG doesn't specify a step, don't invent one. Flag the gap and ask the operator whether to add it.
- **Don't mark manual steps as done.** Only the operator can confirm manual steps are complete. Don't assume.
- **Don't batch destructive steps.** Even if the operator chose "execute all auto steps", destructive steps are always presented individually.
- **Don't ignore older CHANGELOG entries.** A repo that hasn't synced in months may need to apply multiple rounds of migrations. Walk through all applicable entries, oldest first.

## Future direction: ticket-per-alignment-run

A planned enhancement: before executing migrations (Phase 3), the skill should file a tracking ticket via `/linearissue` — e.g. "Align conventions to KB 2026-06-12 state" — scoped to the gaps found in Phase 2. Each Phase 3 step would post a progress comment threaded on that ticket via `/commenting`, and the Phase 4 summary would become the resolution comment. This gives alignment runs an audit trail: what was checked, what was applied, what was skipped, and why — visible to auditors and future contributors without reading CLI session logs.

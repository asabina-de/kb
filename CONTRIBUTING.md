# Contributing

This document is the canonical source of truth for commit conventions, scope discipline, and merge strategy. All contributors — human and AI — must follow these rules.

> **For AI agents:** Read this file before drafting or making any commit. `AGENTS.md` defers to this file for commit format, the scope list, and prohibited patterns.

## Commit Convention

### Format

```
<type>(<scope>): <subject> [ai:<agent>]

[optional body]

[optional footer(s)]
```

- **type** — what kind of change (see table below)
- **scope** — what area of the codebase is affected (see table below)
- **subject** — imperative, lowercase, no period, ≤80 characters
- **`[ai:<agent>]`** — required trailer when an AI agent authored or co-authored the commit (e.g. `[ai:claude]`, `[ai:gemini]`)
- **body** — explain *why*, not *what* (the diff shows what)
- **footer** — `Co-Authored-By:`, `BREAKING CHANGE:`, references

### Types

| Type | Use when… |
|---|---|
| `feat` | Adding a wholly new feature or capability |
| `fix` | Fixing a bug |
| `refactor` | Restructuring code without changing behavior |
| `doc` | Documentation only |
| `test` | Adding or updating tests only |
| `chore` | Build, CI, tooling, dependencies |
| `style` | Formatting, whitespace, lint fixes (no logic change) |
| `perf` | Performance improvement |

### Scopes

| Scope | Covers |
|---|---|
| `templates` | Template files in `templates/` |
| `skills` | Skill definitions in `skills/` |
| `decisions` | Decision records in `docs/decisions/` |
| `ci` | CI/CD pipeline configuration |
| `pr` | The `/pr` skill specifically |
| `deps` | Dependency updates |

> **Tip:** When no scope fits, omit it: `fix: handle null response from upstream`.
> When a change genuinely spans multiple scopes, pick the primary one — do not concatenate (`templates+skills` is never valid).

### Prohibited Scope Patterns

These patterns are **never valid** as scopes. AI agents in particular tend to invent these — reject them in review.

| Anti-pattern | Why it's wrong | Use instead |
|---|---|---|
| Ticket IDs (`KB-123`) | Scopes describe *what*, not *which task* | The correct canonical scope |
| Pluralized duplicates (`tests`, `docs`) | Creates ambiguity with singular forms | `test`, `doc` |
| Synonym drift (`documentation` vs `doc`) | Fragments the log — pick one canonical name | The canonical scope from the table above |
| Concatenated scopes (`templates+skills`) | One commit, one scope — split the commit or pick the primary | The primary scope |
| Tool names (`markdownlint`) | Too granular — group by concern | `style`, `chore`, or `ci` |
| File names (`CHANGELOG.md`) | Too specific, doesn't generalize | The area the file belongs to |

### Subject Line Rules

1. **Imperative mood:** "add feature" not "added feature" or "adding feature"
2. **Lowercase:** no capital first letter
3. **No period** at the end
4. **≤80 characters** (enforced — see self-check below)
5. **No ticket IDs** in the subject line — the branch name already encodes the ticket
6. **Describe the change**, not the task: "add OAuth callback route" not "work on KB-123"

#### Subject Line Self-Check Protocol

This check is **not optional**. Run it before every commit:

```bash
echo -n "<type>(<scope>): <your subject> [ai:<agent>]" | wc -c
```

- If ≤80 → proceed
- If >80 → shorten the subject, re-run, repeat until ≤80

> **Why enforce this?** Long subjects wrap in `git log --oneline`, break notification previews, and make scanning history harder. The 80-char limit is a hard rule, not a suggestion.

### BAD vs GOOD Examples

```
# BAD
doc(templates): KB-31 add PR title convention section [ai:claude]      ← ticket ID in subject
Fix: Added new template support.                                       ← past tense, capital, period
doc(templates+skills): add PR title convention [ai:claude]             ← concatenated scope
refactor(documentation): rename sections                               ← synonym drift (use doc)

# GOOD
doc(templates): add PR title convention section [ai:claude]
fix: correct stale design-notes link in guidelines [ai:claude]
chore(ci): add semantic PR title workflow [ai:claude]
doc: update project setup guide with GitHub settings [ai:claude]
```

## Pre-Commit Workflow

1. **Complete your changes**
2. **Run all quality checks** (formatting, linting, type checking, tests, build)
3. **Fix any issues** that arise from quality checks
4. **Stage specific files**: `git add <file1> <file2>` — never `git add .` or `git add -A` blindly, as this risks staging secrets, build artifacts, or unrelated changes
5. **Run the subject line self-check** (see above)
6. **Commit with proper message format**
7. **Verify commit was signed**: `git log --show-signature -1`

## Scope Discipline

When working on a branch tied to a ticket, every change should fit the branch's stated purpose. Changes that don't fit fall into two categories:

### Category A — Opportunistic Feature/Code Work

Detected when a change touches files or functionality unrelated to the current branch's purpose (e.g. fixing an unrelated bug, adding a feature that belongs on a different ticket).

**What to do:**

- **Stop and surface it** before making the change
- Options: (a) continue on the current branch if the team agrees, (b) cut a new branch, (c) file a ticket and defer
- Never silently mix unrelated work into a branch — it makes review harder and reverts dangerous

### Category B — Agent/Process Meta-Corrections

Detected when a correction needs to be made to `AGENTS.md`, `CONTRIBUTING.md`, or other process documentation based on something learned during the current work.

**What to do:**

- Do it in place on the current branch — the correction must take effect immediately
- Isolate in its own commit with a `doc:` subject so the PR diff shows the mixing explicitly

**Why the distinction matters:** Category B corrections must take effect immediately — deferring them means working with broken instructions for the rest of the session. Category A has no such urgency and should always be routed properly.

## PR Title Convention

PR titles follow the same conventional-commit format as individual commits, with a ticket ID suffix for traceability:

```
<type>(<scope>): <subject> [TICKET-ID]
```

- **type** and **scope** — same rules as commits (see tables above)
- **subject** — value-oriented, distinguishing phrase first (see quality gate below)
- **`[TICKET-ID]`** — the Linear ticket ID in square brackets, e.g. `[KB-31]`. Auto-injected from the branch name by the `/pr` skill. Omit only for ad-hoc branches without a ticket.

### Examples

```
feat(skills): convention sync for downstream repos [KB-33]
fix(pr): HITL offers gh CLI commands for repo config [KB-31]
doc(templates): PR title convention with commit/PR layering [KB-31]
chore(ci): semantic PR title enforcement [KB-31]
```

### Why this format?

Individual commits and merged PRs serve different audiences in `git log`:

| Layer | Format | Ticket ID? | When visible |
|---|---|---|---|
| Individual commit | `type(scope): subject [ai:agent]` | No — branch encodes it | Always |
| Squash-merged PR | `type(scope): subject [TICKET-ID] (#N)` | Yes — for traceability | After squash-merge |

The ticket ID suffix is the visual signal that distinguishes a squash-merged PR from an individual commit when scanning `git log`. It also makes every merged PR traceable back to its Linear ticket without opening GitHub.

### CI enforcement

PR titles are validated by `amannn/action-semantic-pull-request` in `.github/workflows/lint-pr.yaml`.

## PR Merge Strategy

**Always use squash-merge** with "Pull request title" as the commit message source.

**Rationale:**

- Squash produces one clean commit per PR in `git log`, carrying the PR title format `type(scope): subject [TICKET-ID] (#N)`
- Every merged PR is traceable to its Linear ticket via the `[TICKET-ID]` suffix
- The PR title is the traceability surface — individual commits within a PR are development noise for this documentation-focused repo
- GitHub must be configured to use "Pull request title" (not "Commit message") as the squash commit subject — see `.github-settings.yaml`

When merging:

- Use squash-merge (GitHub's "Squash and merge")
- The PR title becomes the squash commit subject — keep it clean
- Delete the branch after merge

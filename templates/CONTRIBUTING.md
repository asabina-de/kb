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

### AI Co-authorship

Use both trailers on every AI-assisted commit. `Co-authored-by` works with GitHub today; `Assisted-by` is the emerging standard but forges don't render it yet. Using both ensures nothing is lost as tooling catches up:

```
Co-authored-by: Claude Code <noreply@anthropic.com>
Assisted-by: Claude:claude-opus-4-6
```

**`Co-authored-by:`** is the established Git/GitHub convention. GitHub renders it as a secondary author avatar on the commit. The email is a provenance marker, not a contact address — it follows GitHub's `noreply@` convention. Use `noreply@{provider-domain}` (e.g. `noreply@anthropic.com`, `noreply@openai.com`, `noreply@google.com`).

**`Assisted-by:`** is the emerging standard from the [Linux kernel guidelines](https://github.com/torvalds/linux/blob/master/Documentation/process/coding-assistants.rst#attribution). Format: `AGENT_NAME:MODEL_VERSION`. No email field — sidesteps the fake-email problem. Not yet widely supported by forges, but forward-compatible.

Once forges render `Assisted-by` natively, `Co-authored-by` can be dropped.

Both trailers survive squash-merge in the commit body, so provenance is preserved even when individual commits are collapsed.

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

<!-- PROJECT-SPECIFIC: populate this table with your project's canonical scopes -->

| Scope | Covers |
|---|---|
| _example: `api`_ | _API routes and controllers_ |
| _example: `db`_ | _Database migrations and queries_ |
| _example: `ui`_ | _Frontend components and styles_ |
| _example: `auth`_ | _Authentication and authorization_ |
| _example: `o11y`_ | _Observability: logging, metrics, tracing_ |
| _example: `ci`_ | _CI/CD pipeline configuration_ |
| _example: `deps`_ | _Dependency updates_ |

> **Tip:** When no scope fits, omit it: `fix: handle null response from upstream`.
> When a change genuinely spans multiple scopes, pick the primary one — do not concatenate (`providers+bot` is never valid).

### Prohibited Scope Patterns

<!-- PROJECT-SPECIFIC: add your project's known anti-patterns here -->

These patterns are **never valid** as scopes. AI agents in particular tend to invent these — reject them in review.

| Anti-pattern | Why it's wrong | Use instead |
|---|---|---|
| Ticket IDs (`Z-123`, `LIN-456`) | Scopes describe *what*, not *which task* | The correct canonical scope |
| Pluralized duplicates (`tests`, `docs`) | Creates ambiguity with singular forms | `test`, `doc` |
| Synonym drift (`telemetry` vs `o11y`) | Fragments the log — pick one canonical name | The canonical scope from the table above |
| Concatenated scopes (`api+db`) | One commit, one scope — split the commit or pick the primary | The primary scope |
| Tool names (`eslint`, `prettier`) | Too granular — group by concern | `style`, `chore`, or `ci` |
| File names (`config.ts`) | Too specific, doesn't generalize | The area the file belongs to |

### Subject Line Rules

1. **Imperative mood:** "add feature" not "added feature" or "adding feature"
2. **Lowercase:** no capital first letter
3. **No period** at the end
4. **≤80 characters** (enforced — see self-check below)
5. **No ticket IDs** in the subject line — the branch name already encodes the ticket
6. **Describe the change**, not the task: "add OAuth callback route" not "work on Z-123"

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
feat(bot): Z-528 add teardown events for session cleanup [ai:claude]   ← ticket ID in subject
Fix: Added new provider support.                                        ← past tense, capital, period
feat(providers+bot): add multi-provider routing [ai:claude]             ← concatenated scope
refactor(telemetry): rename spans                                       ← synonym drift (use o11y)

# GOOD
feat(bot): add teardown events for session cleanup [ai:claude]
fix: handle null response from upstream [ai:claude]
refactor(o11y): rename spans for consistency [ai:claude]
doc: add multi-account 1Password example to envrc template [ai:claude]
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
- **subject** — imperative mood, value-oriented, distinguishing phrase first. Same imperative voice convention as commits and ticket titles.
- **`[TICKET-ID]`** — the Linear ticket ID in square brackets, e.g. `[KB-31]`. Auto-injected from the branch name by the `/pr` skill. Omit only for ad-hoc branches without a ticket.

### Examples

```
feat(auth): enable Google login [KB-31]
fix: handle null response from upstream [KB-45]
doc: update contributing guide with PR title convention [KB-31]
chore(ci): enforce semantic PR titles [KB-31]
```

### Why this format?

Individual commits and merged PRs serve different audiences in `git log`:

| Layer | Format | Ticket ID? | When visible |
|---|---|---|---|
| Individual commit | `type(scope): subject [ai:agent]` | No — branch encodes it | Always |
| Merged PR (squash) | `type(scope): subject [TICKET-ID] (#N)` | Yes — for traceability | After squash-merge |
| Merged PR (merge commit) | `type(scope): subject [TICKET-ID] (#N)` | Yes — on merge commit | After merge-commit |

The ticket ID suffix is the visual signal that distinguishes a squash-merged PR from an individual commit when scanning `git log`. It also makes every merged PR traceable back to its Linear ticket without opening GitHub.

### CI enforcement

Repos using this convention should add the `amannn/action-semantic-pull-request` GitHub Action to validate PR titles on open/edit. See `templates/github-workflow-ci.yml` patterns and `.github/workflows/lint-pr.yaml` for a working example.

## PR Merge Strategy

**Always use merge commits** — never squash unless explicitly requested by the reviewer.

**Rationale:**

- Squash loses per-commit provenance — you can no longer see which commits were `[ai:claude]` vs human-authored
- Squash collapses the atomic commit history that was carefully structured during development
- Merge commits preserve the full trail for `git bisect`, `git blame`, and audit

When merging:

- Use the default merge commit strategy (`git merge --no-ff` / GitHub's "Create a merge commit")
- The PR title becomes the merge commit subject — keep it clean
- Delete the branch after merge

<!-- OPTIONAL APPENDIX: Uncomment if your project uses milestone-based development

## Appendix: Milestone Integration Branch Pattern

For projects that organize work into milestones (epics, releases, phases), use an integration branch strategy:

```
feature-branch → milestone-branch → main
```

### How it works

1. **Main** is always releasable
2. **Milestone branches** (e.g. `milestone/m3-auth-overhaul`) collect related work
3. **Feature branches** target the milestone branch, not main
4. Sub-issues of a milestone issue branch from and PR into the milestone branch
5. When the milestone is complete, the milestone branch PRs into main

### Why use this

- Keeps main stable while large multi-PR efforts are in flight
- Sub-issues can be reviewed and merged independently without destabilizing main
- The milestone PR into main serves as a final integration review

### Branch naming

```
milestone/<slug>           ← integration branch
vidbina/<ticket>-<slug>    ← feature branch targeting the milestone
```

-->

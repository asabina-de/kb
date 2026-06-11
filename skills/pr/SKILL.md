---
name: pr
description: "Use this skill when the user wants to create a pull request for the current branch. Trigger for prompts like 'create a PR', 'open a PR', 'make a pull request', 'pr this', 'ship it', or when the user invokes `/pr`. Also invoked by other skills (/pairprog, /troubleshoot) at wrap-up. The skill detects the correct base branch automatically — if the current branch is stacked on another feature branch rather than main, it uses that branch as the base. It reads the Linear ticket (if any) and recent commits to draft a title and body, pitches the draft in chat for the operator to review, and creates the PR via the GitHub MCP on approval. DX-first: fast, good defaults, minimal ceremony. Do NOT trigger for reviewing existing PRs, for merging, or for anything other than creating a new PR."
allowed-tools: Bash Glob Grep Read Agent AskUserQuestion mcp__claude_ai_Linear__get_issue mcp__claude_ai_Linear__save_issue mcp__claude_ai_Linear__list_comments mcp__github__list_pull_requests mcp__github__pull_request_read mcp__github__merge_pull_request mcp__github__update_pull_request mcp__github__search_repositories mcp__github__get_file_contents mcp__github__list_branches
---

# pr

Create a pull request. **Fast, good defaults, operator confirms before anything is created.**

The defining design principles:

> **DX-first.** Derive as much as possible automatically — base branch, title, body. The operator should need to type as little as possible.
>
> **Pitch before creating.** Always show the full draft in chat and get explicit approval. Never run `gh pr create` without confirmation.
>
> **Smart base for stacked PRs.** If the branch was cut from another feature branch (not main), use that branch as the base. Merging a stacked PR into main loses the stack structure.

## Phase 1 — Gather context

Run in parallel:

- **Branch:** `git branch --show-current`
- **Commits on branch:** `git log --oneline main..HEAD` (or `git log --oneline HEAD ^origin/main` if on remote)
- **Push state:** `git status -sb` — is the branch already pushed to origin?
- **Remote default branch:** use `mcp__github__get_file_contents` or `mcp__github__list_branches` to determine the default branch — don't hardcode `main`
- **Repo merge conventions:** Read `AGENTS.md` and `CONTRIBUTING.md` at the repo root (if they exist) for merge strategy guidance — e.g. squash vs merge commit, stack handling, branch cleanup. Store any findings for use in Phase 6.
- **Repo config:** Check for `.github-settings.yaml` at the repo root (see Phase 1.1 below).

Extract a ticket ID from the branch name if present (e.g. `vidbina/vid-123-some-slug` → `VID-123`). If found, fetch the Linear issue (`get_issue`) for title and description.

### Rename the session

After context is gathered, rename the session so the user can identify it at a glance (e.g. in a terminal tab). A good name includes the ticket number and a 2–4 word summary — e.g. "VID-662 rename titles (pr)".

If a tool or command is available to rename the session programmatically, use it. Otherwise, suggest the user rename it — but don't block on this. Move on to drafting either way.

### Phase 1.1 — Repo config check

Check for `.github-settings.yaml` at the repo root. This file declares the repo's intended GitHub settings so the skill can detect drift and guide first-time setup.

**If `.github-settings.yaml` exists:**

Read it and store the declared settings for use in Phase 6 (merge strategy). Compare against what's observable from the GitHub API (e.g. allowed merge methods via `mcp__github__search_repositories`). If a mismatch is detected, surface it as a warning in the Phase 4 pitch:

```
⚠️  Repo config drift detected:
  .github-settings.yaml says: default_method = "squash", squash_title = "pr_title"
  GitHub API says: squash merging is disabled
  → Fix in GitHub Settings > Pull Requests, or update .github-settings.yaml
```

Do not block on drift — warn and continue. The operator decides whether to fix it now or later.

**If `.github-settings.yaml` does not exist (first PR in an unconfigured repo):**

Surface a one-time setup prompt after the PR is created (Phase 5), not before — don't gate PR creation on repo config:

```
📋 This repo has no .github-settings.yaml. Want to set one up?
   This declares your merge mode, squash-merge title format, and branch protection
   expectations so the /pr skill can detect drift.

   (a) Generate from current GitHub settings — I'll read the API and draft it
   (b) Copy the template — you'll customize manually
   (c) Skip — not now
```

On (a): read the repo's current settings via the GitHub API, generate a `.github-settings.yaml` matching what's configured, and present it for approval. On (b): point to `templates/github-settings.yaml` in the kb repo. On (c): skip silently. Don't ask again in the same session.

**Schema reference (`templates/github-settings.yaml`):**

```yaml
merge:
  allowed_methods: [merge, squash, rebase]
  default_method: merge
  squash_title: pr_title
  delete_branch_on_merge: true

branch_protection:
  default_branch: main
  require_pr_reviews: true
  require_status_checks: true
```

Fields:
- `merge.allowed_methods` — which merge buttons are enabled on GitHub
- `merge.default_method` — which method is selected by default
- `merge.squash_title` — squash-merge commit title source: `"pr_title"` (recommended) or `"commit_message"` (GitHub's footgun default)
- `merge.delete_branch_on_merge` — auto-delete head branch after merge
- `branch_protection.default_branch` — the branch protection rules apply to
- `branch_protection.require_pr_reviews` — require PR review before merge
- `branch_protection.require_status_checks` — require CI to pass before merge

**HITL guardrail:** Repo-level changes (merge mode, branch protection) affect all contributors and cannot be scoped to a single PR. The skill handles these in three tiers:

1. **Default: suggest with `gh` CLI commands.** Present the drift finding and offer ready-to-run `gh` commands so the operator can copy-paste:
   ```
   ⚠️  Squash-merge title source is "commit_message" (GitHub default footgun).
       Expected: "pr_title" per .github-settings.yaml

   Fix:
     gh api repos/{owner}/{repo} -X PATCH -f squash_merge_commit_title=PR_TITLE
   ```
2. **On operator request: run the commands directly.** If the operator says "go ahead" or "fix it", the skill executes the `gh` commands itself. Use `AskUserQuestion` to gate — never auto-fix drift without explicit approval.
3. **Never silently modify.** Even in yolo mode, repo settings changes require an explicit gate. These are org-wide side effects, not branch-scoped changes.

## Phase 2 — Detect base branch

Find the correct base using this algorithm:

```bash
# All local branches that are ancestors of HEAD, ranked by closeness
git for-each-ref --format='%(refname:short)' refs/heads/ \
  | grep -v "$(git branch --show-current)" \
  | while read b; do
      if git merge-base --is-ancestor "$b" HEAD 2>/dev/null; then
        count=$(git log --oneline "$b"..HEAD | wc -l | tr -d ' ')
        echo "$count $b"
      fi
    done \
  | sort -n \
  | head -5
```

The branch with the **fewest commits between its tip and HEAD** is the most likely parent.

**Decision rules:**
- If the closest ancestor is the default branch (e.g. `main`) → normal PR, base = default branch.
- If the closest ancestor is another feature branch → stacked PR, base = that feature branch. Flag this clearly in the pitch: "This looks like a stacked PR — base set to `<parent-branch>`."
- If ambiguous (tie or no clear parent), default to the repo's default branch and note the ambiguity.

## Phase 3 — Draft

**Title:**
1. **Determine the type** from the nature of the change: `feat`, `fix`, `doc`, `refactor`, `chore`, `test`, `style`, or `perf` — same types as commit conventions in CONTRIBUTING.md.
2. **Determine the scope** (optional) from the primary area of the codebase affected.
3. **Draft the subject** — use the Linear ticket title as a starting point if available, otherwise derive from the branch name slug (strip the owner prefix and ticket ID, humanize the remainder). The ticket title is a starting point, not a passthrough — always run it through the quality gate (step 6) and rewrite if it doesn't meet PR title standards. Ticket titles follow the same imperative voice convention (see quality gate below), so they should already be close to PR-ready.
4. **Append the ticket ID** when one was detected from the branch name in Phase 1. Format: `[KB-10]` in square brackets at the end. This is required for traceability — merged commits produce `type(scope): subject [KB-10] (#N)`, preserving the Linear issue link in `git log`. Omit only for ad-hoc branches without a ticket.
5. **Assemble the title:** `type(scope): subject [TICKET-ID]`.
6. Run the title through the **title quality gate** below.

### Title quality gate

Evaluate the drafted title against these criteria. The gate is **advisory** — warn and suggest, never block.

> **Sync note:** This gate is mirrored in `/linearissue` (`skills/linearissue/SKILL.md`). If you change principles, anti-patterns, or examples here, check the other copy and keep them at parity. Some differences are intentional (brevity threshold is 60 chars here vs 72 for tickets; no branch-name-friendliness principle here) but the core principles and examples should match.

**Canonical structure:** PR subjects follow the same imperative voice as ticket titles and commit subjects: **`[VERB] [DIFFERENTIATING NOUN] [CONTEXT]`**. The `type(scope):` prefix categorizes the change — it doesn't replace the verb. The subject still needs an imperative verb that carries meaning.

**Verb tiers:**

1. **Preferred — scope-signaling verbs:** `Trial`, `Select`, `Survey`, `Fix`, `Extract`, `Enable`, `Enforce`, `Drop`, `Resolve`, `Ingest`, `Silence`.
2. **Allowed for task-framing:** `Add`, `Configure` — when no better verb fits.
3. **Banned — generic verbs:** `Implement`, `Build`, `Create`, `Set up`, `Wire up`, `Compose`, `Inject`, `Conduct`, `Redesign`.

**Principles:**
1. **Imperative voice with value framing** — the subject is a task phrased as an imperative verb + what it delivers. Choose verbs and nouns that communicate value, not implementation technique. "enable Google login" not "implement OAuth callback." The verb signals the kind of work; the noun names the value delivered.
2. **Distinguishing phrase first** — the most identifiable words lead, so truncated views stay meaningful.
3. **Brevity** — keep the **subject** (the part after `type(scope): ` and before ` [TICKET-ID]`) under 60 characters. Warn above 60. The type/scope prefix and ticket suffix are structural — they don't count against the limit.
4. **No metadata in the title** — priority, work type (spike, research), and category belong in labels, not bracket tags or prefixes.
5. **Out-of-context readability** — would someone scanning this title weeks later — or a newcomer — understand the value without the conversation that produced it? Self-check: "Is this a task someone does, or a fact someone reads?" If the latter, reframe as the task that produces that fact.

**Anti-patterns to detect:**
- **Banned verbs (anywhere in the title)** — `Implement`, `Build`, `Create`, `Set up`, `Wire up`, `Compose`, `Inject`, `Conduct`, `Redesign`. Tier 3 verbs that carry no scope information.
- **Mechanism verbs/phrases (anywhere, not just leading)** — "verified via", "implemented using", "configured with", "wired up through". These describe implementation technique, not value.
- **Statement titles** — titles that read as facts rather than tasks. "OAuth callback for Google login" is a statement; "enable Google login" is a task. Test: could this appear on a to-do list?
- **Bracket tags** — `[Research]`, `[Spike]`, `[WIP]` waste leading characters. Use labels instead.
- **"Explore/Research/Spike:" prefixes** — metadata that belongs in labels.
- **Parenthetical lists** — "(Meet, Zoom, WhatsApp)" add precision but kill readability. Use slash-separated inline.
- **Question-format titles** — "Does X expose Y?" belongs in the description.
- **Kitchen-sink titles** — "Improve X — reduce Y and explore Z" tries to do too much in one title.
- **Context-dependent titles** — titles that only make sense if you were in the conversation that produced them.

**Out-of-context failures (from audit):**

These titles all passed other checks (brevity, no brackets, no mechanism verbs) but fail the out-of-context test:

- "Own protocol types at pipecat boundary" — mechanism, no value visible to a cold reader
- "Daily chat frames for operator channel" — misleading, sounds like delivery but was actually a feasibility spike
- "Decouple frame routing from pipecat" — no reason to care without knowing the codebase
- "Codename alignment across codebase" — vanity, no real value delivered
- "Market data provider comparison for backtesting" — describes the artifact, not the outcome
- "Worklog cron silent during active flow" — mechanism-oriented, not value-oriented

**When the gate fires:**

If any issues are detected, draft a suggested rewrite alongside the original. Present both in the Phase 4 pitch so the operator can choose:

```
Title:     <original title>
Suggested: <rewritten title>  ← imperative, value-oriented
Warning:   <what triggered the gate — e.g. "banned verb 'Implement'", "67 chars (>60)">
```

**Examples (before → after):**
- "Wire up Logfire for APM and distributed tracing" → "enable Logfire APM and tracing"
- "Implement e2e tests: HTTP contract and Daily room verification" → "add e2e tests for /connect and Daily"
- "Explore service-level hooks for production frame-level observability" → "survey production frame-level o11y hooks"
- "Decouple FilterSink frame-type routing from pipecat string class names" → "decouple frame routing from pipecat"
- "Architectural spike: bot-as-participant in external video calls (Meet, Zoom, WhatsApp)" → "trial bot in Meet/Zoom/WhatsApp calls"
- "Market data provider comparison for backtesting" → "survey market data providers"
- "Worklog cron silent during active flow" → "silence worklog during active flow"

**Titles that pass (no rewrite needed):**
- "select auth provider" — imperative, clear scope (decision), distinguishing
- "allow bot to interrupt" — imperative, user-facing behavior, 4 words
- "fix duplicate disclosures on concurrent polls" — imperative, bug framing, specific
- "enforce semantic PR titles" — imperative, clear what it delivers

**Body:**
```markdown
## Summary
<2-4 bullet points — what changed and why, derived from commits and ticket description>

## Test plan
<bullet checklist of how to verify the change>

<Linear ticket link if available>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Derive the summary from commit messages and the Linear ticket description. Derive the test plan from the nature of the changes (e.g. "run tests", "manually verify X flow", "check CI passes").

## Phase 4 — Pitch in chat

Print the full draft before doing anything:

```
PR draft

Title:  type(scope): subject [TICKET-ID]
Suggested: type(scope): rewritten subject [TICKET-ID]  ← only if quality gate fired
Warning:   <what triggered>                             ← only if quality gate fired
Base:   <base-branch>  [stacked ⚠] or [default branch]
Branch: <current-branch>

Body:
---
<body>
---

Create this PR? yes / edit / cancel
```

If the title quality gate fired, the `Suggested:` and `Warning:` lines appear. The operator can accept the original, use the suggestion, or type their own via the `edit` flow. If no issues were detected, omit those lines.

Use `AskUserQuestion` to get the response. Options:
- **yes** → proceed to Phase 5
- **edit** → the operator pastes corrections; apply them and re-pitch
- **cancel** → stop, no PR created

## Phase 5 — Create

1. **Push if needed:** if the branch isn't on origin yet, run `git push -u origin <branch>`. Print the push result.
2. **Create:** use `gh pr create` via Bash with a heredoc body to preserve newline formatting:
   ```bash
   gh pr create --title "<title>" --base "<base>" --body "$(cat <<'EOF'
   <body content with real newlines>
   EOF
   )"
   ```
   **Do NOT use `mcp__github__create_pull_request` for PR creation.** The MCP tool escapes newlines as literal `\n` in the body parameter, producing a single-line wall of text on GitHub. This was observed on multiple PRs (yo-convo-bot#50, ivos-trades#4) and is a known limitation of how the MCP tool serializes multi-line strings. The `gh` CLI with heredocs preserves actual newlines. Other GitHub MCP tools (read, update, merge) are fine — the issue is specific to the `body` field on `create_pull_request`.
3. **Print the PR URL** from the `gh` output.
4. **Transition the ticket:** if a ticket ID was extracted from the branch name in Phase 1, call `save_issue` with `id: {ticket-id}` and `state: "In Review"`. This is unconditional — a PR being open means the work is ready for review.

## Phase 6 — Monitor CI

After the PR is created, launch a **background subagent** to monitor CI status. Do not suggest merging or offer to merge until CI results are in.

The subagent should:

1. **Poll CI checks** using `mcp__github__pull_request_read` periodically or `Bash` with `gh pr checks <pr-number> --watch` until all checks complete or a timeout (10 minutes) is reached.
2. **On all checks green:**
   - Report to the user: "CI passed on PR #N. Ready to merge."
   - Determine the merge strategy (see **Merge strategy** below).
   - Surface the strategy to the operator before executing. Never merge silently.
   - **After merge:** clean up and return to ready position:
     1. `git checkout main && git pull --ff-only`
     2. `git fetch --prune` — remove stale remote tracking refs
     3. `git branch -D <merged-branch>` — delete the local branch that was just merged. This is safe by construction (the skill just merged it). Use `-D` not `-d` because squash merges create new SHAs that git can't trace back to the original branch commits.
     4. Transition linked tickets to Done.
3. **On any check red:**
   - Report the failure: which check failed, link to the logs.
   - Fetch the failure details via `mcp__github__pull_request_read` and `Bash` with `gh run view <run-id> --log-failed` for actionable output.
   - Summarize what went wrong and suggest next steps (e.g. "lint failure in X — fixable here" or "test timeout — needs investigation").
   - Ask the user how to proceed: fix it now (resume pairprog), investigate further, or leave it for later.
4. **On timeout (no checks appear within 2 minutes):**
   - Report: "No CI checks have started on PR #N. This repo may not have CI configured for this path, or checks are queued."
   - Do not suggest merging.

**Key rules:**
- **Never suggest merging before CI results are known.** A freshly created PR has no check data — don't offer to merge it.
- The subagent runs in the background so the user can continue other work.
- If the user explicitly asks to merge before CI completes, warn them that checks haven't finished and confirm they want to proceed.

### Branch deletion safety

Before using `--delete-branch` on any merge, check whether the branch is the base of another open PR:

```bash
gh pr list --base <branch-being-merged> --state open --json number,title
```

- **If child PRs exist:** merge **without** `--delete-branch`. After the merge completes, retarget each child PR to the new base (typically `main` or the default branch), then delete the old branch manually:
  ```bash
  gh pr merge <pr-number> --squash  # or --merge, no --delete-branch
  gh pr edit <child-pr> --base main
  git push origin --delete <old-branch>
  ```
- **If no child PRs exist:** proceed with `--delete-branch` as normal.

**Never use `--delete-branch` when the branch is another PR's base.** GitHub auto-closes child PRs when their base branch is deleted, requiring a rebase and new PR to recover.

### Merge strategy

The skill must determine *how* to merge before offering the merge action. The decision tree:

```
1. Did Phase 1 find merge strategy guidance in AGENTS.md or CONTRIBUTING.md?
   YES → follow it (squash, merge commit, or rebase as documented)
   NO  → continue to step 2

2. Can the repo's merge method be detected from GitHub settings?
   (e.g. via mcp__github__search_repositories → allowed merge types)
   YES → use it as the default, but still surface to operator
   NO  → ask the operator: "No merge strategy documented. Squash, merge commit, or rebase?"
```

**When repo convention conflicts with best-practices** (e.g. convention says squash but the PR is part of a stack that would lose traceability), surface the conflict to the operator via `AskUserQuestion`. Never silently override the repo convention — and never silently follow it when it would cause harm. Present the trade-off and let the operator decide.

### Stack-aware merging

When the PR is part of a stack (base branch is another feature branch, not the default branch), the merge method determines the strategy:

**Squash-merge repos:**

Merge each PR in the stack individually, bottom-up. This is required because squash produces a new SHA — GitHub cannot detect that intermediate PRs' commits landed on the default branch via the tip's squash commit. Each PR must be squashed separately to preserve:
- Individual commit identity on the default branch (one squash commit per PR)
- Ticket ID traceability (each commit carries its own `TEAM-123: Title (#N)`)
- Linear issue auto-transition (each merged PR triggers its own `Closes TEAM-N`)

Flow for a stack `A → B → C → main`:
1. Squash-merge A **without** `--delete-branch` (B still uses A as its base).
2. Retarget B to main: `gh pr edit <B> --base main`. Rebase B onto main if needed.
3. Delete the old A branch: `git push origin --delete <A-branch>`.
4. Wait for CI on B if required. Squash-merge B without `--delete-branch` (C still uses B as its base).
5. Retarget C to main, delete old B branch, wait for CI, merge C **with** `--delete-branch` (no children left).

The key invariant: never delete a branch until all child PRs have been retargeted away from it.

**Merge-commit repos:**

Merging the tip is a valid optimization — since merge commits preserve ancestry, all intermediate commits appear in `git log` naturally. However, offer both options:

```
This PR is part of a stack (A → B → C → main).
Merge method: merge commit

Options:
  (a) Merge tip only (C) — one merge commit, A and B are ancestors ✓
      Retarget A and B to main first, then merge C with --delete-branch.
      Clean up A and B branches after.
  (b) Merge individually (A, then B, then C) — three merge commits
      Same retarget-before-delete discipline as squash flow.
  (c) Cancel

Recommend: (a) — all commits land on main via ancestry.
```

**Closing keywords for cross-platform traceability:**

When merging (especially in stacks), ensure the PR body includes closing keywords for both platforms:

- **GitHub PRs:** `Closes #41, #42` — closes other PRs in the stack (critical for squash merges where GitHub can't detect commit ancestry)
- **Linear issues:** `Closes KB-7, KB-8` — transitions linked Linear issues

Group by platform on separate lines for readability. GitHub parses `#N` (numeric only); Linear parses `TEAM-N` (prefixed). No collision risk — each platform ignores the other's syntax.

## Anti-patterns

- **Don't hardcode `main` as base.** Always detect the default branch and check for stacking.
- **Don't create the PR without pitching.** The operator must see and approve the draft.
- **Don't fabricate the test plan.** Derive it from the diff or say "verify manually" — don't invent test steps that don't exist.
- **Don't push without noting it.** If a push is needed, say so before running it.
- **Don't ask more than one round of questions.** All clarification happens in the pitch → edit loop, not via separate `AskUserQuestion` calls before Phase 4.
- **Don't suggest merging before CI is green.** A freshly created PR has no check data. Wait for the CI monitor subagent to report results before offering merge options.
- **Don't merge a stack tip with squash.** Squash-merging only the tip of a linear stack collapses N PRs into 1 commit — intermediate ticket IDs, PR boundaries, and review context are lost. For squash repos, always merge each PR individually, bottom-up.
- **Don't merge without surfacing the strategy.** Always tell the operator what merge method and stack handling you're about to use, and wait for confirmation. Never silently default.
- **Don't `--delete-branch` when child PRs exist.** Always check `gh pr list --base <branch> --state open` before deleting. Retarget children first, then delete. Violating this auto-closes child PRs on GitHub.

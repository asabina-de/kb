---
name: commit
description: "Use this skill when the user asks for a commit message suggestion, staging advice, or guidance on how to structure a commit — or when the user invokes `/commit`. Trigger for prompts like 'suggest a commit message', 'commit', 'what should I commit this as', 'draft a commit', 'write a commit message for this', 'should I split this commit', 'what type/scope should I use', 'should I amend or make a new commit'. The skill owns the full commit unit: message drafting, type/scope selection, atomicity checks, staging guidance, and amend-vs-new decisions. It reads the repo's own docs (CONTRIBUTING.md, AGENTS.md, README.md) and the org knowledge base (via `./kb` or `./knowledge-base` symlink if present) for commit conventions, inspects the uncommitted diff and recent git history, and prints actionable guidance in chat. It never commits, stages, or modifies files in normal mode. It also has a setup mode (`--setup`) that inspects git history, repo docs, and the org kb to draft or update the commit convention section in the repo's docs — run this once per repo to bootstrap the convention. Do NOT trigger for actually committing (the user runs git commit themselves), for amending or rebasing (those are direct git operations), for generating changelogs or release notes (different task), or for reviewing code (use a review skill or do it directly)."
api_description: "Guide the full commit unit: message drafting, type/scope selection, atomicity checks, staging advice, and amend-vs-new decisions — all following the repo's documented conventions. Reads CONTRIBUTING.md, recent git history, and any org knowledge base. Never commits, stages, or modifies files."
allowed-tools: Bash Glob Grep Read Write Edit AskUserQuestion
---

# commit

Guide the **full commit unit** — message drafting, type/scope selection, atomicity checks, staging advice, and amend-vs-new decisions — following the conventions documented in the repo itself.

The defining design principles of this skill are:

> **The repo's own docs are the source of truth for commit conventions.** The skill reads CONTRIBUTING.md, AGENTS.md, README.md — wherever the repo documents its convention. It does not hardcode any format. When CONTRIBUTING.md defines types and scopes, those are canonical — the skill enforces them rather than inventing alternatives.
>
> **Convention health matters.** If the repo's convention docs are missing, incomplete, or contain guidance that conflicts with best practices, the skill escalates to the operator rather than silently working around it. The goal is to improve the repo's conventions over time, not just comply with whatever exists.
>
> **The whole commit, not just the message.** The skill checks staging state, detects multi-concern diffs, advises on amend-vs-new, and guides type/scope selection — all before drafting the message. A good commit message on a bad commit is still a bad commit.
>
> **Output only.** In normal mode, the skill prints guidance and a suggested commit message in chat. No staging, no committing, no file writes. Git is HITL.
>
> **Setup bootstraps the convention into the repo's docs.** The `--setup` mode inspects git history, existing docs, and the org kb to draft the commit convention section. Run once per repo, then normal mode reads what setup wrote.

## Normal mode (default)

### Step 1 — Find the convention

Search for commit convention documentation. Check these sources in order, collecting guidance from all that exist (later sources add context, they don't override earlier ones):

1. **Repo docs (primary):**
   - `CONTRIBUTING.md` — a "Commit" or "Commit Messages" or "Commit Strategy" section
   - `CLAUDE.md` / `AGENTS.md` — a "Commit Strategy" or "Commit" section
   - `README.md` — a "Commit Standards" or "Contributing" section that mentions commits
   - `.github/CONTRIBUTING.md` or `docs/CONTRIBUTING.md`

2. **Org knowledge base (supplementary):** Check for a `./kb` or `./knowledge-base` symlink at the repo root. This is the org convention for providing AI tooling access to the shared engineering handbook. If present, read:
   - `{kb-symlink}/templates/AGENTS.md` — the "Commit Strategy" section
   - `{kb-symlink}/templates/README.md` — the "Commit Standards" section

   Where `{kb-symlink}` is whichever of `./kb` or `./knowledge-base` exists (check `./kb` first).

   If neither symlink exists, that's fine — the repo's own docs are sufficient. Setting up the kb symlink is a human operation; the skill never creates it.

3. **Git history (implicit convention):** `git log --oneline -20` — if the docs are sparse, the recent commit history itself reveals the de facto convention (prefixes in use, tag patterns, message length norms).

If none of these sources contain commit convention guidance, warn the user:

> No commit convention found in this repo's docs. Run `/commit --setup` to bootstrap one from git history and the org kb, or I'll fall back to describing the changes without a specific format.

Proceed with a plain descriptive message if the user doesn't want to set up.

#### Convention health check

After loading the convention, evaluate it for completeness and quality. Escalate to the operator when:

- **CONTRIBUTING.md or AGENTS.md is missing entirely** — the repo has no documented commit convention. Suggest running `/commit --setup` to bootstrap one.
- **Types or scopes are undocumented** — the convention exists but doesn't define which types/scopes are valid. Flag this: "Your CONTRIBUTING.md has a commit section but doesn't list valid types/scopes. Want me to add them based on git history?"
- **Convention conflicts with best practices** — e.g., the docs say to use past tense ("added feature") when conventional commits use imperative ("add feature"), or the docs allow concatenated scopes. Flag the specific issue and suggest a fix rather than silently complying.
- **Repo convention diverges from org kb** — if the org kb is available and its convention differs from the repo's, flag the divergence. The repo's convention wins (it's closer to the code), but the operator should know about the drift.

The goal is to surface these issues once so the operator can fix them — not to nag on every invocation. If you flagged an issue and the operator said "leave it," respect that for the rest of the session.

### Step 2 — Read the diff and check staging

Run via `Bash`:

- `git status` — to see what's staged vs unstaged, untracked files
- `git diff --cached` — staged changes (this is what `git commit` will include)
- `git diff` — unstaged changes (flag these as not-yet-staged)
- `git log --oneline -10` — recent commits for style continuity

#### Staging guidance

Before analyzing the diff content, check the staging state and advise:

- **Nothing staged at all:** Note this and base the suggestion on the full uncommitted diff (`git diff` + untracked). Tell the user what to stage: list the specific files with `git add <file1> <file2> ...` commands they can copy. Never suggest `git add .` or `git add -A` — these risk staging secrets (`.env`), build artifacts, or unrelated changes.
- **Everything staged via `git add .`:** If the staged diff contains files that look unrelated to each other (e.g., a feature file and an unrelated config fix), flag it: "These staged changes look like they span multiple concerns. Consider unstaging with `git reset HEAD <file>` and committing in separate passes."
- **Mix of staged and unstaged:** Call out which changes are staged (will be committed) and which aren't. If unstaged changes look like they belong with the staged ones, suggest adding them. If they look unrelated, note that they'll be left behind — which is correct.
- **Untracked files:** If untracked files look related to the staged work (e.g., a new test file for a new module), suggest staging them. If they look unrelated, ignore them.

### Step 3 — Analyze and check atomicity

Analyze the changes (staged, or full diff if nothing staged):

- **What changed:** files touched, nature of the changes (new feature, bug fix, refactor, docs, chore, test, etc.)
- **Why it changed:** infer from the diff context, variable names, comments, test names. If the "why" isn't clear from the diff alone, say so rather than fabricating intent.

#### Atomicity check

Before drafting a message, check whether the changes belong in a single commit:

- **Single concern:** All changes serve one logical purpose (a feature + its tests, a refactor across files, a config change + its docs). Proceed to draft one message.
- **Multiple concerns detected:** The diff contains unrelated changes that should be separate commits. Signs:
  - Files in different modules with no shared purpose
  - A bug fix mixed with a feature addition
  - A formatting/style change mixed with a logic change
  - Dependency updates mixed with code changes

  When detected, suggest splitting. Print a concrete plan:

  ```
  This diff spans multiple concerns. Suggested split:

  Commit 1 — fix: correct null check in auth middleware
    git add src/middleware/auth.ts src/middleware/__tests__/auth.test.ts

  Commit 2 — chore(deps): bump express to 4.19
    git add package.json package-lock.json
  ```

  Provide a draft message for each proposed commit. The user decides whether to split or commit as-is.

- **Implementation + tests:** These belong together in one commit. A test file for the module being changed is part of the same concern, not a separate one.
- **Code + docs for the same change:** These belong together. If a feature adds an env var and the README documents it, that's one commit.

### Step 4 — Select type and scope

Derive the type and scope from the diff, guided by the convention found in Step 1.

#### Type selection

Match the nature of the change to the convention's type list. When the type isn't obvious:

- **feat vs fix:** Does the change add a new capability (feat) or correct existing broken behavior (fix)? If existing behavior works but is being improved, that's `feat` or `refactor`, not `fix`.
- **refactor vs feat:** Does the change alter external behavior? If yes, `feat` (or `fix`). If the behavior is identical but the implementation changed, `refactor`.
- **doc vs chore:** Pure documentation is `doc`. Build/CI/tooling config is `chore`. A docs update that accompanies a code change isn't a separate `doc` commit — it's part of the code commit.
- **style vs refactor:** If only whitespace/formatting changed with zero logic difference, `style`. If the code structure changed (even if behavior didn't), `refactor`.

#### Scope selection

If the convention defines scopes (e.g., a table in CONTRIBUTING.md), those are canonical — use them:

- Match the primary area of the change to the scope table.
- If the change spans multiple scopes, pick the primary one. Never concatenate scopes.
- If no scope fits, omit it rather than invent one.
- **Missing scope:** If the change clearly belongs to an area that *should* have a scope but the convention doesn't list one, flag this to the operator: "This change affects `{area}` but CONTRIBUTING.md doesn't list a scope for it. Suggest adding `{proposed-scope}` to the scope table?" This is how the convention grows organically — the skill notices gaps and proposes amendments rather than silently inventing ad-hoc scopes.

If the convention doesn't define scopes at all, derive from the primary directory or module. Note this to the user as an implicit scope.

### Step 5 — Decide amend vs new commit

Before drafting, check whether this should be a new commit or an amend:

- **Default: new commit.** Every change gets its own commit. This is the safe default that preserves history and makes review easier.
- **Amend only when explicitly instructed.** The skill never suggests `--amend` on its own. Amending rewrites history — on shared branches it requires force-pushing, which is destructive.
- **If the user asks about amending:** Evaluate and advise:
  - **Safe to amend:** The commit being amended is the tip of a local branch that hasn't been pushed. No one else has built on it. Inform the user: "Safe to amend — this commit hasn't been pushed yet."
  - **Risky to amend:** The commit has been pushed or is not the tip. Warn: "This commit is already pushed. Amending will require `--force-with-lease` on the remote. Consider adding a new commit instead."
  - **Never amend:** The commit is on `main`/`master` or a shared branch. Refuse: "Don't amend commits on shared branches. Add a new commit."

### Step 6 — Draft the message

Apply the convention found in Step 1 to format the message using the type and scope from Step 4.

If the convention specifies:
- A prefix format (e.g., `feat:`, `fix:`) — use the type from Step 4
- A scope — use the scope from Step 4 (or omit if none fits)
- A tag (e.g., `[ai:claude]`) — include it
- A max length — respect it. Run the subject line self-check if the convention requires it.
- A body/footer structure — follow it

**Body:** Explain *why*, not *what*. The diff shows what changed. If the "why" isn't clear from the diff alone, say so: "The intent isn't clear from the diff — you may want to add context in the commit body."

**AI co-authorship trailers:** Always include provenance trailers, regardless of whether the repo convention specifies them. If the convention documents a specific trailer format, use it. Otherwise, default to both the established and emerging standards:

```
Co-authored-by: Claude Code <noreply@anthropic.com>
Assisted-by: Claude:claude-opus-4-6
```

`Co-authored-by` is the GitHub-native convention (renders as a secondary author avatar). `Assisted-by` is the emerging standard from the Linux kernel guidelines. Using both ensures nothing is lost as tooling catches up.

Print the suggested message in a fenced code block so the user can copy it.

If Step 3 recommended splitting, provide a message for each proposed commit.

### Step 7 — Done

No further action. The user copies the message and runs `git commit` themselves.

## Setup mode (`--setup`)

Triggered when the user passes `--setup` or says something like "set up commit conventions for this repo."

### Step 1 — Inspect existing state

In parallel:

- **Git history:** `git log --oneline -50` — look for patterns: conventional commits, prefixes, tags, co-author lines, scope usage, message length
- **Repo docs:** read CONTRIBUTING.md, CLAUDE.md, AGENTS.md, README.md for any existing commit guidance
- **Org kb:** check for `./kb` or `./knowledge-base` symlink. If present, read `templates/AGENTS.md` and `templates/README.md` for the org-level commit convention. If absent, mention that the org convention is to symlink `./kb` or `./knowledge-base` → the shared kb repo, but setting that up is the user's responsibility — the skill never creates symlinks.

Synthesize: what convention is the repo already following (even if undocumented)? Does it match the org kb template? Are there inconsistencies?

### Step 2 — Draft the convention

Print the proposed convention section in chat. This should cover:

- **Format:** the commit message structure (prefix, scope, subject, body, footer)
- **Prefixes:** which ones are used and what they mean
- **Tags:** any AI attribution tags
- **Co-authorship:** how to attribute AI-assisted commits
- **Length limits:** subject line max, body wrapping
- **Multi-concern rule:** one commit per logical change

Base this on what the git history actually shows, reconciled with the org kb if available. If the org kb has a convention and the repo doesn't, propose adopting the org convention. If the repo has a convention that diverges from the org kb, flag the divergence for the user to resolve.

### Step 3 — Confirm and write

Use `AskUserQuestion` to confirm:

- **Where to write:** CONTRIBUTING.md (create or append section) / AGENTS.md (append section) / README.md (append section) / Other
- **Content looks good?** with the drafted section shown in chat

On confirmation, write or append the section to the chosen file via `Write` or `Edit`.

### Step 4 — Done

Print the path written and suggest a commit message for the convention documentation itself.

## Anti-patterns

- **Don't hardcode a commit format.** The convention lives in the repo's docs. If there's no convention, say so — don't silently impose one.
- **Don't commit or stage.** The skill outputs text and guidance. Git operations are HITL.
- **Don't modify files in normal mode.** Only `--setup` writes to the repo.
- **Don't fabricate intent.** If the "why" behind a change isn't clear from the diff, say "the intent isn't clear from the diff — you may want to add context in the commit body" rather than guessing.
- **Don't suggest `--amend` unprompted.** New commit is always the default. Only discuss amend when the user explicitly asks.
- **Don't invent scopes.** If the convention defines scopes, those are canonical. If none fits, omit rather than invent. If a scope *should* exist, suggest adding it to CONTRIBUTING.md — don't use it ad-hoc.
- **Don't suggest `git add .` or `git add -A`.** Always suggest specific files by name. Blanket staging risks secrets, artifacts, and unrelated changes.
- **Don't silently comply with bad conventions.** If CONTRIBUTING.md says something that conflicts with best practices (past tense subjects, concatenated scopes), flag it to the operator. The goal is to improve the convention, not just follow it.
- **Don't hardcode the kb path.** The org kb is discovered via `./kb` or `./knowledge-base` symlink, not via an absolute path. If the symlink isn't there, the kb isn't available — don't go hunting.
- **Don't nag about convention issues.** Flag a convention problem once per session. If the operator acknowledges it and says "leave it," respect that.

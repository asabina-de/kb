# Changelog

All notable changes to the KB templates are documented in this file.

This project ships continuously — there are no versioned releases. Each entry is dated when it merges to main. Downstream repos can scan by date to discover what changed since they last synced.

Format follows [Keep a Changelog](https://keepachangelog.com/), with an added **Migration** section for template changes that require action in downstream repos.

**Migration instructions are stateless.** If you see the described artifacts in your project, the migration applies to you — no need to know which "version" you're on.

---

## [2026-06-11]

### Added
- **`.github/workflows/lint-pr.yml`** — CI enforcement of PR title format using `amannn/action-semantic-pull-request`. Validates `type(scope): subject [TICKET-ID]` against conventional commit types from CONTRIBUTING.md. Uses `pull_request` trigger (not `pull_request_target`) since this repo has no fork contributions.
- **`templates/github-settings.yaml`** — declares intended GitHub repo settings (merge mode, squash-merge title source, branch protection) so the `/pr` skill can detect configuration drift.
- **PR Title Convention section** in `templates/CONTRIBUTING.md` — documents the `type(scope): subject [TICKET-ID]` format, with a table showing how individual commits and merged PRs layer differently in `git log`.

### Changed
- **`/pr` skill** — title assembly now generates `type(scope): subject [TICKET-ID]` instead of `TICKET-ID: title`. Quality gate brevity limit (60 chars) now applies to the subject only; type/scope prefix and ticket suffix are excluded as structural overhead. New Phase 1.1 checks for `.github-settings.yaml` and surfaces drift warnings or a guided first-time setup flow.

### Migration

**If your project uses the `/pr` skill:**

PR titles will change from `KB-10: Title` to `type(scope): title [KB-10]`. No action needed — the skill handles this automatically. Existing PRs are unaffected.

**To add PR title CI enforcement to your repo:**

1. Copy `.github/workflows/lint-pr.yml` to your repo
2. Customize the `types` list if your project uses different conventional commit types
3. Optionally add a `.github-settings.yaml` at your repo root (copy from `templates/github-settings.yaml` and adjust)

## [2026-06-10]

### Changed
- **GUIDELINES.md template** — removed stale `design-notes/` link from "Related Documentation" footer. Updated `decisions/` description to reflect unified format.
- **PROJECT_SETUP_GUIDE.md** — added AGENTS.md (with CLAUDE.md/GEMINI.md symlinks) to documentation copy commands. Decision record example updated to MADR serial-numbered format. All `cp` paths now use `<path-to-kb>` placeholder instead of hardcoded relative paths.

### Migration

**If your `docs/GUIDELINES.md` references `design-notes/`:**

1. Remove the `design-notes/` line from the "Related Documentation" section at the bottom of the file
2. Optionally update the `decisions/` description to: `Decision records (exploration through to decided)`

## [2026-06-05]

### Added
- **`skills/` directory** — engineering skills (commenting, commitmsg, designnote, linearissue, pairprog, pr) migrated from dotfiles to KB repo. Skills that read/write KB-defined artifacts now co-evolve with those artifacts.
- **Slug generation protocol** — documented in the designnote skill. Deterministic heuristic for generating decision record filenames.

### Changed
- **designnote skill** — now targets `docs/decisions/` with MADR-style serial numbering (`nnnn-slug.md`), new frontmatter schema (`status`, `decision`, `review_date`, `related_to`, `supersedes`), and unified sections (Context, Exploration, Decision, Consequences, Confirmation).
- **linearissue skill** — filing mode now reads `docs/decisions/` records. Verification uses frontmatter `status: exploring` instead of filename state tokens.

## [2026-06-05]

### Changed
- **`.envrc` template** — renamed from `.envrc.example` to `.envrc`. The file is now committed directly to repos (no copy step). It contains only direnv/devenv boilerplate — no secrets. Secrets remain in `.envrc.local` (gitignored).
- **`.gitignore` template** — `.envrc` removed from gitignore entries. Only `.envrc.local` and `.env*` secret files are gitignored.
- **PROJECT_SETUP_GUIDE.md** — environment setup simplified: one fewer copy step, explicit note that `.envrc` is committed.

### Migration

**If your project gitignores `.envrc`:**

1. Remove `.envrc` from your `.gitignore`
2. Commit your existing `.envrc` file: `git add .envrc && git commit -m "chore: track .envrc (no secrets, devenv boilerplate only)"`
3. Verify `.envrc.local` is still gitignored (it holds secrets)
4. Remove `.envrc.example` if present — it is no longer needed: `git rm .envrc.example`

## [2026-06-05]

### Added
- **CHANGELOG.md template** — new file at `templates/CHANGELOG.md`. Rolling dated entries, stateless migration instructions, per-logical-change granularity. Adapted for continuous delivery repos without versioned releases.

### Changed
- **decisions/ directory** — `templates/decisions/` and `templates/design-notes/` consolidated into a single `decisions/` directory with a unified format. Records use MADR-style serial numbering (`nnnn-slug.md`), enriched YAML frontmatter (`status`, `decision`, `review_date`, `related_to`, `supersedes`), and five sections: Context, Exploration, Decision, Consequences, Confirmation.
- **Decision template** — `YYYY-MM-DD.TODO.decision-template.md` replaced by `0000-decision-template.md`.
- **AGENTS.md template** — documentation workflow now references `docs/decisions/` instead of dual-directory structure. Commit strategy delegates to CONTRIBUTING.md. HITL language strengthened. AI provenance section added.
- **PROJECT_SETUP_GUIDE.md** — setup commands no longer copy `design-notes/`.

### Removed
- **templates/design-notes/** — directory removed. The `decisions/` directory absorbs the full lifecycle from exploration to settled decision.

### Migration

**If you have `docs/design-notes/` in your project:**

1. Create `docs/decisions/` if it doesn't exist
2. Move each file from `docs/design-notes/` into `docs/decisions/` with serial numbering:
   ```bash
   git mv docs/design-notes/YYYY-MM-DD.STATE.topic.md docs/decisions/NNNN-topic.md
   ```
3. Update each file's frontmatter to the new schema:
   ```yaml
   ---
   title: "..."
   tags: [...]
   status: exploring | decided | superseded | deprecated
   decision: ""
   review_date: YYYY-MM-DD
   related_to: []
   supersedes: ""
   ---
   ```
4. Rename section headings: `Recommendation` → `Decision`. Add `## Consequences` and `## Confirmation` sections if missing.
5. Remove `docs/design-notes/` after all files are moved.

**If you have `docs/decisions/` with the old template (`YYYY-MM-DD.decision-title.md`):**

1. Rename files to serial format: `git mv YYYY-MM-DD.decision-title.md NNNN-decision-title.md`
2. Update frontmatter to the new schema (see step 3 above)
3. Rename `## Rationale` → `## Decision` (move the rationale into the body of the Decision section)
4. Add `## Confirmation` section

**If your AGENTS.md references `DECISIONS.md` or dual-directory structure:**

1. Replace `DECISIONS.md` references with `docs/decisions/` and the grep pattern:
   ```
   grep -E "^(status|decision):" docs/decisions/*.md
   ```

## [2026-06-04]

### Added
- **CONTRIBUTING.md template** — new file at `templates/CONTRIBUTING.md`. Owns commit conventions, scope discipline (Category A/B), prohibited scope patterns, subject-line self-check protocol, PR merge strategy, and milestone integration branch pattern (optional appendix).
- **AI Provenance section** in `templates/AGENTS.md` — commit tags and comment prefixes for AI-authored contributions.
- **HITL language** in `templates/AGENTS.md` — explicit "never create commits, push branches, or open/merge PRs unless asked" framing.

### Changed
- **AGENTS.md template** — commit strategy section now delegates to CONTRIBUTING.md as canonical source. Pre-commit workflow uses `git add <file>` instead of `git add .`.
- **PROJECT_SETUP_GUIDE.md** — setup commands now include copying CONTRIBUTING.md to repo root.
- **Symlink documentation** — AGENTS.md now notes that CLAUDE.md and GEMINI.md are symlinks.

### Migration

**If your project has no CONTRIBUTING.md:**

1. Copy `templates/CONTRIBUTING.md` to your repo root
2. Populate the scopes table with your project's canonical scopes
3. Populate the prohibited scope patterns with any project-specific anti-patterns

**If your AGENTS.md has an inline Commit Strategy section:**

1. Replace it with the delegation pointer from the updated `templates/AGENTS.md`:
   ```
   > **Read `CONTRIBUTING.md` before drafting or making any commit.**
   ```
2. Add the AI Provenance section from the updated template

**If your pre-commit workflow uses `git add .`:**

1. Replace with `git add <file1> <file2>` — never `git add .` or `git add -A`

# Changelog

All notable changes to the KB templates are documented in this file.

This project ships continuously — there are no versioned releases. Each entry is dated when it merges to main. Downstream repos can scan by date to discover what changed since they last synced.

Format follows [Keep a Changelog](https://keepachangelog.com/), with an added **Migration** section for template changes that require action in downstream repos.

**Migration instructions are stateless.** If you see the described artifacts in your project, the migration applies to you — no need to know which "version" you're on.

---

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

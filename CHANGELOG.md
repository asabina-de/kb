# Changelog

All notable changes to the KB (knowledge base) conventions are documented in this file.

This project ships continuously — there are no versioned releases. Each entry is dated when it merges to main. Downstream repos can scan by date to discover what changed since they last synced.

Format follows [Keep a Changelog](https://keepachangelog.com/), with an added **Migration** section for changes that require action in downstream repos.

**Migration instructions are stateless.** If you see the described artifacts in your project, the migration applies to you — no need to know which "version" you're on.

### Writing migration entries

A convention change affects **resources** — anything that must be updated to achieve parity. Resources are not limited to files in the repo. They include anything the changed code or convention *expects to exist and behave a certain way*.

When writing a migration entry, infer the affected resources from the change itself: what does this change assume about the world? Those assumptions are your resource list. Group migration steps by resource type so readers can route each step to the right person or tool.

Common resource types (not exhaustive — infer from context):

- **Files** — templates, configs, workflows, skill definitions, documentation
- **Repo settings** — merge mode, branch protection, squash title format (GitHub Settings)
- **Tickets** — existing backlog titles, descriptions, DoDs, scope, breakdown
- **CI/CD** — pipeline configs, check requirements, environment variables
- **Infrastructure** — service configs, secrets, env vars, deployment settings
- **Database** — schema migrations, seed data, connection strings
- **Observability** — dashboards, alerts, log schemas, metric definitions
- **External services** — API keys, webhook registrations, platform configs

Tag manual-only steps with **(manual)** so readers know an agent can't automate them:

```markdown
**Repo settings (manual):**
- Set squash-merge title source to "Pull request title" in GitHub Settings > Pull Requests
```

---

## [2026-07-22]

### Changed

- **Env-management docs reconciled to a single mechanism** (KB-110) — the KB documented two conflicting env paths: a `.env.example` → `.env` copy step and the `direnv → devenv` (`.envrc` + `.envrc.local`) pattern. The `.env` path was a dead trap — the committed `.envrc` sources `.envrc.local` and runs devenv but never sources `.env`, so a copied `.env` activated nothing unless the (forbidden) `dotenv.enable = true` was set. Downstream repos inherited broken setups (Z-615). There is now one canonical mechanism: committed `.envrc` + `.envrc.local`, activated by `direnv allow`. `README.md`, `PROJECT_SETUP_GUIDE.md`, and `templates/README.md` now state that `.env` is not part of the pattern (framework-native `.env` stays out of scope) and document the `direnv allow` prerequisite.

### Removed

- **`templates/.env.example`** — deleted. It instructed copying itself to `.env`, which the pattern never loads. Its cross-reference in `.envrc.local.example` and its committed-file entry in `.gitignore.example` were removed too. `.env*` stays gitignored (safety net for frameworks that read `.env` natively), now with a note that direnv does not load it.

### Migration

**Files:**

- If your repo has a committed `.env.example` used as an env-setup step, remove it: `git rm .env.example`. The `direnv → devenv` pattern never loads `.env`. Move any real values into `.envrc.local` (secrets / dynamic values via `$(op read …)`) or `devenv.nix` (shared, non-secret team variables).
- Confirm `.envrc` is committed (not gitignored) and run `direnv allow` in the project root — without it, the environment does not activate.
- If you vendor the KB templates, re-sync `templates/.gitignore.example` and `templates/.envrc.local.example` — the `.env.example` committed-file line and the `use .env instead` cross-reference were dropped; `.env*` remains ignored with an explanatory note.
- If you vendor the KB `README.md` / `PROJECT_SETUP_GUIDE.md` env sections, re-sync them — additive scoping notes clarifying `.env` is not loaded and that `direnv allow` is required.

## [2026-07-15]

### Changed

- **`/pair` + `/pr` skills — honest draft/ready PR lifecycle** (KB-106, KB-12) — the ticket's "In Review" status now tracks the PR's draft state. `/pr` transitions to In Review only when the PR is opened **ready**, not as a draft (KB-12); `/pair` wrap-up **flips a completed draft PR to ready** (`gh pr ready`) and transitions to In Review at that point (KB-106). A finished branch's PR no longer sits stuck in Draft, and a WIP draft no longer falsely signals "ready for review."

### Migration

**Files:**

- Re-sync `skills/pair/SKILL.md` and `skills/pr/SKILL.md` if your repo vendors the KB skills — additive behavior on the draft/ready lifecycle.

## [2026-07-13]

### Added

- **`/pair` skill — readiness gate at pickup** (KB-97) — an advisory Definition-of-Ready check (the same five checks as the `/issue` scope gate) run when `/pair` picks up a ticket: it flags a not-ready ticket — or one in the `Icebox` / `Needs Scoping` status — before work starts, and offers to bounce it to `Needs Scoping`. Never blocks. Part of the readiness family (`docs/decisions/0005`).
- **`/decision` skill — graduation gate at wrap-up** (KB-98) — an advisory readiness check surfaced when `/decision` wraps up, flagging a record that would graduate `exploring → decided` prematurely. Decision-adapted (open-questions-resolved · pull-not-push · evidence-sufficient · blast-radius/LRM) — the decidedness sibling of the `/issue` and `/pair` gates. The skill never graduates records itself (HITL); it only advises.

### Migration

**Files:**

- Re-sync `skills/pair/SKILL.md` if your repo vendors the KB skills — additive (new Phase 1 subsection + one anti-pattern); no other behavior changed.
- Re-sync `skills/decision/SKILL.md` — additive (Phase 7 graduation gate + one anti-pattern).

## [2026-07-11]

### Added

- **`/issue` skill — scope gate** (KB-92) — an advisory gate (never blocks) that flags _well-formed but premature_ tickets, which the title and DoD-presence checks miss. Five checks keyed on dependency clarity (pull-not-push lead); on a fire, offers file · park · defer. Rationale, the checklist, and the IDT-2 red case live in the skill's `## Scope gate` section.

### Migration

**Files:**

- Re-sync `skills/issue/SKILL.md` if your repo vendors the KB skills — additive; no other skill behavior changed.

## [2026-07-08]

### Fixed
- **`.github/workflows/lint-pr.yaml` — ticket-ID check was a no-op** — the previous `subjectPattern` (`^.+(\s\[[A-Z]+-\d+\])?$`) put the ticket-ID group behind an optional quantifier after `^.+`, so every non-empty subject passed. The [2026-06-11] claim that the workflow "validates `type(scope): subject [TICKET-ID]`" was never true (KB-81; observed downstream as ivos-trades PRs merging with no ticket ID and nothing firing). The pattern now requires the subject to end with `[TICKET-ID]`. **Escape hatch:** a PR that legitimately has no ticket declares `[noticket]` (or `[noissue]`) in the PR *description body* — the ID requirement is lifted while type/scope validation still applies. The marker lives in the body, not the title, to keep titles short. Red case demonstrated on the introducing PR (#66): an ID-less title failed CI, the corrected title passed, and the body-marker escape hatch was verified live.

### Changed
- **`templates/github-settings.yaml` — norm levels** — every field now carries **REQUIRED** (binding org norm) or **PREFERENCE** (repo-level choice). `squash_title: pr_title` is REQUIRED, and a new REQUIRED field `squash_message: commit_messages` keeps `Co-authored-by`/`Assisted-by` provenance trailers in squash commit bodies. REQUIRED semantics: the declared value is the only valid one — a spec matching a misconfigured live setting is not compliance; fix the live setting, never adopt the footgun into the spec (KB-82; observed downstream when a generate-from-live flow laundered GitHub's `commit_or_pr_title` footgun into a repo's spec).
- **`templates/CONTRIBUTING.md` — PR merge strategy switched to squash-merge** — the template said "always merge commits — never squash", contradicting the root `CONTRIBUTING.md` and actual practice across repos (KB-59). Now: always squash-merge with the PR title as commit title source; per-commit AI provenance survives in the squash body via `squash_message: commit_messages`.
- **`/pr` skill Phase 1.1** — the generate-from-live path now validates generated values against the KB template's norm levels: REQUIRED fields always take the norm value, and live deviations are surfaced as drift with ready-to-run `gh` fix commands instead of being adopted.
- **`/align` skill** — repo-settings comparison treats REQUIRED-field drift as a gap even when the spec matches live settings, and validates REQUIRED fields against the norm value directly via `gh api`.
- **`/pr` skill Phase 6 — ticket-ID survival check** — before offering any merge, the skill now predicts the exact subject that will land on the default branch (merge method × live squash title source × commit count × PR title) and warns with fix options when the ticket ID would drop — the single-commit-PR + `COMMIT_OR_PR_TITLE` factory-footgun combination that produced ID-less commits downstream is now caught pre-merge. After the merge, an outcome-level verification reads the landed commit subject and reports loudly if the ID didn't survive. Both checks honor the `[noticket]`/`[noissue]` PR-body escape hatch (KB-83).

### Added
- **`schemas/github-settings.schema.json` + `lint-settings.yaml` workflow — deterministic spec validation** (KB-82) — REQUIRED org norms are pinned as `const` in a JSON Schema, so a settings spec declaring any other value (e.g. a laundered live footgun) fails CI mechanically — no LLM judgment involved. The workflow also validates a deliberately broken fixture (`schemas/fixtures/github-settings.bad.yaml`) and fails if the validator *accepts* it: the red case is re-proven on every run, not just once at introduction. LLM-side norm checks in `/pr`/`/align` remain for what a schema can't reach (live GitHub settings, generation-time behavior). The schema lives in top-level `schemas/` (not `templates/`) because it's adopt-verbatim, not customize-on-copy — and not under `.github/`, whose namespace GitHub/Copilot actively colonize (`agents/`, `skills/`, `prompts/`). `/align` never overwrites an existing `.github-settings.yaml`: it reconciles field-wise (REQUIRED → norm, PREFERENCE → keep the downstream value, new upstream fields proposed additively).
- **Enforcement Mechanisms principle** in `CONTRIBUTING.md` and `templates/CONTRIBUTING.md` — **no enforcement mechanism merges without a demonstrated red case** (KB-84). A mechanism never seen failing must be assumed to enforce nothing, and the claim of enforcement is what makes everyone stop double-checking. Three rules: prove the red case before merging (link the failing run in the PR/CHANGELOG), watch the outcome not just the artifact, re-prove after edits. Backed by a full audit of the KB's ~70 enforcement mechanisms (inventory on KB-84); structural gaps ticketed as KB-85 (main-history ticket-ID watcher), KB-86 (REQUIRED-settings drift watcher), KB-87 (red cases for homegrown CI). Also fixed en passant: the "≤80 characters (enforced — …)" claim in both CONTRIBUTING files was discipline presented as automation — reworded honestly.

### Migration

**Files:**
- Add the "Enforcement Mechanisms" section from `templates/CONTRIBUTING.md` to your repo's `CONTRIBUTING.md`.
- Grep your docs for enforcement claims ("enforced", "validates", "CI checks") and verify each names a real mechanism with a demonstrated red case — reword any that describe discipline as automation.

**Repo settings (manual):**
- All squash-using repos — set both squash sources (this step was missing from the [2026-06-11] entry, so live repos were never instructed to leave GitHub's factory defaults; misconfigured repos silently drop ticket IDs from single-commit squashes and provenance trailers from all squashes):
  ```
  gh api repos/{owner}/{repo} -X PATCH -f squash_merge_commit_title=PR_TITLE -f squash_merge_commit_message=COMMIT_MESSAGES
  ```

**Files:**
- Re-sync `.github-settings.yaml` from `templates/github-settings.yaml` to pick up the norm-level markers and the `squash_message` field.
- Copy `schemas/github-settings.schema.json`, `schemas/fixtures/github-settings.bad.yaml`, and the `lint-settings.yaml` workflow into your repo (same paths) to get deterministic spec validation with a standing red case. Adopt all three verbatim — trim the workflow's `templates/github-settings.yaml` reference, which only exists in the KB.
- If your `CONTRIBUTING.md` carries the "always use merge commits" PR Merge Strategy section, replace it with the squash-merge section from `templates/CONTRIBUTING.md`.

**CI/CD:**
- Replace your repo's `.github/workflows/lint-pr.yaml` with the fixed KB copy. Any copy synced before this date carries the no-op pattern and enforces nothing — this includes customized copies, so re-apply local customizations (e.g. a different `types` list) on top of the fixed pattern.
- Repos without a lint-pr workflow: add it now. This check is what keeps squash-merged commits traceable to tickets in `git log`.
- After adopting, prove the red case once: open (or retitle) a PR without a ticket ID and confirm the check fails, then restore the title. An enforcement mechanism that has never been seen failing cannot be trusted (KB-84).

**Tooling / habits:**
- Ticket-less PRs now need `[noticket]` (or `[noissue]`) in the PR description body to pass CI.

## [2026-06-25]

### Added
- **`templates/github-workflow-design.yml`** — standalone CI workflow that lints `DESIGN.md` against the [open spec](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md) via `npx @google/design.md lint`. Triggers only on `DESIGN.md` changes (`paths: [DESIGN.md]`). Advisory by default (`continue-on-error: true`) — tighten to strict once the project's file is fully spec-compliant.

### Migration

**CI/CD:**
- Copy `templates/github-workflow-design.yml` to `.github/workflows/design.yml` in projects that have a `DESIGN.md`. The workflow only triggers when `DESIGN.md` changes, so it adds no overhead to projects without one.

## [2026-06-24]

### Added
- **`/figma-conventions` skill** — opinionated Figma workflow conventions extracted from pairing sessions. Covers component editing discipline (always edit the base, never instances), variable-first architecture, flow layout over freeform, source-of-truth tracing, visual verification protocol, column alignment in data tables, gap-based resizable bars (Figma workaround for numeric component properties), and nested instance limitations. Includes an enforcement phases framework (always-enforce / implementation-phase / defer-to-refinement) so agents can modulate which conventions to enforce during rapid prototyping vs polish.
- **`templates/DESIGN.md`** — spec-compliant design guide template following the [DESIGN.md open spec](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md). YAML frontmatter with token placeholders, all 8 sections in prescribed order, `<!-- PROJECT-SPECIFIC -->` and `<!-- CROSS-PROJECT -->` markers.
- **AGENTS.md template updated** with "Design Work" section referencing DESIGN.md and Figma workflow conventions, plus DESIGN.md sync protocol (flag undocumented decisions, surface conflicts).

### Migration

**Files:**
- If your project has a `DESIGN_GUIDE.md`, consider migrating to the `DESIGN.md` format for ecosystem compatibility (CLI linting, Figma plugin generation). See `docs/decisions/0003-design-guide-standards.md` for rationale.
- Re-sync `AGENTS.md` from `templates/AGENTS.md` to pick up the "Design Work" section.

**Tooling / habits:**
- Use `npx @google/design.md lint DESIGN.md` to validate design guide files against the spec.

## [2026-06-15]

### Changed
- **`/commit` skill broadened to own full commit unit** — the skill now covers five areas beyond message drafting: type/scope selection guidance (canonical scopes from CONTRIBUTING.md, with missing-scope amendment suggestions), atomicity checks (multi-concern diff detection with concrete split plans), staging guidance (specific-file `git add` over blanket staging, mixed-state warnings), amend-vs-new commit decisions (default new, risk assessment when amend is requested), and convention health checks (escalate when CONTRIBUTING.md is missing, incomplete, or contains anti-patterns). Other skills (`/pair`, `/align`) should reference `/commit` as the authority on commit conventions — not just message text, but the full commit decision.
- **Skills renamed to platform-agnostic imperative names** — five skill directories were renamed so the invocation matches the artifact or task, not the platform or grammar: `commenting` → `comment`, `commitmsg` → `commit`, `designnote` → `decision`, `linearissue` → `issue`, `pairprog` → `pair`. Cross-references between skills, `Skill("…")` call sites, `/`-invocation examples, and `skills/README.md` were updated to the new names. This is a rename only — skill behavior, descriptions, and bodies are otherwise unchanged.

### Migration

**Files:**
- If your project vendors a copy of `skills/commit/SKILL.md`, re-sync it to pick up the broadened scope (staging guidance, atomicity checks, type/scope selection, amend-vs-new decisions, convention health checks).

**Files:**
- If your project vendors copies of any renamed skill (`skills/commenting`, `skills/commitmsg`, `skills/designnote`, `skills/linearissue`, `skills/pairprog`), move them to the new directory names and update any internal `Skill("…")` references.

**Tooling / habits:**
- Invoke the skills under their new names: `/comment`, `/commit`, `/decision`, `/issue`, `/pair`.

**CI/CD:**
- The Linear skill deploy (`.github/workflows/linear-skill-deploy.yaml`) derives each skill's Linear title from its directory name. On the next deploy this rename creates the five new skill entries and deletes the old ones — no manual action needed, but expect the corresponding Linear AI skills to be re-created under the new titles.

## [2026-06-13]

### Changed
- **`/designnote` and `/pairprog` skills — source-linking for research output** — research and spike findings must now link every factual claim inline to its source (one click from claim to evidence). `/designnote` requires inline links in `## Exploration` and tells research subagents to return source URLs. `/pairprog` keys the rule on the kind of statement, not the surface: a finding (a verifiable claim about the outside world) links to its source wherever it's written — Linear comment or doc — while process/coordination comments (plans, step completions, blockers) are exempt; a finding may instead point to a doc that already carries the sourced version. Both include what-to-link guidance (pricing pages, API docs, field-schema source, package/repo pages, shutdown announcements) and a worked example.

### Migration

No action required in downstream repos — these are skill-definition changes that take effect the next time the skills run. If your project vendors copies of `skills/designnote/SKILL.md` or `skills/pairprog/SKILL.md`, re-sync them to pick up the source-linking requirement.

## [2026-06-12]

### Changed
- **`/linearissue` and `/pr` skill quality gates** — unified imperative voice model: `[VERB] [DIFFERENTIATING NOUN] [CONTEXT]` as canonical title structure across tickets, PRs, and commits. Added 3-tier verb system (preferred scope-signaling / allowed task-framing / banned generic), statement-title anti-pattern, mechanism verb detection anywhere (not just leading position), and "Differentiator survives truncation" principle with inline truncation rendering.
- **`/linearissue` confirmation output** — now includes a cold-reader interpretation line and truncated-at-30 rendering per ticket, plus batch overlap detection flagging sibling titles with shared prefixes.
- **AI Co-authorship convention** in `templates/CONTRIBUTING.md` — dual-trailer convention: `Co-authored-by` (GitHub avatar rendering today) + `Assisted-by` (Linux kernel emerging standard, forward-compatible). Documents `noreply@{provider-domain}` email convention and `AGENT_NAME:MODEL_VERSION` format.
- **`/pr` skill** — dropped `[ai:agent]` tag from PR title format. Provenance is carried by `Co-authored-by` and `Assisted-by` trailers in the commit body, which survive squash-merge.

### Migration

**If your project's CONTRIBUTING.md has an AI Co-authorship section:**

Update to include both trailers:
```
Co-authored-by: Claude Code <noreply@anthropic.com>
Assisted-by: Claude:claude-opus-4-6
```

**If your `/pr` skill generates titles with `[ai:agent]` suffix:**

No action needed — the skill no longer adds this tag. Provenance is in the commit trailers.

**Audit existing tickets against the new title standard:**

The imperative voice model applies to future tickets automatically (the `/linearissue` quality gate enforces it), but existing tickets in Backlog, Todo, and In Progress were written under the old standard. These are worth auditing because non-compliant titles often signal deeper problems: vague scope, missing DoD, or work that should be split.

Run through open tickets and check for:
- **Statement titles** (fact, not task) — "QuiverQuant as primary provider" → "Select disclosure data provider"
- **Buried differentiators** — siblings that truncate identically on a board
- **Banned verbs** — "Implement X", "Build Y", "Create Z" → replace with scope-signaling verbs
- **Mechanism framing** — titles that describe implementation, not value
- **Scope gaps** — tickets that are too broad or lack a concrete DoD

This is a one-time cleanup per project. KB-33 will provide a `/kbsync` skill to automate this audit across repos.

## [2026-06-11]

### Added
- **`.github/workflows/lint-pr.yaml`** — CI enforcement of PR title format using `amannn/action-semantic-pull-request`. Validates `type(scope): subject [TICKET-ID]` against conventional commit types from CONTRIBUTING.md. Uses `pull_request` trigger (not `pull_request_target`) since this repo has no fork contributions.
- **`templates/github-settings.yaml`** — declares intended GitHub repo settings (merge mode, squash-merge title source, branch protection) so the `/pr` skill can detect configuration drift.
- **PR Title Convention section** in `templates/CONTRIBUTING.md` — documents the `type(scope): subject [TICKET-ID]` format, with a table showing how individual commits and merged PRs layer differently in `git log`.

### Changed
- **`/pr` skill** — title assembly now generates `type(scope): subject [TICKET-ID]` instead of `TICKET-ID: title`. Quality gate brevity limit (60 chars) now applies to the subject only; type/scope prefix and ticket suffix are excluded as structural overhead. New Phase 1.1 checks for `.github-settings.yaml` and surfaces drift warnings or a guided first-time setup flow.

### Migration

**If your project uses the `/pr` skill:**

PR titles will change from `KB-10: Title` to `type(scope): title [KB-10]`. No action needed — the skill handles this automatically. Existing PRs are unaffected.

**To add PR title CI enforcement to your repo:**

1. Copy `.github/workflows/lint-pr.yaml` to your repo
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

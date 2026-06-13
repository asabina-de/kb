# Changelog

All notable changes to this project are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/), adapted for continuous delivery:

- **No versioned releases.** Each entry is dated when it merges to main.
- **Migration sections** accompany breaking template or convention changes so downstream consumers know what to do.
- **Stateless instructions.** Migration guidance is artifact-based ("if you see X, do Y") — no need to track which version you're on.
- **Per-logical-change granularity.** One dated entry per coherent change, not per PR. Related PRs share a date entry.

## How to read this changelog

Scan from the top. Find the date after your last sync. Everything above that date is new to you. Migration sections tell you what action to take, if any.

## How to write an entry

1. Add a new `## [YYYY-MM-DD]` heading at the top (below this intro)
2. Categorize changes under `### Added`, `### Changed`, `### Removed`, `### Fixed`, or `### Deprecated`
3. If any change requires action from consumers, add a `### Migration` section with stateless instructions
4. **Enumerate all affected resources** — not just files. See "Affected resources" below.
5. Keep entries concise — link to tickets or design notes for full context

### Affected resources

A convention change affects **resources** — anything that must be updated to achieve parity. Resources are not limited to files in the repo. They include anything the changed code or convention *expects to exist and behave a certain way*.

When writing a migration entry, infer the affected resources from the change: what does this change assume about the world? Those assumptions are your resource list. Group migration steps by resource type so readers can route each step to the right person or tool.

Common resource types (not exhaustive — infer from context):

- **Files** — templates, configs, workflows, skill definitions, documentation
- **Repo settings** — merge mode, branch protection, squash title format
- **Tickets** — existing backlog titles, descriptions, DoDs, scope, breakdown
- **CI/CD** — pipeline configs, check requirements, environment variables
- **Infrastructure** — service configs, secrets, env vars, deployment settings
- **Database** — schema migrations, seed data, connection strings
- **Observability** — dashboards, alerts, log schemas, metric definitions
- **External services** — API keys, webhook registrations, platform configs

Tag manual-only steps with **(manual)** so readers know an agent can't automate them.

<!-- Template entry — copy and fill in:

## [YYYY-MM-DD]

### Added
- **Feature name** — brief description of what was added.

### Changed
- **Component name** — what changed and why.

### Removed
- **Component name** — what was removed and what replaces it (if anything).

### Migration

**Files:**
- Step one

**Repo settings (manual):**
- Step two

**Tickets:**
- Audit open backlog for [pattern] and fix

-->

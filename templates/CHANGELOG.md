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
4. Keep entries concise — link to tickets or design notes for full context

<!-- Template entry — copy and fill in:

## [YYYY-MM-DD]

### Added
- **Feature name** — brief description of what was added.

### Changed
- **Component name** — what changed and why.

### Removed
- **Component name** — what was removed and what replaces it (if anything).

### Migration

**If you have [artifact/pattern] in your project:**

1. Step one
2. Step two
3. Step three

-->

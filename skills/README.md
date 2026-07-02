# Engineering Skills

Claude Code skills that operate on KB-defined artifacts (decision records, TODO.md, commit conventions, CONTRIBUTING.md). These skills live here — not in personal dotfiles — so they co-evolve with the artifacts they read and write.

## Skills in this directory

| Skill | Purpose | KB artifacts touched |
|-------|---------|---------------------|
| **comment** | Post structured comments to Linear issues (threading, provenance, formatting) | None (protocol only) |
| **commit** | Guide full commit unit: message drafting, type/scope selection, atomicity, staging, amend-vs-new | Reads CONTRIBUTING.md, AGENTS.md |
| **decision** | Draft or extend decision records in `docs/decisions/` | Writes `docs/decisions/*.md` |
| **issue** | File Linear issues from decision record action items, iterate on tickets, or create freeform | Reads/edits `docs/decisions/*.md` |
| **pair** | Interactive pair-programming on Linear tickets | Reads CLAUDE.md, AGENTS.md, CONTRIBUTING.md |
| **ping** | Probe skill for verifying skill discovery on deployment surfaces | None (returns a static token) |
| **pr** | Create pull requests with smart base branch detection | Reads Linear tickets |
| **align** | Bring a repo's conventions into alignment with KB standards | Reads/compares KB templates |
| **figma-conventions** | Opinionated Figma workflow conventions for file organization and editing | None (conventions only) |
| **imagegen** | Generate design concept images for rapid visual ideation before Figma vector work | None (outputs to `.imagegen-output/`) |

## Skills that stay in dotfiles

These are personal/generic and don't couple to KB artifacts:

- `context7-mcp`, `dispatch`, `qsearch`, `troubleshoot`, `untypo`

## Wiring into dotfiles

The dotfiles repo symlinks each skill directory into `claude/skills/`:

```bash
# In dotfiles/claude/skills/
comment  -> <PATH_TO_KB_REPO>/skills/comment
commit   -> <PATH_TO_KB_REPO>/skills/commit
decision -> <PATH_TO_KB_REPO>/skills/decision
issue    -> <PATH_TO_KB_REPO>/skills/issue
pair     -> <PATH_TO_KB_REPO>/skills/pair
pr       -> <PATH_TO_KB_REPO>/skills/pr
```

`mkOutOfStoreSymlink` in nix-darwin follows the symlink chain — no config changes needed.

## Deployment surfaces

Skills deploy to multiple surfaces, each with different discovery mechanisms:

| Surface | Discovery path | Notes |
|---------|---------------|-------|
| **Claude Code** (local CLI) | `~/.claude/skills/` (symlinked from dotfiles) | Full skill support |
| **GitHub Copilot CLI** (`gh copilot`) | `.github/skills/` in the repo | Works — skills are loaded and matched by description |
| **GitHub Copilot cloud agent** | `.github/skills/` in the repo (default branch) | Used when Copilot opens PRs or runs tasks |
| **GitHub Copilot web chat** (github.com UI panel) | — | **Does not load repo skills.** The chat panel has repo file access but does not inject `.github/skills/` into its context. |
| **GitHub Copilot code review** | `.github/skills/` (review-focused names) | Skills with review-oriented directory names are auto-loaded |
| **Linear AI** | Deployed via `linear-skill-deploy.yaml` workflow | Skills are plain text fields on team settings |

### `.github/skills/` sync

Skills are authored in `skills/` (the canonical source) and copied to `.github/skills/` for GitHub Copilot discovery. The copies must stay in sync — the `check-skill-sync.yaml` CI workflow fails PRs if they diverge.

**Important:** `.github/skills/` must contain real files, not symlinks. GitHub's cloud agent does not follow symlinks.

## Portability guidelines

Skills follow the [Agent Skills](https://agentskills.io) open standard (formerly "OpenSkills"). The format is supported by 35+ tools including Claude Code, OpenCode, GitHub Copilot, and Codex. These guidelines ensure skill bodies remain portable across tools and middleware (e.g. Composio) while preserving precision on the primary target.

### Rule 1 — Use functional prose for tool references

Skill body text must describe **what to do**, not which tool to call. LLMs resolve functional descriptions to the correct tool from their available set, regardless of platform.

| Instead of | Write |
|---|---|
| "Use `AskUserQuestion` to confirm" | "Confirm with the user before proceeding" |
| "Use `Read` to read the file" | "Read the file" |
| "Run via `Bash`" | "Run in the shell" |
| "Use `Grep` to search" | "Search file contents for the pattern" |
| "Use `WebFetch` to fetch the URL" | "Fetch the URL content" |
| "Use `Edit` / `Write` for code changes" | "Make the code changes" |
| "Spawn a `Task` subagent to investigate" | "Investigate in parallel" |

**Why:** Built-in tool names differ across platforms (Claude Code uses PascalCase `Read`, OpenCode uses lowercase `read`, others vary further). Functional prose works on all of them.

### Rule 2 — Dual-layer references for MCP tools

When referencing an MCP-provided tool (Linear, GitHub, Figma, etc.), lead with functional prose and optionally include the canonical MCP tool name in parentheses as a hint.

| Instead of | Write |
|---|---|
| "Call `mcp__claude_ai_Linear__save_issue`" | "Update the issue on Linear (e.g. `save_issue`)" |
| "Use `mcp__github__get_file_contents`" | "Read the file from GitHub (e.g. `get_file_contents`)" |
| "Post via `mcp__claude_ai_Linear__save_comment`" | "Post a comment on the Linear issue (e.g. `save_comment`)" |

**Why:** The `mcp__<server>__` prefix is a Claude Code namespacing convention — not portable. The canonical MCP name (e.g. `save_issue`) is consistent across MCP clients but not across middleware like Composio (which uses `LINEAR_CREATE_LINEAR_ISSUE`). Functional prose is the universal escape hatch; the parenthetical hint adds precision when the official MCP server is in use.

**`allowed-tools` in frontmatter** keeps the full platform-specific prefix (e.g. `mcp__claude_ai_Linear__save_issue`). Frontmatter is where the platform needs exact names; body prose is where humans and LLMs need intent.

### Rule 3 — Execution patterns are exempt

Platform-specific execution patterns — skill-to-skill delegation, subagent spawning, HITL gates with specific parameter shapes — describe the skill's **architecture**, not a tool name. These stay as-is:

- `Skill("comment", ...)` — skill invocation syntax
- `Task` / `Agent` subagent spawning with `subagent_type` parameters
- `AskUserQuestion` with specific option structures (the *call pattern*, not the *concept* of asking)

The distinction: "confirm with the user" (Rule 1) describes intent. `AskUserQuestion({ question: "...", options: [...] })` describes a specific API shape that's part of the skill's control flow. The former is generalizable; the latter is architectural.

### Rule 4 — `allowed-tools` stays in frontmatter

The Agent Skills spec defines `allowed-tools` as an experimental field. Claude Code uses it actively to scope tool access during skill execution. Other tools ignore unknown frontmatter fields harmlessly. Keep it in frontmatter — do not move it to `metadata`.

### Reviewing skills for portability

When reviewing a skill change, check body text against these rules:

1. **Scan for PascalCase tool names** — `Read`, `Write`, `Edit`, `Bash`, `Grep`, `Glob`, `WebFetch`, `WebSearch`, `AskUserQuestion`. If they appear as "use X to..." instructions (not architectural patterns), rewrite to functional prose.
2. **Scan for `mcp__` prefixes** — any `mcp__<server>__<tool>` in body text should be replaced with functional prose + parenthetical canonical name.
3. **Leave execution patterns alone** — `Skill(...)`, `Task(...)`, `Agent(...)` invocation blocks with parameter examples are architectural and stay as-is.

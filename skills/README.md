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

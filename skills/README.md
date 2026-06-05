# Engineering Skills

Claude Code skills that operate on KB-defined artifacts (decision records, TODO.md, commit conventions, CONTRIBUTING.md). These skills live here — not in personal dotfiles — so they co-evolve with the artifacts they read and write.

## Skills in this directory

| Skill | Purpose | KB artifacts touched |
|-------|---------|---------------------|
| **commenting** | Post structured comments to Linear issues (threading, provenance, formatting) | None (protocol only) |
| **commitmsg** | Suggest commit messages following repo conventions | Reads CONTRIBUTING.md, AGENTS.md |
| **designnote** | Draft or extend decision records in `docs/decisions/` | Writes `docs/decisions/*.md` |
| **linearissue** | File Linear issues from decision record action items, iterate on tickets, or create freeform | Reads/edits `docs/decisions/*.md` |
| **pairprog** | Interactive pair-programming on Linear tickets | Reads CLAUDE.md, AGENTS.md, CONTRIBUTING.md |
| **pr** | Create pull requests with smart base branch detection | Reads Linear tickets |

## Skills that stay in dotfiles

These are personal/generic and don't couple to KB artifacts:

- `context7-mcp`, `dispatch`, `qsearch`, `troubleshoot`, `untypo`

## Wiring into dotfiles

The dotfiles repo symlinks each skill directory into `claude/skills/`:

```bash
# In dotfiles/claude/skills/
commenting  -> <PATH_TO_KB_REPO>/skills/commenting
commitmsg   -> <PATH_TO_KB_REPO>/skills/commitmsg
designnote  -> <PATH_TO_KB_REPO>/skills/designnote
linearissue -> <PATH_TO_KB_REPO>/skills/linearissue
pairprog    -> <PATH_TO_KB_REPO>/skills/pairprog
pr          -> <PATH_TO_KB_REPO>/skills/pr
```

`mkOutOfStoreSymlink` in nix-darwin follows the symlink chain — no config changes needed.

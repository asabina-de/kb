# `lint-pr` workflow template

Validates PR titles as `type(scope): subject [TICKET-ID]` via
[`amannn/action-semantic-pull-request`](https://github.com/amannn/action-semantic-pull-request),
and ships the red case that proves the pattern still rejects bad input.

## Why this template is a directory

Every other template in `templates/` is a single flat file. This one is not, because
the workflow does not work alone — it reads its pattern from a sibling file, and its
red-case job runs a script against a fixture table. Copying only the `.yaml` yields a
workflow whose `check-pattern-red-case` job fails immediately on a missing file.

The directory mirrors the **exact paths the files take downstream**, so adopting it is
a recursive copy with no path reconstruction, and drift is a direct diff. Reconstructing
four destination paths from encoded flat filenames is precisely the manual step that
drifts (KB-64).

## Adopt

From the root of the target repo, with this repo available at `$KB`:

```bash
cp -R "$KB/templates/github-workflow-lint-pr/." .
```

Then, because adding a job does not make it blocking, add
`Red case — PR-title pattern rejects bad subjects` to the required status checks for
your default branch.

The runner needs Node 20+ and has no dependencies — no `npm ci` step.

## Check for drift

```bash
diff -r "$KB/templates/github-workflow-lint-pr/.github" .github
```

Compare only the files the bundle carries; your `.github/` will legitimately contain
much more.

## What you are adopting

| File | Purpose |
|---|---|
| `.github/workflows/lint-pr.yaml` | The check itself, plus the red-case job |
| `.github/pr-title-pattern.txt` | The pattern, single-sourced so CI and the test read the same string |
| `.github/fixtures/pr-titles.tsv` | Case table — the red case |
| `.github/scripts/check-pr-title-pattern.mjs` | Runner; fails if the pattern accepts anything marked `fail` |

## Customising

The pattern's character class is `[A-Z][A-Z0-9]*`, which admits team keys containing
digits (`A1-221`) as well as plain ones (`KB-115`). If you change the pattern, **add a
fixture row for the case that motivated the change** — `CONTRIBUTING.md` requires a red
case to be re-proven after every edit, and the runner refuses a table with no `fail`
rows.

The escape hatch is deliberate: a PR with no ticket declares `[noticket]` or `[noissue]`
in its *description body*, lifting the ID requirement while type/scope validation still
applies.

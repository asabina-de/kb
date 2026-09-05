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
| `.github/scripts/pr-title-rule.mjs` | The rule — pattern + escape hatch. Run by CI, imported by the test |
| `.github/fixtures/pr-titles.tsv` | Case table — the red case |
| `.github/scripts/check-pr-title-pattern.mjs` | Runner; fails if the rule disagrees with any fixture row |

## Why the ticket-ID rule is not a `subjectPattern`

The obvious shape for this check is one `subjectPattern` option on the action, and that
is what it used to be. The escape hatch rode along in the same option, as a GitHub
expression choosing between `^.+$` and the strict pattern depending on whether the PR
body carried `[noticket]`.

**Nothing could test that expression.** The fixture proved the regex rejected bad
subjects, and the other half of the rule — the half that decides whether the regex
applies at all — was assumed. In the KB repo it had also never once been exercised on a
real PR, because every ID-less PR there predated enforcement. An escape hatch never seen
escaping must be assumed broken.

Testing it in place would have meant reimplementing GitHub's expression semantics in JS
and asserting against the reimplementation — proving the mock agrees with itself. So the
rule moved into `pr-title-rule.mjs`, which the workflow runs and the fixture runner
imports. The tested thing and the running thing are the same function.

This costs nothing, because the pattern is anchored at the **end** of the title. It never
needed the action to strip the `type(scope):` prefix for it, so applying it to the whole
title is the same assertion. Type and scope stay the action's job.

## Customising

The pattern's character class is `[A-Z][A-Z0-9]*`, which admits team keys containing
digits (`A1-221`) as well as plain ones (`KB-115`). If you change the pattern, **add a
fixture row for the case that motivated the change** — `CONTRIBUTING.md` requires a red
case to be re-proven after every edit. The runner refuses a table with no `fail` rows,
and equally refuses one where no row exercises the escape hatch, since a dead hatch
would otherwise pass unnoticed.

The escape hatch is deliberate: a PR with no ticket declares `[noticket]` or `[noissue]`
in its *description body*, lifting the ID requirement while type/scope validation still
applies. The marker lives in the body rather than the title because the squash-merged
title becomes the commit subject in `git log` forever.

**The marker must own its line.** `[noticket]` alone on a line — optionally as a list
item — exempts the PR. `[noticket]` inside a sentence, or in backticks, does not.

This is the one place the rule deliberately *departs* from the GitHub expression it
replaces. `contains()` matches anywhere in the body, so a PR that merely **discussed**
the hatch was exempted by it. That is not hypothetical: the KB PR that introduced this
module was itself waved through on its first CI run — its title carried a valid ticket
ID that was never checked, because its body explains what `[noticket]` does. Any PR
documenting the marker silently lost ticket-ID enforcement, a narrower cousin of the
no-op the strict pattern exists to prevent. The bug was inherited; making the hatch
observable is what exposed it.

Two other behaviours in `hasEscapeMarker()` are **inherited, not incidental** — they
preserve what the expression did, and both are pinned by fixtures:

- **Matching is case-insensitive.** `contains()` [is not case-sensitive][expr], so
  `[NOTICKET]` has always been accepted. A port using a plain
  `body.includes('[noticket]')` turns PRs that pass today red.
- **A null body coerces to empty** rather than throwing, so a PR opened with no
  description falls through to the strict pattern.

If you change the markers, keep all three properties or drop them deliberately.

[expr]: https://docs.github.com/en/actions/reference/workflows-and-actions/expressions

## Security note

The PR body is attacker-controlled text. It reaches the check through `env:`, never
interpolated into the `run:` line — `node script.mjs "${{ github.event.pull_request.body }}"`
is [the documented script-injection footgun][inj]. Keep the `env:` form if you edit the
workflow.

[inj]: https://docs.github.com/en/actions/concepts/security/script-injections

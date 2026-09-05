# `lint-settings` workflow template

Validates your `.github-settings.yaml` against the org settings schema, so a repo
cannot declare a merge configuration that silently breaks ticket traceability or
drops provenance trailers. Ships the fixtures that prove the schema still
discriminates.

## Why this template is a directory

Like `github-workflow-lint-pr/`, the workflow does not work alone — it validates
against a schema and re-proves itself against a fixture corpus. Unlike that bundle,
this one carries files **outside `.github/`**: the schema and fixtures live under
`schemas/` at the repo root. The bundle root therefore mirrors the **repo root**,
not `.github/`.

## Adopt

From the root of the target repo, with this repo available at `$KB`:

```bash
cp -R "$KB/templates/github-workflow-lint-settings/." .
```

You also need a `.github-settings.yaml` — start from `$KB/templates/github-settings.yaml`.
The workflow validates whichever specs exist and fails if it finds none, so adopting
the workflow without a spec is caught rather than silently passing.

Then add `Validate settings specs against schema` to your default branch's required
status checks; adding a job does not make it blocking.

## Check for drift

```bash
diff -r "$KB/templates/github-workflow-lint-settings/.github" .github
diff -r "$KB/templates/github-workflow-lint-settings/schemas" schemas
```

## What you are adopting

| File | Purpose |
|---|---|
| `.github/workflows/lint-settings.yaml` | The check, plus green- and red-case fixture steps |
| `schemas/github-settings.schema.json` | The schema; REQUIRED org norms pinned as `const` |
| `schemas/fixtures/valid/*.yaml` | Specs that MUST be accepted |
| `schemas/fixtures/invalid/*.yaml` | Specs that MUST be rejected |

## Norm levels

**REQUIRED** fields (`squash_title: pr_title`, `squash_message: commit_messages`) are
binding org norms pinned as `const`. A spec declaring any other value is invalid by
construction — no judgement involved. If your live GitHub setting disagrees, fix the
setting; never edit the spec to match a misconfigured reality.

They are required **only where squash merging is reachable**. A repo that allows merge
commits only has no squash settings to get wrong, and the schema does not demand them.
Omitting `allowed_methods` entirely still requires them, since GitHub enables all three
methods by default.

**PREFERENCE** fields are repo-level choices. `branch_protection` accepts keys beyond
those the schema names, so declaring *stricter* protection than the norm — approval
counts, required check contexts, admin enforcement — is valid. The trade-off is that a
typo'd key there will not be caught.

## Customising

Both fixture directories are load-bearing. The green cases stop the schema drifting
toward rejecting legitimate specs; the red cases stop it drifting toward accepting
violations. A red case that only tested bad input would pass trivially for a schema
that rejects everything — which is how the over-strictness fixed in KB-117 went
unnoticed. If you change the schema, add a fixture on **both** sides for the case that
motivated the change.

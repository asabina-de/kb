# Linear Workspace Setup

Canonical configuration for a Linear workspace to match Asabina engineering conventions. Use this to provision a **new** workspace or team, or to audit an existing one for drift. It is the practical checklist for the readiness model decided in [`docs/decisions/0005-ticket-readiness-taxonomy.md`](./decisions/0005-ticket-readiness-taxonomy.md).

> **Statuses are configured per team.** In Linear, each team owns its own workflow, so the status setup below is applied in **each team's** settings (Settings → Team → Workflow). Labels can be workspace-level or team-level.

## Workflow statuses — the readiness pipeline

Readiness is modelled as **workflow statuses, not labels** (single-valued, sequential, gating). The canonical pipeline:

```
Triage → Icebox → Needs Scoping → Todo → In Progress → In Review → Done
                                                                   ↘ Canceled
```

| Status            | Status type | Meaning                                                             |
| :---------------- | :---------- | :----------------------------------------------------------------- |
| Triage            | Triage      | Inbox for integration / external-submitted issues (optional).       |
| **Icebox**        | Backlog     | Captured; **no concrete consumer** yet; accrues definition.         |
| **Needs Scoping** | Backlog     | Consumer exists but **fails the Definition of Ready** — don't start. |
| **Todo**          | Unstarted   | **Passes the Definition of Ready** — safe to pick up. _The Ready line._ |
| In Progress       | Started     | Actively being worked.                                              |
| In Review         | Started     | PR open, under review.                                              |
| Done              | Completed   | Merged / shipped.                                                   |
| Canceled          | Canceled    | Dropped (comment why — see cancellation rule in `/issue`).          |

**Key rules:**

- There is **no generic `Backlog` status.** A not-yet-ready ticket is either `Icebox` or `Needs Scoping`. Remove the default `Backlog` status when configuring the team.
- The **Backlog→Unstarted boundary is the Definition-of-Ready line.** Crossing from a Backlog-type status into `Todo` (Unstarted) is the signal that a ticket is ready to implement — so there is no separate `Ready` status; `Todo` _is_ Ready.
- `Icebox` and `Needs Scoping` sit in the **Backlog** type, so parked work never counts toward cycle velocity.
- `Icebox` / `Needs Scoping` items are **not** "ready backlog" and are **not** eligible for `/pair` pickup until they reach `Todo`.

## Definition of Ready (the graduation gate)

A ticket graduates `Icebox → Needs Scoping` when a concrete consumer appears, and `Needs Scoping → Todo` when it passes all five checks (the same checks the `/issue` scope gate applies at creation — see [record 0005](./decisions/0005-ticket-readiness-taxonomy.md) and the `/issue` skill):

1. **Pull, not push** — a concrete, existing thing is blocked now, waiting on this.
2. **Testable with real inputs** — the DoD is meetable with data that exists today, not fabricated examples.
3. **Verb honesty** — the title verb matches the actual work (no commitment verb on discovery work).
4. **Dependency direction** — the artifact's shape isn't _discovered_ by downstream work (else it should be `blocked-by`).
5. **Blast radius** — re-litigation cost vs. evidence is acceptable (Last Responsible Moment).

## Labels

**Labels categorize; they never encode readiness or workflow position** (that's what statuses are for). Do **not** create `Idea` or `Ready`-style labels — readiness lives in the status pipeline above. (`Idea` and `Needs Scoping` existed as ad-hoc labels before record 0005 and are retired in favour of the `Icebox` / `Needs Scoping` statuses.)

Canonical work-type labels (each ticket typically carries one):

| Label         | Meaning                                                            |
| :------------ | :---------------------------------------------------------------- |
| `Spike`       | Time-boxed investigation with a specific question to answer.        |
| `Decision`    | Deliverable is a decision or memo, not code. Gates downstream work. |
| `Research`    | Open-ended research / survey.                                      |
| `Bug`         | Defect in existing behaviour.                                      |
| `Feature`     | New user-facing capability.                                        |
| `Improvement` | Enhancement to existing behaviour.                                 |
| `Tooling`     | Agent skills, CI, dev tooling, cross-project infrastructure.        |
| `Docs`        | Documentation deliverable.                                         |
| `Ops`         | Manual operational / workspace-configuration work.                 |
| `Test`        | Test coverage.                                                     |
| `Debt`        | Technical debt paydown.                                            |

Two labels double as advisory **scoping signals** (they describe a ticket's state, not its category, and may co-exist with a work-type label):

- `Needs Scoping` **(label)** — retained only if you want a cross-cutting flag; prefer the `Needs Scoping` **status**. If both exist, the status is authoritative.

Domain, team, and go-to-market labels (`Compliance`, `Security`, `Bizdev`, `GTM`, `Strategy`, `Onboarding`, …) are workspace-specific — add them as the org needs, but keep them orthogonal to the work-type and readiness dimensions.

## Provisioning checklist (new workspace or team)

- [ ] Create the Backlog-type statuses **`Icebox`** and **`Needs Scoping`**; remove the default generic **`Backlog`** status.
- [ ] Ensure **`Todo`** (Unstarted type) exists as the Ready line; confirm `In Progress` / `In Review` (Started), `Done` (Completed), `Canceled`.
- [ ] Enable **Triage** if the team receives integration / external issues.
- [ ] Create the canonical work-type labels above; do **not** create readiness labels.
- [ ] Confirm cycle/velocity counts only `Started` + `Completed` (default) — parked work in Backlog-type statuses must not count.
- [ ] Record the workspace/team in the org's setup log.

## References

- [`docs/decisions/0005-ticket-readiness-taxonomy.md`](./decisions/0005-ticket-readiness-taxonomy.md) — the readiness taxonomy + graduation-gate decision this guide implements.
- [`PROJECT_SETUP_GUIDE.md`](../PROJECT_SETUP_GUIDE.md) — repo-side project setup (complements this workspace-side guide).

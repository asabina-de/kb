---
title: "Ticket Readiness Taxonomy and Graduation Gate"
tags: [workflow, backlog, linear, process]
status: decided
decision: "Model readiness as workflow statuses (Icebox → Needs Scoping → Todo), not labels; DoR = KB-92's five checks. Drop the Idea/Needs Scoping labels."
review_date: 2026-10-12
related_to: []
supersedes: ""
---

# Ticket Readiness Taxonomy and Graduation Gate

> _Authored by Claude Code._

## Status Log

| Status    | Date       | Author | Related Tickets                                                              | Notes                                                                    |
| :-------- | :--------- | :----- | :-------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| exploring | 2026-07-12 | claude | [KB-96](https://linear.app/asabina/issue/KB-96/select-ticket-readiness-taxonomy-and-graduation-gate) | Initial creation via `/decision`; integrates the KB-96 research spike (cited). |
| exploring | 2026-07-12 | claude | [KB-96](https://linear.app/asabina/issue/KB-96/select-ticket-readiness-taxonomy-and-graduation-gate) | David resolved all 5 open questions in-session (Icebox naming; drop `Idea` label; Todo = Ready; no generic Backlog; count semantics). Decision folded in; formal graduation to `decided` deferred until action-item tickets are filed (exploring → `/issue` → decided). |
| exploring | 2026-07-12 | claude | KB-103, KB-104, KB-105 | Filed 3 action-item tickets via `/issue` (KB-103 workspace config, KB-104 canonical-setup doc, KB-105 `/issue` updates); DoR-wiring covered by KB-97/KB-98. Ready to graduate to `decided` (pending HITL). |
| decided   | 2026-07-13 | claude | KB-96 | Graduated to `decided` (David). Action items filed as KB-103 / KB-104 / KB-105; DoR-wiring in KB-97 / KB-98. |

## Context

The [KB-92](https://linear.app/asabina/issue/KB-92/gate-premature-commitment-in-issue) scope gate (merged) flags _well-formed but premature_ tickets and, on a fire, offers to **park** a premature-but-worth-capturing ticket rather than file it as normal work or discard it. But **how "not-yet-implementable" is represented, and when such a ticket graduates to actionable, is unmodeled.** KB-92 deliberately deferred that representation here.

Two ad-hoc Linear **labels** already exist, overlapping but distinct:

- **`Idea`** — a captured thought with _no concrete consumer yet_ (a real idea vehicle; accrues definition via comments/attachments).
- **`Needs Scoping`** — a consumer may exist, but scope/DoD is unclear; _"don't start until resolved."_

This record decides the **readiness taxonomy** (what the states are and how they're represented) and the **graduation gate** (the criteria to move between them). It is the keystone for a family of tickets: it unblocks [KB-97](https://linear.app/asabina/issue/KB-97/gate-premature-pickup-in-pair) (`/pair` pickup gate) and [KB-98](https://linear.app/asabina/issue/KB-98/gate-premature-graduation-in-decision) (`/decision` graduation gate), and informs [KB-100](https://linear.app/asabina/issue/KB-100/verify-readiness-gate-claims-against-ground-truth) (async claim-verifier).

## Exploration

### Option A — represent readiness as labels

Keep `Idea` / `Needs Scoping` as labels (as they exist today), possibly adding a `Ready` label.

- **Pro:** cheap; no workflow reconfiguration; composable with other labels.
- **Con:** labels are [multi-valued and descriptive](https://linear.app/docs/labels) — nothing stops a ticket being both `Idea` and `Ready`, and they don't render the pipeline as board columns. Readiness is a _single-valued, sequential_ property, so modeling it as labels invites contradictory states and hides the flow. Linear's own guidance warns against replicating statuses as labels.

### Option B — represent readiness as workflow statuses (recommended)

Model readiness as **custom workflow statuses**, not labels.

Linear ships five status _types_ — **Backlog, Unstarted, Started, Completed, Canceled** — plus a special **Triage** inbox, and each type can hold many custom statuses ([conceptual model](https://linear.app/docs/conceptual-model), [configuring workflows](https://linear.app/docs/configuring-workflows), [triage](https://linear.app/docs/triage)). A status is **single-valued** (an issue is in exactly one), it **drives board columns**, and only Started/Completed statuses count toward cycle velocity. That is exactly the shape of readiness: single-valued, sequential, gating, and worth _seeing_ as flow.

**Status-vs-label rule (distilled from the sources):** use a **status** when the concept is single-valued, a sequential gate, and something you want as a board column / flow metric; use a **label** when it's cross-cutting, multi-valued, and descriptive. Readiness is the former.

### Prior art — we're re-deriving established patterns, not inventing

- **Definition of Ready (DoR)** — the standard name for the implementation-ready gate: agreed criteria a backlog item must meet before it can be pulled into work; the output of backlog refinement ([Scrum.org](https://www.scrum.org/resources/blog/ready-or-not-demystifying-definition-ready-scrum)). Our "Ready-for-Implementation" gate _is_ DoR — we should adopt the established name.
- **Icebox** — Linear's own convention: a custom Backlog-type status for parked/not-yet-real work, distinct from the queued "Backlog" ([conceptual model](https://linear.app/docs/conceptual-model)).
- **Shape Up** — no backlog; raw ideas are tracked loosely, then _shaped_ into a pitch, then bet on ([Bets, Not Backlogs](https://basecamp.com/shapeup/2.1-chapter-07)). Maps: raw idea → shaping → shaped/bettable.

### Recommended model

Model three readiness states as statuses so the **Backlog→Unstarted boundary becomes the literal Definition-of-Ready line**:

| Concept          | Status         | Linear type | Meaning                                                    |
| :--------------- | :------------- | :---------- | :-------------------------------------------------------- |
| Idea / no consumer | **Icebox**     | Backlog     | Captured; no concrete consumer yet; accrues definition     |
| Needs scoping    | **Needs Scoping** | Backlog     | Consumer exists but fails DoR — don't start                |
| Ready            | **Todo** (= Ready) | Unstarted   | Passes DoR — safe to pick up                               |

Flow: `Triage → Icebox → Needs Scoping → Todo(Ready) → In Progress → …`. Icebox and Needs Scoping live in the _Backlog_ type (so they never pollute cycle velocity); crossing into the _Unstarted_ type ("Todo") is the Ready signal — which is why a separate "Ready" status is redundant with Todo (resolved in the Decision below).

**The Definition of Ready = KB-92's five scope checks**, reused verbatim as the graduation gate:

1. **Pull, not push** — a concrete, existing thing is blocked now, waiting on this.
2. **Testable with real inputs** — the DoD is meetable with data that exists today.
3. **Verb honesty** — the title verb matches the actual work (no commitment verb on discovery work).
4. **Dependency direction** — the artifact's shape isn't _discovered_ by downstream work (else it should be `blocked-by`).
5. **Blast radius** — re-litigation cost vs. evidence is acceptable (Last Responsible Moment).

An item **graduates** Icebox → Needs Scoping when a concrete consumer appears, and Needs Scoping → Todo when it passes all five DoR checks.

### Reconciling the existing labels

Migrate the `Idea` and `Needs Scoping` **labels** to **statuses** and drop the labels, so readiness lives in exactly one place. (See Open Questions on naming and on whether any label survives as an orthogonal descriptor.)

### Relationship to KB-17 (decision-record status vocabulary)

[KB-17](https://linear.app/asabina/issue/KB-17/decision-records-have-unambiguous-superseded-vs-deprecated-status) governs the `exploring | decided | superseded | deprecated` vocabulary for **decision-record files** — a different object from Linear tickets. These are **distinct namespaces** (a `.md` file's maturity vs. a Linear issue's workflow position), so there's no collision; they're only conceptually parallel (both express maturity/readiness). This record does not change KB-17's vocabulary; it defines the ticket-side one.

## Decision

**Resolved 2026-07-12; graduated to `decided` 2026-07-13** (David). Model ticket readiness as **workflow statuses, not labels** (Option B):

- **Two Backlog-type statuses, and no generic "Backlog":** every not-yet-ready ticket is either **`Icebox`** (no concrete consumer) or **`Needs Scoping`** (consumer exists, fails DoR). The default generic `Backlog` status is removed — a ticket must be one of these two.
- **"Ready" is the existing `Todo` (Unstarted type)** — no separate `Ready` status. Crossing the Backlog→Unstarted boundary is the Definition-of-Ready line.
- **Definition of Ready = KB-92's five checks** (pull-not-push, testable-with-real-inputs, verb honesty, dependency direction, blast radius). Graduation: `Icebox → Needs Scoping` when a concrete consumer appears; `Needs Scoping → Todo` when all five pass.
- **Naming:** the no-consumer state is **`Icebox`** (established Linear convention), not `Idea`.
- **Labels dropped:** the `Idea` label is removed (superseded by the `Icebox` status), and `Needs Scoping` moves from label to status. Readiness lives in exactly one place — the status.
- **Backlog counts:** `Icebox` and `Needs Scoping` items are **not** "ready backlog" and are **not** eligible for `/pair` pickup until they reach `Todo`.

Flow: `Triage → Icebox → Needs Scoping → Todo → In Progress → …`

## Consequences

- **Linear workspace change (manual):** create `Icebox` and `Needs Scoping` as Backlog-type statuses; remove the default generic `Backlog` status; delete the `Idea` and `Needs Scoping` labels after migrating any tickets that carry them.
- **Skill updates:** `/issue` scope-gate park outcome targets the `Icebox` status (replacing KB-92's interim "closest existing label"); `/pair` (KB-97) and `/decision` (KB-98) adopt the five-check DoR as their gate; `/issue` triage and "ready backlog" counting treat Icebox / Needs Scoping as not-ready.
- **New provisioning need:** the canonical status + label setup must be documented so new Linear workspaces can be configured consistently — a reusable setup reference (see Action items).
- **Velocity stays clean:** Icebox / Needs Scoping sit in the Backlog type, so parked work never counts toward cycle velocity.

## Confirmation

- The Linear workspace shows `Icebox` and `Needs Scoping` as Backlog-type statuses, no generic `Backlog`, and the `Idea` label removed.
- A parked ticket from `/issue` lands in `Icebox`; it does not appear in "ready backlog" and can't be picked up by `/pair` until it reaches `Todo`.
- The canonical workspace-setup reference exists and reproduces this status + label configuration.

## Resolved Questions

_All resolved 2026-07-12 (David)._

1. **Naming of the no-consumer state** — **`Icebox`** (drop the `Idea` label).
2. **Do any labels survive?** — **No.** Drop both `Idea` and `Needs Scoping` labels once they are statuses. Additionally, **document the canonical status + label setup** so new workspaces can be provisioned consistently (new action item).
3. **Is "Ready" a distinct status or just "Todo"?** — **`Todo`.** No separate `Ready` status.
4. **Does generic "Backlog" coexist with "Icebox"?** — **No.** There is no generic `Backlog`; a not-yet-ready ticket is `Icebox` or `Needs Scoping`.
5. **Backlog-count semantics** — **Confirmed:** Icebox / Needs Scoping are not "ready backlog" and are not `/pair`-pickable until `Todo`.

## Action items

- [ ] Create the workflow statuses in Linear (manual workspace change): `Icebox` and `Needs Scoping` in the Backlog type; remove the default generic `Backlog` status; treat Unstarted `Todo` as the Ready line. (Linear: [KB-103](https://linear.app/asabina/issue/KB-103/configure-readiness-statuses-in-linear-workspace))
- [ ] Migrate any `Idea` / `Needs Scoping`-labelled tickets to the new statuses, then delete both labels. — _blocked by status creation_ (Linear: [KB-103](https://linear.app/asabina/issue/KB-103/configure-readiness-statuses-in-linear-workspace) — bundled)
- [ ] **Document the canonical Linear workspace status + label setup** as a reusable reference, so new workspaces can be provisioned consistently. (Linear: [KB-104](https://linear.app/asabina/issue/KB-104/document-canonical-linear-workspace-setup))
- [ ] Update the `/issue` scope-gate park outcome to target the `Icebox` status (replacing the interim "closest existing label" language from KB-92). (Linear: [KB-105](https://linear.app/asabina/issue/KB-105/teach-issue-the-readiness-statuses))
- [ ] Wire the Definition of Ready (the five checks) as the graduation gate in `/pair` pickup (KB-97) and `/decision` graduation (KB-98). (Linear: [KB-97](https://linear.app/asabina/issue/KB-97/gate-premature-pickup-in-pair), [KB-98](https://linear.app/asabina/issue/KB-98/gate-premature-graduation-in-decision))
- [ ] Update `/issue` triage + "ready backlog" counting to treat Icebox / Needs Scoping as not-ready. (Linear: [KB-105](https://linear.app/asabina/issue/KB-105/teach-issue-the-readiness-statuses) — bundled)

## Upstream References

- Linear — [conceptual model](https://linear.app/docs/conceptual-model), [configuring workflows / statuses](https://linear.app/docs/configuring-workflows), [triage](https://linear.app/docs/triage), [labels](https://linear.app/docs/labels)
- Scrum.org — [Definition of Ready](https://www.scrum.org/resources/blog/ready-or-not-demystifying-definition-ready-scrum)
- Basecamp Shape Up — [Bets, Not Backlogs](https://basecamp.com/shapeup/2.1-chapter-07)
- Full research spike: KB-96 Linear comment (2026-07-10)

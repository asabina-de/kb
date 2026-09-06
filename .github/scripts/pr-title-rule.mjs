#!/usr/bin/env node
// The PR-title ticket-ID rule, in one place (KB-121).
//
// This module is BOTH the check CI runs and the code the fixture runner
// imports. That identity is the point: the previous design expressed the
// escape hatch as a GitHub expression in lint-pr.yaml --
//
//   subjectPattern: ${{ (contains(github.event.pull_request.body, '[noticket]')
//     || contains(...)) && '^.+$' || steps.pattern.outputs.value }}
//
// -- which no test could reach. The fixture proved the regex rejected bad
// subjects; nothing proved the hatch still let a ticketless PR through. An
// escape hatch never seen escaping must be assumed broken, and this one had
// never been exercised: every ID-less PR in this repo predates enforcement.
//
// Testing that expression would have meant reimplementing GitHub's expression
// semantics in JS and asserting against the reimplementation -- proving the
// mock agrees with itself. Moving the decision here instead makes the tested
// thing and the running thing the same function.

import { readFileSync } from 'node:fs';

export const PATTERN_FILE = '.github/pr-title-pattern.txt';

// A PR with no ticket declares one of these in its DESCRIPTION BODY, lifting
// the ID requirement. The marker lives in the body, not the title, because the
// squash-merged title becomes the commit subject in git log forever --
// [noticket] is scaffolding for the PR, not history worth keeping.
//
// BOTH SPELLINGS ARE DELIBERATE -- do not consolidate to one. They are the same
// marker, drawn from different vocabularies: Linear and GitHub both say
// "issue", this convention says "ticket". Whichever an author reaches for, they
// are right, and nobody guesses a marker they have not seen -- they copy it from
// the failure message or the docs. The alias costs one array element, since the
// matcher below is generated from this list and the fixtures pin both. Dropping
// either breaks PRs in repos already using it, for no gain.
export const ESCAPE_MARKERS = ['[noticket]', '[noissue]'];

// The marker must OWN ITS LINE, optionally as a list item.
//
// The GitHub expression this replaces used contains(), which matches anywhere
// in the body -- so a PR that merely *discussed* the hatch was exempted by it.
// That is not hypothetical: PR #85, the one that introduced this module, was
// itself waved through on its first run. Its title carried a valid [KB-121]
// and CI still logged "Ticket ID not required", because the body explains what
// [noticket] does. Any PR documenting the marker silently lost ticket-ID
// enforcement -- a narrower cousin of the KB-81 no-op.
//
// The bug is inherited, not introduced here; making the hatch observable is
// what exposed it. Requiring the marker to stand alone leaves prose and
// inline-code mentions inert, and matches what /pr already emits (KB-120 has
// it write the marker on its own line).
const MARKER_LINE = new RegExp(
  `^\\s*(?:[-*+]\\s+)?(?:${ESCAPE_MARKERS.map((m) => m.replace(/[[\]]/g, '\\$&')).join('|')})\\s*\\.?\\s*$`,
  'i',
);

/**
 * Does the PR body declare the escape hatch?
 *
 * Case-insensitive, and a null/undefined body is treated as empty. Both
 * behaviours are load-bearing, not incidental: they preserve exactly what the
 * GitHub expression this replaces did. `contains()` "is not case-sensitive and
 * casts values to strings during evaluation"[1], so `[NOTICKET]` has always
 * been accepted and a PR opened with an empty description has always fallen
 * through to the strict pattern rather than crashing.
 *
 * Dropping the `i` flag would silently narrow the hatch and turn PRs that pass
 * today red -- the exact class of regression this module exists to make
 * visible. The fixture pins both, and the runner asserts case-insensitivity
 * directly so the guard cannot be removed without noticing.
 *
 * What is deliberately NOT preserved is contains()'s match-anywhere behaviour
 * -- see MARKER_LINE above.
 *
 * [1] https://docs.github.com/en/actions/reference/workflows-and-actions/expressions
 */
export function hasEscapeMarker(body) {
  return String(body ?? '')
    .split(/\r?\n/)
    .some((line) => MARKER_LINE.test(line));
}

/** Read the ticket-ID pattern, single-sourced so CI and the fixture agree. */
export function loadPattern(file = PATTERN_FILE) {
  const source = readFileSync(file, 'utf8').trim();
  if (!source) {
    throw new Error(`${file} is empty -- the check would enforce nothing`);
  }
  return new RegExp(source);
}

/**
 * Apply the rule to a PR.
 *
 * The pattern is anchored at the END of the title (`... \[KEY-123\]$`), so it
 * applies to the whole title and needs no knowledge of the `type(scope)!:`
 * prefix. That is why killing `subjectPattern` cost nothing: reconstructing the
 * subject would have meant duplicating the semantic-pull-request action's
 * prefix parser, and the rule never needed the subject in the first place.
 * Type and scope stay the action's job, which is what it is actually good at.
 */
export function evaluate({ title, body }, pattern = loadPattern()) {
  if (hasEscapeMarker(body)) {
    return { ok: true, exempt: true, reason: 'body declares the no-ticket escape hatch' };
  }
  if (pattern.test(String(title ?? ''))) {
    return { ok: true, exempt: false, reason: 'title carries a ticket ID' };
  }
  return { ok: false, exempt: false, reason: 'title has no ticket ID and the body declares no exemption' };
}

const FAILURE_HELP = `
Expected format: type(scope): description [TICKET-ID]
Examples:
  feat(auth): add OAuth callback [KB-31]
  fix: handle null response [KB-45]
The ticket ID must be wrapped in SQUARE BRACKETS [KB-31] and come last.
Parentheses (KB-31) do not satisfy this check -- the squash-merged commit takes
this title as its subject, and anything scanning git log for [TICKET-ID] looks
for brackets. A team key may contain digits, so [A1-221] is valid too.

If this PR legitimately has no ticket, add [noticket] (or [noissue]) to the PR
description body. The ID requirement is lifted; type/scope is still checked.
Editing the body re-runs this check -- no new push needed.`;

function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('::error::GITHUB_EVENT_PATH is unset -- cannot read the pull request');
    process.exit(1);
  }

  const pr = JSON.parse(readFileSync(eventPath, 'utf8')).pull_request;
  if (!pr) {
    console.error('::error::event payload has no pull_request -- wrong trigger?');
    process.exit(1);
  }

  const verdict = evaluate({ title: pr.title, body: pr.body });
  if (!verdict.ok) {
    console.error(`::error::The PR title "${pr.title}" carries no [TICKET-ID].${FAILURE_HELP}`);
    process.exit(1);
  }

  console.log(
    verdict.exempt
      ? 'Ticket ID not required: the PR body declares the no-ticket escape hatch.'
      : `Ticket ID present: ${JSON.stringify(pr.title)}`,
  );
}

// Run as a CLI only when invoked directly, so importing this module for tests
// never triggers the check.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main();
}

#!/usr/bin/env node
// Red-case runner for the PR-title ticket-ID rule (KB-116, KB-121).
//
// Imports the SAME module the workflow runs (pr-title-rule.mjs), which reads
// the SAME pattern file it loads in CI. The rule CI enforces and the rule
// tested here are one function, not two copies -- that identity is the point.
//
// Before KB-121 this runner could only reach the regex. The escape hatch lived
// in a GitHub expression in lint-pr.yaml, unreachable from any test, and had
// never been exercised on a real PR. Half the rule was proven; the other half
// was assumed. Moving the decision into the rule module is what made the hatch
// testable at all -- see the fixture's header for what that changed.
//
// Exits non-zero if any fixture row disagrees with the rule, including a row
// marked `fail` that the rule accepts. Per CONTRIBUTING.md "Enforcement
// Mechanisms", a mechanism never seen rejecting bad input must be assumed to
// enforce nothing; this runs on every PR so that proof is continuous.

import { readFileSync } from 'node:fs';
import { evaluate, hasEscapeMarker, loadPattern, ESCAPE_MARKERS, PATTERN_FILE } from './pr-title-rule.mjs';

const FIXTURE_FILE = '.github/fixtures/pr-titles.tsv';

let pattern;
try {
  pattern = loadPattern();
} catch (err) {
  console.error(`::error::${err.message}`);
  process.exit(1);
}

// "-" means the PR has no body at all. Distinct from an empty body, which is a
// row with nothing between the tabs -- both must fall through to the strict
// pattern, and both are in the table.
const decodeBody = (raw) => (raw === '-' ? null : raw.replace(/\\n/g, '\n'));

const rows = readFileSync(FIXTURE_FILE, 'utf8')
  .split('\n')
  .map((line, i) => ({ line, lineNo: i + 1 }))
  .filter(({ line }) => line.trim() && !line.trimStart().startsWith('#'))
  .map(({ line, lineNo }) => {
    const [expect, body, ...rest] = line.split('\t');
    return { expect: expect.trim(), body: decodeBody(body ?? '-'), title: rest.join('\t'), lineNo };
  });

if (rows.length === 0) {
  console.error(`::error::${FIXTURE_FILE} has no cases — the red case proves nothing`);
  process.exit(1);
}

let failures = 0;
let sawFailCase = false;
let sawExemptCase = false;

console.log(`Pattern: ${pattern.source}`);
console.log(`Markers: ${ESCAPE_MARKERS.join(' ')}\n`);

for (const { expect, body, title, lineNo } of rows) {
  if (expect !== 'pass' && expect !== 'fail') {
    console.error(`::error file=${FIXTURE_FILE},line=${lineNo}::expected "pass" or "fail", got "${expect}"`);
    failures++;
    continue;
  }
  if (expect === 'fail') sawFailCase = true;

  const verdict = evaluate({ title, body }, pattern);
  if (verdict.exempt) sawExemptCase = true;

  const ok = verdict.ok === (expect === 'pass');
  if (!ok) failures++;

  const shownBody = body === null ? '(no body)' : JSON.stringify(body);
  console.log(
    `${ok ? '  ok  ' : ' FAIL '} want=${expect.padEnd(4)} got=${(verdict.ok ? 'pass' : 'fail').padEnd(4)}` +
      `${verdict.exempt ? ' exempt' : '       '} ${JSON.stringify(title)}  body=${shownBody}`,
  );
  if (!ok) {
    console.error(
      `::error file=${FIXTURE_FILE},line=${lineNo}::rule ${verdict.ok ? 'accepted' : 'rejected'} a case marked "${expect}" ` +
        `(${verdict.reason}): ${JSON.stringify(title)} with body ${shownBody}`,
    );
  }
}

// A table of only-passing cases would go green against a rule that accepts
// everything -- exactly the KB-81 no-op regression. Refuse to call that proof.
if (!sawFailCase) {
  console.error(`::error::${FIXTURE_FILE} has no "fail" rows — this cannot demonstrate a red case`);
  process.exit(1);
}

// The mirror of the check above, and the reason this file changed in KB-121.
// A table where no row ever takes the exempt branch would go green against a
// rule whose escape hatch is dead -- which is the state the hatch was in
// before this fixture existed. Refuse to call that proof either.
if (!sawExemptCase) {
  console.error(
    `::error::${FIXTURE_FILE} has no rows that exercise the escape hatch — a dead hatch would pass unnoticed`,
  );
  process.exit(1);
}

// Guard the inherited case-insensitivity directly, not only through fixture
// rows. Someone deleting the .toLowerCase() would have to delete this too, and
// the assertion names why it exists.
for (const marker of ESCAPE_MARKERS) {
  if (!hasEscapeMarker(marker.toUpperCase())) {
    console.error(
      `::error::hasEscapeMarker() rejected ${marker.toUpperCase()} — GitHub's contains() was case-insensitive, ` +
        'so uppercase markers have always worked. Dropping that silently breaks PRs that pass today.',
    );
    failures++;
  }
}

console.log(`\n${rows.length - failures}/${rows.length} cases as expected.`);
if (failures > 0) {
  console.error(`::error::PR-title rule does not behave as the fixture requires (${failures} mismatched).`);
  process.exit(1);
}
console.log(`Red case holds: ${PATTERN_FILE} still rejects bad titles, and the escape hatch still escapes.`);

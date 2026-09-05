#!/usr/bin/env node
// Red-case runner for the PR-title ticket-ID pattern (KB-116).
//
// Reads the SAME pattern file that .github/workflows/lint-pr.yaml loads into
// the semantic-pull-request action, so the pattern CI enforces and the pattern
// tested here cannot drift apart -- that identity is the point of the file.
//
// Exits non-zero if any fixture row disagrees with the pattern, including a
// row marked `fail` that the pattern accepts. Per CONTRIBUTING.md "Enforcement
// Mechanisms", a mechanism never seen rejecting bad input must be assumed to
// enforce nothing; this runs on every PR so that proof is continuous.

import { readFileSync } from 'node:fs';

const PATTERN_FILE = '.github/pr-title-pattern.txt';
const FIXTURE_FILE = '.github/fixtures/pr-titles.tsv';

const source = readFileSync(PATTERN_FILE, 'utf8').trim();
if (!source) {
  console.error(`::error::${PATTERN_FILE} is empty — the workflow would load an empty pattern`);
  process.exit(1);
}

let pattern;
try {
  pattern = new RegExp(source);
} catch (err) {
  console.error(`::error::${PATTERN_FILE} is not a valid regex: ${err.message}`);
  process.exit(1);
}

const rows = readFileSync(FIXTURE_FILE, 'utf8')
  .split('\n')
  .map((line, i) => ({ line, lineNo: i + 1 }))
  .filter(({ line }) => line.trim() && !line.trimStart().startsWith('#'))
  .map(({ line, lineNo }) => {
    const [expect, ...rest] = line.split('\t');
    return { expect: expect.trim(), subject: rest.join('\t'), lineNo };
  });

if (rows.length === 0) {
  console.error(`::error::${FIXTURE_FILE} has no cases — the red case proves nothing`);
  process.exit(1);
}

let failures = 0;
let sawFailCase = false;

console.log(`Pattern: ${source}\n`);
for (const { expect, subject, lineNo } of rows) {
  if (expect !== 'pass' && expect !== 'fail') {
    console.error(`::error file=${FIXTURE_FILE},line=${lineNo}::expected "pass" or "fail", got "${expect}"`);
    failures++;
    continue;
  }
  if (expect === 'fail') sawFailCase = true;

  const matched = pattern.test(subject);
  const ok = matched === (expect === 'pass');
  if (!ok) failures++;
  console.log(
    `${ok ? '  ok  ' : ' FAIL '} want=${expect.padEnd(4)} got=${(matched ? 'pass' : 'fail').padEnd(4)} ${JSON.stringify(subject)}`,
  );
  if (!ok) {
    console.error(
      `::error file=${FIXTURE_FILE},line=${lineNo}::pattern ${matched ? 'accepted' : 'rejected'} a subject marked "${expect}": ${JSON.stringify(subject)}`,
    );
  }
}

// A table of only-passing cases would go green against a pattern that accepts
// everything -- exactly the KB-81 no-op regression. Refuse to call that proof.
if (!sawFailCase) {
  console.error(`::error::${FIXTURE_FILE} has no "fail" rows — this cannot demonstrate a red case`);
  process.exit(1);
}

console.log(`\n${rows.length - failures}/${rows.length} cases as expected.`);
if (failures > 0) {
  console.error(`::error::PR-title pattern does not behave as the fixture requires (${failures} mismatched).`);
  process.exit(1);
}
console.log('Red case holds: the pattern still rejects every bad subject.');

#!/usr/bin/env node
// Drift guard between templates/ bundles and the KB's own live files (KB-64).
//
// A template the KB does not itself run is a template nobody proves. lint-pr is
// the one workflow that genuinely exists in both places, so the bundle under
// templates/github-workflow-lint-pr/ must stay byte-identical to the live copy
// it was cut from. Edit one without the other and this fails.
//
// Direction matters and cuts both ways. Editing .github/workflows/lint-pr.yaml
// alone silently ships a stale template to every downstream repo -- the KB-64
// failure. Editing the template alone ships a convention the KB does not run --
// the "do as I say" failure. Neither is allowed.
//
// Comparison is bundle-scoped, NOT a symmetric tree diff: the repo legitimately
// holds much more than any bundle carries. Every file the bundle contains must
// match its counterpart at the repo root; extra root files are none of the
// bundle's business.
//
// A bundle root mirrors the REPO root, not .github/ (KB-117). The lint-settings
// bundle carries schemas/ alongside .github/, so walking a hardcoded .github/
// would silently skip six files and still report "in sync" -- partial coverage
// that reads as full coverage, which is worse than failing outright.
//
// A bundle's own README.md documents adoption and is deliberately NOT copied
// downstream, so it is excluded from comparison.

import { readFileSync, readdirSync, statSync, existsSync, mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { tmpdir } from 'node:os';

const BUNDLES = [
  'templates/github-workflow-lint-pr',
  'templates/github-workflow-lint-settings',
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

// Returns a list of human-readable problems; empty means the bundle is in sync.
function carriedFiles(bundleRoot) {
  // Everything the bundle ships downstream: the whole tree minus its own README.
  return walk(bundleRoot).filter((f) => relative(bundleRoot, f) !== 'README.md');
}

function compareBundle(bundleRoot, repoRoot) {
  const problems = [];
  if (!existsSync(bundleRoot)) return [`${bundleRoot} does not exist`];
  const files = carriedFiles(bundleRoot);
  if (files.length === 0) return [`${bundleRoot} carries no files — nothing to compare`];

  for (const file of files) {
    const rel = relative(bundleRoot, file);           // e.g. .github/workflows/lint-pr.yaml
    const live = join(repoRoot, rel);
    if (!existsSync(live)) {
      problems.push(`${rel}: present in the template, missing from the repo's live copy`);
      continue;
    }
    if (readFileSync(file, 'utf8') !== readFileSync(live, 'utf8')) {
      problems.push(`${rel}: template and live copy differ`);
    }
  }
  return problems;
}

// Red case (CONTRIBUTING.md "Enforcement Mechanisms"): prove the comparison can
// still detect a difference. A drift guard that cannot go red is decoration --
// and unlike a static fixture, this one needs no permanently-broken file
// checked in: mutate a throwaway copy and assert it is caught.
function selfTest() {
  const bundle = BUNDLES[0];
  const tmp = mkdtempSync(join(tmpdir(), 'drift-selftest-'));
  try {
    for (const file of carriedFiles(bundle)) {
      const rel = relative(bundle, file);
      const dest = join(tmp, rel);
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, readFileSync(file, 'utf8'));
    }
    // Identical copy: must report clean.
    if (compareBundle(bundle, tmp).length !== 0) {
      return 'self-test: an identical copy was reported as drifted';
    }
    // Mutate one carried file: must be caught.
    const victim = join(tmp, relative(bundle, carriedFiles(bundle)[0]));
    writeFileSync(victim, readFileSync(victim, 'utf8') + '\n# drift\n');
    if (compareBundle(bundle, tmp).length === 0) {
      return 'self-test: a mutated file was NOT detected — the drift guard is inert';
    }
    // Remove a carried file: must be caught.
    rmSync(victim);
    if (compareBundle(bundle, tmp).length === 0) {
      return 'self-test: a deleted file was NOT detected — the drift guard is inert';
    }
    return null;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

const selfTestFailure = selfTest();
if (selfTestFailure) {
  console.error(`::error::${selfTestFailure}`);
  process.exit(1);
}
console.log('Red case holds: the drift guard still detects modified and missing files.\n');

let failed = false;
for (const bundle of BUNDLES) {
  const problems = compareBundle(bundle, '.');
  if (problems.length === 0) {
    console.log(`  ok   ${bundle} matches the repo's live files`);
    continue;
  }
  failed = true;
  for (const p of problems) {
    console.log(` FAIL  ${bundle} — ${p}`);
    console.error(`::error::${bundle}: ${p}`);
  }
}

if (failed) {
  console.error(
    '::error::Template bundle and live .github/ have drifted. Update BOTH: the KB runs what it ships, and ships what it runs.',
  );
  process.exit(1);
}
console.log(`\n${BUNDLES.length} bundle(s) in sync.`);

// Sync skills/*/SKILL.md to Linear agent skills.
//
// Usage: node linear-skills.mjs <check|deploy>
//
//   check  — dry run for PRs. Diffs repo (base + head) against Linear and
//            prints a per-team plan (CREATE / UPDATE / DELETE / DRIFT /
//            CONFLICT / UP-TO-DATE). Read-only; never mutates Linear.
//   deploy — upserts every repo skill to each team, deletes orphans (skills
//            on Linear with no matching repo dir) and removes surplus copies
//            when a title was duplicated by an earlier run. Exits non-zero if
//            any mutation fails.
//
// Env:
//   LINEAR_API_KEY     — personal/OAuth API key (required)
//   LINEAR_SKILL_TEAMS — comma-separated team names, e.g. "vidbina,zero"
//   GITHUB_BASE_SHA    — PR base commit (check mode only; for drift detection)
//
// A skill's Linear title is its directory name under skills/.
// When either env var is missing the script is a graceful noop (fork-friendly).

import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LinearClient } from "@linear/sdk";

const SKILLS_DIR = "skills";

const mode = process.argv[2];
if (mode !== "check" && mode !== "deploy") {
  console.error(`Usage: node linear-skills.mjs <check|deploy>`);
  process.exit(2);
}

const apiKey = process.env.LINEAR_API_KEY;
const teamsRaw = process.env.LINEAR_SKILL_TEAMS;

if (!apiKey || !teamsRaw) {
  console.log(
    "Skipping skill sync — LINEAR_API_KEY or LINEAR_SKILL_TEAMS not configured.",
  );
  process.exit(0);
}

const linear = new LinearClient({ apiKey });
const gql = (query, variables) => linear.client.rawRequest(query, variables);

// --- Linear API ---

async function resolveTeamId(name) {
  const { data } = await gql(
    `query($name: String!) { teams(filter: { name: { eq: $name } }) { nodes { id } } }`,
    { name },
  );
  return data?.teams?.nodes?.[0]?.id ?? "";
}

// Fetch every skill scoped to the team. NOTE: do NOT filter on `shared` — that
// boolean means "shared with the whole workspace", not "team-shared". Skills
// created via agentSkillCreate with a teamId default to shared=false yet still
// show up as team-shared skills. Filtering shared=true here returned nothing,
// so each deploy re-created all skills instead of upserting (KB-50).
async function fetchTeamSkills(teamId) {
  const { data } = await gql(
    `query($teamId: ID!) {
       agentSkills(filter: { team: { id: { eq: $teamId } } }) {
         nodes { id title body createdAt }
       }
     }`,
    { teamId },
  );
  return data?.agentSkills?.nodes ?? [];
}

// Group team skills by title. A title may map to several skills when earlier
// deploys created duplicates; the oldest is treated as canonical (kept and
// updated in place) and the rest are surplus copies to delete.
function groupByTitle(skills) {
  const byTitle = new Map();
  for (const skill of skills) {
    const copies = byTitle.get(skill.title);
    if (copies) copies.push(skill);
    else byTitle.set(skill.title, [skill]);
  }
  for (const copies of byTitle.values()) {
    copies.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  }
  return byTitle;
}

async function createSkill(title, body, teamId) {
  const { data } = await gql(
    `mutation($input: AgentSkillCreateInput!) {
       agentSkillCreate(input: $input) { success }
     }`,
    { input: { title, body, teamId } },
  );
  return data?.agentSkillCreate?.success === true;
}

async function updateSkill(id, title, body) {
  const { data } = await gql(
    `mutation($id: String!, $input: AgentSkillUpdateInput!) {
       agentSkillUpdate(id: $id, input: $input) { success }
     }`,
    { id, input: { title, body } },
  );
  return data?.agentSkillUpdate?.success === true;
}

async function deleteSkill(id) {
  const { data } = await gql(
    `mutation($id: String!) { agentSkillDelete(id: $id) { success } }`,
    { id },
  );
  return data?.agentSkillDelete?.success === true;
}

// --- repo helpers ---

function discoverRepoSkills() {
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => {
      try {
        readFileSync(join(SKILLS_DIR, name, "SKILL.md"));
        return true;
      } catch {
        return false;
      }
    })
    .sort();
}

function skillBodyOnDisk(skill) {
  try {
    return readFileSync(join(SKILLS_DIR, skill, "SKILL.md"), "utf8");
  } catch {
    return "";
  }
}

function skillBodyAtRef(ref, skill) {
  try {
    return execFileSync(
      "git",
      ["show", `${ref}:${SKILLS_DIR}/${skill}/SKILL.md`],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    );
  } catch {
    return "";
  }
}

function unifiedDiff(a, b) {
  const dir = mkdtempSync(join(tmpdir(), "skilldiff-"));
  const fa = join(dir, "a");
  const fb = join(dir, "b");
  writeFileSync(fa, a);
  writeFileSync(fb, b);
  try {
    execFileSync("diff", [fa, fb], { encoding: "utf8" });
    return ""; // identical
  } catch (err) {
    return err.stdout ?? ""; // diff exits 1 when files differ
  }
}

const teamNames = teamsRaw
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);

const repoSkills = discoverRepoSkills();

if (mode === "check") {
  await runCheck();
} else {
  await runDeploy();
}

// --- check (PR dry run) ---

async function runCheck() {
  const baseSha = process.env.GITHUB_BASE_SHA ?? "";

  console.log("## Linear Skill Deployment Plan\n");
  console.log(`Skills in repo: ${repoSkills.join(", ")}\n`);

  let anyChanges = false;

  for (const teamName of teamNames) {
    const teamId = await resolveTeamId(teamName);
    if (!teamId) {
      console.log(`### Team: ${teamName} (NOT FOUND — skipping)\n`);
      continue;
    }

    console.log(`### Team: ${teamName}\n`);
    const linearSkills = await fetchTeamSkills(teamId);
    const byTitle = groupByTitle(linearSkills);

    for (const skill of repoSkills) {
      const baseBody = baseSha ? skillBodyAtRef(baseSha, skill) : "";
      const headBody = skillBodyOnDisk(skill);
      const copies = byTitle.get(skill) ?? [];
      const existing = copies[0];
      const linearBody = existing?.body ?? "";
      const linearId = existing?.id ?? "";

      if (!headBody) {
        if (linearId) {
          console.log(
            `- **${skill}**: DELETE (file removed, exists on Linear)`,
          );
          anyChanges = true;
        }
      } else if (!linearId) {
        console.log(`- **${skill}**: CREATE`);
        anyChanges = true;
      } else if (headBody === linearBody) {
        console.log(`- **${skill}**: UP-TO-DATE`);
      } else if (baseBody !== headBody && baseBody === linearBody) {
        console.log(`- **${skill}**: UPDATE (changed in this PR)`);
        anyChanges = true;
      } else if (baseBody === headBody && headBody !== linearBody) {
        console.log(
          `- **${skill}**: DRIFT (Linear edited manually, no file change)`,
        );
        printDiff("Drift diff (repo vs Linear)", headBody, linearBody);
        anyChanges = true;
      } else if (baseBody !== headBody && baseBody !== linearBody) {
        console.log(`- **${skill}**: CONFLICT (file and Linear both changed)`);
        printDiff("File diff (base to head)", baseBody, headBody);
        printDiff("Linear drift (base to Linear)", baseBody, linearBody);
        anyChanges = true;
      } else {
        console.log(`- **${skill}**: UPDATE (content differs)`);
        anyChanges = true;
      }

      if (copies.length > 1) {
        console.log(
          `  - DUPLICATE: ${copies.length - 1} surplus cop${copies.length - 1 === 1 ? "y" : "ies"} on Linear — will delete`,
        );
        anyChanges = true;
      }
    }

    const orphans = linearSkills.filter((s) => !repoSkills.includes(s.title));
    if (orphans.length) {
      console.log(`\n**Orphaned skills on Linear** (not in repo):`);
      for (const o of orphans) console.log(`- ${o.title}`);
    }

    console.log("");
  }

  if (!anyChanges) console.log("No skill changes detected.");
}

function printDiff(summary, a, b) {
  const d = unifiedDiff(a, b);
  console.log("");
  console.log(`  <details><summary>${summary}</summary>\n`);
  console.log("  ```diff");
  console.log(d.replace(/\n$/, ""));
  console.log("  ```");
  console.log("  </details>\n");
}

// --- deploy (post-merge) ---

async function runDeploy() {
  console.log(`Skills in repo: ${repoSkills.join(", ")}\n`);

  let created = 0;
  let updated = 0;
  let deleted = 0;
  let skipped = 0;
  let failed = 0;

  for (const teamName of teamNames) {
    const teamId = await resolveTeamId(teamName);
    if (!teamId) {
      console.log(`=== Team: ${teamName} (NOT FOUND — skipping) ===\n`);
      continue;
    }

    console.log(`=== Team: ${teamName} ===`);
    const linearSkills = await fetchTeamSkills(teamId);
    const byTitle = groupByTitle(linearSkills);

    for (const skill of repoSkills) {
      const fileBody = skillBodyOnDisk(skill);
      const copies = byTitle.get(skill) ?? [];
      const [canonical, ...dupes] = copies;

      try {
        if (!canonical) {
          console.log(`  CREATE: ${skill}`);
          (await createSkill(skill, fileBody, teamId)) ? created++ : fail();
        } else if (fileBody !== canonical.body) {
          console.log(`  UPDATE: ${skill}`);
          (await updateSkill(canonical.id, skill, fileBody))
            ? updated++
            : fail();
        } else {
          console.log(`  UP-TO-DATE: ${skill}`);
          skipped++;
        }

        // Collapse any duplicate copies of this title onto the canonical one.
        for (const dup of dupes) {
          console.log(`  DELETE (duplicate): ${skill}`);
          (await deleteSkill(dup.id)) ? deleted++ : fail();
        }
      } catch (err) {
        console.log(`  FAILED: ${err.message ?? err}`);
        failed++;
      }

      function fail() {
        console.log(`  FAILED: ${skill}`);
        failed++;
      }
    }

    const orphans = linearSkills.filter((s) => !repoSkills.includes(s.title));
    for (const orphan of orphans) {
      console.log(`  DELETE (orphan): ${orphan.title}`);
      try {
        if (await deleteSkill(orphan.id)) {
          deleted++;
        } else {
          console.log(`  FAILED: ${orphan.title}`);
          failed++;
        }
      } catch (err) {
        console.log(`  FAILED: ${err.message ?? err}`);
        failed++;
      }
    }

    console.log("");
  }

  console.log("=== Summary ===");
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Deleted: ${deleted}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed:  ${failed}`);

  if (failed > 0) {
    console.log(`::error::${failed} skill deployments failed`);
    process.exit(1);
  }
}

#!/usr/bin/env node
// Verifies package policy files restate the canonical gate policy
// (docs/gate-policy.md) and that stale pre-v2 gate language has not crept
// back into de-gated skills. Run by scripts/smoke-test.sh.

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const CANONICAL_SENTENCES = [
  "gates scale with blast radius, reversibility, and disclosure sensitivity",
  "fall back to confirmation rather than treating the operation as direct-run",
];

// Markdown wraps lines, so match on whitespace-normalized, lowercased text.
const normalize = (s) => s.toLowerCase().replace(/\s+/g, " ");

const checks = [
  {
    file: "docs/gate-policy.md",
    mustContain: [
      ...CANONICAL_SENTENCES,
      "single-statement SELECT",
      "1000 rows/values",
      "100 history records",
      "SQL result exports",
      "all asset exports",
      "existing screenshots/thumbnails",
    ],
  },
  {
    file: "plugins/preset-api-skills/skills/preset-api/references/safety-policy.md",
    mustContain: [
      "<!-- gate-policy v2 -->",
      ...CANONICAL_SENTENCES,
      "single-statement SELECT",
      "hard cap 1000 rows/values or 100 history records",
      "SQL result exports",
      "all asset exports",
      "existing screenshots/thumbnails",
    ],
    mustNotContain: [
      "Require explicit confirmation before mutations, data-returning reads",
      "broad or secret-bearing exports",
    ],
  },
  {
    file: "plugins/preset-api-skills/AGENTS.md",
    mustContain: ["all asset exports", "single-statement SELECT", "existing screenshots/thumbnails"],
    mustNotContain: ["broad or secret-bearing exports"],
  },
  {
    file: "plugins/preset-api-skills/README.md",
    mustContain: ["all asset exports", "single-statement SELECT", "existing screenshots/thumbnails"],
    mustNotContain: ["broad exports", "broad or secret-bearing exports"],
  },
  {
    file: "plugins/preset-api-skills/.github/copilot-instructions.md",
    mustContain: ["all asset exports", "single-statement SELECT", "existing screenshots/thumbnails"],
    mustNotContain: ["broad or secret-bearing exports"],
  },
  {
    file: "plugins/preset-api-skills/skills/preset-api/SKILL.md",
    mustContain: ["all asset exports", "trusted context", "existing screenshots/thumbnails"],
    mustNotContain: ["broad or secret-bearing exports"],
  },
  {
    file: "plugins/preset-cli-skills/skills/preset-cli/references/safety-policy.md",
    mustContain: ["<!-- gate-policy v2 -->", "pure single-statement `SELECT`", "familiar workspace"],
  },
  {
    file: "plugins/preset-cli-skills/skills/preset-cli/SKILL.md",
    mustContain: ["pure single-statement `SELECT`", "Non-`SELECT` SQL"],
  },
  {
    file: "plugins/preset-cli-skills/skills/preset-cli/references/assets-read.md",
    mustContain: ["bounded output", "--limit 100", "familiar workspace"],
    mustNotContain: [
      "confirm scope",
      "Before using them, load [sql-data-safety.md](sql-data-safety.md) and [safety-policy.md](safety-policy.md)",
      "safe to run after confirming the workspace",
    ],
  },
  {
    file: "plugins/preset-cli-skills/skills/preset-cli/references/workspace-and-config.md",
    mustContain: ["Resolve the workspace before data-returning reads", "familiar workspace"],
    mustNotContain: ["Always confirm the workspace before running anything that returns data"],
  },
  {
    file: "plugins/preset-cli-skills/skills/preset-cli/references/sql-data-safety.md",
    mustContain: ["run directly with explicit output bounds", "pure single-statement `SELECT`", "familiar workspace"],
    mustNotContain: ["After the scope check, load [safety-policy.md](safety-policy.md)"],
  },
  // MCP package: guard its intent-proportional language against regression.
  {
    file: "plugins/preset-mcp-skills/skills/preset-mcp/references/tool-categories.md",
    mustContain: ["smallest set of calls"],
    mustNotContain: ["Prefer core and discovery tools before data or mutation tools"],
  },
  // Stale-language sentinels in de-gated skills and their references. A
  // de-gated read must not be re-gated by a reference the skill still links.
  {
    file: "plugins/preset-api-skills/skills/preset-dashboards/SKILL.md",
    mustNotContain: ["Stop before chart data retrieval"],
  },
  {
    file: "plugins/preset-api-skills/skills/preset-sqllab/SKILL.md",
    mustNotContain: ["get confirmation before listing or retrieving them"],
  },
  {
    file: "plugins/preset-api-skills/skills/preset-sql-execution/SKILL.md",
    mustContain: ["result exports"],
    mustNotContain: [
      "Stop before any SQL execution, result retrieval",
      "result exports beyond the current workflow's queries",
    ],
  },
  {
    file: "plugins/preset-api-skills/skills/preset-sqllab/references/routing-essentials.md",
    mustContain: ["Run directly:"],
    mustNotContain: ["Stop before sensitive read, result retrieval"],
  },
  {
    file: "plugins/preset-api-skills/skills/preset-sqllab/references/sql-execution.md",
    mustContain: ["Direct path:"],
  },
  {
    file: "plugins/preset-api-skills/skills/preset-dashboards/references/dashboard-composition.md",
    mustNotContain: ["get explicit confirmation before fetching data"],
  },
  {
    file: "plugins/preset-api-skills/skills/preset-dashboards/references/dashboard-chart-mutations.md",
    mustContain: ["Run directly:"],
    mustNotContain: ["favorite create/delete changes user state"],
  },
];

let failures = 0;
for (const check of checks) {
  let text;
  try {
    text = readFileSync(resolve(root, check.file), "utf8");
  } catch {
    console.error(`gate-policy: missing file ${check.file}`);
    failures += 1;
    continue;
  }
  const haystack = normalize(text);
  for (const needle of check.mustContain ?? []) {
    if (!haystack.includes(normalize(needle))) {
      console.error(`gate-policy: ${check.file} missing canonical text: "${needle}"`);
      failures += 1;
    }
  }
  for (const needle of check.mustNotContain ?? []) {
    if (haystack.includes(normalize(needle))) {
      console.error(`gate-policy: ${check.file} contains stale gate language: "${needle}"`);
      failures += 1;
    }
  }
}

if (failures > 0) {
  console.error(`Gate policy drift check failed with ${failures} issue(s).`);
  process.exit(1);
}
console.log("Gate policy drift check passed.");

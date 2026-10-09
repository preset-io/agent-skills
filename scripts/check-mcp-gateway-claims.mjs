#!/usr/bin/env node
// Flags stale claims that Superset alone defines the Preset MCP gateway's
// top-level tools, or that a Superset checkout is the only source of truth for
// MCP tool names, in the MCP package docs.
//
// The gateway (preset-io/mcp-gateway, src/mcp_gateway/app.py) defines its own
// top-level tools: list_workspaces, list_workspace_services,
// search_workspace_tools, call_tool, and get_workspace_catalog. Superset
// defines only the workspace tools reached through them. A
// statement about "the source of truth for tools" must therefore be scoped to a
// surface ("gateway", "direct connection", or "workspace tool").
//
// Usage:
//   node scripts/check-mcp-gateway-claims.mjs            # scan the repository docs
//   import { findStaleClaims } from "./check-mcp-gateway-claims.mjs"
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_ROOTS = ["plugins/preset-mcp-skills", "README.md"];
const SCAN_EXTENSIONS = new Set([".md", ".json", ".toml"]);
const SKIP_FILES = new Set(["tool-inventory.json"]);

// Phrases that are wrong on their face once a gateway exists.
const FORBIDDEN = [
  {
    id: "only-source-of-truth",
    pattern: /\b(?:only|sole|single)\s+source\s+of\s+truth\b[^.\n]{0,80}\btools?\b/i,
    message: 'claims a single "only" source of truth for MCP tools',
  },
  {
    id: "superset-alone-defines",
    pattern:
      /\bSuperset(?:\s+MCP)?(?:\s+(?:server|service))?\s+(?:alone|only|solely)\s+(?:defines|provides|owns|exposes)\b[^.\n]{0,80}\btools?\b/i,
    message: "claims Superset alone defines the tools",
  },
  {
    id: "all-top-level-from-superset",
    pattern:
      /\b(?:all|every)\s+(?:of\s+)?(?:the\s+)?(?:gateway(?:'s)?\s+)?(?:top-level\s+)?tools?\b[^.\n]{0,60}\b(?:come|comes|are\s+defined|defined)\s+(?:from|by)\s+(?:the\s+)?Superset\b/i,
    message: "claims the gateway's top-level tools come from Superset",
  },
  {
    id: "gateway-has-no-own-tools",
    pattern: /\bgateway\b[^.\n]{0,60}\b(?:has|exposes|defines)\s+no\s+(?:top-level\s+)?tools?\s+of\s+its\s+own\b/i,
    message: "claims the gateway has no tools of its own",
  },
];

// A sentence that names Superset as a source of truth for tools must say which
// surface it means; unrelated sentences or table cells cannot scope the claim.
const SCOPE_WORDS = /\b(?:gateway|direct\s+(?:connection|workspace)|workspace\s+tools?|workspace\s+\(Superset\)\s+tools?)\b/i;

export function blocks(text) {
  const result = [];
  let current = null;
  const lines = text.split("\n");
  lines.forEach((line, index) => {
    const startsBlock = /^\s*(?:[-*]\s|\d+\.\s|\|)/.test(line);
    if (line.trim() === "") {
      current = null;
      return;
    }
    if (current === null || startsBlock) {
      current = { line: index + 1, text: line };
      result.push(current);
    } else {
      current.text += `\n${line}`;
    }
  });
  return result;
}

export function findStaleClaims(text) {
  const findings = [];
  const flat = text.replace(/\s+/g, " ");
  for (const rule of FORBIDDEN) {
    const match = flat.match(rule.pattern);
    if (match) findings.push({ rule: rule.id, message: rule.message, excerpt: match[0].slice(0, 120) });
  }
  for (const block of blocks(text)) {
    const sentences = block.text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+|\s*\|\s*/);
    for (const body of sentences) {
      if (/source\s+of\s+truth/i.test(body) && /\bSuperset\b/i.test(body) && /\btools?\b/i.test(body)) {
        if (!SCOPE_WORDS.test(body)) {
          findings.push({
            rule: "unscoped-source-of-truth",
            message: "names Superset as the source of truth for tools without saying gateway, direct connection/workspace, or workspace tools",
            excerpt: body.slice(0, 120),
            line: block.line,
          });
        }
      }
    }
  }
  return findings;
}

function listFiles(target) {
  const full = path.join(ROOT, target);
  if (!fs.existsSync(full)) return [];
  const stat = fs.statSync(full);
  if (stat.isFile()) return [full];
  const out = [];
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const child = path.join(full, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(path.relative(ROOT, child)));
    else if (SCAN_EXTENSIONS.has(path.extname(entry.name)) && !SKIP_FILES.has(entry.name)) out.push(child);
  }
  return out;
}

// Release scope: Knowledge document tools are not part of the initial public
// release, so no Knowledge tool or service name may appear in the released copy
// of the MCP package (skills, docs, manifests, listing metadata, starter prompts)
// or in its fixtures and tests. A neutral line that some workspace services may
// be unavailable is fine; naming Knowledge is not. Reintroducing the term needs
// a deliberate change to OUT_OF_SCOPE_ALLOWLIST below, with a reason.
// This is an agent-guidance scope policy, NOT a confidentiality/redaction gate.
// mirror-public.yml publishes the full master tree and reachable history to
// preset-io/agent-skills; allowlisted files are public too. The guard test and
// synthetic term probes are safe public test inputs, not an operational tool
// inventory. Removing text here does not remove it from mirrored git history.
export const OUT_OF_SCOPE_PATTERN = /knowledge/i;
export const OUT_OF_SCOPE_SCAN_ROOTS = [
  "plugins/preset-mcp-skills",
  "README.md",
  "tests/fixtures/mcp-gateway",
  "tests/lib",
  "tests",
];
const OUT_OF_SCOPE_SCAN_EXTENSIONS = new Set([".md", ".json", ".toml", ".mjs"]);
export const OUT_OF_SCOPE_ALLOWLIST = [
  {
    file: "tests/fixtures/mcp-gateway-guard/knowledge-samples.json",
    reason: "Public synthetic term probes required to test the guard, with no operational tool or implementation inventory.",
  },
  {
    file: "tests/release-scope-guard.test.mjs",
    reason: "Public tests of the agent-guidance scope policy; naming the term here verifies detection, not service availability.",
  },
];

export function findOutOfScopeTerms(text) {
  return text
    .split("\n")
    .map((line, index) => ({ line: index + 1, excerpt: line.trim().slice(0, 120), hit: OUT_OF_SCOPE_PATTERN.test(line) }))
    .filter((entry) => entry.hit)
    .map(({ line, excerpt }) => ({
      rule: "release-scope-knowledge",
      message: "names Knowledge, which is not in the initial public release",
      excerpt,
      line,
    }));
}

function listOutOfScopeFiles(target) {
  const full = path.join(ROOT, target);
  if (!fs.existsSync(full)) return [];
  if (fs.statSync(full).isFile()) return [full];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(target, entry.name);
    if (entry.isDirectory()) return listOutOfScopeFiles(child);
    return OUT_OF_SCOPE_SCAN_EXTENSIONS.has(path.extname(entry.name)) ? [path.join(ROOT, child)] : [];
  });
}

export function scanRepository() {
  const failures = [];
  for (const file of SCAN_ROOTS.flatMap(listFiles)) {
    for (const finding of findStaleClaims(fs.readFileSync(file, "utf8"))) {
      failures.push({ file: path.relative(ROOT, file), ...finding });
    }
  }
  const allowed = new Set(OUT_OF_SCOPE_ALLOWLIST.map((entry) => entry.file));
  for (const file of OUT_OF_SCOPE_SCAN_ROOTS.flatMap(listOutOfScopeFiles)) {
    const rel = path.relative(ROOT, file);
    if (allowed.has(rel)) continue;
    for (const finding of findOutOfScopeTerms(fs.readFileSync(file, "utf8"))) failures.push({ file: rel, ...finding });
  }
  // An allowlist entry must point at a real file and carry a reason.
  for (const entry of OUT_OF_SCOPE_ALLOWLIST) {
    if (!entry.reason || !fs.existsSync(path.join(ROOT, entry.file))) {
      failures.push({ file: entry.file, rule: "release-scope-allowlist-invalid", message: "allowlist entry needs an existing file and a reason", excerpt: "" });
    }
  }
  return failures;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const failures = scanRepository();
  if (failures.length > 0) {
    console.error("Stale MCP gateway claims found:");
    for (const f of failures) {
      console.error(`- ${f.file}${f.line ? `:${f.line}` : ""} [${f.rule}] ${f.message}: "${f.excerpt}"`);
    }
    process.exit(1);
  }
  console.log("MCP gateway claim check passed.");
}

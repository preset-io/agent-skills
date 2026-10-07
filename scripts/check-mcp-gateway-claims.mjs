#!/usr/bin/env node
// Flags stale claims that Superset alone defines the Preset MCP gateway's
// top-level tools, or that a Superset checkout is the only source of truth for
// MCP tool names, in the MCP package docs.
//
// The gateway (preset-io/mcp-gateway, src/mcp_gateway/app.py) defines its own
// top-level tools: list_workspaces, list_workspace_services,
// search_workspace_tools, call_tool, get_workspace_catalog, and the Knowledge
// tools. Superset defines only the workspace tools reached through them. A
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
// surface it means; unrelated direct-API boundary text cannot scope the claim.
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
    const sentences = block.text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/);
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

export function scanRepository() {
  const failures = [];
  for (const file of SCAN_ROOTS.flatMap(listFiles)) {
    for (const finding of findStaleClaims(fs.readFileSync(file, "utf8"))) {
      failures.push({ file: path.relative(ROOT, file), ...finding });
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

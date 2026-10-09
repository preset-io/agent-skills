#!/usr/bin/env node
// Writes (or with --check verifies) every MCP connection config file of
// plugins/preset-mcp-skills from the single source
// plugins/preset-mcp-skills/connections/gateway.json, each in its own target's
// official shape. See scripts/lib/mcp-config.mjs.
//
// Usage:
//   node scripts/sync-mcp-config.mjs           # write
//   node scripts/sync-mcp-config.mjs --check   # fail on drift
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { clientsIndexFields, generatedFiles, manifestFields, PACKAGE, readSource } from "./lib/mcp-config.mjs";

const ROOT = process.cwd();
const check = process.argv.includes("--check");
const source = readSource(ROOT);
const drift = [];
let written = 0;

function sync(rel, expected) {
  const file = path.join(ROOT, rel);
  const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  if (current === expected) return;
  if (check) {
    drift.push(rel);
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, expected);
  written += 1;
  console.log(`wrote ${rel}`);
}

for (const [rel, content] of Object.entries(generatedFiles(source))) sync(rel, content);

// Manifests keep their own formatting and key order; only the MCP field is set.
for (const [rel, fields] of Object.entries(manifestFields(source))) {
  const raw = fs.readFileSync(path.join(ROOT, rel), "utf8");
  const manifest = JSON.parse(raw);
  const keys = Object.keys(manifest);
  const next = {};
  for (const key of keys) next[key] = manifest[key];
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) delete next[key];
    else next[key] = value;
  }
  sync(rel, `${JSON.stringify(next, null, 2)}\n`);
}

const indexRel = `${PACKAGE}/connections/clients.json`;
const index = JSON.parse(fs.readFileSync(path.join(ROOT, indexRel), "utf8"));
const derived = clientsIndexFields(source);
index.endpoint = derived.endpoint;
index.serverName = derived.serverName;
index.pluginManifests.serverName = derived.pluginServerName;
for (const client of index.clients) {
  Object.assign(client, derived.commands[client.id]);
}
for (const target of index.pluginManifests.targets) {
  const shape = derived.shapes[target.id];
  if (target.id === "claude-code") target.manifestField = { mcpServers: shape };
  else target.shape = shape;
}
sync(indexRel, `${JSON.stringify(index, null, 2)}\n`);

if (check) {
  if (drift.length > 0) {
    console.error("MCP connection config drifted from plugins/preset-mcp-skills/connections/gateway.json:");
    for (const rel of drift) console.error(`- ${rel}`);
    console.error("\nRun `node scripts/sync-mcp-config.mjs` to fix.");
    process.exit(1);
  }
  console.log(`MCP connection config matches ${source.endpoint} for every target.`);
} else {
  console.log(`Synced MCP connection config (${written} file(s) changed).`);
}

#!/usr/bin/env node
// Single source of truth for the package version across every provider manifest.
//
// The version lives in the top-level VERSION file and is stamped into each
// plugin's per-provider manifest. Claude Code and OpenAI Codex cache plugins by
// this version, so they only surface an update when it changes; keeping all
// manifests in lockstep (and equal to the published git tag) is what makes a
// single release reach every provider instead of leaving some frozen.
//
// Usage:
//   node scripts/sync-version.mjs           # write VERSION into every manifest
//   node scripts/sync-version.mjs --check   # fail if any manifest has drifted
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const VERSION_FILE = path.join(ROOT, "VERSION");
const PLUGINS = ["preset-api-skills", "preset-mcp-skills", "preset-cli-skills"];
const MANIFESTS = [
  ".claude-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  ".cursor-plugin/plugin.json",
];

const check = process.argv.includes("--check");
const version = readVersion();

const targets = [];
for (const plugin of PLUGINS) {
  for (const manifest of MANIFESTS) {
    targets.push(path.join("plugins", plugin, manifest));
  }
}

const drift = [];
let written = 0;

for (const rel of targets) {
  const file = path.join(ROOT, rel);
  const raw = readText(file);
  const current = parseVersion(raw, rel);

  if (current === version) continue;

  if (check) {
    drift.push(`${rel}: version="${current}" (expected "${version}")`);
    continue;
  }

  // Targeted replacement of the first "version" value preserves the file's
  // existing formatting and key order, so the diff is one line per manifest.
  const updated = raw.replace(/("version"\s*:\s*)"[^"]*"/, `$1"${version}"`);
  if (updated === raw) fail(`${rel}: failed to update version field`);
  fs.writeFileSync(file, updated);
  written += 1;
  console.log(`set ${rel} -> ${version}`);
}

if (check) {
  if (drift.length > 0) {
    console.error(`Version drift from VERSION (${version}):`);
    for (const line of drift) console.error(`- ${line}`);
    console.error(`\nRun \`node scripts/sync-version.mjs\` to fix.`);
    process.exit(1);
  }
  console.log(`All ${targets.length} manifests match VERSION (${version}).`);
} else {
  console.log(`Synced ${written}/${targets.length} manifest(s) to ${version}.`);
}

function readVersion() {
  const value = readText(VERSION_FILE).trim();
  if (!/^\d+\.\d+\.\d+$/.test(value)) {
    fail(`VERSION must be semver MAJOR.MINOR.PATCH, got "${value}"`);
  }
  return value;
}

function parseVersion(raw, rel) {
  let json;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    fail(`${rel}: invalid JSON (${error.message})`);
  }
  if (typeof json.version !== "string") {
    fail(`${rel}: missing string "version" field`);
  }
  return json.version;
}

function readText(file) {
  if (!fs.existsSync(file)) fail(`missing file: ${path.relative(ROOT, file)}`);
  return fs.readFileSync(file, "utf8");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

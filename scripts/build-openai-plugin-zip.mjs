#!/usr/bin/env node
// Build and preflight the skills-only ZIP that OpenAI's plugin submission
// portal accepts (https://platform.openai.com/plugins -> Create plugin ->
// Skills only).
//
// The portal validates twice with different ceilings: a lenient package
// validation at upload, and a stricter set of limits before the listing can go
// to the directory. This script enforces the stricter directory limits so an
// upload never gets as far as the portal only to be rejected on copy length.
//
// Requirement sources:
//   https://developers.openai.com/plugins/deploy/submission
//   https://developers.openai.com/plugins/deploy/submission-errors
//   https://developers.openai.com/plugins/guides/submit-claude-plugin
//
// Usage:
//   node scripts/build-openai-plugin-zip.mjs                  # check + build
//   node scripts/build-openai-plugin-zip.mjs --check           # preflight only
//   node scripts/build-openai-plugin-zip.mjs --plugin <name>   # default preset-cli-skills
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import zlib from "node:zlib";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "dist");

// interface.category must be one of these (plugin_category_unknown).
const CATEGORIES = [
  "Productivity",
  "Creativity",
  "Developer Tools",
  "Business & Operations",
  "Data & Analytics",
  "Communication",
  "Education & Research",
  "Security",
  "Finance",
  "Healthcare",
  "Travel",
  "Entertainment",
  "Other",
];

// Skills-only uploads must not carry MCP or app configuration, and must not
// declare screenshots (mcp_configuration_excluded, app_configuration_excluded,
// screenshot_configuration_excluded).
const EXCLUDED_FILES = [
  ".mcp.json",
  "mcp.json",
  ".app.json",
  ".claude-plugin/marketplace.json",
];

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  return table;
})();

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const pluginArg = args.indexOf("--plugin");
const pluginName = pluginArg === -1 ? "preset-cli-skills" : args[pluginArg + 1];
const pluginDir = path.join(ROOT, "plugins", pluginName);

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function limit(label, value, max) {
  if (typeof value !== "string" || value.length === 0) {
    fail(`${label} is required and must be a non-empty string.`);
    return;
  }
  if (value.length > max) {
    fail(`${label} is ${value.length} characters; the directory limit is ${max}.`);
  }
  if (label !== "interface.longDescription" && /[\r\n]/.test(value)) {
    fail(`${label} must fit on one line.`);
  }
}

if (!fs.existsSync(pluginDir)) {
  console.error(`No such plugin: plugins/${pluginName}`);
  process.exit(1);
}

// The portal accepts .codex-plugin/plugin.json directly and converts
// .claude-plugin/plugin.json into one, adding its own defaults for anything
// the interface block leaves out. Reading the codex manifest here checks the
// metadata we actually control.
const codexManifestPath = path.join(pluginDir, ".codex-plugin", "plugin.json");
if (!fs.existsSync(codexManifestPath)) {
  console.error(`Missing ${path.relative(ROOT, codexManifestPath)}`);
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(codexManifestPath, "utf8"));

limit("name", manifest.name, 64);
if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(manifest.name ?? "")) {
  fail("name must start with an ASCII letter or digit and use only letters, digits, _ and -.");
}
limit("version", manifest.version, 64);
limit("description", manifest.description, 1024);
limit("author.name", manifest.author?.name, 120);

const ui = manifest.interface;
if (!ui || typeof ui !== "object" || Array.isArray(ui)) {
  fail("interface must be a JSON object.");
} else {
  limit("interface.displayName", ui.displayName, 30);
  limit("interface.shortDescription", ui.shortDescription, 30);
  limit("interface.longDescription", ui.longDescription, 4000);
  limit("interface.developerName", ui.developerName, 80);

  if (!CATEGORIES.includes(ui.category)) {
    fail(`interface.category "${ui.category}" is not a supported category. Use one of: ${CATEGORIES.join(", ")}.`);
  }

  if (!Array.isArray(ui.capabilities)) {
    fail("interface.capabilities must be an array of strings (use [] if there are none).");
  } else {
    if (ui.capabilities.length > 20) fail("interface.capabilities allows at most 20 entries.");
    ui.capabilities.forEach((c, i) => limit(`interface.capabilities[${i}]`, c, 120));
  }

  const prompts = ui.defaultPrompt === undefined
    ? []
    : Array.isArray(ui.defaultPrompt) ? ui.defaultPrompt : [ui.defaultPrompt];
  if (prompts.length > 3) {
    fail(`interface.defaultPrompt has ${prompts.length} entries; at most 3 are allowed.`);
  }
  prompts.forEach((p, i) => limit(`interface.defaultPrompt[${i}]`, p, 128));
  if (new Set(prompts.map((p) => String(p).trim().toLowerCase())).size !== prompts.length) {
    fail("interface.defaultPrompt entries must be unique.");
  }
  for (const p of prompts) {
    if (/@/.test(String(p))) fail(`Starter prompt must not contain an @mention: "${p}"`);
  }

  for (const [field, max] of [["websiteURL", 1024], ["supportURL", 1024], ["privacyPolicyURL", 1024], ["termsOfServiceURL", 1024]]) {
    const value = ui[field];
    if (value === undefined) continue; // optional for skills-only submissions
    limit(`interface.${field}`, value, max);
    if (!String(value).startsWith("https://")) fail(`interface.${field} must be an HTTPS URL.`);
  }

  for (const field of ["brandColor", "brandColorDark"]) {
    const value = ui[field];
    if (value === undefined) continue;
    if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
      fail(`interface.${field} must be a six-digit hex colour such as #1ABCFE.`);
    } else {
      const against = field === "brandColor" ? "#FFFFFF" : "#212121";
      const ratio = contrast(value, against);
      if (ratio < 2) {
        fail(`interface.${field} ${value} has ${ratio.toFixed(2)}:1 contrast against ${against}; at least 2:1 is required.`);
      }
    }
  }

  if (ui.screenshots !== undefined) {
    fail("interface.screenshots is not allowed in a skills-only upload (screenshot_configuration_excluded).");
  }

  // logo is the primary listing icon; composerIcon is shown in the composer.
  // Codex-format package validation asks for both, and the dashboard requires a
  // primary icon before the draft can be submitted.
  for (const field of ["logo", "composerIcon"]) {
    const value = ui[field];
    if (value === undefined) {
      warnings.push(
        `interface.${field} is not set. Add a square PNG, JPEG, WebP or SVG of at least 48x48 ` +
        `(at most 5 MiB, raster at most 4096px per side) under plugins/${pluginName}/assets/ and ` +
        `reference it as "./assets/<file>", or supply the icon in the submission dashboard.`,
      );
      continue;
    }
    if (!String(value).startsWith("./")) fail(`interface.${field} must be a ./-prefixed path relative to the plugin root.`);
    const iconPath = path.join(pluginDir, String(value));
    if (!fs.existsSync(iconPath)) fail(`interface.${field} points at ${value}, which does not exist.`);
    else if (fs.statSync(iconPath).size > 5 * 1024 * 1024) fail(`interface.${field} exceeds the 5 MiB image limit.`);
  }
}

// A skills-only archive needs at least one skill at skills/<name>/SKILL.md
// (archive_plugin_files_missing).
const skillsDir = path.join(pluginDir, "skills");
let skillCount = 0;
if (!fs.existsSync(skillsDir)) {
  fail("No skills/ directory. A skills-only upload needs at least one skill.");
} else {
  for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillFile = path.join(skillsDir, entry.name, "SKILL.md");
    if (!fs.existsSync(skillFile)) {
      fail(`skills/${entry.name} has no SKILL.md.`);
      continue;
    }
    const body = fs.readFileSync(skillFile, "utf8");
    if (!body.startsWith("---")) {
      fail(`skills/${entry.name}/SKILL.md must open with YAML frontmatter.`);
      continue;
    }
    const frontmatter = body.slice(3, body.indexOf("\n---", 3));
    for (const key of ["name", "description"]) {
      if (!new RegExp(`^${key}:`, "m").test(frontmatter)) {
        fail(`skills/${entry.name}/SKILL.md frontmatter is missing "${key}".`);
      }
    }
    skillCount += 1;
  }
  if (skillCount === 0) fail("skills/ contains no skill directories.");
}

for (const rel of EXCLUDED_FILES) {
  if (fs.existsSync(path.join(pluginDir, rel))) {
    fail(`${rel} must not be present in a skills-only upload. Submit MCP servers through the With MCP path instead.`);
  }
}
if (manifest.mcpServers !== undefined || manifest.apps !== undefined) {
  fail("Remove mcpServers and apps from the manifest for a skills-only upload.");
}

for (const warning of warnings) console.warn(`warning: ${warning}`);

if (errors.length > 0) {
  console.error(`\n${errors.length} problem(s) would block this submission:`);
  for (const message of errors) console.error(`  - ${message}`);
  process.exit(1);
}

console.log(`Preflight passed for ${pluginName} (${skillCount} skill(s)).`);
if (checkOnly) process.exit(0);

// Zip with a single top-level directory named after the plugin, which is the
// layout the portal expects for a direct archive upload. The archive is written
// here rather than shelled out to `zip`, which is not installed everywhere.
fs.mkdirSync(OUT_DIR, { recursive: true });
const zipPath = path.join(OUT_DIR, `${pluginName}-${manifest.version}-openai.zip`);
fs.rmSync(zipPath, { force: true });
const entries = collectFiles(pluginDir, pluginName);
fs.writeFileSync(zipPath, buildZip(entries));
const sizeKib = (fs.statSync(zipPath).size / 1024).toFixed(1);
console.log(`Wrote ${path.relative(ROOT, zipPath)} (${entries.length} files, ${sizeKib} KiB).`);
console.log("Upload it at https://platform.openai.com/plugins -> Create plugin -> Skills only.");

function collectFiles(dir, prefix) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === ".DS_Store" || entry.name === "__MACOSX") continue;
    const abs = path.join(dir, entry.name);
    const rel = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) out.push(...collectFiles(abs, rel));
    else if (entry.isFile()) out.push({ name: rel, data: fs.readFileSync(abs) });
  }
  return out;
}

function buildZip(files) {
  const locals = [];
  const central = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const compressed = zlib.deflateRawSync(file.data, { level: 9 });
    const crc = crc32(file.data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // UTF-8 filename
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt32LE(0, 10); // mtime/mdate: fixed for reproducible archives
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(file.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    locals.push(local, name, compressed);

    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4); // version made by
    entry.writeUInt16LE(20, 6); // version needed
    entry.writeUInt16LE(0x0800, 8);
    entry.writeUInt16LE(8, 10);
    entry.writeUInt32LE(0, 12);
    entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(compressed.length, 20);
    entry.writeUInt32LE(file.data.length, 24);
    entry.writeUInt16LE(name.length, 28);
    entry.writeUInt32LE((0o100644 << 16) >>> 0, 38); // external attributes
    entry.writeUInt32LE(offset, 42);
    central.push(entry, name);

    offset += local.length + name.length + compressed.length;
  }

  const centralBuffer = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuffer.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralBuffer, end]);
}

function crc32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buffer[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function contrast(a, b) {
  const luminance = (hex) => {
    const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const [r, g, bl] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

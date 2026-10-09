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
//   node scripts/build-openai-plugin-zip.mjs --plugin preset-mcp-skills --with-mcp
//
// --with-mcp builds the archive for a plugin that bundles its remote MCP
// connection config (the "With MCP" path). The archive ships every target's
// config file in that target's own shape, derived from one endpoint source
// (scripts/lib/mcp-config.mjs); the preflight checks them. Without the flag a
// package that carries MCP configuration is refused, as the skills-only path requires.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import zlib from "node:zlib";
import { checkPackage, PACKAGE as MCP_PACKAGE, readSource } from "./lib/mcp-config.mjs";

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

// 1980-01-01 00:00, the earliest valid DOS timestamp (a zero date has month 0).
const DOS_EPOCH = (0x0021 << 16) >>> 0;

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
const withMcp = args.includes("--with-mcp");
const pluginArg = args.indexOf("--plugin");
const pluginName = pluginArg === -1 ? "preset-cli-skills" : args[pluginArg + 1];
if (!pluginName || pluginName.startsWith("--")) {
  console.error("Usage: node scripts/build-openai-plugin-zip.mjs [--check] [--with-mcp] [--plugin <name>]");
  process.exit(1);
}
const pluginDir = path.join(ROOT, "plugins", pluginName);

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function limit(label, value, max) {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(`${label} is required and must be a non-empty string.`);
    return;
  }
  if (value.length > max) {
    fail(`${label} is ${value.length} characters; the directory limit is ${max}.`);
  }
  const multiline = label === "interface.longDescription" || label === "description";
  if (!multiline && /[\r\n]/.test(value)) {
    fail(`${label} must fit on one line.`);
  }
  if (/[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F-\u009F\u2028\u2029]/.test(value)) {
    fail(`${label} contains a control character or Unicode line separator.`);
  }
}

if (!fs.existsSync(pluginDir)) {
  console.error(`No such plugin: plugins/${pluginName}`);
  process.exit(1);
}

// Only git-tracked regular files are packaged, so local scratch files and secrets never reach the upload.
const trackedFiles = [];
for (const rel of execFileSync("git", ["ls-files", "-z", "--", path.relative(ROOT, pluginDir)], { cwd: ROOT, encoding: "utf8" }).split("\0")) {
  const stat = rel ? fs.lstatSync(path.join(ROOT, rel), { throwIfNoEntry: false }) : undefined;
  if (rel && !stat) fail(`${rel} is tracked by git but missing from the working tree.`);
  else if (stat?.isSymbolicLink()) fail(`${rel} is a symlink; the archive only accepts regular files.`);
  else if (stat?.isFile()) trackedFiles.push(rel);
}
trackedFiles.sort();
const isTracked = (abs) => trackedFiles.includes(path.relative(ROOT, abs));

// The portal accepts .codex-plugin/plugin.json directly and converts
// .claude-plugin/plugin.json into one, adding its own defaults for anything
// the interface block leaves out. Reading the codex manifest here checks the
// metadata we actually control.
const codexManifestPath = path.join(pluginDir, ".codex-plugin", "plugin.json");
if (!fs.existsSync(codexManifestPath)) {
  console.error(`Missing ${path.relative(ROOT, codexManifestPath)}`);
  process.exit(1);
}
if (!isTracked(codexManifestPath)) {
  console.error(`${path.relative(ROOT, codexManifestPath)} is not tracked by git and would be left out of the archive.`);
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(codexManifestPath, "utf8"));

limit("name", manifest.name, 64);
if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(manifest.name ?? "")) {
  fail("name must start with an ASCII letter or digit and use only letters, digits, _ and -.");
}
limit("version", manifest.version, 64);
// Official semver.org grammar: no leading zeros in numeric identifiers, no empty identifiers.
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
if (!SEMVER.test(manifest.version ?? "")) {
  fail("version must be a semantic version such as 1.2.3.");
}
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
  if (new Set(prompts.map((p) => String(p).normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase())).size !== prompts.length) {
    fail("interface.defaultPrompt entries must be unique.");
  }
  for (const p of prompts) {
    if (/@/.test(String(p))) fail(`Starter prompt must not contain an @mention: "${p}"`);
  }

  for (const [field, max] of [["websiteURL", 1024], ["supportURL", 1024], ["privacyPolicyURL", 1024], ["termsOfServiceURL", 1024]]) {
    const value = ui[field];
    if (value === undefined) continue; // optional for skills-only submissions
    limit(`interface.${field}`, value, max);
    if (!isHttpsUrl(value)) fail(`interface.${field} must be an HTTPS URL with a hostname and no credentials or whitespace.`);
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
  // primary icon before the draft can be submitted. Dark variants are optional.
  for (const field of ["logo", "composerIcon", "logoDark", "composerIconDark"]) {
    const value = ui[field];
    if (value === undefined) {
      if (field.endsWith("Dark")) continue;
      warnings.push(
        `interface.${field} is not set. Add a square PNG, JPEG, WebP or SVG of at least 48x48 ` +
        `(at most 5 MiB, raster at most 4096px per side) under plugins/${pluginName}/assets/ and ` +
        `reference it as "./assets/<file>", or supply the icon in the submission dashboard.`,
      );
      continue;
    }
    checkIcon(`interface.${field}`, value);
  }
}

// A skills-only archive needs at least one skill at skills/<name>/SKILL.md
// (archive_plugin_files_missing).
const skillsDir = path.join(pluginDir, "skills");
if (manifest.skills !== undefined && (typeof manifest.skills !== "string" || !manifest.skills.startsWith("./") || manifest.skills.split(/[\\/]/).includes("..") || path.resolve(pluginDir, manifest.skills) !== skillsDir)) {
  fail(`skills must point at ./skills/ (got ${JSON.stringify(manifest.skills)}).`);
}
let skillCount = 0;
if (!fs.existsSync(skillsDir)) {
  fail("No skills/ directory. A skills-only upload needs at least one skill.");
} else {
  for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillRel = path.relative(ROOT, path.join(skillsDir, entry.name)) + path.sep;
    if (!trackedFiles.some((rel) => rel.startsWith(skillRel))) continue; // untracked scratch; never packaged
    const skillFile = path.join(skillsDir, entry.name, "SKILL.md");
    if (!fs.existsSync(skillFile)) {
      fail(`skills/${entry.name} has no SKILL.md.`);
      continue;
    }
    if (!isTracked(skillFile)) {
      fail(`skills/${entry.name}/SKILL.md is not tracked by git and would be left out of the archive.`);
      continue;
    }
    skillCount += 1;
  }
  if (skillCount === 0) fail("skills/ contains no skill directories.");
  // The shared skill validator runs on a copy of the tracked files, so it sees exactly what the archive will contain.
  const stageDir = fs.mkdtempSync(path.join(os.tmpdir(), "openai-plugin-skills-"));
  const skillsRel = path.relative(ROOT, skillsDir) + path.sep;
  try {
    for (const rel of trackedFiles.filter((f) => f.startsWith(skillsRel))) {
      const target = path.join(stageDir, "skills", rel.slice(skillsRel.length));
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.join(ROOT, rel), target);
    }
    execFileSync(process.execPath, [path.join(ROOT, "scripts", "validate-agent-skills.mjs"), path.join(stageDir, "skills")], { cwd: ROOT, stdio: "pipe" });
  } catch (error) {
    const staged = path.join(stageDir, "skills");
    const output = String(error.stderr || error.message).trim()
      .split(path.relative(ROOT, staged)).join(skillsRel.slice(0, -1))
      .split(staged).join(skillsRel.slice(0, -1));
    fail(`Skill validation failed:\n${output}`);
  } finally {
    fs.rmSync(stageDir, { recursive: true, force: true });
  }
}

if (withMcp) {
  // "With MCP" path: the package bundles its remote MCP connection. Only the MCP
  // configuration is allowed; app mappings, hooks, and screenshots stay excluded.
  if (path.relative(ROOT, pluginDir) !== MCP_PACKAGE) {
    fail(`--with-mcp is only supported for ${MCP_PACKAGE}, which defines the connection config.`);
  } else {
    const read = (rel) => (isTracked(path.join(ROOT, rel)) ? fs.readFileSync(path.join(ROOT, rel), "utf8") : null);
    for (const problem of checkPackage(read, readSource(ROOT))) fail(problem);
    if (manifest.mcpServers !== undefined) fail(".codex-plugin/plugin.json must not declare mcpServers; Codex discovers the root mcp.json.");
    if (manifest.apps !== undefined || manifest.hooks !== undefined) fail("Remove apps and hooks from the manifest; they are not eligible for the public directory.");
    if (isTracked(path.join(pluginDir, ".app.json"))) fail(".app.json must not be included.");
    if (trackedFiles.some((rel) => rel.startsWith(`${path.relative(ROOT, pluginDir)}/hooks/`))) fail("Lifecycle hooks are not eligible for the public directory.");
    if (!isTracked(path.join(pluginDir, "mcp.json"))) fail("mcp.json must be tracked.");
    if (isTracked(path.join(pluginDir, ".mcp.json"))) fail(".mcp.json must not be tracked: Claude Code auto-discovers it and rejects an entry without type.");
  }
  if (isTracked(path.join(pluginDir, ".claude-plugin", "marketplace.json"))) fail(".claude-plugin/marketplace.json must not be included.");
} else {
  for (const rel of EXCLUDED_FILES) {
    if (isTracked(path.join(pluginDir, rel))) {
      fail(`${rel} must not be included in a skills-only upload. Submit MCP servers through the With MCP path instead (--with-mcp).`);
    }
  }
  if (manifest.mcpServers !== undefined || manifest.apps !== undefined) {
    fail("Remove mcpServers and apps from the manifest for a skills-only upload.");
  }
}

for (const warning of warnings) console.warn(`warning: ${warning}`);

if (errors.length > 0) {
  console.error(`\n${errors.length} problem(s) would block this submission:`);
  for (const message of errors) console.error(`  - ${message}`);
  process.exit(1);
}

console.log(`Preflight passed for ${pluginName} (${skillCount} skill(s)${withMcp ? ", MCP connection config for every target" : ""}).`);
if (checkOnly) process.exit(0);

// Zip with a single top-level directory named after the plugin, which is the
// layout the portal expects for a direct archive upload. The archive is written
// here rather than shelled out to `zip`, which is not installed everywhere.
fs.mkdirSync(OUT_DIR, { recursive: true });
const zipPath = path.join(OUT_DIR, `${pluginName}-${manifest.version}-openai.zip`);
fs.rmSync(zipPath, { force: true });
const entries = trackedFiles.map((rel) => ({
  name: `${pluginName}/${path.relative(path.relative(ROOT, pluginDir), rel).split(path.sep).join("/")}`,
  data: fs.readFileSync(path.join(ROOT, rel)),
}));
fs.writeFileSync(zipPath, buildZip(entries));
const sizeKib = (fs.statSync(zipPath).size / 1024).toFixed(1);
console.log(`Wrote ${path.relative(ROOT, zipPath)} (${entries.length} files, ${sizeKib} KiB).`);
console.log(withMcp
  ? "This archive bundles the MCP connection config. Submission goes through https://platform.openai.com/plugins -> Create plugin -> With MCP, which needs review metadata this script does not produce."
  : "Upload it at https://platform.openai.com/plugins -> Create plugin -> Skills only.");

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
    local.writeUInt32LE(DOS_EPOCH, 10); // mtime/mdate: fixed for reproducible archives
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
    entry.writeUInt32LE(DOS_EPOCH, 12);
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

function isHttpsUrl(value) {
  if (typeof value !== "string" || /\s/.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname !== "" && url.username === "" && url.password === "";
  } catch {
    return false;
  }
}

function checkIcon(label, value) {
  if (typeof value !== "string" || !value.startsWith("./") || value.split(/[\\/]/).includes("..")) {
    fail(`${label} must be a ./-prefixed path relative to the plugin root with no .. segments.`);
    return;
  }
  const iconPath = path.join(pluginDir, value);
  if (!fs.existsSync(iconPath)) return fail(`${label} points at ${value}, which does not exist.`);
  if (!isTracked(iconPath)) return fail(`${label} points at ${value}, which is not tracked by git and would be left out of the archive.`);
  if (fs.statSync(iconPath).size > 5 * 1024 * 1024) return fail(`${label} exceeds the 5 MiB image limit.`);
  const format = { ".png": "png", ".jpg": "jpeg", ".jpeg": "jpeg", ".webp": "webp", ".svg": "svg" }[path.extname(value).toLowerCase()];
  if (!format) return fail(`${label} must end in .png, .jpg, .jpeg, .webp or .svg.`);
  const size = imageSize(fs.readFileSync(iconPath));
  if (!size) return fail(`${label} must be a PNG, JPEG, WebP or SVG image with readable dimensions.`);
  if (size.error) return fail(`${label}: ${size.error}`);
  if (size.truncated) return fail(`${label} appears truncated; re-export the image.`);
  if (size.format !== format) return fail(`${label} has a ${path.extname(value)} extension but contains ${size.format.toUpperCase()} data.`);
  const { width, height } = size;
  const raster = format !== "svg";
  if (!(width > 0 && height > 0)) return fail(`${label} dimensions must be positive.`);
  if (width !== height) fail(`${label} is ${width}x${height}; icons must be square.`);
  if (Math.min(width, height) < 48) fail(`${label} is ${width}x${height}; icons must be at least 48x48.`);
  if (raster && Math.max(width, height) > 4096) fail(`${label} is ${width}x${height}; raster icons must be at most 4096px per side.`);
}

// Detects the format, dimensions and obvious truncation; full decoding is left to the portal's own validation.
function imageSize(buf) {
  if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47 && buf.toString("latin1", 12, 16) === "IHDR") {
    const truncated = buf.indexOf("IDAT", 33, "latin1") === -1 || buf.toString("latin1", buf.length - 8, buf.length - 4) !== "IEND";
    return { format: "png", width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), truncated };
  }
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length && buf[i] === 0xff) {
      const marker = buf[i + 1];
      if (marker === 0xff) { i += 1; continue; }
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        const truncated = buf.lastIndexOf(Buffer.from([0xff, 0xd9])) <= i;
        return { format: "jpeg", width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5), truncated };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
    return null;
  }
  if (buf.length >= 16 && buf.toString("latin1", 0, 4) === "RIFF" && buf.toString("latin1", 8, 12) === "WEBP") {
    const truncated = buf.readUInt32LE(4) + 8 > buf.length || buf.readUInt32LE(16) === 0 || 20 + buf.readUInt32LE(16) > buf.length;
    const chunk = buf.toString("latin1", 12, 16);
    if (chunk === "VP8 " && buf.length >= 30) {
      return { format: "webp", width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff, truncated };
    }
    if (chunk === "VP8L" && buf.length >= 25) {
      const bits = buf.readUInt32LE(21);
      return { format: "webp", width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1, truncated };
    }
    if (chunk === "VP8X" && buf.length >= 30) {
      return { format: "webp", width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1, truncated };
    }
    return null;
  }
  const text = buf.toString("utf8").replace(/^\uFEFF?(\s*(<\?xml[\s\S]*?\?>|<!--[\s\S]*?-->|<!DOCTYPE[^>]*>))*\s*/i, "");
  const tag = text.match(/^<svg\b[^>]*>/i)?.[0];
  if (!tag) return /<svg\b/i.test(text) ? { error: "SVG root element must be <svg>." } : null;
  if (!/\/>\s*$/.test(tag) && !/<\/svg\s*>(\s|<!--[\s\S]*?-->)*$/i.test(text)) return { error: "SVG root element is not closed." };
  const attr = (name) => tag.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1];
  const number = (v) => (/^\s*\d+(\.\d+)?\s*$/.test(v) ? Number(v) : NaN);
  const [w, h] = [attr("width"), attr("height")];
  if ((w !== undefined && Number.isNaN(number(w))) || (h !== undefined && Number.isNaN(number(h)))) {
    return { error: "SVG width and height must be numeric and omit units and percentages." };
  }
  if (w !== undefined && h !== undefined) return { format: "svg", width: number(w), height: number(h) };
  const box = attr("viewBox")?.trim().split(/[\s,]+/).map(Number);
  if (box?.length === 4 && box.every(Number.isFinite)) return { format: "svg", width: box[2], height: box[3] };
  return { error: "SVG must define a numeric viewBox or numeric width and height." };
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

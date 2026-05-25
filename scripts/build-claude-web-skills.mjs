#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_SOURCE = "plugins/preset-api-skills/skills";
const DEFAULT_OUT = "dist/claude-web-flat-skills";
const DEFAULT_MAX_DESCRIPTION = 200;
const DEFAULT_WARN_LINES = 500;

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();
const sourceRoot = path.resolve(root, args.source ?? DEFAULT_SOURCE);
const outRoot = path.resolve(root, args.out ?? DEFAULT_OUT);
const stageRoot = path.join(outRoot, "_stage");
const maxDescription = Number(args["max-description"] ?? DEFAULT_MAX_DESCRIPTION);
const warnLines = Number(args["warn-lines"] ?? DEFAULT_WARN_LINES);
const keepStage = Boolean(args["keep-stage"]);
const surfaceBoundary =
  args["surface-boundary"] ?? defaultSurfaceBoundary(sourceRoot);

main();

function main() {
  requireCommand("zip");
  requireCommand("zipinfo");

  if (!fs.existsSync(sourceRoot)) {
    fail(`source skills directory does not exist: ${sourceRoot}`);
  }

  assertSafeOutputRoot(outRoot);
  fs.rmSync(outRoot, { recursive: true, force: true });
  fs.mkdirSync(stageRoot, { recursive: true });

  const skills = fs
    .readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(sourceRoot, name, "SKILL.md")))
    .sort();

  if (skills.length === 0) {
    fail(`no skill folders with SKILL.md found in ${sourceRoot}`);
  }

  let hasFailure = false;
  const failed = [];
  for (const skill of skills) {
    const skillReport = buildSkill(skill);
    if (!skillReport.ok) {
      hasFailure = true;
      failed.push(skillReport);
    }
  }

  if (!keepStage) {
    fs.rmSync(stageRoot, { recursive: true, force: true });
  }

  if (hasFailure) {
    console.error("Failed skills:");
    console.error(JSON.stringify(failed, null, 2));
    fail("generated artifacts failed validation");
  }

  console.log(`Created ${skills.length} Claude web/Desktop skill ZIPs in ${path.relative(root, outRoot)}`);
}

function buildSkill(skill) {
  const sourceDir = path.join(sourceRoot, skill);
  const sourceSkillPath = path.join(sourceDir, "SKILL.md");
  const originalSkill = readText(sourceSkillPath);
  const parsed = parseSkill(originalSkill, sourceSkillPath);

  const errors = [];
  const warnings = [];
  if (parsed.name !== skill) {
    errors.push(`frontmatter name "${parsed.name}" must match folder name "${skill}"`);
  }

  const description = compactDescription(parsed.description, maxDescription);
  if (description.length > maxDescription) {
    errors.push(`description is ${description.length} chars; max is ${maxDescription}`);
  }

  const stagedDir = path.join(stageRoot, skill);
  fs.mkdirSync(stagedDir, { recursive: true });

  const sourceFiles = [];
  const body = compactMarkdown(
    removeRetrieveSection(stripFrontmatter(originalSkill)),
  );

  const sections = [
    "---",
    `name: ${skill}`,
    `description: ${JSON.stringify(description)}`,
    "---",
    "",
    "## Surface Boundary",
    surfaceBoundary,
    "",
    rewriteLocalMarkdownLinks(body),
  ];
  sourceFiles.push(relativeFromRoot(sourceSkillPath));

  const referenceFiles = listFiles(path.join(sourceDir, "references"));
  if (referenceFiles.length > 0) {
    sections.push(
      "",
      "## Inlined References",
      "These sections replace the original `references/` files for Claude web/Desktop upload compatibility.",
    );
    for (const file of referenceFiles) {
      sourceFiles.push(relativeFromRoot(file));
      sections.push("", `### ${path.relative(sourceDir, file)}`);
      sections.push(renderInlineFile(file));
    }
  }

  const exampleFiles = listFiles(path.join(sourceDir, "examples"));
  if (exampleFiles.length > 0) {
    sections.push(
      "",
      "## Inlined Examples",
      "These examples replace the original `examples/` files for Claude web/Desktop upload compatibility.",
    );
    for (const file of exampleFiles) {
      sourceFiles.push(relativeFromRoot(file));
      sections.push("", `### ${path.relative(sourceDir, file)}`);
      sections.push(renderCodeFile(file));
    }
  }

  const generated = sections.join("\n").replace(/\n{4,}/g, "\n\n\n").trimEnd() + "\n";
  const generatedPath = path.join(stagedDir, "SKILL.md");
  fs.writeFileSync(generatedPath, generated);

  const lineCount = generated.split("\n").length - 1;
  const byteCount = Buffer.byteLength(generated);
  if (lineCount > warnLines) {
    warnings.push(`generated SKILL.md is ${lineCount} lines; review if Claude upload rejects large files`);
  }

  const zipPath = path.join(outRoot, `${skill}.zip`);
  execFileSync("zip", ["-qr", zipPath, skill], { cwd: stageRoot });

  const zipValidation = validateZip(skill, zipPath);
  errors.push(...zipValidation.errors);

  return {
    skill,
    ok: errors.length === 0,
    warnings,
    errors,
    sourceFiles,
    zip: relativeFromRoot(zipPath),
    generatedSkillMd: keepStage ? relativeFromRoot(generatedPath) : undefined,
    originalDescriptionLength: parsed.description.length,
    generatedDescriptionLength: description.length,
    lineCount,
    byteCount,
    zipEntries: zipValidation.entries.length,
    skillMdCount: zipValidation.skillMdCount,
    topLevelFolders: zipValidation.topLevelFolders,
  };
}

function validateZip(skill, zipPath) {
  const entries = execFileSync("zipinfo", ["-1", zipPath], {
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean);

  const topLevelFolders = [...new Set(entries.map((entry) => entry.split("/")[0]).filter(Boolean))];
  const skillMdCount = entries.filter((entry) => entry === `${skill}/SKILL.md`).length;
  const errors = [];

  if (topLevelFolders.length !== 1 || topLevelFolders[0] !== skill) {
    errors.push(`zip must contain exactly one top-level folder named ${skill}`);
  }
  if (entries.some((entry) => !entry.startsWith(`${skill}/`))) {
    errors.push("all files must be inside the top-level skill folder");
  }
  if (entries.filter((entry) => entry.endsWith("SKILL.md")).length !== 1 || skillMdCount !== 1) {
    errors.push("zip must contain exactly one SKILL.md file");
  }
  if (entries.some((entry) => entry.endsWith(".zip"))) {
    errors.push("zip must not contain nested zip files");
  }
  if (entries.some((entry) => /(^|\/)(references|examples)\//.test(entry))) {
    errors.push("references and examples must be inlined, not shipped as folders");
  }
  if (entries.some((entry) => path.basename(entry) === ".DS_Store")) {
    errors.push("zip must not contain .DS_Store files");
  }

  return { entries, topLevelFolders, skillMdCount, errors };
}

function parseSkill(text, file) {
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!frontmatter) {
    fail(`missing YAML frontmatter in ${file}`);
  }

  const name = readYamlString(frontmatter[1], "name");
  const description = readYamlString(frontmatter[1], "description");
  if (!name || !description) {
    fail(`frontmatter must include name and description in ${file}`);
  }
  return { name, description };
}

function readYamlString(frontmatter, key) {
  const line = frontmatter
    .split("\n")
    .find((candidate) => candidate.startsWith(`${key}:`));
  if (!line) return "";

  const raw = line.slice(key.length + 1).trim();
  if (raw.startsWith('"') || raw.startsWith("'")) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw.replace(/^['"]|['"]$/g, "");
    }
  }
  return raw;
}

function stripFrontmatter(text) {
  return text.replace(/^---\n[\s\S]*?\n---\n?/, "").trim();
}

function removeRetrieveSection(text) {
  const lines = text.split("\n");
  const kept = [];
  let skipping = false;

  for (const line of lines) {
    if (line === "## Retrieve") {
      skipping = true;
      continue;
    }
    if (skipping && line.startsWith("## ")) {
      skipping = false;
    }
    if (!skipping) {
      kept.push(line);
    }
  }

  return kept.join("\n").trim();
}

function renderInlineFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".md" || ext === ".markdown") {
    return rewriteLocalMarkdownLinks(compactMarkdown(readText(file)));
  }
  return renderCodeFile(file);
}

function renderCodeFile(file) {
  const language = languageFor(file);
  return `\`\`\`${language}\n${readText(file).trimEnd()}\n\`\`\``;
}

function compactMarkdown(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function rewriteLocalMarkdownLinks(text) {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, target) => {
    if (/^(https?:|mailto:|#)/i.test(target)) {
      return match;
    }
    return `${label} (${target})`;
  });
}

function compactDescription(description, maxLength) {
  let value = description.replace(/\s+/g, " ").trim();

  const removals = [
    /\s*Use only for direct API workflows;?\s*/gi,
    /\s*Do not use for MCP-only work\.?/gi,
    /\s*Use only for direct API workflows\.?/gi,
    /\s*Use only for MCP tool workflows;?\s*/gi,
    /\s*Do not use for direct API work\.?/gi,
  ];
  for (const removal of removals) {
    value = value.replace(removal, " ");
  }
  value = value.replace(/\s+/g, " ").replace(/\s+([.;,:])/g, "$1").trim();
  value = value.replace(/[;,]\s*$/, ".");

  if (value.length <= maxLength) {
    return value;
  }

  const budget = Math.max(1, maxLength - 1);
  const clipped = value.slice(0, budget);
  const lastSpace = clipped.lastIndexOf(" ");
  const trimmed = (lastSpace > 40 ? clipped.slice(0, lastSpace) : clipped)
    .replace(/[.;,:-]+$/g, "")
    .trim();
  return `${trimmed}.`;
}

function defaultSurfaceBoundary(resolvedSourceRoot) {
  const normalized = resolvedSourceRoot.split(path.sep).join("/");
  if (normalized.includes("/preset-mcp-skills/")) {
    return "Use this generated skill only for Superset MCP tool workflows. Do not use it for direct Preset Management API, Superset REST API, Snowflake Cortex API, curl, Python requests, exports, or database calls. If MCP cannot satisfy the request, stop and explain the missing MCP capability; do not switch surfaces unless the user explicitly starts a direct API workflow.";
  }
  return "Use this generated skill only for explicit direct Preset API, Superset workspace API, or Snowflake Cortex API workflows. Do not use it for Preset/Superset MCP-only work; stay on MCP tooling unless the user explicitly approves switching to direct API calls.";
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath));
    } else if (entry.isFile() && entry.name !== ".DS_Store") {
      files.push(fullPath);
    }
  }
  return files;
}

function languageFor(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".py") return "python";
  if (ext === ".sh" || ext === ".bash") return "bash";
  if (ext === ".js" || ext === ".mjs") return "javascript";
  if (ext === ".json") return "json";
  if (ext === ".yaml" || ext === ".yml") return "yaml";
  if (ext === ".md" || ext === ".markdown") return "markdown";
  return "";
}

function readText(file) {
  return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

function relativeFromRoot(file) {
  return path.relative(root, file);
}

function assertSafeOutputRoot(target) {
  const rootRealPath = fs.realpathSync(root);
  const relativeTarget = path.relative(rootRealPath, target);

  if (!relativeTarget) {
    fail(`refusing to delete repository root as output directory: ${target}`);
  }

  if (relativeTarget.startsWith("..") || path.isAbsolute(relativeTarget)) {
    fail(`refusing to delete unsafe output directory outside the repository: ${target}`);
  }

  const pathParts = relativeTarget.split(path.sep).filter(Boolean);
  if (pathParts.length < 2) {
    fail(`refusing to delete top-level output directory: ${target}`);
  }

  const existingAncestor = nearestExistingAncestor(target);
  const ancestorRealPath = fs.realpathSync(existingAncestor);
  const relativeAncestor = path.relative(rootRealPath, ancestorRealPath);
  if (relativeAncestor.startsWith("..") || path.isAbsolute(relativeAncestor)) {
    fail(`refusing to delete output directory through an unsafe symlink path: ${target}`);
  }
}

function nearestExistingAncestor(target) {
  let current = target;
  while (!fs.existsSync(current)) {
    const parent = path.dirname(current);
    if (parent === current) {
      fail(`cannot resolve existing parent directory for output path: ${target}`);
    }
    current = parent;
  }
  return current;
}

function requireCommand(command) {
  try {
    execFileSync("sh", ["-c", "command -v \"$1\"", "sh", command], {
      stdio: "ignore",
    });
  } catch {
    fail(`${command} is required`);
  }
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (let i = 0; i < rawArgs.length; i += 1) {
    const arg = rawArgs[i];
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
    if (!arg.startsWith("--")) {
      fail(`unexpected argument: ${arg}`);
    }
    const key = arg.slice(2);
    if (key === "keep-stage") {
      parsed[key] = true;
      continue;
    }
    const value = rawArgs[i + 1];
    if (!value || value.startsWith("--")) {
      fail(`missing value for ${arg}`);
    }
    parsed[key] = value;
    i += 1;
  }
  return parsed;
}

function printHelp() {
  console.log(`Usage: node scripts/build-claude-web-skills.mjs [options]

Build Claude web/Desktop custom skill ZIPs from repository skill folders.

Options:
  --source <dir>            Source skills directory. Default: ${DEFAULT_SOURCE}
  --out <dir>               Output directory. Default: ${DEFAULT_OUT}
  --surface-boundary <text> Override the generated Surface Boundary section.
  --max-description <num>   Description character limit. Default: ${DEFAULT_MAX_DESCRIPTION}
  --warn-lines <num>        Warn when generated SKILL.md exceeds this line count. Default: ${DEFAULT_WARN_LINES}
  --keep-stage              Keep generated unzipped skill folders under <out>/_stage
  --help                    Show this help
`);
}

function fail(message) {
  console.error(`build-claude-web-skills: ${message}`);
  process.exit(1);
}

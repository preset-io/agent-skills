#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const DEFAULT_SKILLS_ROOTS = [
  "plugins/preset-api-skills/skills",
  "plugins/preset-mcp-skills/skills",
  "plugins/preset-cli-skills/skills",
];
const MAX_NAME_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 1024;
const MAX_COMPATIBILITY_LENGTH = 500;
const MAX_SKILL_MD_LINES = 500;
const NAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

const roots = parseArgs(process.argv.slice(2));
const failures = [];

for (const skillsRoot of roots) {
  validateSkillsRoot(path.resolve(ROOT, skillsRoot));
}

if (failures.length > 0) {
  console.error("Agent Skills validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Agent Skills validation passed for ${roots.length} skill root(s).`);

function parseArgs(args) {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`Usage: node scripts/validate-agent-skills.mjs [skills-root ...]

Validate source Agent Skills against agentskills.io structural rules.

Defaults:
${DEFAULT_SKILLS_ROOTS.map((root) => `  ${root}`).join("\n")}
`);
    process.exit(0);
  }
  return args.length > 0 ? args : DEFAULT_SKILLS_ROOTS;
}

function validateSkillsRoot(skillsRoot) {
  if (!fs.existsSync(skillsRoot)) {
    fail(skillsRoot, "skills root does not exist");
    return;
  }

  const skillDirs = fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(skillsRoot, entry.name))
    .filter((dir) => fs.existsSync(path.join(dir, "SKILL.md")))
    .sort();

  if (skillDirs.length === 0) {
    fail(skillsRoot, "no skill directories with SKILL.md found");
  }

  for (const skillDir of skillDirs) {
    validateSkill(skillDir);
  }
}

function validateSkill(skillDir) {
  const skillPath = path.join(skillDir, "SKILL.md");
  const skillName = path.basename(skillDir);
  const text = readText(skillPath);
  const frontmatter = parseFrontmatter(text, skillPath);

  validateName(frontmatter.name, skillName, skillPath);
  validateDescription(frontmatter.description, skillPath);
  validateOptionalFields(frontmatter, skillPath);
  validateLineCount(text, skillPath);

  for (const markdownFile of listFiles(skillDir, ".md")) {
    validateMarkdownFile(markdownFile, skillDir);
  }
}

function parseFrontmatter(text, file) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    fail(file, "missing YAML frontmatter at the top of SKILL.md");
    return {};
  }

  const values = {};
  const lines = match[1].split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const keyMatch = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (!keyMatch) continue;

    const [, key, rawValue = ""] = keyMatch;
    if (rawValue === ">" || rawValue === "|") {
      const collected = [];
      while (index + 1 < lines.length && /^\s+/.test(lines[index + 1])) {
        index += 1;
        collected.push(lines[index].trim());
      }
      values[key] = collected.join(rawValue === ">" ? " " : "\n").trim();
    } else {
      if (hasUnsafePlainScalar(rawValue.trim())) {
        fail(file, `${key} contains YAML-sensitive characters; quote the value`);
      }
      values[key] = parseYamlScalar(rawValue.trim());
    }
  }

  if (!values.name) {
    fail(file, "frontmatter must include name");
  }
  if (!values.description) {
    fail(file, "frontmatter must include description");
  }
  return values;
}

function parseYamlScalar(raw) {
  if (!raw) return "";
  if (raw.startsWith('"')) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw.replace(/^"|"$/g, "");
    }
  }
  if (raw.startsWith("'")) {
    return raw.replace(/^'|'$/g, "").replace(/''/g, "'");
  }
  return raw;
}

function hasUnsafePlainScalar(raw) {
  if (!raw || raw.startsWith('"') || raw.startsWith("'")) return false;
  return raw.includes(": ") || raw.includes(" #");
}

function validateName(name, skillName, file) {
  if (!name) return;
  if (name.length > MAX_NAME_LENGTH) {
    fail(file, `name is ${name.length} chars; max is ${MAX_NAME_LENGTH}`);
  }
  if (!NAME_PATTERN.test(name) || name.includes("--")) {
    fail(file, "name must use lowercase letters, numbers, and single hyphens only");
  }
  if (name !== skillName) {
    fail(file, `name "${name}" must match parent directory "${skillName}"`);
  }
}

function validateDescription(description, file) {
  if (!description) return;
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    fail(file, `description is ${description.length} chars; max is ${MAX_DESCRIPTION_LENGTH}`);
  }
}

function validateOptionalFields(frontmatter, file) {
  if (
    frontmatter.compatibility &&
    frontmatter.compatibility.length > MAX_COMPATIBILITY_LENGTH
  ) {
    fail(file, `compatibility is ${frontmatter.compatibility.length} chars; max is ${MAX_COMPATIBILITY_LENGTH}`);
  }
  if (frontmatter["allowed-tools"] && /\n/.test(frontmatter["allowed-tools"])) {
    fail(file, "allowed-tools must be a single space-separated string");
  }
}

function validateLineCount(text, file) {
  const lines = text.split("\n").length;
  if (lines > MAX_SKILL_MD_LINES) {
    fail(file, `SKILL.md is ${lines} lines; keep it under ${MAX_SKILL_MD_LINES}`);
  }
}

function validateMarkdownFile(file, skillDir) {
  const relativeFile = path.relative(ROOT, file);
  const text = readText(file);

  for (const target of markdownTargets(text)) {
    if (isExternalTarget(target)) continue;

    const targetPath = target.split("#")[0];
    if (!targetPath) continue;
    if (path.isAbsolute(targetPath) || targetPath.startsWith("~")) {
      fail(relativeFile, `link must be relative to the skill folder: ${target}`);
      continue;
    }

    const resolved = path.resolve(path.dirname(file), targetPath);
    if (!isInside(resolved, skillDir)) {
      fail(relativeFile, `link escapes the skill folder: ${target}`);
      continue;
    }
    if (!fs.existsSync(resolved)) {
      fail(relativeFile, `broken markdown link: ${target}`);
    }
  }
}

function markdownTargets(text) {
  const targets = [];
  const pattern = /\[[^\]]+\]\(([^)]+)\)/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    targets.push(match[1].trim());
  }
  return targets;
}

function isExternalTarget(target) {
  return /^(https?:|mailto:|#)/i.test(target);
}

function listFiles(dir, ext) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFiles(fullPath, ext));
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results.sort();
}

function isInside(file, dir) {
  const relative = path.relative(dir, file);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function readText(file) {
  return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

function fail(file, message) {
  const rendered = path.isAbsolute(file) ? path.relative(ROOT, file) : file;
  failures.push(`${rendered || file}: ${message}`);
}

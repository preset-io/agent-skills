// Package selection, link integrity, and OpenAI archive contents for the
// installable skill packages. Run by scripts/smoke-test.sh:
//   node --test tests/package-split.test.mjs
//
// The Snowflake Cortex skills ship in their own package so the Preset API
// package's OpenAI archive describes only the Preset and Superset APIs. These
// tests build the OpenAI archives with the repository tooling and read them back.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { before, describe, test } from "node:test";
import { fileURLToPath } from "node:url";

import { readZip } from "./lib/zip.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VERSION = fs.readFileSync(path.join(ROOT, "VERSION"), "utf8").trim();

// The intended home of every skill. A skill must live in exactly one package.
const PACKAGES = {
  "preset-api-skills": [
    "preset-admin",
    "preset-api",
    "preset-dashboards",
    "preset-database-connections",
    "preset-datasets",
    "preset-destructive-imports",
    "preset-embedded-rls",
    "preset-embedding",
    "preset-guest-tokens",
    "preset-import-export",
    "preset-roles-permissions",
    "preset-sql-execution",
    "preset-sqllab",
    "preset-superset",
    "preset-workspaces",
  ],
  "preset-mcp-skills": [
    "preset-mcp",
    "preset-mcp-dashboard",
    "preset-mcp-data",
    "preset-mcp-datasets",
    "preset-mcp-discovery",
    "preset-mcp-gateway",
    "preset-mcp-sqllab",
    "preset-mcp-troubleshooting",
    "preset-mcp-visualization",
    "tableau-to-preset",
  ],
  "preset-cli-skills": ["preset-cli", "preset-cli-mutations"],
  "preset-snowflake-cortex-skills": ["preset-cortex-agents", "preset-snowflake-cortex"],
};
const CORTEX_SKILLS = PACKAGES["preset-snowflake-cortex-skills"];
const OPENAI_PACKAGES = ["preset-api-skills", "preset-cli-skills", "preset-snowflake-cortex-skills"];

const CORTEX_TEXT = /cortex/i;
const CORTEX_OR_SNOWFLAKE = /cortex|snowflake/i;
// Names of other AI assistants, models, or platforms that the OpenAI directory
// rejects in a plugin's name or description.
const OTHER_AI_PLATFORMS = /cortex|snowflake|claude|anthropic|openai|chatgpt|\bgpt|codex|copilot|gemini|cursor/i;

const trackedFiles = execFileSync("git", ["ls-files", "-z", "--", "plugins"], { cwd: ROOT, encoding: "utf8" })
  .split("\0")
  .filter((rel) => rel && fs.existsSync(path.join(ROOT, rel)));

const archives = {};

before(() => {
  for (const name of OPENAI_PACKAGES) {
    execFileSync(process.execPath, ["scripts/build-openai-plugin-zip.mjs", "--plugin", name], { cwd: ROOT, stdio: "pipe" });
    const zipPath = path.join(ROOT, "dist", `${name}-${VERSION}-openai.zip`);
    archives[name] = readZip(fs.readFileSync(zipPath));
  }
});

describe("package selection", () => {
  test("each skill lives in exactly the intended package", () => {
    const found = {};
    for (const rel of trackedFiles) {
      const match = rel.match(/^plugins\/([^/]+)\/skills\/([^/]+)\/SKILL\.md$/);
      if (match) (found[match[2]] ??= []).push(match[1]);
    }
    const expected = {};
    for (const [pkg, skills] of Object.entries(PACKAGES)) for (const skill of skills) (expected[skill] ??= []).push(pkg);
    assert.deepEqual(sortKeys(found), sortKeys(expected));
  });

  test("the plugins directory holds exactly the expected packages", () => {
    const packages = [...new Set(trackedFiles.map((rel) => rel.split("/")[1]))].sort();
    assert.deepEqual(packages, Object.keys(PACKAGES).sort());
  });

  test("each Cursor manifest lists exactly its own package's skills", () => {
    for (const [pkg, skills] of Object.entries(PACKAGES)) {
      const manifest = readJson(`plugins/${pkg}/.cursor-plugin/plugin.json`);
      assert.deepEqual(manifest.skills.map((s) => s.name).sort(), [...skills].sort(), pkg);
      for (const s of manifest.skills) assert.equal(s.path, `skills/${s.name}/SKILL.md`, pkg);
    }
  });

  test("package routing docs name their own skills and no other package's skills", () => {
    for (const [pkg, skills] of Object.entries(PACKAGES)) {
      const others = Object.entries(PACKAGES).filter(([p]) => p !== pkg).flatMap(([, s]) => s);
      for (const doc of ["AGENTS.md", "README.md", ".github/copilot-instructions.md"]) {
        const text = fs.readFileSync(path.join(ROOT, "plugins", pkg, doc), "utf8");
        for (const skill of skills) assert.ok(text.includes(`skills/${skill}/SKILL.md`), `${pkg}/${doc} does not list ${skill}`);
        for (const skill of others) assert.ok(!text.includes(`skills/${skill}/SKILL.md`), `${pkg}/${doc} lists ${skill} from another package`);
      }
    }
  });

  test("MCP Codex listing carries no Cortex or Snowflake reference and keeps its direct API boundary", () => {
    const manifest = readJson("plugins/preset-mcp-skills/.codex-plugin/plugin.json");
    for (const [field, value] of listingFields(manifest)) {
      assert.doesNotMatch(value, CORTEX_OR_SNOWFLAKE, field);
    }
    assert.match(manifest.interface.longDescription, /Do not use for direct Preset Management API, Superset REST API, other direct APIs/);
    assert.match(manifest.interface.longDescription, /do not switch surfaces/);
  });

  test("both marketplaces publish every package from its own directory", () => {
    const names = Object.keys(PACKAGES);
    const claude = readJson(".claude-plugin/marketplace.json");
    assert.deepEqual(claude.plugins.map((p) => p.name), names);
    assert.deepEqual(claude.plugins.map((p) => p.source), names.map((n) => `./plugins/${n}`));
    const codex = readJson(".agents/plugins/marketplace.json");
    assert.deepEqual(codex.plugins.map((p) => p.name), names);
    assert.deepEqual(codex.plugins.map((p) => p.source.path), names.map((n) => `./plugins/${n}`));
  });

  test("every package manifest carries the package name and the VERSION", () => {
    for (const pkg of Object.keys(PACKAGES)) {
      for (const kind of [".claude-plugin", ".codex-plugin", ".cursor-plugin"]) {
        const manifest = readJson(`plugins/${pkg}/${kind}/plugin.json`);
        assert.equal(manifest.version, VERSION, `${pkg}/${kind}`);
        if (kind !== ".cursor-plugin") assert.equal(manifest.name, pkg, `${pkg}/${kind}`);
      }
    }
  });
});

describe("link integrity", () => {
  test("every relative Markdown link in every package resolves inside that package", () => {
    const broken = [];
    for (const rel of trackedFiles.filter((f) => f.endsWith(".md"))) {
      const pkgRoot = rel.split("/").slice(0, 2).join("/");
      for (const target of markdownLinks(fs.readFileSync(path.join(ROOT, rel), "utf8"))) {
        const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(rel), target));
        if (!resolved.startsWith(`${pkgRoot}/`)) broken.push(`${rel} -> ${target} (leaves ${pkgRoot})`);
        else if (!fs.existsSync(path.join(ROOT, resolved))) broken.push(`${rel} -> ${target} (missing)`);
      }
    }
    assert.deepEqual(broken, []);
  });

  test("every relative Markdown link in every OpenAI archive resolves inside the archive", () => {
    for (const name of OPENAI_PACKAGES) {
      const files = archives[name];
      const broken = [];
      for (const [entry, data] of files) {
        if (!entry.endsWith(".md")) continue;
        for (const target of markdownLinks(data.toString("utf8"))) {
          const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(entry), target));
          if (!files.has(resolved)) broken.push(`${entry} -> ${target}`);
        }
      }
      assert.deepEqual(broken, [], name);
    }
  });
});

describe("OpenAI archive for preset-api-skills", () => {
  test("ships exactly the API skills and no Cortex skill or file", () => {
    const files = archives["preset-api-skills"];
    assert.deepEqual(archiveSkills(files, "preset-api-skills"), [...PACKAGES["preset-api-skills"]].sort());
    for (const skill of CORTEX_SKILLS) {
      assert.ok(![...files.keys()].some((e) => e.includes(`/skills/${skill}/`)), `${skill} is in the API archive`);
    }
    assert.deepEqual([...files.keys()].filter((e) => CORTEX_TEXT.test(e)), []);
  });

  test("no archived file mentions Cortex", () => {
    const hits = [...archives["preset-api-skills"]].filter(([, data]) => CORTEX_TEXT.test(data.toString("utf8"))).map(([e]) => e);
    assert.deepEqual(hits, []);
  });

  test("name, description, longDescription, and keywords carry no Cortex, Snowflake, or other AI platform reference", () => {
    const files = archives["preset-api-skills"];
    for (const kind of [".codex-plugin", ".claude-plugin"]) {
      const manifest = JSON.parse(files.get(`preset-api-skills/${kind}/plugin.json`).toString("utf8"));
      for (const [field, value] of listingFields(manifest)) {
        assert.doesNotMatch(value, OTHER_AI_PLATFORMS, `${kind} ${field}`);
      }
    }
    const cursor = JSON.parse(files.get("preset-api-skills/.cursor-plugin/plugin.json").toString("utf8"));
    assert.doesNotMatch(JSON.stringify(cursor), CORTEX_OR_SNOWFLAKE);
  });

  test("listing copy describes the remaining Preset and Superset API scope", () => {
    const manifest = JSON.parse(archives["preset-api-skills"].get("preset-api-skills/.codex-plugin/plugin.json").toString("utf8"));
    assert.equal(manifest.name, "preset-api-skills");
    assert.equal(manifest.version, VERSION);
    assert.match(manifest.description, /Preset Management API/);
    assert.match(manifest.description, /Superset workspace API/);
    assert.match(manifest.interface.longDescription, new RegExp(`contains ${PACKAGES["preset-api-skills"].length} focused skills`));
    assert.ok(!manifest.keywords.some((k) => CORTEX_OR_SNOWFLAKE.test(k)));
  });
});

describe("OpenAI archive for preset-snowflake-cortex-skills", () => {
  test("ships both Cortex skills and nothing else", () => {
    assert.deepEqual(archiveSkills(archives["preset-snowflake-cortex-skills"], "preset-snowflake-cortex-skills"), [...CORTEX_SKILLS].sort());
  });

  test("ships every tracked file of both Cortex skills", () => {
    const files = archives["preset-snowflake-cortex-skills"];
    const sources = trackedFiles.filter((rel) => CORTEX_SKILLS.some((s) => rel.startsWith(`plugins/preset-snowflake-cortex-skills/skills/${s}/`)));
    assert.ok(sources.length >= 11);
    for (const rel of sources) {
      const entry = rel.replace(/^plugins\//, "");
      assert.ok(files.has(entry), `${entry} missing from the Cortex archive`);
      assert.ok(files.get(entry).equals(fs.readFileSync(path.join(ROOT, rel))), `${entry} differs from source`);
    }
  });

  test("ships every file the Cortex skills link to", () => {
    const files = archives["preset-snowflake-cortex-skills"];
    for (const skill of CORTEX_SKILLS) {
      const prefix = `preset-snowflake-cortex-skills/skills/${skill}/`;
      const linked = new Set();
      const queue = [`${prefix}SKILL.md`];
      while (queue.length > 0) {
        const entry = queue.pop();
        assert.ok(files.has(entry), `${entry} is linked but not archived`);
        if (linked.has(entry)) continue;
        linked.add(entry);
        for (const target of markdownLinks(files.get(entry).toString("utf8"))) {
          queue.push(path.posix.normalize(path.posix.join(path.posix.dirname(entry), target)));
        }
      }
      assert.ok(linked.size > 1, `${skill} links no references`);
    }
  });

  test("manifests name the package accurately", () => {
    const files = archives["preset-snowflake-cortex-skills"];
    const codex = JSON.parse(files.get("preset-snowflake-cortex-skills/.codex-plugin/plugin.json").toString("utf8"));
    assert.equal(codex.name, "preset-snowflake-cortex-skills");
    assert.equal(codex.version, VERSION);
    assert.match(codex.description, /Snowflake Cortex/);
    assert.match(codex.interface.longDescription, /two skills/);
  });
});

describe("OpenAI archive for preset-cli-skills", () => {
  test("still ships exactly the CLI skills", () => {
    const files = archives["preset-cli-skills"];
    assert.deepEqual(archiveSkills(files, "preset-cli-skills"), [...PACKAGES["preset-cli-skills"]].sort());
    assert.deepEqual([...files.keys()].filter((e) => CORTEX_TEXT.test(e)), []);
  });

  test("no archived file mentions Cortex", () => {
    const hits = [...archives["preset-cli-skills"]].filter(([, data]) => CORTEX_TEXT.test(data.toString("utf8"))).map(([e]) => e);
    assert.deepEqual(hits, []);
  });
});

describe("Claude web skill ZIPs", () => {
  const hasZip = commandExists("zip") && commandExists("zipinfo");

  test("each package source builds exactly its own skills", { skip: !hasZip && "zip/zipinfo not installed" }, () => {
    for (const pkg of ["preset-api-skills", "preset-snowflake-cortex-skills"]) {
      const out = `dist/test-claude-web/${pkg}`;
      execFileSync(process.execPath, ["scripts/build-claude-web-skills.mjs", "--source", `plugins/${pkg}/skills`, "--out", out], { cwd: ROOT, stdio: "pipe" });
      const zips = fs.readdirSync(path.join(ROOT, out)).filter((f) => f.endsWith(".zip")).sort();
      assert.deepEqual(zips, PACKAGES[pkg].map((s) => `${s}.zip`).sort(), pkg);
    }
    fs.rmSync(path.join(ROOT, "dist/test-claude-web"), { recursive: true, force: true });
  });
});

function archiveSkills(files, pkg) {
  return [...files.keys()]
    .map((e) => e.match(new RegExp(`^${pkg}/skills/([^/]+)/SKILL\\.md$`))?.[1])
    .filter(Boolean)
    .sort();
}

function listingFields(manifest) {
  const ui = manifest.interface ?? {};
  return [
    ["name", manifest.name],
    ["displayName", manifest.displayName],
    ["description", manifest.description],
    ["keywords", (manifest.keywords ?? []).join(" ")],
    ["interface.displayName", ui.displayName],
    ["interface.shortDescription", ui.shortDescription],
    ["interface.longDescription", ui.longDescription],
    ["interface.capabilities", (ui.capabilities ?? []).join(" ")],
    ["interface.defaultPrompt", [].concat(ui.defaultPrompt ?? []).join(" ")],
  ].filter(([, value]) => typeof value === "string");
}

// Relative link targets, without anchors. External links and pure anchors are skipped.
function markdownLinks(text) {
  return [...text.matchAll(/\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)]
    .map((m) => m[1].split("#")[0])
    .filter((target) => target && !/^[a-z][a-z0-9+.-]*:/i.test(target));
}


function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function sortKeys(object) {
  return Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)));
}

function commandExists(name) {
  try {
    execFileSync("sh", ["-c", `command -v ${name}`], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

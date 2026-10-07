// Tests for the Preset MCP gateway guidance in plugins/preset-mcp-skills.
// Run by scripts/smoke-test.sh:
//   node --test tests/mcp-gateway.test.mjs
//
// MOCKED tests only. Everything here runs offline against hand-copied contract
// fixtures (tests/fixtures/mcp-gateway/gateway-contract.json, read from
// preset-io/mcp-gateway main) and a mocked gateway (tests/lib/mock-gateway.mjs).
// They show the documented guidance is consistent with that contract. They are
// NOT authenticated canaries: no live service is called, no credentials are used.
// The manual, read-only canary procedure is in plugins/preset-mcp-skills/README.md.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { before, describe, test } from "node:test";
import { fileURLToPath } from "node:url";

import { execFileSync, spawnSync } from "node:child_process";
import { CREDENTIAL_LIKE, checkPackage, clientsIndexFields, generatedFiles, manifestFields, PACKAGE as PKG_REL, readSource } from "../scripts/lib/mcp-config.mjs";
import { findStaleClaims, scanRepository } from "../scripts/check-mcp-gateway-claims.mjs";
import { validate } from "./lib/json-schema.mjs";
import { readZip } from "./lib/zip.mjs";
import { walk } from "./lib/walkthrough.mjs";
import { CONTRACT } from "./lib/mock-gateway.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PKG = path.join(ROOT, "plugins", "preset-mcp-skills");
const SKILL = path.join(PKG, "skills", "preset-mcp-gateway");
const FIXTURES = path.join(ROOT, "tests", "fixtures", "mcp-gateway");
const PINNED_ENDPOINT = "https://mcp.app.preset.io/mcp";
const SOURCE = readSource(ROOT);
const ENDPOINT = SOURCE.endpoint;

const read = (...parts) => fs.readFileSync(path.join(...parts), "utf8");
const json = (...parts) => JSON.parse(read(...parts));
const skillText = [
  read(SKILL, "SKILL.md"),
  read(SKILL, "references", "gateway-flow.md"),
  read(SKILL, "references", "gateway-failures.md"),
  read(SKILL, "references", "connect-clients.md"),
].join("\n");
const clients = json(PKG, "connections", "clients.json");

function packageFiles(dir = PKG) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? packageFiles(full) : [full];
  });
}

describe("gateway contract fixture vs guidance (mocked)", () => {
  test("fixture records its provenance", () => {
    assert.equal(CONTRACT.label, "mocked");
    assert.match(CONTRACT.source.commit, /^[0-9a-f]{40}$/);
    assert.equal(CONTRACT.source.repository, "preset-io/mcp-gateway");
    assert.equal(CONTRACT.productionEndpoint, ENDPOINT);
    for (const doc of [read(SKILL, "references", "gateway-flow.md"), JSON.stringify(clients)]) {
      assert.ok(doc.includes(CONTRACT.source.commit), "docs cite the same gateway commit as the fixture");
    }
  });

  test("every gateway tool and its required parameters are documented", () => {
    const flow = read(SKILL, "references", "gateway-flow.md");
    for (const [name, spec] of Object.entries(CONTRACT.tools)) {
      assert.ok(flow.includes(`\`${name}\``), `gateway-flow.md documents ${name}`);
      for (const param of spec.required) {
        assert.ok(flow.includes(param), `gateway-flow.md mentions ${name} parameter ${param}`);
      }
    }
    for (const sourcePath of Object.values(CONTRACT.source.files)) {
      assert.ok(flow.includes(sourcePath), `gateway-flow.md cites ${sourcePath}`);
    }
  });

  test("direct and gateway call_tool shapes are both documented and kept distinct", () => {
    const flow = read(SKILL, "references", "gateway-flow.md");
    assert.deepEqual(CONTRACT.directCallTool.required, ["name", "arguments"]);
    assert.match(flow, /`workspace_id`, `tool_name`, `args`/);
    assert.match(flow, /`name`, `arguments`/);
    assert.match(flow, /Keep direct-connection behavior unchanged/);
  });

  test("the preset-mcp router keeps direct-connection behavior and points gateways to the gateway skill", () => {
    const router = read(PKG, "skills", "preset-mcp", "SKILL.md");
    assert.match(router, /Direct connection: call tools directly with the obvious parameters; fetch a tool's schema only after a validation error/);
    assert.match(router, /preset-mcp-gateway/);
    assert.match(router, /No API fallback|Do not use direct Preset Management API/);
  });
});

describe("walkthroughs (mocked gateway and direct workspace)", () => {
  const scenarioDir = path.join(FIXTURES, "scenarios");
  const files = fs.readdirSync(scenarioDir).filter((f) => f.endsWith(".json")).sort();

  test("the four required walkthroughs exist", () => {
    for (const id of ["multi-workspace-gateway", "direct-workspace", "disabled-service", "missing-request-wrapper"]) {
      assert.ok(files.includes(`${id}.json`), `scenario ${id}`);
    }
  });

  for (const file of files) {
    const scenario = json(scenarioDir, file);
    test(`golden walkthrough: ${scenario.id}`, () => {
      assert.equal(scenario.label, "mocked");
      const { violations, log } = walk(scenario);
      assert.deepEqual(violations, [], JSON.stringify(violations));
      assert.ok(log.length > 0);
    });
  }

  test("multi-workspace walkthrough asks before choosing and ends in a schema-valid call", () => {
    const scenario = json(scenarioDir, "multi-workspace-gateway.json");
    const kinds = scenario.steps.map((s) => s.ask ?? s.user ?? s.call);
    assert.equal(scenario.steps[0].call, "list_workspaces");
    assert.ok(scenario.steps[1].ask, "asks right after the list");
    const order = scenario.steps.filter((s) => s.call).map((s) => s.call);
    assert.deepEqual(order, ["list_workspaces", "list_workspace_services", "search_workspace_tools", "call_tool"]);
    assert.ok(kinds.length > 0);
    const { log } = walk(scenario);
    assert.deepEqual(log.at(-1).result, { isError: false, value: { tool: "list_databases", workspace_id: "123" } });
  });

  test("a missing request wrapper is reported by the gateway and fixed once", () => {
    const { log } = walk(json(scenarioDir, "missing-request-wrapper.json"));
    const rejected = log.filter((entry) => entry.result.isError);
    assert.equal(rejected.length, 1);
    assert.match(rejected[0].result.text, /no top-level `request` key/);
    assert.equal(log.at(-1).result.isError, false);
  });

  test("a disabled service is reported without any workspace tool call", () => {
    const { log } = walk(json(scenarioDir, "disabled-service.json"));
    assert.deepEqual(log.map((e) => e.tool), ["list_workspaces", "list_workspace_services"]);
  });

  test("direct walkthrough never uses gateway tools or the gateway call_tool shape", () => {
    const { log } = walk(json(scenarioDir, "direct-workspace.json"));
    for (const entry of log) {
      assert.ok(!["list_workspaces", "search_workspace_tools", "list_workspace_services"].includes(entry.tool));
      assert.ok(!("workspace_id" in entry.args));
    }
  });

  const cases = json(FIXTURES, "violations.json").cases;
  for (const entry of cases) {
    test(`checker flags: ${entry.name}`, () => {
      const { violations } = walk(entry.scenario);
      assert.deepEqual([...new Set(violations.map((v) => v.rule))].sort(), [...entry.expectViolations].sort());
    });
  }

  for (const [label, annotations] of [
    ["omitted annotations", undefined],
    ["empty annotations", {}],
    ["destructive-only annotations", { destructiveHint: true }],
    ["declared write", { readOnlyHint: false }],
    ["declared read", { readOnlyHint: true }],
  ]) {
    test(`confirmation defaults safely: ${label}`, () => {
      const scenario = json(scenarioDir, "multi-workspace-gateway.json");
      const tool = Object.values(scenario.environments)[0].workspaces[0].tools.find((t) => t.name === "list_databases");
      if (annotations === undefined) delete tool.annotations;
      else tool.annotations = annotations;
      const expected = annotations?.readOnlyHint === true ? [] : ["write-without-confirmation"];
      assert.deepEqual(walk(scenario).violations.map((v) => v.rule), expected);
      scenario.steps.splice(-1, 0, { user: { confirms: true } });
      assert.deepEqual(walk(scenario).violations, []);
    });
  }

  test("client setup explicitly prohibits every credential kind in configs, chat, and commands", () => {
    const setup = read(SKILL, "references", "connect-clients.md");
    assert.match(setup, /Never put a token, password, API key, `Authorization` header, OAuth client ID, or client secret into a config file, chat message, or command\./);
    assert.match(setup, /Do not create a confidential OAuth client/);
  });

  test("every rule the checker enforces is taught in the skill text", () => {
    const taught = {
      "silent-workspace-choice": /never choose silently/i,
      "invented-workspace-id": /never guess an `id`/i,
      "workspace-differs-from-user-choice": /re-check that it is still the user's chosen workspace/i,
      "cross-environment-workspace-id": /never reuse an `id`[^.]*another environment/i,
      "call-without-search": /do not call `call_tool` with a tool name you did not get from `search_workspace_tools`/i,
      "write-without-confirmation": /Confirm the workspace with the user before any write/i,
      "continued-after-auth-failure": /make at most one corrective step[^.]*then stop/i,
      "repeated-failed-call": /Do not retry an identical failing call/i,
      "retry-loop": /Do not loop/i,
      "unlisted-service-call": /do not call its tools|do not call tools of an unlisted service/i,
      "gateway-tool-on-direct": /do not call `list_workspaces`, do not invent a `workspace_id`/i,
      "gateway-shape-on-direct": /Do not translate between the two shapes/i,
    };
    const covered = new Set(cases.flatMap((c) => c.expectViolations));
    for (const [rule, pattern] of Object.entries(taught)) {
      assert.match(skillText, pattern, `skill text teaches ${rule}`);
    }
    for (const rule of covered) assert.ok(rule in taught || rule === "action-after-stop", `${rule} has taught text`);
  });
});

describe("failure and optional-service guidance", () => {
  test("covers the required failure classes without bypasses", () => {
    const failures = read(SKILL, "references", "gateway-failures.md");
    for (const needle of [
      "Knowledge",
      "launch flag",
      "Unknown tool: '<name>'",
      "get_workspace_catalog",
      "not enabled on this gateway",
      "omitted",
      "lacks the required Superset capability",
      "needs authentication",
      "Do not retry an identical failing call",
      "reconnect",
      "No `workspace_tools` service: stop",
    ]) {
      assert.ok(failures.includes(needle) || failures.toLowerCase().includes(needle.toLowerCase()), `gateway-failures.md covers: ${needle}`);
    }
    assert.match(failures, /no direct API/i);
  });

  test("the no-direct-API fallback is preserved", () => {
    assert.match(read(SKILL, "SKILL.md"), /No API fallback\. Direct API is a different surface and requires separate explicit approval\./);
    assert.match(read(PKG, "AGENTS.md"), /If MCP lacks a needed capability, stop/);
  });
});

describe("client connection manifests", () => {
  test("index lists the verified clients with official documentation", () => {
    assert.equal(clients.endpoint, ENDPOINT);
    assert.match(clients.verified, /^\d{4}-\d{2}-\d{2}$/);
    const ids = clients.clients.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const client of clients.clients) {
      assert.ok(client.docs.length > 0, `${client.id} cites documentation`);
      for (const url of client.docs) {
        const host = new URL(url).hostname;
        assert.ok(
          /^(code\.claude\.com|support\.claude\.com|cursor\.com|code\.visualstudio\.com|learn\.chatgpt\.com|developers\.openai\.com)$/.test(host),
          `${client.id} docs host ${host} is an official vendor host`,
        );
        for (const doc of [read(PKG, "connections", "README.md"), read(SKILL, "references", "connect-clients.md")]) {
          assert.ok(doc.includes(url), `${url} appears in the human-readable docs`);
        }
      }
      if (client.support === "manual") {
        assert.ok(client.manualSteps && !client.template, `${client.id} is manual-only`);
      } else {
        assert.equal(client.support, "template");
        assert.ok(fs.existsSync(path.join(PKG, "connections", client.template)), `${client.template} exists`);
      }
    }
    for (const id of ["claude-ai", "chatgpt"]) {
      assert.equal(clients.clients.find((c) => c.id === id).support, "manual");
    }
  });

  for (const client of clients.clients.filter((c) => c.support === "template")) {
    test(`template for ${client.id} has the vendor's format, the production endpoint, and no credentials`, () => {
      const text = read(PKG, "connections", client.template);
      if (client.format === "json") {
        const config = JSON.parse(text);
        assert.deepEqual(Object.keys(config), [client.rootKey]);
        assert.deepEqual(Object.keys(config[client.rootKey]), [clients.serverName]);
        const server = config[client.rootKey][clients.serverName];
        assert.equal(server.url, ENDPOINT);
        const allowed = client.id === "cursor" ? ["url"] : ["type", "url"];
        assert.deepEqual(Object.keys(server).sort(), allowed.sort());
        if (allowed.includes("type")) assert.equal(server.type, "http");
      } else {
        assert.equal(text, `[${client.rootKey}.${clients.serverName}]\nurl = "${ENDPOINT}"\n`);
      }
      assert.doesNotMatch(text, /token|secret|password|api[_-]?key|authorization|bearer|client[_-]?id|headers|oauth|\$\{/i);
    });
  }

  test("only the production host appears and user-level templates keep a distinct name", () => {
    for (const file of packageFiles()) {
      if (!/\.(md|json|toml)$/.test(file)) continue;
      const hosts = read(file).match(/https:\/\/[a-z0-9.-]*preset\.io\/mcp\b/gi) ?? [];
      for (const host of hosts) assert.equal(host, ENDPOINT, `${path.relative(PKG, file)} only names the production endpoint`);
    }
    assert.notEqual(clients.serverName, clients.pluginManifests.serverName);
    assert.match(read(PKG, "connections", "README.md"), /Never overwrite or merge over an existing connection/);
    assert.match(read(PKG, "connections", "README.md"), /Staging, sandbox, and other environments are opt-in only/);
    assert.match(read(SKILL, "references", "connect-clients.md"), /Never overwrite an existing connection/);
  });

  test("the Cursor manifest lists the gateway skill and every listed path exists", () => {
    const cursor = json(PKG, ".cursor-plugin", "plugin.json");
    const paths = cursor.skills.map((s) => s.path);
    assert.ok(paths.includes("skills/preset-mcp-gateway/SKILL.md"));
    for (const p of paths) assert.ok(fs.existsSync(path.join(PKG, p)), p);
  });
});

describe("plugin-bundled MCP configuration (one exact shape per target)", () => {
  const SERVER = { url: ENDPOINT };
  const manifestTargets = Object.fromEntries(clients.pluginManifests.targets.map((t) => [t.id, t]));
  const schemas = {
    plugin: json(ROOT, "tests", "fixtures", "agent-plugins", "plugin.schema.json"),
    mcp: json(ROOT, "tests", "fixtures", "agent-plugins", "mcp.schema.json"),
  };

  test("the index lists exactly the three config targets (Codex reads the portable one), each with official documentation", () => {
    assert.deepEqual(Object.keys(manifestTargets).sort(), ["agent-plugins-portable", "claude-code", "cursor"]);
    assert.equal(clients.pluginManifests.serverName, "preset");
    for (const target of Object.values(manifestTargets)) {
      assert.ok(target.docs.length > 0 && target.docSection, `${target.id} cites docs`);
      for (const url of target.docs) {
        assert.ok(
          /^(developers\.openai\.com|agent-plugins\.org|code\.claude\.com|cursor\.com)$/.test(new URL(url).hostname),
          `${target.id}: ${url} is an official host`,
        );
        assert.ok(read(PKG, "README.md").includes(url), `${url} appears in the package README`);
        assert.ok(read(SKILL, "references", "connect-clients.md").includes(url), `${url} appears in connect-clients.md`);
      }
    }
  });

  test("portable Agent Plugins: root plugin.json and mcp.json validate against the published schemas", () => {
    const plugin = json(PKG, "plugin.json");
    assert.deepEqual(validate(schemas.plugin, plugin), []);
    assert.equal(plugin.$schema, "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json");
    assert.equal(plugin.name, "preset-mcp-skills");
    assert.ok(!("extensions" in plugin), "OpenAI presentation stays in the .codex-plugin overlay");
    const mcp = json(PKG, "mcp.json");
    assert.deepEqual(validate(schemas.mcp, mcp), []);
    assert.deepEqual(mcp, {
      $schema: "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
      mcpServers: { preset: { type: "streamable-http", ...SERVER } },
    });
    assert.deepEqual(mcp, manifestTargets["agent-plugins-portable"].shape);
  });

  test("the schema validator rejects shapes the portable schema forbids", () => {
    const bad = [
      { $schema: schemas.mcp.properties.$schema.const, mcpServers: { preset: { type: "http", ...SERVER } } },
      { $schema: schemas.mcp.properties.$schema.const, mcpServers: { preset: { ...SERVER } } },
      { mcpServers: { preset: { type: "streamable-http", ...SERVER } } },
      { $schema: schemas.mcp.properties.$schema.const, mcpServers: { preset: { type: "streamable-http", ...SERVER, oauth: {} } } },
    ];
    for (const config of bad) assert.notDeepEqual(validate(schemas.mcp, config), [], JSON.stringify(config));
  });

  test("Codex: reads the root mcp.json by default, so .codex-plugin/plugin.json declares no mcpServers", () => {
    assert.ok(!("mcpServers" in json(PKG, ".codex-plugin", "plugin.json")));
    assert.ok(fs.existsSync(path.join(PKG, "mcp.json")));
  });

  test("no root .mcp.json: Claude Code auto-discovers it and rejects a url entry without type", () => {
    assert.ok(!fs.existsSync(path.join(PKG, ".mcp.json")));
    const problems = checkPackage((file) => (file === `${PKG_REL}/.mcp.json` ? JSON.stringify({ mcpServers: { preset: { url: ENDPOINT } } }) : fs.existsSync(path.join(ROOT, file)) ? read(ROOT, file) : null), SOURCE);
    assert.ok(problems.some((p) => p.includes(".mcp.json must not exist")));
  });

  test("Claude Code: inline mcpServers in .claude-plugin/plugin.json with type http", () => {
    const manifest = json(PKG, ".claude-plugin", "plugin.json");
    assert.deepEqual(manifest.mcpServers, { preset: { type: "http", ...SERVER } });
    assert.deepEqual(manifest.mcpServers, manifestTargets["claude-code"].manifestField.mcpServers);
    // Claude Code skips a url entry that has no type, so the inline server must carry it.
    assert.equal(manifest.mcpServers.preset.type, "http");
  });

  test("Cursor: .cursor-plugin/plugin.json points at cursor/mcp.json, a url-only entry", () => {
    assert.equal(json(PKG, ".cursor-plugin", "plugin.json").mcpServers, "./cursor/mcp.json");
    const config = json(PKG, "cursor", "mcp.json");
    assert.deepEqual(config, { mcpServers: { preset: SERVER } });
    assert.deepEqual(config, manifestTargets.cursor.shape);
  });

  test("each target keeps its own shape: portable (read by Codex) and Claude carry a type, Cursor is url-only", () => {
    const portable = json(PKG, "mcp.json");
    const claude = json(PKG, ".claude-plugin", "plugin.json").mcpServers;
    const cursor = json(PKG, "cursor", "mcp.json");
    assert.equal(portable.mcpServers.preset.type, "streamable-http");
    assert.equal(claude.preset.type, "http");
    assert.notEqual(portable.mcpServers.preset.type, claude.preset.type);
    assert.ok(!("type" in cursor.mcpServers.preset));
    assert.ok("$schema" in portable && !("$schema" in cursor));
    assert.ok(!("mcpServers" in claude), "Claude's inline value is the server map itself, not a wrapped file");
    assert.ok(!JSON.stringify(json(PKG, ".codex-plugin", "plugin.json")).includes('"http"'));
    assert.ok(!JSON.stringify(json(PKG, ".cursor-plugin", "plugin.json")).includes("streamable-http"));
  });

  test("every bundled entry names only the production endpoint and carries no credentials or extra fields", () => {
    const files = ["mcp.json", "cursor/mcp.json", ".claude-plugin/plugin.json", ".codex-plugin/plugin.json", ".cursor-plugin/plugin.json", "plugin.json"];
    for (const file of files) {
      const config = JSON.parse(read(PKG, file));
      for (const server of Object.values(config.mcpServers ?? {})) {
        if (typeof server === "object") {
          assert.ok(Object.keys(server).every((key) => ["type", "url"].includes(key)), `${file} server keys`);
          assert.equal(server.url, ENDPOINT);
        }
      }
      const servers = JSON.stringify(config.mcpServers ?? {});
      assert.doesNotMatch(servers, /token|secret|password|api[_-]?key|authorization|bearer|client[_-]?id|"headers"|"oauth"|\$\{/i, file);
    }
  });

  test("nothing ineligible for the public OpenAI ZIP is included", () => {
    assert.ok(!fs.existsSync(path.join(PKG, ".app.json")), "no .app.json");
    assert.ok(!fs.existsSync(path.join(PKG, "hooks")), "no hooks directory");
    for (const manifest of [".claude-plugin", ".codex-plugin", ".cursor-plugin"]) {
      const config = json(PKG, manifest, "plugin.json");
      assert.ok(!("apps" in config) && !("hooks" in config), `${manifest} declares no apps or hooks`);
    }
    assert.ok(!("apps" in json(PKG, "plugin.json")) && !("extensions" in json(PKG, "plugin.json")));
    for (const file of packageFiles()) {
      if (!/\.(md|json|toml)$/.test(file)) continue;
      assert.doesNotMatch(read(file), /openai-apps-challenge/, `${path.relative(PKG, file)}: the domain-verification challenge is not a plugin field`);
    }
  });

  test("the skills-only OpenAI ZIP builder refuses this package, and the skills-only packages stay MCP-free", () => {
    for (const pkg of ["preset-api-skills", "preset-cli-skills", "preset-snowflake-cortex-skills"]) {
      const dir = path.join(ROOT, "plugins", pkg);
      for (const rel of [".mcp.json", "mcp.json", ".app.json", "hooks"]) assert.ok(!fs.existsSync(path.join(dir, rel)), `${pkg}/${rel}`);
      assert.ok(!("mcpServers" in json(dir, ".codex-plugin", "plugin.json")));
    }
    const result = spawnSync("node", ["scripts/build-openai-plugin-zip.mjs", "--plugin", "preset-mcp-skills"], { cwd: ROOT, encoding: "utf8" });
    assert.notEqual(result.status, 0, "building preset-mcp-skills as a skills-only upload must fail");
    assert.match(result.stderr, /MCP|mcpServers/);
  });

  test("version is in lockstep for the portable manifest", () => {
    assert.equal(json(PKG, "plugin.json").version, fs.readFileSync(path.join(ROOT, "VERSION"), "utf8").trim());
  });
});

describe("single-sourced endpoint and generated config", () => {
  const readDisk = (rel) => (fs.existsSync(path.join(ROOT, rel)) ? fs.readFileSync(path.join(ROOT, rel), "utf8") : null);

  test("the source file pins the production endpoint and every target is generated from it", () => {
    assert.equal(SOURCE.endpoint, PINNED_ENDPOINT);
    assert.deepEqual(checkPackage(readDisk, SOURCE), []);
    const result = spawnSync("node", ["scripts/sync-mcp-config.mjs", "--check"], { cwd: ROOT, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(clients.endpoint, ENDPOINT);
  });

  test("changing the source endpoint changes every generated file, so no copy is hand-maintained", () => {
    const other = { ...SOURCE, endpoint: "https://example.invalid/mcp" };
    const before = generatedFiles(SOURCE);
    const after = generatedFiles(other);
    assert.deepEqual(Object.keys(before), Object.keys(after));
    for (const rel of Object.keys(before)) {
      assert.notEqual(before[rel], after[rel], `${rel} follows the source`);
      assert.ok(after[rel].includes("example.invalid"));
      assert.ok(!after[rel].includes(PINNED_ENDPOINT));
    }
    for (const fields of Object.values(manifestFields(other))) {
      if (fields.mcpServers === undefined) continue;
      assert.ok(typeof fields.mcpServers === "string" || JSON.stringify(fields).includes("example.invalid"));
    }
  });

  test("the checker flags a wrong endpoint, a missing target file, an unsolicited setting, and credentials", () => {
    const overlay = (rel, text) => (file) => (file === rel ? text : readDisk(file));
    const mcp = `${PKG_REL}/mcp.json`;
    const wrongHost = readDisk(mcp).replace("mcp.app.preset.io", "mcp.staging.example");
    assert.ok(checkPackage(overlay(mcp, wrongHost), SOURCE).some((p) => p.includes(mcp)));
    const cursor = `${PKG_REL}/cursor/mcp.json`;
    assert.ok(checkPackage(overlay(cursor, null), SOURCE).some((p) => p.includes("missing")));
    const extra = JSON.stringify({ mcpServers: { preset: { url: ENDPOINT, timeout: 5 } } }, null, 2) + "\n";
    assert.ok(checkPackage(overlay(cursor, extra), SOURCE).some((p) => p.includes("unsolicited setting")));
    const secret = JSON.stringify({ mcpServers: { preset: { url: ENDPOINT, headers: { Authorization: "Bearer x" } } } }, null, 2) + "\n";
    const problems = checkPackage(overlay(cursor, secret), SOURCE);
    assert.ok(problems.some((p) => p.includes("credential-like")));
    assert.ok(checkPackage((file) => (file === `${PKG_REL}/.app.json` ? "{}" : readDisk(file)), SOURCE).some((p) => p.includes("not eligible")));
  });

  describe("a renamed user server name reaches every derived field", () => {
    const RENAMED = "preset-other";
    const syncIn = (dir, ...args) => spawnSync("node", [path.join(ROOT, "scripts", "sync-mcp-config.mjs"), ...args], { cwd: dir, encoding: "utf8" });
    const tempCopy = () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-sync-"));
      fs.cpSync(PKG, path.join(dir, PKG_REL), { recursive: true });
      return dir;
    };
    const setUserName = (dir) => {
      const file = path.join(dir, PKG_REL, "connections", "gateway.json");
      fs.writeFileSync(file, `${JSON.stringify({ ...JSON.parse(fs.readFileSync(file, "utf8")), userServerName: RENAMED }, null, 2)}\n`);
    };

    test("the add and login commands in clients.json come from gateway.json", () => {
      const fields = clientsIndexFields({ ...SOURCE, userServerName: RENAMED });
      assert.equal(fields.commands["claude-code"].cli, `claude mcp add --transport http ${RENAMED} ${ENDPOINT}`);
      assert.match(fields.commands["claude-code"].signIn, new RegExp(`claude mcp login ${RENAMED}\\)`));
      assert.match(fields.commands.codex.signIn, new RegExp(`codex mcp login ${RENAMED} `));
      const byId = Object.fromEntries(clients.clients.map((c) => [c.id, c]));
      assert.equal(byId["claude-code"].cli, clientsIndexFields(SOURCE).commands["claude-code"].cli);
      assert.equal(byId.codex.signIn, clientsIndexFields(SOURCE).commands.codex.signIn);
    });

    test("--check fails on a stale clients.json and a plain sync regenerates it", () => {
      const dir = tempCopy();
      try {
        assert.equal(syncIn(dir, "--check").status, 0);
        setUserName(dir);
        const stale = syncIn(dir, "--check");
        assert.notEqual(stale.status, 0, "templates and clients.json still carry the old name");
        assert.match(stale.stderr, /clients\.json/);
        assert.equal(syncIn(dir).status, 0);
        assert.equal(syncIn(dir, "--check").status, 0);
        const index = JSON.parse(fs.readFileSync(path.join(dir, PKG_REL, "connections", "clients.json"), "utf8"));
        const text = JSON.stringify(index);
        assert.ok(!text.includes("preset-gateway"), "no stale user server name left in clients.json");
        assert.equal(index.serverName, RENAMED);
        assert.equal(index.clients.find((c) => c.id === "claude-code").cli, `claude mcp add --transport http ${RENAMED} ${ENDPOINT}`);
        assert.ok(index.clients.find((c) => c.id === "codex").signIn.includes(`codex mcp login ${RENAMED}`));
      } finally {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });

    test("--check fails when only a command string in clients.json is stale", () => {
      const dir = tempCopy();
      try {
        const file = path.join(dir, PKG_REL, "connections", "clients.json");
        fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("codex mcp login preset-gateway", "codex mcp login stale-name"));
        const result = syncIn(dir, "--check");
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /clients\.json/);
      } finally {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  test("every preset.io/mcp URL in package config files is the source endpoint", () => {
    for (const file of packageFiles()) {
      if (!/\.(json|toml)$/.test(file) || file.endsWith(`${path.sep}tool-inventory.json`)) continue;
      for (const url of read(file).match(/https:\/\/[a-z0-9.-]*preset\.io\/mcp\b/gi) ?? []) {
        assert.equal(url, ENDPOINT, path.relative(PKG, file));
      }
    }
  });

  test("staging and sandbox appear only as opt-in placeholders, never as a real host", () => {
    const readme = read(PKG, "connections", "README.md");
    assert.match(readme, /Opt-in example for a non-production gateway/);
    assert.match(readme, /<operator-supplied-gateway-host>/);
    assert.match(readme, /preset-gateway-staging/);
    for (const file of packageFiles()) {
      if (!/\.(json|toml)$/.test(file)) continue;
      assert.doesNotMatch(read(file), /staging|sandbox/i, `${path.relative(PKG, file)} (config files carry no non-production host)`);
    }
  });
});

describe("built OpenAI archive carries every target's config", () => {
  const NAME = "preset-mcp-skills";
  let files;

  before(() => {
    execFileSync(process.execPath, ["scripts/build-openai-plugin-zip.mjs", "--plugin", NAME, "--with-mcp"], { cwd: ROOT, stdio: "pipe" });
    const version = fs.readFileSync(path.join(ROOT, "VERSION"), "utf8").trim();
    files = readZip(fs.readFileSync(path.join(ROOT, "dist", `${NAME}-${version}-openai.zip`)));
  });

  const inArchive = (rel) => files.get(`${NAME}/${rel.slice(PKG_REL.length + 1)}`)?.toString("utf8") ?? null;

  test("every target's config file is in the archive with the exact derived shape and endpoint", () => {
    assert.deepEqual(checkPackage(inArchive, SOURCE), []);
    for (const rel of ["mcp.json", "cursor/mcp.json", "plugin.json", ".claude-plugin/plugin.json", ".codex-plugin/plugin.json", ".cursor-plugin/plugin.json"]) {
      assert.ok(files.has(`${NAME}/${rel}`), `${rel} is archived`);
    }
    assert.deepEqual(JSON.parse(files.get(`${NAME}/mcp.json`)).mcpServers.preset, { type: "streamable-http", url: ENDPOINT });
    assert.ok(!files.has(`${NAME}/.mcp.json`), "a root .mcp.json would be auto-discovered by Claude Code");
    assert.deepEqual(JSON.parse(files.get(`${NAME}/.claude-plugin/plugin.json`)).mcpServers, { preset: { type: "http", url: ENDPOINT } });
    assert.ok(!("mcpServers" in JSON.parse(files.get(`${NAME}/.codex-plugin/plugin.json`))));
    assert.equal(JSON.parse(files.get(`${NAME}/.cursor-plugin/plugin.json`)).mcpServers, "./cursor/mcp.json");
    assert.deepEqual(JSON.parse(files.get(`${NAME}/cursor/mcp.json`)), { mcpServers: { preset: { url: ENDPOINT } } });
  });

  test("archived portable files validate against the Agent Plugins schemas", () => {
    const plugin = json(ROOT, "tests", "fixtures", "agent-plugins", "plugin.schema.json");
    const mcp = json(ROOT, "tests", "fixtures", "agent-plugins", "mcp.schema.json");
    assert.deepEqual(validate(plugin, JSON.parse(files.get(`${NAME}/plugin.json`))), []);
    assert.deepEqual(validate(mcp, JSON.parse(files.get(`${NAME}/mcp.json`))), []);
  });

  test("the archive has no credential-like config, no app mapping, no hooks, and no other host", () => {
    for (const [entry, data] of files) {
      assert.ok(!/(^|\/)\.app\.json$/.test(entry) && !entry.includes("/hooks/"), entry);
      const text = data.toString("utf8");
      assert.doesNotMatch(text, /openai-apps-challenge/, entry);
      if (/(^|\/)\.?mcp\.json$/.test(entry) || entry.endsWith(".mcp.json")) {
        assert.doesNotMatch(JSON.stringify(JSON.parse(text).mcpServers ?? JSON.parse(text).servers), CREDENTIAL_LIKE, entry);
      }
      for (const url of text.match(/https:\/\/[a-z0-9.-]*preset\.io\/mcp\b/gi) ?? []) assert.equal(url, ENDPOINT, entry);
    }
  });

  test("the archive ships the skills, including the gateway skill, and the user-level templates", () => {
    assert.ok(files.has(`${NAME}/skills/preset-mcp-gateway/SKILL.md`));
    assert.ok(files.has(`${NAME}/skills/preset-mcp/SKILL.md`));
    for (const rel of ["claude-code.mcp.json", "cursor.mcp.json", "vscode.mcp.json", "codex.config.toml", "clients.json", "gateway.json"]) {
      assert.ok(files.has(`${NAME}/connections/${rel}`), rel);
    }
  });

  test("the skills-only archives stay free of MCP config", () => {
    for (const pkg of ["preset-api-skills", "preset-cli-skills", "preset-snowflake-cortex-skills"]) {
      const version = fs.readFileSync(path.join(ROOT, "VERSION"), "utf8").trim();
      execFileSync(process.execPath, ["scripts/build-openai-plugin-zip.mjs", "--plugin", pkg], { cwd: ROOT, stdio: "pipe" });
      const archive = readZip(fs.readFileSync(path.join(ROOT, "dist", `${pkg}-${version}-openai.zip`)));
      for (const entry of archive.keys()) assert.ok(!/(^|\/)\.?mcp\.json$/.test(entry) && !entry.endsWith(".app.json"), entry);
    }
    const refused = spawnSync("node", ["scripts/build-openai-plugin-zip.mjs", "--plugin", "preset-cli-skills", "--with-mcp"], { cwd: ROOT, encoding: "utf8" });
    assert.notEqual(refused.status, 0);
  });
});

describe("stale gateway claims", () => {
  test("flags the previous Superset-only wording", () => {
    const stale = [
      "The Superset MCP server is the source of truth for tool names, tags, request schemas, response schemas, annotations, prompts, resources, and RBAC metadata.",
      "The live Superset MCP server under `superset/superset/mcp_service` is the source of truth for tools and schemas.",
      "Treat `superset/superset/mcp_service` as the only source of truth for MCP tool names, schemas, tags, and RBAC metadata.",
      "Superset alone defines the gateway's top-level tools.",
      "The gateway has no tools of its own.",
      "Treat superset/superset/mcp_service as the source of truth for MCP tool names, schemas, and annotations. Do not use this package for direct Preset Management API work.",
      "The Superset MCP server is the source of truth for MCP tool names and schemas. Do not use direct API calls.",
      "Superset is the source of truth for every tool you can call here. No direct API fallback.",
      "Superset is the source of truth for tool names. Use a direct connection separately.",
      "Superset is the source of truth for tool names. The gateway is a separate surface.",
    ];
    for (const text of stale) assert.ok(findStaleClaims(text).length > 0, text);
  });

  test("accepts surface-scoped wording", () => {
    const fine = [
      "Direct workspace connection: the Superset MCP server is the source of truth for tool names.",
      "On a direct connection, Superset is the source of truth for tool names.",
      "Superset is the source of truth for workspace tools.",
      "On the Preset gateway, the gateway defines the top-level tools and Superset defines the workspace tools.",
    ];
    for (const text of fine) assert.deepEqual(findStaleClaims(text), [], text);
  });

  test("the repository documentation has no stale claim", () => {
    assert.deepEqual(scanRepository(), []);
  });
});

describe("test labelling", () => {
  test("fixtures are labelled mocked and the README distinguishes mocked tests from canaries", () => {
    for (const file of fs.readdirSync(path.join(FIXTURES, "scenarios"))) {
      assert.equal(json(FIXTURES, "scenarios", file).label, "mocked");
    }
    assert.equal(json(FIXTURES, "violations.json").label, "mocked");
    const readme = read(PKG, "README.md");
    assert.match(readme, /Mocked tests/);
    assert.match(readme, /Authenticated canaries \(manual, read-only, not part of CI/);
  });
});


describe("smoke archive listing under pipefail", () => {
  test("drains a large listing and still rejects missing entries", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-unzip-"));
    try {
      const fake = `#!${process.execPath}
const fs = require("node:fs");
if (process.argv[2] === "-tq") process.exit(0);
try {
  for (const entry of ["mcp.json", "cursor/mcp.json", ".claude-plugin/plugin.json", ".codex-plugin/plugin.json", ".cursor-plugin/plugin.json", "plugin.json"]) {
    if (entry !== process.env.MISSING_ENTRY) fs.writeSync(1, "preset-mcp-skills/" + entry + "\\n");
  }
  for (let i = 0; i < 4096; i++) fs.writeSync(1, "padding/" + "x".repeat(1024) + "\\n");
} catch (error) { if (error.code === "EPIPE") process.exit(141); throw error; }
`;
      fs.writeFileSync(path.join(dir, "unzip"), fake, { mode: 0o755 });
      const smoke = read(ROOT, "scripts", "smoke-test.sh");
      const block = smoke.slice(smoke.indexOf("if command -v unzip"), smoke.indexOf("\nfi", smoke.indexOf("if command -v unzip")) + 3);
      const run = (missing = "") => spawnSync("bash", ["-c", `set -euo pipefail; mcp_zip=mock.zip; fail() { echo "$*" >&2; exit 1; }; ${block}`], {
        encoding: "utf8", env: { ...process.env, PATH: `${dir}:${process.env.PATH}`, MISSING_ENTRY: missing },
      });
      assert.equal(run().status, 0, "present entries must not fail due to producer SIGPIPE");
      const missing = run("cursor/mcp.json");
      assert.notEqual(missing.status, 0);
      assert.match(missing.stderr, /missing cursor\/mcp\.json/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

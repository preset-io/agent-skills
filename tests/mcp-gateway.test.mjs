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
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

import { findStaleClaims, scanRepository } from "../scripts/check-mcp-gateway-claims.mjs";
import { walk } from "./lib/walkthrough.mjs";
import { CONTRACT } from "./lib/mock-gateway.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PKG = path.join(ROOT, "plugins", "preset-mcp-skills");
const SKILL = path.join(PKG, "skills", "preset-mcp-gateway");
const FIXTURES = path.join(ROOT, "tests", "fixtures", "mcp-gateway");
const ENDPOINT = "https://mcp.app.preset.io/mcp";

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

  test("the package never auto-connects or defaults to a non-production host", () => {
    for (const manifest of [".claude-plugin", ".codex-plugin", ".cursor-plugin"]) {
      const config = json(PKG, manifest, "plugin.json");
      assert.ok(!("mcpServers" in config) && !("mcp_servers" in config), `${manifest} declares no MCP server`);
    }
    assert.ok(!fs.existsSync(path.join(PKG, ".mcp.json")), "no bundled .mcp.json");
    for (const file of packageFiles()) {
      if (!/\.(md|json|toml)$/.test(file)) continue;
      const hosts = read(file).match(/https:\/\/[a-z0-9.-]*preset\.io\/mcp\b/gi) ?? [];
      for (const host of hosts) assert.equal(host, ENDPOINT, `${path.relative(PKG, file)} only names the production endpoint`);
    }
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

describe("stale gateway claims", () => {
  test("flags the previous Superset-only wording", () => {
    const stale = [
      "The Superset MCP server is the source of truth for tool names, tags, request schemas, response schemas, annotations, prompts, resources, and RBAC metadata.",
      "The live Superset MCP server under `superset/superset/mcp_service` is the source of truth for tools and schemas.",
      "Treat `superset/superset/mcp_service` as the only source of truth for MCP tool names, schemas, tags, and RBAC metadata.",
      "Superset alone defines the gateway's top-level tools.",
      "The gateway has no tools of its own.",
    ];
    for (const text of stale) assert.ok(findStaleClaims(text).length > 0, text);
  });

  test("accepts surface-scoped wording", () => {
    const fine = [
      "Direct workspace connection: the Superset MCP server is the source of truth for tool names.",
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

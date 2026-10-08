// Release-scope guard: Knowledge document tools are not in the initial public
// release, so no Knowledge tool or service name may appear in the released copy
// of plugins/preset-mcp-skills or in its fixtures and tests. This file and its
// sample input are the deliberate allowlist entries (OUT_OF_SCOPE_ALLOWLIST in
// scripts/check-mcp-gateway-claims.mjs) because they must name the term.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

import { OUT_OF_SCOPE_ALLOWLIST, findOutOfScopeTerms, scanRepository } from "../scripts/check-mcp-gateway-claims.mjs";
import { CONTRACT } from "./lib/mock-gateway.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PKG = path.join(ROOT, "plugins", "preset-mcp-skills");
const read = (...parts) => fs.readFileSync(path.join(...parts), "utf8");
const json = (...parts) => JSON.parse(read(...parts));
const findKnowledgeTerms = findOutOfScopeTerms;
const KNOWLEDGE_ALLOWLIST = OUT_OF_SCOPE_ALLOWLIST;
const FIXTURES = path.join(ROOT, "tests", "fixtures", "mcp-gateway");

describe("release scope: no Knowledge tools in the released copy", () => {
  const samples = json(FIXTURES, "..", "mcp-gateway-guard", "knowledge-samples.json");

  test("the guard flags every Knowledge tool and service name and accepts the neutral line", () => {
    for (const text of samples.flagged) assert.ok(findKnowledgeTerms(text).length > 0, text);
    for (const text of samples.neutral) assert.deepEqual(findKnowledgeTerms(text), [], text);
  });

  test("the only allowlist entries are the guard's own test and sample file, with a reason", () => {
    assert.deepEqual(KNOWLEDGE_ALLOWLIST.map((entry) => entry.file).sort(), [
      "tests/fixtures/mcp-gateway-guard/knowledge-samples.json",
      "tests/release-scope-guard.test.mjs",
    ]);
    for (const entry of KNOWLEDGE_ALLOWLIST) assert.ok(entry.reason.length > 20);
  });

  test("the repository scan finds no Knowledge term in skills, docs, manifests, listing metadata, starter prompts, fixtures, or tests", () => {
    const hits = scanRepository().filter((finding) => finding.rule.startsWith("release-scope"));
    assert.deepEqual(hits, []);
  });

  test("manifests, listing metadata and starter prompts never name Knowledge", () => {
    for (const manifest of [".claude-plugin", ".codex-plugin", ".cursor-plugin"]) {
      assert.deepEqual(findKnowledgeTerms(read(PKG, manifest, "plugin.json")), [], manifest);
    }
    assert.deepEqual(findKnowledgeTerms(read(PKG, "plugin.json")), []);
    for (const prompt of json(PKG, ".codex-plugin", "plugin.json").interface.defaultPrompt) assert.deepEqual(findKnowledgeTerms(prompt), []);
  });

  test("the allowlist cannot be widened by a rule-less entry or a missing file", () => {
    for (const entry of KNOWLEDGE_ALLOWLIST) assert.ok(fs.existsSync(path.join(ROOT, entry.file)), entry.file);
  });

  test("the gateway contract fixture lists no Knowledge tool", () => {
    assert.deepEqual(Object.keys(CONTRACT.tools).sort(), [
      "call_tool",
      "get_workspace_catalog",
      "list_workspace_services",
      "list_workspaces",
      "search_workspace_tools",
    ]);
  });
});

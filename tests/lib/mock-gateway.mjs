// MOCKED Preset MCP gateway and direct workspace MCP server for the walkthrough
// tests. Behaviour mirrors the contract recorded in
// tests/fixtures/mcp-gateway/gateway-contract.json (read from preset-io/mcp-gateway
// main). Nothing here talks to a network or a live service.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const CONTRACT = JSON.parse(
  fs.readFileSync(path.join(HERE, "..", "fixtures", "mcp-gateway", "gateway-contract.json"), "utf8"),
);

const ok = (value, meta) => ({ isError: false, value, ...(meta ? { meta } : {}) });
const fail = (text) => ({ isError: true, text });

function schemaCheck(schema, args) {
  if (args === null || typeof args !== "object" || Array.isArray(args)) return "args must be an object";
  for (const key of schema.required ?? []) {
    if (!(key in args)) return `missing required field '${key}'`;
  }
  return null;
}

export class MockGateway {
  constructor(world) {
    this.world = world;
    this.surface = "gateway";
    this.calls = [];
  }

  listedTools() {
    // Knowledge tools can be advertised from a cached tools/list while calls are denied.
    return Object.keys(CONTRACT.tools);
  }

  workspace(id) {
    return this.world.workspaces.find((w) => String(w.id) === String(id));
  }

  call(tool, args = {}) {
    this.calls.push({ tool, args });
    const spec = CONTRACT.tools[tool];
    if (!spec) return fail(`Unknown tool: '${tool}'`);
    for (const key of spec.required) {
      if (!(key in args)) return fail(`Missing required argument: ${key}`);
    }
    const known = new Set([...spec.required, ...spec.optional]);
    for (const key of Object.keys(args)) {
      if (!known.has(key)) return fail(`Unexpected argument: ${key}`);
    }
    if (this.world.authExpired) return fail("authentication required");
    if (tool === "list_workspaces") return ok(this.world.workspaces.map(({ id, name, title }) => ({ id, name, title })));
    return this.workspaceScoped(tool, args);
  }

  workspaceScoped(tool, args) {
    if (!/^\d+$/.test(String(args.workspace_id))) return fail(CONTRACT.messages.workspaceIdNotNumeric);
    const ws = this.workspace(args.workspace_id);
    if (!ws) return fail(CONTRACT.messages.workspaceNotAvailable);
    const services = this.enabledServices(ws);

    if (tool === "list_workspace_services") {
      return ok(
        services.map((id) => ({
          service_id: id,
          tools:
            id === "workspace_tools"
              ? ["search_workspace_tools", "call_tool", ...(ws.catalog ? ["get_workspace_catalog"] : [])]
              : ["list_knowledge_docs", "read_knowledge_doc"],
        })),
      );
    }
    if (CONTRACT.tools[tool].service === "knowledge") {
      if (!services.includes("knowledge")) return fail(CONTRACT.messages.unknownKnowledgeTool.replace("{tool}", tool));
      return ok({ slug: args.slug ?? null });
    }
    // search_workspace_tools, call_tool, get_workspace_catalog need workspace_tools and a scope.
    if (!this.world.scopes.some((s) => s.startsWith("superset:"))) return fail(CONTRACT.messages.capabilityRequired);
    if (!services.includes("workspace_tools")) return fail(CONTRACT.messages.workspaceNotAvailable);
    if (tool === "get_workspace_catalog") {
      return ws.catalog ? ok({ items: [] }) : fail("This workspace does not provide the permission-filtered catalog yet.");
    }
    if (tool === "search_workspace_tools") return this.search(ws, args);
    return this.dispatch(ws, args);
  }

  enabledServices(ws) {
    return ws.services.filter((s) => s !== "knowledge" || ws.knowledgeLaunched);
  }

  search(ws, { query, limit, offset = 0 }) {
    if (typeof query !== "string" || query.trim() === "") return fail("query must contain non-whitespace text");
    const q = query.toLowerCase();
    const matches = ws.tools.filter((t) => t.name.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q));
    const window = limit === undefined ? matches.slice(offset) : matches.slice(offset, offset + limit);
    const kept = [];
    const omitted = [];
    window.forEach((tool, index) => {
      if (tool.oversized && window.length > 1) {
        omitted.push({ name: tool.name, offset: offset + index, retrievable_alone: true });
      } else {
        const { oversized, ...definition } = tool;
        kept.push(definition);
      }
    });
    const meta = { "io.preset/pagination": { has_more: false, next_offset: null } };
    const result = ok(kept, meta);
    if (omitted.length > 0) {
      result.omitted = omitted;
      result.note = "Fetch each omitted tool with limit=1 and its offset.";
    }
    return result;
  }

  dispatch(ws, { tool_name: toolName, args }) {
    if (!CONTRACT.reviewedWorkspaceTools.includes(toolName)) return fail(CONTRACT.messages.unreviewedTool);
    const tool = ws.tools.find((t) => t.name === toolName);
    if (!tool) return fail(`This Preset workspace does not provide a tool named '${toolName}'.`);
    if (typeof args !== "object" || args === null || Array.isArray(args)) return fail("args must be an object");
    const problem = schemaCheck(tool.inputSchema, args);
    if (problem) {
      const wrapped = "request" in args;
      return fail(
        !wrapped && Object.keys(args).length > 0
          ? CONTRACT.messages.wrapperHint.replace("{tool}", toolName)
          : `Workspace tool argument validation failed for '${toolName}': ${problem}`,
      );
    }
    return ok({ tool: toolName, workspace_id: String(ws.id) });
  }
}

export class MockDirectWorkspace {
  constructor(world) {
    this.world = world;
    this.surface = "direct";
    this.calls = [];
  }

  listedTools() {
    return [...this.world.tools.map((t) => t.name), "search_tools", "call_tool"];
  }

  call(tool, args = {}) {
    this.calls.push({ tool, args });
    if (tool === "search_tools") {
      const q = String(args.query ?? "").toLowerCase();
      return ok(this.world.tools.filter((t) => t.name.includes(q)));
    }
    if (tool === "call_tool") {
      if (!("name" in args) || !("arguments" in args)) return fail("call_tool requires name and arguments");
      if ("workspace_id" in args || "tool_name" in args || "args" in args) return fail("Unexpected argument for a direct connection");
      return this.invoke(args.name, args.arguments);
    }
    return this.invoke(tool, args);
  }

  invoke(name, args) {
    const tool = this.world.tools.find((t) => t.name === name);
    if (!tool) return fail(`Unknown tool: '${name}'`);
    const problem = schemaCheck(tool.inputSchema, args ?? {});
    if (problem) return fail(`Request validation failed: ${problem}`);
    return ok({ tool: name });
  }
}

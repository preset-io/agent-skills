// Replays a scripted agent walkthrough against the MOCKED gateway or direct
// workspace and reports violations of the rules taught by
// plugins/preset-mcp-skills/skills/preset-mcp-gateway/SKILL.md.
//
// A scenario is {surface, environments | world, steps}. Steps:
//   {connect: "<env>"}                       switch to another environment's gateway
//   {call, args, expect?}                    one tool call; expect = {isError, contains}
//   {ask: "<text>"}                          the agent asks the user a question
//   {user: {selects?: <id>, confirms?: true}} the user answers
//   {stop: "<text>"}                         the agent reports and stops
import { MockDirectWorkspace, MockGateway } from "./mock-gateway.mjs";

const GATEWAY_ONLY = new Set([
  "list_workspaces",
  "list_workspace_services",
  "search_workspace_tools",
  "get_workspace_catalog",
  "list_knowledge_docs",
  "read_knowledge_doc",
]);
const AUTH_FAILURE = /authentication required|lacks the required Superset capability|did not authorize the connected identity/;

export function walk(scenario) {
  const environments = scenario.environments ?? { default: scenario.world };
  let envName = scenario.environment ?? Object.keys(environments)[0];
  const make = (name) =>
    scenario.surface === "direct" ? new MockDirectWorkspace(environments[name]) : new MockGateway(environments[name]);
  let server = make(envName);

  const violations = [];
  const log = [];
  const flag = (rule, detail) => violations.push({ rule, detail });

  const listedIds = {}; // env -> Set of ids returned by list_workspaces
  let listedWorkspaces = [];
  let userSelected = null;
  let confirmed = false;
  const services = new Map(); // `${env}:${ws}` -> service ids from list_workspace_services
  const searched = new Map(); // `${env}:${ws}:${tool}` -> definition
  const failures = new Map(); // signature -> count
  let authBroken = false;
  let stopped = false;

  for (const step of scenario.steps) {
    if (stopped) {
      flag("action-after-stop", JSON.stringify(step));
      continue;
    }
    if (step.connect) {
      envName = step.connect;
      server = make(envName);
      listedWorkspaces = [];
      userSelected = null;
      continue;
    }
    if (step.ask) {
      confirmed = false;
      continue;
    }
    if (step.user) {
      if (step.user.selects !== undefined) userSelected = String(step.user.selects);
      if (step.user.confirms) confirmed = true;
      continue;
    }
    if (step.stop) {
      stopped = true;
      continue;
    }

    const { call: tool, args = {} } = step;
    if (authBroken) flag("continued-after-auth-failure", tool);

    if (server.surface === "direct") {
      if (GATEWAY_ONLY.has(tool)) flag("gateway-tool-on-direct", tool);
      if (tool === "call_tool" && ("workspace_id" in args || "tool_name" in args || "args" in args)) {
        flag("gateway-shape-on-direct", Object.keys(args).join(","));
      }
    } else {
      checkGatewayCall(tool, args);
    }

    const result = server.call(tool, args);
    log.push({ tool, args, result });
    if (step.expect) {
      if (step.expect.isError !== undefined && step.expect.isError !== result.isError) {
        throw new Error(`fixture expectation failed for ${tool}: isError=${result.isError} ${JSON.stringify(result)}`);
      }
      if (step.expect.contains && !JSON.stringify(result).includes(step.expect.contains)) {
        throw new Error(`fixture expectation failed for ${tool}: missing "${step.expect.contains}" in ${JSON.stringify(result)}`);
      }
    }

    if (server.surface === "gateway") record(tool, args, result);
    if (result.isError) {
      const signature = `${tool}:${JSON.stringify(args)}`;
      if (failures.get(signature)) flag("repeated-failed-call", signature);
      failures.set(signature, (failures.get(signature) ?? 0) + 1);
      const key = `${tool}:${args.tool_name ?? args.name ?? ""}`;
      failures.set(key, (failures.get(key) ?? 0) + 1);
      if (failures.get(key) > 2) flag("retry-loop", key);
      if (AUTH_FAILURE.test(result.text ?? "")) authBroken = true;
    }
  }
  return { violations, log };

  function checkGatewayCall(tool, args) {
    if (tool === "list_workspaces") return;
    const wsId = args.workspace_id;
    if (wsId === undefined) return;
    const id = String(wsId);
    if (!listedIds[envName]?.has(id)) {
      const elsewhere = Object.entries(listedIds).some(([name, ids]) => name !== envName && ids.has(id));
      flag(elsewhere ? "cross-environment-workspace-id" : "invented-workspace-id", `${envName}:${id}`);
    }
    if (listedWorkspaces.length > 1 && userSelected === null) flag("silent-workspace-choice", id);
    else if (listedWorkspaces.length > 1 && userSelected !== id) flag("workspace-differs-from-user-choice", id);
    const svc = services.get(`${envName}:${id}`);
    const needs =
      tool === "search_workspace_tools" || tool === "call_tool" || tool === "get_workspace_catalog"
        ? "workspace_tools"
        : tool === "list_knowledge_docs" || tool === "read_knowledge_doc"
          ? "knowledge"
          : null;
    if (needs && svc && !svc.includes(needs)) flag("unlisted-service-call", `${tool} needs ${needs}`);
    if (tool === "get_workspace_catalog" && svc && !svc.includes("get_workspace_catalog")) {
      flag("unlisted-service-call", "get_workspace_catalog not offered");
    }
    if (tool === "call_tool") {
      const definition = searched.get(`${envName}:${id}:${args.tool_name}`);
      if (!definition) flag("call-without-search", `${id}:${args.tool_name}`);
      else if (definition.annotations?.readOnlyHint !== true && !confirmed) {
        flag("write-without-confirmation", args.tool_name);
      }
    }
  }

  function record(tool, args, result) {
    if (result.isError) return;
    if (tool === "list_workspaces") {
      listedWorkspaces = result.value;
      listedIds[envName] = new Set(result.value.map((w) => String(w.id)));
    }
    if (tool === "list_workspace_services") {
      services.set(
        `${envName}:${args.workspace_id}`,
        result.value.flatMap((s) => [s.service_id, ...s.tools.filter((t) => t === "get_workspace_catalog")]),
      );
    }
    if (tool === "search_workspace_tools") {
      for (const definition of result.value) {
        searched.set(`${envName}:${args.workspace_id}:${definition.name}`, definition);
      }
    }
  }
}

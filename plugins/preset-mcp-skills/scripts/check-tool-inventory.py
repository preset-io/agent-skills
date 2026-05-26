#!/usr/bin/env python3
"""Compare preset-mcp-skills inventory with a Superset MCP checkout."""

from __future__ import annotations

import argparse
import ast
import json
import os
from pathlib import Path
from typing import Any, NamedTuple

UNPARSEABLE = "<unparseable>"


class ExtractionResult(NamedTuple):
    tools: list[dict[str, Any]]
    unparseable_values: list[str]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--mcp-root",
        default=os.environ.get("SUPERSET_MCP_SERVICE_PATH"),
        help="Path to superset/superset/mcp_service",
    )
    parser.add_argument(
        "--inventory",
        default=str(Path(__file__).resolve().parents[1] / "references" / "tool-inventory.json"),
        help="Path to tool-inventory.json",
    )
    return parser.parse_args()


def literal_keyword(
    call: ast.Call,
    name: str,
    source: str,
    unparseable_values: list[str],
) -> Any:
    for keyword in call.keywords:
        if keyword.arg == name:
            try:
                return ast.literal_eval(keyword.value)
            except (ValueError, SyntaxError):
                unparseable_values.append(f"{source} keyword {name}")
                return UNPARSEABLE
    return None


def annotation_keyword(
    call: ast.Call,
    name: str,
    source: str,
    unparseable_values: list[str],
) -> Any:
    annotations = next(
        (keyword.value for keyword in call.keywords if keyword.arg == "annotations"),
        None,
    )
    if not isinstance(annotations, ast.Call):
        return None
    for keyword in annotations.keywords:
        if keyword.arg == name:
            try:
                return ast.literal_eval(keyword.value)
            except (ValueError, SyntaxError):
                unparseable_values.append(f"{source} annotation {name}")
                return UNPARSEABLE
    return None


def is_tool_decorator(func: ast.expr) -> bool:
    if isinstance(func, ast.Name):
        return func.id == "tool"
    if isinstance(func, ast.Attribute):
        return func.attr == "tool"
    return False


def extract_tools(mcp_root: Path) -> ExtractionResult:
    tools: list[dict[str, Any]] = []
    unparseable_values: list[str] = []
    for path in sorted(mcp_root.glob("**/tool/*.py")):
        if path.name == "__init__.py":
            continue
        tree = ast.parse(path.read_text(encoding="utf-8"))
        for node in tree.body:
            if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                continue
            for decorator in node.decorator_list:
                if not isinstance(decorator, ast.Call):
                    continue
                if not is_tool_decorator(decorator.func):
                    continue
                source = f"{path.relative_to(mcp_root)}:{node.name}"
                tools.append(
                    {
                        "name": node.name,
                        "tags": literal_keyword(
                            decorator,
                            "tags",
                            source,
                            unparseable_values,
                        )
                        or [],
                        "class_permission_name": literal_keyword(
                            decorator,
                            "class_permission_name",
                            source,
                            unparseable_values,
                        ),
                        "method_permission_name": literal_keyword(
                            decorator,
                            "method_permission_name",
                            source,
                            unparseable_values,
                        ),
                        "read_only": annotation_keyword(
                            decorator,
                            "readOnlyHint",
                            source,
                            unparseable_values,
                        ),
                        "destructive": annotation_keyword(
                            decorator,
                            "destructiveHint",
                            source,
                            unparseable_values,
                        ),
                    }
                )
    return ExtractionResult(
        tools=sorted(tools, key=lambda item: item["name"]),
        unparseable_values=unparseable_values,
    )


def normalize(tools: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(
        [
            {
                "name": tool["name"],
                "tags": tool.get("tags") or [],
                "class_permission_name": tool.get("class_permission_name"),
                "method_permission_name": tool.get("method_permission_name"),
                "read_only": tool.get("read_only"),
                "destructive": tool.get("destructive"),
            }
            for tool in tools
        ],
        key=lambda item: item["name"],
    )


def main() -> int:
    args = parse_args()
    inventory_path = Path(args.inventory)
    expected = normalize(json.loads(inventory_path.read_text(encoding="utf-8"))["tools"])

    if args.mcp_root:
        mcp_root = Path(args.mcp_root).expanduser().resolve()
    else:
        mcp_root = (Path.cwd() / "../superset/superset/mcp_service").resolve()

    if not mcp_root.exists():
        print(f"Superset MCP root not found; skipped drift check: {mcp_root}")
        return 0

    extraction = extract_tools(mcp_root)
    if not extraction.tools:
        print("MCP tool inventory drift check could not find any tools")
        print(f"Checked root: {mcp_root}")
        print(
            "Verify the MCP service layout and decorator pattern, "
            "for example @tool(...) or @mcp.tool(...)."
        )
        return 1

    if extraction.unparseable_values:
        print("MCP tool inventory drift check found unparseable decorator values")
        for value in extraction.unparseable_values:
            print(f"- {value}")
        return 1

    actual = normalize(extraction.tools)
    if actual == expected:
        print(f"MCP tool inventory matches {mcp_root}")
        return 0

    expected_names = {tool["name"] for tool in expected}
    actual_names = {tool["name"] for tool in actual}
    print("MCP tool inventory drift detected")
    print("Missing from inventory:", sorted(actual_names - expected_names))
    print("Stale in inventory:", sorted(expected_names - actual_names))
    for expected_tool, actual_tool in zip(expected, actual):
        if expected_tool != actual_tool:
            print("First differing expected:", json.dumps(expected_tool, sort_keys=True))
            print("First differing actual:", json.dumps(actual_tool, sort_keys=True))
            break
    return 1


if __name__ == "__main__":
    raise SystemExit(main())

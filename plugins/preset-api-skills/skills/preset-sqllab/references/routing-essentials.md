# SQL Lab Routing Essentials

Use this compact routing reference when a task spans SQL Lab bootstrap, query history, saved queries, result retrieval, query stop, and execution.

Default to inspecting SQL Lab bootstrap metadata first. Route each request separately: query history can expose SQL text, saved queries can expose or mutate SQL definitions, result retrieval/export returns customer data, query stop changes execution state, and SQL execution starts a new job.

Before reading SQL text, retrieving results, exporting results, stopping a query, creating a permalink, mutating a saved query, or executing SQL, summarize the workspace, target query or saved query, endpoint, expected data exposure or state change, and get explicit approval. Stop before sensitive read, result retrieval, query stop, or execution. Redact secrets, tokens, SQLAlchemy URIs, and credentials.

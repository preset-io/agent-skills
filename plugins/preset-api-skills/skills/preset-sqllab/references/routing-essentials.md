# SQL Lab Routing Essentials

Use this compact routing reference when a task spans SQL Lab bootstrap, query history, saved queries, result retrieval, query stop, and execution.

Default to inspecting SQL Lab bootstrap metadata first. Route each request separately: query history can expose SQL text, saved queries can expose or mutate SQL definitions, result retrieval/export returns customer data, query stop changes execution state, and SQL execution starts a new job.

Run directly: the user's own query history and saved-query reads when current-user/owner filtering is applied before SQL-bearing fields are fetched (bounded page size), and result retrieval for a query approved or executed in the current workflow. A confidently classified, user-requested, bounded single-statement SELECT runs directly through `preset-sql-execution`.

Confirm first: other users' SQL text or any history read where owner filtering cannot be applied first, result export, query stop, permalink creation, saved-query mutation, and SQL whose classification or target is unresolved. Summarize the workspace, target query or saved query, endpoint, and expected data exposure or state change, then get explicit approval. Always redact secrets, tokens, SQLAlchemy URIs, and credentials.

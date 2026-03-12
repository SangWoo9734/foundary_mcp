## Project Context

- Use [docs/project-overview.md](/Users/sangwoo/foundary_mcp/docs/project-overview.md) as the primary project brief for architecture, priorities, and scope decisions.
- Before changing architecture, metadata shape, adapter boundaries, or MCP tool behavior, confirm the change is consistent with the project overview.

## Working Style

- Break implementation into the smallest reasonable tasks.
- Prefer sequential, verifiable steps over large one-shot changes.
- Before major edits, state the current subtask and intended result.
- After each subtask, verify the result before continuing.
- When possible, keep each change scoped to a single concern.
- If a task is broad, split it into setup, implementation, verification, and cleanup.
- Avoid bundling unrelated edits into one pass.

## Communication

- Share short progress updates while working.
- Explain which subtask is being handled before making substantial edits.
- Call out blockers, assumptions, and validation results explicitly.

## Verification

- Run the smallest useful verification after each meaningful change.
- Prefer targeted checks before full builds or broader test runs.
- If something cannot be verified, state that clearly.

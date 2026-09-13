# Agent Instructions & Operating Protocol (`agent_read.md`)

This document is the **Mandatory Operational Protocol** for Antigravity (and any AI Coding Agent) working on the Receipt Collector codebase. When tagged in a prompt (`@[agent_read.md]`), the agent **MUST** follow these instructions strictly before starting and after completing any task.

---

## 1. Pre-Task Execution Protocol (Before Coding or Planning)

Before taking action or writing code, the agent MUST review the following core documentation files:

1. **Read [`goal.md`](file:///c:/receipt-collector/goal.md)**: Understand the product scope, core features (Warranty Vault, Google Drive integration, OCR, Reminders), and architectural rationale.
2. **Read [`planning.md`](file:///c:/receipt-collector/planning.md)**: Check the tech stack, step-by-step build order, and open decisions.
3. **Inspect [`progress.md`](file:///c:/receipt-collector/progress.md)**: Check which build order steps are finished vs. pending.
4. **Inspect [`working.md`](file:///c:/receipt-collector/working.md)**: Review existing codebase registry to prevent duplicate files or broken imports.

---

## 2. Post-Task Completion Protocol (Mandatory After Every Task)

Immediately after completing any feature, file edit, refactoring, or route implementation, the agent **MUST** perform the following updates:

### Step 1: Update [`working.md`](file:///c:/receipt-collector/working.md)
- Register **every created or modified file**.
- Fill in: **File Path**, **Necessity / Purpose** (Why does it exist?), and **Working Mechanism** (How does it work?).

### Step 2: Update [`build_log.md`](file:///c:/receipt-collector/build_log.md)
- Add a new dated factual entry under `### Entries`:
  - Format: `- [YYYY-MM-DD] — Concise factual description of what was built or changed.`

### Step 3: Update [`progress.md`](file:///c:/receipt-collector/progress.md)
- Mark completed build steps with `[x]`.
- Update the overall completion percentage and completed milestones.
- Specify the next immediate tasks.

### Step 4: Update [`folder_structure.md`](file:///c:/receipt-collector/folder_structure.md)
- If new directories, sub-folders, or file trees were introduced, update the ASCII folder structure tree.

---

## 3. Codebase Standards & Guidelines

- **Module Syntax**: Use ES Modules (`import` / `export`) as backend has `"type": "module"`.
- **Response Format**: Always wrap controller responses in `ApiResponse(statusCode, data, message)`.
- **Error Handling**: Throw `ApiError(statusCode, message)` and wrap async route handlers in `asyncHandler`.
- **Mongoose Hooks**: Use modern Mongoose (v6+) synchronous/promise pre-hooks without legacy `next` callbacks (e.g. `productSchema.pre('validate', function () { ... })`).
- **Verification**: Always run `node --check` or diagnostic scripts to verify code correctness before declaring success.

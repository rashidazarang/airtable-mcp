# Agent Handoff: @rashidazarang/airtable-mcp Bug Fixes

## Context

This is an open source MCP (Model Context Protocol) server for Airtable, published on npm as `@rashidazarang/airtable-mcp`. Version 3.2.5 has critical bugs preventing proper operation with Claude Desktop and other MCP clients.

**Repository:** https://github.com/rashidazarang/airtable-mcp
**Package:** https://www.npmjs.com/package/@rashidazarang/airtable-mcp

---

## Your Task

Implement the bug fixes documented in `docs/FIX_PLAN.md`. Before writing any code, you must audit the codebase yourself to understand:

1. How the MCP protocol tool responses work
2. Why the current implementation fails
3. The exact locations and patterns that need modification

---

## Problems to Solve

### Bug 3: Empty `content[]` Arrays (CRITICAL)

**Symptom:** Tools return empty responses to MCP clients even when data is successfully retrieved.

**Root Cause:** All tool handlers return:
```typescript
return {
  structuredContent: data,
  content: [] as const  // ← Empty! Clients see nothing
};
```

The MCP protocol requires the `content` array to contain displayable data. While `structuredContent` is a newer typed output format, most clients read from `content`.

**Files Affected:**
- `src/typescript/app/tools/listBases.ts`
- `src/typescript/app/tools/listGovernance.ts`
- `src/typescript/app/tools/listExceptions.ts`
- `src/typescript/app/tools/webhooks.ts`
- `src/typescript/app/tools/describe.ts`
- `src/typescript/app/tools/query.ts`
- `src/typescript/app/tools/create.ts`
- `src/typescript/app/tools/update.ts`
- `src/typescript/app/tools/upsert.ts`

**Your Audit Task:**
1. Read each tool file and find all `return { ... content: [] ... }` patterns
2. Understand the data flow: where does `structuredContent` get populated?
3. Note that `handleError.ts` correctly returns content — don't break it

---

### Bug 4: `describe` Tool Authentication Error

**Symptom:** The `describe` tool fails with `AUTHENTICATION_REQUIRED` when calling Meta API endpoints.

**Root Cause:** Likely a token scope issue. Airtable's Meta API (`/v0/meta/bases/...`) requires the `schema.bases:read` scope, but error messages don't communicate this to users.

**Files to Examine:**
- `src/typescript/app/airtable-client.ts` — look at `getBase()`, `listTables()`, `toDomainError()`
- `src/typescript/app/tools/describe.ts` — the tool implementation
- `src/typescript/errors.ts` — the `AuthError` class

**Your Audit Task:**
1. Trace the request flow from `describe` tool → `airtable-client` → Airtable API
2. Examine how authentication errors are constructed
3. Determine if error messages should include scope hints for Meta API calls

---

## Implementation Approach (from FIX_PLAN.md)

### Phase 1: Create Response Utility

Create `src/typescript/app/tools/response.ts`:
```typescript
export interface ToolResponse<T> {
  structuredContent: T;
  content: Array<{ type: 'text'; text: string }>;
}

export function createToolResponse<T>(data: T): ToolResponse<T> {
  return {
    structuredContent: data,
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
  };
}
```

### Phase 2: Update All Tool Files

Replace return statements to use `createToolResponse()`. Example:
```typescript
// Before
return { structuredContent, content: [] as const };

// After
return createToolResponse(structuredContent);
```

### Phase 3: Improve Auth Error Messages

Update `src/typescript/errors.ts` to provide actionable hints when Meta API auth fails.

---

## Verification Requirements

After implementation:

```bash
npm run build      # Must compile without errors
npm run test       # Must pass all tests
```

Manual verification:
- [ ] `list_bases` returns visible data
- [ ] `query` returns visible data
- [ ] `describe` provides helpful error for missing scopes
- [ ] `list_governance` works (no undefined error)
- [ ] `list_exceptions` works (no undefined error)

---

## Architecture Notes

```
src/typescript/
├── airtable-mcp-server.ts    # Entry point, server setup
├── errors.ts                 # Error taxonomy (AuthError, etc.)
├── app/
│   ├── airtable-client.ts    # HTTP client for Airtable API
│   ├── config.ts             # Environment config loading
│   ├── context.ts            # App context type
│   ├── governance.ts         # Governance/allow-list service
│   ├── logger.ts             # Logging (writes to stderr)
│   └── tools/
│       ├── index.ts          # Tool registration
│       ├── handleError.ts    # Error response builder
│       ├── listBases.ts      # list_bases tool
│       ├── describe.ts       # describe tool (Meta API)
│       ├── query.ts          # query tool
│       ├── create.ts         # create tool
│       ├── update.ts         # update tool
│       ├── upsert.ts         # upsert tool
│       ├── listGovernance.ts # list_governance tool
│       ├── listExceptions.ts # list_exceptions tool
│       └── webhooks.ts       # webhook tools
```

---

## Do NOT Modify

- `handleError.ts` — already returns proper `content` array for errors
- `logger.ts` — already writes to stderr (Bug 2 is fixed in source)
- `airtable-mcp-server.ts` — import style is correct (Bug 1 is fixed in source)

---

## Key Files to Read First

1. `docs/FIX_PLAN.md` — Full implementation plan with details
2. `src/typescript/app/tools/query.ts` — Example of current pattern
3. `src/typescript/app/tools/handleError.ts` — Correct error response pattern
4. `src/typescript/errors.ts` — Error class hierarchy

---

## Commit Guidelines

When complete, create a commit with:
```
fix: populate content arrays in tool responses

- Add createToolResponse utility for consistent responses
- Update all tool handlers to return displayable content
- Improve AuthError messages for Meta API scope hints

Fixes: empty responses, describe auth errors
```

Bump version in `package.json` to `3.2.6`.

---

## Questions to Answer During Your Audit

1. How many return statements need modification in each tool file?
2. Are there any tools with multiple return paths (success cases, dry-run, empty results)?
3. Should `createToolResponse` handle error cases, or should those remain in `handleError.ts`?
4. What's the exact format expected by MCP clients for the `content` array?

Do your own investigation. The FIX_PLAN.md is a guide, not a prescription — validate its assumptions against the actual codebase.

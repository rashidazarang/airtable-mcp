# Fix Plan: @rashidazarang/airtable-mcp v3.2.5

---

# Part 1: Repository Cleanup

## Current Root Directory (25 files — too noisy)

```
.eslintrc.js          .gitignore            .nvmrc
.prettierrc           CHANGELOG.md          CODE_OF_CONDUCT.md
CONTRIBUTING.md       index.js              ISSUE_RESPONSES.md
jest.config.js        LICENSE               package-lock.json
package.json          PROJECT_STRUCTURE.md  README.md
RELEASE_SUMMARY_v3.2.x.md                   RELEASE_v3.2.1.md
RELEASE_v3.2.3.md     RELEASE_v3.2.4.md     requirements.txt
SECURITY_NOTICE.md    smithery.yaml         TESTING_REPORT.md
tsconfig.json
```

## Target Root Directory (12 files — clean)

```
.eslintrc.js          .gitignore            .nvmrc
.prettierrc           jest.config.js        LICENSE
package-lock.json     package.json          README.md
smithery.yaml         tsconfig.json
```

## Reorganization Actions

### 1. Move Community Files → `.github/`

These files follow GitHub's community standards location:

| File | Action |
|------|--------|
| `CODE_OF_CONDUCT.md` | `git mv` → `.github/CODE_OF_CONDUCT.md` |
| `CONTRIBUTING.md` | `git mv` → `.github/CONTRIBUTING.md` |
| `SECURITY_NOTICE.md` | `git mv` → `.github/SECURITY.md` (rename) |

### 2. Move Documentation → `docs/`

| File | Action |
|------|--------|
| `CHANGELOG.md` | `git mv` → `docs/CHANGELOG.md` |
| `RELEASE_SUMMARY_v3.2.x.md` | `git mv` → `docs/releases/v3.2.x-SUMMARY.md` |
| `RELEASE_v3.2.1.md` | `git mv` → `docs/releases/v3.2.1.md` |
| `RELEASE_v3.2.3.md` | `git mv` → `docs/releases/v3.2.3.md` |
| `RELEASE_v3.2.4.md` | `git mv` → `docs/releases/v3.2.4.md` |

### 3. Delete Obsolete Files

| File | Reason |
|------|--------|
| `PROJECT_STRUCTURE.md` | Outdated; this info belongs in README |
| `TESTING_REPORT.md` | One-time report, not maintained |
| `ISSUE_RESPONSES.md` | Internal notes with npm publish commands — shouldn't be public |
| `index.js` | Legacy Python launcher; TypeScript is now primary |
| `requirements.txt` | Python deps for deprecated Python impl |

### 4. Delete Legacy Python Implementation

The Python code in `src/python/` is deprecated. Consider removing:
- `src/python/` directory
- `requirements.txt`
- `index.js` (Python launcher)

**Note:** If you want to keep Python support, move it to a separate branch.

## Git Commands (Preserves History)

```bash
# 1. Move community files
git mv CODE_OF_CONDUCT.md .github/
git mv CONTRIBUTING.md .github/
git mv SECURITY_NOTICE.md .github/SECURITY.md

# 2. Move documentation
git mv CHANGELOG.md docs/
git mv RELEASE_SUMMARY_v3.2.x.md docs/releases/v3.2.x-SUMMARY.md
git mv RELEASE_v3.2.1.md docs/releases/v3.2.1.md
git mv RELEASE_v3.2.3.md docs/releases/v3.2.3.md
git mv RELEASE_v3.2.4.md docs/releases/v3.2.4.md

# 3. Delete obsolete files
git rm PROJECT_STRUCTURE.md
git rm TESTING_REPORT.md
git rm ISSUE_RESPONSES.md
git rm index.js
git rm requirements.txt

# 4. (Optional) Remove legacy Python
git rm -r src/python/

# 5. Commit
git commit -m "chore: clean up repository structure

- Move community files to .github/
- Move release notes to docs/releases/
- Remove obsolete documentation
- Remove deprecated Python implementation

BREAKING: Python implementation removed (use TypeScript)
"
```

## Updated Directory Structure

```
airtable-mcp/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── CODE_OF_CONDUCT.md      ← moved
│   ├── CONTRIBUTING.md         ← moved
│   ├── SECURITY.md             ← moved & renamed
│   └── pull_request_template.md
├── bin/
├── dist/                       ← compiled output (gitignored)
├── docker/
├── docs/
│   ├── CHANGELOG.md            ← moved
│   ├── guides/
│   └── releases/
│       ├── v3.2.x-SUMMARY.md   ← moved
│       ├── v3.2.1.md           ← moved
│       ├── v3.2.3.md           ← moved
│       ├── v3.2.4.md           ← moved
│       └── ... (existing)
├── examples/
├── src/
│   ├── typescript/             ← primary implementation
│   └── javascript/             ← simple JS fallback
├── tests/
├── types/
├── .eslintrc.js
├── .gitignore
├── .nvmrc
├── .prettierrc
├── jest.config.js
├── LICENSE
├── package.json
├── package-lock.json
├── README.md
├── smithery.yaml
└── tsconfig.json
```

---

# Part 2: Bug Fixes

## Executive Summary

After auditing the codebase, I've identified that **3 of the 5 reported bugs are already fixed in the TypeScript source**, but the published npm package contains stale/incorrectly compiled JavaScript. The remaining 2 bugs require source code changes.

---

## Bug Analysis & Root Causes

### Bug 1: ESM Import Path Error — ALREADY FIXED IN SOURCE

**Location:** `src/typescript/airtable-mcp-server.ts:5-7`

**Current Source (Correct):**
```typescript
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio');
```

**Analysis:** The source uses `require()` with CommonJS-style imports, which should compile correctly. The tsconfig.json specifies `"module": "CommonJS"`, so this is the intended behavior.

**Root Cause of Published Bug:** The published `dist/` was likely compiled with different settings or manually modified. The workaround of adding `/dist/esm/` is incorrect — the SDK's package.json exports handle subpath resolution.

**Fix:** Rebuild with clean `npm run build` and verify the output uses proper CommonJS require syntax.

---

### Bug 2: Logger Writing to stdout — ALREADY FIXED IN SOURCE

**Location:** `src/typescript/app/logger.ts:56`

**Current Source (Correct):**
```typescript
process.stderr.write(`${JSON.stringify(output)}\n`);
```

**Analysis:** The source already writes to `stderr`. The published package must contain an older version that wrote to `stdout`.

**Fix:** Rebuild with clean `npm run build`.

---

### Bug 3: Empty Content Arrays — SOURCE FIX REQUIRED

**Locations:** All 8 tool files in `src/typescript/app/tools/`

**Current Pattern (Problematic):**
```typescript
return {
  structuredContent,
  content: [] as const
};
```

**Root Cause:** The MCP protocol requires the `content` array to contain actual data for clients that don't support `structuredContent`. While `structuredContent` is the newer typed output format, backwards compatibility requires populating `content` as well.

**Fix Required:** Update all tool return statements to include both:
```typescript
return {
  structuredContent,
  content: [{ type: 'text', text: JSON.stringify(structuredContent, null, 2) }]
};
```

**Files to Modify:**
| File | Lines to Fix |
|------|--------------|
| `listBases.ts` | 38-41, 56-58 |
| `listGovernance.ts` | 14-17 |
| `listExceptions.ts` | 19-22 |
| `webhooks.ts` | 14, 30, 45 |
| `describe.ts` | 173-176 |
| `query.ts` | 146-148 |
| `create.ts` | 40, 60 |
| `update.ts` | 41, 62 |
| `upsert.ts` | 46, 71 |

---

### Bug 4: describe Tool Authentication Error — SOURCE FIX REQUIRED

**Location:** `src/typescript/app/airtable-client.ts:105-118`

**Analysis:** The Meta API calls (`getBase`, `listTables`) use the correct endpoints:
- `GET /v0/meta/bases/${baseId}`
- `GET /v0/meta/bases/${baseId}/tables`

The authentication header is correctly set as `Authorization: Bearer ${this.pat}`.

**Possible Root Causes:**
1. **Token Scope:** Airtable Personal Access Tokens require explicit `schema.bases:read` scope for Meta API
2. **Rate Limiting:** Meta API has stricter limits, but errors would show as 429, not 401/403
3. **Base Access:** Token may not have access to the specific base

**Fix Required:** Improve error messaging to include scope hints:

```typescript
// In airtable-client.ts toDomainError()
if (status === 401 || status === 403) {
  return new AuthError(
    'Authentication failed with Airtable. For Meta API calls, ensure your token has "schema.bases:read" scope.',
    { status, context: baseContext }
  );
}
```

Also add validation in `describe.ts` to catch this early and provide actionable error messages.

---

### Bug 5: structuredContent is not defined — FALSE POSITIVE IN SOURCE

**Location:** `src/typescript/app/tools/governance.ts`, `webhooks.ts`

**Analysis:** Looking at the actual source code:

`listGovernance.ts:13-17`:
```typescript
const snapshot = ctx.governance.getSnapshot();
return {
  structuredContent: snapshot,  // ← Correctly defined
  content: [] as const
};
```

`webhooks.ts:14`:
```typescript
return { structuredContent: { webhooks: body }, content: [] as const };  // ← Correctly defined
```

**Root Cause:** The bug reporter's sed command from Bug 3's fix:
```bash
sed 's/content: \[\]/content: [{ type: "text", text: JSON.stringify(structuredContent) }]/g'
```

This regex replacement was applied to ALL files including the error handler (`handleError.ts`), which doesn't define `structuredContent`. The error handler correctly returns:
```typescript
return {
  isError: true,
  content: [{ type: 'text', text: toUserMessage(error) }]
};
```

**Fix:** No source change needed. The sed command was overly broad. Bug 3's fix must be applied selectively.

---

## Implementation Plan

### Phase 1: Create Utility Function for Consistent Responses

Create a new file `src/typescript/app/tools/response.ts`:

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

Replace all return statements in tool handlers to use `createToolResponse()`:

**Example transformation for `listBases.ts`:**
```typescript
// Before
return {
  structuredContent,
  content: [] as const
};

// After
return createToolResponse(structuredContent);
```

### Phase 3: Improve Error Messages for Auth Issues

Update `src/typescript/errors.ts` to include scope hints:

```typescript
export class AuthError extends AirtableBrainError {
  constructor(message: string, options: AirtableErrorOptions = {}) {
    const hint = options.context?.endpoint?.includes('/meta/')
      ? ' Ensure your token has "schema.bases:read" scope for Meta API access.'
      : '';
    super('AuthError', message + hint, options);
  }
}
```

### Phase 4: Rebuild and Test

```bash
npm run clean
npm run build
npm run test
```

### Phase 5: Update Package Version

Bump version in `package.json` to `3.2.6`.

---

## File Change Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `src/typescript/app/tools/response.ts` | **CREATE** | New utility for consistent responses |
| `src/typescript/app/tools/listBases.ts` | MODIFY | Use `createToolResponse()` |
| `src/typescript/app/tools/listGovernance.ts` | MODIFY | Use `createToolResponse()` |
| `src/typescript/app/tools/listExceptions.ts` | MODIFY | Use `createToolResponse()` |
| `src/typescript/app/tools/webhooks.ts` | MODIFY | Use `createToolResponse()` |
| `src/typescript/app/tools/describe.ts` | MODIFY | Use `createToolResponse()` |
| `src/typescript/app/tools/query.ts` | MODIFY | Use `createToolResponse()` |
| `src/typescript/app/tools/create.ts` | MODIFY | Use `createToolResponse()` |
| `src/typescript/app/tools/update.ts` | MODIFY | Use `createToolResponse()` |
| `src/typescript/app/tools/upsert.ts` | MODIFY | Use `createToolResponse()` |
| `src/typescript/errors.ts` | MODIFY | Add scope hints for AuthError |
| `package.json` | MODIFY | Bump version to 3.2.6 |

---

## Verification Checklist

After implementation:

- [ ] `npm run build` completes without errors
- [ ] `npm run test` passes all tests
- [ ] `list_bases` returns data in `content` array
- [ ] `query` returns data in `content` array
- [ ] `describe` works with valid Meta API scoped token
- [ ] `describe` shows helpful error for missing scopes
- [ ] `list_governance` returns data (no undefined error)
- [ ] `list_exceptions` returns data (no undefined error)
- [ ] MCP server starts without stdout corruption
- [ ] All tools work via Claude Desktop integration

---

## Quick Fixes for Immediate Relief

If you need the package working NOW before the proper fix is published:

### Fix 1: Rebuild from Source
```bash
cd /path/to/airtable-mcp
npm run clean && npm run build
```

### Fix 2: Manual Patch for Bug 3 (Selective)
Only patch the success path files, NOT handleError.ts:
```bash
for file in listBases.js listGovernance.js listExceptions.js webhooks.js describe.js query.js create.js update.js upsert.js; do
  sed -i '' 's/content: \[\]/content: [{ type: "text", text: JSON.stringify(structuredContent, null, 2) }]/g' \
    dist/typescript/app/tools/$file
done
```

### Fix 3: Verify Token Scopes
For the `describe` tool, ensure your Airtable PAT has these scopes:
- `data.records:read` (for query/list)
- `schema.bases:read` (for describe/Meta API)
- `data.records:write` (for create/update/upsert)

# PRD: Airtable MCP Error Handling & Developer Experience Improvements

**Version:** 1.0
**Date:** 2025-12-26
**Author:** rashidazarang
**Status:** Draft

---

## 1. Executive Summary

Following a comparative audit of `domdomegg/airtable-mcp-server` (referenced in issue #18 as a working alternative), this PRD outlines improvements to enhance error handling, developer experience, and debugging capabilities in `rashidazarang/airtable-mcp`.

The primary goal is to eliminate misleading error messages and provide actionable troubleshooting guidance when API calls fail.

---

## 2. Problem Statement

### Current Issues

1. **Misleading Auth Errors** (Issue #18 - Fixed)
   - The `describe` tool showed generic "ensure your token has schema.bases:read scope" even when the real issue was base-level access

2. **No Airtable Error Type Parsing**
   - Airtable returns specific error types (`AUTHENTICATION_REQUIRED`, `INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND`, etc.) that we don't parse or surface

3. **No API Key Format Validation**
   - Users with malformed tokens get cryptic errors instead of helpful format validation

4. **No Detail Level Control**
   - Every `describe` call returns full schema, wasting LLM context window

5. **No Formula Injection Protection**
   - Search/filter operations vulnerable to formula injection attacks

---

## 3. Goals & Success Metrics

### Goals
- Reduce support burden by providing self-service debugging guidance
- Eliminate misleading error messages
- Improve security posture
- Optimize LLM context window usage

### Success Metrics
- Zero issues filed about misleading auth errors
- 100% of API errors include actionable troubleshooting steps
- Schema retrieval supports configurable detail levels

---

## 4. Requirements

### 4.1 Parse Airtable Error Types (P0 - Critical)

**Current State:**
`airtable-client.ts` creates generic `AuthError` for all 401/403 responses.

**Target State:**
Parse Airtable's `error.type` field and map to specific error messages.

**Airtable Error Types to Handle:**

| Error Type | HTTP Status | Meaning | User Message |
|------------|-------------|---------|--------------|
| `AUTHENTICATION_REQUIRED` | 401 | Invalid/expired token | "Token is invalid or expired. Create a new token at https://airtable.com/create/tokens" |
| `INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND` | 403 | Valid token, no access to resource | "Token is valid but cannot access this base. Verify: (1) token has required scopes, (2) token has access to this specific base" |
| `NOT_FOUND` | 404 | Resource doesn't exist | "Base or table not found. Verify the ID is correct" |
| `INVALID_REQUEST_UNKNOWN` | 422 | Malformed request | "Request was malformed. Check field names and values" |
| `RATE_LIMIT_REACHED` | 429 | Rate limited | "Rate limit exceeded. Retry after {retryAfter} seconds" |

**Implementation Location:**
- `src/typescript/app/airtable-client.ts` - `toDomainError()` method
- `src/typescript/app/tools/handleError.ts` - `toUserMessage()` function

**Acceptance Criteria:**
- [ ] All Airtable error types listed above are parsed from response body
- [ ] Each error type maps to a specific, actionable user message
- [ ] Error context includes `upstreamErrorType` for logging

---

### 4.2 API Key Format Validation (P0 - Critical)

**Current State:**
No validation of token format before making API calls.

**Target State:**
Validate token format on startup and include format warnings in error messages.

**Validation Rules:**

| Check | Expected | Warning Message |
|-------|----------|-----------------|
| Dot count | Exactly 1 | "Expected one dot (.) in API key, found {n}. Ensure you copied the entire token." |
| Length | 70-100 chars | "API key seems too {short/long} ({n} chars). PATs are typically ~82 characters." |
| Prefix | Not `key` | "This appears to be an old-style API key. Create a Personal Access Token at https://airtable.com/create/tokens" |
| Whitespace | None | "API key contains whitespace. Remove any leading/trailing spaces." |

**Implementation Location:**
- New file: `src/typescript/app/validateApiKey.ts`
- Called from: `src/typescript/app/config.ts` during initialization
- Used in: `handleError.ts` to append warnings to auth errors

**Acceptance Criteria:**
- [ ] Token format validated on server startup
- [ ] Invalid format logs warning but doesn't block startup (token might still work)
- [ ] Auth error messages include relevant format warnings
- [ ] Unit tests cover all validation rules

---

### 4.3 Detail Level for Schema Operations (P1 - High)

**Current State:**
`describe` tool always returns full schema including all field options.

**Target State:**
Support configurable detail levels to optimize LLM context usage.

**Detail Levels:**

| Level | Returns | Use Case |
|-------|---------|----------|
| `tableIdentifiersOnly` | `{id, name}` for tables only | Listing/referencing tables |
| `identifiersOnly` | `{id, name}` for tables, fields, views | Working with field/view references |
| `full` | Complete schema with field types, options, descriptions | Full schema inspection |

**Schema Changes:**

```typescript
// Update describeInputSchema
{
  baseId: z.string(),
  scope: z.enum(['base', 'table']).optional(),
  table: z.string().optional(),
  detailLevel: z.enum(['tableIdentifiersOnly', 'identifiersOnly', 'full']).default('full'),
  includeFields: z.boolean().optional(), // deprecated, use detailLevel
  includeViews: z.boolean().optional(),  // deprecated, use detailLevel
}
```

**Implementation Location:**
- `src/typescript/app/tools/describe.ts`
- `src/typescript/app/types.ts` - schema definitions

**Acceptance Criteria:**
- [ ] `detailLevel` parameter added to `describe` tool
- [ ] Each level returns only the specified data
- [ ] Backward compatible with existing `includeFields`/`includeViews` params
- [ ] Documentation updated with context optimization guidance

---

### 4.4 Formula Injection Protection (P1 - High)

**Current State:**
User-provided filter formulas passed directly to Airtable API.

**Target State:**
Sanitize user input in formula strings to prevent injection.

**Attack Vector:**
```
filterByFormula: 'Name = ""; RECORD_ID() = RECORD_ID()'
```

**Mitigation:**
```typescript
function escapeFormulaString(input: string): string {
  return input.replace(/["\\]/g, '\\$&');
}
```

**Implementation Location:**
- New file: `src/typescript/app/sanitize.ts`
- Used in: `src/typescript/app/airtable-client.ts` - `queryRecords()` method
- Used in: Any tool that accepts `filterByFormula` parameter

**Acceptance Criteria:**
- [ ] All user-provided strings in formulas are escaped
- [ ] Escape function handles quotes and backslashes
- [ ] Unit tests verify injection attempts are neutralized
- [ ] Security documentation added

---

### 4.5 Enhanced Error Context (P2 - Medium)

**Current State:**
Errors include `endpoint` and `baseId` in context.

**Target State:**
Errors include comprehensive context for debugging.

**Enhanced Context Fields:**

```typescript
interface ErrorContext {
  endpoint: string;
  baseId?: string;
  tableId?: string;
  recordId?: string;
  upstreamErrorType?: string;
  upstreamErrorMessage?: string;
  requestId?: string;  // From Airtable response headers
  tokenFormat?: {
    hasValidLength: boolean;
    hasValidDotCount: boolean;
    isLegacyFormat: boolean;
  };
}
```

**Implementation Location:**
- `src/typescript/errors.ts` - `ErrorContext` interface
- `src/typescript/app/airtable-client.ts` - populate context in `toDomainError()`

**Acceptance Criteria:**
- [ ] All available context populated in errors
- [ ] Request ID extracted from `X-Airtable-Request-Id` header
- [ ] Token format analysis included in auth errors
- [ ] Context logged for debugging but sanitized for user display

---

### 4.6 Improved Error Messages (P2 - Medium)

**Current State:**
Generic messages like "Authentication failed. Verify the Airtable token scopes and base access."

**Target State:**
Specific, actionable messages with troubleshooting steps.

**Message Templates:**

```typescript
const ERROR_MESSAGES = {
  AUTH_INVALID_TOKEN: `
Authentication failed: Token is invalid or expired.
Troubleshooting:
1. Verify token at https://airtable.com/create/tokens
2. Check token hasn't been revoked
3. Ensure you copied the entire token (typically ~82 characters)
{tokenFormatWarnings}
`.trim(),

  AUTH_NO_BASE_ACCESS: `
Authentication failed for base "{baseId}".
Your token is valid but cannot access this base.
Troubleshooting:
1. Run list_bases to see accessible bases
2. If base is missing, regenerate token with access to this base
3. Verify token has "schema.bases:read" scope
`.trim(),

  // ... more templates
};
```

**Implementation Location:**
- `src/typescript/app/tools/handleError.ts`

**Acceptance Criteria:**
- [ ] Each error type has a specific message template
- [ ] Messages include numbered troubleshooting steps
- [ ] Dynamic values (baseId, etc.) interpolated into messages
- [ ] Token format warnings appended when relevant

---

## 5. Technical Design

### 5.1 File Changes

| File | Changes |
|------|---------|
| `src/typescript/app/airtable-client.ts` | Parse error.type from response body for all error statuses |
| `src/typescript/app/tools/handleError.ts` | New message templates, token format warning integration |
| `src/typescript/app/validateApiKey.ts` | New file for token format validation |
| `src/typescript/app/sanitize.ts` | New file for formula sanitization |
| `src/typescript/app/config.ts` | Call validateApiKey on startup |
| `src/typescript/app/tools/describe.ts` | Add detailLevel parameter |
| `src/typescript/app/types.ts` | Update schemas |
| `src/typescript/errors.ts` | Extend ErrorContext interface |

### 5.2 Dependencies

No new dependencies required. All implementations use existing packages:
- `zod` for schema validation
- Native string methods for sanitization

### 5.3 Backward Compatibility

- `includeFields`/`includeViews` params remain functional (deprecated)
- Existing error codes unchanged
- No breaking changes to tool interfaces

---

## 6. Testing Requirements

### Unit Tests

| Component | Test Cases |
|-----------|------------|
| `validateApiKey` | Valid token, missing dot, short token, long token, legacy key, whitespace |
| `sanitize` | Quotes, backslashes, combined, unicode, empty string |
| `toDomainError` | Each Airtable error type, missing error.type, malformed response |
| `toUserMessage` | Each error code, with/without context, token format warnings |
| `describe` | Each detail level, backward compat with old params |

### Integration Tests

| Scenario | Expected Behavior |
|----------|-------------------|
| Invalid token | Specific message about token validity + format warnings |
| Valid token, no base access | Message suggesting list_bases + scope check |
| Valid token, base access | Successful response |
| Rate limited | Message with retry-after value |

---

## 7. Rollout Plan

### Phase 1: Critical Fixes (Week 1)
- [ ] 4.1 Parse Airtable Error Types
- [ ] 4.2 API Key Format Validation

### Phase 2: Enhancements (Week 2)
- [ ] 4.3 Detail Level for Schema Operations
- [ ] 4.4 Formula Injection Protection

### Phase 3: Polish (Week 3)
- [ ] 4.5 Enhanced Error Context
- [ ] 4.6 Improved Error Messages
- [ ] Documentation updates

---

## 8. Open Questions

1. **Should we block startup on invalid token format?**
   - Recommendation: No, warn but allow (token might still work in edge cases)

2. **Should detail levels apply to list_tables too?**
   - Recommendation: Yes, for consistency

3. **Should we add HTTP transport like domdomegg?**
   - Recommendation: Out of scope for this PRD, evaluate separately

---

## 9. References

- [Issue #18: describe tool fails with misleading auth error](https://github.com/rashidazarang/airtable-mcp/issues/18)
- [domdomegg/airtable-mcp-server](https://github.com/domdomegg/airtable-mcp-server) - Reference implementation
- [Airtable API Error Reference](https://airtable.com/developers/web/api/errors)
- Audit location: `/audit/domdomegg-airtable-mcp-server/`

---

## 10. Appendix

### A. Airtable Error Response Format

```json
{
  "error": {
    "type": "INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND",
    "message": "Could not find base appXXXXX"
  }
}
```

### B. domdomegg Error Enhancement Reference

See `/audit/domdomegg-airtable-mcp-server/src/enhanceAirtableError.ts` for their implementation approach.

# Release v3.2.1 - Critical TypeScript Architecture Fix

## 🚨 Important Update for TypeScript Users

This release fixes a **critical issue** that prevented the TypeScript implementation from compiling correctly. All users using TypeScript should update immediately.

## What's Fixed

### TypeScript Compilation Issue ✅
The TypeScript implementation had a fundamental architecture problem where `.d.ts` files incorrectly contained runtime code (classes and constants) instead of just type definitions. This has been completely resolved.

**Before (Broken):**
- `.d.ts` files contained classes like `AirtableError` and constants like `COMPLETE_TOOL_SCHEMAS`
- TypeScript compilation failed with "cannot be used as a value" errors

**After (Fixed):**
- Runtime code moved to proper `.ts` files:
  - `errors.ts` - Error classes
  - `tools-schemas.ts` - Tool schemas
  - `prompt-templates.ts` - AI prompt templates
- `.d.ts` files now only contain type definitions
- TypeScript compiles successfully

## Installation

### For New Users
```bash
npm install @rashidazarang/airtable-mcp@3.2.1
```

### For Existing Users
```bash
npm update @rashidazarang/airtable-mcp
```

### If Using TypeScript
After updating, rebuild your project:
```bash
npm run build
```

## Verification

Both implementations now work correctly:

```bash
# Test JavaScript implementation
AIRTABLE_TOKEN=your_token AIRTABLE_BASE_ID=your_base node node_modules/@rashidazarang/airtable-mcp/src/javascript/airtable_simple_production.js

# Test TypeScript implementation (after building)
AIRTABLE_TOKEN=your_token AIRTABLE_BASE_ID=your_base node node_modules/@rashidazarang/airtable-mcp/dist/typescript/airtable-mcp-server.js
```

## Project Structure Improvements

The project has been reorganized with a world-class structure:

```
src/
├── index.js           # Main entry point
├── typescript/        # TypeScript implementation
├── javascript/        # JavaScript implementation
└── python/           # Python implementation
```

## Backwards Compatibility

✅ **No breaking changes** - All existing functionality is preserved:
- JavaScript users can continue without any changes
- TypeScript users just need to rebuild after updating
- All API endpoints remain the same
- All tools and prompts continue to work

## Support

If you encounter any issues:
1. Check that you're on version 3.2.1: `npm list @rashidazarang/airtable-mcp`
2. Try cleaning and rebuilding: `npm run clean && npm run build`
3. Report issues at: https://github.com/rashidazarang/airtable-mcp/issues

## Thank You

Thank you to all users for your patience. This critical fix ensures stability for everyone depending on this package. Your production deployments are now safe.

---

**Full Changelog:** [v3.2.0...v3.2.1](https://github.com/rashidazarang/airtable-mcp/compare/v3.2.0...v3.2.1)
# Release Notes - v1.2.4

## 🔒 Security Fix Release

### Critical Security Fix
- **REMOVED hardcoded API tokens from test files** (Addresses Issue #7)
  - `test_client.py` and `test_mcp_comprehensive.js` now require environment variables
  - Added security notice documentation
  - No exposed credentials in the codebase

### 🐛 Bug Fixes

#### Smithery Cloud Deployment Issues (Issues #5 and #6)
- **Fixed HTTP 400 errors** when using Smithery
- **Switched to JavaScript implementation** for Smithery deployment
- Updated `smithery.yaml` to use `airtable_simple.js` instead of problematic Python server
- Created dedicated `Dockerfile.node` for Node.js deployment
- Fixed authentication flow for Smithery connections

### 📚 Documentation Updates
- Added `SECURITY_NOTICE.md` with token rotation instructions
- Created `.env.example` file for secure configuration
- Updated Dockerfile references for Glama listing (Issue #4)

### 🔧 Improvements
- Added environment variable support with dotenv
- Improved logging system with configurable levels (ERROR, WARN, INFO, DEBUG)
- Better error messages for missing credentials

### ⚠️ Breaking Changes
- Test files now require environment variables:
  ```bash
  export AIRTABLE_TOKEN="your_token"
  export AIRTABLE_BASE_ID="your_base_id"
  ```

### 🚀 Migration Guide

1. **Update your environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

2. **For Smithery users:**
   - Reinstall the MCP to get the latest configuration
   - The server now properly accepts credentials through Smithery's config

3. **For direct users:**
   - Continue using command line arguments or switch to environment variables
   - Both methods are supported

### 📝 Notes
- All previously exposed tokens have been revoked
- Please use your own Airtable credentials
- Never commit API tokens to version control

---

**Full Changelog**: [v1.2.3...v1.2.4](https://github.com/rashidazarang/airtable-mcp/compare/v1.2.3...v1.2.4)
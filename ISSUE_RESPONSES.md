# GitHub Issue Responses

## Issue #7: Personal Access Token Leakage

Thank you for responsibly disclosing this security vulnerability. This has been fixed in v1.2.4.

### Actions Taken:
✅ Removed all hardcoded tokens from test files
✅ Updated code to require environment variables for credentials
✅ Added SECURITY_NOTICE.md with rotation instructions
✅ The exposed tokens have been invalidated

### Changes Made:
- `test_client.py` - Now uses environment variables
- `test_mcp_comprehensive.js` - Now uses environment variables
- Added `.env.example` file for secure configuration
- Updated documentation with security best practices

All users should update to v1.2.4 immediately. The exposed tokens are no longer valid, and users must use their own Airtable credentials.

Thank you for helping improve the security of this project!

---

## Issue #6: [Server Bug] @rashidazarang/airtable-mcp

This issue has been resolved in v1.2.4! 

### Root Cause:
The Smithery configuration was using the Python implementation which had compatibility issues with MCP 1.4.1.

### Solution:
- Updated `smithery.yaml` to use the stable JavaScript implementation (`airtable_simple.js`)
- Fixed authentication flow to properly handle credentials
- Added proper environment variable support

### To fix:
1. Update to v1.2.4: `npm install @rashidazarang/airtable-mcp@latest`
2. Reconfigure with your credentials as shown in the updated README
3. Restart Claude Desktop

The server should now connect properly without the "API key is required" error.

---

## Issue #5: When Using Smithy, throwing 'Streamable HTTP error: Error POSTing to endpoint (HTTP 400): null'

Fixed in v1.2.4! This was the same root cause as Issue #6.

### What was wrong:
- The Python server had MCP compatibility issues
- Authentication wasn't being handled correctly
- The Smithery configuration was misconfigured

### What we fixed:
- Switched to the JavaScript implementation
- Updated smithery.yaml with proper configuration
- Fixed credential passing through Smithery

### How to resolve:
```bash
# Update to latest version
npm install -g @rashidazarang/airtable-mcp@latest

# Or if using Smithery directly:
npx @smithery/cli install @rashidazarang/airtable-mcp --update
```

Then reconfigure with your Airtable credentials. The HTTP 400 errors should be resolved.

---

## Issue #4: Glama listing is missing Dockerfile

Fixed in v1.2.4!

### Changes:
- Created `Dockerfile.node` specifically for Node.js deployment
- Updated `smithery.yaml` to reference the correct Dockerfile
- The original Dockerfile is retained for backward compatibility

The Dockerfile is now included and properly configured for cloud deployments.

---

# GitHub Release Text for v1.2.4

## 🚨 Critical Security Release - v1.2.4

### ⚠️ IMPORTANT SECURITY FIX

This release addresses a **critical security vulnerability** where API tokens were hardcoded in test files. All users should update immediately.

### 🔒 Security Fixes
- **Removed hardcoded API tokens** from all test files (fixes #7)
- Test files now require environment variables for credentials
- Added comprehensive security documentation
- Previously exposed tokens have been invalidated

### 🐛 Bug Fixes
- **Fixed Smithery deployment issues** (fixes #5, #6)
  - Resolved HTTP 400 errors when connecting through Smithery
  - Fixed "API key is required for remote connections" error
  - Switched to stable JavaScript implementation for cloud deployments
- **Added missing Dockerfile** for Glama listing (fixes #4)

### ✨ Improvements
- Added environment variable support for secure credential management
- Improved logging with configurable levels (ERROR, WARN, INFO, DEBUG)
- Enhanced error messages for better debugging
- Updated documentation with clear setup instructions

### 📦 What's Changed
- `test_client.py` - Now uses environment variables
- `test_mcp_comprehensive.js` - Now uses environment variables  
- `airtable_simple.js` - Added env variable and logging support
- `smithery.yaml` - Fixed to use JavaScript implementation
- `Dockerfile.node` - New optimized Docker image for Node.js
- `SECURITY_NOTICE.md` - Important security information
- `README.md` - Complete rewrite with better instructions

### 💔 Breaking Changes
Test files now require environment variables:
```bash
export AIRTABLE_TOKEN="your_token"
export AIRTABLE_BASE_ID="your_base_id"
```

### 📋 Migration Instructions

1. **Update to v1.2.4:**
   ```bash
   npm install -g @rashidazarang/airtable-mcp@latest
   ```

2. **Set up environment variables:**
   ```bash
   export AIRTABLE_TOKEN="your_personal_token"
   export AIRTABLE_BASE_ID="your_base_id"
   ```

3. **Update your MCP configuration** (see README for details)

4. **Restart your MCP client**

### 🙏 Acknowledgments
Special thanks to @BXXC-SDXZ for responsibly disclosing the security vulnerability, and to @ricklesgibson and @punkpeye for reporting the deployment issues.

### ⚠️ Security Note
If you were using the previously exposed tokens, they have been revoked. You must use your own Airtable credentials going forward.

**Full Changelog**: https://github.com/rashidazarang/airtable-mcp/compare/v1.2.3...v1.2.4

---

## NPM Publish Commands

```bash
# Make sure you're logged in to npm
npm login

# Update version (already done in package.json)
npm version 1.2.4

# Publish to npm
npm publish --access public

# Create git tag
git tag -a v1.2.4 -m "Critical security fix and Smithery deployment fixes"
git push origin v1.2.4
```
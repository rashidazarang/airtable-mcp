# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.2.2] - 2025-09-09

### Security Fix
- **Critical**: Fixed command injection vulnerability in `test_client.py`
  - Added input validation for API endpoints
  - Removed unused subprocess import
  - Sanitized endpoint parameters to prevent injection attacks

### Changed
- Updated README with latest version information
- Added project structure documentation

## [3.2.1] - 2025-09-09

### Critical Fix - TypeScript Architecture
**IMPORTANT**: This release fixes a critical TypeScript compilation issue that prevented the TypeScript implementation from building correctly.

### Fixed
- **TypeScript Architecture**: Resolved fundamental issue where `.d.ts` files contained runtime code
  - Moved error classes to `errors.ts`
  - Moved tool schemas to `tools-schemas.ts`  
  - Moved AI prompt templates to `prompt-templates.ts`
  - Type definition files now only contain type definitions as per TypeScript best practices
- **Build System**: TypeScript now compiles successfully without errors
- **Import Structure**: Fixed import statements to properly distinguish between type imports and runtime imports

### Changed
- Updated Smithery configuration version to match package.json (3.2.0)

### Verified
- JavaScript implementation: ✅ Working
- TypeScript implementation: ✅ Working (after fixes)
- NPM package installation: ✅ Working
- All entry points: ✅ Working

### Backwards Compatibility
- No breaking changes for existing users
- All existing functionality preserved
- Both JavaScript and TypeScript implementations fully operational

## [3.2.0] - 2025-09-09

### Added
- World-class project structure with proper separation of concerns
- Comprehensive build system with TypeScript support
- Jest testing framework configuration
- ESLint and Prettier for code quality
- Proper CI/CD pipeline structure
- Consolidated documentation in organized directories

### Changed
- Reorganized source code by language (TypeScript, JavaScript, Python)
- Updated package.json with proper scripts and dependencies
- Moved documentation to dedicated docs/ directory
- Improved build and development workflows

### Fixed
- Removed broken symbolic link
- Fixed inconsistent version numbering
- Resolved missing dist/ directory issues

## [3.1.0] - Previous Release
- TypeScript support with comprehensive type definitions
- Enterprise-grade features and automation
- AI-powered analytics and predictive modeling

## [1.6.0] - Previous Release
- Enhanced Python implementation
- Improved error handling
- Better Claude Desktop integration

## [1.5.0] - Previous Release
- Multi-language support (JavaScript, TypeScript, Python)
- Advanced Airtable operations
- Comprehensive testing suite

## [1.4.0] - Previous Release
- Initial TypeScript implementation
- Basic CRUD operations
- MCP protocol support

[Full release history available in docs/releases/]
# Release Notes - v1.2.2

## Major Improvements

### Documentation & Setup
- Completely revamped documentation with focus on Claude Desktop integration
- Added clear step-by-step installation guide
- Simplified configuration process with working JSON examples
- Added detailed troubleshooting section

### Configuration
- Removed complex JSON configuration in favor of simpler format
- Fixed JSON parsing issues with Claude Desktop
- Updated configuration file path for Claude Desktop
- Removed unnecessary escape characters in configuration

### Integration
- Improved Claude Desktop compatibility
- Added 30-second connection establishment guidance
- Added verification steps with example commands
- Enhanced error handling and logging guidance

## Technical Updates
- Updated dependencies to latest versions
- Added @smithery/cli as direct dependency
- Updated Airtable SDK to v0.12.2
- Improved Node.js version compatibility

## Bug Fixes
- Fixed JSON parsing errors in Claude Desktop
- Resolved connection timeout issues
- Fixed configuration file path issues
- Improved error messaging

## Breaking Changes
- Configuration format has changed to use direct parameters instead of JSON config string
- Removed support for complex JSON configurations
- Changed default configuration file location for Claude Desktop

## Migration Guide
If upgrading from v1.2.1 or earlier:
1. Update your configuration file to use the new format
2. Remove any escape characters from your token
3. Restart Claude Desktop after changes
4. Wait 30 seconds for connection to establish

## Contributors
- @rashidazarang 
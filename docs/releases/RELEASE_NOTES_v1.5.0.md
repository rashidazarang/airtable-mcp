# 🚀 Airtable MCP Server v1.5.0 Release Notes

**Release Date**: August 15, 2025  
**Major Update**: Enhanced Schema Management & Advanced Features

## 🎯 Overview

Version 1.5.0 represents a **major expansion** of the Airtable MCP Server, adding comprehensive schema management capabilities inspired by the best features from domdomegg's airtable-mcp-server while maintaining our unique webhook support. This release **doubles** the number of available tools from 12 to **23 tools**.

## ✨ New Features

### 📊 Schema Discovery Tools (6 New Tools)

1. **`list_bases`** - Discover all accessible Airtable bases
   - Lists all bases with permissions
   - Supports pagination with offset parameter
   - Shows base names, IDs, and permission levels

2. **`get_base_schema`** - Complete base schema information
   - Detailed table structures and relationships
   - Field definitions with types and options
   - View configurations and metadata

3. **`describe_table`** - Enhanced table inspection
   - Comprehensive field information including IDs, types, descriptions
   - View details and configurations
   - Much more detailed than the basic `list_tables`

4. **`list_field_types`** - Field type reference
   - Complete documentation of all Airtable field types
   - Includes basic fields (text, number, date) and advanced fields (formulas, lookups)
   - Helpful for understanding what field types are available for creation

5. **`get_table_views`** - View management
   - Lists all views for a specific table
   - Shows view types, IDs, and configurations
   - Includes visible field information

### 🏗️ Table Management Tools (3 New Tools)

6. **`create_table`** - Programmatic table creation
   - Create new tables with custom field definitions
   - Support for all field types with proper validation
   - Optional table descriptions

7. **`update_table`** - Table metadata modification
   - Update table names and descriptions
   - Non-destructive metadata changes

8. **`delete_table`** - Table removal (with safety checks)
   - Requires explicit confirmation with `confirm=true`
   - Permanently removes table and all data
   - Safety warnings to prevent accidental deletions

### 🔧 Field Management Tools (4 New Tools)

9. **`create_field`** - Add fields to existing tables
   - Support for all Airtable field types
   - Custom field options and descriptions
   - Validates field types and configurations

10. **`update_field`** - Modify existing field properties
    - Update field names, descriptions, and options
    - Change field configurations safely

11. **`delete_field`** - Remove fields (with safety checks)
    - Requires explicit confirmation with `confirm=true`
    - Permanently removes field and all data
    - Safety warnings to prevent accidental deletions

## 🔄 Enhanced Existing Features

- **Improved error handling** for all metadata operations
- **Better table/field lookup** supporting both names and IDs
- **Enhanced validation** for destructive operations
- **Consistent response formatting** across all tools

## 📊 Tool Count Summary

| Category | v1.4.0 | v1.5.0 | New in v1.5.0 |
|----------|--------|--------|----------------|
| **Data Operations** | 7 | 7 | - |
| **Webhook Management** | 5 | 5 | - |
| **Schema Management** | 0 | 11 | ✅ 11 new tools |
| **Total Tools** | **12** | **23** | **+11 tools** |

## 🛠️ Technical Improvements

### API Enhancements
- **Metadata API Support**: Full integration with Airtable's metadata API endpoints
- **Enhanced callAirtableAPI Function**: Already supported metadata endpoints
- **Improved Error Handling**: Better error messages for schema operations

### Security & Safety
- **Confirmation Required**: Destructive operations require explicit confirmation
- **Validation Checks**: Proper field type and option validation
- **Safety Warnings**: Clear warnings for irreversible operations

### Authentication
- **Extended Scope Support**: Now leverages `schema.bases:read` and `schema.bases:write` scopes
- **Backward Compatibility**: All existing functionality remains unchanged

## 📚 New Capabilities

### For Users
- **Complete Base Discovery**: Find and explore all accessible bases
- **Advanced Schema Inspection**: Understand table and field structures in detail
- **Programmatic Table Creation**: Build tables through natural language
- **Dynamic Field Management**: Add, modify, and remove fields as needed
- **Comprehensive Field Reference**: Quick access to all available field types

### For Developers
- **Full CRUD for Schema**: Complete Create, Read, Update, Delete operations for tables and fields
- **Metadata-First Approach**: Rich schema information before data operations
- **Enhanced Automation**: Build complex Airtable structures programmatically

## 🚀 Getting Started with v1.5.0

### Installation
```bash
npm install -g @rashidazarang/airtable-mcp@1.5.0
```

### Required Token Scopes
For full v1.5.0 functionality, ensure your Airtable Personal Access Token includes:
- `data.records:read` - Read records
- `data.records:write` - Create, update, delete records  
- `schema.bases:read` - View table schemas (**New requirement**)
- `schema.bases:write` - Create, modify tables and fields (**New requirement**)
- `webhook:manage` - Webhook operations (optional)

### Example Usage

```javascript
// Discover available bases
"List all my accessible Airtable bases"

// Explore a base structure  
"Show me the complete schema for this base"

// Create a new table
"Create a new table called 'Projects' with fields: Name (text), Status (single select with options: Active, Completed, On Hold), and Due Date (date)"

// Add a field to existing table
"Add a 'Priority' field to the Projects table as a single select with options: Low, Medium, High"

// Get detailed table information
"Describe the Projects table with all field details"
```

## 🔧 Breaking Changes

**None** - v1.5.0 is fully backward compatible with v1.4.0. All existing tools and functionality remain unchanged.

## 🐛 Bug Fixes

- **Security**: Fixed clear-text logging of sensitive information (GitHub security alerts)
- **API Error Handling**: Improved error messages for invalid table/field references
- **Response Formatting**: Consistent JSON response structure across all tools

## 🌟 What's Next

- Enhanced search capabilities with field-specific filtering
- Batch operations for bulk table/field management
- Advanced view creation and management
- Performance optimizations for large bases

## 📈 Performance & Compatibility

- **Node.js**: Requires Node.js 14+
- **Rate Limits**: Respects Airtable's 5 requests/second limit
- **Memory Usage**: Optimized for efficient schema operations
- **Response Times**: Fast metadata operations with caching

## 🤝 Community & Support

This release incorporates community feedback and feature requests. The v1.5.0 implementation draws inspiration from domdomegg's airtable-mcp-server while maintaining our unique webhook capabilities and enhanced error handling.

**GitHub**: https://github.com/rashidazarang/airtable-mcp  
**NPM**: https://www.npmjs.com/package/@rashidazarang/airtable-mcp  
**Issues**: https://github.com/rashidazarang/airtable-mcp/issues  

---

🎉 **Thank you for using Airtable MCP Server!** This release makes it the most comprehensive Airtable integration available for AI assistants, combining powerful schema management with robust webhook support.
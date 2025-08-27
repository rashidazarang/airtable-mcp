# Airtable MCP Server

[![Trust Score](https://archestra.ai/mcp-catalog/api/badge/quality/rashidazarang/airtable-mcp)](https://archestra.ai/mcp-catalog/rashidazarang__airtable-mcp)
[![smithery badge](https://smithery.ai/badge/@rashidazarang/airtable-mcp)](https://smithery.ai/server/@rashidazarang/airtable-mcp)
![Airtable](https://img.shields.io/badge/Airtable-18BFFF?style=for-the-badge&logo=Airtable&logoColor=white)
[![MCP](https://img.shields.io/badge/MCP-3.1.0-blue)](https://github.com/rashidazarang/airtable-mcp)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![AI Agent](https://img.shields.io/badge/AI_Agent-Enhanced-purple)](https://github.com/rashidazarang/airtable-mcp)
[![Security](https://img.shields.io/badge/Security-Enterprise-green)](https://github.com/rashidazarang/airtable-mcp)
[![Protocol](https://img.shields.io/badge/Protocol-2024--11--05-success)](https://modelcontextprotocol.io/)

🤖 **Revolutionary AI Agent v3.1.0** - Advanced AI-powered Airtable MCP server with **TypeScript support**, comprehensive intelligence capabilities, predictive analytics, and enterprise automation features.

## 🚀 Latest: TypeScript Support v3.1.0

**Enterprise-Grade Type Safety** with full backward compatibility:
- 🔷 **TypeScript Implementation** - Complete type-safe server with strict validation
- 📘 **Comprehensive Type Definitions** - All 33 tools and 10 AI prompts fully typed
- 🛡️ **Compile-Time Safety** - Catch errors before runtime with advanced type checking
- 🎯 **Developer Experience** - IntelliSense, auto-completion, and refactoring support
- 🔄 **Dual Distribution** - Use with JavaScript or TypeScript, your choice
- 📖 **Type Documentation** - Self-documenting APIs through comprehensive type definitions

## 🤖 AI Intelligence Suite

**Complete AI-Powered Intelligence** with enterprise capabilities:
- 🤖 **10 AI Prompt Templates** - Advanced analytics, predictions, and automation
- 🔮 **Predictive Analytics** - Forecasting and trend analysis with confidence intervals
- 🗣️ **Natural Language Processing** - Query your data using human language
- 📊 **Business Intelligence** - Automated insights and recommendations
- 🏗️ **Smart Schema Design** - AI-optimized database architecture
- ⚡ **Workflow Automation** - Intelligent process optimization
- 🔍 **Data Quality Auditing** - Comprehensive quality assessment and fixes
- 📈 **Statistical Analysis** - Advanced analytics with significance testing

## ✨ Features

- 🔍 **Natural Language Queries** - Ask questions about your data in plain English
- 📊 **Full CRUD Operations** - Create, read, update, and delete records
- 🪝 **Webhook Management** - Create and manage webhooks for real-time notifications
- 🏗️ **Advanced Schema Management** - Create tables, fields, and manage base structure
- 🔍 **Base Discovery** - Explore all accessible bases and their schemas
- 🔧 **Field Management** - Add, modify, and remove fields programmatically
- 🔐 **Secure Authentication** - Uses environment variables for credentials
- 🚀 **Easy Setup** - Multiple installation options available
- ⚡ **Fast & Reliable** - Built with Node.js for optimal performance
- 🎯 **33 Powerful Tools** - Complete Airtable API coverage with batch operations
- 📎 **Attachment Management** - Upload files via URLs to attachment fields
- ⚡ **Batch Operations** - Create, update, delete up to 10 records at once
- 👥 **Collaboration Tools** - Manage base collaborators and shared views
- 🤖 **AI Integration** - Prompts and sampling for intelligent data operations
- 🔐 **Enterprise Security** - OAuth2, rate limiting, comprehensive validation

## 📋 Prerequisites

- Node.js 14+ installed on your system
- An Airtable account with a Personal Access Token
- Your Airtable Base ID

## 🚀 Quick Start

### Step 1: Get Your Airtable Credentials

1. **Personal Access Token**: Visit [Airtable Account](https://airtable.com/account) → Create a token with the following scopes:
   - `data.records:read` - Read records from tables
   - `data.records:write` - Create, update, delete records
   - `schema.bases:read` - View table schemas
   - `schema.bases:write` - **New in v1.5.0** - Create/modify tables and fields
   - `webhook:manage` - (Optional) For webhook features

2. **Base ID**: Open your Airtable base and copy the ID from the URL:
   ```
   https://airtable.com/[BASE_ID]/...
   ```

### Step 2: Installation

Choose one of these installation methods:

#### 🔷 TypeScript Users (Recommended for Development)

```bash
# Install with TypeScript support
npm install -g @rashidazarang/airtable-mcp

# For development with types
npm install --save-dev typescript @types/node
```

#### 📦 JavaScript Users (Production Ready)

**Option A: Install via NPM (Recommended)**

```bash
npm install -g @rashidazarang/airtable-mcp
```

**Option B: Clone from GitHub**

```bash
git clone https://github.com/rashidazarang/airtable-mcp.git
cd airtable-mcp
npm install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in your project directory:

```env
AIRTABLE_TOKEN=your_personal_access_token_here
AIRTABLE_BASE_ID=your_base_id_here
```

**Security Note**: Never commit `.env` files to version control!

### Step 4: Configure Your MCP Client

#### 🔷 TypeScript Configuration (Enhanced Developer Experience)

Add to your Claude Desktop configuration file with TypeScript binary:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\\Claude\\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "airtable-typescript": {
      "command": "npx",
      "args": [
        "@rashidazarang/airtable-mcp",
        "--token",
        "YOUR_AIRTABLE_TOKEN",
        "--base",
        "YOUR_BASE_ID"
      ],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

#### 📦 JavaScript Configuration (Standard)

Add to your Claude Desktop configuration file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "airtable": {
      "command": "npx",
      "args": [
        "@rashidazarang/airtable-mcp",
        "--token",
        "YOUR_AIRTABLE_TOKEN",
        "--base",
        "YOUR_BASE_ID"
      ]
    }
  }
}
```

#### For Environment Variables (More Secure)

```json
{
  "mcpServers": {
    "airtable": {
      "command": "npx",
      "args": ["@rashidazarang/airtable-mcp"],
      "env": {
        "AIRTABLE_TOKEN": "YOUR_AIRTABLE_TOKEN",
        "AIRTABLE_BASE_ID": "YOUR_BASE_ID"
      }
    }
  }
}
```

### Step 5: Restart Your MCP Client

After configuration, restart Claude Desktop or your MCP client to load the Airtable server.

## 🎯 Usage Examples

Once configured, you can interact with your Airtable data naturally:

### 🔷 TypeScript Development

```typescript
import { 
  AirtableMCPServer, 
  ListRecordsInput, 
  AnalyzeDataPrompt 
} from '@rashidazarang/airtable-mcp/types';

const server = new AirtableMCPServer();

// Type-safe data operations
const params: ListRecordsInput = {
  table: 'Tasks',
  maxRecords: 10,
  filterByFormula: "Status = 'Active'"
};

const records = await server.handleToolCall('list_records', params);

// Type-safe AI analytics
const analysis: AnalyzeDataPrompt = {
  table: 'Sales',
  analysis_type: 'predictive',
  confidence_level: 0.95
};

const insights = await server.handlePromptGet('analyze_data', analysis);
```

### 📦 Natural Language Interactions

**Basic Operations**
```
"Show me all records in the Projects table"
"Create a new task with priority 'High' and due date tomorrow"
"Update the status of task ID rec123 to 'Completed'"
"Delete all records where status is 'Archived'"
"What tables are in my base?"
"Search for records where Status equals 'Active'"
```

**Webhook Operations (v1.4.0+)**
```
"Create a webhook for my table that notifies https://my-app.com/webhook"
"List all active webhooks in my base"
"Show me the recent webhook payloads"
"Delete webhook ach123xyz"
```

**Schema Management (v1.5.0+)**
```
"List all my accessible Airtable bases"
"Show me the complete schema for this base"
"Describe the Projects table with all field details"
"Create a new table called 'Tasks' with Name, Priority, and Due Date fields"
"Add a Status field to the existing Projects table"
"What field types are available in Airtable?"
```

**Batch Operations & Attachments (v1.6.0+)**
```
"Create 5 new records at once in the Tasks table"
"Update multiple records with new status values"
"Delete these 3 records in one operation"
"Attach this image URL to the record's photo field"
"Who are the collaborators on this base?"
"Show me all shared views in this base"
```

## 🛠️ Available Tools (33 Total)

### 📊 Data Operations (7 tools)
| Tool | Description |
|------|-------------|
| `list_tables` | Get all tables in your base with schema information |
| `list_records` | Query records with optional filtering and pagination |
| `get_record` | Retrieve a single record by ID |
| `create_record` | Add new records to any table |
| `update_record` | Modify existing record fields |
| `delete_record` | Remove records from a table |
| `search_records` | Advanced search with Airtable formulas and sorting |

### 🪝 Webhook Management (5 tools)
| Tool | Description |
|------|-------------|
| `list_webhooks` | View all webhooks configured for your base |
| `create_webhook` | Set up real-time notifications for data changes |
| `delete_webhook` | Remove webhook configurations |
| `get_webhook_payloads` | Retrieve webhook notification history |
| `refresh_webhook` | Extend webhook expiration time |

### 🔍 Schema Discovery (6 tools) - **New in v1.5.0**
| Tool | Description |
|------|-------------|
| `list_bases` | List all accessible Airtable bases with permissions |
| `get_base_schema` | Get complete schema information for any base |
| `describe_table` | Get detailed table info including all field specifications |
| `list_field_types` | Reference guide for all available Airtable field types |
| `get_table_views` | List all views for a specific table with configurations |

### 🏗️ Table Management (3 tools) - **New in v1.5.0**
| Tool | Description |
|------|-------------|
| `create_table` | Create new tables with custom field definitions |
| `update_table` | Modify table names and descriptions |
| `delete_table` | Remove tables (with safety confirmation required) |

### 🔧 Field Management (3 tools) - **New in v1.5.0**
| Tool | Description |
|------|-------------|
| `create_field` | Add new fields to existing tables with all field types |
| `update_field` | Modify field properties, names, and options |
| `delete_field` | Remove fields (with safety confirmation required) |

### ⚡ Batch Operations (4 tools) - **New in v1.6.0**
| Tool | Description |
|------|-------------|
| `batch_create_records` | Create up to 10 records at once for better performance |
| `batch_update_records` | Update up to 10 records simultaneously |
| `batch_delete_records` | Delete up to 10 records in a single operation |
| `batch_upsert_records` | Update existing or create new records based on key fields |

### 📎 Attachment Management (1 tool) - **New in v1.6.0**
| Tool | Description |
|------|-------------|
| `upload_attachment` | Attach files from public URLs to attachment fields |

### 👁️ Advanced Views (2 tools) - **New in v1.6.0**
| Tool | Description |
|------|-------------|
| `create_view` | Create new views (grid, form, calendar, etc.) with custom configurations |
| `get_view_metadata` | Get detailed view information including filters and sorts |

### 🏢 Base Management (3 tools) - **New in v1.6.0**
| Tool | Description |
|------|-------------|
| `create_base` | Create new Airtable bases with initial table structures |
| `list_collaborators` | View base collaborators and their permission levels |
| `list_shares` | List shared views and their public configurations |

### 🤖 AI Intelligence Suite (10 prompts) - **New in v3.0.0**
| Prompt | Description | Enterprise Features |
|--------|-------------|-------------------|
| `analyze_data` | Advanced statistical analysis with ML insights | Confidence intervals, anomaly detection |
| `create_report` | Intelligent report generation with recommendations | Multi-stakeholder customization, ROI analysis |
| `data_insights` | Business intelligence and pattern discovery | Cross-table correlations, predictive indicators |
| `optimize_workflow` | AI-powered automation recommendations | Change management, implementation roadmaps |
| `smart_schema_design` | Database optimization with best practices | Compliance-aware (GDPR, HIPAA), scalability planning |
| `data_quality_audit` | Comprehensive quality assessment and fixes | Automated remediation, governance frameworks |
| `predictive_analytics` | Forecasting and trend prediction | Multiple algorithms, uncertainty quantification |
| `natural_language_query` | Process human questions intelligently | Context awareness, confidence scoring |
| `smart_data_transformation` | AI-assisted data processing | Quality rules, audit trails, optimization |
| `automation_recommendations` | Workflow optimization suggestions | Technical feasibility, cost-benefit analysis |

## 🔧 Advanced Configuration

### Using with Smithery Cloud

For cloud-hosted MCP servers:

```json
{
  "mcpServers": {
    "airtable": {
      "command": "npx",
      "args": [
        "@smithery/cli",
        "run",
        "@rashidazarang/airtable-mcp",
        "--token",
        "YOUR_TOKEN",
        "--base",
        "YOUR_BASE_ID"
      ]
    }
  }
}
```

### Direct Node.js Execution

If you cloned the repository:

```json
{
  "mcpServers": {
    "airtable": {
      "command": "node",
      "args": [
        "/path/to/airtable-mcp/airtable_simple.js",
        "--token",
        "YOUR_TOKEN",
        "--base",
        "YOUR_BASE_ID"
      ]
    }
  }
}
```

## 🧪 Testing

### 🔷 TypeScript Testing

Run the comprehensive TypeScript test suite:

```bash
# Install dependencies first
npm install

# Run TypeScript type checking
npm run test:types

# Run full TypeScript test suite
npm run test:ts

# Build and test TypeScript server
npm run build
npm run start:ts
```

### 📦 JavaScript Testing

Run the comprehensive test suite to verify all 33 tools:

```bash
# Set environment variables first
export AIRTABLE_TOKEN=your_token
export AIRTABLE_BASE_ID=your_base_id

# Start the server
node airtable_simple.js &

# Run comprehensive tests (v1.6.0+)
./test_v1.6.0_comprehensive.sh
```

The TypeScript test suite validates:
- **Type Safety**: Compile-time validation of all interfaces
- **Enterprise Testing**: 33 tools with strict type checking
- **AI Prompt Validation**: All 10 AI templates with proper typing
- **Error Handling**: Type-safe error management
- **Performance**: Concurrent operations with type safety
- **Integration**: Full MCP protocol compliance

The JavaScript test suite validates:
- All 33 tools with real API calls
- Complete CRUD operations
- Advanced schema management
- Batch operations (create/update/delete multiple records)
- Attachment management via URLs
- Advanced view creation and metadata
- Base management and collaboration tools
- Webhook management
- Error handling and edge cases
- Security verification
- 100% test coverage

## 🐛 Troubleshooting

### "Connection Refused" Error
- Ensure the MCP server is running
- Check that port 8010 is not blocked
- Restart your MCP client

### "Invalid Token" Error
- Verify your Personal Access Token is correct
- Check that the token has the required scopes
- Ensure no extra spaces in your credentials

### "Base Not Found" Error
- Confirm your Base ID is correct
- Check that your token has access to the base

### Port Conflicts
If port 8010 is in use:
```bash
lsof -ti:8010 | xargs kill -9
```

## 📚 Documentation

### 🔷 TypeScript Documentation
- 📘 [TypeScript Examples](./examples/typescript/) - Complete type-safe usage examples
- 🏗️ [Type Definitions](./types/) - Comprehensive type definitions for all features
- 🧪 [TypeScript Testing](./src/test-suite.ts) - Enterprise-grade testing framework

### 📦 General Documentation  
- 🎆 [Release Notes v3.1.0](./RELEASE_NOTES_v3.1.0.md) - **Latest TypeScript release**
- [Release Notes v1.6.0](./RELEASE_NOTES_v1.6.0.md) - Major feature release
- [Release Notes v1.5.0](./RELEASE_NOTES_v1.5.0.md)
- [Release Notes v1.4.0](./RELEASE_NOTES_v1.4.0.md)
- [Detailed Setup Guide](./CLAUDE_INTEGRATION.md)
- [Development Guide](./DEVELOPMENT.md)
- [Security Notice](./SECURITY_NOTICE.md)

## 📦 Version History

- **v3.1.0** (2025-08-16) - 🔷 **TypeScript Support**: Enterprise-grade type safety, comprehensive type definitions, dual JS/TS distribution
- **v3.0.0** (2025-08-16) - 🤖 **Revolutionary AI Agent**: 10 intelligent prompts, predictive analytics, natural language processing
- **v2.2.3** (2025-08-16) - 🔒 **Security release**: Final XSS vulnerability fixes and enhanced validation
- **v2.2.0** (2025-08-16) - 🏆 **Major release**: Complete MCP 2024-11-05 protocol implementation
- **v1.6.0** (2025-08-15) - 🎆 **Major release**: Added batch operations & attachment management (33 total tools)
- **v1.5.0** (2025-08-15) - Added comprehensive schema management (23 total tools)
- **v1.4.0** (2025-08-14) - Added webhook support and enhanced CRUD operations (12 tools)
- **v1.2.4** (2025-08-12) - Security fixes and stability improvements
- **v1.2.3** (2025-08-11) - Bug fixes and error handling
- **v1.2.2** (2025-08-10) - Initial stable release

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🙏 Acknowledgments

- Built for the [Model Context Protocol](https://modelcontextprotocol.io/)
- Powered by [Airtable API](https://airtable.com/developers/web/api/introduction)
- Compatible with [Claude Desktop](https://claude.ai/) and other MCP clients

## 📮 Support

- **Issues**: [GitHub Issues](https://github.com/rashidazarang/airtable-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rashidazarang/airtable-mcp/discussions)

---

**Version**: 3.1.0 | **Status**: 🔷 TypeScript + 🤖 AI Agent | **MCP Protocol**: 2024-11-05 Complete | **Type Safety**: Enterprise-Grade | **Intelligence**: 10 AI Prompts | **Last Updated**: August 16, 2025

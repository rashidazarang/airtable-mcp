# Release Notes - v1.4.0

## 🚀 Major Feature Release

### ✨ New Features

#### 🪝 **Webhook Management** (5 new tools)
- `list_webhooks` - List all webhooks in your base
- `create_webhook` - Create webhooks for real-time notifications
- `delete_webhook` - Remove webhooks
- `get_webhook_payloads` - Retrieve webhook payload history
- `refresh_webhook` - Extend webhook expiration time

#### 🔧 **Enhanced CRUD Operations** (5 tools added since v1.2.4)
- `create_record` - Create new records in any table
- `update_record` - Update existing records
- `delete_record` - Remove records from tables
- `get_record` - Retrieve single record by ID
- `search_records` - Advanced filtering with Airtable formulas

### 📊 **Complete Tool Set (12 tools total)**
1. **list_tables** - List all tables in base
2. **list_records** - List records from table
3. **get_record** - Get single record by ID
4. **create_record** - Create new records
5. **update_record** - Update existing records
6. **delete_record** - Delete records
7. **search_records** - Search with filters
8. **list_webhooks** - List webhooks
9. **create_webhook** - Create webhooks
10. **delete_webhook** - Delete webhooks
11. **get_webhook_payloads** - Get webhook history
12. **refresh_webhook** - Refresh webhook expiration

### 🔐 **Security Improvements**
- Environment variable support for credentials
- Token masking in logs
- Configurable logging levels (ERROR, WARN, INFO, DEBUG)
- No hardcoded credentials in test files

### 🛠️ **Technical Improvements**
- Full HTTP method support (GET, POST, PATCH, DELETE)
- Enhanced error handling with detailed messages
- Proper API endpoint routing
- Debug logging support
- Graceful shutdown handling

### 📈 **Testing**
- **100% test coverage** - All 12 tools tested and verified
- Tested with real Airtable API
- Comprehensive test suite included
- Test scripts for validation

### 💔 **Breaking Changes**
- Test files now require environment variables:
  ```bash
  export AIRTABLE_TOKEN="your_token"
  export AIRTABLE_BASE_ID="your_base_id"
  ```

### 🔄 **Migration from v1.2.4**

1. **Update package**:
   ```bash
   npm install -g @rashidazarang/airtable-mcp@latest
   ```

2. **Set credentials** (choose one method):
   - Environment variables
   - Command line arguments
   - .env file

3. **Update configuration** if using webhooks

### 📝 **Webhook Usage Example**

```javascript
// Create a webhook
{
  "name": "create_webhook",
  "arguments": {
    "notificationUrl": "https://your-endpoint.com/webhook"
  }
}

// The response includes:
// - Webhook ID
// - MAC secret (save this - shown only once!)
// - Expiration time
```

### 🎯 **What's Next**
- Batch operations support
- Comment management
- Attachment handling
- Schema modification tools

### 🙏 **Acknowledgments**
- Thanks to all testers and contributors
- Special thanks for the comprehensive testing feedback

---

**Full Changelog**: [v1.2.4...v1.4.0](https://github.com/rashidazarang/airtable-mcp/compare/v1.2.4...v1.4.0)
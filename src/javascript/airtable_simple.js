#!/usr/bin/env node

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file if it exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

// Parse command line arguments with environment variable fallback
const args = process.argv.slice(2);
let tokenIndex = args.indexOf('--token');
let baseIndex = args.indexOf('--base');

// Use environment variables as fallback
const token = tokenIndex !== -1 ? args[tokenIndex + 1] : process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_TOKEN;
const baseId = baseIndex !== -1 ? args[baseIndex + 1] : process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE;

if (!token || !baseId) {
  console.error('Error: Missing Airtable credentials');
  console.error('\nUsage options:');
  console.error('  1. Command line: node airtable_enhanced.js --token YOUR_TOKEN --base YOUR_BASE_ID');
  console.error('  2. Environment variables: AIRTABLE_TOKEN and AIRTABLE_BASE_ID');
  console.error('  3. .env file with AIRTABLE_TOKEN and AIRTABLE_BASE_ID');
  process.exit(1);
}

// Configure logging levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLogLevel = process.env.LOG_LEVEL ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO : LOG_LEVELS.INFO;

function log(level, message, ...args) {
  const levelName = Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level);
  const timestamp = new Date().toISOString();
  
  if (level <= currentLogLevel) {
    const prefix = `[${timestamp}] [${levelName}]`;
    if (level === LOG_LEVELS.ERROR) {
      console.error(prefix, message, ...args);
    } else if (level === LOG_LEVELS.WARN) {
      console.warn(prefix, message, ...args);
    } else {
      console.log(prefix, message, ...args);
    }
  }
}

log(LOG_LEVELS.INFO, `Starting Enhanced Airtable MCP server v1.6.0`);
log(LOG_LEVELS.INFO, `Authentication configured`);
log(LOG_LEVELS.INFO, `Base connection established`);

// Enhanced Airtable API function with full HTTP method support
function callAirtableAPI(endpoint, method = 'GET', body = null, queryParams = {}) {
  return new Promise((resolve, reject) => {
    const isBaseEndpoint = !endpoint.startsWith('meta/') && !endpoint.startsWith('bases/');
    const baseUrl = isBaseEndpoint ? `${baseId}/${endpoint}` : endpoint;
    
    // Build query string
    const queryString = Object.keys(queryParams).length > 0 
      ? '?' + new URLSearchParams(queryParams).toString() 
      : '';
    
    const url = `https://api.airtable.com/v0/${baseUrl}${queryString}`;
    const urlObj = new URL(url);
    
    log(LOG_LEVELS.DEBUG, `API Request: ${method} ${url}`);
    if (body) {
      log(LOG_LEVELS.DEBUG, `Request body:`, JSON.stringify(body, null, 2));
    }
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        log(LOG_LEVELS.DEBUG, `Response status: ${response.statusCode}`);
        log(LOG_LEVELS.DEBUG, `Response data:`, data);
        
        try {
          const parsed = data ? JSON.parse(data) : {};
          
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(parsed);
          } else {
            const error = parsed.error || {};
            reject(new Error(`Airtable API error (${response.statusCode}): ${error.message || error.type || 'Unknown error'}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse Airtable response: ${e.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Airtable API request failed: ${error.message}`));
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Only handle POST requests to /mcp
  if (req.method !== 'POST' || !req.url.endsWith('/mcp')) {
    res.writeHead(404);
    res.end();
    return;
  }
  
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', async () => {
    try {
      const request = JSON.parse(body);
      log(LOG_LEVELS.DEBUG, 'Received request:', JSON.stringify(request, null, 2));
      
      // Handle JSON-RPC methods
      if (request.method === 'tools/list') {
        const response = {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            tools: [
              {
                name: 'list_tables',
                description: 'List all tables in the Airtable base',
                inputSchema: {
                  type: 'object',
                  properties: {}
                }
              },
              {
                name: 'list_records',
                description: 'List records from a specific table',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID' },
                    maxRecords: { type: 'number', description: 'Maximum number of records to return' },
                    view: { type: 'string', description: 'View name or ID' }
                  },
                  required: ['table']
                }
              },
              {
                name: 'get_record',
                description: 'Get a single record by ID',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID' },
                    recordId: { type: 'string', description: 'Record ID' }
                  },
                  required: ['table', 'recordId']
                }
              },
              {
                name: 'create_record',
                description: 'Create a new record in a table',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID' },
                    fields: { type: 'object', description: 'Field values for the new record' }
                  },
                  required: ['table', 'fields']
                }
              },
              {
                name: 'update_record',
                description: 'Update an existing record',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID' },
                    recordId: { type: 'string', description: 'Record ID to update' },
                    fields: { type: 'object', description: 'Fields to update' }
                  },
                  required: ['table', 'recordId', 'fields']
                }
              },
              {
                name: 'delete_record',
                description: 'Delete a record from a table',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID' },
                    recordId: { type: 'string', description: 'Record ID to delete' }
                  },
                  required: ['table', 'recordId']
                }
              },
              {
                name: 'search_records',
                description: 'Search records with filtering and sorting',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID' },
                    filterByFormula: { type: 'string', description: 'Airtable formula to filter records' },
                    sort: { type: 'array', description: 'Sort configuration' },
                    maxRecords: { type: 'number', description: 'Maximum records to return' },
                    fields: { type: 'array', description: 'Fields to return' }
                  },
                  required: ['table']
                }
              },
              {
                name: 'list_webhooks',
                description: 'List all webhooks for the base',
                inputSchema: {
                  type: 'object',
                  properties: {}
                }
              },
              {
                name: 'create_webhook',
                description: 'Create a new webhook for a table',
                inputSchema: {
                  type: 'object',
                  properties: {
                    notificationUrl: { type: 'string', description: 'URL to receive webhook notifications' },
                    specification: {
                      type: 'object',
                      description: 'Webhook specification',
                      properties: {
                        options: {
                          type: 'object',
                          properties: {
                            filters: {
                              type: 'object',
                              properties: {
                                dataTypes: { type: 'array', items: { type: 'string' } },
                                recordChangeScope: { type: 'string' }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  required: ['notificationUrl']
                }
              },
              {
                name: 'delete_webhook',
                description: 'Delete a webhook',
                inputSchema: {
                  type: 'object',
                  properties: {
                    webhookId: { type: 'string', description: 'Webhook ID to delete' }
                  },
                  required: ['webhookId']
                }
              },
              {
                name: 'get_webhook_payloads',
                description: 'Get webhook payload history',
                inputSchema: {
                  type: 'object',
                  properties: {
                    webhookId: { type: 'string', description: 'Webhook ID' },
                    cursor: { type: 'number', description: 'Cursor for pagination' }
                  },
                  required: ['webhookId']
                }
              },
              {
                name: 'refresh_webhook',
                description: 'Refresh a webhook to extend its expiration',
                inputSchema: {
                  type: 'object',
                  properties: {
                    webhookId: { type: 'string', description: 'Webhook ID to refresh' }
                  },
                  required: ['webhookId']
                }
              },
              {
                name: 'list_bases',
                description: 'List all accessible Airtable bases',
                inputSchema: {
                  type: 'object',
                  properties: {
                    offset: { type: 'string', description: 'Pagination offset for listing more bases' }
                  }
                }
              },
              {
                name: 'get_base_schema',
                description: 'Get complete schema information for a base',
                inputSchema: {
                  type: 'object',
                  properties: {
                    baseId: { type: 'string', description: 'Base ID to get schema for (optional, defaults to current base)' }
                  }
                }
              },
              {
                name: 'describe_table',
                description: 'Get detailed information about a specific table including all fields',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID' }
                  },
                  required: ['table']
                }
              },
              {
                name: 'create_table',
                description: 'Create a new table in the base',
                inputSchema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', description: 'Name for the new table' },
                    description: { type: 'string', description: 'Optional description for the table' },
                    fields: { 
                      type: 'array', 
                      description: 'Array of field definitions',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string', description: 'Field name' },
                          type: { type: 'string', description: 'Field type (singleLineText, number, etc.)' },
                          description: { type: 'string', description: 'Field description' },
                          options: { type: 'object', description: 'Field-specific options' }
                        },
                        required: ['name', 'type']
                      }
                    }
                  },
                  required: ['name', 'fields']
                }
              },
              {
                name: 'update_table',
                description: 'Update table name or description',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID' },
                    name: { type: 'string', description: 'New table name' },
                    description: { type: 'string', description: 'New table description' }
                  },
                  required: ['table']
                }
              },
              {
                name: 'delete_table',
                description: 'Delete a table (WARNING: This will permanently delete all data)',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID to delete' },
                    confirm: { type: 'boolean', description: 'Must be true to confirm deletion' }
                  },
                  required: ['table', 'confirm']
                }
              },
              {
                name: 'create_field',
                description: 'Add a new field to an existing table',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID' },
                    name: { type: 'string', description: 'Field name' },
                    type: { type: 'string', description: 'Field type (singleLineText, number, multipleSelectionList, etc.)' },
                    description: { type: 'string', description: 'Field description' },
                    options: { type: 'object', description: 'Field-specific options (e.g., choices for select fields)' }
                  },
                  required: ['table', 'name', 'type']
                }
              },
              {
                name: 'update_field',
                description: 'Update field properties',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID' },
                    fieldId: { type: 'string', description: 'Field ID to update' },
                    name: { type: 'string', description: 'New field name' },
                    description: { type: 'string', description: 'New field description' },
                    options: { type: 'object', description: 'Updated field options' }
                  },
                  required: ['table', 'fieldId']
                }
              },
              {
                name: 'delete_field',
                description: 'Delete a field from a table (WARNING: This will permanently delete all data in this field)',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID' },
                    fieldId: { type: 'string', description: 'Field ID to delete' },
                    confirm: { type: 'boolean', description: 'Must be true to confirm deletion' }
                  },
                  required: ['table', 'fieldId', 'confirm']
                }
              },
              {
                name: 'list_field_types',
                description: 'Get a reference of all available Airtable field types and their schemas',
                inputSchema: {
                  type: 'object',
                  properties: {}
                }
              },
              {
                name: 'get_table_views',
                description: 'List all views for a specific table',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID' }
                  },
                  required: ['table']
                }
              },
              {
                name: 'upload_attachment',
                description: 'Upload/attach a file from URL to a record',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID' },
                    recordId: { type: 'string', description: 'Record ID to attach file to' },
                    fieldName: { type: 'string', description: 'Name of the attachment field' },
                    url: { type: 'string', description: 'Public URL of the file to attach' },
                    filename: { type: 'string', description: 'Optional filename for the attachment' }
                  },
                  required: ['table', 'recordId', 'fieldName', 'url']
                }
              },
              {
                name: 'batch_create_records',
                description: 'Create multiple records at once (up to 10)',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID' },
                    records: {
                      type: 'array',
                      description: 'Array of record objects to create (max 10)',
                      items: {
                        type: 'object',
                        properties: {
                          fields: { type: 'object', description: 'Record fields' }
                        },
                        required: ['fields']
                      },
                      maxItems: 10
                    }
                  },
                  required: ['table', 'records']
                }
              },
              {
                name: 'batch_update_records',
                description: 'Update multiple records at once (up to 10)',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID' },
                    records: {
                      type: 'array',
                      description: 'Array of record objects to update (max 10)',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', description: 'Record ID' },
                          fields: { type: 'object', description: 'Fields to update' }
                        },
                        required: ['id', 'fields']
                      },
                      maxItems: 10
                    }
                  },
                  required: ['table', 'records']
                }
              },
              {
                name: 'batch_delete_records',
                description: 'Delete multiple records at once (up to 10)',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID' },
                    recordIds: {
                      type: 'array',
                      description: 'Array of record IDs to delete (max 10)',
                      items: { type: 'string' },
                      maxItems: 10
                    }
                  },
                  required: ['table', 'recordIds']
                }
              },
              {
                name: 'batch_upsert_records',
                description: 'Update existing records or create new ones based on key fields',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID' },
                    records: {
                      type: 'array',
                      description: 'Array of record objects (max 10)',
                      items: {
                        type: 'object',
                        properties: {
                          fields: { type: 'object', description: 'Record fields' }
                        },
                        required: ['fields']
                      },
                      maxItems: 10
                    },
                    keyFields: {
                      type: 'array',
                      description: 'Fields to use for matching existing records',
                      items: { type: 'string' }
                    }
                  },
                  required: ['table', 'records', 'keyFields']
                }
              },
              {
                name: 'create_view',
                description: 'Create a new view for a table',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID' },
                    name: { type: 'string', description: 'Name for the new view' },
                    type: { type: 'string', description: 'View type (grid, form, calendar, etc.)', enum: ['grid', 'form', 'calendar', 'gallery', 'kanban', 'timeline', 'gantt'] },
                    visibleFieldIds: { type: 'array', description: 'Array of field IDs to show in view', items: { type: 'string' } },
                    fieldOrder: { type: 'array', description: 'Order of fields in view', items: { type: 'string' } }
                  },
                  required: ['table', 'name', 'type']
                }
              },
              {
                name: 'get_view_metadata',
                description: 'Get detailed metadata for a specific view',
                inputSchema: {
                  type: 'object',
                  properties: {
                    table: { type: 'string', description: 'Table name or ID' },
                    viewId: { type: 'string', description: 'View ID' }
                  },
                  required: ['table', 'viewId']
                }
              },
              {
                name: 'create_base',
                description: 'Create a new Airtable base',
                inputSchema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', description: 'Name for the new base' },
                    workspaceId: { type: 'string', description: 'Workspace ID to create the base in' },
                    tables: {
                      type: 'array',
                      description: 'Initial tables to create in the base',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string', description: 'Table name' },
                          description: { type: 'string', description: 'Table description' },
                          fields: {
                            type: 'array',
                            description: 'Table fields',
                            items: {
                              type: 'object',
                              properties: {
                                name: { type: 'string', description: 'Field name' },
                                type: { type: 'string', description: 'Field type' }
                              },
                              required: ['name', 'type']
                            }
                          }
                        },
                        required: ['name', 'fields']
                      }
                    }
                  },
                  required: ['name', 'tables']
                }
              },
              {
                name: 'list_collaborators',
                description: 'List collaborators and their permissions for the current base',
                inputSchema: {
                  type: 'object',
                  properties: {
                    baseId: { type: 'string', description: 'Base ID (optional, defaults to current base)' }
                  }
                }
              },
              {
                name: 'list_shares',
                description: 'List shared views and their configurations',
                inputSchema: {
                  type: 'object',
                  properties: {
                    baseId: { type: 'string', description: 'Base ID (optional, defaults to current base)' }
                  }
                }
              }
            ]
          }
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
        return;
      }
      
      if (request.method === 'resources/list') {
        const response = {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            resources: [
              {
                id: 'airtable_tables',
                name: 'Airtable Tables',
                description: 'Tables in your Airtable base'
              }
            ]
          }
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
        return;
      }
      
      if (request.method === 'prompts/list') {
        const response = {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            prompts: [
              {
                id: 'tables_prompt',
                name: 'List Tables',
                description: 'List all tables'
              }
            ]
          }
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
        return;
      }
      
      // Handle tool calls
      if (request.method === 'tools/call') {
        const toolName = request.params.name;
        const toolParams = request.params.arguments || {};
        
        let result;
        let responseText;
        
        try {
          // LIST TABLES
          if (toolName === 'list_tables') {
            result = await callAirtableAPI(`meta/bases/${baseId}/tables`);
            const tables = result.tables || [];
            
            responseText = tables.length > 0 
              ? `Found ${tables.length} table(s):\n` + tables.map((table, i) => 
                  `${i+1}. ${table.name} (ID: ${table.id}, Fields: ${table.fields?.length || 0})`
                ).join('\n')
              : 'No tables found in this base.';
          }
          
          // LIST RECORDS
          else if (toolName === 'list_records') {
            const { table, maxRecords, view } = toolParams;
            
            const queryParams = {};
            if (maxRecords) queryParams.maxRecords = maxRecords;
            if (view) queryParams.view = view;
            
            result = await callAirtableAPI(`${table}`, 'GET', null, queryParams);
            const records = result.records || [];
            
            responseText = records.length > 0
              ? `Found ${records.length} record(s) in table "${table}":\n` + 
                records.map((record, i) => 
                  `${i+1}. ID: ${record.id}\n   Fields: ${JSON.stringify(record.fields, null, 2)}`
                ).join('\n\n')
              : `No records found in table "${table}".`;
          }
          
          // GET SINGLE RECORD
          else if (toolName === 'get_record') {
            const { table, recordId } = toolParams;
            
            result = await callAirtableAPI(`${table}/${recordId}`);
            
            responseText = `Record ${recordId} from table "${table}":\n` + 
              JSON.stringify(result.fields, null, 2) +
              `\n\nCreated: ${result.createdTime}`;
          }
          
          // CREATE RECORD
          else if (toolName === 'create_record') {
            const { table, fields } = toolParams;
            
            const body = {
              fields: fields
            };
            
            result = await callAirtableAPI(table, 'POST', body);
            
            responseText = `Successfully created record in table "${table}":\n` +
              `Record ID: ${result.id}\n` +
              `Fields: ${JSON.stringify(result.fields, null, 2)}\n` +
              `Created at: ${result.createdTime}`;
          }
          
          // UPDATE RECORD
          else if (toolName === 'update_record') {
            const { table, recordId, fields } = toolParams;
            
            const body = {
              fields: fields
            };
            
            result = await callAirtableAPI(`${table}/${recordId}`, 'PATCH', body);
            
            responseText = `Successfully updated record ${recordId} in table "${table}":\n` +
              `Updated fields: ${JSON.stringify(result.fields, null, 2)}`;
          }
          
          // DELETE RECORD
          else if (toolName === 'delete_record') {
            const { table, recordId } = toolParams;
            
            result = await callAirtableAPI(`${table}/${recordId}`, 'DELETE');
            
            responseText = `Successfully deleted record ${recordId} from table "${table}".\n` +
              `Deleted record ID: ${result.id}\n` +
              `Deleted: ${result.deleted}`;
          }
          
          // SEARCH RECORDS
          else if (toolName === 'search_records') {
            const { table, filterByFormula, sort, maxRecords, fields } = toolParams;
            
            const queryParams = {};
            if (filterByFormula) queryParams.filterByFormula = filterByFormula;
            if (maxRecords) queryParams.maxRecords = maxRecords;
            if (fields && fields.length > 0) queryParams.fields = fields;
            if (sort && sort.length > 0) {
              sort.forEach((s, i) => {
                queryParams[`sort[${i}][field]`] = s.field;
                queryParams[`sort[${i}][direction]`] = s.direction || 'asc';
              });
            }
            
            result = await callAirtableAPI(table, 'GET', null, queryParams);
            const records = result.records || [];
            
            responseText = records.length > 0
              ? `Found ${records.length} matching record(s) in table "${table}":\n` + 
                records.map((record, i) => 
                  `${i+1}. ID: ${record.id}\n   Fields: ${JSON.stringify(record.fields, null, 2)}`
                ).join('\n\n')
              : `No records found matching the search criteria in table "${table}".`;
          }
          
          // LIST WEBHOOKS
          else if (toolName === 'list_webhooks') {
            result = await callAirtableAPI(`bases/${baseId}/webhooks`, 'GET');
            const webhooks = result.webhooks || [];
            
            responseText = webhooks.length > 0
              ? `Found ${webhooks.length} webhook(s):\n` + 
                webhooks.map((webhook, i) => 
                  `${i+1}. ID: ${webhook.id}\n` +
                  `   URL: ${webhook.notificationUrl}\n` +
                  `   Active: ${webhook.isHookEnabled}\n` +
                  `   Created: ${webhook.createdTime}\n` +
                  `   Expires: ${webhook.expirationTime}`
                ).join('\n\n')
              : 'No webhooks configured for this base.';
          }
          
          // CREATE WEBHOOK
          else if (toolName === 'create_webhook') {
            const { notificationUrl, specification } = toolParams;
            
            const body = {
              notificationUrl: notificationUrl,
              specification: specification || {
                options: {
                  filters: {
                    dataTypes: ['tableData']
                  }
                }
              }
            };
            
            result = await callAirtableAPI(`bases/${baseId}/webhooks`, 'POST', body);
            
            responseText = `Successfully created webhook:\n` +
              `Webhook ID: ${result.id}\n` +
              `URL: ${result.notificationUrl}\n` +
              `MAC Secret: ${result.macSecretBase64}\n` +
              `Expiration: ${result.expirationTime}\n` +
              `Cursor: ${result.cursorForNextPayload}\n\n` +
              `⚠️ IMPORTANT: Save the MAC secret - it won't be shown again!`;
          }
          
          // DELETE WEBHOOK
          else if (toolName === 'delete_webhook') {
            const { webhookId } = toolParams;
            
            await callAirtableAPI(`bases/${baseId}/webhooks/${webhookId}`, 'DELETE');
            
            responseText = `Successfully deleted webhook ${webhookId}`;
          }
          
          // GET WEBHOOK PAYLOADS
          else if (toolName === 'get_webhook_payloads') {
            const { webhookId, cursor } = toolParams;
            
            const queryParams = {};
            if (cursor) queryParams.cursor = cursor;
            
            result = await callAirtableAPI(`bases/${baseId}/webhooks/${webhookId}/payloads`, 'GET', null, queryParams);
            
            const payloads = result.payloads || [];
            responseText = payloads.length > 0
              ? `Found ${payloads.length} webhook payload(s):\n` + 
                payloads.map((payload, i) => 
                  `${i+1}. Timestamp: ${payload.timestamp}\n` +
                  `   Base/Table: ${payload.baseTransactionNumber}\n` +
                  `   Change Types: ${JSON.stringify(payload.changePayload?.changedTablesById || {})}`
                ).join('\n\n') +
                (result.cursor ? `\n\nNext cursor: ${result.cursor}` : '')
              : 'No payloads found for this webhook.';
          }
          
          // REFRESH WEBHOOK
          else if (toolName === 'refresh_webhook') {
            const { webhookId } = toolParams;
            
            result = await callAirtableAPI(`bases/${baseId}/webhooks/${webhookId}/refresh`, 'POST');
            
            responseText = `Successfully refreshed webhook ${webhookId}:\n` +
              `New expiration: ${result.expirationTime}`;
          }
          
          // Schema Management Tools
          else if (toolName === 'list_bases') {
            const { offset } = toolParams;
            const queryParams = offset ? { offset } : {};
            
            result = await callAirtableAPI('meta/bases', 'GET', null, queryParams);
            
            if (result.bases && result.bases.length > 0) {
              responseText = `Found ${result.bases.length} accessible base(s):\n`;
              result.bases.forEach((base, index) => {
                responseText += `${index + 1}. ${base.name} (ID: ${base.id})\n`;
                if (base.permissionLevel) {
                  responseText += `   Permission: ${base.permissionLevel}\n`;
                }
              });
              if (result.offset) {
                responseText += `\nNext page offset: ${result.offset}`;
              }
            } else {
              responseText = 'No accessible bases found.';
            }
          }
          
          else if (toolName === 'get_base_schema') {
            const { baseId: targetBaseId } = toolParams;
            const targetId = targetBaseId || baseId;
            
            result = await callAirtableAPI(`meta/bases/${targetId}/tables`, 'GET');
            
            if (result.tables && result.tables.length > 0) {
              responseText = `Base schema for ${targetId}:\n\n`;
              result.tables.forEach((table, index) => {
                responseText += `${index + 1}. Table: ${table.name} (ID: ${table.id})\n`;
                if (table.description) {
                  responseText += `   Description: ${table.description}\n`;
                }
                responseText += `   Fields (${table.fields.length}):\n`;
                table.fields.forEach((field, fieldIndex) => {
                  responseText += `   ${fieldIndex + 1}. ${field.name} (${field.type})\n`;
                  if (field.description) {
                    responseText += `      Description: ${field.description}\n`;
                  }
                });
                if (table.views && table.views.length > 0) {
                  responseText += `   Views (${table.views.length}): ${table.views.map(v => v.name).join(', ')}\n`;
                }
                responseText += '\n';
              });
            } else {
              responseText = 'No tables found in this base.';
            }
          }
          
          else if (toolName === 'describe_table') {
            const { table } = toolParams;
            
            // Get table schema first
            const schemaResult = await callAirtableAPI(`meta/bases/${baseId}/tables`, 'GET');
            const tableInfo = schemaResult.tables.find(t => 
              t.name.toLowerCase() === table.toLowerCase() || t.id === table
            );
            
            if (!tableInfo) {
              responseText = `Table "${table}" not found.`;
            } else {
              responseText = `Table Details: ${tableInfo.name}\n`;
              responseText += `ID: ${tableInfo.id}\n`;
              if (tableInfo.description) {
                responseText += `Description: ${tableInfo.description}\n`;
              }
              responseText += `\nFields (${tableInfo.fields.length}):\n`;
              
              tableInfo.fields.forEach((field, index) => {
                responseText += `${index + 1}. ${field.name}\n`;
                responseText += `   Type: ${field.type}\n`;
                responseText += `   ID: ${field.id}\n`;
                if (field.description) {
                  responseText += `   Description: ${field.description}\n`;
                }
                if (field.options) {
                  responseText += `   Options: ${JSON.stringify(field.options, null, 2)}\n`;
                }
                responseText += '\n';
              });
              
              if (tableInfo.views && tableInfo.views.length > 0) {
                responseText += `Views (${tableInfo.views.length}):\n`;
                tableInfo.views.forEach((view, index) => {
                  responseText += `${index + 1}. ${view.name} (${view.type})\n`;
                });
              }
            }
          }
          
          else if (toolName === 'create_table') {
            const { name, description, fields } = toolParams;
            
            const body = {
              name,
              fields: fields.map(field => ({
                name: field.name,
                type: field.type,
                description: field.description,
                options: field.options
              }))
            };
            
            if (description) {
              body.description = description;
            }
            
            result = await callAirtableAPI(`meta/bases/${baseId}/tables`, 'POST', body);
            
            responseText = `Successfully created table "${name}" (ID: ${result.id})\n`;
            responseText += `Fields created: ${result.fields.length}\n`;
            result.fields.forEach((field, index) => {
              responseText += `${index + 1}. ${field.name} (${field.type})\n`;
            });
          }
          
          else if (toolName === 'update_table') {
            const { table, name, description } = toolParams;
            
            // Get table ID first
            const schemaResult = await callAirtableAPI(`meta/bases/${baseId}/tables`, 'GET');
            const tableInfo = schemaResult.tables.find(t => 
              t.name.toLowerCase() === table.toLowerCase() || t.id === table
            );
            
            if (!tableInfo) {
              responseText = `Table "${table}" not found.`;
            } else {
              const body = {};
              if (name) body.name = name;
              if (description !== undefined) body.description = description;
              
              if (Object.keys(body).length === 0) {
                responseText = 'No updates specified. Provide name or description to update.';
              } else {
                result = await callAirtableAPI(`meta/bases/${baseId}/tables/${tableInfo.id}`, 'PATCH', body);
                responseText = `Successfully updated table "${tableInfo.name}":\n`;
                if (name) responseText += `New name: ${result.name}\n`;
                if (description !== undefined) responseText += `New description: ${result.description || '(none)'}\n`;
              }
            }
          }
          
          else if (toolName === 'delete_table') {
            const { table, confirm } = toolParams;
            
            if (!confirm) {
              responseText = 'Table deletion requires confirm=true to proceed. This action cannot be undone!';
            } else {
              // Get table ID first
              const schemaResult = await callAirtableAPI(`meta/bases/${baseId}/tables`, 'GET');
              const tableInfo = schemaResult.tables.find(t => 
                t.name.toLowerCase() === table.toLowerCase() || t.id === table
              );
              
              if (!tableInfo) {
                responseText = `Table "${table}" not found.`;
              } else {
                result = await callAirtableAPI(`meta/bases/${baseId}/tables/${tableInfo.id}`, 'DELETE');
                responseText = `Successfully deleted table "${tableInfo.name}" (ID: ${tableInfo.id})\n`;
                responseText += 'All data in this table has been permanently removed.';
              }
            }
          }
          
          // Field Management Tools
          else if (toolName === 'create_field') {
            const { table, name, type, description, options } = toolParams;
            
            // Get table ID first
            const schemaResult = await callAirtableAPI(`meta/bases/${baseId}/tables`, 'GET');
            const tableInfo = schemaResult.tables.find(t => 
              t.name.toLowerCase() === table.toLowerCase() || t.id === table
            );
            
            if (!tableInfo) {
              responseText = `Table "${table}" not found.`;
            } else {
              const body = {
                name,
                type
              };
              
              if (description) body.description = description;
              if (options) body.options = options;
              
              result = await callAirtableAPI(`meta/bases/${baseId}/tables/${tableInfo.id}/fields`, 'POST', body);
              
              responseText = `Successfully created field "${name}" in table "${tableInfo.name}"\n`;
              responseText += `Field ID: ${result.id}\n`;
              responseText += `Type: ${result.type}\n`;
              if (result.description) {
                responseText += `Description: ${result.description}\n`;
              }
            }
          }
          
          else if (toolName === 'update_field') {
            const { table, fieldId, name, description, options } = toolParams;
            
            // Get table ID first
            const schemaResult = await callAirtableAPI(`meta/bases/${baseId}/tables`, 'GET');
            const tableInfo = schemaResult.tables.find(t => 
              t.name.toLowerCase() === table.toLowerCase() || t.id === table
            );
            
            if (!tableInfo) {
              responseText = `Table "${table}" not found.`;
            } else {
              const body = {};
              if (name) body.name = name;
              if (description !== undefined) body.description = description;
              if (options) body.options = options;
              
              if (Object.keys(body).length === 0) {
                responseText = 'No updates specified. Provide name, description, or options to update.';
              } else {
                result = await callAirtableAPI(`meta/bases/${baseId}/tables/${tableInfo.id}/fields/${fieldId}`, 'PATCH', body);
                responseText = `Successfully updated field in table "${tableInfo.name}":\n`;
                responseText += `Field: ${result.name} (${result.type})\n`;
                responseText += `ID: ${result.id}\n`;
                if (result.description) {
                  responseText += `Description: ${result.description}\n`;
                }
              }
            }
          }
          
          else if (toolName === 'delete_field') {
            const { table, fieldId, confirm } = toolParams;
            
            if (!confirm) {
              responseText = 'Field deletion requires confirm=true to proceed. This action cannot be undone!';
            } else {
              // Get table ID first
              const schemaResult = await callAirtableAPI(`meta/bases/${baseId}/tables`, 'GET');
              const tableInfo = schemaResult.tables.find(t => 
                t.name.toLowerCase() === table.toLowerCase() || t.id === table
              );
              
              if (!tableInfo) {
                responseText = `Table "${table}" not found.`;
              } else {
                result = await callAirtableAPI(`meta/bases/${baseId}/tables/${tableInfo.id}/fields/${fieldId}`, 'DELETE');
                responseText = `Successfully deleted field from table "${tableInfo.name}"\n`;
                responseText += 'All data in this field has been permanently removed.';
              }
            }
          }
          
          else if (toolName === 'list_field_types') {
            responseText = `Available Airtable Field Types:\n\n`;
            responseText += `Basic Fields:\n`;
            responseText += `• singleLineText - Single line text input\n`;
            responseText += `• multilineText - Multi-line text input\n`;
            responseText += `• richText - Rich text with formatting\n`;
            responseText += `• number - Number field with optional formatting\n`;
            responseText += `• percent - Percentage field\n`;
            responseText += `• currency - Currency field\n`;
            responseText += `• singleSelect - Single choice from predefined options\n`;
            responseText += `• multipleSelectionList - Multiple choices from predefined options\n`;
            responseText += `• date - Date field\n`;
            responseText += `• dateTime - Date and time field\n`;
            responseText += `• phoneNumber - Phone number field\n`;
            responseText += `• email - Email address field\n`;
            responseText += `• url - URL field\n`;
            responseText += `• checkbox - Checkbox (true/false)\n`;
            responseText += `• rating - Star rating field\n`;
            responseText += `• duration - Duration/time field\n\n`;
            responseText += `Advanced Fields:\n`;
            responseText += `• multipleAttachment - File attachments\n`;
            responseText += `• linkedRecord - Link to records in another table\n`;
            responseText += `• lookup - Lookup values from linked records\n`;
            responseText += `• rollup - Calculate values from linked records\n`;
            responseText += `• count - Count of linked records\n`;
            responseText += `• formula - Calculated field with formulas\n`;
            responseText += `• createdTime - Auto-timestamp when record created\n`;
            responseText += `• createdBy - Auto-user who created record\n`;
            responseText += `• lastModifiedTime - Auto-timestamp when record modified\n`;
            responseText += `• lastModifiedBy - Auto-user who last modified record\n`;
            responseText += `• autoNumber - Auto-incrementing number\n`;
            responseText += `• barcode - Barcode/QR code field\n`;
            responseText += `• button - Action button field\n`;
          }
          
          else if (toolName === 'get_table_views') {
            const { table } = toolParams;
            
            // Get table schema
            const schemaResult = await callAirtableAPI(`meta/bases/${baseId}/tables`, 'GET');
            const tableInfo = schemaResult.tables.find(t => 
              t.name.toLowerCase() === table.toLowerCase() || t.id === table
            );
            
            if (!tableInfo) {
              responseText = `Table "${table}" not found.`;
            } else {
              if (tableInfo.views && tableInfo.views.length > 0) {
                responseText = `Views for table "${tableInfo.name}" (${tableInfo.views.length}):\n\n`;
                tableInfo.views.forEach((view, index) => {
                  responseText += `${index + 1}. ${view.name}\n`;
                  responseText += `   Type: ${view.type}\n`;
                  responseText += `   ID: ${view.id}\n`;
                  if (view.visibleFieldIds && view.visibleFieldIds.length > 0) {
                    responseText += `   Visible fields: ${view.visibleFieldIds.length}\n`;
                  }
                  responseText += '\n';
                });
              } else {
                responseText = `No views found for table "${tableInfo.name}".`;
              }
            }
          }
          
          // NEW v1.6.0 TOOLS - Attachment and Batch Operations
          else if (toolName === 'upload_attachment') {
            const { table, recordId, fieldName, url, filename } = toolParams;
            
            const attachment = { url };
            if (filename) attachment.filename = filename;
            
            const updateBody = {
              fields: {
                [fieldName]: [attachment]
              }
            };
            
            result = await callAirtableAPI(`${table}/${recordId}`, 'PATCH', updateBody);
            
            responseText = `Successfully attached file to record ${recordId}:\n`;
            responseText += `Field: ${fieldName}\n`;
            responseText += `URL: ${url}\n`;
            if (filename) responseText += `Filename: ${filename}\n`;
          }
          
          else if (toolName === 'batch_create_records') {
            const { table, records } = toolParams;
            
            if (records.length > 10) {
              responseText = 'Error: Cannot create more than 10 records at once. Please split into smaller batches.';
            } else {
              const body = { records };
              result = await callAirtableAPI(table, 'POST', body);
              
              responseText = `Successfully created ${result.records.length} records:\n`;
              result.records.forEach((record, index) => {
                responseText += `${index + 1}. ID: ${record.id}\n`;
                const fields = Object.keys(record.fields);
                if (fields.length > 0) {
                  responseText += `   Fields: ${fields.join(', ')}\n`;
                }
              });
            }
          }
          
          else if (toolName === 'batch_update_records') {
            const { table, records } = toolParams;
            
            if (records.length > 10) {
              responseText = 'Error: Cannot update more than 10 records at once. Please split into smaller batches.';
            } else {
              const body = { records };
              result = await callAirtableAPI(table, 'PATCH', body);
              
              responseText = `Successfully updated ${result.records.length} records:\n`;
              result.records.forEach((record, index) => {
                responseText += `${index + 1}. ID: ${record.id}\n`;
                const fields = Object.keys(record.fields);
                if (fields.length > 0) {
                  responseText += `   Updated fields: ${fields.join(', ')}\n`;
                }
              });
            }
          }
          
          else if (toolName === 'batch_delete_records') {
            const { table, recordIds } = toolParams;
            
            if (recordIds.length > 10) {
              responseText = 'Error: Cannot delete more than 10 records at once. Please split into smaller batches.';
            } else {
              const queryParams = { records: recordIds };
              result = await callAirtableAPI(table, 'DELETE', null, queryParams);
              
              responseText = `Successfully deleted ${result.records.length} records:\n`;
              result.records.forEach((record, index) => {
                responseText += `${index + 1}. Deleted ID: ${record.id}\n`;
              });
            }
          }
          
          else if (toolName === 'batch_upsert_records') {
            const { table, records, keyFields } = toolParams;
            
            if (records.length > 10) {
              responseText = 'Error: Cannot upsert more than 10 records at once. Please split into smaller batches.';
            } else {
              // For simplicity, we'll implement this as a batch create with merge fields
              // Note: Real upsert requires checking existing records first
              const body = {
                records,
                performUpsert: {
                  fieldsToMergeOn: keyFields
                }
              };
              
              result = await callAirtableAPI(table, 'PATCH', body);
              
              responseText = `Successfully upserted ${result.records.length} records:\n`;
              result.records.forEach((record, index) => {
                responseText += `${index + 1}. ID: ${record.id}\n`;
                const fields = Object.keys(record.fields);
                if (fields.length > 0) {
                  responseText += `   Fields: ${fields.join(', ')}\n`;
                }
              });
            }
          }
          
          // NEW v1.6.0 TOOLS - Advanced View Management
          else if (toolName === 'create_view') {
            const { table, name, type, visibleFieldIds, fieldOrder } = toolParams;
            
            // Get table ID first
            const schemaResult = await callAirtableAPI(`meta/bases/${baseId}/tables`, 'GET');
            const tableInfo = schemaResult.tables.find(t => 
              t.name.toLowerCase() === table.toLowerCase() || t.id === table
            );
            
            if (!tableInfo) {
              responseText = `Table "${table}" not found.`;
            } else {
              const body = {
                name,
                type
              };
              
              if (visibleFieldIds) body.visibleFieldIds = visibleFieldIds;
              if (fieldOrder) body.fieldOrder = fieldOrder;
              
              result = await callAirtableAPI(`meta/bases/${baseId}/tables/${tableInfo.id}/views`, 'POST', body);
              
              responseText = `Successfully created view "${name}" in table "${tableInfo.name}":\n`;
              responseText += `View ID: ${result.id}\n`;
              responseText += `Type: ${result.type}\n`;
              if (result.visibleFieldIds && result.visibleFieldIds.length > 0) {
                responseText += `Visible fields: ${result.visibleFieldIds.length}\n`;
              }
            }
          }
          
          else if (toolName === 'get_view_metadata') {
            const { table, viewId } = toolParams;
            
            // Get table ID first
            const schemaResult = await callAirtableAPI(`meta/bases/${baseId}/tables`, 'GET');
            const tableInfo = schemaResult.tables.find(t => 
              t.name.toLowerCase() === table.toLowerCase() || t.id === table
            );
            
            if (!tableInfo) {
              responseText = `Table "${table}" not found.`;
            } else {
              result = await callAirtableAPI(`meta/bases/${baseId}/tables/${tableInfo.id}/views/${viewId}`, 'GET');
              
              responseText = `View Metadata: ${result.name}\n`;
              responseText += `ID: ${result.id}\n`;
              responseText += `Type: ${result.type}\n`;
              
              if (result.visibleFieldIds && result.visibleFieldIds.length > 0) {
                responseText += `\nVisible Fields (${result.visibleFieldIds.length}):\n`;
                result.visibleFieldIds.forEach((fieldId, index) => {
                  responseText += `${index + 1}. ${fieldId}\n`;
                });
              }
              
              if (result.filterByFormula) {
                responseText += `\nFilter Formula: ${result.filterByFormula}\n`;
              }
              
              if (result.sorts && result.sorts.length > 0) {
                responseText += `\nSort Configuration:\n`;
                result.sorts.forEach((sort, index) => {
                  responseText += `${index + 1}. Field: ${sort.field}, Direction: ${sort.direction}\n`;
                });
              }
            }
          }
          
          // NEW v1.6.0 TOOLS - Base Management
          else if (toolName === 'create_base') {
            const { name, workspaceId, tables } = toolParams;
            
            const body = {
              name,
              tables: tables.map(table => ({
                name: table.name,
                description: table.description,
                fields: table.fields
              }))
            };
            
            if (workspaceId) {
              body.workspaceId = workspaceId;
            }
            
            result = await callAirtableAPI('meta/bases', 'POST', body);
            
            responseText = `Successfully created base "${name}":\n`;
            responseText += `Base ID: ${result.id}\n`;
            if (result.tables && result.tables.length > 0) {
              responseText += `\nTables created (${result.tables.length}):\n`;
              result.tables.forEach((table, index) => {
                responseText += `${index + 1}. ${table.name} (ID: ${table.id})\n`;
                if (table.fields && table.fields.length > 0) {
                  responseText += `   Fields: ${table.fields.length}\n`;
                }
              });
            }
          }
          
          else if (toolName === 'list_collaborators') {
            const { baseId: targetBaseId } = toolParams;
            const targetId = targetBaseId || baseId;
            
            result = await callAirtableAPI(`meta/bases/${targetId}/collaborators`, 'GET');
            
            if (result.collaborators && result.collaborators.length > 0) {
              responseText = `Base collaborators (${result.collaborators.length}):\n\n`;
              result.collaborators.forEach((collaborator, index) => {
                responseText += `${index + 1}. ${collaborator.email || collaborator.name || 'Unknown'}\n`;
                responseText += `   Permission: ${collaborator.permissionLevel || 'Unknown'}\n`;
                responseText += `   Type: ${collaborator.type || 'User'}\n`;
                if (collaborator.userId) {
                  responseText += `   User ID: ${collaborator.userId}\n`;
                }
                responseText += '\n';
              });
            } else {
              responseText = 'No collaborators found for this base.';
            }
          }
          
          else if (toolName === 'list_shares') {
            const { baseId: targetBaseId } = toolParams;
            const targetId = targetBaseId || baseId;
            
            result = await callAirtableAPI(`meta/bases/${targetId}/shares`, 'GET');
            
            if (result.shares && result.shares.length > 0) {
              responseText = `Shared views (${result.shares.length}):\n\n`;
              result.shares.forEach((share, index) => {
                responseText += `${index + 1}. ${share.name || 'Unnamed Share'}\n`;
                responseText += `   Share ID: ${share.id}\n`;
                responseText += `   URL: ${share.url}\n`;
                responseText += `   Type: ${share.type || 'View'}\n`;
                if (share.viewId) {
                  responseText += `   View ID: ${share.viewId}\n`;
                }
                if (share.tableId) {
                  responseText += `   Table ID: ${share.tableId}\n`;
                }
                responseText += `   Effective: ${share.effective ? 'Yes' : 'No'}\n`;
                responseText += '\n';
              });
            } else {
              responseText = 'No shared views found for this base.';
            }
          }
          
          else {
            throw new Error(`Unknown tool: ${toolName}`);
          }
          
          const response = {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              content: [
                {
                  type: 'text',
                  text: responseText
                }
              ]
            }
          };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
          
        } catch (error) {
          log(LOG_LEVELS.ERROR, `Tool ${toolName} error:`, error.message);
          
          const response = {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              content: [
                {
                  type: 'text',
                  text: `Error executing ${toolName}: ${error.message}`
                }
              ]
            }
          };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
        }
        
        return;
      }
      
      // Method not found
      const response = {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32601,
          message: `Method ${request.method} not found`
        }
      };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
      
    } catch (error) {
      log(LOG_LEVELS.ERROR, 'Error processing request:', error);
      const response = {
        jsonrpc: '2.0',
        id: request.id || null,
        error: {
          code: -32000,
          message: error.message || 'Unknown error'
        }
      };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    }
  });
});

// Start server
const PORT = process.env.PORT || 8010;
server.listen(PORT, () => {
  log(LOG_LEVELS.INFO, `Enhanced Airtable MCP server v1.4.0 running at http://localhost:${PORT}/mcp`);
  console.log(`For Claude, use this URL: http://localhost:${PORT}/mcp`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  log(LOG_LEVELS.INFO, 'Shutting down server...');
  server.close(() => {
    log(LOG_LEVELS.INFO, 'Server stopped');
    process.exit(0);
  });
});
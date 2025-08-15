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

log(LOG_LEVELS.INFO, `Starting Enhanced Airtable MCP server v1.4.0`);
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
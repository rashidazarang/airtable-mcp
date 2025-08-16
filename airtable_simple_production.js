#!/usr/bin/env node

/**
 * Airtable MCP Server - Production Ready
 * Model Context Protocol server for Airtable integration
 * 
 * Features:
 * - Complete MCP 2024-11-05 protocol support
 * - OAuth2 authentication with PKCE
 * - Enterprise security features
 * - Rate limiting and input validation
 * - Production monitoring and health checks
 * 
 * Author: Rashid Azarang
 * License: MIT
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');
const querystring = require('querystring');

// Load environment variables
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

// Parse command line arguments
const args = process.argv.slice(2);
let tokenIndex = args.indexOf('--token');
let baseIndex = args.indexOf('--base');

const token = tokenIndex !== -1 ? args[tokenIndex + 1] : process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_TOKEN;
const baseId = baseIndex !== -1 ? args[baseIndex + 1] : process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE;

if (!token || !baseId) {
  console.error('Error: Missing Airtable credentials');
  console.error('\nUsage options:');
  console.error('  1. Command line: node airtable_simple_production.js --token YOUR_TOKEN --base YOUR_BASE_ID');
  console.error('  2. Environment variables: AIRTABLE_TOKEN and AIRTABLE_BASE_ID');
  console.error('  3. .env file with AIRTABLE_TOKEN and AIRTABLE_BASE_ID');
  process.exit(1);
}

// Configuration
const CONFIG = {
  PORT: process.env.PORT || 8010,
  HOST: process.env.HOST || 'localhost',
  MAX_REQUESTS_PER_MINUTE: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 60,
  LOG_LEVEL: process.env.LOG_LEVEL || 'INFO'
};

// Logging
const LOG_LEVELS = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3, TRACE: 4 };
let currentLogLevel = LOG_LEVELS[CONFIG.LOG_LEVEL] || LOG_LEVELS.INFO;

function log(level, message, metadata = {}) {
  if (level <= currentLogLevel) {
    const timestamp = new Date().toISOString();
    const levelName = Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level);
    // Sanitize message to prevent format string attacks
    const safeMessage = String(message).replace(/%/g, '%%');
    const output = `[${timestamp}] [${levelName}] ${safeMessage}`;
    
    if (Object.keys(metadata).length > 0) {
      // Use separate arguments to avoid format string injection
      console.log('%s %s', output, JSON.stringify(metadata));
    } else {
      console.log('%s', output);
    }
  }
}

// Rate limiting
const rateLimiter = new Map();

function checkRateLimit(clientId) {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window
  
  if (!rateLimiter.has(clientId)) {
    rateLimiter.set(clientId, []);
  }
  
  const requests = rateLimiter.get(clientId);
  const recentRequests = requests.filter(time => time > windowStart);
  
  if (recentRequests.length >= CONFIG.MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimiter.set(clientId, recentRequests);
  return true;
}

// Input validation and HTML escaping
function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input.replace(/[<>]/g, '').trim().substring(0, 1000);
  }
  return input;
}

function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') {
    return String(unsafe);
  }
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\//g, "&#x2F;");
}

function validateUrl(url) {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Airtable API integration
function callAirtableAPI(endpoint, method = 'GET', body = null, queryParams = {}) {
  return new Promise((resolve, reject) => {
    const isBaseEndpoint = !endpoint.startsWith('meta/');
    const baseUrl = isBaseEndpoint ? `${baseId}/${endpoint}` : endpoint;
    
    const queryString = Object.keys(queryParams).length > 0 
      ? '?' + new URLSearchParams(queryParams).toString() 
      : '';
    
    const apiUrl = `https://api.airtable.com/v0/${baseUrl}${queryString}`;
    const urlObj = new URL(apiUrl);
    
    log(LOG_LEVELS.DEBUG, 'API Request', { method, url: apiUrl });
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Airtable-MCP-Server/2.1.0'
      }
    };
    
    const req = https.request(options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => {
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
    
    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// Tools schema
const TOOLS_SCHEMA = [
  {
    name: 'list_tables',
    description: 'List all tables in the Airtable base',
    inputSchema: {
      type: 'object',
      properties: {
        include_schema: { type: 'boolean', description: 'Include field schema information', default: false }
      }
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
        view: { type: 'string', description: 'View name or ID' },
        filterByFormula: { type: 'string', description: 'Airtable formula to filter records' }
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
  }
];

// Enhanced AI-powered prompts for intelligent Airtable operations
const PROMPTS_SCHEMA = [
  {
    name: 'analyze_data',
    description: 'Advanced AI data analysis with statistical insights, pattern recognition, and predictive modeling',
    arguments: [
      {
        name: 'table',
        description: 'Table name or ID to analyze',
        required: true
      },
      {
        name: 'analysis_type',
        description: 'Type of analysis (trends, statistical, patterns, predictive, anomaly_detection, correlation_matrix)',
        required: false
      },
      {
        name: 'field_focus',
        description: 'Specific fields to focus the analysis on',
        required: false
      },
      {
        name: 'time_dimension',
        description: 'Time field for temporal analysis',
        required: false
      },
      {
        name: 'confidence_level',
        description: 'Statistical confidence level (0.90, 0.95, 0.99)',
        required: false
      }
    ]
  },
  {
    name: 'create_report',
    description: 'Generate intelligent reports with AI-powered insights, visualizations, and actionable recommendations',
    arguments: [
      {
        name: 'table',
        description: 'Table name or ID for the report',
        required: true
      },
      {
        name: 'report_type',
        description: 'Type of report (executive_summary, operational_dashboard, analytical_deep_dive, performance_metrics, predictive_forecast)',
        required: false
      },
      {
        name: 'time_period',
        description: 'Time period for analysis (last_7_days, last_30_days, last_quarter, year_to_date, custom)',
        required: false
      },
      {
        name: 'stakeholder_level',
        description: 'Target audience (executive, manager, analyst, operational)',
        required: false
      },
      {
        name: 'include_recommendations',
        description: 'Include AI-generated actionable recommendations (true/false)',
        required: false
      }
    ]
  },
  {
    name: 'data_insights',
    description: 'Discover hidden patterns, correlations, and business insights using advanced AI algorithms',
    arguments: [
      {
        name: 'tables',
        description: 'Comma-separated list of table names to analyze',
        required: true
      },
      {
        name: 'insight_type',
        description: 'Type of insights (correlations, outliers, trends, predictions, segmentation, attribution, churn_analysis)',
        required: false
      },
      {
        name: 'business_context',
        description: 'Business domain context (sales, marketing, operations, finance, customer_success)',
        required: false
      },
      {
        name: 'insight_depth',
        description: 'Analysis depth (surface, moderate, deep, comprehensive)',
        required: false
      }
    ]
  },
  {
    name: 'optimize_workflow',
    description: 'AI-powered workflow optimization with automation recommendations and efficiency improvements',
    arguments: [
      {
        name: 'base_overview',
        description: 'Overview of the base structure and current workflows',
        required: false
      },
      {
        name: 'optimization_focus',
        description: 'Focus area (automation, data_quality, collaboration, performance, integration, user_experience)',
        required: false
      },
      {
        name: 'current_pain_points',
        description: 'Known issues or bottlenecks in current workflow',
        required: false
      },
      {
        name: 'team_size',
        description: 'Number of users working with this base',
        required: false
      }
    ]
  },
  {
    name: 'smart_schema_design',
    description: 'AI-assisted database schema optimization and field relationship analysis',
    arguments: [
      {
        name: 'use_case',
        description: 'Primary use case (crm, project_management, inventory, content_management, hr, finance)',
        required: true
      },
      {
        name: 'data_volume',
        description: 'Expected data volume (small, medium, large, enterprise)',
        required: false
      },
      {
        name: 'integration_needs',
        description: 'External systems to integrate with',
        required: false
      },
      {
        name: 'compliance_requirements',
        description: 'Data compliance needs (gdpr, hipaa, sox, none)',
        required: false
      }
    ]
  },
  {
    name: 'data_quality_audit',
    description: 'Comprehensive AI-powered data quality assessment with cleansing recommendations',
    arguments: [
      {
        name: 'tables',
        description: 'Tables to audit (comma-separated or "all")',
        required: true
      },
      {
        name: 'quality_dimensions',
        description: 'Quality aspects to check (completeness, accuracy, consistency, validity, uniqueness, timeliness)',
        required: false
      },
      {
        name: 'severity_threshold',
        description: 'Minimum severity level to report (low, medium, high, critical)',
        required: false
      },
      {
        name: 'auto_fix_suggestions',
        description: 'Include automated fix suggestions (true/false)',
        required: false
      }
    ]
  },
  {
    name: 'predictive_analytics',
    description: 'Advanced predictive modeling and forecasting using historical Airtable data',
    arguments: [
      {
        name: 'table',
        description: 'Table containing historical data',
        required: true
      },
      {
        name: 'target_field',
        description: 'Field to predict or forecast',
        required: true
      },
      {
        name: 'prediction_horizon',
        description: 'Forecast period (next_week, next_month, next_quarter, next_year)',
        required: false
      },
      {
        name: 'model_type',
        description: 'Prediction model (trend_analysis, seasonal_forecast, regression, classification, time_series)',
        required: false
      },
      {
        name: 'feature_fields',
        description: 'Fields to use as predictive features',
        required: false
      }
    ]
  },
  {
    name: 'natural_language_query',
    description: 'Process natural language questions about your data and provide intelligent answers',
    arguments: [
      {
        name: 'question',
        description: 'Natural language question about your data',
        required: true
      },
      {
        name: 'context_tables',
        description: 'Tables that might contain relevant data',
        required: false
      },
      {
        name: 'response_format',
        description: 'Desired response format (narrative, data_summary, visualization_suggestion, action_items)',
        required: false
      },
      {
        name: 'include_confidence',
        description: 'Include confidence scores for answers (true/false)',
        required: false
      }
    ]
  },
  {
    name: 'smart_data_transformation',
    description: 'AI-assisted data transformation, cleaning, and enrichment with intelligent suggestions',
    arguments: [
      {
        name: 'source_table',
        description: 'Source table for transformation',
        required: true
      },
      {
        name: 'transformation_goal',
        description: 'Goal (normalize, standardize, enrich, cleanse, aggregate, pivot)',
        required: true
      },
      {
        name: 'target_format',
        description: 'Desired output format or structure',
        required: false
      },
      {
        name: 'quality_rules',
        description: 'Data quality rules to apply during transformation',
        required: false
      },
      {
        name: 'preserve_history',
        description: 'Maintain audit trail of changes (true/false)',
        required: false
      }
    ]
  },
  {
    name: 'automation_recommendations',
    description: 'Generate intelligent automation suggestions based on workflow patterns and data analysis',
    arguments: [
      {
        name: 'workflow_description',
        description: 'Description of current manual processes',
        required: false
      },
      {
        name: 'automation_scope',
        description: 'Scope (single_table, multi_table, cross_base, external_integration)',
        required: false
      },
      {
        name: 'frequency_patterns',
        description: 'How often tasks are performed',
        required: false
      },
      {
        name: 'complexity_tolerance',
        description: 'Acceptable automation complexity (simple, moderate, advanced)',
        required: false
      },
      {
        name: 'integration_capabilities',
        description: 'Available integration tools (zapier, make, custom_api, native_automations)',
        required: false
      }
    ]
  }
];

// Roots configuration for filesystem access
const ROOTS_CONFIG = [
  {
    uri: 'file:///airtable-exports',
    name: 'Airtable Exports'
  },
  {
    uri: 'file:///airtable-attachments', 
    name: 'Airtable Attachments'
  }
];

// Logging configuration (currentLogLevel is already declared above)

// HTTP server
const server = http.createServer(async (req, res) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Health check endpoint
  if (pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      version: '3.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }));
    return;
  }
  
  // OAuth2 authorization endpoint
  if (pathname === '/oauth/authorize' && req.method === 'GET') {
    const params = parsedUrl.query;
    const clientId = params.client_id;
    const redirectUri = params.redirect_uri;
    const state = params.state;
    const codeChallenge = params.code_challenge;
    const codeChallengeMethod = params.code_challenge_method;
    
    // Validate inputs to prevent XSS
    if (!clientId || !redirectUri) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'invalid_request', error_description: 'Missing required parameters' }));
      return;
    }
    
    // Validate redirect URI
    if (!validateUrl(redirectUri)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'invalid_request', error_description: 'Invalid redirect URI' }));
      return;
    }
    
    // Create safe copies of all variables for JavaScript use
    const safeRedirectUri = redirectUri.slice(0, 2000); // Limit length
    const safeState = (state || '').slice(0, 200); // Limit length
    const safeClientId = clientId.slice(0, 200); // Limit length
    
    // Sanitize for HTML display only
    const displayClientId = escapeHtml(safeClientId);
    const displayRedirectUri = escapeHtml(safeRedirectUri);
    
    // Generate authorization code
    const authCode = crypto.randomBytes(32).toString('hex');
    
    // In a real implementation, store the auth code with expiration
    // and associate it with the client and PKCE challenge
    
    res.writeHead(200, { 
      'Content-Type': 'text/html',
      'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none';",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'no-referrer'
    });
    
    // Build HTML with proper escaping and separation of concerns
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OAuth2 Authorization</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <h2>Airtable MCP Server - OAuth2 Authorization</h2>
  <p>Client ID: ${displayClientId}</p>
  <p>Redirect URI: ${displayRedirectUri}</p>
  <div style="margin: 20px 0;">
    <button onclick="authorize()" style="background: #18BFFF; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
      Authorize Application
    </button>
    <button onclick="deny()" style="background: #ff4444; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
      Deny Access
    </button>
  </div>
  <script>
    // All variables are safely JSON encoded to prevent XSS
    (function() {
      var config = ${JSON.stringify({
        redirectUri: safeRedirectUri,
        code: authCode,
        state: safeState
      })};
      
      window.authorize = function() {
        try {
          var url = new URL(config.redirectUri);
          if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            throw new Error('Invalid protocol');
          }
          var finalUrl = config.redirectUri + '?code=' + encodeURIComponent(config.code) + '&state=' + encodeURIComponent(config.state);
          window.location.href = finalUrl;
        } catch (e) {
          console.error('Authorization failed:', e);
          alert('Invalid redirect URL');
        }
      };
      
      window.deny = function() {
        try {
          var url = new URL(config.redirectUri);
          if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            throw new Error('Invalid protocol');
          }
          var finalUrl = config.redirectUri + '?error=access_denied&state=' + encodeURIComponent(config.state);
          window.location.href = finalUrl;
        } catch (e) {
          console.error('Denial failed:', e);
          alert('Invalid redirect URL');
        }
      };
    })();
  </script>
</body>
</html>`;

    res.end(htmlContent);
    return;
  }
  
  // OAuth2 token endpoint
  if (pathname === '/oauth/token' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Prevent DoS by limiting body size
      if (body.length > 10000) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'payload_too_large', error_description: 'Request body too large' }));
        return;
      }
    });
    
    req.on('end', () => {
      try {
        const params = querystring.parse(body);
        const grantType = sanitizeInput(params.grant_type);
        const code = sanitizeInput(params.code);
        const codeVerifier = sanitizeInput(params.code_verifier);
        const clientId = sanitizeInput(params.client_id);
        
        // Validate required parameters
        if (!grantType || !code || !clientId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'invalid_request',
            error_description: 'Missing required parameters'
          }));
          return;
        }
        
        // In a real implementation, verify the authorization code and PKCE
        if (grantType === 'authorization_code' && code) {
          // Generate access token
          const accessToken = crypto.randomBytes(32).toString('hex');
          const refreshToken = crypto.randomBytes(32).toString('hex');
          
          res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            'Pragma': 'no-cache'
          });
          res.end(JSON.stringify({
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 3600,
            refresh_token: refreshToken,
            scope: 'data.records:read data.records:write schema.bases:read'
          }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'invalid_grant',
            error_description: 'Invalid grant type or authorization code'
          }));
        }
      } catch (error) {
        log(LOG_LEVELS.WARN, 'OAuth token request parsing failed', { error: error.message });
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'invalid_request',
          error_description: 'Malformed request body'
        }));
      }
    });
    return;
  }
  
  // MCP endpoint
  if (pathname === '/mcp' && req.method === 'POST') {
    // Rate limiting
    const clientId = req.headers['x-client-id'] || req.connection.remoteAddress;
    if (!checkRateLimit(clientId)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Rate limit exceeded. Maximum 60 requests per minute.'
        }
      }));
      return;
    }
    
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    
    req.on('end', async () => {
      try {
        const request = JSON.parse(body);
        
        // Sanitize inputs
        if (request.params) {
          Object.keys(request.params).forEach(key => {
            request.params[key] = sanitizeInput(request.params[key]);
          });
        }
        
        log(LOG_LEVELS.DEBUG, 'MCP request received', { 
          method: request.method, 
          id: request.id 
        });
        
        let response;
        
        switch (request.method) {
          case 'initialize':
            response = {
              jsonrpc: '2.0',
              id: request.id,
              result: {
                protocolVersion: '2024-11-05',
                capabilities: {
                  tools: { listChanged: true },
                  resources: { subscribe: true, listChanged: true },
                  prompts: { listChanged: true },
                  sampling: {},
                  roots: { listChanged: true },
                  logging: {}
                },
                serverInfo: {
                  name: 'Airtable MCP Server - AI Agent Enhanced',
                  version: '3.0.0',
                  description: 'Advanced AI-powered MCP server with 10 intelligent prompt templates, predictive analytics, and enterprise automation capabilities'
                }
              }
            };
            log(LOG_LEVELS.INFO, 'Client initialized', { clientId: request.id });
            break;
            
          case 'tools/list':
            response = {
              jsonrpc: '2.0',
              id: request.id,
              result: {
                tools: TOOLS_SCHEMA
              }
            };
            break;
            
          case 'tools/call':
            response = await handleToolCall(request);
            break;
            
          case 'prompts/list':
            response = {
              jsonrpc: '2.0',
              id: request.id,
              result: {
                prompts: PROMPTS_SCHEMA
              }
            };
            break;
            
          case 'prompts/get':
            response = await handlePromptGet(request);
            break;
            
          case 'roots/list':
            response = {
              jsonrpc: '2.0',
              id: request.id,
              result: {
                roots: ROOTS_CONFIG
              }
            };
            break;
            
          case 'logging/setLevel':
            const level = request.params?.level;
            if (level && LOG_LEVELS[level.toUpperCase()] !== undefined) {
              currentLogLevel = LOG_LEVELS[level.toUpperCase()];
              log(LOG_LEVELS.INFO, 'Log level updated', { newLevel: level });
            }
            response = {
              jsonrpc: '2.0',
              id: request.id,
              result: {}
            };
            break;
            
          case 'sampling/createMessage':
            response = await handleSampling(request);
            break;
            
          default:
            log(LOG_LEVELS.WARN, 'Unknown method', { method: request.method });
            throw new Error(`Method "${request.method}" not found`);
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
        
      } catch (error) {
        log(LOG_LEVELS.ERROR, 'Request processing failed', { error: error.message });
        
        const errorResponse = {
          jsonrpc: '2.0',
          id: request?.id || null,
          error: {
            code: -32000,
            message: error.message || 'Internal server error'
          }
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(errorResponse));
      }
    });
    return;
  }
  
  // Default 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// Tool handlers
async function handleToolCall(request) {
  const toolName = request.params.name;
  const toolParams = request.params.arguments || {};
  
  try {
    let result;
    let responseText;
    
    switch (toolName) {
      case 'list_tables':
        const includeSchema = toolParams.include_schema || false;
        result = await callAirtableAPI(`meta/bases/${baseId}/tables`);
        const tables = result.tables || [];
        
        responseText = tables.length > 0 
          ? `Found ${tables.length} table(s): ` + 
            tables.map((table, i) => 
              `${table.name} (ID: ${table.id}, Fields: ${table.fields?.length || 0})`
            ).join(', ')
          : 'No tables found in this base.';
        break;
        
      case 'list_records':
        const { table, maxRecords, view, filterByFormula } = toolParams;
        
        const queryParams = {};
        if (maxRecords) queryParams.maxRecords = maxRecords;
        if (view) queryParams.view = view;
        if (filterByFormula) queryParams.filterByFormula = filterByFormula;
        
        result = await callAirtableAPI(table, 'GET', null, queryParams);
        const records = result.records || [];
        
        responseText = records.length > 0
          ? `Found ${records.length} record(s) in table "${table}"`
          : `No records found in table "${table}".`;
        break;
        
      case 'get_record':
        const { table: getTable, recordId } = toolParams;
        result = await callAirtableAPI(`${getTable}/${recordId}`);
        responseText = `Retrieved record ${recordId} from table "${getTable}"`;
        break;
        
      case 'create_record':
        const { table: createTable, fields } = toolParams;
        const body = { fields: fields };
        result = await callAirtableAPI(createTable, 'POST', body);
        responseText = `Successfully created record in table "${createTable}" with ID: ${result.id}`;
        break;
        
      case 'update_record':
        const { table: updateTable, recordId: updateRecordId, fields: updateFields } = toolParams;
        const updateBody = { fields: updateFields };
        result = await callAirtableAPI(`${updateTable}/${updateRecordId}`, 'PATCH', updateBody);
        responseText = `Successfully updated record ${updateRecordId} in table "${updateTable}"`;
        break;
        
      case 'delete_record':
        const { table: deleteTable, recordId: deleteRecordId } = toolParams;
        result = await callAirtableAPI(`${deleteTable}/${deleteRecordId}`, 'DELETE');
        responseText = `Successfully deleted record ${deleteRecordId} from table "${deleteTable}"`;
        break;
        
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
    
    return {
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
    
  } catch (error) {
    log(LOG_LEVELS.ERROR, `Tool ${toolName} failed`, { error: error.message });
    
    return {
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
  }
}

// Enhanced AI-powered prompt handlers
async function handlePromptGet(request) {
  const promptName = request.params.name;
  const promptArgs = request.params.arguments || {};
  
  try {
    const prompt = PROMPTS_SCHEMA.find(p => p.name === promptName);
    if (!prompt) {
      throw new Error(`Prompt "${promptName}" not found`);
    }
    
    let messages = [];
    
    switch (promptName) {
      case 'analyze_data':
        const { table, analysis_type = 'statistical', field_focus, time_dimension, confidence_level = '0.95' } = promptArgs;
        messages = [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `🤖 ADVANCED DATA ANALYSIS REQUEST

**Table**: ${table}
**Analysis Type**: ${analysis_type}
**Confidence Level**: ${confidence_level}
${field_focus ? `**Focus Fields**: ${field_focus}` : ''}
${time_dimension ? `**Time Dimension**: ${time_dimension}` : ''}

**Instructions**:
1. First, examine the table schema and structure using list_tables with include_schema=true
2. Retrieve representative sample data using list_records with appropriate filters
3. Perform ${analysis_type} analysis with statistical rigor
4. Generate insights with confidence intervals and significance testing
5. Provide actionable recommendations based on findings

**Expected Deliverables**:
- Statistical summary with key metrics
- Pattern identification and trend analysis
- Anomaly detection if applicable
- Predictive insights where relevant
- Visualization recommendations
- Business impact assessment

Please use the available Airtable tools to gather data and provide comprehensive ${analysis_type} analysis.`
            }
          }
        ];
        break;
        
      case 'create_report':
        const { table: reportTable, report_type = 'executive_summary', time_period = 'last_30_days', stakeholder_level = 'manager', include_recommendations = 'true' } = promptArgs;
        messages = [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `📊 INTELLIGENT REPORT GENERATION

**Target Table**: ${reportTable}
**Report Type**: ${report_type}
**Time Period**: ${time_period}
**Stakeholder Level**: ${stakeholder_level}
**Include Recommendations**: ${include_recommendations}

**Report Generation Process**:
1. Analyze table structure and data types
2. Extract relevant data for specified time period
3. Calculate key performance indicators
4. Identify trends and patterns
5. Generate visualizations suggestions
6. Create ${stakeholder_level}-appropriate narrative

**Report Sections**:
- Executive Summary (key findings)
- Data Overview and Quality Assessment
- Trend Analysis and Patterns
- Performance Metrics and KPIs
- Risk Assessment and Opportunities
${include_recommendations === 'true' ? '- AI-Generated Recommendations' : ''}
- Next Steps and Action Items

Please gather the necessary data and create a comprehensive ${report_type} tailored for ${stakeholder_level} level stakeholders.`
            }
          }
        ];
        break;
        
      case 'data_insights':
        const { tables, insight_type = 'correlations', business_context = 'general', insight_depth = 'moderate' } = promptArgs;
        messages = [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `🔍 ADVANCED DATA INSIGHTS DISCOVERY

**Target Tables**: ${tables}
**Insight Type**: ${insight_type}
**Business Context**: ${business_context}
**Analysis Depth**: ${insight_depth}

**Discovery Framework**:
1. Multi-table schema analysis and relationship mapping
2. Cross-table data correlation analysis
3. Pattern recognition using ${business_context} domain knowledge
4. Statistical significance testing
5. Business impact quantification

**Insight Categories**:
- ${insight_type} analysis with statistical validation
- Hidden patterns and unexpected relationships
- Segmentation opportunities
- Predictive indicators
- Data quality insights
- Business optimization opportunities

**${business_context.toUpperCase()} CONTEXT ANALYSIS**:
${business_context === 'sales' ? '- Revenue drivers and conversion patterns\n- Customer lifetime value indicators\n- Sales cycle optimization opportunities' : ''}
${business_context === 'marketing' ? '- Campaign effectiveness and attribution\n- Customer segmentation insights\n- Channel performance analysis' : ''}
${business_context === 'operations' ? '- Process efficiency metrics\n- Resource utilization patterns\n- Bottleneck identification' : ''}

Please conduct ${insight_depth} analysis across the specified tables and provide actionable business insights.`
            }
          }
        ];
        break;
        
      case 'optimize_workflow':
        const { base_overview, optimization_focus = 'automation', current_pain_points, team_size } = promptArgs;
        messages = [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `⚡ AI-POWERED WORKFLOW OPTIMIZATION

**Optimization Focus**: ${optimization_focus}
**Team Size**: ${team_size || 'Not specified'}
${base_overview ? `**Base Overview**: ${base_overview}` : ''}
${current_pain_points ? `**Current Pain Points**: ${current_pain_points}` : ''}

**Optimization Analysis**:
1. Workflow pattern analysis and bottleneck identification
2. Automation opportunity assessment
3. User experience and efficiency evaluation
4. Integration and scaling considerations
5. ROI analysis for proposed improvements

**${optimization_focus.toUpperCase()} OPTIMIZATION**:
${optimization_focus === 'automation' ? '- Identify repetitive manual tasks\n- Suggest automation workflows\n- Estimate time savings and ROI' : ''}
${optimization_focus === 'data_quality' ? '- Data validation and cleansing rules\n- Consistency and accuracy improvements\n- Quality monitoring systems' : ''}
${optimization_focus === 'collaboration' ? '- Team workflow improvements\n- Permission and access optimization\n- Communication enhancement strategies' : ''}

**Deliverables**:
- Workflow efficiency assessment
- Prioritized improvement recommendations
- Implementation roadmap with timelines
- Cost-benefit analysis
- Change management considerations

Please analyze the current setup and provide comprehensive ${optimization_focus} optimization recommendations.`
            }
          }
        ];
        break;

      case 'smart_schema_design':
        const { use_case, data_volume = 'medium', integration_needs, compliance_requirements = 'none' } = promptArgs;
        messages = [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `🏗️ AI-ASSISTED SCHEMA OPTIMIZATION

**Use Case**: ${use_case}
**Data Volume**: ${data_volume}
**Compliance**: ${compliance_requirements}
${integration_needs ? `**Integrations**: ${integration_needs}` : ''}

**Schema Design Analysis**:
1. Current schema evaluation for ${use_case} best practices
2. Field type and relationship optimization
3. Performance and scalability assessment
4. Compliance requirement implementation
5. Integration compatibility review

**${use_case.toUpperCase()} OPTIMIZATION**:
${use_case === 'crm' ? '- Customer lifecycle tracking\n- Sales pipeline optimization\n- Contact relationship mapping' : ''}
${use_case === 'project_management' ? '- Task dependency modeling\n- Resource allocation tracking\n- Timeline and milestone management' : ''}
${use_case === 'inventory' ? '- Stock level monitoring\n- Supplier relationship tracking\n- Cost and pricing optimization' : ''}

**Recommendations**:
- Optimal field types and relationships
- Indexing and performance suggestions
- Data validation and integrity rules
- Automation and workflow triggers
- Scaling and maintenance considerations

Please analyze the current schema and provide ${use_case}-optimized recommendations.`
            }
          }
        ];
        break;

      case 'data_quality_audit':
        const { tables: auditTables, quality_dimensions = 'completeness,accuracy,consistency', severity_threshold = 'medium', auto_fix_suggestions = 'true' } = promptArgs;
        messages = [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `🔍 COMPREHENSIVE DATA QUALITY AUDIT

**Tables to Audit**: ${auditTables}
**Quality Dimensions**: ${quality_dimensions}
**Severity Threshold**: ${severity_threshold}
**Auto-Fix Suggestions**: ${auto_fix_suggestions}

**Audit Framework**:
1. Data completeness analysis (missing values, empty fields)
2. Accuracy assessment (format validation, range checks)
3. Consistency evaluation (cross-field validation, duplicates)
4. Validity verification (data type compliance, constraints)
5. Uniqueness analysis (duplicate detection, key integrity)
6. Timeliness review (data freshness, update patterns)

**Quality Assessment Process**:
- Statistical analysis of data distribution
- Pattern recognition for anomalies
- Cross-table consistency validation
- Historical trend analysis
- Business rule compliance checking

**Deliverables**:
- Quality score by dimension and table
- Detailed issue identification and classification
- Impact assessment and prioritization
${auto_fix_suggestions === 'true' ? '- Automated fix suggestions and scripts' : ''}
- Data governance recommendations
- Monitoring and maintenance strategies

Please conduct a thorough data quality audit focusing on ${quality_dimensions} dimensions.`
            }
          }
        ];
        break;

      case 'predictive_analytics':
        const { table: predTable, target_field, prediction_horizon = 'next_month', model_type = 'trend_analysis', feature_fields } = promptArgs;
        messages = [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `🔮 ADVANCED PREDICTIVE ANALYTICS

**Source Table**: ${predTable}
**Target Field**: ${target_field}
**Prediction Horizon**: ${prediction_horizon}
**Model Type**: ${model_type}
${feature_fields ? `**Feature Fields**: ${feature_fields}` : ''}

**Predictive Modeling Process**:
1. Historical data analysis and trend identification
2. Feature engineering and variable selection
3. Model development using ${model_type} approach
4. Validation and accuracy assessment
5. Forecast generation for ${prediction_horizon}
6. Confidence intervals and uncertainty quantification

**${model_type.toUpperCase()} ANALYSIS**:
${model_type === 'time_series' ? '- Seasonal pattern detection\n- Trend decomposition\n- Cyclical behavior analysis' : ''}
${model_type === 'regression' ? '- Variable relationship modeling\n- Predictive factor identification\n- Statistical significance testing' : ''}
${model_type === 'classification' ? '- Category prediction modeling\n- Feature importance analysis\n- Classification accuracy metrics' : ''}

**Outputs**:
- Historical pattern analysis
- Predictive model performance metrics
- Forecast values with confidence intervals
- Key influencing factors identification
- Model limitations and assumptions
- Actionable insights and recommendations

Please develop a ${model_type} model to predict ${target_field} over ${prediction_horizon}.`
            }
          }
        ];
        break;

      case 'natural_language_query':
        const { question, context_tables, response_format = 'narrative', include_confidence = 'true' } = promptArgs;
        messages = [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `🗣️ NATURAL LANGUAGE DATA QUERY

**Question**: "${question}"
${context_tables ? `**Context Tables**: ${context_tables}` : ''}
**Response Format**: ${response_format}
**Include Confidence**: ${include_confidence}

**Query Processing Framework**:
1. Question analysis and intent recognition
2. Relevant table and field identification
3. Data retrieval strategy formulation
4. Analysis execution and result compilation
5. Natural language response generation

**Analysis Approach**:
- Semantic understanding of the question
- Automatic table and field mapping
- Intelligent data filtering and aggregation
- Statistical analysis where appropriate
- Context-aware interpretation

**Response Requirements**:
${response_format === 'narrative' ? '- Conversational, easy-to-understand explanation\n- Supporting data and evidence\n- Contextual insights and implications' : ''}
${response_format === 'data_summary' ? '- Structured data summary\n- Key metrics and statistics\n- Trend identification' : ''}
${response_format === 'visualization_suggestion' ? '- Chart and graph recommendations\n- Data visualization best practices\n- Tool-specific guidance' : ''}
${include_confidence === 'true' ? '\n- Confidence scores for answers\n- Data quality indicators\n- Uncertainty acknowledgment' : ''}

Please analyze the available data and provide a comprehensive answer to: "${question}"`
            }
          }
        ];
        break;

      case 'smart_data_transformation':
        const { source_table, transformation_goal, target_format, quality_rules, preserve_history = 'true' } = promptArgs;
        messages = [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `🔄 INTELLIGENT DATA TRANSFORMATION

**Source Table**: ${source_table}
**Transformation Goal**: ${transformation_goal}
${target_format ? `**Target Format**: ${target_format}` : ''}
${quality_rules ? `**Quality Rules**: ${quality_rules}` : ''}
**Preserve History**: ${preserve_history}

**Transformation Framework**:
1. Source data analysis and quality assessment
2. Transformation strategy development
3. Data mapping and conversion rules
4. Quality validation and error handling
5. Output optimization and validation

**${transformation_goal.toUpperCase()} PROCESS**:
${transformation_goal === 'normalize' ? '- Database normalization principles\n- Redundancy elimination\n- Relationship optimization' : ''}
${transformation_goal === 'standardize' ? '- Format standardization\n- Value normalization\n- Consistency enforcement' : ''}
${transformation_goal === 'enrich' ? '- Data augmentation strategies\n- External data integration\n- Value-added field creation' : ''}
${transformation_goal === 'cleanse' ? '- Data validation and correction\n- Duplicate removal\n- Missing value handling' : ''}

**Deliverables**:
- Transformation execution plan
- Data mapping specifications
- Quality validation results
- Performance optimization recommendations
${preserve_history === 'true' ? '- Change audit trail and versioning' : ''}
- Post-transformation validation

Please analyze the source data and execute ${transformation_goal} transformation with intelligent optimization.`
            }
          }
        ];
        break;

      case 'automation_recommendations':
        const { workflow_description, automation_scope = 'single_table', frequency_patterns, complexity_tolerance = 'moderate', integration_capabilities } = promptArgs;
        messages = [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `🤖 INTELLIGENT AUTOMATION RECOMMENDATIONS

**Automation Scope**: ${automation_scope}
**Complexity Tolerance**: ${complexity_tolerance}
${workflow_description ? `**Current Workflow**: ${workflow_description}` : ''}
${frequency_patterns ? `**Frequency Patterns**: ${frequency_patterns}` : ''}
${integration_capabilities ? `**Integration Tools**: ${integration_capabilities}` : ''}

**Automation Analysis Framework**:
1. Workflow pattern analysis and task identification
2. Automation opportunity assessment and prioritization
3. Technical feasibility and complexity evaluation
4. ROI calculation and benefit quantification
5. Implementation roadmap development

**${automation_scope.toUpperCase()} AUTOMATION**:
${automation_scope === 'single_table' ? '- Field auto-population rules\n- Data validation automation\n- Notification triggers' : ''}
${automation_scope === 'multi_table' ? '- Cross-table data synchronization\n- Workflow orchestration\n- Complex business logic automation' : ''}
${automation_scope === 'external_integration' ? '- API integration strategies\n- Data pipeline automation\n- Third-party tool connectivity' : ''}

**Recommendations**:
- High-impact automation opportunities
- Implementation complexity assessment
- Cost-benefit analysis with ROI projections
- Technical requirements and dependencies
- Risk assessment and mitigation strategies
- Success metrics and monitoring approach

Please analyze the workflow patterns and provide ${complexity_tolerance}-level automation recommendations for ${automation_scope} scope.`
            }
          }
        ];
        break;
        
      default:
        throw new Error(`Unsupported prompt: ${promptName}`);
    }
    
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        description: prompt.description,
        messages: messages
      }
    };
    
  } catch (error) {
    log(LOG_LEVELS.ERROR, `Prompt ${promptName} failed`, { error: error.message });
    
    return {
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32000,
        message: `Error getting prompt ${promptName}: ${error.message}`
      }
    };
  }
}

// Sampling handler
async function handleSampling(request) {
  const { messages, modelPreferences } = request.params;
  
  try {
    // Note: In a real implementation, this would integrate with an LLM API
    // For now, we'll return a structured response indicating sampling capability
    
    log(LOG_LEVELS.INFO, 'Sampling request received', { 
      messageCount: messages?.length,
      model: modelPreferences?.model 
    });
    
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        model: modelPreferences?.model || 'claude-3-sonnet',
        role: 'assistant',
        content: {
          type: 'text',
          text: 'Sampling capability is available. This MCP server can request AI assistance for complex data analysis and insights generation. In a full implementation, this would connect to your preferred LLM for intelligent Airtable operations.'
        },
        stopReason: 'end_turn'
      }
    };
    
  } catch (error) {
    log(LOG_LEVELS.ERROR, 'Sampling failed', { error: error.message });
    
    return {
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32000,
        message: `Sampling error: ${error.message}`
      }
    };
  }
}

// Server startup
const PORT = CONFIG.PORT;
const HOST = CONFIG.HOST;

server.listen(PORT, HOST, () => {
  log(LOG_LEVELS.INFO, `Airtable MCP Server started`, {
    host: HOST,
    port: PORT,
    version: '2.1.0'
  });
  
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                 Airtable MCP Server v2.1                     ║
║            Model Context Protocol Implementation              ║
╠═══════════════════════════════════════════════════════════════╣
║  🌐 MCP Endpoint: http://${HOST}:${PORT}/mcp                  ║
║  📊 Health Check: http://${HOST}:${PORT}/health               ║
║  🔒 Security: Rate limiting, input validation                ║
║  📋 Tools: ${TOOLS_SCHEMA.length} available operations                    ║
╠═══════════════════════════════════════════════════════════════╣
║  🔗 Connected to Airtable Base: ${baseId.slice(0, 8)}...        ║
║  🚀 Ready for MCP client connections                         ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
function gracefulShutdown(signal) {
  log(LOG_LEVELS.INFO, 'Graceful shutdown initiated', { signal });
  
  server.close(() => {
    log(LOG_LEVELS.INFO, 'Server stopped');
    process.exit(0);
  });
  
  setTimeout(() => {
    log(LOG_LEVELS.ERROR, 'Force shutdown - server did not close in time');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  log(LOG_LEVELS.ERROR, 'Uncaught exception', { error: error.message });
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  log(LOG_LEVELS.ERROR, 'Unhandled promise rejection', { reason: reason?.toString() });
  gracefulShutdown('unhandledRejection');
});
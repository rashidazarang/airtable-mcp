/**
 * Runtime tool schemas for Airtable MCP Server
 */

import type { ToolSchema } from './index';

export const COMPLETE_TOOL_SCHEMAS: ToolSchema[] = [
  // Data Operations
  {
    name: 'list_tables',
    description: 'Get all tables in your base with schema information',
    inputSchema: {
      type: 'object',
      properties: {
        include_schema: { type: 'boolean', description: 'Include field schema information', default: false }
      }
    }
  },
  {
    name: 'list_records',
    description: 'Query records with optional filtering and pagination',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name or ID' },
        maxRecords: { type: 'number', description: 'Maximum number of records to return' },
        view: { type: 'string', description: 'View name or ID' },
        filterByFormula: { type: 'string', description: 'Airtable formula to filter records' },
        sort: { type: 'array', description: 'Sort configuration' },
        pageSize: { type: 'number', description: 'Number of records per page' },
        offset: { type: 'string', description: 'Pagination offset' }
      },
      required: ['table']
    }
  },
  {
    name: 'get_record',
    description: 'Retrieve a single record by ID',
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
    description: 'Add new records to any table',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name or ID' },
        fields: { type: 'object', description: 'Field values for the new record' },
        typecast: { type: 'boolean', description: 'Automatically typecast field values' }
      },
      required: ['table', 'fields']
    }
  },
  {
    name: 'update_record',
    description: 'Modify existing record fields',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name or ID' },
        recordId: { type: 'string', description: 'Record ID to update' },
        fields: { type: 'object', description: 'Fields to update' },
        typecast: { type: 'boolean', description: 'Automatically typecast field values' }
      },
      required: ['table', 'recordId', 'fields']
    }
  },
  {
    name: 'delete_record',
    description: 'Remove records from a table',
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
    description: 'Advanced search with Airtable formulas and sorting',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name or ID' },
        filterByFormula: { type: 'string', description: 'Search formula' },
        sort: { type: 'array', description: 'Sort configuration' },
        maxRecords: { type: 'number', description: 'Maximum records to return' },
        view: { type: 'string', description: 'View to search within' }
      },
      required: ['table']
    }
  }
];
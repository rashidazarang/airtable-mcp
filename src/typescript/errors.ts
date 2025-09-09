/**
 * Runtime error classes for Airtable MCP Server
 */

export class AirtableError extends Error {
  public code: string;
  public statusCode?: number;
  
  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'AirtableError';
    this.code = code;
    if (statusCode !== undefined) {
      this.statusCode = statusCode;
    }
  }
}

export class ValidationError extends Error {
  public field: string;
  
  constructor(message: string, field: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}
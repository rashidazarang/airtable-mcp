/**
 * Runtime error classes for Airtable MCP Server
 */
export declare class AirtableError extends Error {
    code: string;
    statusCode?: number;
    constructor(message: string, code: string, statusCode?: number);
}
export declare class ValidationError extends Error {
    field: string;
    constructor(message: string, field: string);
}

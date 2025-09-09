#!/usr/bin/env node
/**
 * Airtable MCP Server - TypeScript Implementation
 * Model Context Protocol server for Airtable integration with enterprise-grade type safety
 *
 * Features:
 * - Complete MCP 2024-11-05 protocol support with strict typing
 * - OAuth2 authentication with PKCE and type safety
 * - Enterprise security features with validated types
 * - Rate limiting and comprehensive input validation
 * - Production monitoring and health checks
 * - AI-powered analytics with strongly typed schemas
 *
 * Author: Rashid Azarang
 * License: MIT
 */
import { MCPServerInfo } from '../types/index';
import { ToolResponse } from '../types/tools';
declare class AirtableMCPServer {
    private server;
    private readonly config;
    private readonly tools;
    private readonly prompts;
    private readonly roots;
    constructor();
    initialize(): Promise<MCPServerInfo>;
    handleToolCall(name: string, params: Record<string, unknown>): Promise<ToolResponse>;
    private handleListTables;
    private handleListRecords;
    private handleCreateRecord;
    private handleUpdateRecord;
    private handleDeleteRecord;
    handlePromptGet(name: string, args: Record<string, unknown>): Promise<{
        messages: Array<{
            role: string;
            content: {
                type: string;
                text: string;
            };
        }>;
    }>;
    private handleAnalyzeDataPrompt;
    private handleCreateReportPrompt;
    private handlePredictiveAnalyticsPrompt;
    private handleNaturalLanguageQueryPrompt;
    start(): Promise<void>;
    stop(): Promise<void>;
    private handleRequest;
    private handleMCPRequest;
}
export { AirtableMCPServer };
export default AirtableMCPServer;

/**
 * Runtime AI prompt templates for Airtable MCP Server
 */
export interface PromptArgument {
    name: string;
    description: string;
    required: boolean;
    type: string;
    enum?: string[];
}
export interface PromptSchema {
    name: string;
    description: string;
    arguments: PromptArgument[];
}
export declare const AI_PROMPT_TEMPLATES: Record<string, PromptSchema>;

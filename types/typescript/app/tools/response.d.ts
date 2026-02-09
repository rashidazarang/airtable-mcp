/**
 * Utility for creating consistent MCP tool responses.
 *
 * The MCP protocol requires the `content` array to contain displayable data.
 * While `structuredContent` is the newer typed output format, most clients
 * read from `content` for backwards compatibility.
 */
export interface ToolResponse<T> {
    [x: string]: unknown;
    structuredContent: T;
    content: Array<{
        type: 'text';
        text: string;
    }>;
}
/**
 * Creates a tool response with both structuredContent (for typed clients)
 * and content array (for backwards compatibility with MCP clients).
 */
export declare function createToolResponse<T>(data: T): ToolResponse<T>;

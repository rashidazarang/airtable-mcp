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
  content: Array<{ type: 'text'; text: string }>;
}

/**
 * Creates a tool response with both structuredContent (for typed clients)
 * and content array (for backwards compatibility with MCP clients).
 */
export function createToolResponse<T>(data: T): ToolResponse<T> {
  return {
    structuredContent: data,
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
  };
}

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createToolResponse } from './response';

const inputSchema = z.object({}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerListFieldTypesTool(server: McpServer): void {
  server.registerTool(
    'list_field_types',
    {
      description: 'List all available Airtable field types with descriptions (static reference).',
      inputSchema: inputSchema.shape as any
    },
    async (_raw: InputType) => {
      return createToolResponse({
        fieldTypes: [
          { type: 'singleLineText', description: 'Single line of text' },
          { type: 'email', description: 'Email address' },
          { type: 'url', description: 'URL' },
          { type: 'multilineText', description: 'Multi-line text' },
          { type: 'number', description: 'Numeric value' },
          { type: 'percent', description: 'Percentage value' },
          { type: 'currency', description: 'Currency amount' },
          { type: 'singleSelect', description: 'Single select from predefined choices' },
          { type: 'multipleSelects', description: 'Multiple select from predefined choices' },
          { type: 'singleCollaborator', description: 'Single user collaborator' },
          { type: 'multipleCollaborators', description: 'Multiple user collaborators' },
          { type: 'multipleRecordLinks', description: 'Links to records in another table' },
          { type: 'date', description: 'Date value' },
          { type: 'dateTime', description: 'Date and time value' },
          { type: 'phoneNumber', description: 'Phone number' },
          { type: 'multipleAttachments', description: 'File attachments' },
          { type: 'checkbox', description: 'Boolean checkbox' },
          { type: 'formula', description: 'Computed formula field' },
          { type: 'createdTime', description: 'Auto-generated creation timestamp' },
          { type: 'rollup', description: 'Aggregation of linked records' },
          { type: 'count', description: 'Count of linked records' },
          { type: 'lookup', description: 'Lookup field from linked records' },
          { type: 'multipleLookupValues', description: 'Multiple lookup values from linked records' },
          { type: 'autoNumber', description: 'Auto-incrementing number' },
          { type: 'barcode', description: 'Barcode value' },
          { type: 'rating', description: 'Star rating (1-10)' },
          { type: 'richText', description: 'Rich formatted text' },
          { type: 'duration', description: 'Duration in seconds' },
          { type: 'lastModifiedTime', description: 'Auto-updated modification timestamp' },
          { type: 'createdBy', description: 'User who created the record' },
          { type: 'lastModifiedBy', description: 'User who last modified the record' },
          { type: 'button', description: 'Button that triggers an action' },
          { type: 'externalSyncSource', description: 'External sync source reference' }
        ]
      });
    }
  );
}

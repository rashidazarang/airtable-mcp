import { AirtableBrainError } from '../../errors';
import { AppContext } from '../context';

function toUserMessage(error: AirtableBrainError): string {
  switch (error.code) {
    case 'RateLimited':
      return 'Airtable rate limit exceeded. Please retry after backoff.';
    case 'ValidationError':
      return 'Airtable rejected the request. Check field names and values.';
    case 'AuthError': {
      const endpoint = error.context?.endpoint ?? '';
      const baseId = error.context?.baseId;
      const isMetaApi = endpoint.includes('/meta/');
      const isBaseSpecific = baseId && endpoint.includes(`/bases/${baseId}`);

      if (isMetaApi && isBaseSpecific) {
        return `Authentication failed for base "${baseId}". This could mean: (1) your token lacks the "schema.bases:read" scope, or (2) your token does not have access to this specific base. Use list_bases to see which bases your token can access.`;
      }
      if (isMetaApi) {
        return 'Authentication failed. Ensure your token has the "schema.bases:read" scope.';
      }
      return 'Authentication failed. Verify the Airtable token scopes and base access.';
    }
    case 'ConflictError':
      return 'The record changed since it was fetched. Refresh data and review the diff.';
    case 'NotFound':
      return 'Requested Airtable resource was not found. Confirm the base and table identifiers.';
    case 'GovernanceError':
      return 'Operation blocked by governance allow-lists.';
    default:
      return 'Unexpected Airtable error. Please retry or check the exceptions queue.';
  }
}

export function handleToolError(toolName: string, error: unknown, ctx: AppContext) {
  if (error instanceof AirtableBrainError) {
    ctx.logger.error(`${toolName} failed`, {
      code: error.code,
      status: error.status,
      retryAfterMs: error.retryAfterMs
    });
    ctx.exceptions.record(error, `${toolName} failed`, error.message);
    return {
      isError: true,
      content: [
        {
          type: 'text' as const,
          text: toUserMessage(error)
        }
      ]
    };
  }

  ctx.logger.error(`${toolName} failed with unknown error`, {
    error: error instanceof Error ? error.message : String(error)
  });

  return {
    isError: true,
    content: [
      {
        type: 'text' as const,
        text: 'Unexpected server error. Check logs for details.'
      }
    ]
  };
}

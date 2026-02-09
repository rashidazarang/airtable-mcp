import { AirtableBrainError } from '../../errors';
import { AppContext } from '../context';

/**
 * Airtable API error types as returned in error.type field
 */
type AirtableErrorType =
  | 'AUTHENTICATION_REQUIRED'
  | 'INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND'
  | 'NOT_FOUND'
  | 'INVALID_REQUEST_UNKNOWN'
  | 'INVALID_REQUEST'
  | 'RATE_LIMIT_REACHED'
  | 'UNKNOWN_FIELD_NAME'
  | 'INVALID_FIELD_TYPE'
  | string;

function formatTokenWarnings(warnings: string[]): string {
  if (warnings.length === 0) return '';
  return '\n\nToken format issues detected:\n' + warnings.map((w) => `• ${w}`).join('\n');
}

function buildAuthErrorMessage(
  error: AirtableBrainError,
  tokenWarnings: string[]
): string {
  const errorType = error.context?.upstreamErrorType as AirtableErrorType | undefined;
  const baseId = error.context?.baseId;
  const endpoint = error.context?.endpoint ?? '';
  const isMetaApi = endpoint.includes('/meta/');
  const isBaseSpecific = baseId && endpoint.includes(`/bases/${baseId}`);
  const warningsText = formatTokenWarnings(tokenWarnings);

  // Handle specific Airtable error types
  if (errorType === 'AUTHENTICATION_REQUIRED') {
    return `Authentication failed: Token is invalid or expired.

Troubleshooting:
1. Verify your token at https://airtable.com/create/tokens
2. Check that the token hasn't been revoked
3. Ensure you copied the entire token (typically ~82 characters)${warningsText}`;
  }

  if (errorType === 'INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND') {
    if (baseId) {
      return `Authentication failed for base "${baseId}".

Your token is valid but cannot access this specific base.

Troubleshooting:
1. Run list_bases to see which bases your token can access
2. If this base is not listed, regenerate your token with access to it
3. Verify your token has the required scopes:
   • schema.bases:read (for describe/list operations)
   • data.records:read (for query operations)
   • data.records:write (for create/update operations)${warningsText}`;
    }
    return `Authentication failed: Token lacks required permissions.

Troubleshooting:
1. Verify your token has the "schema.bases:read" scope
2. Check token permissions at https://airtable.com/create/tokens
3. Regenerate token if scopes are missing${warningsText}`;
  }

  // Fallback for unrecognized error types
  if (isMetaApi && isBaseSpecific) {
    return `Authentication failed for base "${baseId}".

This could mean:
1. Your token lacks the "schema.bases:read" scope
2. Your token does not have access to this specific base

Run list_bases to see which bases your token can access.${warningsText}`;
  }

  if (isMetaApi) {
    return `Authentication failed for Meta API.

Troubleshooting:
1. Ensure your token has the "schema.bases:read" scope
2. Verify token at https://airtable.com/create/tokens${warningsText}`;
  }

  return `Authentication failed.

Troubleshooting:
1. Verify token scopes match the operation you're attempting
2. Check base/table access permissions
3. Review token at https://airtable.com/create/tokens${warningsText}`;
}

function buildValidationErrorMessage(error: AirtableBrainError): string {
  const errorType = error.context?.upstreamErrorType;
  const errorMessage = error.context?.upstreamErrorMessage;

  if (errorType === 'UNKNOWN_FIELD_NAME') {
    return `Airtable rejected the request: Unknown field name.

${errorMessage ? `Details: ${errorMessage}\n\n` : ''}Troubleshooting:
1. Use describe tool to see valid field names for this table
2. Field names are case-sensitive
3. Check for typos in field names`;
  }

  if (errorType === 'INVALID_FIELD_TYPE') {
    return `Airtable rejected the request: Invalid field value type.

${errorMessage ? `Details: ${errorMessage}\n\n` : ''}Troubleshooting:
1. Use describe tool to see field types
2. Ensure values match expected types (text, number, date, etc.)
3. Check Airtable field configuration`;
  }

  if (errorMessage) {
    return `Airtable validation error: ${errorMessage}

Troubleshooting:
1. Check field names and values match table schema
2. Use describe tool to verify field types
3. Ensure required fields are provided`;
  }

  return `Airtable rejected the request.

Troubleshooting:
1. Check field names exist in the table
2. Verify values match expected field types
3. Use describe tool to inspect table schema`;
}

function buildNotFoundErrorMessage(error: AirtableBrainError): string {
  const baseId = error.context?.baseId;
  const errorMessage = error.context?.upstreamErrorMessage;

  if (baseId) {
    return `Resource not found in base "${baseId}".

${errorMessage ? `Details: ${errorMessage}\n\n` : ''}Troubleshooting:
1. Verify the base ID is correct
2. Check table/record IDs exist
3. Use list_bases and describe tools to confirm identifiers`;
  }

  return `Requested Airtable resource was not found.

Troubleshooting:
1. Confirm base, table, and record identifiers are correct
2. Use list_bases to see available bases
3. Use describe to see tables in a base`;
}

function buildRateLimitMessage(error: AirtableBrainError): string {
  const retryAfter = error.retryAfterMs;
  const retrySeconds = retryAfter ? Math.ceil(retryAfter / 1000) : undefined;

  if (retrySeconds) {
    return `Airtable rate limit exceeded. Retry after ${retrySeconds} seconds.

The API allows 5 requests per second per base. Consider:
1. Reducing request frequency
2. Batching multiple record operations
3. Using pagination for large result sets`;
  }

  return `Airtable rate limit exceeded.

The API allows 5 requests per second per base. Retry after a brief delay.`;
}

function toUserMessage(error: AirtableBrainError, ctx: AppContext): string {
  const tokenWarnings = ctx.config.auth.tokenFormatWarnings || [];

  switch (error.code) {
    case 'RateLimited':
      return buildRateLimitMessage(error);

    case 'ValidationError':
      return buildValidationErrorMessage(error);

    case 'AuthError':
      return buildAuthErrorMessage(error, tokenWarnings);

    case 'ConflictError':
      return `Record conflict detected.

The record was modified since it was fetched.

Troubleshooting:
1. Fetch the latest version of the record
2. Review the changes (diff)
3. Retry the update with fresh data`;

    case 'NotFound':
      return buildNotFoundErrorMessage(error);

    case 'GovernanceError':
      return `Operation blocked by governance policy.

This operation is not allowed by the configured governance rules.
Check AIRTABLE_ALLOWED_BASES and AIRTABLE_ALLOWED_TABLES settings.`;

    default:
      return `Unexpected Airtable error.

Please retry the operation. If the problem persists, check:
1. Airtable service status
2. Server logs for details
3. Request ID: ${error.context?.upstreamRequestId || 'N/A'}`;
  }
}

export function handleToolError(toolName: string, error: unknown, ctx: AppContext) {
  if (error instanceof AirtableBrainError) {
    ctx.logger.error(`${toolName} failed`, {
      code: error.code,
      status: error.status,
      retryAfterMs: error.retryAfterMs,
      upstreamErrorType: error.context?.upstreamErrorType,
      upstreamRequestId: error.context?.upstreamRequestId
    });
    ctx.exceptions.record(error, `${toolName} failed`, error.message);
    return {
      isError: true,
      content: [
        {
          type: 'text' as const,
          text: toUserMessage(error, ctx)
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

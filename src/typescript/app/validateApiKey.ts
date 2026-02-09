/**
 * API key format validation for Airtable Personal Access Tokens.
 *
 * Provides helpful warnings when token format appears incorrect,
 * without blocking startup (token might still work in edge cases).
 */

export interface TokenValidationResult {
  isValid: boolean;
  warnings: string[];
}

/**
 * Validates Airtable API key format and returns warnings for common issues.
 *
 * @param apiKey - The API key to validate
 * @returns Validation result with warnings array
 */
export function validateApiKey(apiKey: string): TokenValidationResult {
  const warnings: string[] = [];

  if (!apiKey || apiKey.trim().length === 0) {
    return {
      isValid: false,
      warnings: ['No API key provided. Set AIRTABLE_PAT environment variable.']
    };
  }

  const trimmedKey = apiKey.trim();

  // Check for whitespace
  if (apiKey !== trimmedKey) {
    warnings.push('API key contains leading or trailing whitespace. This has been trimmed.');
  }

  // Check dot count (PATs have exactly one dot separating prefix from secret)
  const dotCount = (trimmedKey.match(/\./g) || []).length;
  if (dotCount === 0) {
    warnings.push(
      `Expected one dot (.) in API key, found ${dotCount}. ` +
      'Ensure you copied the entire token, not just the token ID.'
    );
  } else if (dotCount > 1) {
    warnings.push(
      `Expected one dot (.) in API key, found ${dotCount}. ` +
      'Ensure you copied the API key correctly.'
    );
  }

  // Check length (typical PAT is around 82 characters)
  if (trimmedKey.length < 70) {
    warnings.push(
      `API key seems too short (${trimmedKey.length} characters). ` +
      'Personal Access Tokens are typically around 82 characters.'
    );
  } else if (trimmedKey.length > 100) {
    warnings.push(
      `API key seems too long (${trimmedKey.length} characters). ` +
      'Personal Access Tokens are typically around 82 characters.'
    );
  }

  // Check for legacy API key format (starts with 'key')
  if (trimmedKey.startsWith('key')) {
    warnings.push(
      'This appears to be an old-style API key (starts with "key"). ' +
      'Please create a Personal Access Token at https://airtable.com/create/tokens instead.'
    );
  }

  // Check for valid PAT prefix
  if (!trimmedKey.startsWith('pat') && !trimmedKey.startsWith('key')) {
    warnings.push(
      'API key does not start with expected prefix ("pat" for Personal Access Token). ' +
      'Verify you copied the correct token.'
    );
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
}

/**
 * Get token format warnings for inclusion in error messages.
 * Only returns warnings if issues are detected.
 *
 * @param apiKey - The API key to check
 * @returns Array of warning strings, empty if token format looks valid
 */
export function getTokenFormatWarnings(apiKey: string): string[] {
  const result = validateApiKey(apiKey);
  return result.warnings;
}

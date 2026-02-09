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
export declare function validateApiKey(apiKey: string): TokenValidationResult;
/**
 * Get token format warnings for inclusion in error messages.
 * Only returns warnings if issues are detected.
 *
 * @param apiKey - The API key to check
 * @returns Array of warning strings, empty if token format looks valid
 */
export declare function getTokenFormatWarnings(apiKey: string): string[];

/**
 * Sanitization utilities for Airtable formula strings.
 *
 * Prevents formula injection attacks by escaping user-provided
 * strings before they're interpolated into Airtable formulas.
 */
/**
 * Escapes a string for safe use within Airtable formula string literals.
 *
 * Airtable formulas use double quotes for strings. This function escapes:
 * - Double quotes (") -> \"
 * - Backslashes (\) -> \\
 *
 * @example
 * // Safe interpolation in formula:
 * const formula = `Name = "${escapeFormulaString(userInput)}"`;
 *
 * @param input - The user-provided string to escape
 * @returns The escaped string safe for use in formulas
 */
export declare function escapeFormulaString(input: string): string;
/**
 * Validates that a formula string doesn't contain obvious injection attempts.
 *
 * This is a heuristic check - not foolproof, but catches common patterns.
 * Should be used in addition to escapeFormulaString, not as a replacement.
 *
 * @param formula - The complete formula string to validate
 * @returns Object with isValid flag and optional warning message
 */
export declare function validateFormula(formula: string): {
    isValid: boolean;
    warning?: string;
};
/**
 * Builds a safe FIND formula for searching text in a field.
 *
 * @param searchTerm - The user-provided search term
 * @param fieldName - The field name to search in
 * @returns A safe FIND formula string
 */
export declare function buildSafeFindFormula(searchTerm: string, fieldName: string): string;
/**
 * Builds a safe equality comparison formula.
 *
 * @param fieldName - The field name to compare
 * @param value - The user-provided value to compare against
 * @returns A safe equality formula string
 */
export declare function buildSafeEqualityFormula(fieldName: string, value: string): string;

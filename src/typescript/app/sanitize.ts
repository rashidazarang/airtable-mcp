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
export function escapeFormulaString(input: string): string {
  if (!input) return '';

  // Escape backslashes first, then quotes
  return input
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

/**
 * Validates that a formula string doesn't contain obvious injection attempts.
 *
 * This is a heuristic check - not foolproof, but catches common patterns.
 * Should be used in addition to escapeFormulaString, not as a replacement.
 *
 * @param formula - The complete formula string to validate
 * @returns Object with isValid flag and optional warning message
 */
export function validateFormula(formula: string): { isValid: boolean; warning?: string } {
  if (!formula) {
    return { isValid: true };
  }

  // Check for unbalanced quotes (simple heuristic)
  const quoteCount = (formula.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    return {
      isValid: false,
      warning: 'Formula contains unbalanced quotes'
    };
  }

  // Check for suspicious patterns that might indicate injection
  const suspiciousPatterns = [
    /"\s*\)\s*,/,  // Closing quote followed by ) and comma - potential function breakout
    /"\s*&\s*"/,   // String concatenation that might be injection
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(formula)) {
      return {
        isValid: false,
        warning: 'Formula contains suspicious patterns'
      };
    }
  }

  return { isValid: true };
}

/**
 * Builds a safe FIND formula for searching text in a field.
 *
 * @param searchTerm - The user-provided search term
 * @param fieldName - The field name to search in
 * @returns A safe FIND formula string
 */
export function buildSafeFindFormula(searchTerm: string, fieldName: string): string {
  const escapedTerm = escapeFormulaString(searchTerm);
  const escapedField = escapeFormulaString(fieldName);
  return `FIND("${escapedTerm}", {${escapedField}})`;
}

/**
 * Builds a safe equality comparison formula.
 *
 * @param fieldName - The field name to compare
 * @param value - The user-provided value to compare against
 * @returns A safe equality formula string
 */
export function buildSafeEqualityFormula(fieldName: string, value: string): string {
  const escapedField = escapeFormulaString(fieldName);
  const escapedValue = escapeFormulaString(value);
  return `{${escapedField}} = "${escapedValue}"`;
}

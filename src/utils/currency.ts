/**
 * Currency Formatting Utilities
 * Handles currency formatting for display throughout the app
 */

/**
 * Format a number as Kenyan Shillings (KES)
 * @param value - The number to format
 * @returns Formatted string like "KSh 73,550"
 */
export function formatKes(value: number | undefined): string {
  return formatCurrency(value ?? 0, "KES", "en-KE");
}

/**
 * Format a number as currency
 * @param value - The number to format
 * @param currency - Currency code (e.g., "KES", "USD", "EUR")
 * @param locale - Locale string (e.g., "en-KE", "en-US")
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = "KES",
  locale: string = "en-KE",
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  } catch (error) {
    // Fallback for unsupported currencies
    return `${currency} ${(value ?? 0).toLocaleString(locale)}`;
  }
}

/**
 * Parse a formatted currency string back to a number
 * Removes currency symbols and thousand separators
 * @param formatted - The formatted string to parse
 * @returns The parsed number
 */
export function parseCurrency(formatted: string): number {
  // Remove all non-digit characters except decimal point
  const cleaned = formatted.replace(/[^\d.]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format a number with thousand separators
 * @param value - The number to format
 * @param locale - Locale string (e.g., "en-KE")
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  locale: string = "en-KE",
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

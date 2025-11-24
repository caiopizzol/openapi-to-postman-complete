/**
 * Endpoint matching utilities for filtering
 */

/**
 * Normalize a path for comparison
 * Converts various path formats to a consistent format for matching
 * @param path - URL path to normalize
 * @param rules - Optional normalization rules mapping
 * @returns Normalized path
 */
export function normalizePath(
  path: string,
  rules: Record<string, string> = {}
): string {
  let normalized = path.replace(/:(\w+)/g, ':$1'); // Keep :param format as is

  // Apply custom normalization rules if provided
  normalized = normalized.replace(/\{[^}]+\}/g, (match) => {
    // Check custom rules first
    for (const [pattern, replacement] of Object.entries(rules)) {
      if (match.includes(pattern)) {
        return replacement;
      }
    }
    // Default: remove braces and keep content
    return ':' + match.slice(1, -1);
  });

  return normalized;
}

/**
 * Check if an endpoint matches based on method and path
 * @param method - HTTP method
 * @param path - URL path
 * @param endpoints - Map of endpoints to include
 * @param rules - Optional normalization rules
 * @returns True if endpoint should be included
 */
export function shouldIncludeEndpoint(
  method: string,
  path: string,
  endpoints: Record<string, boolean>,
  rules: Record<string, string> = {}
): boolean {
  const normalizedPath = normalizePath(path, rules);
  const endpointKey = `${method} ${normalizedPath}`;
  return endpoints[endpointKey] || false;
}

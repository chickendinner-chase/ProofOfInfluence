/**
 * Utility to log errors only once to prevent console spam
 * Useful for repeated errors from hooks or polling
 */

const loggedErrors = new Set<string>();

/**
 * Log an error only once based on a unique key
 * @param key - Unique identifier for this error type
 * @param message - Error message to log
 * @param error - Optional error object
 */
export function logOnce(key: string, message: string, error?: unknown) {
  if (loggedErrors.has(key)) {
    return;
  }
  
  loggedErrors.add(key);
  
  if (error) {
    console.error(`[${key}] ${message}`, error);
  } else {
    console.error(`[${key}] ${message}`);
  }
}

/**
 * Clear logged errors (useful for testing or reset)
 */
export function clearLoggedErrors() {
  loggedErrors.clear();
}

/**
 * Check if an error has been logged
 */
export function hasLoggedError(key: string): boolean {
  return loggedErrors.has(key);
}


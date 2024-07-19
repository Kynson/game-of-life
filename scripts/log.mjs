/**
 * Logs an info message to the console
 * @param { string } message
 */
export function info(message) {
  console.info(`\x1b[36m[INFO]:\x1b[0m ${message}`);
}

/**
 * Logs an error message to the console
 * @param { string } message
 */
export function error(message) {
  console.error(`\x1b[31m[ERROR]:\x1b[0m ${message}`);
}

/**
 * Clears the console
 */
export function clear() {
  console.clear();
}

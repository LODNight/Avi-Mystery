/**
 * contractValidator.js
 *
 * Enforces interface contracts at runtime across mock and future API adapters.
 * Ensures services implement all contract-defined methods and signatures.
 */

/**
 * Asserts that a service implementation provides all methods defined in its contract.
 *
 * @param {Object} contract The contract object defining required methods
 * @param {Object} implementation The actual service implementation
 * @param {string} serviceName Name of the service for diagnostic error reporting
 * @throws {Error} If one or more required methods are missing
 * @returns {boolean} true if all contract methods are implemented
 */
export function assertImplementsContract(contract, implementation, serviceName = 'Service') {
  if (!contract || typeof contract !== 'object') {
    throw new Error(`[Contract Error] Invalid contract passed for ${serviceName}`);
  }
  if (!implementation || typeof implementation !== 'object') {
    throw new Error(`[Contract Error] Invalid implementation passed for ${serviceName}`);
  }

  const missing = [];
  for (const method of Object.keys(contract)) {
    if (typeof contract[method] === 'function') {
      if (typeof implementation[method] !== 'function') {
        missing.push(method);
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[Contract Violation] ${serviceName} is missing required methods from its contract:\n` +
      missing.map((m) => ` - ${m}()`).join('\n')
    );
  }

  return true;
}

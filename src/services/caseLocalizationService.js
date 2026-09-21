/**
 * caseLocalizationService.js
 *
 * Provides safe, non-mutating localization resolution for Case Data.
 * Adheres strictly to the Phase 2 boundary:
 * DISPLAY TEXT ≠ VERIFICATION VALUE
 */

/**
 * Distinguishes an explicit localization object from ordinary domain objects.
 * We avoid broad heuristics. An object is considered a localization object ONLY if
 * it contains exactly the keys 'en' and 'vi'.
 *
 * @param {any} obj - The value to inspect.
 * @returns {boolean} True if it is a localization object.
 */
function isLocalizationObject(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return false;
  }
  const keys = Object.keys(obj);
  return keys.length === 2 && keys.includes('en') && keys.includes('vi');
}

/**
 * Validates a localization object in development.
 * Emits a warning if a translation is missing.
 */
function validateLocalizationObject(obj, path) {
  if (import.meta.env.DEV) {
    if (typeof obj.en !== 'string' || obj.en.trim() === '') {
      console.warn(`[i18n Validation] Missing 'en' translation at path: ${path}`);
    }
    if (typeof obj.vi !== 'string' || obj.vi.trim() === '') {
      console.warn(`[i18n Validation] Missing 'vi' translation at path: ${path}`);
    }
  }
}

/**
 * Recursively resolves localization objects within a given structure.
 * Returns a new object/array, NEVER mutating the original.
 *
 * @param {any} data - The raw data to localize.
 * @param {string} language - The target language ('en' | 'vi').
 * @param {string} path - The current object path (for validation warnings).
 * @returns {any} The localized data.
 */
function resolveLocalizedData(data, language, path = 'root') {
  if (!data || typeof data !== 'object') {
    return data; // Primitives are returned as-is
  }

  if (isLocalizationObject(data)) {
    validateLocalizationObject(data, path);
    // Return the requested language, fallback to 'vi' if missing, or empty string.
    const normalizedLang = (language || 'vi').toLowerCase().startsWith('en') ? 'en' : 'vi';
    return data[normalizedLang] || data['vi'] || '';
  }

  if (Array.isArray(data)) {
    return data.map((item, index) => resolveLocalizedData(item, language, `${path}[${index}]`));
  }

  // It's a standard object, recurse into its properties
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = resolveLocalizedData(value, language, `${path}.${key}`);
  }
  return result;
}

export const caseLocalizationService = {
  /**
   * Returns a new Localized Case object.
   * Does NOT mutate the raw Case Definition.
   *
   * @param {Object} rawCase - The raw bilingual Case object.
   * @param {string} language - The target language code (e.g., 'vi' or 'en').
   * @returns {Object} A new localized Case object.
   */
  getLocalizedCase(rawCase, language) {
    if (!rawCase) return null;
    return resolveLocalizedData(rawCase, language);
  },

  /**
   * Resolves localization for any generic data structure (e.g. Reports, HQ Messages)
   * while preserving domain IDs and verification values.
   */
  getLocalizedData(rawData, language) {
    if (!rawData) return null;
    return resolveLocalizedData(rawData, language);
  }
};

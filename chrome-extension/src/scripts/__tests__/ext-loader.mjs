/**
 * Node ESM loader hook: resolve extensionless relative specifiers (the repo's
 * webpack/babel convention) by appending ".js". Used only by the tests so the
 * source modules under chrome-extension/src/scripts can be imported as-is.
 *
 * Register with: node --import ./register-ext-loader.mjs <test-file>
 */

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (error && error.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('.')) {
      return nextResolve(specifier + '.js', context);
    }
    throw error;
  }
}

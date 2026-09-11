// Vapor-mode counterpart of `mocks/lwc.js`. The `test/api/sanitizeAttribute`
// spec imports `sanitizeAttribute` from `lwc` and drives it as a spy
// (`.mockReset()`, `.toHaveBeenCalled()`, `.mockReturnValue()`). The base
// integration config injects `mocks/lwc.js` for this; the vapor `serve-vapor`
// resolver bundles the bare `lwc` specifier to the vapor runtime bundle, so it
// needs its own spy-wrapped re-export.
//
// Re-export everything from the vapor bundle, then override `sanitizeAttribute`
// with a spy so the spec's `.mockReset()` etc. work. The vapor runtime bundles
// its own copy internally, so this spy tracks only test-facing calls.
import { sanitizeAttribute as _sanitizeAttribute } from '@lwc/engine-vapor';
import { fn } from '@vitest/spy';

export * from '@lwc/engine-vapor';
export const sanitizeAttribute = fn(_sanitizeAttribute);

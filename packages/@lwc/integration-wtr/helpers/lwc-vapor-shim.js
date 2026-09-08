/**
 * Vapor-mode shim for the bare `lwc` specifier as seen by the NATIVELY-served
 * helper modules (helpers/*.js).
 *
 * The helper modules are not bundled through the vapor plugin — they are served
 * as-is, so their `import { ... } from 'lwc'` resolves via WTR's nodeResolve.
 * In vapor mode the config redirects that bare `lwc` import HERE.
 *
 * We re-export the standard engine-dom surface (the status quo — these helpers
 * already resolved to engine-dom before, and the vapor runtime ignores those
 * calls, so behavior is unchanged), and override ONLY `setTrustedSignalSet`.
 *
 * Why: `helpers/signals.js` calls `setTrustedSignalSet(signalValidator)` at
 * setup time. The vapor runtime reads the trusted-signal set from a `globalThis`
 * key (it bundles separately from these native helpers, so a module-local would
 * not be shared). Routing the helper's call through engine-dom would publish the
 * set to the WRONG runtime, so vapor's `isTrustedSignalValue` always returned
 * false and the signal protocol never subscribed. Publishing it on the global
 * key here bridges the native helper and the bundled vapor spec instance.
 */
export * from '@lwc/engine-dom';

export function setTrustedSignalSet(set) {
    // The key the vapor runtime reads in compat/reporting.ts (TRUSTED_SIGNALS_KEY).
    globalThis.__lwcVaporTrustedSignals__ = set;
}

// `helpers/hooks.js` installs a `sanitizeHtmlContent` hook (for `lwc:inner-html`
// tests) via `setHooks(...)`. Same module-split problem as signals: that call
// would otherwise reach engine-dom, never vapor. Route the sanitizer into the
// global key vapor's `setHtml` reads (dom/prop.ts SANITIZE_HOOK_KEY). Other hook
// keys (Locker callHook/getHook/setHook) are not exercised by the native helpers,
// so re-export semantics for them is irrelevant here.
export function setHooks(hooks) {
    if (hooks && typeof hooks.sanitizeHtmlContent === 'function') {
        globalThis.__lwcVaporSanitizeHtmlContent__ = hooks.sanitizeHtmlContent;
    }
}

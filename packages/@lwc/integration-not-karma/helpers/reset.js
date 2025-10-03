/**
 * @fileoverview There are a number of __lwcReset functions scattered throughout
 * the LWC codebase that are only defined when running integration tests, which
 * reset various global states used by the framework. When updating tests, it is
 * not always obvious to new developers where each function is defined and what
 * purpose it serves. This file is intended to consolidate the functions, in
 * order to reduce the amout of "magic" in the code.
 */

/**
 * Clears all nodes from the document's `head` and `body` and resets LWC's
 * stylesheets cache.
 * @see engine-dom/src/styles.ts
 */
export function resetDOM() {
    // Synthetic custom element lifecycle only patches DOM manipulation methods
    // on Node.prototype, not Element.prototype, so we must use those in order
    // for signals tests to pass when using synthetic lifecycle.
    for (const child of document.body.childNodes) {
        document.body.removeChild(child);
    }
    for (const child of document.head.childNodes) {
        document.head.removeChild(child);
    }
    // LWC caches stylesheet data; we need to reset the cache when we clear the
    // DOM, otherwise components will render with incorrect styles
    // Defined in engine-dom/src/styles.ts
    globalThis.__lwcResetGlobalStylesheets();
}

/**
 * Resets the tracker for messages that only get logged once.
 * @see engine-core/src/shared/logger.ts
 */
export function resetAlreadyLoggedMessages() {
    globalThis.__lwcResetAlreadyLoggedMessages();
}

/**
 * Resets the global state used for managing hot swaps.
 * @see engine-core/src/framework/hot-swaps.ts
 * @see engine-core/src/framework/stylehseet.ts
 */
export function resetHotSwaps() {
    globalThis.__lwcResetHotSwaps();
    globalThis.__lwcResetStylesheetCache();
}

/**
 * Resets the tracker for "trusted" signals, reverting to "untrusted" mode.
 * @see shared/src/signals.ts
 */
export function resetTrustedSignals() {
    globalThis.__lwcResetTrustedSignals();
}

/**
 * Resets the fragment cache. TBH, I don't know what that is.
 * @see engine-core/src/framework/fragment-cache.ts
 */
export function resetFragmentCache() {
    return globalThis.__lwcResetFragmentCache();
}

/**
 * The warning is supposed to only be logged once. This resets that tracker.
 * @see engine-core/src/framework/check-version-mismatch.ts
 */
export function resetWarnedOnVersionMismatch() {
    return globalThis.__lwcResetWarnedOnVersionMismatch();
}

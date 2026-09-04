/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    defineProperty,
    isFunction,
    isUndefined,
    KEY__NATIVE_SHADOWROOT_SINKS_PATCHED,
    KEY__SANITIZE_HTML_CONTENT,
} from '@lwc/shared';
import {
    NativeShadowRoot,
    nativeShadowRootInnerHTMLDescriptor,
    nativeShadowRootSetHTMLUnsafe,
} from '../../env/shadow-root';

// Read from the global instead of importing `sanitizeHtmlContent`: this bundle's own `@lwc/shared`
// copy never runs `setHooks`, so a bundler constant-folds the imported hook to a no-op.
function maybeSanitize(value: unknown): unknown {
    const sanitize = (globalThis as any)[KEY__SANITIZE_HTML_CONTENT];
    return isFunction(sanitize) ? sanitize(value) : value;
}

// Apply once: a second synthetic-shadow copy would capture this wrapper as "native" and sanitize twice.
if (isUndefined((globalThis as any)[KEY__NATIVE_SHADOWROOT_SINKS_PATCHED])) {
    defineProperty(globalThis, KEY__NATIVE_SHADOWROOT_SINKS_PATCHED, {
        value: true,
        configurable: true,
    });

    if (
        !isUndefined(nativeShadowRootInnerHTMLDescriptor) &&
        isFunction(nativeShadowRootInnerHTMLDescriptor.set)
    ) {
        const nativeInnerHTMLSetter = nativeShadowRootInnerHTMLDescriptor.set;
        defineProperty(NativeShadowRoot.prototype, 'innerHTML', {
            ...nativeShadowRootInnerHTMLDescriptor,
            set(this: ShadowRoot, value: unknown) {
                nativeInnerHTMLSetter.call(this, maybeSanitize(value));
            },
        });
    }

    if (isFunction(nativeShadowRootSetHTMLUnsafe)) {
        const nativeSetHTMLUnsafe = nativeShadowRootSetHTMLUnsafe;
        defineProperty(NativeShadowRoot.prototype, 'setHTMLUnsafe', {
            writable: true,
            enumerable: false,
            configurable: true,
            value(this: ShadowRoot, html: unknown) {
                return nativeSetHTMLUnsafe.call(this, maybeSanitize(html));
            },
        });
    }
}

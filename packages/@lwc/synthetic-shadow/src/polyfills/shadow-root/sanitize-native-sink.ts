/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    defineProperty,
    getOwnPropertyDescriptor,
    isFunction,
    KEY__SANITIZE_HTML_CONTENT,
} from '@lwc/shared';
import {
    NativeShadowRoot,
    nativeShadowRootInnerHTMLDescriptor,
    nativeShadowRootSetHTMLUnsafe,
} from '../../env/shadow-root';

// This hook is set as a global because this package bundles a separate copy of `@lwc/shared` from the runtime,
// so the `setHooks` it has access to is not the one where hooks are set.
function maybeSanitize(value: string): string {
    if (lwcRuntimeFlags.DISABLE_NATIVE_SHADOWROOT_SINK_SANITIZATION) {
        return value;
    }
    const sanitize = (globalThis as any)[KEY__SANITIZE_HTML_CONTENT];
    return isFunction(sanitize) ? sanitize(value) : value;
}

// Our wrappers install as non-configurable, so a non-configurable descriptor already means one is
// in place — use that as the idempotency signal instead of a separate marker property.
function isLocked(proto: object, name: string): boolean {
    const descriptor = getOwnPropertyDescriptor(proto, name);
    return descriptor?.configurable === false;
}

if (
    isFunction(nativeShadowRootInnerHTMLDescriptor?.set) &&
    !isLocked(NativeShadowRoot.prototype, 'innerHTML')
) {
    const nativeInnerHTMLSetter = nativeShadowRootInnerHTMLDescriptor.set;
    defineProperty(NativeShadowRoot.prototype, 'innerHTML', {
        ...nativeShadowRootInnerHTMLDescriptor,
        configurable: false,
        set(this: ShadowRoot, value: string) {
            nativeInnerHTMLSetter.call(this, maybeSanitize(value));
        },
    });
}

if (
    isFunction(nativeShadowRootSetHTMLUnsafe) &&
    !isLocked(NativeShadowRoot.prototype, 'setHTMLUnsafe')
) {
    defineProperty(NativeShadowRoot.prototype, 'setHTMLUnsafe', {
        writable: false,
        enumerable: true,
        configurable: false,
        value(this: ShadowRoot, html: string) {
            return nativeShadowRootSetHTMLUnsafe.call(this, maybeSanitize(html));
        },
    });
}

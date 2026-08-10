/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { create as ObjectCreate, isNull, isObject, isUndefined } from '@lwc/shared';
import { logWarn } from '../shared/logger';
import type { RendererAPI } from './renderer';

const sanitizedHtmlContentSymbol = Symbol('lwc-get-sanitized-html-content');

// W-23680734: brand "trusted sanitized HTML" objects by IDENTITY, not by a structural
// property/symbol. The previous brand check (`sanitizedHtmlContentSymbol in value`) and read
// (`value[sanitizedHtmlContentSymbol]`) resolve through `value`'s own property semantics, so an
// object with caller-controlled property behavior can report the brand and yield markup it does
// not legitimately hold — trust based on shape rather than provenance.
//
// A WeakMap keyed on the wrapper's identity closes that gap: `WeakMap.prototype.has`/`get`
// perform an internal-slot identity lookup that does not consult the object's property handlers,
// and only wrappers we created were ever registered — so any other object is `false` regardless
// of its shape. This mirrors the existing identity-based trust sets for signals/context in
// `@lwc/shared` (`isTrustedSignal`, `isTrustedContext`).
const sanitizedContentToString: WeakMap<object, unknown> = new WeakMap();

export type SanitizedHtmlContent = {
    [sanitizedHtmlContentSymbol]: unknown;
};

function isSanitizedHtmlContent(object: any): object is SanitizedHtmlContent {
    if (!isObject(object) || isNull(object)) {
        return false;
    }
    // Kill-switch: when the flag is set, fall back to the legacy structural symbol brand.
    // Present so the hardening can be disabled at runtime if it regresses a legit integration;
    // the default (flag unset) is the safe, identity-based check.
    if (lwcRuntimeFlags.DISABLE_SANITIZED_HTML_CONTENT_IDENTITY_CHECK) {
        return sanitizedHtmlContentSymbol in object;
    }
    // Identity check — only wrappers we created are members, independent of `object`'s shape.
    return sanitizedContentToString.has(object);
}

function getSanitizedContent(object: SanitizedHtmlContent): unknown {
    if (lwcRuntimeFlags.DISABLE_SANITIZED_HTML_CONTENT_IDENTITY_CHECK) {
        return object[sanitizedHtmlContentSymbol];
    }
    // Read the sanitized string from OUR map by identity, never from a property access on
    // `object` (whose semantics may be caller-controlled).
    return sanitizedContentToString.get(object);
}

export function unwrapIfNecessary(object: any) {
    return isSanitizedHtmlContent(object) ? getSanitizedContent(object) : object;
}

/**
 * Wrap a pre-sanitized string designated for `.innerHTML` via `lwc:inner-html`
 * as an object branded by identity in a module-private WeakMap that only we have access to.
 * @param sanitizedString
 * @returns SanitizedHtmlContent
 */
export function createSanitizedHtmlContent(sanitizedString: unknown): SanitizedHtmlContent {
    // The wrapper keeps the non-enumerable symbol property so the legacy kill-switch path and
    // any structural consumers still work; the authoritative brand is WeakMap membership.
    const wrapper: SanitizedHtmlContent = ObjectCreate(null, {
        [sanitizedHtmlContentSymbol]: {
            value: sanitizedString,
            configurable: false,
            writable: false,
        },
    });
    sanitizedContentToString.set(wrapper, sanitizedString);
    return wrapper;
}

/**
 * Safely call setProperty on an Element while handling any SanitizedHtmlContent objects correctly
 *
 * @param setProperty - renderer.setProperty
 * @param elm - Element
 * @param key - key to set
 * @param value -  value to set
 */
export function safelySetProperty(
    setProperty: RendererAPI['setProperty'],
    elm: Element,
    key: string,
    value: any
) {
    // See W-16614337
    // we support setting innerHTML to `undefined` because it's inherently safe
    if ((key === 'innerHTML' || key === 'outerHTML') && !isUndefined(value)) {
        if (isSanitizedHtmlContent(value)) {
            // it's a SanitizedHtmlContent object
            setProperty(elm, key, getSanitizedContent(value));
        } else {
            // not a SanitizedHtmlContent object
            if (process.env.NODE_ENV !== 'production') {
                logWarn(
                    `Cannot set property "${key}". Instead, use lwc:inner-html or lwc:dom-manual.`
                );
            }
        }
    } else {
        setProperty(elm, key, value);
    }
}

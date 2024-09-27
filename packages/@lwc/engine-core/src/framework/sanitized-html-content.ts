import { create as ObjectCreate, isNull, isObject, isUndefined } from '@lwc/shared';
import { logWarn } from '../shared/logger';
import type { RendererAPI } from './renderer';

const sanitizedHtmlContentSymbol = Symbol('lwc-get-sanitized-html-content');

export type SanitizedHtmlContent = {
    [sanitizedHtmlContentSymbol]: unknown;
};

function isSanitizedHtmlContent(object: any): object is SanitizedHtmlContent {
    return isObject(object) && !isNull(object) && sanitizedHtmlContentSymbol in object;
}

function unwrapIfNecessary(object: any) {
    return isSanitizedHtmlContent(object) ? object[sanitizedHtmlContentSymbol] : object;
}

/**
 * Wrap a pre-sanitized string designated for `.innerHTML` via `lwc:inner-html`
 * as an object with a Symbol that only we have access to.
 * @param sanitizedString
 * @returns SanitizedHtmlContent
 */
export function createSanitizedHtmlContent(sanitizedString: unknown): SanitizedHtmlContent {
    return ObjectCreate(null, {
        [sanitizedHtmlContentSymbol]: {
            value: sanitizedString,
            configurable: false,
            writable: false,
        },
    });
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
            setProperty(elm, key, value[sanitizedHtmlContentSymbol]);
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

/**
 * Given two objects (likely either a string or a SanitizedHtmlContent object), return true if their
 * string values are equivalent.
 * @param first
 * @param second
 */
export function isSanitizedHtmlContentEqual(first: any, second: any) {
    return unwrapIfNecessary(first) === unwrapIfNecessary(second);
}

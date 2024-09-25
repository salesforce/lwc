import { create as ObjectCreate, isNull, isObject, isTrue } from '@lwc/shared';

const isSanitizedHtmlContentSymbol = Symbol('lwc-sanitized-html-content');

export type SanitizedHtmlContent = {
    [isSanitizedHtmlContentSymbol]: true;
    [Symbol.toPrimitive]: () => string;
};

/**
 * Wrap a pre-sanitized string designated for `.innerHTML` via `lwc:inner-html`
 * as an object with a Symbol that only we have access to.
 * @param sanitizedString
 * @returns SanitizedHtmlContent
 */
export function createSanitizedHtmlContent(sanitizedString: string): SanitizedHtmlContent {
    return ObjectCreate(null, {
        [isSanitizedHtmlContentSymbol]: {
            value: true,
            configurable: false,
            writable: false,
        },
        [Symbol.toPrimitive]: {
            value: () => sanitizedString,
            configurable: false,
            writable: false,
        },
    });
}

/**
 * Return true if this is a wrapped SanitiziedHtmlContent object.
 * @param object
 */
export function isSanitizedHtmlContent(object: unknown): object is SanitizedHtmlContent {
    return (
        isObject(object) && !isNull(object) && isTrue((object as any)[isSanitizedHtmlContentSymbol])
    );
}

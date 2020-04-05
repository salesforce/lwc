/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, create, emptyString, forEach, isArray, isNull, isUndefined } from '@lwc/shared';
import { useSyntheticShadow } from './utils';
import { VM } from './vm';
import { removeAttribute, setAttribute } from '../env/element';
/**
 * Function producing style based on a host and a shadow selector. This function is invoked by
 * the engine with different values depending on the mode that the component is running on.
 */
export type StylesheetFactory = (
    hostSelector: string,
    shadowSelector: string,
    nativeShadow: boolean
) => string;

export interface StylesheetTokens {
    /**
     * HTML attribute that need to be applied to the host element. This attribute is used for the
     * `:host` pseudo class CSS selector.
     */
    hostAttribute: string;

    /**
     * HTML attribute that need to the applied to all the element that the template produces.
     * This attribute is used for style encapsulation when the engine runs with synthetic shadow.
     */
    shadowAttribute: string;
}

const CachedStyleFragments: Record<string, DocumentFragment> = create(null);

function createStyleElement(styleContent: string): HTMLStyleElement {
    const elm = document.createElement('style');
    elm.type = 'text/css';
    elm.textContent = styleContent;
    return elm;
}

function getCachedStyleElement(styleContent: string): HTMLStyleElement {
    let fragment = CachedStyleFragments[styleContent];

    if (isUndefined(fragment)) {
        fragment = document.createDocumentFragment();
        const styleElm = createStyleElement(styleContent);
        fragment.insertBefore(styleElm, null);
        CachedStyleFragments[styleContent] = fragment;
    }

    return fragment.cloneNode(true).firstChild as HTMLStyleElement;
}

const globalStyleParent = document.head || document.body || document;
const InsertedGlobalStyleContent: Record<string, true> = create(null);

function insertGlobalStyle(styleContent: string) {
    // inserts the global style when needed, otherwise does nothing
    if (isUndefined(InsertedGlobalStyleContent[styleContent])) {
        InsertedGlobalStyleContent[styleContent] = true;
        const elm = createStyleElement(styleContent);
        globalStyleParent.insertBefore(elm, null);
    }
}

/**
 * Reset the styling token applied to the host element.
 */
export function resetStyle(vm: VM): void {
    const { context, elm, cmpRoot } = vm;
    const { hostAttribute, styleElement } = context;

    // Remove the style attribute currently applied to the host element.
    if (!isUndefined(hostAttribute)) {
        removeAttribute.call(elm, hostAttribute);
    }

    // Reset the scoping attributes associated to the context.
    context.hostAttribute = context.shadowAttribute = undefined;

    // removing style tag if present
    if (!isNull(styleElement) && !isUndefined(styleElement)) {
        cmpRoot.removeChild(styleElement);
        context.styleElement = null;
    }
}

/**
 * Apply/Update the styling token applied to the host element.
 */
export function applyStyle(
    vm: VM,
    stylesheets: StylesheetFactory[],
    stylesheetTokens: StylesheetTokens
): void {
    const { context, elm, cmpRoot } = vm;
    const { hostAttribute, shadowAttribute } = stylesheetTokens;
    setAttribute.call(elm, hostAttribute, '');

    context.hostAttribute = hostAttribute;
    context.shadowAttribute = shadowAttribute;

    // Caching style vnode so it can be removed when needed
    const styleElm = (context.styleElement = evaluateCSS(
        vm,
        stylesheets,
        hostAttribute,
        shadowAttribute
    ));
    if (!isNull(styleElm)) {
        cmpRoot.insertBefore(styleElm, null);
    }
}

function collectStylesheets(
    stylesheets: StylesheetFactory[],
    hostSelector: string,
    shadowSelector: string,
    isNative: boolean,
    aggregatorFn: (content: string) => void
): void {
    forEach.call(stylesheets, sheet => {
        if (isArray(sheet)) {
            collectStylesheets(sheet, hostSelector, shadowSelector, isNative, aggregatorFn);
        } else {
            aggregatorFn(sheet(hostSelector, shadowSelector, isNative));
        }
    });
}

function evaluateCSS(
    vm: VM,
    stylesheets: StylesheetFactory[],
    hostAttribute: string,
    shadowAttribute: string
): HTMLStyleElement | null {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isArray(stylesheets), `Invalid stylesheets.`);
    }

    if (useSyntheticShadow) {
        const hostSelector = `[${hostAttribute}]`;
        const shadowSelector = `[${shadowAttribute}]`;

        collectStylesheets(stylesheets, hostSelector, shadowSelector, false, textContent => {
            insertGlobalStyle(textContent);
        });

        return null;
    } else {
        // Native shadow in place, we need to act accordingly by using the `:host` selector, and an
        // empty shadow selector since it is not really needed.

        let buffer = '';
        collectStylesheets(stylesheets, emptyString, emptyString, true, textContent => {
            buffer += textContent;
        });

        return getCachedStyleElement(buffer);
    }
}

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, create, emptyString, forEach, isArray, isUndefined } from '@lwc/shared';
import { VNode } from '../3rdparty/snabbdom/types';

import * as api from './api';
import { EmptyArray, useSyntheticShadow } from './utils';
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
        fragment.appendChild(styleElm);
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
        globalStyleParent.appendChild(elm);
    }
}

function createStyleVNode(elm: HTMLStyleElement) {
    const vnode = api.h(
        'style',
        {
            key: 'style', // special key
        },
        EmptyArray
    );
    // TODO [#1364]: supporting the ability to inject a cloned StyleElement
    // forcing the diffing algo to use the cloned style for native shadow
    vnode.clonedElement = elm;
    return vnode;
}

/**
 * Reset the styling token applied to the host element.
 */
export function resetStyleAttributes(vm: VM): void {
    const { context, elm } = vm;

    // Remove the style attribute currently applied to the host element.
    const oldHostAttribute = context.hostAttribute;
    if (!isUndefined(oldHostAttribute)) {
        removeAttribute.call(elm, oldHostAttribute);
    }

    // Reset the scoping attributes associated to the context.
    context.hostAttribute = context.shadowAttribute = undefined;
}

/**
 * Apply/Update the styling token applied to the host element.
 */
export function applyStyleAttributes(vm: VM, hostAttribute: string, shadowAttribute: string): void {
    const { context, elm } = vm;
    // Remove the style attribute currently applied to the host element.
    setAttribute.call(elm, hostAttribute, '');

    context.hostAttribute = hostAttribute;
    context.shadowAttribute = shadowAttribute;
}

function collectStylesheets(
    stylesheets: StylesheetFactory[],
    hostSelector: string,
    shadowSelector: string,
    isNative: boolean,
    aggregatorFn: (content: string) => void
): void {
    forEach.call(stylesheets, (sheet) => {
        if (isArray(sheet)) {
            collectStylesheets(sheet, hostSelector, shadowSelector, isNative, aggregatorFn);
        } else {
            aggregatorFn(sheet(hostSelector, shadowSelector, isNative));
        }
    });
}

export function evaluateCSS(
    stylesheets: StylesheetFactory[],
    hostAttribute: string,
    shadowAttribute: string
): VNode | null {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isArray(stylesheets), `Invalid stylesheets.`);
    }

    if (useSyntheticShadow) {
        const hostSelector = `[${hostAttribute}]`;
        const shadowSelector = `[${shadowAttribute}]`;

        collectStylesheets(stylesheets, hostSelector, shadowSelector, false, (textContent) => {
            insertGlobalStyle(textContent);
        });

        return null;
    } else {
        // Native shadow in place, we need to act accordingly by using the `:host` selector, and an
        // empty shadow selector since it is not really needed.

        let buffer = '';
        collectStylesheets(stylesheets, emptyString, emptyString, true, (textContent) => {
            buffer += textContent;
        });

        return createStyleVNode(getCachedStyleElement(buffer));
    }
}

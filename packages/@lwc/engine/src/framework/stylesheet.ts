/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../shared/assert';
import {
    isUndefined,
    create,
    emptyString,
    isArray,
    forEach,
    ArrayReduce,
} from '../shared/language';
import { VNode } from '../3rdparty/snabbdom/types';

import * as api from './api';
import { EmptyArray } from './utils';
import { VM } from './vm';
import { removeAttribute, setAttribute } from '../env/element';
import { appendChild } from '../env/node';
import { createElement, createDocumentFragment } from '../env/document';
/**
 * Function producing style based on a host and a shadow selector. This function is invoked by
 * the engine with different values depending on the mode that the component is running on.
 */
export type StylesheetFactory = (
    hostSelector: string,
    shadowSelector: string,
    nativeShadow: boolean,
) => string;

const CachedStyleFragments: Record<string, DocumentFragment> = create(null);

function createStyleElement(styleContent: string): HTMLStyleElement {
    const elm = createElement.call(document, 'style') as HTMLStyleElement;
    elm.type = 'text/css';
    elm.textContent = styleContent;
    return elm;
}

function getCachedStyleElement(styleContent: string): HTMLStyleElement {
    let fragment = CachedStyleFragments[styleContent];

    if (isUndefined(fragment)) {
        fragment = createDocumentFragment.call(document);
        const elm = createStyleElement(styleContent);
        appendChild.call(fragment, elm);
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
        appendChild.call(globalStyleParent, elm);
    }
}

function noop() {
    /** do nothing */
}

function createStyleVNode(elm: HTMLStyleElement) {
    const vnode = api.h(
        'style',
        {
            key: 'style', // special key
            create: noop,
            update: noop,
        },
        EmptyArray,
    );
    // Force the diffing algo to use the cloned style.
    vnode.elm = elm;
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

export function evaluateCSS(
    vm: VM,
    stylesheets: StylesheetFactory[],
    hostAttribute: string,
    shadowAttribute: string,
): VNode | null {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
        assert.isTrue(isArray(stylesheets), `Invalid stylesheets.`);
    }

    const { fallback } = vm;

    if (fallback) {
        const hostSelector = `[${hostAttribute}]`;
        const shadowSelector = `[${shadowAttribute}]`;

        forEach.call(stylesheets, stylesheet => {
            const textContent = stylesheet(hostSelector, shadowSelector, false);
            insertGlobalStyle(textContent);
        });

        return null;
    } else {
        // Native shadow in place, we need to act accordingly by using the `:host` selector, and an
        // empty shadow selector since it is not really needed.
        const textContent = ArrayReduce.call(
            stylesheets,
            (buffer, stylesheet) => {
                return buffer + stylesheet(emptyString, emptyString, true);
            },
            '',
        ) as string;
        return createStyleVNode(getCachedStyleElement(textContent));
    }
}

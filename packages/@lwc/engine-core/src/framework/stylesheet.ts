/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { create, isArray, isUndefined, ArrayJoin } from '@lwc/shared';

import { VNode } from '../3rdparty/snabbdom/types';
import { VM } from './vm';
import * as api from './api';
import { Template } from './template';
import { EmptyArray } from './utils';
import { documentObject } from './renderer';

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

const globalStyleParent = documentObject.head || documentObject.body || documentObject;
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
    const { context, elm, renderer } = vm;

    // Remove the style attribute currently applied to the host element.
    const oldHostAttribute = context.hostAttribute;
    if (!isUndefined(oldHostAttribute)) {
        renderer.removeAttribute(elm, oldHostAttribute);
    }

    // Reset the scoping attributes associated to the context.
    context.hostAttribute = context.shadowAttribute = undefined;
}

/**
 * Apply/Update the styling token applied to the host element.
 */
export function applyStyleAttributes(vm: VM, hostAttribute: string, shadowAttribute: string): void {
    const { context, elm, renderer } = vm;

    // Remove the style attribute currently applied to the host element.
    renderer.setAttribute(elm, hostAttribute, '');

    context.hostAttribute = hostAttribute;
    context.shadowAttribute = shadowAttribute;
}

export function getStylesheetsContent(vm: VM, template: Template): string[] {
    const { stylesheets: factories, stylesheetTokens: tokens } = template;
    const { syntheticShadow: useSyntheticShadow } = vm.renderer;

    const stylesheets: string[] = [];

    if (!isUndefined(factories) && !isUndefined(tokens)) {
        const hostSelector = useSyntheticShadow ? `[${tokens.hostAttribute}]` : '';
        const shadowSelector = useSyntheticShadow ? `[${tokens.shadowAttribute}]` : '';

        for (let i = 0; i < factories.length; i++) {
            const factory = factories[i];

            if (isArray(factory)) {
                for (let j = 0; j < factory.length; j++) {
                    stylesheets.push(factory[j](hostSelector, shadowSelector, !useSyntheticShadow));
                }
            } else {
                stylesheets.push(factory(hostSelector, shadowSelector, !useSyntheticShadow));
            }
        }
    }

    return stylesheets;
}

export function evaluateCSS(vm: VM, stylesheets: string[]): VNode | null {
    if (vm.renderer.syntheticShadow) {
        for (let i = 0; i < stylesheets.length; i++) {
            insertGlobalStyle(stylesheets[i]);
        }

        return null;
    } else {
        // For performance reasons, a single stylesheet is created per shadow tree.
        const shadowStyleSheetContent = ArrayJoin.call(stylesheets, '\n');
        return createStyleVNode(getCachedStyleElement(shadowStyleSheetContent));
    }
}

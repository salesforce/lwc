/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { create, isUndefined } from '@lwc/shared';

const elementsToStyleContents = new WeakMap<Element, { [content: string]: true } | undefined>();
const elementsToStyleElements = new WeakMap<Element, HTMLStyleElement | undefined>();

const globalStylesheetsParentElement: Element = document.head || document.body || document;

if (process.env.NODE_ENV === 'development') {
    // @ts-ignore
    window.__lwcResetGlobalStylesheets = () => {
        elementsToStyleContents.delete(globalStylesheetsParentElement);
        elementsToStyleElements.delete(globalStylesheetsParentElement);
    };
}

export function insertStylesheet(element: Element, content: string): void {
    let styleContents = elementsToStyleContents.get(element);
    if (isUndefined(styleContents)) {
        styleContents = create(null);
        elementsToStyleContents.set(element, styleContents);
    }
    if (!isUndefined(styleContents![content])) {
        return;
    }
    styleContents![content] = true;

    let style = elementsToStyleElements.get(element);
    if (isUndefined(style)) {
        style = document.createElement('style');
        style.type = 'text/css';
        style.textContent = content;
        element.insertBefore(style, element.firstChild);
        elementsToStyleElements.set(element, style);
    } else {
        style.textContent += '\n' + content;
    }
}

export function insertGlobalStylesheet(content: string): void {
    insertStylesheet(globalStylesheetsParentElement, content);
}

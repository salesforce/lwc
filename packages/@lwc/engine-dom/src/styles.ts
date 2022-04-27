/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isUndefined, create, getOwnPropertyDescriptor, isArray, isFunction } from '@lwc/shared';

const globalStyleSheets: { [content: string]: HTMLStyleElement } = create(null);

if (process.env.NODE_ENV === 'development') {
    // @ts-ignore
    window.__lwcResetGlobalStyleSheets = () => {
        for (const key of Object.keys(globalStyleSheets)) {
            delete globalStyleSheets[key];
        }
    };
}

const globalStyleSheetsParentElement: Element = document.head || document.body || document;
// This check for constructable styleSheets is similar to Fast's:
// https://github.com/microsoft/fast/blob/d49d1ec/packages/web-components/fast-element/src/dom.ts#L51-L53
// See also: https://github.com/whatwg/webidl/issues/1027#issuecomment-934510070
const supportsConstructableStyleSheets =
    isFunction(CSSStyleSheet.prototype.replaceSync) && isArray(document.adoptedStyleSheets);
const supportsMutableAdoptedStyleSheets =
    supportsConstructableStyleSheets &&
    getOwnPropertyDescriptor(document.adoptedStyleSheets, 'length')!.writable;
const styleElements: { [content: string]: HTMLStyleElement } = create(null);
const styleSheets: { [content: string]: CSSStyleSheet } = create(null);
const shadowRootsToStyleSheets = new WeakMap<ShadowRoot, { [content: string]: HTMLStyleElement }>();
const stylesToUsageCount = new WeakMap<
    HTMLStyleElement | CSSStyleSheet,
    WeakMap<ShadowRoot | Document, number>
>();

function incrementOrDecrementUsageCount(
    style: HTMLStyleElement | CSSStyleSheet,
    root: ShadowRoot | Document,
    delta: number
) {
    let rootsToCounts = stylesToUsageCount.get(style);
    if (isUndefined(rootsToCounts)) {
        rootsToCounts = new WeakMap();
        stylesToUsageCount.set(style, rootsToCounts);
    }
    let count = rootsToCounts.get(root);
    if (isUndefined(count)) {
        count = 0;
    }
    count += delta;
    rootsToCounts.set(root, count);
    return count;
}

function incrementOrDecrementGlobalUsageCount(
    elm: HTMLStyleElement | CSSStyleSheet,
    delta: number
) {
    return incrementOrDecrementUsageCount(elm, document, delta);
}

function insertConstructableStyleSheet(content: string, target: ShadowRoot) {
    // It's important for CSSStyleSheets to be unique based on their content, so that
    // `shadowRoot.adoptedStyleSheets.includes(sheet)` works.
    let styleSheet = styleSheets[content];
    if (isUndefined(styleSheet)) {
        styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(content);
        styleSheets[content] = styleSheet;
    }
    incrementOrDecrementUsageCount(styleSheet, target, 1);
    const { adoptedStyleSheets } = target;
    if (!adoptedStyleSheets.includes(styleSheet)) {
        if (supportsMutableAdoptedStyleSheets) {
            // This is only supported in later versions of Chromium:
            // https://chromestatus.com/feature/5638996492288000
            adoptedStyleSheets.push(styleSheet);
        } else {
            target.adoptedStyleSheets = [...adoptedStyleSheets, styleSheet];
        }
    }
}

function removeConstructableStyleSheet(content: string, target: ShadowRoot) {
    const styleSheet = styleSheets[content];

    if (isUndefined(styleSheet)) {
        return;
    }
    const count = incrementOrDecrementUsageCount(styleSheet, target, -1);
    if (count === 0) {
        const { adoptedStyleSheets } = target;
        if (adoptedStyleSheets.includes(styleSheet)) {
            if (supportsMutableAdoptedStyleSheets) {
                adoptedStyleSheets.splice(adoptedStyleSheets.indexOf(styleSheet), 1);
            } else {
                target.adoptedStyleSheets = [...adoptedStyleSheets].filter((_) => _ !== styleSheet);
            }
        }
    }
}

function insertStyleElement(content: string, target: ShadowRoot) {
    // Avoid inserting duplicate `<style>`s
    let sheets = shadowRootsToStyleSheets.get(target);
    if (isUndefined(sheets)) {
        sheets = create(null);
        shadowRootsToStyleSheets.set(target, sheets!);
    }
    const existingElement = sheets![content];
    if (!isUndefined(existingElement)) {
        incrementOrDecrementUsageCount(existingElement, target, 1);
        return;
    }

    // This `<style>` may be repeated multiple times in the DOM, so cache it. It's a bit
    // faster to call `cloneNode()` on an existing node than to recreate it every time.
    let elm = styleElements[content];
    if (isUndefined(elm)) {
        elm = document.createElement('style');
        elm.type = 'text/css';
        elm.textContent = content;
        styleElements[content] = elm;
    } else {
        elm = elm.cloneNode(true) as HTMLStyleElement;
    }
    sheets![content] = elm;
    target.appendChild(elm);
    incrementOrDecrementUsageCount(elm, target, 1);
}

function removeStyleElement(content: string, target: ShadowRoot) {
    const sheets = shadowRootsToStyleSheets.get(target);
    if (isUndefined(sheets)) {
        return;
    }
    const elm = sheets![content];
    if (isUndefined(elm)) {
        return;
    }
    const count = incrementOrDecrementUsageCount(elm, target, -1);
    if (count === 0) {
        if (elm.parentNode === target) {
            target.removeChild(elm);
        }
        delete sheets![content];
    }
}

function insertGlobalStyleSheet(content: string): void {
    const existingElement = globalStyleSheets[content];
    if (!isUndefined(existingElement)) {
        incrementOrDecrementGlobalUsageCount(existingElement, 1);
        return;
    }

    const elm = document.createElement('style');
    elm.type = 'text/css';
    elm.textContent = content;

    globalStyleSheets[content] = elm;
    globalStyleSheetsParentElement.appendChild(elm);
    incrementOrDecrementGlobalUsageCount(elm, 1);
}

function removeGlobalStyleSheet(content: string): void {
    const elm = globalStyleSheets[content];
    if (isUndefined(elm)) {
        return;
    }
    const count = incrementOrDecrementGlobalUsageCount(elm, -1);
    if (count === 0) {
        if (elm.parentNode === globalStyleSheetsParentElement) {
            globalStyleSheetsParentElement.removeChild(elm);
        }
        delete globalStyleSheets[content];
    }
}

function insertStyleSheet(content: string, target: ShadowRoot): void {
    if (supportsConstructableStyleSheets) {
        insertConstructableStyleSheet(content, target);
    } else {
        // Fall back to <style> element
        insertStyleElement(content, target);
    }
}

function removeStyleSheet(content: string, target: ShadowRoot): void {
    if (supportsConstructableStyleSheets) {
        removeConstructableStyleSheet(content, target);
    } else {
        // Fall back to <style> element
        removeStyleElement(content, target);
    }
}

export function toggleStyleSheet(content: string, insert: boolean, target?: ShadowRoot): void {
    if (isUndefined(target)) {
        // global
        if (insert) {
            insertGlobalStyleSheet(content);
        } else {
            removeGlobalStyleSheet(content);
        }
    } else {
        // local
        if (insert) {
            insertStyleSheet(content, target);
        } else {
            removeStyleSheet(content, target);
        }
    }
}

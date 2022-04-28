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
const targetsToStyleSheets: WeakMap<
    ShadowRoot | Document,
    { [content: string]: HTMLStyleElement }
> = new WeakMap();
const stylesToUsageCount: WeakMap<
    ShadowRoot | Document,
    WeakMap<HTMLStyleElement | CSSStyleSheet, number>
> = new WeakMap();

function isDocument(target: ShadowRoot | Document): target is Document {
    return !isUndefined((target as Document).head);
}

function getStylesToUsageCounts(target: ShadowRoot | Document) {
    let stylesToCounts = stylesToUsageCount.get(target);
    if (isUndefined(stylesToCounts)) {
        stylesToCounts = new WeakMap();
        stylesToUsageCount.set(target, stylesToCounts);
    }
    return stylesToCounts;
}

function incrementOrDecrementUsageCount(
    style: HTMLStyleElement | CSSStyleSheet,
    target: ShadowRoot | Document,
    delta: number
) {
    const stylesToCounts = getStylesToUsageCounts(target);

    let count = stylesToCounts.get(style);
    if (isUndefined(count)) {
        count = 0;
    }
    count += delta;
    stylesToCounts.set(style, count);
    return count;
}

function insertConstructableStyleSheet(content: string, target: ShadowRoot | Document) {
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

function removeConstructableStyleSheet(content: string, target: ShadowRoot | Document) {
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

function insertStyleElement(content: string, target: ShadowRoot | Document) {
    // Avoid inserting duplicate `<style>`s
    let sheets = targetsToStyleSheets.get(target);
    if (isUndefined(sheets)) {
        sheets = create(null);
        targetsToStyleSheets.set(target, sheets!);
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
    const targetAnchorPoint = isDocument(target) ? target.head : target;
    targetAnchorPoint.appendChild(elm);
    incrementOrDecrementUsageCount(elm, target, 1);
}

function removeStyleElement(content: string, target: ShadowRoot | Document) {
    const sheets = targetsToStyleSheets.get(target);
    if (isUndefined(sheets)) {
        return;
    }
    const elm = sheets![content];
    if (isUndefined(elm)) {
        return;
    }
    const count = incrementOrDecrementUsageCount(elm, target, -1);
    if (count === 0) {
        const targetAnchorPoint = isDocument(target) ? target.head : target;
        if (elm.parentNode === targetAnchorPoint) {
            targetAnchorPoint.removeChild(elm);
        }
        delete sheets![content];
    }
}

function insertStyleSheet(content: string, target: ShadowRoot | Document): void {
    if (supportsConstructableStyleSheets) {
        insertConstructableStyleSheet(content, target);
    } else {
        // Fall back to <style> element
        insertStyleElement(content, target);
    }
}

function removeStyleSheet(content: string, target: ShadowRoot | Document): void {
    if (supportsConstructableStyleSheets) {
        removeConstructableStyleSheet(content, target);
    } else {
        // Fall back to <style> element
        removeStyleElement(content, target);
    }
}

export function toggleStyleSheet(content: string, insert: boolean, target?: ShadowRoot): void {
    const documentOrShadowRoot = isUndefined(target) ? document : target;
    if (insert) {
        insertStyleSheet(content, documentOrShadowRoot);
    } else {
        removeStyleSheet(content, documentOrShadowRoot);
    }
}
